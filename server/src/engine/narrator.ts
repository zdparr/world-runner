import type Anthropic from '@anthropic-ai/sdk';
import type { RoundUsage, ToolCallRecord } from '@narrator/shared';

export type { RoundUsage, ToolCallRecord };

/** The slice of the SDK's MessageStream the loop uses; lets tests script the model. */
export interface ModelStream {
  on(event: 'text', listener: (delta: string) => void): unknown;
  finalMessage(): Promise<Anthropic.Message>;
}
export type StreamFn = (params: Anthropic.MessageStreamParams) => ModelStream;

export interface ToolOutcome {
  content: string;
  isError: boolean;
}

export interface NarratorResult {
  narration: string;
  toolCalls: ToolCallRecord[];
  rounds: RoundUsage[];
}

export class NarratorRefusal extends Error {}
export class NarratorTruncated extends Error {}

export interface NarratorOptions {
  stream: StreamFn;
  model: string;
  effort: 'low' | 'medium' | 'high';
  system: Anthropic.TextBlockParam[];
  messages: Anthropic.MessageParam[];
  tools: Anthropic.Tool[];
  maxToolRounds: number;
  executeTool: (name: string, input: unknown) => Promise<ToolOutcome>;
  onText: (delta: string) => void;
  onTool?: (call: ToolCallRecord) => void;
}

/**
 * Marks the last block of the conversation for caching, so each tool round reuses the previous
 * round's prefix. Works on a copy: markers never accumulate in the stored conversation.
 */
function withTailCache(messages: Anthropic.MessageParam[]): Anthropic.MessageParam[] {
  const last = messages[messages.length - 1];
  if (!last) return messages;
  const blocks: Anthropic.ContentBlockParam[] =
    typeof last.content === 'string' ? [{ type: 'text', text: last.content }] : [...last.content];
  const tail = blocks[blocks.length - 1];
  if (!tail || tail.type === 'thinking' || tail.type === 'redacted_thinking') return messages;
  blocks[blocks.length - 1] = { ...tail, cache_control: { type: 'ephemeral' } } as Anthropic.ContentBlockParam;
  return [...messages.slice(0, -1), { ...last, content: blocks }];
}

/**
 * The narrator's agent loop. Streams text as it is generated, runs requested tools between
 * rounds, and after `maxToolRounds` tool rounds forces a final narration-only round.
 */
export async function runNarrator(opts: NarratorOptions): Promise<NarratorResult> {
  const conversation = [...opts.messages];
  const toolCalls: ToolCallRecord[] = [];
  const rounds: RoundUsage[] = [];
  let narration = '';
  let paragraphBreakPending = false;

  for (let round = 1; round <= opts.maxToolRounds + 1; round++) {
    const finalRound = round > opts.maxToolRounds;
    const stream = opts.stream({
      model: opts.model,
      max_tokens: 16_000,
      thinking: { type: 'adaptive' },
      output_config: { effort: opts.effort },
      system: opts.system,
      tools: opts.tools,
      // Out of tool rounds: the tools stay defined (keeping the cache) but can't be called.
      ...(finalRound ? { tool_choice: { type: 'none' as const } } : {}),
      messages: withTailCache(conversation),
    });
    stream.on('text', (delta) => {
      // Text resumes after a tool round: start a new paragraph rather than gluing sentences together.
      if (paragraphBreakPending && narration && !/\s$/.test(narration)) {
        narration += '\n\n';
        opts.onText('\n\n');
      }
      paragraphBreakPending = false;
      narration += delta;
      opts.onText(delta);
    });
    const message = await stream.finalMessage();
    rounds.push({
      round,
      stopReason: message.stop_reason,
      inputTokens: message.usage.input_tokens,
      outputTokens: message.usage.output_tokens,
      cacheReadTokens: message.usage.cache_read_input_tokens ?? 0,
      cacheCreationTokens: message.usage.cache_creation_input_tokens ?? 0,
    });

    if (message.stop_reason === 'refusal') throw new NarratorRefusal('The narrator declined to continue this scene.');

    const toolUses = message.content.filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use');
    if (message.stop_reason !== 'tool_use' || toolUses.length === 0) {
      // A tool call cut off by max_tokens may have parsed into a plausible but partial input; never run it.
      if (message.stop_reason === 'max_tokens' && toolUses.length > 0) throw new NarratorTruncated('The narrator ran out of room mid-action.');
      break;
    }

    // Echo the full assistant content back (thinking blocks included, unchanged) before the results.
    conversation.push({ role: 'assistant', content: message.content });
    const results: Anthropic.ToolResultBlockParam[] = [];
    for (const use of toolUses) {
      const started = Date.now();
      const outcome = await opts.executeTool(use.name, use.input);
      const call: ToolCallRecord = { round, name: use.name, input: use.input, ok: !outcome.isError, result: outcome.content, ms: Date.now() - started };
      toolCalls.push(call);
      opts.onTool?.(call);
      results.push({ type: 'tool_result', tool_use_id: use.id, content: outcome.content, ...(outcome.isError ? { is_error: true } : {}) });
    }
    // All results for a round go back in a single user message.
    conversation.push({ role: 'user', content: results });
    paragraphBreakPending = true;
  }

  return { narration: narration.trim(), toolCalls, rounds };
}
