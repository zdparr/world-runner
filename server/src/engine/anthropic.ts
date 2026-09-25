import Anthropic from '@anthropic-ai/sdk';
import type { StreamFn } from './narrator';

/** The real model stream. Retries 429/5xx/connection errors with exponential backoff before giving up. */
export function createAnthropicStream(apiKey: string): StreamFn {
  const client = new Anthropic({ apiKey, maxRetries: 3, timeout: 120_000 });
  return (params) => client.messages.stream(params);
}
