import { asc, desc, eq, sql } from 'drizzle-orm';
import type { FastifyInstance } from 'fastify';
import type { CampaignState } from '@narrator/shared';
import { campaigns, inventoryItems, locations, missions, npcs, playerCharacter, relationships, skills } from '../db/schema';

/** The play screen's sidebar snapshot. Registered inside the verified-campaign scope. */
export function registerStateRoutes(app: FastifyInstance): void {
  const { db } = app;

  app.get('/state', async (request): Promise<CampaignState> => {
    const cid = request.campaignId;
    const [campaign] = await db
      .select({ id: campaigns.id, name: campaigns.name, currencyName: campaigns.currencyName, turnCount: campaigns.turnCount })
      .from(campaigns)
      .where(eq(campaigns.id, cid));
    const [character] = await db.select().from(playerCharacter).where(eq(playerCharacter.campaignId, cid));
    const [location] = character?.currentLocationId
      ? await db
          .select({ id: locations.id, name: locations.name, description: locations.description })
          .from(locations)
          .where(eq(locations.id, character.currentLocationId))
      : [];

    const [skillRows, itemRows, relRows, missionRows] = await Promise.all([
      db.select().from(skills).where(eq(skills.campaignId, cid)).orderBy(desc(skills.level), asc(skills.name)),
      db.select().from(inventoryItems).where(eq(inventoryItems.campaignId, cid)).orderBy(desc(inventoryItems.equipped), asc(inventoryItems.name)),
      db
        .select({ rel: relationships, npcName: npcs.name, npcAlive: npcs.alive })
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
    ]);

    // Fastify serializes Dates to ISO strings, matching the DTOs.
    return {
      campaign: campaign!,
      character: character ?? null,
      location: location ?? null,
      skills: skillRows,
      items: itemRows,
      relationships: relRows.map((r) => ({ ...r.rel, npcName: r.npcName, npcAlive: r.npcAlive })),
      missions: missionRows.map((m) => ({ ...m.mission, giverName: m.giverName })),
    } as unknown as CampaignState;
  });
}
