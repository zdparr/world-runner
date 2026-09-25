import Anthropic from '@anthropic-ai/sdk';
import { eq, sql } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import type { StateChange, TurnStreamEvent, TurnUsage } from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, messages, playerCharacter, turnDebug } from '../db/schema';
import { HttpError } from '../http/errors';
import { buildTurnContext } from './context';
import type { CampaignRow, EngineContext } from './game';
import { ToolError } from './lookup';
import { Mutator, type RecordedEvent } from './mutator';
import { NarratorRefusal, NarratorTruncated, runNarrator, type RoundUsage, type StreamFn, type ToolOutcome } from './narrator';
import { API_TOOLS, TOOLS_BY_NAME } from './tools';

export const MAX_TOOL_ROUNDS = 6;
const MAX_RESULT_CHARS_IN_DEBUG = 4_000;

export interface EngineDeps {
  db: Db;
  /** Null when no API key is configured. */
  stream: StreamFn | null;
  model: string;
  effort: 'low' | 'medium' | 'high';
  log: FastifyBaseLogger;
  /** Called after a turn commits (post-turn maintenance hooks in here). */
  afterTurn?: (campaignId: string, turnNumber: number) => void;
}

// One turn (or undo) at a time per campaign. The campaign row lock enforces this in the database
// too; this set lets a second request fail fast instead of queueing behind a long model call.
const busy = new Set<string>();

export function claimCampaign(campaignId: string): () => void {
  if (busy.has(campaignId)) throw new HttpError(409, 'The narrator is still working on the last turn');
  busy.add(campaignId);
  return () => busy.delete(campaignId);
}

/** Checks that must pass before the response switches to an event stream. */
export async function assertCanTakeTurn(deps: EngineDeps, campaignId: string): Promise<StreamFn> {
  if (!deps.stream) throw new HttpError(503, 'The narrator is not configured: set ANTHROPIC_API_KEY on the server');
  const [pc] = await deps.db.select({ name: playerCharacter.name }).from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));
  if (!pc) throw new HttpError(409, 'Build a character before you start playing');
  return deps.stream;
}

function friendlyError(err: unknown): { message: string; retryable: boolean } {
  if (err instanceof NarratorRefusal) {
    return { message: "The narrator won't write that. Try a different approach, or step out of character with OOC: to talk it through.", retryable: false };
  }
  if (err instanceof NarratorTruncated) return { message: 'The narrator lost the thread mid-scene. Try again.', retryable: true };
  if (err instanceof Anthropic.RateLimitError) return { message: 'The narrator needs a moment (rate limited). Try again shortly.', retryable: true };
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return { message: 'The server’s Anthropic API key was rejected. Check ANTHROPIC_API_KEY.', retryable: false };
  }
  if (err instanceof Anthropic.BadRequestError) return { message: 'The narrator could not process this turn (bad request). Check the server logs.', retryable: false };
  if (err instanceof Anthropic.APIConnectionError) return { message: 'Could not reach the narrator. Check the connection and try again.', retryable: true };
  if (err instanceof Anthropic.APIError) return { message: 'The narrator is overloaded right now. Try again in a moment.', retryable: true };
  return { message: 'Something went wrong running this turn. Nothing was saved; try again.', retryable: true };
}

/**
 * Run one turn: build context, run the narrator (tools write through savepoints), then persist the
 * messages, events, and debug record. Everything happens in one transaction, so a failed turn
 * leaves no trace. Events are emitted as they happen; `done` follows the commit.
 */
export async function runTurn(
  deps: EngineDeps,
  stream: StreamFn,
  campaignId: string,
  content: string,
  emit: (event: TurnStreamEvent) => void,
): Promise<void> {
  const started = Date.now();
  const stateChanges: StateChange[] = [];

  try {
    const result = await deps.db.transaction(async (tx) => {
      // Serialize turns on the campaign row.
      const [campaign] = (await tx.select().from(campaigns).where(eq(campaigns.id, campaignId)).for('update')) as CampaignRow[];
      if (!campaign) throw new HttpError(404, 'Campaign not found');
      const [pc] = await tx.select().from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));
      if (!pc) throw new HttpError(409, 'Build a character before you start playing');
      const turnNumber = campaign.turnCount + 1;

      // Built before the player's message is stored, which the context appends itself.
      const context = await buildTurnContext(tx, campaign, pc, content, turnNumber);
      await tx.insert(messages).values({ campaignId, turnNumber, role: 'player', content });
      emit({ type: 'turn_start', turnNumber });

      let rolls = 0;
      const executeTool = async (name: string, input: unknown): Promise<ToolOutcome> => {
        const def = TOOLS_BY_NAME.get(name);
        if (!def) return { content: `Unknown tool "${name}".`, isError: true };
        const parsed = def.input.safeParse(input ?? {});
        if (!parsed.success) {
          const issues = parsed.error.issues.map((i) => `${i.path.join('.') || 'input'}: ${i.message}`).join('; ');
          return { content: `Invalid input for ${name}: ${issues}. Fix the arguments and call it again.`, isError: true };
        }
        // Changes are announced only once the whole tool call has succeeded.
        const buffered: StateChange[] = [];
        try {
          // Each call runs in a savepoint: a tool that fails halfway leaves nothing behind.
          const output = await tx.transaction(async (sp) => {
            const mutator = new Mutator(sp, campaignId, turnNumber);
            const ctx: EngineContext = {
              db: sp,
              campaign,
              turnNumber,
              mutator,
              nextRollIndex: () => rolls++,
              record: async (event: RecordedEvent) => {
                const row = await mutator.commit(event);
                if (!row) return null;
                const change: StateChange = { id: row.id, eventType: event.eventType, humanReadable: event.humanReadable, details: event.details };
                buffered.push(change);
                return change;
              },
            };
            return def.run(ctx, parsed.data);
          });
          for (const change of buffered) {
            stateChanges.push(change);
            emit({ type: 'state_change', change });
          }
          return { content: JSON.stringify(output), isError: false };
        } catch (err) {
          if (err instanceof ToolError) return { content: err.message, isError: true };
          deps.log.error({ err, tool: name }, 'Tool failed unexpectedly');
          return { content: `The ${name} tool hit an internal error and made no changes. Continue without it.`, isError: true };
        }
      };

      const narrator = await runNarrator({
        stream,
        model: deps.model,
        effort: deps.effort,
        system: context.system,
        messages: context.messages,
        tools: API_TOOLS,
        maxToolRounds: MAX_TOOL_ROUNDS,
        executeTool,
        onText: (delta) => emit({ type: 'text', delta }),
        onTool: (call) => emit({ type: 'tool', name: call.name, input: call.input, ok: call.ok, summary: call.ok ? summarize(call.result) : call.result }),
      });
      if (!narrator.narration) throw new NarratorTruncated('Empty narration');

      const usage: TurnUsage = {
        inputTokens: sum(narrator.rounds, 'inputTokens'),
        outputTokens: sum(narrator.rounds, 'outputTokens'),
        cacheReadTokens: sum(narrator.rounds, 'cacheReadTokens'),
        cacheCreationTokens: sum(narrator.rounds, 'cacheCreationTokens'),
        latencyMs: Date.now() - started,
        rounds: narrator.rounds.length,
      };

      await tx.insert(messages).values({ campaignId, turnNumber, role: 'narrator', content: narrator.narration });
      await tx.insert(turnDebug).values({
        campaignId,
        turnNumber,
        model: deps.model,
        contextManifest: {
          ...context.manifest,
          loadedByTools: narrator.toolCalls.filter((c) => TOOLS_BY_NAME.get(c.name)?.kind === 'read').map((c) => ({ tool: c.name, input: c.input })),
          rounds: narrator.rounds,
        },
        toolCalls: narrator.toolCalls.map((c) => ({
          ...c,
          result: c.result.length > MAX_RESULT_CHARS_IN_DEBUG ? `${c.result.slice(0, MAX_RESULT_CHARS_IN_DEBUG)}…` : c.result,
        })),
        inputTokens: usage.inputTokens,
        outputTokens: usage.outputTokens,
        cacheReadTokens: usage.cacheReadTokens,
        cacheCreationTokens: usage.cacheCreationTokens,
        latencyMs: usage.latencyMs,
      });
      await tx
        .update(campaigns)
        .set({ turnCount: turnNumber, updatedAt: sql`now()` })
        .where(eq(campaigns.id, campaignId));
      return { turnNumber, narration: narrator.narration, usage };
    });

    emit({ type: 'done', turnNumber: result.turnNumber, narration: result.narration, stateChanges, usage: result.usage });
    deps.afterTurn?.(campaignId, result.turnNumber);
  } catch (err) {
    if (err instanceof HttpError) {
      emit({ type: 'error', message: err.message, retryable: false });
      return;
    }
    deps.log.error({ err, campaignId }, 'Turn failed');
    emit({ type: 'error', ...friendlyError(err) });
  }
}

type UsageKey = 'inputTokens' | 'outputTokens' | 'cacheReadTokens' | 'cacheCreationTokens';
const sum = (rounds: RoundUsage[], key: UsageKey) => rounds.reduce((acc, r) => acc + r[key], 0);

/** A short, UI-friendly description of a tool result (the stream's `tool` event). */
function summarize(result: string): string {
  return result.length > 200 ? `${result.slice(0, 200)}…` : result;
}
