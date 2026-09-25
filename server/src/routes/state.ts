import { and, asc, desc, eq, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { CampaignState, MapLocation, MemoryReport } from '@narrator/shared';
import { HttpError } from '../http/errors';
import { campaigns, inventoryItems, locations, missions, npcs, playerCharacter, relationships, skills, stateEvents } from '../db/schema';
import type { RowChange } from '../engine/mutator';

/** The play screen's sidebar snapshot, and on-demand memory upkeep. Registered inside the verified-campaign scope. */
export function registerStateRoutes(app: FastifyInstance): void {
  const { db } = app;

  app.get('/state', async (request): Promise<CampaignState> => {
    const cid = request.campaignId;
    const [campaign] = await db
      .select({
        id: campaigns.id,
        name: campaigns.name,
        currencyName: campaigns.currencyName,
        turnCount: campaigns.turnCount,
        rollingSummary: campaigns.rollingSummary,
        summaryInterval: campaigns.summaryInterval,
      })
      .from(campaigns)
      .where(eq(campaigns.id, cid));
    const [character] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, cid));
    const [location] = character?.currentLocationId
      ? await db
          .select({ id: locations.id, name: locations.name, description: locations.description })
          .from(locations)
          .where(eq(locations.id, character.currentLocationId))
      : [];

    const [skillRows, itemRows, relRows, missionRows, locationRows, moveRows] = await Promise.all([
      db.select().from(skills).where(eq(skills.campaignId, cid)).orderBy(desc(skills.level), asc(skills.name)),
      db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, cid)).orderBy(desc(inventoryItems.equipped), asc(inventoryItems.name)),
      db
        .select({ rel: relationships, npcName: npcs.name, npcAlive: npcs.alive, npcLocationId: npcs.locationId })
        .from(relationships)
        .innerJoin(npcs, eq(npcs.id, relationships.npcId))
        .where(eq(relationships.campaignId, cid))
        .orderBy(desc(relationships.updatedAt)),
      db
        .select({ mission: missions, giverName: npcs.name })
        .from(missions)
        .leftJoin(npcs, eq(npcs.id, missions.giverNpcId))
        .where(eq(missions.campaignId, cid))
        .orderBy(
          sql`array_position(array['active','offered','completed','failed']::mission_status[], ${missions.status})`,
          desc(missions.updatedAt),
        ),
      db.select().from(locations).where(eq(locations.campaignId, cid)).orderBy(asc(locations.createdAt), asc(locations.name)),
      db
        .select({ payload: stateEvents.payload })
        .from(stateEvents)
        .where(and(eq(stateEvents.campaignId, cid), eq(stateEvents.eventType, 'moved')))
        .orderBy(asc(stateEvents.id)),
    ]);

    // Fastify serializes Dates to ISO strings, matching the DTOs.
    return {
      campaign: campaign!,
      memoryEnabled: app.maintenance.enabled,
      character: character ?? null,
      location: location ?? null,
      skills: skillRows,
      items: itemRows,
      relationships: relRows.map((r) => ({ ...r.rel, npcName: r.npcName, npcAlive: r.npcAlive })),
      missions: missionRows.map((m) => ({ ...m.mission, giverName: m.giverName })),
      map: mapOf(locationRows, moveRows, relRows, character?.currentLocationId ?? null),
    } as unknown as CampaignState;
  });

  /**
   * Run memory upkeep now instead of waiting for it to come due: fold everything outside the recent
   * window into the summary and condense any relationship notes that have new entries.
   */
  app.post('/memory', async (request): Promise<MemoryReport> => {
    if (!app.maintenance.enabled) throw new HttpError(503, 'Memory upkeep needs the utility model: set ANTHROPIC_API_KEY on the server');
    try {
      return await app.maintenance.runNow(request.campaignId, { force: true });
    } catch (err) {
      request.log.error({ err }, 'Memory upkeep failed');
      throw new HttpError(502, 'The utility model could not update the memory. Try again in a moment.');
    }
  });
}

/**
 * The map: every location, which ones the character has visited, and the journeys between them.
 * Journeys come from the row changes recorded on each move (currentLocationId before -> after).
 */
function mapOf(
  locationRows: (typeof locations.$inferSelect)[],
  moveRows: { payload: Record<string, unknown> }[],
  relRows: { npcName: string; npcAlive: boolean; npcLocationId: string | null }[],
  currentLocationId: string | null,
): CampaignState['map'] {
  const known = new Set(locationRows.map((l) => l.id));
  const visited = new Set<string>(currentLocationId ? [currentLocationId] : []);
  const travels = new Map<string, { fromId: string; toId: string; count: number }>();
  for (const { payload } of moveRows) {
    const change = ((payload.changes ?? []) as RowChange[]).find((c) => c.op === 'update' && c.table === 'player_character');
    if (change?.op !== 'update') continue;
    const from = change.before.currentLocationId as string | null | undefined;
    const to = change.after.currentLocationId as string | null | undefined;
    if (to && known.has(to)) visited.add(to);
    if (from && known.has(from)) visited.add(from);
    if (!from || !to || from === to || !known.has(from) || !known.has(to)) continue;
    // Undirected: going back and forth is one road.
    const [a, b] = from < to ? [from, to] : [to, from];
    const key = `${a}:${b}`;
    const trip = travels.get(key) ?? { fromId: a, toId: b, count: 0 };
    trip.count++;
    travels.set(key, trip);
  }
  const mapLocations: MapLocation[] = locationRows.map((l) => ({
    id: l.id,
    name: l.name,
    description: l.description,
    tags: l.tags,
    parentLocationId: l.parentLocationId && known.has(l.parentLocationId) ? l.parentLocationId : null,
    visited: visited.has(l.id),
    knownNpcs: relRows.filter((r) => r.npcAlive && r.npcLocationId === l.id).map((r) => r.npcName),
  }));
  return { locations: mapLocations, travels: [...travels.values()] };
}
