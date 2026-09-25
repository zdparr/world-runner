import { and, desc, eq, sql } from 'drizzle-orm';
import type { StateChange, UndoResult } from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, messages, stateEvents, turnDebug } from '../db/schema';
import { HttpError } from '../http/errors';
import { revertChanges, type RowChange } from './mutator';

/**
 * Undo the most recent turn: revert every state change it made (newest first), then delete its
 * messages, events, and debug record. Runs in one transaction.
 */
export async function undoLastTurn(db: Db, campaignId: string): Promise<UndoResult> {
  return db.transaction(async (tx) => {
    const [campaign] = await tx.select().from(campaigns).where(eq(campaigns.id, campaignId)).for('update');
    if (!campaign) throw new HttpError(404, 'Campaign not found');
    const turn = campaign.turnCount;
    if (turn < 1) throw new HttpError(400, 'There is no turn to undo');

    const events = await tx
      .select()
      .from(stateEvents)
      .where(and(eq(stateEvents.campaignId, campaignId), eq(stateEvents.turnNumber, turn)))
      .orderBy(desc(stateEvents.id));
    for (const event of events) {
      await revertChanges(tx, ((event.payload as { changes?: RowChange[] }).changes ?? []));
    }

    const scoped = <T extends typeof stateEvents | typeof messages | typeof turnDebug>(t: T) =>
      and(eq(t.campaignId, campaignId), eq(t.turnNumber, turn));
    await tx.delete(stateEvents).where(scoped(stateEvents));
    await tx.delete(messages).where(scoped(messages));
    await tx.delete(turnDebug).where(scoped(turnDebug));
    await tx.update(campaigns).set({ turnCount: turn - 1, updatedAt: sql`now()` }).where(eq(campaigns.id, campaignId));

    const revertedChanges: StateChange[] = events.map((e) => ({
      id: e.id,
      eventType: e.eventType,
      humanReadable: e.humanReadable,
      details: ((e.payload as { details?: Record<string, unknown> }).details ?? {}),
    }));
    return { undoneTurn: turn, revertedChanges };
  });
}
