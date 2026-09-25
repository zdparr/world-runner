import { and, asc, desc, eq, inArray } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import { CharacterSheetSave, CharacterUpdate, CharacterUpsert, type CharacterSheet } from '@narrator/shared';
import type { Db } from '../db/client';
import { assertRefsInCampaign } from '../db/refs';
import { inventoryItems, playerCharacter, skills } from '../db/schema';
import { badRequest, notFound, parseWith } from '../http/errors';

type SyncTable = typeof skills | typeof inventoryItems;

/**
 * Make a campaign's rows in `table` match `incoming`: rows with an id are updated, rows without
 * are inserted, and rows not mentioned are deleted. Deletes run first so a removed name can be reused.
 */
async function syncRows(
  tx: Db,
  table: SyncTable,
  campaignId: string,
  incoming: ({ id?: string; name: string } & Record<string, unknown>)[],
  label: string,
): Promise<void> {
  const existing = await tx.select({ id: table.id }).from(table).where(eq(table.campaignId, campaignId));
  const existingIds = new Set(existing.map((r) => r.id));
  for (const row of incoming) {
    if (row.id && !existingIds.has(row.id)) {
      throw badRequest(`${label} "${row.name}" no longer exists; reload and try again`);
    }
  }
  const kept = new Set(incoming.flatMap((r) => (r.id ? [r.id] : [])));
  const removed = [...existingIds].filter((id) => !kept.has(id));
  if (removed.length > 0) {
    await tx.delete(table).where(and(eq(table.campaignId, campaignId), inArray(table.id, removed)));
  }
  for (const { id, ...data } of incoming) {
    // Drizzle can't narrow the union of two tables, hence the casts.
    if (id) {
      await tx
        .update(table)
        .set(data as never)
        .where(and(eq(table.id, id), eq(table.campaignId, campaignId)));
    } else {
      await tx.insert(table).values({ ...data, campaignId } as never);
    }
  }
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
    const [row] = await db
      .insert(playerCharacter)
      .values({ ...data, campaignId })
      .onConflictDoUpdate({ target: playerCharacter.campaignId, set: data })
      .returning();
    return row;
  });

  app.patch('/character', async (request) => {
    const { campaignId } = request;
    const data = parseWith(CharacterUpdate, request.body);
    await assertRefsInCampaign(db, campaignId, data);
    const [row] = await db
      .update(playerCharacter)
      .set(data)
      .where(eq(playerCharacter.campaignId, campaignId))
      .returning();
    if (!row) throw notFound('Character');
    return row;
  });

  // The character builder reads and saves the character, skills, and inventory as one sheet.
  app.get('/character/sheet', async (request) => loadSheet(db, request.campaignId));

  app.put('/character/sheet', async (request) => {
    const { campaignId } = request;
    const sheet = parseWith(CharacterSheetSave, request.body);
    await assertRefsInCampaign(db, campaignId, sheet.character);
    await db.transaction(async (tx) => {
      await tx
        .insert(playerCharacter)
        .values({ ...sheet.character, campaignId })
        .onConflictDoUpdate({ target: playerCharacter.campaignId, set: sheet.character });
      await syncRows(tx, skills, campaignId, sheet.skills, 'Skill');
      await syncRows(tx, inventoryItems, campaignId, sheet.items, 'Item');
    });
    return loadSheet(db, campaignId);
  });
}
