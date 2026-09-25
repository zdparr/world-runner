import { and, eq } from 'drizzle-orm';
import type { Db } from './client';
import { locations, npcs } from './schema';
import { badRequest } from '../http/errors';

// Foreign-key fields that point at other campaign-scoped rows. Postgres enforces existence;
// this additionally enforces that the target belongs to the same campaign.
const REFS = {
  currentLocationId: { table: locations, label: 'location' },
  locationId: { table: locations, label: 'location' },
  parentLocationId: { table: locations, label: 'location' },
  npcId: { table: npcs, label: 'NPC' },
  giverNpcId: { table: npcs, label: 'NPC' },
} as const;

export async function assertRefsInCampaign(db: Db, campaignId: string, data: Record<string, unknown>): Promise<void> {
  for (const [field, { table, label }] of Object.entries(REFS)) {
    const id = data[field];
    if (typeof id !== 'string') continue;
    const [row] = await db
      .select({ id: table.id })
      .from(table)
      .where(and(eq(table.id, id), eq(table.campaignId, campaignId)))
      .limit(1);
    if (!row) throw badRequest(`${field}: no such ${label} in this campaign`);
  }
}

/** Reject a parent assignment that would make a location its own ancestor. */
export async function assertNoLocationCycle(db: Db, locationId: string, parentId: string | null): Promise<void> {
  let current = parentId;
  for (let depth = 0; current; depth++) {
    if (current === locationId || depth > 100) throw badRequest('parentLocationId: a location cannot be inside itself');
    const [row] = await db
      .select({ parent: locations.parentLocationId })
      .from(locations)
      .where(eq(locations.id, current))
      .limit(1);
    current = row?.parent ?? null;
  }
}
