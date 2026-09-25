import { and, desc, eq, ne, sql } from 'drizzle-orm';
import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  CHECK_XP,
  DIFFICULTIES,
  MISSION_STATUSES,
  MissionRewards,
  resolveCheck,
  skillXpToNext,
  type MissionObjective,
  type StatusEffect,
} from '@narrator/shared';
import { inventoryItems, locations, loreEntries, messages, missions, npcs, relationships, skills, stateEvents } from '../db/schema';
import { normalizeObjectives } from '../game/missions';
import {
  addItem,
  applyCharacterXp,
  applyMoney,
  applyRelationship,
  applySkillXp,
  clamp,
  findItem,
  findNpc,
  findSkill,
  getCharacter,
  type EngineContext,
} from './game';
import { ToolError, findByName, findOptional } from './lookup';
import { rollD20 } from './rng';

// ---------------------------------------------------------------- tool plumbing

export interface ToolDef<S extends z.ZodType = z.ZodType> {
  name: string;
  description: string;
  input: S;
  kind: 'read' | 'write';
  run: (ctx: EngineContext, input: z.output<S>) => Promise<unknown>;
}

function tool<S extends z.ZodType>(def: ToolDef<S>): ToolDef {
  return def as unknown as ToolDef;
}

const Name = z.string().trim().min(1).max(120);
const Reason = z.string().trim().max(300).describe('Short in-story reason, shown in the change log');
const Tags = z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20);

type LocationRow = typeof locations.$inferSelect;
type MissionRow = typeof missions.$inferSelect;

const findLocation = (ctx: EngineContext, name: string) =>
  findByName<LocationRow>(ctx.db, {
    table: locations,
    nameColumn: locations.name,
    campaignId: ctx.campaign.id,
    query: name,
    label: 'location',
  });

const findMission = (ctx: EngineContext, title: string) =>
  findByName<MissionRow>(ctx.db, {
    table: missions,
    nameColumn: missions.title,
    campaignId: ctx.campaign.id,
    query: title,
    label: 'mission',
  });

function itemView(i: typeof inventoryItems.$inferSelect) {
  return {
    name: i.name,
    quantity: i.quantity,
    description: i.description,
    tags: i.tags,
    equipped: i.equipped,
    ...(Object.keys(i.properties).length > 0 ? { properties: i.properties } : {}),
  };
}

async function locationView(ctx: EngineContext, loc: LocationRow) {
  const [parent] = loc.parentLocationId
    ? await ctx.db.select({ name: locations.name }).from(locations).where(eq(locations.id, loc.parentLocationId))
    : [];
  const children = await ctx.db.select({ name: locations.name }).from(locations).where(eq(locations.parentLocationId, loc.id));
  const here = await ctx.db
    .select({ name: npcs.name, shortDescription: npcs.shortDescription, alive: npcs.alive })
    .from(npcs)
    .where(eq(npcs.locationId, loc.id));
  return {
    name: loc.name,
    description: loc.description,
    tags: loc.tags,
    ...(parent ? { insideOf: parent.name } : {}),
    ...(children.length > 0 ? { contains: children.map((c) => c.name) } : {}),
    npcsHere: here.map((n) => ({ name: n.name, shortDescription: n.shortDescription, ...(n.alive ? {} : { dead: true }) })),
  };
}

function missionView(m: MissionRow, giver: string | null) {
  return {
    title: m.title,
    status: m.status,
    description: m.description,
    giver,
    objectives: m.objectives,
    rewards: m.rewards,
  };
}

async function npcName(ctx: EngineContext, id: string | null) {
  if (!id) return null;
  const [row] = await ctx.db.select({ name: npcs.name }).from(npcs).where(eq(npcs.id, id));
  return row?.name ?? null;
}

// ---------------------------------------------------------------- read tools

const readTools: ToolDef[] = [
  tool({
    name: 'get_inventory',
    kind: 'read',
    description:
      "Look up what the player character is carrying. Call this before narrating anything that depends on the character's possessions. Filters are optional; with none, returns everything.",
    input: z.object({
      tags: Tags.optional().describe('Only items with any of these tags, e.g. ["weapon"]'),
      name_contains: z.string().trim().max(120).optional(),
      equipped_only: z.boolean().optional(),
    }),
    run: async (ctx, input) => {
      const rows = await ctx.db
        .select()
        .from(inventoryItems)
        .where(eq(inventoryItems.campaignId, ctx.campaign.id))
        .orderBy(desc(inventoryItems.equipped), inventoryItems.name);
      const needle = input.name_contains?.toLowerCase();
      const items = rows.filter(
        (i) =>
          (!input.equipped_only || i.equipped) &&
          (!needle || i.name.toLowerCase().includes(needle)) &&
          (!input.tags?.length || i.tags.some((t) => input.tags!.includes(t))),
      );
      return { items: items.map(itemView), ...(items.length === 0 ? { note: 'No matching items.' } : {}) };
    },
  }),

  tool({
    name: 'get_money',
    kind: 'read',
    description: "Look up the player character's current money. Call this before any purchase, bribe, or wager.",
    input: z.object({}),
    run: async (ctx) => {
      const pc = await getCharacter(ctx);
      return { money: pc.money, currency: ctx.campaign.currencyName };
    },
  }),

  tool({
    name: 'get_skills',
    kind: 'read',
    description: "Look up the player character's skills and levels. Pass names to fetch specific skills, or omit for all.",
    input: z.object({ names: z.array(Name).max(20).optional() }),
    run: async (ctx, input) => {
      const rows = await ctx.db.select().from(skills).where(eq(skills.campaignId, ctx.campaign.id)).orderBy(desc(skills.level));
      const wanted = input.names?.map((n) => n.toLowerCase());
      const picked = wanted ? rows.filter((s) => wanted.some((w) => s.name.toLowerCase().includes(w))) : rows;
      const missing = wanted?.filter((w) => !rows.some((s) => s.name.toLowerCase().includes(w))) ?? [];
      return {
        skills: picked.map((s) => ({ name: s.name, level: s.level, xp: s.xp, xpToNext: skillXpToNext(s.level), description: s.description })),
        ...(missing.length > 0 ? { untrained: missing } : {}),
      };
    },
  }),

  tool({
    name: 'get_relationship',
    kind: 'read',
    description:
      "Look up how one NPC feels about the player character: affinity (-100 hate .. 100 love), trust (-100 .. 100), a status label, and notes on their shared history. Call this before a meaningful interaction with an NPC whose relationship isn't already in context.",
    input: z.object({ npc_name: Name }),
    run: async (ctx, input) => {
      const npc = await findNpc(ctx, input.npc_name);
      const [rel] = await ctx.db.select().from(relationships).where(eq(relationships.npcId, npc.id));
      if (!rel) return { npc: npc.name, affinity: 0, trust: 0, status: 'stranger', historyNotes: '', note: 'No history with this NPC yet.' };
      return { npc: npc.name, affinity: rel.affinity, trust: rel.trust, status: rel.status, historyNotes: rel.historyNotes };
    },
  }),

  tool({
    name: 'get_npc',
    kind: 'read',
    description:
      "Look up an NPC: description, faction, where they are, whether they're alive, and GM notes. GM notes may hold secrets; don't reveal them unless the player discovers them in the story.",
    input: z.object({ name: Name }),
    run: async (ctx, input) => {
      const npc = await findNpc(ctx, input.name);
      const [loc] = npc.locationId ? await ctx.db.select({ name: locations.name }).from(locations).where(eq(locations.id, npc.locationId)) : [];
      return {
        name: npc.name,
        shortDescription: npc.shortDescription,
        faction: npc.faction,
        location: loc?.name ?? null,
        alive: npc.alive,
        gmNotes: npc.notes,
      };
    },
  }),

  tool({
    name: 'get_location',
    kind: 'read',
    description: 'Look up a location: description, what it is inside of or contains, and which NPCs are there.',
    input: z.object({ name: Name }),
    run: async (ctx, input) => locationView(ctx, await findLocation(ctx, input.name)),
  }),

  tool({
    name: 'search_lore',
    kind: 'read',
    description:
      'Search the world lore (history, factions, religion, customs, notable things) by keywords. Use it when the story touches something the world bible and current context do not cover.',
    input: z.object({ query: z.string().trim().min(2).max(200) }),
    run: async (ctx, input) => {
      const words = input.query.toLowerCase().split(/\W+/).filter((w) => w.length >= 3);
      const rows = await ctx.db
        .select({
          title: loreEntries.title,
          body: loreEntries.body,
          rank: sql<number>`ts_rank(${loreEntries.searchVector}, websearch_to_tsquery('english', ${input.query}))
            + (case when ${loreEntries.keywords} && ${words}::text[] then 1 else 0 end)`,
        })
        .from(loreEntries)
        .where(
          and(
            eq(loreEntries.campaignId, ctx.campaign.id),
            sql`(${loreEntries.searchVector} @@ websearch_to_tsquery('english', ${input.query})
              or ${loreEntries.keywords} && ${words}::text[]
              or ${loreEntries.title} ilike ${`%${input.query}%`})`,
          ),
        )
        .orderBy(sql`3 desc`) // the rank column
        .limit(5);
      return rows.length > 0 ? { entries: rows.map(({ title, body }) => ({ title, body })) } : { entries: [], note: 'No lore matches. You may invent details consistent with the world bible.' };
    },
  }),

  tool({
    name: 'get_mission',
    kind: 'read',
    description:
      'Look up missions. With a title, returns that mission in full (objectives with ids, rewards). Without one, lists every offered and active mission.',
    input: z.object({ title: z.string().trim().max(120).optional() }),
    run: async (ctx, input) => {
      if (input.title) {
        const m = await findMission(ctx, input.title);
        return missionView(m, await npcName(ctx, m.giverNpcId));
      }
      const rows = await ctx.db
        .select()
        .from(missions)
        .where(and(eq(missions.campaignId, ctx.campaign.id), sql`${missions.status} in ('offered', 'active')`));
      return {
        missions: await Promise.all(
          rows.map(async (m) => ({
            title: m.title,
            status: m.status,
            giver: await npcName(ctx, m.giverNpcId),
            nextObjective: m.objectives.find((o) => !o.done)?.text ?? null,
          })),
        ),
      };
    },
  }),

  tool({
    name: 'search_past_events',
    kind: 'read',
    description:
      'Search the history of this campaign: past state changes (money, items, relationships, missions) and older story messages that may no longer be in context. Use it when the player refers to something from long ago.',
    input: z.object({ query: z.string().trim().min(2).max(200) }),
    run: async (ctx, input) => {
      const q = sql`websearch_to_tsquery('english', ${input.query})`;
      const events = await ctx.db
        .select({ turn: stateEvents.turnNumber, text: stateEvents.humanReadable })
        .from(stateEvents)
        .where(and(eq(stateEvents.campaignId, ctx.campaign.id), sql`${stateEvents.searchVector} @@ ${q}`))
        .orderBy(sql`ts_rank(${stateEvents.searchVector}, ${q}) desc`)
        .limit(8);
      const story = await ctx.db
        .select({ turn: messages.turnNumber, role: messages.role, content: messages.content })
        .from(messages)
        .where(and(eq(messages.campaignId, ctx.campaign.id), ne(messages.turnNumber, ctx.turnNumber), sql`${messages.searchVector} @@ ${q}`))
        .orderBy(sql`ts_rank(${messages.searchVector}, ${q}) desc`)
        .limit(5);
      return {
        stateChanges: events,
        storyExcerpts: story.map((m) => ({ turn: m.turn, role: m.role, excerpt: m.content.length > 600 ? `${m.content.slice(0, 600)}…` : m.content })),
      };
    },
  }),
];

// ---------------------------------------------------------------- write tools

const writeTools: ToolDef[] = [
  tool({
    name: 'adjust_money',
    kind: 'write',
    description:
      'Change the player character\'s money: positive to gain, negative to spend or lose. Rejected (nothing changes) if it would go below zero; narrate that the character can\'t afford it.',
    input: z.object({ delta: z.number().int().min(-1_000_000).max(1_000_000).refine((n) => n !== 0, 'delta cannot be 0'), reason: Reason }),
    run: (ctx, input) => applyMoney(ctx, input.delta, input.reason),
  }),

  tool({
    name: 'add_item',
    kind: 'write',
    description: 'Give the player character an item. Items stack by name: adding an item they already have increases its quantity.',
    input: z.object({
      name: Name,
      quantity: z.number().int().min(1).max(10_000).default(1),
      description: z.string().trim().max(1000).default(''),
      tags: Tags.default([]).describe('Lowercase categories, e.g. ["weapon", "blade"]'),
    }),
    run: (ctx, input) => addItem(ctx, input),
  }),

  tool({
    name: 'remove_item',
    kind: 'write',
    description: 'Take items away from the player character: spent, consumed, lost, sold, given away, broken. Rejected if they have fewer than that.',
    input: z.object({ name: Name, quantity: z.number().int().min(1).max(10_000).default(1), reason: Reason }),
    run: async (ctx, input) => {
      const item = await findItem(ctx, input.name);
      if (item.quantity < input.quantity) {
        throw new ToolError(`The character only has ${item.quantity} ${item.name}. Nothing was removed.`);
      }
      const left = item.quantity - input.quantity;
      if (left === 0) await ctx.mutator.delete('inventory_items', { id: item.id });
      else await ctx.mutator.update('inventory_items', { id: item.id }, { quantity: left });
      await ctx.record({
        eventType: 'item_removed',
        humanReadable: `-${input.quantity} ${item.name}${input.reason ? ` (${input.reason})` : ''}`,
        details: { item: item.name, quantity: input.quantity, remaining: left },
      });
      return { item: item.name, removed: input.quantity, remaining: left };
    },
  }),

  tool({
    name: 'equip_item',
    kind: 'write',
    description: 'Equip or unequip an item the player character carries (weapon drawn, armor worn, tool in hand).',
    input: z.object({ name: Name, equipped: z.boolean() }),
    run: async (ctx, input) => {
      const item = await findItem(ctx, input.name);
      await ctx.mutator.update('inventory_items', { id: item.id }, { equipped: input.equipped });
      await ctx.record({
        eventType: 'item_equipped',
        humanReadable: `${input.equipped ? 'Equipped' : 'Unequipped'} ${item.name}`,
        details: { item: item.name, equipped: input.equipped },
      });
      return { item: item.name, equipped: input.equipped };
    },
  }),

  tool({
    name: 'grant_skill_xp',
    kind: 'write',
    description:
      'Award skill XP for practice, training, or notable use (skill_check already awards a little XP on its own). Level-ups are handled for you. A skill the character lacks is learned at level 0.',
    input: z.object({ skill_name: Name, amount: z.number().int().min(1).max(500), reason: Reason }),
    run: (ctx, input) => applySkillXp(ctx, input.skill_name, input.amount, input.reason),
  }),

  tool({
    name: 'grant_xp',
    kind: 'write',
    description:
      'Award character XP for overcoming challenges, clever play, or story milestones (typically 10-50; mission rewards grant their own). Level-ups, and the max HP they add, are handled for you.',
    input: z.object({ amount: z.number().int().min(1).max(5000), reason: Reason }),
    run: (ctx, input) => applyCharacterXp(ctx, input.amount, input.reason),
  }),

  tool({
    name: 'adjust_hp',
    kind: 'write',
    description: 'Damage (negative) or heal (positive) the player character. HP is clamped between 0 and max HP. At 0 the character is down.',
    input: z.object({ delta: z.number().int().min(-10_000).max(10_000).refine((n) => n !== 0, 'delta cannot be 0'), reason: Reason }),
    run: async (ctx, input) => {
      const pc = await getCharacter(ctx);
      const hp = clamp(pc.hp + input.delta, 0, pc.maxHp);
      await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { hp });
      const applied = hp - pc.hp;
      await ctx.record({
        eventType: 'hp',
        humanReadable: `HP ${applied >= 0 ? '+' : ''}${applied} (${pc.hp} → ${hp})${input.reason ? `: ${input.reason}` : ''}`,
        details: { delta: applied, hp, maxHp: pc.maxHp },
      });
      return { hp, maxHp: pc.maxHp, applied, ...(hp === 0 ? { note: 'The character is at 0 HP: down, unconscious, or dying.' } : {}) };
    },
  }),

  tool({
    name: 'update_status_effect',
    kind: 'write',
    description: 'Add or remove a lasting condition on the player character (poisoned, drunk, exhausted, disguised, wanted by the watch).',
    input: z.object({
      action: z.enum(['add', 'remove']),
      name: Name,
      description: z.string().trim().max(500).default(''),
      turns: z.number().int().min(1).max(1000).optional().describe('How many turns it lasts; omit for until removed'),
    }),
    run: async (ctx, input) => {
      const pc = await getCharacter(ctx);
      const others = pc.statusEffects.filter((s) => s.name.toLowerCase() !== input.name.toLowerCase());
      if (input.action === 'remove' && others.length === pc.statusEffects.length) {
        throw new ToolError(`The character has no status effect named "${input.name}". Current: ${pc.statusEffects.map((s) => s.name).join(', ') || 'none'}.`);
      }
      const effect: StatusEffect = { name: input.name, description: input.description, turnsRemaining: input.turns ?? null };
      const statusEffects = input.action === 'add' ? [...others, effect] : others;
      await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { statusEffects });
      await ctx.record({
        eventType: 'status',
        humanReadable: `${input.action === 'add' ? 'Now' : 'No longer'} ${input.name}`,
        details: { action: input.action, name: input.name },
      });
      return { statusEffects };
    },
  }),

  tool({
    name: 'adjust_relationship',
    kind: 'write',
    description:
      "Record how an interaction changed an NPC's feelings toward the player character. Use small deltas (1-5) for ordinary exchanges and larger ones (10-25) for significant moments. Values are clamped to -100..100. Always include a short note of what happened; it becomes part of what the NPC remembers.",
    input: z.object({
      npc_name: Name,
      affinity_delta: z.number().int().min(-100).max(100).default(0),
      trust_delta: z.number().int().min(-100).max(100).default(0),
      note: z.string().trim().min(1).max(300),
      status: z.string().trim().max(40).optional().describe('New label if the relationship changed kind, e.g. "ally", "rival", "owes you"'),
    }),
    run: (ctx, input) => applyRelationship(ctx, input.npc_name, input.affinity_delta, input.trust_delta, input.note, input.status),
  }),

  tool({
    name: 'create_npc',
    kind: 'write',
    description: 'Add a named NPC to the world so they persist. Use it when a new character becomes someone the player may meet again.',
    input: z.object({
      name: Name,
      short_description: z.string().trim().min(1).max(500),
      faction: z.string().trim().max(120).default(''),
      location_name: Name.optional(),
      notes: z.string().trim().max(2000).default('').describe('GM-only: motives, secrets'),
    }),
    run: async (ctx, input) => {
      if (await findExactNpc(ctx, input.name)) throw new ToolError(`An NPC named "${input.name}" already exists. Use get_npc or update_npc.`);
      const loc = input.location_name ? await findLocation(ctx, input.location_name) : null;
      await ctx.mutator.insert('npcs', {
        name: input.name,
        shortDescription: input.short_description,
        faction: input.faction,
        locationId: loc?.id ?? null,
        notes: input.notes,
      });
      await ctx.record({ eventType: 'npc_created', humanReadable: `Met ${input.name}`, details: { npc: input.name } });
      return { created: input.name, location: loc?.name ?? null };
    },
  }),

  tool({
    name: 'update_npc',
    kind: 'write',
    description: 'Change an NPC: move them, mark them dead (or alive), update their description, or append GM notes about new developments.',
    input: z.object({
      name: Name,
      location_name: Name.nullable().optional().describe('null = whereabouts unknown'),
      alive: z.boolean().optional(),
      short_description: z.string().trim().min(1).max(500).optional(),
      append_notes: z.string().trim().max(1000).optional(),
    }),
    run: async (ctx, input) => {
      const npc = await findNpc(ctx, input.name);
      const patch: Record<string, unknown> = {};
      if (input.location_name !== undefined) patch.locationId = input.location_name ? (await findLocation(ctx, input.location_name)).id : null;
      if (input.alive !== undefined) patch.alive = input.alive;
      if (input.short_description) patch.shortDescription = input.short_description;
      if (input.append_notes) patch.notes = [npc.notes, input.append_notes].filter(Boolean).join('\n');
      if (Object.keys(patch).length === 0) throw new ToolError('Nothing to update.');
      await ctx.mutator.update('npcs', { id: npc.id }, patch);
      const died = input.alive === false && npc.alive;
      await ctx.record({
        eventType: 'npc_updated',
        humanReadable: died ? `${npc.name} is dead` : `${npc.name} updated`,
        details: { npc: npc.name, ...(died ? { died: true } : {}) },
      });
      return { updated: npc.name };
    },
  }),

  tool({
    name: 'move_player',
    kind: 'write',
    description:
      'Move the player character to another location when they travel there in the story. Returns the new location, including who is there. Create the location first if it doesn\'t exist.',
    input: z.object({ location_name: Name }),
    run: async (ctx, input) => {
      const loc = await findLocation(ctx, input.location_name);
      await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { currentLocationId: loc.id });
      await ctx.record({ eventType: 'moved', humanReadable: `Moved to ${loc.name}`, details: { location: loc.name } });
      return { nowAt: await locationView(ctx, loc) };
    },
  }),

  tool({
    name: 'create_location',
    kind: 'write',
    description: 'Add a location to the world so it persists (a new district, building, room, or wilderness spot).',
    input: z.object({
      name: Name,
      description: z.string().trim().min(1).max(3000),
      parent_location_name: Name.optional().describe('The larger place this is inside of'),
      tags: Tags.default([]),
    }),
    run: async (ctx, input) => {
      const existing = await findOptional<LocationRow>(ctx.db, {
        table: locations,
        nameColumn: locations.name,
        campaignId: ctx.campaign.id,
        query: input.name,
        label: 'location',
      }).catch(() => null);
      if (existing && existing.name.toLowerCase() === input.name.toLowerCase()) {
        throw new ToolError(`A location named "${existing.name}" already exists.`);
      }
      const parent = input.parent_location_name ? await findLocation(ctx, input.parent_location_name) : null;
      await ctx.mutator.insert('locations', {
        name: input.name,
        description: input.description,
        parentLocationId: parent?.id ?? null,
        tags: input.tags,
      });
      await ctx.record({ eventType: 'location_created', humanReadable: `Discovered ${input.name}`, details: { location: input.name } });
      return { created: input.name, insideOf: parent?.name ?? null };
    },
  }),

  tool({
    name: 'create_mission',
    kind: 'write',
    description:
      'Record a mission when an NPC or event in the story actually offers one. Rewards are granted automatically on completion; scale them to difficulty and risk. Use status "active" only if the player has already accepted.',
    input: z.object({
      title: Name,
      description: z.string().trim().min(1).max(3000),
      giver_npc_name: Name.optional(),
      objectives: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
      rewards: MissionRewards.default({}),
      status: z.enum(['offered', 'active']).default('offered'),
    }),
    run: async (ctx, input) => {
      const giver = input.giver_npc_name ? await findNpc(ctx, input.giver_npc_name) : null;
      const [dup] = await ctx.db
        .select({ id: missions.id })
        .from(missions)
        .where(and(eq(missions.campaignId, ctx.campaign.id), sql`lower(${missions.title}) = lower(${input.title})`));
      if (dup) throw new ToolError(`A mission titled "${input.title}" already exists. Use update_mission.`);
      const objectives = normalizeObjectives(input.objectives.map((text) => ({ text })));
      await ctx.mutator.insert('missions', {
        title: input.title,
        description: input.description,
        giverNpcId: giver?.id ?? null,
        status: input.status,
        objectives,
        rewards: input.rewards,
      });
      await ctx.record({
        eventType: 'mission_created',
        humanReadable: `${input.status === 'active' ? 'Mission started' : 'Mission offered'}: ${input.title}`,
        details: { mission: input.title, status: input.status },
      });
      return { created: input.title, status: input.status, objectives };
    },
  }),

  tool({
    name: 'update_mission',
    kind: 'write',
    description:
      'Update a mission: accept it (status "active"), mark objectives done by id, add new objectives, or resolve it ("completed" or "failed"). Completing a mission automatically grants its listed rewards and returns what was granted; do not grant them again.',
    input: z.object({
      title: Name,
      status: z.enum(MISSION_STATUSES).optional(),
      objective_updates: z.array(z.object({ id: z.string().min(1), done: z.boolean() })).max(30).optional(),
      add_objectives: z.array(z.string().trim().min(1).max(300)).max(10).optional(),
    }),
    run: async (ctx, input) => {
      const m = await findMission(ctx, input.title);
      let objectives: MissionObjective[] = m.objectives;
      for (const u of input.objective_updates ?? []) {
        if (!objectives.some((o) => o.id === u.id)) {
          throw new ToolError(`Mission "${m.title}" has no objective "${u.id}". Objectives: ${m.objectives.map((o) => `${o.id} "${o.text}"`).join('; ')}.`);
        }
        objectives = objectives.map((o) => (o.id === u.id ? { ...o, done: u.done } : o));
      }
      if (input.add_objectives?.length) objectives = normalizeObjectives([...objectives, ...input.add_objectives.map((text) => ({ text }))]);

      const status = input.status ?? m.status;
      const completing = status === 'completed' && !m.rewardsGranted;
      await ctx.mutator.update('missions', { id: m.id }, { objectives, status, ...(completing ? { rewardsGranted: true } : {}) });
      const ticked = (input.objective_updates ?? []).filter((u) => u.done).map((u) => objectives.find((o) => o.id === u.id)!.text);
      const headline =
        status !== m.status
          ? `${status === 'active' ? 'Mission accepted' : status === 'completed' ? 'Mission complete' : status === 'failed' ? 'Mission failed' : 'Mission'}: ${m.title}`
          : ticked.length > 0
            ? `${m.title}: ${ticked.join('; ')} ✓`
            : `${m.title} updated`;
      await ctx.record({ eventType: 'mission', humanReadable: headline, details: { mission: m.title, status, objectivesDone: objectives.filter((o) => o.done).length, objectivesTotal: objectives.length } });

      const granted: unknown[] = [];
      if (completing) {
        const r = m.rewards;
        const why = `reward: ${m.title}`;
        if (r.money) granted.push(await applyMoney(ctx, r.money, why));
        if (r.xp) granted.push(await applyCharacterXp(ctx, r.xp, why));
        for (const item of r.items ?? []) granted.push(await addItem(ctx, item, why));
        for (const s of r.skillXp ?? []) granted.push(await applySkillXp(ctx, s.skill, s.amount, why));
        for (const rel of r.relationships ?? []) {
          // A reward naming an NPC that no longer resolves shouldn't block completing the mission.
          granted.push(await applyRelationship(ctx, rel.npc, rel.affinity, rel.trust, `Completed "${m.title}"`).catch((e: unknown) => ({ skipped: rel.npc, reason: e instanceof Error ? e.message : String(e) })));
        }
      }
      return { title: m.title, status, objectives, ...(completing ? { rewardsGranted: granted } : {}) };
    },
  }),

  tool({
    name: 'skill_check',
    kind: 'write',
    description:
      "Roll for an uncertain action. The server rolls d20 + the character's skill level against the difficulty and returns success, partial (success at a cost), or fail. You must narrate the returned outcome, including failures. Pick the most relevant skill; an untrained skill rolls at +0.",
    input: z.object({
      skill_name: Name,
      difficulty: z.enum(DIFFICULTIES),
      action: z.string().trim().max(200).default('').describe('What is being attempted, for the log'),
    }),
    run: async (ctx, input) => {
      const skill = await findSkill(ctx, input.skill_name);
      const modifier = skill?.level ?? 0;
      const roll = rollD20(ctx.campaign.rngSeed, ctx.turnNumber, ctx.nextRollIndex());
      const { total, dc, outcome } = resolveCheck(roll, modifier, input.difficulty);
      const name = skill?.name ?? input.skill_name;
      await ctx.record({
        eventType: 'skill_check',
        humanReadable: `${name} check (${input.difficulty}): ${outcome}${input.action ? `: ${input.action}` : ''}`,
        details: { skill: name, difficulty: input.difficulty, roll, modifier, total, dc, outcome, trained: Boolean(skill) },
        always: true,
      });
      // Practice makes perfect: attempting a check with a trained skill earns a little XP.
      const practice = skill ? await applySkillXp(ctx, skill.name, CHECK_XP[outcome], 'practice') : null;
      return {
        outcome,
        roll,
        modifier,
        total,
        dc,
        ...(skill ? {} : { note: 'Untrained: rolled at +0.' }),
        ...(practice && practice.level > practice.levelBefore ? { levelUp: `${practice.skill} is now level ${practice.level}` } : {}),
      };
    },
  }),
];

async function findExactNpc(ctx: EngineContext, name: string) {
  const [row] = await ctx.db
    .select({ id: npcs.id })
    .from(npcs)
    .where(and(eq(npcs.campaignId, ctx.campaign.id), sql`lower(${npcs.name}) = lower(${name})`));
  return row ?? null;
}

// ---------------------------------------------------------------- registry

export const TOOLS: ToolDef[] = [...readTools, ...writeTools];
export const TOOLS_BY_NAME = new Map(TOOLS.map((t) => [t.name, t]));

/** API tool definitions. Built once, in a fixed order, so the tools prefix stays cacheable. */
export const API_TOOLS: Anthropic.Tool[] = TOOLS.map((t) => {
  const { $schema: _ignored, ...schema } = z.toJSONSchema(t.input, { io: 'input' }) as Record<string, unknown>;
  return { name: t.name, description: t.description, input_schema: schema as Anthropic.Tool.InputSchema };
});
