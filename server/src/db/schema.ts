import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  customType,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import type { Attributes, MissionObjective, MissionPenalty, MissionRecurrence, MissionRewards, Ruleset, StatusEffect } from '@narrator/shared';

// Column names are derived as snake_case (see `casing` in client.ts and drizzle.config.ts).
// Raw SQL fragments below (checks, expression indexes, generated columns) use the snake_case names.

const tsvector = customType<{ data: string }>({ dataType: () => 'tsvector' });

const pk = () => uuid().primaryKey().defaultRandom();
const serialPk = () => bigint({ mode: 'number' }).primaryKey().generatedAlwaysAsIdentity();
const campaignRef = () =>
  uuid()
    .notNull()
    .references(() => campaigns.id, { onDelete: 'cascade' });
const createdAt = () => timestamp({ withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp({ withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const tags = () => text().array().notNull().default(sql`'{}'::text[]`);

export const messageRole = pgEnum('message_role', ['player', 'narrator']);
export const missionStatus = pgEnum('mission_status', ['offered', 'active', 'completed', 'failed']);

export const campaigns = pgTable(
  'campaigns',
  {
    id: pk(),
    name: text().notNull(),
    worldBible: text().notNull().default(''),
    narratorStyle: text().notNull().default(''),
    rollingSummary: text().notNull().default(''),
    currencyName: text().notNull().default('gold'),
    turnCount: integer().notNull().default(0),
    /** Recent messages included verbatim in each turn's context (N). */
    historyWindow: integer().notNull().default(8),
    /** Fold older messages into the rolling summary every K turns. */
    summaryInterval: integer().notNull().default(10),
    /** Rule set: 'classic' (skills only) or 'ascension' (attributes, stat points, daily quests). */
    ruleset: text().$type<Ruleset>().notNull().default('classic'),
    /** In-game day; the narrator advances it, which resets daily quests. */
    gameDay: integer().notNull().default(1),
    /** Base seed for server-side dice; combined with the turn number per roll. */
    rngSeed: integer()
      .notNull()
      .default(sql`floor(random() * 2147483647)::int`),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  () => [
    check('campaigns_ruleset_valid', sql`ruleset IN ('classic', 'ascension')`),
    check('campaigns_game_day_positive', sql`game_day >= 1`),
  ],
);

export const locations = pgTable(
  'locations',
  {
    id: pk(),
    campaignId: campaignRef(),
    name: text().notNull(),
    description: text().notNull().default(''),
    parentLocationId: uuid().references((): AnyPgColumn => locations.id, { onDelete: 'set null' }),
    tags: tags(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('locations_campaign_name_uq').on(t.campaignId, sql`lower(name)`)],
);

export const playerCharacter = pgTable(
  'player_character',
  {
    // One player character per campaign.
    campaignId: uuid()
      .primaryKey()
      .references(() => campaigns.id, { onDelete: 'cascade' }),
    name: text().notNull(),
    archetype: text().notNull().default(''),
    bio: text().notNull().default(''),
    currentLocationId: uuid().references(() => locations.id, { onDelete: 'set null' }),
    /** Smallest currency unit. Never negative. */
    money: integer().notNull().default(0),
    level: integer().notNull().default(1),
    xp: integer().notNull().default(0),
    hp: integer().notNull().default(10),
    maxHp: integer().notNull().default(10),
    statusEffects: jsonb().$type<StatusEffect[]>().notNull().default([]),
    /** Core attributes (ascension ruleset); empty otherwise. */
    attributes: jsonb().$type<Attributes>().notNull().default({}),
    unspentStatPoints: integer().notNull().default(0),
    updatedAt: updatedAt(),
  },
  () => [
    check('player_money_nonnegative', sql`money >= 0`),
    check('player_level_positive', sql`level >= 1`),
    check('player_xp_nonnegative', sql`xp >= 0`),
    check('player_hp_range', sql`hp >= 0 AND max_hp > 0 AND hp <= max_hp`),
    check('player_stat_points_nonnegative', sql`unspent_stat_points >= 0`),
  ],
);

export const skills = pgTable(
  'skills',
  {
    id: pk(),
    campaignId: campaignRef(),
    name: text().notNull(),
    level: integer().notNull().default(1),
    xp: integer().notNull().default(0),
    description: text().notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('skills_campaign_name_uq').on(t.campaignId, sql`lower(name)`),
    check('skills_level_nonnegative', sql`level >= 0`),
    check('skills_xp_nonnegative', sql`xp >= 0`),
  ],
);

export const inventoryItems = pgTable(
  'inventory_items',
  {
    id: pk(),
    campaignId: campaignRef(),
    // Items stack by name within a campaign.
    name: text().notNull(),
    description: text().notNull().default(''),
    quantity: integer().notNull().default(1),
    tags: tags(),
    equipped: boolean().notNull().default(false),
    properties: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('inventory_campaign_name_uq').on(t.campaignId, sql`lower(name)`),
    index('inventory_tags_gin').using('gin', t.tags),
    check('inventory_quantity_positive', sql`quantity > 0`),
  ],
);

export const npcs = pgTable(
  'npcs',
  {
    id: pk(),
    campaignId: campaignRef(),
    name: text().notNull(),
    shortDescription: text().notNull().default(''),
    faction: text().notNull().default(''),
    locationId: uuid().references(() => locations.id, { onDelete: 'set null' }),
    alive: boolean().notNull().default(true),
    notes: text().notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex('npcs_campaign_name_uq').on(t.campaignId, sql`lower(name)`)],
);

export const relationships = pgTable(
  'relationships',
  {
    id: pk(),
    campaignId: campaignRef(),
    // One relationship (player <-> NPC) per NPC.
    npcId: uuid()
      .notNull()
      .unique()
      .references(() => npcs.id, { onDelete: 'cascade' }),
    affinity: integer().notNull().default(0),
    trust: integer().notNull().default(0),
    status: text().notNull().default('stranger'),
    historyNotes: text().notNull().default(''),
    /** Notes appended since the utility model last condensed historyNotes. */
    notesSinceCondense: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('relationships_campaign_idx').on(t.campaignId),
    check('relationships_affinity_range', sql`affinity BETWEEN -100 AND 100`),
    check('relationships_trust_range', sql`trust BETWEEN -100 AND 100`),
  ],
);

export const loreEntries = pgTable(
  'lore_entries',
  {
    id: pk(),
    campaignId: campaignRef(),
    title: text().notNull(),
    body: text().notNull().default(''),
    keywords: tags(),
    alwaysInclude: boolean().notNull().default(false),
    searchVector: tsvector().generatedAlwaysAs(
      sql`setweight(to_tsvector('english', coalesce(title, '')), 'A') || setweight(to_tsvector('english', coalesce(body, '')), 'B')`,
    ),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('lore_campaign_idx').on(t.campaignId),
    index('lore_keywords_gin').using('gin', t.keywords),
    index('lore_search_gin').using('gin', t.searchVector),
  ],
);

export const missions = pgTable(
  'missions',
  {
    id: pk(),
    campaignId: campaignRef(),
    title: text().notNull(),
    description: text().notNull().default(''),
    giverNpcId: uuid().references(() => npcs.id, { onDelete: 'set null' }),
    status: missionStatus().notNull().default('offered'),
    objectives: jsonb().$type<MissionObjective[]>().notNull().default([]),
    rewards: jsonb().$type<MissionRewards>().notNull().default({}),
    /** Set once completion rewards are applied, so they are never applied twice. */
    rewardsGranted: boolean().notNull().default(false),
    /** 'daily': reset when the in-game day advances, applying `penalty` if it was left incomplete. */
    recurrence: text().$type<MissionRecurrence>(),
    penalty: jsonb().$type<MissionPenalty>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('missions_campaign_title_uq').on(t.campaignId, sql`lower(title)`),
    check('missions_recurrence_valid', sql`recurrence IS NULL OR recurrence IN ('daily')`),
  ],
);

export const messages = pgTable(
  'messages',
  {
    id: serialPk(),
    campaignId: campaignRef(),
    turnNumber: integer().notNull(),
    role: messageRole().notNull(),
    content: text().notNull(),
    /** Folded into campaigns.rolling_summary; no longer sent verbatim. */
    summarized: boolean().notNull().default(false),
    searchVector: tsvector().generatedAlwaysAs(sql`to_tsvector('english', content)`),
    createdAt: createdAt(),
  },
  (t) => [
    index('messages_campaign_turn_idx').on(t.campaignId, t.turnNumber),
    index('messages_search_gin').using('gin', t.searchVector),
  ],
);

/** Append-only ledger of every state change. Payload carries enough to invert the change (undo). */
export const stateEvents = pgTable(
  'state_events',
  {
    id: serialPk(),
    campaignId: campaignRef(),
    turnNumber: integer().notNull(),
    eventType: text().notNull(),
    payload: jsonb().$type<Record<string, unknown>>().notNull().default({}),
    humanReadable: text().notNull(),
    searchVector: tsvector().generatedAlwaysAs(sql`to_tsvector('english', human_readable)`),
    createdAt: createdAt(),
  },
  (t) => [
    index('state_events_campaign_turn_idx').on(t.campaignId, t.turnNumber),
    index('state_events_search_gin').using('gin', t.searchVector),
  ],
);

export const turnDebug = pgTable(
  'turn_debug',
  {
    id: serialPk(),
    campaignId: campaignRef(),
    turnNumber: integer().notNull(),
    model: text().notNull().default(''),
    /** Which state slices were included in context, and why. */
    contextManifest: jsonb().notNull().default({}),
    /** Tool calls made during the turn, with arguments and results. */
    toolCalls: jsonb().notNull().default([]),
    inputTokens: integer().notNull().default(0),
    outputTokens: integer().notNull().default(0),
    cacheReadTokens: integer().notNull().default(0),
    cacheCreationTokens: integer().notNull().default(0),
    latencyMs: integer().notNull().default(0),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('turn_debug_campaign_turn_uq').on(t.campaignId, t.turnNumber)],
);
