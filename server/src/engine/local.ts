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
 * - Claude-only parameters (adaptive thinking, effort) are removed.
 */
export function localizeNarratorParams(params: Anthropic.MessageStreamParams): Anthropic.MessageStreamParams {
  const { thinking: _thinking, output_config: _outputConfig, ...rest } = params;
  const out: Anthropic.MessageStreamParams = { ...rest };

  if (params.tool_choice?.type === 'none') {
    delete out.tools;
    delete out.tool_choice;
  }

  if (Array.isArray(params.system) && params.system.length > 1) {
    const [stable, ...perTurn] = params.system;
    const state = perTurn.map((b) => b.text).join('\n\n').trim();
    out.system = [stable!];
    out.messages = withStateInPlayerMessage(params.messages, state);
  }
  return out;
}

export const PLAYER_AGENCY_REMINDER =
  "Narrator reminder: never write the player character's dialogue, thoughts, feelings, or decisions. " +
  "Describe the world and what other people do, resolve what the player attempted, then stop and hand control back. The player's message follows.";

const isToolResults = (m: Anthropic.MessageParam) => Array.isArray(m.content) && m.content.some((b) => b.type === 'tool_result');

/**
 * Puts the state and the reminder in front of the player's message for this turn: the last user
 * message that isn't tool results. Later tool rounds in the same turn find the same message, so
 * the prefix also stays identical between rounds.
 */
function withStateInPlayerMessage(messages: Anthropic.MessageParam[], state: string): Anthropic.MessageParam[] {
  let i = messages.length - 1;
  while (i >= 0 && (messages[i]!.role !== 'user' || isToolResults(messages[i]!))) i--;
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
