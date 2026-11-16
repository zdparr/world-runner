import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { llmEndpoint } from '../src/engine/anthropic';
import { localizeNarratorParams, PLAYER_AGENCY_REMINDER } from '../src/engine/local';

const tools: Anthropic.Tool[] = [{ name: 'roll', description: 'Roll', input_schema: { type: 'object', properties: {} } }];
const base = (over: Partial<Anthropic.MessageStreamParams> = {}): Anthropic.MessageStreamParams => ({
  model: 'local-model',
  max_tokens: 16_000,
  thinking: { type: 'adaptive' },
  output_config: { effort: 'medium' },
  system: [
    { type: 'text', text: 'STATIC RULES', cache_control: { type: 'ephemeral' } },
    { type: 'text', text: 'STATE: night, at the gate' },
  ],
  tools,
  messages: [
    { role: 'user', content: 'Earlier move' },
    { role: 'assistant', content: 'Earlier narration' },
    { role: 'user', content: 'I open the gate.' },
  ],
  ...over,
});
const texts = (m: Anthropic.MessageParam) => (typeof m.content === 'string' ? [m.content] : m.content.map((b) => (b.type === 'text' ? b.text : b.type)));

describe('localizeNarratorParams', () => {
  it('drops Claude-only parameters', () => {
    const out = localizeNarratorParams(base());
    expect(out).not.toHaveProperty('thinking');
    expect(out).not.toHaveProperty('output_config');
    expect(out.tools).toBe(tools);
  });

  it('keeps only the stable system block, moving the per-turn state into the player message', () => {
    const out = localizeNarratorParams(base());
    expect(out.system).toEqual([base().system![0]]);
    expect(out.messages.slice(0, 2)).toEqual(base().messages.slice(0, 2)); // history untouched
    expect(texts(out.messages[2]!)).toEqual(['<current_state>\nSTATE: night, at the gate\n</current_state>', PLAYER_AGENCY_REMINDER, 'I open the gate.']);
  });

  it('keeps the same player message across tool rounds, so the prefix is identical between rounds', () => {
    const round1 = localizeNarratorParams(base());
    const round2 = localizeNarratorParams(
      base({
        messages: [
          ...base().messages,
          { role: 'assistant', content: [{ type: 'tool_use', id: 't1', name: 'roll', input: {} }] },
          { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: '14' }] },
        ],
      }),
    );
    expect(round2.messages.slice(0, 3)).toEqual(round1.messages);
    expect(round2.messages[4]!.content).toEqual([{ type: 'tool_result', tool_use_id: 't1', content: '14' }]);
  });

  it('removes the tools on the final round, since local models ignore tool_choice none', () => {
    const out = localizeNarratorParams(base({ tool_choice: { type: 'none' } }));
    expect(out).not.toHaveProperty('tools');
    expect(out).not.toHaveProperty('tool_choice');
  });

  it('does not mutate the original request', () => {
    const params = base();
    const snapshot = structuredClone(params);
    localizeNarratorParams(params);
    expect(params).toEqual(snapshot);
  });
});

describe('llmEndpoint', () => {
  it('prefers the self-hosted server when LLM_BASE_URL is set', () => {
    expect(llmEndpoint({ LLM_BASE_URL: 'http://box:11434', ANTHROPIC_API_KEY: 'sk-ant' })).toEqual({ apiKey: 'local', baseURL: 'http://box:11434', local: true });
    expect(llmEndpoint({ LLM_BASE_URL: 'http://box:11434', LLM_API_KEY: 'k' })?.apiKey).toBe('k');
  });
  it('falls back to Anthropic, or nothing', () => {
    expect(llmEndpoint({ ANTHROPIC_API_KEY: 'sk-ant' })).toEqual({ apiKey: 'sk-ant', local: false });
    expect(llmEndpoint({})).toBeNull();
  });
});
