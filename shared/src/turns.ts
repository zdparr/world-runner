import { z } from 'zod';

// Contract for POST /api/campaigns/:id/turns, which streams Server-Sent Events.

export const TurnRequest = z
  .object({
    content: z.string().trim().min(1, 'Say or do something').max(8_000),
  })
  .strict();
export type TurnRequest = z.input<typeof TurnRequest>;

/** A state change as the UI sees it (toasts, change log). */
export interface StateChange {
  id: number;
  eventType: string;
  humanReadable: string;
  /** Small, UI-relevant facts (e.g. { delta: 250, balance: 1340 }). The undo data stays server-side. */
  details: Record<string, unknown>;
}

export interface TurnUsage {
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  latencyMs: number;
  rounds: number;
}

/** Events on the turn stream, in order: turn_start, then any text/tool/state_change, then done or error. */
export type TurnStreamEvent =
  | { type: 'turn_start'; turnNumber: number }
  | { type: 'text'; delta: string }
  | { type: 'tool'; name: string; input: unknown; ok: boolean; summary: string }
  | { type: 'state_change'; change: StateChange }
  | { type: 'done'; turnNumber: number; narration: string; stateChanges: StateChange[]; usage: TurnUsage }
  | { type: 'error'; message: string; retryable: boolean };

export interface UndoResult {
  undoneTurn: number;
  revertedChanges: StateChange[];
}
