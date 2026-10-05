import { eq } from 'drizzle-orm';
import type { MissionObjective } from '@narrator/shared';
import type { Db } from '../db/client';
import { campaigns, npcs } from '../db/schema';
import { HttpError } from '../http/errors';
import { Mutator, readRow, type RowChange, type TableName } from './mutator';

/**
 * Edits made by hand in the UI (fixing a missed XP grant, ticking an objective the narrator forgot)
 * go through a Mutator like the engine's own writes, and are recorded as a `manual_edit` event on
 * the campaign's latest turn. That keeps them in the history (search_past_events), shows them to
 * the narrator on the next turn, and makes undoing that turn revert them too, so state never drifts
 * from the log. Edits before the first turn (building the character and world) are not logged.
 */
export const MANUAL_EDIT_EVENT = 'manual_edit';

const LABELS: Record<TableName, string> = {
  player_character: 'character',
  skills: 'skill',
  inventory_items: 'item',
  npcs: 'NPC',
  relationships: 'relationship',
  locations: 'location',
  lore_entries: 'lore',
  missions: 'mission',
  campaigns: 'campaign',
  messages: 'message',
};
const UNLISTED_FIELDS = new Set(['id', 'campaignId', 'createdAt', 'updatedAt']);
const MAX_DESCRIPTION = 600;

/** A short printable value, or null when it is too long or structured to be worth showing. */
function shortValue(v: unknown): string | null {
  if (v === null || v === undefined) return 'none';
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'string') return v.length <= 60 ? `"${v}"` : null;
  return null;
}

function describeFields(table: TableName, before: Record<string, unknown>, after: Record<string, unknown>): string[] {
  const fields: string[] = [];
  for (const key of Object.keys(after)) {
    if (UNLISTED_FIELDS.has(key)) continue;
    if (table === 'missions' && key === 'objectives') {
      const was = new Map(((before[key] ?? []) as MissionObjective[]).map((o) => [o.id, o]));
      const ticks = ((after[key] ?? []) as MissionObjective[]).flatMap((o) => {
        const prior = was.get(o.id);
        if (!prior) return [`added ${o.id} "${o.text}"`];
        if (prior.done !== o.done) return [`${o.id} "${o.text}" ${o.done ? '✓' : 'unticked'}`];
        return prior.text !== o.text ? [`reworded ${o.id}`] : [];
      });
      fields.push(...(ticks.length > 0 ? ticks : ['objectives']));
      continue;
    }
    const a = shortValue(before[key]);
    const b = shortValue(after[key]);
    fields.push(a !== null && b !== null ? `${key} ${a} → ${b}` : key);
  }
  return fields;
}

async function nameOf(db: Db, change: RowChange): Promise<string> {
  const row =
    change.op === 'insert' ? change.after : change.op === 'delete' ? change.before : ((await readRow(db, change.table, change.key)) ?? change.before);
  if (change.table === 'campaigns') return 'settings';
  if (change.table === 'relationships') {
    const [npc] = row.npcId ? await db.select({ name: npcs.name }).from(npcs).where(eq(npcs.id, row.npcId as string)) : [];
    return `with ${npc?.name ?? 'an NPC'}`;
  }
  const name = (row.name ?? row.title ?? '') as string;
  return name ? `"${name}"` : '';
}

async function describe(db: Db, change: RowChange): Promise<string> {
  const what = [LABELS[change.table], await nameOf(db, change)].filter(Boolean).join(' ');
  switch (change.op) {
    case 'insert':
      return `added ${what}`;
    case 'delete':
      return `removed ${what}`;
    case 'update':
      return `${what}: ${describeFields(change.table, change.before, change.after).join(', ')}`;
  }
}

function isLockConflict(err: unknown): boolean {
  const code = (e: unknown) => (e as { code?: string } | null)?.code;
  return code(err) === '55P03' || code((err as { cause?: unknown } | null)?.cause) === '55P03';
}

/**
 * Run a hand edit in a transaction, writing through `mutator`, and log what it changed. Fails fast
 * with 409 while a turn (or maintenance) holds the campaign, rather than waiting on the model.
 */
export async function withManualEdit<T>(db: Db, campaignId: string, edit: (mutator: Mutator, tx: Db) => Promise<T>): Promise<T> {
  try {
    return await db.transaction(async (tx) => {
      const [campaign] = await tx
        .select({ turnCount: campaigns.turnCount })
        .from(campaigns)
        .where(eq(campaigns.id, campaignId))
        .for('update', { noWait: true });
      if (!campaign) throw new HttpError(404, 'Campaign not found');
      const mutator = new Mutator(tx, campaignId, campaign.turnCount);
      const result = await edit(mutator, tx);
      if (campaign.turnCount < 1 || mutator.pendingChanges.length === 0) {
        mutator.discard();
        return result;
      }
      const edits: string[] = [];
      for (const change of mutator.pendingChanges) edits.push(await describe(tx, change));
      const text = `Player correction: ${edits.join('; ')}`;
      await mutator.commit({
        eventType: MANUAL_EDIT_EVENT,
        humanReadable: text.length > MAX_DESCRIPTION ? `${text.slice(0, MAX_DESCRIPTION - 1)}…` : text,
        details: { edits },
      });
      return result;
    });
  } catch (err) {
    if (isLockConflict(err)) throw new HttpError(409, 'The narrator is still working on the last turn; save again in a moment');
    throw err;
  }
}
