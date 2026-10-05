import { and, eq, getTableColumns, type SQL } from 'drizzle-orm';
import type { PgColumn, PgTable } from 'drizzle-orm/pg-core';
import type { FastifyInstance } from 'fastify';
import type { z } from 'zod';
import type { Db } from '../db/client';
import { assertRefsInCampaign } from '../db/refs';
import { withManualEdit } from '../engine/manual';
import type { TableName } from '../engine/mutator';
import { notFound, parseId, parseWith } from '../http/errors';

type CampaignScopedTable = PgTable & { id: PgColumn; campaignId: PgColumn };
type Row = Record<string, unknown>;

export interface CollectionDef {
  /** URL segment under /api/campaigns/:campaignId/ */
  path: string;
  /** Singular, for error messages. */
  label: string;
  table: CampaignScopedTable;
  /** The same table's name in the engine's Mutator, so hand edits are logged and undoable. */
  mutatorTable: TableName;
  create: z.ZodType<Row>;
  update: z.ZodType<Row>;
  orderBy: (PgColumn | SQL)[];
  /** Columns never returned by the API (e.g. tsvector search columns). */
  hidden?: string[];
  /** Normalize or enrich validated input before it is written. */
  prepare?: (data: Row, existing: Row | null) => Row;
  /** Extra invariants beyond zod and campaign-scoped references. */
  validate?: (ctx: { db: Db; campaignId: string; id: string | null; data: Row }) => Promise<void>;
}

/**
 * Registers list/create/get/patch/delete for a campaign-scoped table.
 * Must be registered inside a scope where `request.campaignId` has already been verified.
 * Writes are logged as player corrections once play has started (see withManualEdit).
 */
export function registerCollection(app: FastifyInstance, def: CollectionDef): void {
  const { table, label } = def;
  const hidden = new Set(def.hidden ?? []);
  const columns = Object.fromEntries(
    Object.entries(getTableColumns(table)).filter(([key]) => !hidden.has(key)),
  ) as Record<string, PgColumn>;
  const base = `/${def.path}`;
  const visible = (row: Row) => Object.fromEntries(Object.entries(row).filter(([key]) => !hidden.has(key)));

  // Drizzle's builders can't type a table that is only known generically, hence the `as never` casts.
  const scoped = (campaignId: string, id?: string) =>
    id ? and(eq(table.campaignId, campaignId), eq(table.id, id)) : eq(table.campaignId, campaignId);

  async function findOne(db: Db, campaignId: string, id: string): Promise<Row> {
    const [row] = await db.select(columns).from(table as never).where(scoped(campaignId, id)).limit(1);
    if (!row) throw notFound(label);
    return row as Row;
  }

  app.get(base, async (request) => {
    return app.db
      .select(columns)
      .from(table as never)
      .where(scoped(request.campaignId))
      .orderBy(...def.orderBy);
  });

  app.post(base, async (request, reply) => {
    const { campaignId } = request;
    let data = parseWith(def.create, request.body);
    if (def.prepare) data = def.prepare(data, null);
    await assertRefsInCampaign(app.db, campaignId, data);
    await def.validate?.({ db: app.db, campaignId, id: null, data });
    const row = await withManualEdit(app.db, campaignId, (mutator) => mutator.insert<Row>(def.mutatorTable, data));
    return reply.code(201).send(visible(row));
  });

  app.get<{ Params: { id: string } }>(`${base}/:id`, async (request) => {
    return findOne(app.db, request.campaignId, parseId(request.params.id, label));
  });

  app.patch<{ Params: { id: string } }>(`${base}/:id`, async (request) => {
    const { campaignId } = request;
    const id = parseId(request.params.id, label);
    let data = parseWith(def.update, request.body);
    const existing = await findOne(app.db, campaignId, id);
    if (def.prepare) data = def.prepare(data, existing);
    await assertRefsInCampaign(app.db, campaignId, data);
    await def.validate?.({ db: app.db, campaignId, id, data });
    if (Object.keys(data).length === 0) return existing;
    const row = await withManualEdit(app.db, campaignId, (mutator) => mutator.update<Row>(def.mutatorTable, { id }, data));
    return visible(row);
  });

  app.delete<{ Params: { id: string } }>(`${base}/:id`, async (request, reply) => {
    const { campaignId } = request;
    const id = parseId(request.params.id, label);
    await findOne(app.db, campaignId, id);
    await withManualEdit(app.db, campaignId, (mutator) => mutator.delete(def.mutatorTable, { id }));
    return reply.code(204).send();
  });
}
