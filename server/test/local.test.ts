import type Anthropic from '@anthropic-ai/sdk';
import { describe, expect, it } from 'vitest';
import { llmEndpoint } from '../src/engine/anthropic';
import { estimateTokens, LOCAL_MAX_OUTPUT_TOKENS, localizeNarratorParams as localize, OUTPUT_RESERVE_TOKENS, PLAYER_AGENCY_REMINDER } from '../src/engine/local';
import { isLooping, isRepeat, narrationOverlap, selfRepetition } from '../src/engine/repeat';

const localizeNarratorParams = (p: Anthropic.MessageStreamParams) => localize(p).params;

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

  it('caps the output so a looping model stops within a minute', () => {
    expect(localizeNarratorParams(base()).max_tokens).toBe(LOCAL_MAX_OUTPUT_TOKENS);
    expect(localizeNarratorParams(base({ max_tokens: 500 })).max_tokens).toBe(500);
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

describe('context budget', () => {
  // A long history of alternating turns, each about 1,000 tokens.
  const long = (n: number): Anthropic.MessageParam[] =>
    Array.from({ length: n }, (_, i) => ({ role: i % 2 === 0 ? 'user' : 'assistant', content: `turn ${i} ` + 'x'.repeat(3_800) }) as Anthropic.MessageParam);
  const withHistory = (n: number) => base({ messages: [...long(n), { role: 'user', content: 'I open the gate.' }] });

  it('leaves a request that fits untouched', () => {
    const out = localize(withHistory(4), { contextTokens: 32_768 });
    expect(out.droppedMessages).toBe(0);
    expect(out.params.messages).toHaveLength(5);
  });

  it('drops the oldest history until the request fits, keeping the player message and opening on a user turn', () => {
    const out = localize(withHistory(40), { contextTokens: 16_384 });
    expect(out.droppedMessages).toBeGreaterThan(0);
    expect(out.estimatedTokens).toBeLessThanOrEqual(16_384 - OUTPUT_RESERVE_TOKENS);
    expect(out.params.messages[0]!.role).toBe('user');
    expect(texts(out.params.messages.at(-1)!).at(-1)).toBe('I open the gate.');
    // What remains is the newest history, in order.
    expect(texts(out.params.messages[0]!)[0]).toBe(`turn ${out.droppedMessages} ` + 'x'.repeat(3_800));
  });

  it("never drops this turn's tool rounds", () => {
    const params = base({
      messages: [
        ...long(40),
        { role: 'user', content: 'I open the gate.' },
        { role: 'assistant', content: [{ type: 'tool_use', id: 't1', name: 'roll', input: {} }] },
        { role: 'user', content: [{ type: 'tool_result', tool_use_id: 't1', content: '14' }] },
      ],
    });
    const out = localize(params, { contextTokens: 16_384 });
    expect(out.params.messages.slice(-2)).toEqual(params.messages.slice(-2));
    expect(estimateTokens(out.params)).toBeLessThanOrEqual(16_384 - OUTPUT_RESERVE_TOKENS);
  });

  it('does not trim without a budget', () => {
    expect(localize(withHistory(40)).droppedMessages).toBe(0);
  });
});

describe('repeat detection', () => {
  const scene =
    'Rain hammers the slate roofs of the Bastion as Commander Thorne studies the map table, her jaw tight. ' +
    'Two of the seven watchtowers have gone dark, and the ash keeps falling on the north wall. ' +
    'Inquisitor Soren watches from the doorway, his sunburst pendant catching the torchlight, saying nothing.';
  const next =
    'Thorne finally looks up. "Greywatch went silent three nights ago," she says, tapping the dark tower. ' +
    '"I sent a patrol. None came back." Behind her a messenger waits with a sealed letter from the Conclave, ' +
    'shifting from foot to foot while the beacon hums overhead.';

  it('flags a copy of the previous narration, even with small edits', () => {
    expect(isRepeat(scene, scene)).toBe(true);
    expect(isRepeat(scene.replace('Rain hammers', 'Rain beats on'), scene)).toBe(true);
  });
  it('passes a new narration of the same scene', () => {
    expect(narrationOverlap(next, scene)).toBeLessThan(0.2);
    expect(isRepeat(next, scene)).toBe(false);
  });
  it('flags a narration that loops on itself, but not ordinary prose', () => {
    expect(isLooping(scene + ' ' + scene + ' ' + scene)).toBe(true);
    expect(isLooping(scene + ' ' + next)).toBe(false);
    expect(selfRepetition(next)).toBeLessThan(0.05);
  });
  it('ignores short replies and a missing previous narration', () => {
    expect(isRepeat('Thorne nods. "Go."', 'Thorne nods. "Go."')).toBe(false);
    expect(isRepeat(scene, undefined)).toBe(false);
  });
});

describe('llmEndpoint', () => {
  it('prefers the self-hosted server when LLM_BASE_URL is set', () => {
    expect(llmEndpoint({ LLM_BASE_URL: 'http://box:11434', ANTHROPIC_API_KEY: 'sk-ant' })).toEqual({ apiKey: 'local', baseURL: 'http://box:11434', local: true });
    expect(llmEndpoint({ LLM_BASE_URL: 'http://box:11434', LLM_API_KEY: 'k' })?.apiKey).toBe('k');
    expect(llmEndpoint({ LLM_BASE_URL: 'http://box:11434', LLM_CONTEXT_TOKENS: 65_536 })?.contextTokens).toBe(65_536);
  });
  it('falls back to Anthropic, or nothing', () => {
    expect(llmEndpoint({ ANTHROPIC_API_KEY: 'sk-ant' })).toEqual({ apiKey: 'sk-ant', local: false });
    expect(llmEndpoint({})).toBeNull();
  });
});
