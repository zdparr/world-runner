import type Anthropic from '@anthropic-ai/sdk';
import type { TurnStreamEvent } from '@narrator/shared';
import type { ModelStream, StreamFn } from '../src/engine/narrator';

/** What a scripted round returns: narration text and/or tool calls. */
export interface ScriptedReply {
  text?: string;
  tools?: { name: string; input: unknown }[];
  stopReason?: Anthropic.Message['stop_reason'];
  usage?: Partial<Anthropic.Usage>;
}

export type Step = ScriptedReply | ((params: Anthropic.MessageStreamParams) => ScriptedReply);

/**
 * A fake model: each call to the stream consumes the next scripted step. Records every request so
 * tests can assert on what the narrator was sent (context, tool results, cache markers).
 */
export function scriptedModel(steps: Step[]) {
  const calls: Anthropic.MessageStreamParams[] = [];
  let toolSeq = 0;

  const stream: StreamFn = (params) => {
    // Snapshot: the loop reuses and grows its arrays between rounds.
    calls.push(structuredClone(params));
    const step = steps[calls.length - 1];
    if (!step) throw new Error(`Model called ${calls.length} times but only ${steps.length} steps were scripted`);
    const reply = typeof step === 'function' ? step(params) : step;
    const content: Anthropic.ContentBlock[] = [];
    if (reply.text) content.push({ type: 'text', text: reply.text, citations: null } as Anthropic.TextBlock);
    for (const t of reply.tools ?? []) {
      content.push({ type: 'tool_use', id: `toolu_${++toolSeq}`, name: t.name, input: t.input } as Anthropic.ToolUseBlock);
    }
    const message = {
      id: `msg_${calls.length}`,
      type: 'message',
      role: 'assistant',
      model: params.model,
      content,
      stop_reason: reply.stopReason ?? (reply.tools?.length ? 'tool_use' : 'end_turn'),
      stop_sequence: null,
      usage: {
        input_tokens: 100,
        output_tokens: 50,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 0,
        ...reply.usage,
      },
    } as unknown as Anthropic.Message;

    const listeners: ((delta: string) => void)[] = [];
    const fake: ModelStream = {
      on: (_event, listener) => listeners.push(listener),
      finalMessage: async () => {
        // Stream the text in a few chunks, like the real thing.
        for (const chunk of (reply.text ?? '').match(/.{1,12}/gs) ?? []) listeners.forEach((l) => l(chunk));
        return message;
      },
    };
    return fake;
  };

  return { stream, calls };
}

/** The tool_result blocks the model received at the start of request `index`. */
export function toolResultsIn(params: Anthropic.MessageStreamParams): Anthropic.ToolResultBlockParam[] {
  const last = params.messages[params.messages.length - 1];
  if (!last || typeof last.content === 'string') return [];
  return last.content.filter((b): b is Anthropic.ToolResultBlockParam => b.type === 'tool_result');
}

/** Parse an SSE body into events. */
export function parseSse(body: string): TurnStreamEvent[] {
  return body
    .split('\n\n')
    .map((chunk) => chunk.split('\n').find((line) => line.startsWith('data: ')))
    .filter((line): line is string => Boolean(line))
    .map((line) => JSON.parse(line.slice(6)) as TurnStreamEvent);
}

/** The final `done` event of a turn stream (fails the test if the turn errored). */
export function doneEvent(events: TurnStreamEvent[]): Extract<TurnStreamEvent, { type: 'done' }> {
  const last = events.at(-1);
  if (last?.type !== 'done') throw new Error(`Turn did not finish: ${JSON.stringify(last)}`);
  return last;
}
