import Anthropic from '@anthropic-ai/sdk';
import { ProxyAgent, fetch as undiciFetch } from 'undici';
import type { Config } from '../config';
import type { StreamFn } from './narrator';
import type { StructuredFn } from './extract';
import type { UtilityFn } from './memory';
import { localizeNarratorParams } from './local';

/** Where model calls go: Anthropic, or a self-hosted server speaking the same API. */
export interface LlmEndpoint {
  apiKey: string;
  /** Unset for Anthropic. */
  baseURL?: string;
  /** A self-hosted model: requests are adapted (see local.ts) and given more time. */
  local: boolean;
  /** Route model calls through this HTTP proxy (tailscaled on Render). */
  proxyUrl?: string;
}

/** The configured model endpoint, or null when neither LLM_BASE_URL nor ANTHROPIC_API_KEY is set. */
export function llmEndpoint(config: Pick<Config, 'LLM_BASE_URL' | 'LLM_API_KEY' | 'LLM_PROXY_URL' | 'ANTHROPIC_API_KEY'>): LlmEndpoint | null {
  const proxy = config.LLM_PROXY_URL ? { proxyUrl: config.LLM_PROXY_URL } : {};
  if (config.LLM_BASE_URL) return { apiKey: config.LLM_API_KEY || 'local', baseURL: config.LLM_BASE_URL, local: true, ...proxy };
  if (config.ANTHROPIC_API_KEY) return { apiKey: config.ANTHROPIC_API_KEY, local: false, ...proxy };
  return null;
}

/** A fetch that sends every request through the proxy (undici's own fetch, so the agent matches). */
function proxiedFetch(proxyUrl: string): typeof fetch {
  const dispatcher = new ProxyAgent(proxyUrl);
  return ((input: Parameters<typeof undiciFetch>[0], init?: Parameters<typeof undiciFetch>[1]) =>
    undiciFetch(input, { ...init, dispatcher })) as unknown as typeof fetch;
}

const client = (endpoint: LlmEndpoint) =>
  new Anthropic({
    apiKey: endpoint.apiKey,
    baseURL: endpoint.baseURL,
    ...(endpoint.proxyUrl ? { fetch: proxiedFetch(endpoint.proxyUrl) } : {}),
    // A local model can spend a minute on a long prompt before answering, and a retry repeats that
    // work on the same single GPU; one retry covers a dropped connection.
    maxRetries: endpoint.local ? 1 : 3,
    timeout: endpoint.local ? 600_000 : 120_000,
  });

/** The real model stream. Retries 429/5xx/connection errors with exponential backoff before giving up. */
export function createAnthropicStream(endpoint: LlmEndpoint): StreamFn {
  const anthropic = client(endpoint);
  return (params) => anthropic.messages.stream(endpoint.local ? localizeNarratorParams(params) : params);
}

/** The utility model (summaries, note condensing): one short, non-streaming request per job. */
export function createAnthropicUtility(endpoint: LlmEndpoint, model: string): UtilityFn {
  const anthropic = client(endpoint);
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

/** The utility model with a forced tool call, for structured output (story extraction). */
export function createAnthropicStructured(endpoint: LlmEndpoint, model: string): StructuredFn {
  const anthropic = client(endpoint);
  return async ({ system, prompt, maxTokens, tool }) => {
    const message = await anthropic.messages.create({
      model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: 'user', content: prompt }],
      tools: [{ name: tool.name, description: tool.description, input_schema: tool.inputSchema as Anthropic.Tool.InputSchema }],
      tool_choice: { type: 'tool', name: tool.name },
    });
    // A tool call cut off by max_tokens may parse into a plausible but partial record; never apply it.
    if (message.stop_reason === 'max_tokens' || message.stop_reason === 'refusal') {
      throw new Error(`Utility model stopped early (${message.stop_reason})`);
    }
    const use = message.content.find((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use' && b.name === tool.name);
    if (!use) throw new Error('Utility model did not call the extraction tool');
    return { input: use.input, inputTokens: message.usage.input_tokens, outputTokens: message.usage.output_tokens };
  };
}
