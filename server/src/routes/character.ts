import { asc, desc, eq } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { CharacterSheetSave, CharacterUpdate, CharacterUpsert, type CharacterSheet } from '@narrator/shared';
import type { Db } from '../db/client';
import { assertRefsInCampaign } from '../db/refs';
import { inventoryItems, playerCharacter, skills } from '../db/schema';
import { withManualEdit } from '../engine/manual';
import type { Mutator } from '../engine/mutator';
import { badRequest, notFound, parseWith } from '../http/errors';

const SYNC_TABLES = {
  skills: { table: skills, label: 'Skill' },
  inventory_items: { table: inventoryItems, label: 'Item' },
} as const;

/**
 * Make a campaign's rows in a table match `incoming`: rows with an id are updated, rows without
 * are inserted, and rows not mentioned are deleted. Deletes run first so a removed name can be reused.
 */
async function syncRows(
  mutator: Mutator,
  name: keyof typeof SYNC_TABLES,
  incoming: ({ id?: string; name: string } & Record<string, unknown>)[],
): Promise<void> {
  const { table, label } = SYNC_TABLES[name];
  const existing = await mutator.db.select({ id: table.id }).from(table).where(eq(table.campaignId, mutator.campaignId));
  const existingIds = new Set(existing.map((r) => r.id));
  for (const row of incoming) {
    if (row.id && !existingIds.has(row.id)) {
      throw badRequest(`${label} "${row.name}" no longer exists; reload and try again`);
    }
  }
  const kept = new Set(incoming.flatMap((r) => (r.id ? [r.id] : [])));
  for (const id of existingIds) if (!kept.has(id)) await mutator.delete(name, { id });
  for (const { id, ...data } of incoming) {
    if (id) await mutator.update(name, { id }, data);
    else await mutator.insert(name, data);
  }
}

/** Create the character, or update it through the mutator so the edit is logged. */
async function upsertCharacter(mutator: Mutator, data: Record<string, unknown>) {
  const [existing] = await mutator.db
    .select({ campaignId: playerCharacter.campaignId })
    .from(playerCharacter)
    .where(eq(playerCharacter.campaignId, mutator.campaignId));
  return existing
    ? mutator.update<typeof playerCharacter.$inferSelect>('player_character', { campaignId: mutator.campaignId }, data)
    : mutator.insert<typeof playerCharacter.$inferSelect>('player_character', data);
}

async function loadSheet(db: Db, campaignId: string): Promise<CharacterSheet> {
  const [character] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));
  const skillRows = await db
    .select()
    .from(skills)
    .where(eq(skills.campaignId, campaignId))
    .orderBy(desc(skills.level), asc(skills.name));
  const itemRows = await db
    .select()
    .from(inventoryItems)
    .where(eq(inventoryItems.campaignId, campaignId))
    .orderBy(desc(inventoryItems.equipped), asc(inventoryItems.name));
  // Fastify serializes Dates to ISO strings, matching the DTOs.
  return { character: character ?? null, skills: skillRows, items: itemRows } as unknown as CharacterSheet;
}

/** Player character routes. Registered inside the verified-campaign scope. */
export function registerCharacterRoutes(app: FastifyInstance): void {
  const { db } = app;

  app.get('/character', async (request) => {
    const [row] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, request.campaignId));
    if (!row) throw notFound('Character');
    return row;
  });

  app.put('/character', async (request) => {
    const { campaignId } = request;
    const data = parseWith(CharacterUpsert, request.body);
    await assertRefsInCampaign(db, campaignId, data);
    return withManualEdit(db, campaignId, (mutator) => upsertCharacter(mutator, data));
  });

  app.patch('/character', async (request) => {
    const { campaignId } = request;
    const data = parseWith(CharacterUpdate, request.body);
    await assertRefsInCampaign(db, campaignId, data);
    const [existing] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, campaignId));
    if (!existing) throw notFound('Character');
    if (Object.keys(data).length === 0) return existing;
    return withManualEdit(db, campaignId, (mutator) => mutator.update('player_character', { campaignId }, data));
  });

  // The character builder reads and saves the character, skills, and inventory as one sheet.
  app.get('/character/sheet', async (request) => loadSheet(db, request.campaignId));

  app.put('/character/sheet', async (request) => {
    const { campaignId } = request;
    const sheet = parseWith(CharacterSheetSave, request.body);
    await assertRefsInCampaign(db, campaignId, sheet.character);
    await withManualEdit(db, campaignId, async (mutator) => {
      await upsertCharacter(mutator, sheet.character);
      await syncRows(mutator, 'skills', sheet.skills);
      await syncRows(mutator, 'inventory_items', sheet.items);
    });
    return loadSheet(db, campaignId);
  });
}
