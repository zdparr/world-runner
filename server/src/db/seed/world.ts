import { eq, sql } from 'drizzle-orm';
import type { CampaignTemplate, MissionRewards, StatusEffect } from '@narrator/shared';
import type { Db } from '../client';
import { campaigns, inventoryItems, locations, loreEntries, missions, npcs, playerCharacter, relationships, skills } from '../schema';
import { normalizeObjectives } from '../../game/missions';

/**
 * A ready-made world, as plain data. References between records are by name
 * (an NPC's `location`, the mission's `giver`), resolved when the world is inserted.
 */
export interface WorldTemplate extends CampaignTemplate {
  /** Name of the demo campaign `npm run seed` creates from this world. */
  demoCampaignName: string;
  worldBible: string;
  narratorStyle: string;
  currencyName: string;
  locations: { name: string; description: string; tags: string[] }[];
  npcs: { name: string; shortDescription: string; faction: string; location: string; notes: string }[];
  lore: { title: string; keywords: string[]; body: string; alwaysInclude?: boolean }[];
  missions: { title: string; giver: string; description: string; objectives: string[]; rewards: MissionRewards }[];
  /** The pre-made character and everything that belongs to them. */
  character: {
    name: string;
    archetype: string;
    bio: string;
    location: string;
    money: number;
    level: number;
    xp: number;
    hp: number;
    maxHp: number;
    statusEffects?: StatusEffect[];
    skills: { name: string; level: number; xp: number; description: string }[];
    items: { name: string; description: string; quantity?: number; tags: string[]; equipped?: boolean; properties?: Record<string, unknown> }[];
    /** Shared history with NPCs. Only inserted with the pre-made character. */
    relationships: { npc: string; affinity: number; trust: number; status: string; historyNotes: string }[];
  };
}

function lookup<T extends { id: string; name: string }>(rows: T[], kind: string) {
  return (name: string) => {
    const row = rows.find((r) => r.name === name);
    if (!row) throw new Error(`World data references unknown ${kind} "${name}"`);
    return row.id;
  };
}

/** Insert a world as a new campaign. Must run inside a transaction. */
export async function insertWorld(
  tx: Db,
  world: WorldTemplate,
  { name, includeCharacter }: { name: string; includeCharacter: boolean },
): Promise<string> {
  const [campaign] = await tx
    .insert(campaigns)
    .values({ name, worldBible: world.worldBible, narratorStyle: world.narratorStyle, currencyName: world.currencyName })
    .returning({ id: campaigns.id });
  const campaignId = campaign!.id;

  const locId = lookup(
    await tx
      .insert(locations)
      .values(world.locations.map((l) => ({ campaignId, ...l })))
      .returning({ id: locations.id, name: locations.name }),
    'location',
  );

  const npcId = lookup(
    await tx
      .insert(npcs)
      .values(world.npcs.map(({ location, ...n }) => ({ campaignId, ...n, locationId: locId(location) })))
      .returning({ id: npcs.id, name: npcs.name }),
    'NPC',
  );

  await tx.insert(loreEntries).values(world.lore.map((l) => ({ campaignId, alwaysInclude: false, ...l })));

  await tx.insert(missions).values(
    world.missions.map((m) => ({
      campaignId,
      title: m.title,
      giverNpcId: npcId(m.giver),
      status: 'offered' as const,
      description: m.description,
      objectives: normalizeObjectives(m.objectives.map((text) => ({ text }))),
      rewards: m.rewards,
    })),
  );

  if (includeCharacter) {
    const { skills: skillRows, items, relationships: rels, location, statusEffects = [], ...pc } = world.character;
    await tx.insert(playerCharacter).values({ campaignId, ...pc, statusEffects, currentLocationId: locId(location) });
    if (skillRows.length > 0) await tx.insert(skills).values(skillRows.map((s) => ({ campaignId, ...s })));
    if (items.length > 0) await tx.insert(inventoryItems).values(items.map((i) => ({ campaignId, ...i })));
    // These histories belong to the pre-made character; a custom character starts with none.
    if (rels.length > 0) {
      await tx.insert(relationships).values(rels.map(({ npc, ...r }) => ({ campaignId, npcId: npcId(npc), ...r })));
    }
  }

  // Make the new campaign sort first in the picker.
  await tx.update(campaigns).set({ updatedAt: sql`now()` }).where(eq(campaigns.id, campaignId));
  return campaignId;
}
