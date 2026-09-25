import { and, asc, eq, gt, inArray, or, sql } from 'drizzle-orm';
import type { FastifyBaseLogger } from 'fastify';
import type { MemoryReport } from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, messages, npcs, playerCharacter, relationships } from '../db/schema';
import { approxTokens, HISTORY_TOKEN_BUDGET } from './context';
import { Mutator } from './mutator';

/**
 * Post-turn memory maintenance, run by the utility model off the player's request path:
 *
 *  - Rolling summary: messages older than the recent window are folded into campaigns.rolling_summary
 *    every `summaryInterval` turns, or sooner if the unsummarized history outgrows its token budget.
 *  - Relationship notes: once an NPC's history notes pile up, they are condensed to 3-6 bullets.
 *
 * Every write goes through a Mutator and is recorded as a state event on the campaign's latest
 * turn, so undoing that turn restores the memory exactly as it was. The model call happens outside
 * any transaction; the result is applied only if its inputs are unchanged, otherwise it is dropped
 * and retried after a later turn (the triggers are derived from the data, not from a queue).
 */

export type UtilityFn = (request: { system: string; prompt: string; maxTokens: number }) => Promise<{
  text: string;
  inputTokens: number;
  outputTokens: number;
}>;

/** Target length of the rolling summary (~800 tokens). */
const SUMMARY_WORDS = 550;
/** Most messages folded by one summary call; a long backlog is folded over several calls. */
const MAX_FOLD_MESSAGES = 40;
/** Condense an NPC's notes after this many new notes, or once they grow past MAX_NOTES_CHARS. */
export const CONDENSE_AFTER_NOTES = 4;
const MAX_NOTES_CHARS = 1_200;
/** Relationships condensed per run; the rest wait for the next turn. */
const MAX_CONDENSE_PER_RUN = 3;

// ---------------------------------------------------------------- planning

type MessageRow = { id: number; turnNumber: number; role: 'player' | 'narrator'; content: string };

export interface FoldPlan {
  /** Why the fold is due (null if it isn't). */
  reason: string | null;
  foldable: MessageRow[];
}

/**
 * Which unsummarized messages fall outside the recent window, and whether folding them is due.
 * The window keeps whole turns: a turn whose player message falls outside it is folded entirely.
 */
export async function planFold(db: Db, campaign: { id: string; historyWindow: number; summaryInterval: number }): Promise<FoldPlan> {
  const unsummarized = await db
    .select({ id: messages.id, turnNumber: messages.turnNumber, role: messages.role, content: messages.content })
    .from(messages)
    .where(and(eq(messages.campaignId, campaign.id), eq(messages.summarized, false)))
    .orderBy(asc(messages.id));
  const firstKept = unsummarized[unsummarized.length - campaign.historyWindow];
  if (!firstKept) return { reason: null, foldable: [] };
  const cutoffTurn = firstKept.role === 'player' ? firstKept.turnNumber : firstKept.turnNumber + 1;
  const foldable = unsummarized.filter((m) => m.turnNumber < cutoffTurn);
  if (foldable.length === 0) return { reason: null, foldable };

  const foldableTurns = new Set(foldable.map((m) => m.turnNumber)).size;
  const tokens = approxTokens(unsummarized.map((m) => m.content).join(''));
  const reason =
    foldableTurns >= campaign.summaryInterval
      ? `${foldableTurns} turns have left the recent window (interval ${campaign.summaryInterval})`
      : tokens > HISTORY_TOKEN_BUDGET
        ? `unsummarized history is ~${tokens} tokens (budget ${HISTORY_TOKEN_BUDGET})`
        : null;
  return { reason, foldable };
}

// ---------------------------------------------------------------- prompts

const SUMMARY_SYSTEM = `You keep the running memory of a long interactive story (a tabletop-style role-playing game run by an AI narrator). You are given the current summary and a transcript of the turns that have just left the narrator's view. Rewrite the summary so it also covers those turns.

The narrator reads this summary every turn, in place of everything that is no longer in the recent transcript. Write it for the narrator, not for a reader:
- Past tense, third person, plain prose in short paragraphs. The player character is named; the player is never mentioned.
- Keep what matters for continuity: what happened and where, choices the character made and their consequences, promises, debts, lies, and threats; who the character met and how those people now regard them; secrets the character learned; clues, open questions, and unresolved threads.
- Skip what the game database already tracks exactly (money, item counts, xp, levels, hp) unless the story turned on it.
- Keep names, places, and figures exact. Never invent anything that is not in the summary or the transcript.
- Stay under ${SUMMARY_WORDS} words. Compress older material harder than recent material: the distant past can shrink to a sentence or two, while the latest events keep their detail.
- End with a short paragraph beginning "Where things stand:" covering the current situation and open threads.

Reply with the summary text only: no heading, preamble, or commentary.`;

function transcriptOf(rows: MessageRow[], characterName: string): string {
  return rows.map((m) => `[Turn ${m.turnNumber}] ${m.role === 'player' ? `Player (as ${characterName})` : 'Narrator'}:\n${m.content}`).join('\n\n');
}

const CONDENSE_SYSTEM = `You maintain the notes an AI narrator keeps on one relationship in a long interactive story: how a non-player character (NPC) and the player character have dealt with each other. Condense the notes into 3 to 6 bullets.

- Keep what the NPC would remember and act on: favours, debts, betrayals, promises, gifts, insults, shared secrets, turning points, and how the NPC feels now.
- Merge related notes, drop repetition and trivia. Keep names and figures exact; never invent anything.
- Keep the "(turn N)" markers where they matter, as a turn or a range like "(turns 3-9)".
- One line per bullet, each starting with "- ". Reply with the bullets only.`;

/** Normalise the model's bullets; null if the reply doesn't look like 1+ bullets. */
export function parseBullets(text: string): string | null {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => l.replace(/^(?:[-*•]|\d+[.)])\s+/, '- '))
    .filter((l) => l.startsWith('- ') && l.length > 2);
  if (lines.length === 0) return null;
  return lines.slice(0, 6).join('\n');
}

// ---------------------------------------------------------------- jobs

interface JobDeps {
  db: Db;
  utility: UtilityFn;
  model: string;
  log: FastifyBaseLogger;
}

/** Fold the messages outside the recent window into the rolling summary. Returns what was folded, or null if nothing was. */
async function foldSummary(deps: JobDeps, campaignId: string, force: boolean): Promise<MemoryReport['summary']> {
  const [campaign] = await deps.db.select().from(campaigns).where(eq(campaigns.id, campaignId));
  if (!campaign) return null;
  const plan = await planFold(deps.db, campaign);
  if (plan.foldable.length === 0 || (!plan.reason && !force)) return null;
  let fold = plan.foldable.slice(0, MAX_FOLD_MESSAGES);
  // Never split a turn across two folds.
  const next = plan.foldable[fold.length];
  if (next && next.turnNumber === fold[fold.length - 1]!.turnNumber) fold = fold.filter((m) => m.turnNumber < next.turnNumber);

  const [pc] = await deps.db.select({ name: playerCharacter.name }).from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));
  const previous = campaign.rollingSummary.trim();
  const prompt = [
    `# Current summary\n\n${previous || '(None yet: this is the start of the story.)'}`,
    `# Transcript to fold in (turns ${fold[0]!.turnNumber}-${fold[fold.length - 1]!.turnNumber})\n\n${transcriptOf(fold, pc?.name ?? 'the player character')}`,
  ].join('\n\n');
  const reply = await deps.utility({ system: SUMMARY_SYSTEM, prompt, maxTokens: 2_000 });
  const summary = reply.text.trim();
  if (!summary) throw new Error('Utility model returned an empty summary');

  const fromTurn = fold[0]!.turnNumber;
  const toTurn = fold[fold.length - 1]!.turnNumber;
  const applied = await deps.db.transaction(async (tx) => {
    const [locked] = await tx.select().from(campaigns).where(eq(campaigns.id, campaignId)).for('update');
    // Stale: the summary changed, or the messages were undone or folded while the model was working.
    if (!locked || locked.rollingSummary.trim() !== previous || locked.turnCount < 1) return false;
    const ids = fold.map((m) => m.id);
    const [{ open } = { open: 0 }] = await tx
      .select({ open: sql<number>`count(*)::int` })
      .from(messages)
      .where(and(inArray(messages.id, ids), eq(messages.summarized, false)));
    if (open !== ids.length) return false;

    const mutator = new Mutator(tx, campaignId, locked.turnCount);
    await mutator.update('campaigns', { id: campaignId }, { rollingSummary: summary });
    for (const id of ids) await mutator.update('messages', { id }, { summarized: true });
    await mutator.commit({
      eventType: 'memory_summary',
      humanReadable: `Story so far updated: turns ${fromTurn === toTurn ? fromTurn : `${fromTurn}–${toTurn}`} folded into the summary`,
      details: { fromTurn, toTurn, messages: ids.length, reason: plan.reason ?? 'requested', model: deps.model, inputTokens: reply.inputTokens, outputTokens: reply.outputTokens },
    });
    return true;
  });
  if (!applied) {
    deps.log.info({ campaignId }, 'Summary went stale before it could be saved; will retry after a later turn');
    return null;
  }
  deps.log.info({ campaignId, fromTurn, toTurn, words: summary.split(/\s+/).length, inputTokens: reply.inputTokens, outputTokens: reply.outputTokens }, 'Rolling summary updated');
  return { fromTurn, toTurn, messages: fold.length };
}

/** Condense the history notes of relationships whose notes have piled up. */
async function condenseNotes(deps: JobDeps, campaignId: string, force: boolean): Promise<string[]> {
  const due = await deps.db
    .select({ rel: relationships, npcName: npcs.name })
    .from(relationships)
    .innerJoin(npcs, eq(npcs.id, relationships.npcId))
    .where(
      and(
        eq(relationships.campaignId, campaignId),
        gt(relationships.notesSinceCondense, 0),
        force
          ? sql`true`
          : or(sql`${relationships.notesSinceCondense} >= ${CONDENSE_AFTER_NOTES}`, sql`length(${relationships.historyNotes}) > ${MAX_NOTES_CHARS}`),
      ),
    )
    .orderBy(sql`${relationships.notesSinceCondense} desc`)
    .limit(MAX_CONDENSE_PER_RUN);

  const done: string[] = [];
  for (const { rel, npcName } of due) {
    // A couple of short notes are already as condensed as they need to be.
    if (rel.historyNotes.split('\n').filter(Boolean).length <= 3) continue;
    const prompt = [
      `NPC: ${npcName}`,
      `Relationship now: status "${rel.status}", affinity ${rel.affinity}, trust ${rel.trust} (each -100..100)`,
      `Notes, oldest first:\n${rel.historyNotes}`,
    ].join('\n\n');
    const reply = await deps.utility({ system: CONDENSE_SYSTEM, prompt, maxTokens: 800 });
    const condensed = parseBullets(reply.text);
    if (!condensed) {
      deps.log.warn({ campaignId, npc: npcName }, 'Utility model returned no usable bullets; notes left as they were');
      continue;
    }
    const applied = await deps.db.transaction(async (tx) => {
      const [locked] = await tx.select().from(campaigns).where(eq(campaigns.id, campaignId)).for('update');
      const [current] = await tx.select().from(relationships).where(eq(relationships.id, rel.id));
      if (!locked || locked.turnCount < 1 || !current || current.historyNotes !== rel.historyNotes) return false;
      const mutator = new Mutator(tx, campaignId, locked.turnCount);
      await mutator.update('relationships', { id: rel.id }, { historyNotes: condensed, notesSinceCondense: 0 });
      await mutator.commit({
        eventType: 'memory_notes',
        humanReadable: `Condensed ${npcName}'s history notes`,
        details: { npc: npcName, model: deps.model, inputTokens: reply.inputTokens, outputTokens: reply.outputTokens },
      });
      return true;
    });
    if (applied) done.push(npcName);
  }
  if (done.length > 0) deps.log.info({ campaignId, npcs: done }, 'Relationship notes condensed');
  return done;
}

// ---------------------------------------------------------------- scheduler

export interface Maintenance {
  /** Queue maintenance for a campaign (after a turn). Never throws; failures are logged. */
  schedule(campaignId: string): void;
  /** Run maintenance now and report what changed. `force` folds and condenses even if not yet due. */
  runNow(campaignId: string, opts?: { force?: boolean }): Promise<MemoryReport>;
  /** Resolves once no maintenance is running (tests, shutdown). */
  idle(): Promise<void>;
  readonly enabled: boolean;
}

export function createMaintenance(opts: { db: Db; utility: UtilityFn | null; model: string; log: FastifyBaseLogger }): Maintenance {
  // One job chain per campaign: jobs for the same campaign never overlap.
  const chains = new Map<string, Promise<unknown>>();
  const queued = new Set<string>();

  async function run(campaignId: string, force: boolean): Promise<MemoryReport> {
    if (!opts.utility) return { enabled: false, summary: null, condensed: [] };
    const deps: JobDeps = { db: opts.db, utility: opts.utility, model: opts.model, log: opts.log };
    // Fold a long backlog in several passes (each pass is capped).
    let summary: MemoryReport['summary'] = null;
    for (let pass = 0; pass < 5; pass++) {
      const folded = await foldSummary(deps, campaignId, force && pass === 0);
      if (!folded) break;
      summary = summary ? { fromTurn: summary.fromTurn, toTurn: folded.toTurn, messages: summary.messages + folded.messages } : folded;
    }
    const condensed = await condenseNotes(deps, campaignId, force);
    return { enabled: true, summary, condensed };
  }

  function enqueue<T>(campaignId: string, job: () => Promise<T>): Promise<T> {
    const previous = chains.get(campaignId) ?? Promise.resolve();
    const next = previous.catch(() => {}).then(job);
    const settled = next.catch(() => {});
    chains.set(campaignId, settled);
    void settled.then(() => {
      if (chains.get(campaignId) === settled) chains.delete(campaignId);
    });
    return next;
  }

  return {
    enabled: opts.utility !== null,
    schedule(campaignId) {
      if (!opts.utility || queued.has(campaignId)) return; // one pending run covers any number of turns
      queued.add(campaignId);
      void enqueue(campaignId, () => {
        queued.delete(campaignId);
        return run(campaignId, false);
      }).catch((err: unknown) => opts.log.error({ err, campaignId }, 'Memory maintenance failed; will retry after the next turn'));
    },
    runNow(campaignId, { force = false } = {}) {
      return enqueue(campaignId, () => run(campaignId, force));
    },
    async idle() {
      while (chains.size > 0) await Promise.all([...chains.values()]);
    },
  };
}
