import { and, eq, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { Db } from '../db/client';
import {
  campaigns,
  inventoryItems,
  locations,
  missions,
  npcs,
  playerCharacter,
  relationships,
  skills,
  stateEvents,
} from '../db/schema';

/**
 * Every write the turn engine makes goes through a Mutator, which records a row-level
 * before/after diff. Those diffs are stored in the state event payload, which makes
 * undo generic: replay the diffs backwards.
 */

// Tables the engine may write, keyed by a stable name stored in event payloads.
const TABLES = {
  player_character: { table: playerCharacter, key: ['campaignId'] },
  skills: { table: skills, key: ['id'] },
  inventory_items: { table: inventoryItems, key: ['id'] },
  npcs: { table: npcs, key: ['id'] },
  relationships: { table: relationships, key: ['id'] },
  locations: { table: locations, key: ['id'] },
  missions: { table: missions, key: ['id'] },
  campaigns: { table: campaigns, key: ['id'] },
} as const satisfies Record<string, { table: PgTable; key: string[] }>;

export type TableName = keyof typeof TABLES;
type Row = Record<string, unknown>;

export type RowChange =
  | { table: TableName; op: 'insert'; key: Row; after: Row }
  | { table: TableName; op: 'update'; key: Row; before: Row; after: Row }
  | { table: TableName; op: 'delete'; key: Row; before: Row };

const TIMESTAMP_FIELDS = new Set(['createdAt', 'updatedAt']);

function columnsOf(name: TableName): Record<string, PgColumn> {
  return TABLES[name].table as unknown as Record<string, PgColumn>;
}

function keyOf(name: TableName, row: Row): Row {
  return Object.fromEntries(TABLES[name].key.map((k) => [k, row[k]]));
}

function whereKey(name: TableName, key: Row): SQL {
  const cols = columnsOf(name);
  const parts = Object.entries(key).map(([k, v]) => eq(cols[k]!, v));
  return parts.length === 1 ? parts[0]! : and(...parts)!;
}

/** JSON-safe copy of a row (Dates to ISO strings) for storing in jsonb. */
function snapshot(row: Row): Row {
  return JSON.parse(JSON.stringify(row)) as Row;
}

/** Undo a snapshot's serialization: timestamps back to Dates, so Drizzle can write them. */
function revive(row: Row): Row {
  return Object.fromEntries(
    Object.entries(row).map(([k, v]) => [k, TIMESTAMP_FIELDS.has(k) && typeof v === 'string' ? new Date(v) : v]),
  );
}

function sameValue(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

export interface RecordedEvent {
  eventType: string;
  humanReadable: string;
  /** UI-facing facts (toasts); stored alongside the changes. */
  details: Record<string, unknown>;
  /** Record the event even if no rows changed (e.g. a dice roll). */
  always?: boolean;
}

export class Mutator {
  private pending: RowChange[] = [];

  constructor(
    readonly db: Db,
    readonly campaignId: string,
    readonly turnNumber: number,
  ) {}

  async insert<T extends Row>(name: TableName, values: Row): Promise<T> {
    const { table } = TABLES[name];
    const [row] = (await this.db
      .insert(table)
      .values({ ...values, campaignId: this.campaignId } as never)
      .returning()) as unknown as T[];
    this.pending.push({ table: name, op: 'insert', key: keyOf(name, row!), after: snapshot(row!) });
    return row!;
  }

  /** Update one row; records only the fields that actually changed. Returns the updated row. */
  async update<T extends Row>(name: TableName, key: Row, patch: Row): Promise<T> {
    const { table } = TABLES[name];
    const [before] = (await this.db.select().from(table as never).where(whereKey(name, key)).for('update')) as Row[];
    if (!before) throw new Error(`${name} row not found for update`);
    const [after] = (await this.db
      .update(table)
      .set(patch as never)
      .where(whereKey(name, key))
      .returning()) as unknown as T[];
    const changed = Object.keys(patch).filter((k) => !TIMESTAMP_FIELDS.has(k) && !sameValue(before[k], (after as Row)[k]));
    if (changed.length > 0) {
      this.pending.push({
        table: name,
        op: 'update',
        key,
        before: snapshot(Object.fromEntries(changed.map((k) => [k, before[k]]))),
        after: snapshot(Object.fromEntries(changed.map((k) => [k, (after as Row)[k]]))),
      });
    }
    return after!;
  }

  async delete(name: TableName, key: Row): Promise<void> {
    const { table } = TABLES[name];
    const [before] = (await this.db.delete(table).where(whereKey(name, key)).returning()) as Row[];
    if (before) this.pending.push({ table: name, op: 'delete', key, before: snapshot(before) });
  }

  /**
   * Write a state event holding every change made since the last commit.
   * Returns the event id, or null if nothing changed (no event is written).
   */
  async commit(event: RecordedEvent): Promise<{ id: number } | null> {
    const changes = this.pending;
    this.pending = [];
    if (changes.length === 0 && !event.always) return null;
    const [row] = await this.db
      .insert(stateEvents)
      .values({
        campaignId: this.campaignId,
        turnNumber: this.turnNumber,
        eventType: event.eventType,
        humanReadable: event.humanReadable,
        payload: { details: event.details, changes },
      })
      .returning({ id: stateEvents.id });
    return row!;
  }

  /** Throw away uncommitted changes (the enclosing transaction is responsible for rolling back rows). */
  discard(): void {
    this.pending = [];
  }
}

/** Reverse a list of changes, last first. Used by undo. */
export async function revertChanges(db: Db, changes: RowChange[]): Promise<void> {
  for (const change of [...changes].reverse()) {
    const { table } = TABLES[change.table];
    switch (change.op) {
      case 'insert':
        await db.delete(table).where(whereKey(change.table, change.key));
        break;
      case 'update':
        await db
          .update(table)
          .set(revive(change.before) as never)
          .where(whereKey(change.table, change.key));
        break;
      case 'delete':
        await db.insert(table).values(revive(change.before) as never);
        break;
    }
  }
}
