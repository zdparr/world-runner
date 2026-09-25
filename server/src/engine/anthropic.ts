import Anthropic from '@anthropic-ai/sdk';
import type { StreamFn } from './narrator';
import type { UtilityFn } from './memory';

const client = (apiKey: string) => new Anthropic({ apiKey, maxRetries: 3, timeout: 120_000 });

/** The real model stream. Retries 429/5xx/connection errors with exponential backoff before giving up. */
export function createAnthropicStream(apiKey: string): StreamFn {
  const anthropic = client(apiKey);
  return (params) => anthropic.messages.stream(params);
}

/** The utility model (summaries, note condensing): one short, non-streaming request per job. */
export function createAnthropicUtility(apiKey: string, model: string): UtilityFn {
  const anthropic = client(apiKey);
  return async ({ system, prompt, maxTokens }) => {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
    });
    // A cut-off or refused summary is worse than none: the job is simply retried after a later turn.
    if (message.stop_reason !== 'end_turn' && message.stop_reason !== 'stop_sequence') {
      throw new Error(`Utility model stopped early (${message.stop_reason})`);
    }
    const text = message.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim();
    return { text, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens };
  };
}
