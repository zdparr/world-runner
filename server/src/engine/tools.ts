import { and, desc, eq, lt, notLike, sql, type SQL } from 'drizzle-orm';
import type Anthropic from '@anthropic-ai/sdk';
import { z } from 'zod';
import {
  AttributeName,
  DIFFICULTIES,
  HEAL_SHARE_PER_DAY,
  MAX_SKIP_DAYS,
  MISSION_STATUSES,
  MissionPenalty,
  MissionRecurrence,
  MissionRewards,
  POINTS_PER_ATTRIBUTE_BONUS,
  TRAINING_CHARACTER_XP_PER_DAY,
  TRAINING_HOURS_PER_DAY,
  attributeBonus,
  checkXp,
  levelBonus,
  resolveCheck,
  skillTier,
  skillXpToNext,
  trainingMadeTheDifference,
  trainingXp,
  type MissionObjective,
  type Ruleset,
  type StatusEffect,
} from '@narrator/shared';
import { campaigns, inventoryItems, locations, loreEntries, messages, missions, npcs, relationships, skills, stateEvents } from '../db/schema';
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
  /** Offered only to campaigns with one of these rule sets; omitted = every rule set. */
  rulesets?: readonly Ruleset[];
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
    // GM-only, like an NPC's notes: shape the story with it, never read it out.
    ...(loc.purpose ? { purpose: loc.purpose } : {}),
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

// ---------------------------------------------------------------- tools that vary by rule set

const createMissionInput = z.object({
  title: Name,
  description: z.string().trim().min(1).max(3000),
  giver_npc_name: Name.optional(),
  objectives: z.array(z.string().trim().min(1).max(300)).min(1).max(12),
  rewards: MissionRewards.default({}),
  status: z.enum(['offered', 'active']).default('offered'),
});

/** Extra create_mission fields under the ascension rule set. */
const RECURRING = {
  recurrence: MissionRecurrence.optional().describe('"daily" for a daily quest: it resets every in-game day (see advance_day)'),
  penalty: MissionPenalty.optional().describe('Daily quests only: applied automatically if it is left incomplete when the day ends'),
};

function recurringFields(input: object) {
  const r = input as { recurrence?: 'daily'; penalty?: MissionPenalty };
  return r.recurrence ? { recurrence: r.recurrence, penalty: r.penalty ?? {} } : {};
}

function createMissionTool(ruleset: Ruleset): ToolDef {
  return tool({
    name: 'create_mission',
    kind: 'write',
    rulesets: [ruleset],
    description:
      'Record a mission when an NPC or event in the story actually offers one. Rewards are granted automatically on completion; scale them to difficulty and risk. Use status "active" only if the player has already accepted.',
    input: ruleset === 'ascension' ? createMissionInput.extend(RECURRING) : createMissionInput,
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
        ...recurringFields(input),
      });
      await ctx.record({
        eventType: 'mission_created',
        humanReadable: `${input.status === 'active' ? 'Mission started' : 'Mission offered'}: ${input.title}`,
        details: { mission: input.title, status: input.status },
      });
      return { created: input.title, status: input.status, objectives };
    },
  });
}

const SKILL_CHECK_DESCRIPTION =
  "Roll for an uncertain action. The server rolls d20 + the character's skill level + their level bonus against the difficulty and returns success, partial (success at a cost), or fail. You must narrate the returned outcome, including failures. Pick the most relevant skill; an untrained skill rolls without its bonus. When the result says trainingMadeTheDifference, the character's skill is what carried it: show that in the story. Harder checks teach more (skill XP is awarded automatically).";

const skillCheckInput = z.object({
  skill_name: Name,
  difficulty: z.enum(DIFFICULTIES),
  action: z.string().trim().max(200).default('').describe('What is being attempted, for the log'),
});

function skillCheckTool(ruleset: Ruleset): ToolDef {
  return tool({
    name: 'skill_check',
    kind: 'write',
    rulesets: [ruleset],
    description:
      ruleset === 'ascension'
        ? `${SKILL_CHECK_DESCRIPTION} Also name the core attribute the action leans on (Strength to force a door, Agility to dodge, Perception to spot, Will to resist); it adds +1 per ${POINTS_PER_ATTRIBUTE_BONUS} points.`
        : SKILL_CHECK_DESCRIPTION,
    input: ruleset === 'ascension' ? skillCheckInput.extend({ attribute: AttributeName.optional() }) : skillCheckInput,
    run: async (ctx, input) => {
      const skill = await findSkill(ctx, input.skill_name);
      const attribute = (input as { attribute?: AttributeName }).attribute;
      const pc = await getCharacter(ctx);
      const skillBonus = skill?.level ?? 0;
      const attrBonus = attribute ? attributeBonus(pc.attributes[attribute] ?? 0) : 0;
      const lvlBonus = levelBonus(pc.level);
      const modifier = skillBonus + attrBonus + lvlBonus;
      const roll = rollD20(ctx.campaign.rngSeed, ctx.turnNumber, ctx.nextRollIndex());
      const { total, dc, outcome } = resolveCheck(roll, modifier, input.difficulty, skillBonus);
      // Did the character's training (skill and attribute) turn this roll? The level bonus is kept on both sides.
      const decisive = trainingMadeTheDifference(roll, input.difficulty, outcome, skillBonus + attrBonus, lvlBonus);
      const name = skill?.name ?? input.skill_name;
      const tier = skill ? skillTier(skill.level) : null;
      await ctx.record({
        eventType: 'skill_check',
        humanReadable: `${name} check (${input.difficulty}): ${outcome}${input.action ? `: ${input.action}` : ''}`,
        details: {
          skill: name,
          difficulty: input.difficulty,
          action: input.action,
          roll,
          modifier,
          skillBonus,
          levelBonus: lvlBonus,
          total,
          dc,
          outcome,
          trained: Boolean(skill),
          ...(tier ? { tier } : {}),
          ...(decisive ? { decisive: true } : {}),
          ...(attribute ? { attribute, attributeBonus: attrBonus } : {}),
        },
        always: true,
      });
      // Practice makes perfect: attempting a check with a trained skill earns XP, more for harder tries.
      const practice = skill ? await applySkillXp(ctx, skill.name, checkXp(input.difficulty, outcome), 'practice') : null;
      return {
        outcome,
        roll,
        modifier,
        breakdown: { skill: skillBonus, levelBonus: lvlBonus, ...(attribute ? { attribute, attributeBonus: attrBonus } : {}) },
        total,
        dc,
        ...(tier ? { skillTier: tier } : { note: 'Untrained: no skill bonus.' }),
        ...(decisive ? { trainingMadeTheDifference: true } : {}),
        ...(practice && practice.level > practice.levelBefore
          ? { levelUp: `${practice.skill} is now level ${practice.level} (${skillTier(practice.level)})` }
          : {}),
      };
    },
  });
}

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

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
    description:
      "Look up a location: description, its purpose in the story (GM-only: what it is for, what it hides; don't reveal it directly), what it is inside of or contains, and which NPCs are there.",
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
      "Search this campaign's history: every past state change (money, items, xp, relationships, missions, rolls) and the story passages that have been folded into the summary and are no longer in the transcript. Use it when the player refers to something from long ago, or when the summary mentions something whose details matter now. Results carry turn numbers.",
    input: z.object({
      query: z.string().trim().min(2).max(200).describe('Keywords: names, places, objects, e.g. "Brakka debt" or "silver key"'),
      before_turn: z.number().int().min(1).optional().describe('Only search turns before this one'),
    }),
    run: async (ctx, input) => {
      const cid = ctx.campaign.id;
      // This turn's own changes are already in the tool results.
      const beforeTurn = Math.min(input.before_turn ?? ctx.turnNumber, ctx.turnNumber);
      const search = async (q: SQL) => {
        const events = await ctx.db
          .select({ turn: stateEvents.turnNumber, text: stateEvents.humanReadable })
          .from(stateEvents)
          .where(
            and(
              eq(stateEvents.campaignId, cid),
              lt(stateEvents.turnNumber, beforeTurn),
              notLike(stateEvents.eventType, 'memory_%'),
              sql`${stateEvents.searchVector} @@ ${q}`,
            ),
          )
          .orderBy(sql`ts_rank(${stateEvents.searchVector}, ${q}) desc`, desc(stateEvents.turnNumber))
          .limit(10);
        // Only passages already folded into the summary: the rest are in the transcript.
        const story = await ctx.db
          .select({
            turn: messages.turnNumber,
            role: messages.role,
            excerpt: sql<string>`ts_headline('english', ${messages.content}, ${q}, 'MaxFragments=2, MaxWords=40, MinWords=15, FragmentDelimiter=" … ", StartSel="", StopSel=""')`,
          })
          .from(messages)
          .where(
            and(
              eq(messages.campaignId, cid),
              eq(messages.summarized, true),
              lt(messages.turnNumber, beforeTurn),
              sql`${messages.searchVector} @@ ${q}`,
            ),
          )
          .orderBy(sql`ts_rank(${messages.searchVector}, ${q}) desc`, desc(messages.turnNumber))
          .limit(5);
        return { events, story };
      };

      let matched = 'all keywords';
      let found = await search(sql`websearch_to_tsquery('english', ${input.query})`);
      if (found.events.length + found.story.length === 0) {
        // Nothing has every word: fall back to passages with any of them.
        matched = 'any keyword';
        found = await search(sql`nullif(replace(plainto_tsquery('english', ${input.query})::text, ' & ', ' | '), '')::tsquery`);
      }
      const byTurn = <T extends { turn: number }>(rows: T[]) => [...rows].sort((a, b) => a.turn - b.turn);
      return {
        matched,
        stateChanges: byTurn(found.events),
        storyExcerpts: byTurn(found.story),
        ...(found.events.length + found.story.length === 0
          ? { note: 'Nothing found. Try other keywords (a name, a place, an object), or rely on the summary.' }
          : {}),
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
      "Award skill XP for notable use outside a check, or a short training session within the scene (skill_check already awards XP on its own; for days or weeks of training use pass_time). Guide: a solid hour or two of drill 5-10, a hard lesson from a real teacher 15-25, a breakthrough moment 30-50. The level curve is 25 × (level + 1), so these amounts move the bar visibly. Level-ups are handled for you. A skill the character lacks is learned at level 0.",
    input: z.object({ skill_name: Name, amount: z.number().int().min(1).max(500), reason: Reason }),
    run: (ctx, input) => applySkillXp(ctx, input.skill_name, input.amount, input.reason),
  }),

  tool({
    name: 'grant_xp',
    kind: 'write',
    description:
      "Award character XP when a scene's challenge is overcome, for clever play, and at story milestones: 15-30 for a minor obstacle, 40-80 for a real danger or a hard-won negotiation, 100+ for a turning point (mission rewards grant their own). Level N to N+1 costs 50 × (N + 1). Level-ups, the max HP they add, and the level bonus to all checks are handled for you.",
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
    description:
      "Add a location to the world so it persists (a new district, building, room, or wilderness spot). Every location needs a purpose: why it matters to the story. Write the description for the player (what they see) and the purpose for yourself (GM-only).",
    input: z.object({
      name: Name,
      description: z.string().trim().min(1).max(3000).describe('What the character sees and senses there'),
      purpose: z
        .string()
        .trim()
        .min(1)
        .max(2000)
        .describe('GM-only: what this place is for in the story (a mission step, a clue or secret it holds, an NPC base, a threat, a refuge) and what can happen here'),
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
        throw new ToolError(`A location named "${existing.name}" already exists. Use update_location to change it.`);
      }
      const parent = input.parent_location_name ? await findLocation(ctx, input.parent_location_name) : null;
      await ctx.mutator.insert('locations', {
        name: input.name,
        description: input.description,
        purpose: input.purpose,
        parentLocationId: parent?.id ?? null,
        tags: input.tags,
      });
      await ctx.record({ eventType: 'location_created', humanReadable: `Discovered ${input.name}`, details: { location: input.name } });
      return { created: input.name, insideOf: parent?.name ?? null };
    },
  }),

  tool({
    name: 'update_location',
    kind: 'write',
    description:
      'Change a location: give it a purpose if it lacks one, revise its purpose as the story moves (a hideout is discovered, a safe place becomes dangerous), update its description after something changes it (a fire, a siege), or change its tags.',
    input: z.object({
      name: Name,
      description: z.string().trim().min(1).max(3000).optional(),
      purpose: z.string().trim().min(1).max(2000).optional().describe('GM-only: replaces the current purpose'),
      tags: Tags.optional(),
    }),
    run: async (ctx, input) => {
      const loc = await findLocation(ctx, input.name);
      const patch: Record<string, unknown> = {};
      if (input.description) patch.description = input.description;
      if (input.purpose) patch.purpose = input.purpose;
      if (input.tags) patch.tags = input.tags;
      if (Object.keys(patch).length === 0) throw new ToolError('Nothing to update.');
      await ctx.mutator.update('locations', { id: loc.id }, patch);
      // Purpose changes are GM-only, so they stay out of the player's change log.
      const visible = input.description !== undefined || input.tags !== undefined;
      await ctx.record({
        eventType: visible ? 'location_updated' : 'location_notes',
        humanReadable: visible ? `${loc.name} changed` : 'The narrator made private notes',
        details: { location: loc.name },
      });
      return { updated: loc.name };
    },
  }),

  createMissionTool('classic'),
  createMissionTool('ascension'),

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

      // A daily quest is done when its last objective is: complete it even if the narrator forgets to say so.
      const autoCompleted =
        !input.status && m.recurrence === 'daily' && m.status === 'active' && objectives.length > 0 && objectives.every((o) => o.done);
      const status = autoCompleted ? 'completed' : (input.status ?? m.status);
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
      return {
        title: m.title,
        status,
        objectives,
        ...(autoCompleted ? { note: 'Every objective is done, so this daily quest is now complete.' } : {}),
        ...(completing ? { rewardsGranted: granted } : {}),
      };
    },
  }),

  skillCheckTool('classic'),
  skillCheckTool('ascension'),

  tool({
    name: 'pass_time',
    kind: 'write',
    description:
      "Skip forward through uneventful time: a training montage, travel, recovery, a season of work. The server works out what the time bought: skill XP for each skill trained (more with a capable teacher; after level 10 a teacher matters), a little character XP, HP recovered, and in-game days passed (daily quests are kept up during a skip, with no rewards or penalties). Narrate the stretch as a montage from the returned results, then resume the story with something that happens now. If something story-worthy would interrupt the skip, pass only the time until it does.",
    input: z.object({
      amount: z.number().positive().max(MAX_SKIP_DAYS * 24),
      unit: z.enum(['hours', 'days', 'weeks']),
      training: z
        .array(
          z.object({
            skill_name: Name.describe("An existing skill's exact name, or a new discipline in Title Case (learned at level 0)"),
            focus: z.enum(['primary', 'secondary']).default('primary').describe('Primary skills share the main training time; secondary ones get half as much'),
            teacher: Name.optional().describe('Who teaches it, if anyone capable does (NPC name or a description like "a retired duelist")'),
          }),
        )
        .max(4)
        .default([]),
      summary: z.string().trim().min(1).max(500).describe('What the character does over the span, for the log and memory'),
    }),
    run: async (ctx, input) => {
      const hours = input.unit === 'hours' ? input.amount : input.amount * 24 * (input.unit === 'weeks' ? 7 : 1);
      const days = hours / 24;
      if (days > MAX_SKIP_DAYS) throw new ToolError(`A single time skip covers at most ${MAX_SKIP_DAYS} days. Nothing changed.`);
      // Hours of focused training: a day of it is a full training day; a short skip is a session.
      const trainingDays = input.unit === 'hours' ? Math.min(hours, 16) / TRAINING_HOURS_PER_DAY : days;
      const label = `${input.amount} ${input.amount === 1 ? input.unit.slice(0, -1) : input.unit}`;
      await ctx.record({
        eventType: 'time_skip',
        humanReadable: `⏩ ${label} pass: ${input.summary}`,
        details: { hours, days, summary: input.summary, training: input.training.map((t) => t.skill_name) },
        always: true,
      });

      const primaries = Math.max(1, input.training.filter((t) => t.focus === 'primary').length);
      const trained = [];
      for (const t of input.training) {
        const existing = await findSkill(ctx, t.skill_name);
        const xp = trainingXp(t.focus === 'primary' ? trainingDays / primaries : trainingDays, t.focus, Boolean(t.teacher), existing?.level ?? 0);
        const r = await applySkillXp(ctx, t.skill_name, xp, `training${t.teacher ? ` with ${t.teacher}` : ''}`);
        trained.push({
          skill: r.skill,
          xpGained: xp,
          level: r.level,
          ...(r.level > r.levelBefore ? { levelBefore: r.levelBefore, tier: skillTier(r.level) } : {}),
          progress: `${r.xp}/${r.xpToNext}`,
          ...(r.created ? { newSkill: true } : {}),
          ...(!t.teacher && (existing?.level ?? 0) >= 10 ? { note: 'Self-taught training is slow at this level; a better teacher would help.' } : {}),
        });
      }

      const wholeDays = Math.floor(days);
      const characterXp = input.training.length > 0 ? wholeDays * TRAINING_CHARACTER_XP_PER_DAY : 0;
      const character = characterXp > 0 ? await applyCharacterXp(ctx, characterXp, 'time spent training') : null;

      const pc = await getCharacter(ctx);
      const hp = Math.min(pc.maxHp, pc.hp + Math.round(pc.maxHp * HEAL_SHARE_PER_DAY * days));
      if (hp > pc.hp) {
        await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { hp });
        await ctx.record({ eventType: 'hp', humanReadable: `HP +${hp - pc.hp} (${pc.hp} → ${hp}): rest`, details: { delta: hp - pc.hp, hp, maxHp: pc.maxHp } });
      }

      let day: number | null = null;
      if (wholeDays > 0) {
        const [campaign] = await ctx.db.select({ gameDay: campaigns.gameDay }).from(campaigns).where(eq(campaigns.id, ctx.campaign.id));
        day = campaign!.gameDay + wholeDays;
        await ctx.mutator.update('campaigns', { id: ctx.campaign.id }, { gameDay: day });
        // Dailies are kept up during a skip: reset them for today, with no penalty for the days skipped.
        const dailies = await ctx.db
          .select()
          .from(missions)
          .where(and(eq(missions.campaignId, ctx.campaign.id), eq(missions.recurrence, 'daily'), sql`${missions.status} <> 'offered'`));
        for (const m of dailies) {
          await ctx.mutator.update('missions', { id: m.id }, { objectives: m.objectives.map((o) => ({ ...o, done: false })), status: 'active', rewardsGranted: false });
        }
        await ctx.record({ eventType: 'day', humanReadable: `Day ${day} begins`, details: { day, skipped: wholeDays } });
      }

      return {
        timePassed: label,
        trained,
        ...(character ? { characterXp: { gained: characterXp, level: character.level, levelsGained: character.levelsGained, ...(character.statPointsGained ? { attributesGained: character.attributesGained, statPointsGained: character.statPointsGained } : {}) } } : {}),
        hp: { now: hp, max: pc.maxHp, recovered: hp - pc.hp },
        ...(day ? { day } : {}),
      };
    },
  }),

  tool({
    name: 'update_story_notes',
    kind: 'write',
    description:
      "Rewrite your private planning notes for this campaign (the player never sees them). They are shown to you every turn under \"Your story notes\". Keep them current and under about 400 words: open threads and mysteries, secrets and their truths, clues planted and where they lead, what each important NPC or faction is doing offscreen, looming threats and their timelines, and the next complication you intend. Update them when a thread opens, turns, or closes, or when you plan ahead; not every turn.",
    input: z.object({ notes: z.string().trim().min(1).max(6000).describe('The complete new notes; this replaces the old ones') }),
    run: async (ctx, input) => {
      await ctx.mutator.update('campaigns', { id: ctx.campaign.id }, { storyNotes: input.notes });
      await ctx.record({ eventType: 'story_notes', humanReadable: 'The narrator made private notes', details: {} });
      return { saved: true, words: input.notes.split(/\s+/).length };
    },
  }),

  // ------------------------------------------------ ascension rule set only

  tool({
    name: 'allocate_stat_point',
    kind: 'write',
    rulesets: ['ascension'],
    description:
      "Spend the character's unspent stat points on a core attribute. Only when the player chooses how to allocate them (in or out of character); never decide for them.",
    input: z.object({ attribute: AttributeName, points: z.number().int().min(1).max(100).default(1), reason: Reason }),
    run: async (ctx, input) => {
      const pc = await getCharacter(ctx);
      if (input.points > pc.unspentStatPoints) {
        throw new ToolError(`Not enough stat points: the character has ${pc.unspentStatPoints} unspent. Nothing was allocated.`);
      }
      const before = pc.attributes[input.attribute] ?? 0;
      const after = before + input.points;
      const unspentStatPoints = pc.unspentStatPoints - input.points;
      await ctx.mutator.update(
        'player_character',
        { campaignId: ctx.campaign.id },
        { attributes: { ...pc.attributes, [input.attribute]: after }, unspentStatPoints },
      );
      await ctx.record({
        eventType: 'attribute',
        humanReadable: `${capitalize(input.attribute)} ${before} → ${after}${input.reason ? ` (${input.reason})` : ''}`,
        details: { attribute: input.attribute, before, after, points: input.points, unspentStatPoints },
      });
      return { attribute: input.attribute, before, after, unspentStatPoints };
    },
  }),

  tool({
    name: 'advance_day',
    kind: 'write',
    rulesets: ['ascension'],
    description:
      'End the in-game day and begin the next (the character sleeps, or a night passes). Every daily quest left incomplete (active or failed) has its penalty applied automatically, then every daily quest resets for the new day. Optionally give daily quests fresh objectives. Never apply daily penalties by hand.',
    input: z.object({
      reason: Reason,
      daily_objectives: z
        .array(z.object({ title: Name, objectives: z.array(z.string().trim().min(1).max(300)).min(1).max(12) }))
        .max(10)
        .optional()
        .describe('New objectives for named daily quests; the others keep their objectives, unticked'),
    }),
    run: async (ctx, input) => {
      const [campaign] = await ctx.db.select({ gameDay: campaigns.gameDay }).from(campaigns).where(eq(campaigns.id, ctx.campaign.id));
      const dailies = await ctx.db
        .select()
        .from(missions)
        .where(and(eq(missions.campaignId, ctx.campaign.id), eq(missions.recurrence, 'daily')));
      const fresh = new Map((input.daily_objectives ?? []).map((d) => [d.title.toLowerCase(), d.objectives]));
      for (const title of fresh.keys()) {
        if (!dailies.some((m) => m.title.toLowerCase() === title)) {
          throw new ToolError(`No daily quest titled "${title}". Daily quests: ${dailies.map((m) => m.title).join(', ') || 'none'}. Nothing changed.`);
        }
      }

      const day = campaign!.gameDay + 1;
      await ctx.mutator.update('campaigns', { id: ctx.campaign.id }, { gameDay: day });
      await ctx.record({ eventType: 'day', humanReadable: `Day ${day} begins${input.reason ? ` (${input.reason})` : ''}`, details: { day } });

      const results = [];
      for (const m of dailies) {
        // 'offered' means it was never issued, so there is nothing to miss.
        const missed = m.status === 'active' || m.status === 'failed';
        const penalties: string[] = [];
        if (missed && m.penalty.hpLoss) {
          const pc = await getCharacter(ctx);
          const hp = clamp(pc.hp - m.penalty.hpLoss, 0, pc.maxHp);
          await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { hp });
          await ctx.record({
            eventType: 'hp',
            humanReadable: `HP ${hp - pc.hp} (${pc.hp} → ${hp}): missed ${m.title}`,
            details: { delta: hp - pc.hp, hp, maxHp: pc.maxHp },
          });
          penalties.push(`HP ${pc.hp} → ${hp}${hp === 0 ? ' (down)' : ''}`);
        }
        if (missed && m.penalty.statusEffect) {
          const pc = await getCharacter(ctx);
          const effect = m.penalty.statusEffect;
          const statusEffects = [...pc.statusEffects.filter((e) => e.name.toLowerCase() !== effect.name.toLowerCase()), effect];
          await ctx.mutator.update('player_character', { campaignId: ctx.campaign.id }, { statusEffects });
          await ctx.record({ eventType: 'status', humanReadable: `Now ${effect.name}: missed ${m.title}`, details: { action: 'add', name: effect.name } });
          penalties.push(effect.name);
        }
        const texts = fresh.get(m.title.toLowerCase());
        const objectives = texts ? normalizeObjectives(texts.map((text) => ({ text }))) : m.objectives.map((o) => ({ ...o, done: false }));
        const status = m.status === 'offered' ? 'offered' : 'active';
        await ctx.mutator.update('missions', { id: m.id }, { objectives, status, rewardsGranted: false });
        await ctx.record({
          eventType: 'mission',
          humanReadable: `${missed ? 'Daily failed' : 'Daily reset'}: ${m.title}`,
          details: { mission: m.title, status, objectivesDone: 0, objectivesTotal: objectives.length },
        });
        results.push({ title: m.title, missed, penalties, status, objectives });
      }
      return { day, dailies: results };
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

export interface Toolset {
  byName: Map<string, ToolDef>;
  /** API tool definitions, in a fixed order so the tools prefix stays cacheable. */
  api: Anthropic.Tool[];
}

const toolsets = new Map<Ruleset, Toolset>();

/** The tools offered to campaigns with this rule set. Built once per rule set. */
export function toolset(ruleset: Ruleset): Toolset {
  let set = toolsets.get(ruleset);
  if (!set) {
    const defs = TOOLS.filter((t) => !t.rulesets || t.rulesets.includes(ruleset));
    set = {
      byName: new Map(defs.map((t) => [t.name, t])),
      api: defs.map((t) => {
        const { $schema: _ignored, ...schema } = z.toJSONSchema(t.input, { io: 'input' }) as Record<string, unknown>;
        return { name: t.name, description: t.description, input_schema: schema as Anthropic.Tool.InputSchema };
      }),
    };
    toolsets.set(ruleset, set);
  }
  return set;
}
