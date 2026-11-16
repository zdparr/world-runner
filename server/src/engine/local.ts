import type Anthropic from '@anthropic-ai/sdk';

/**
 * Adapts a narrator request for a self-hosted model behind an Anthropic-compatible endpoint
 * (Ollama). The narrator loop and context builder stay written for Claude; this is the only place
 * that knows about the differences:
 *
 * - Prompt order for prefix caching. Local servers reuse their KV cache only for an identical
 *   prompt prefix, and the chat template renders tools after the system text. The per-turn world
 *   state (every system block after the first) would sit before the tools and the whole history,
 *   so all of it was re-processed every turn. It moves into this turn's player message instead,
 *   leaving system -> tools -> history as a prefix that stays the same from turn to turn.
 * - The rule against writing the player's part is restated right before the player's message,
 *   where a small model actually follows it (it ignores it deep in a long system prompt).
 * - `tool_choice: none` is ignored by local models, so the narrator's final, narration-only round
 *   drops the tools entirely.
 * - Claude-only parameters (adaptive thinking, effort) are removed, and the output is capped
 *   (LOCAL_MAX_OUTPUT_TOKENS) so a model stuck in a loop stops within a minute.
 * - The prompt is kept inside the model's context window by dropping the oldest history (see
 *   fitToContext). Claude's window is far larger; a local one is easy to outgrow.
 */
export function localizeNarratorParams(
  params: Anthropic.MessageStreamParams,
  opts: { contextTokens?: number } = {},
): { params: Anthropic.MessageStreamParams; droppedMessages: number; estimatedTokens: number } {
  const { thinking: _thinking, output_config: _outputConfig, ...rest } = params;
  let out: Anthropic.MessageStreamParams = { ...rest };

  // A narration is 300-600 tokens. A local model that falls into a loop writes until max_tokens,
  // which at 16k would take minutes; capped, a loop ends within a minute (and repeat.ts discards it).
  out.max_tokens = Math.min(params.max_tokens, LOCAL_MAX_OUTPUT_TOKENS);

  if (params.tool_choice?.type === 'none') {
    delete out.tools;
    delete out.tool_choice;
  }

  const playerIndex = playerMessageIndex(params.messages);
  if (Array.isArray(params.system) && params.system.length > 1) {
    const [stable, ...perTurn] = params.system;
    const state = perTurn.map((b) => b.text).join('\n\n').trim();
    out.system = [stable!];
    out.messages = withStateInPlayerMessage(params.messages, playerIndex, state);
  }

  let droppedMessages = 0;
  if (opts.contextTokens) ({ params: out, droppedMessages } = fitToContext(out, playerIndex, opts.contextTokens));
  return { params: out, droppedMessages, estimatedTokens: estimateTokens(out) };
}

export const LOCAL_MAX_OUTPUT_TOKENS = 2_048;

export const PLAYER_AGENCY_REMINDER =
  "Narrator reminder: never write the player character's dialogue, thoughts, feelings, or decisions. " +
  "Describe the world and what other people do, resolve what the player attempted, then stop and hand control back. The player's message follows.";

const isToolResults = (m: Anthropic.MessageParam) => Array.isArray(m.content) && m.content.some((b) => b.type === 'tool_result');

/** This turn's player message: the last user message that isn't tool results (-1 if none). */
function playerMessageIndex(messages: Anthropic.MessageParam[]): number {
  let i = messages.length - 1;
  while (i >= 0 && (messages[i]!.role !== 'user' || isToolResults(messages[i]!))) i--;
  return i;
}

/**
 * Puts the state and the reminder in front of the player's message for this turn. Later tool
 * rounds in the same turn find the same message, so the prefix also stays identical between rounds.
 */
function withStateInPlayerMessage(messages: Anthropic.MessageParam[], i: number, state: string): Anthropic.MessageParam[] {
  if (i < 0) return messages;
  const player = messages[i]!;
  const playerBlocks: Anthropic.ContentBlockParam[] =
    typeof player.content === 'string' ? [{ type: 'text', text: player.content }] : player.content;
  const preamble: Anthropic.TextBlockParam[] = [
    ...(state ? [{ type: 'text' as const, text: `<current_state>\n${state}\n</current_state>` }] : []),
    { type: 'text', text: PLAYER_AGENCY_REMINDER },
  ];
  const copy = [...messages];
  copy[i] = { role: 'user', content: [...preamble, ...playerBlocks] };
  return copy;
}

/**
 * Rough token count for a request. Measured against Qwen3's own count for this app's narrator
 * prompts (13-14k tokens), JSON characters / 4.0 overestimates by ~4%, erring on the side of trimming.
 */
const CHARS_PER_TOKEN = 4.0;
export const estimateTokens = (p: Pick<Anthropic.MessageStreamParams, 'system' | 'tools' | 'messages'>) =>
  Math.ceil(JSON.stringify([p.system ?? '', p.tools ?? [], p.messages]).length / CHARS_PER_TOKEN);

/** Room left for the reply (a narration is ~300-600 tokens; tool calls are small). */
export const OUTPUT_RESERVE_TOKENS = 3_000;

/**
 * Drops the oldest history (messages before this turn's player message) until the request fits
 * the context window with room for the reply. Older events are in the rolling summary, so they
 * are not lost. The system prompt, tools, state, player message, and this turn's tool rounds are
 * never dropped. History is dropped whole: the conversation still opens with a user message.
 */
export function fitToContext(
  params: Anthropic.MessageStreamParams,
  playerIndex: number,
  contextTokens: number,
): { params: Anthropic.MessageStreamParams; droppedMessages: number } {
  const budget = contextTokens - OUTPUT_RESERVE_TOKENS;
  if (playerIndex <= 0 || estimateTokens(params) <= budget) return { params, droppedMessages: 0 };
  let start = 0;
  let messages = params.messages;
  while (start < playerIndex && estimateTokens({ ...params, messages }) > budget) {
    start++;
    // Never open on an assistant message.
    while (start < playerIndex && params.messages[start]!.role !== 'user') start++;
    messages = params.messages.slice(start);
  }
  return { params: { ...params, messages }, droppedMessages: start };
}
