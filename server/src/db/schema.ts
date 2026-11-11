import { sql } from 'drizzle-orm';
import {
  type AnyPgColumn,
  bigint,
  boolean,
  check,
  customType,
  doublePrecision,
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
import type {
  Attributes,
  CampaignChoice,
  ItemEnhancement,
  ItemUsage,
  MissionObjective,
  MissionPenalty,
  MissionRecurrence,
  MissionRewards,
  NarrationLength,
  NpcRole,
  NpcStatus,
  RankLadder,
  Reputation,
  Routine,
  Ruleset,
  SceneState,
  StatusEffect,
  StoryEventType,
  ThreadKind,
} from '@narrator/shared';

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
    /** The narrator's private planning notes: open threads, secrets, foreshadowing, NPC agendas. */
    storyNotes: text().notNull().default(''),
    /** How much the narrator writes per turn: 'brief', 'standard', or 'rich'. */
    narrationLength: text().$type<NarrationLength>().notNull().default('standard'),
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
    /** Standing with each faction the world tracks (-100..100), keyed by faction name. */
    reputation: jsonb().$type<Reputation>().notNull().default({}),
    /** Permanent choices (a starting power), locked once by the narrator's lock_choice. */
    choices: jsonb().$type<CampaignChoice[]>().notNull().default([]),
    /** The character's rank on the world's ladder (a realm's dominion), moved by set_rank. Null = the world has none. */
    ladder: jsonb().$type<RankLadder>(),
    /** Id of the drawn terrain map the web app shows under this world's places (e.g. 'empty-crown'). Null = places only. */
    mapArt: text(),
    /** Where the scene stands (location, time of day, who is present), kept current by extraction. Null until the first extraction. */
    scene: jsonb().$type<SceneState>(),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  () => [
    check('campaigns_ruleset_valid', sql`ruleset IN ('classic', 'ascension')`),
    check('campaigns_game_day_positive', sql`game_day >= 1`),
    check('campaigns_narration_length_valid', sql`narration_length IN ('brief', 'standard', 'rich')`),
  ],
);

export const locations = pgTable(
  'locations',
  {
    id: pk(),
    campaignId: campaignRef(),
    name: text().notNull(),
    description: text().notNull().default(''),
    /** GM-only: what this place is for in the story (a mission step, a secret, a threat, a refuge). Never shown to the player. */
    purpose: text().notNull().default(''),
    /** How the place stands now, if the story has changed it (burned, sealed, abandoned, under new owners). */
    currentState: text().notNull().default(''),
    parentLocationId: uuid().references((): AnyPgColumn => locations.id, { onDelete: 'set null' }),
    /**
     * Where the place sits on the world map, in hours of travel on foot from the map's origin: x east,
     * y north. Null = not placed (drawn near its parent, or wherever it fits).
     */
    mapX: doublePrecision(),
    mapY: doublePrecision(),
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
    money: bigint({ mode: 'number' }).notNull().default(0),
    level: integer().notNull().default(1),
    xp: integer().notNull().default(0),
    hp: integer().notNull().default(10),
    maxHp: integer().notNull().default(10),
    statusEffects: jsonb().$type<StatusEffect[]>().notNull().default([]),
    /** Core attributes (ascension ruleset); empty otherwise. */
    attributes: jsonb().$type<Attributes>().notNull().default({}),
    unspentStatPoints: integer().notNull().default(0),
    /** Recurring practices applied automatically every in-game night. */
    routines: jsonb().$type<Routine[]>().notNull().default([]),
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
    /** 0 = ungraded; Grade I-VII adds +1 to +7 to the checks it enhances. */
    grade: integer().notNull().default(0),
    usage: text().$type<ItemUsage>().notNull().default('worn'),
    enhances: jsonb().$type<ItemEnhancement[]>().notNull().default([]),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('inventory_campaign_name_uq').on(t.campaignId, sql`lower(name)`),
    index('inventory_tags_gin').using('gin', t.tags),
    check('inventory_quantity_positive', sql`quantity > 0`),
    check('inventory_grade_range', sql`grade BETWEEN 0 AND 7`),
    check('inventory_usage_valid', sql`usage IN ('worn', 'wielded')`),
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
    /** Other names the story uses for them: nicknames, short forms, epithets ("the old smith"). */
    aliases: tags(),
    /** Rank, office, or title they hold now ("Police Commissioner", "Archon"). */
    title: text().notNull().default(''),
    role: text().$type<NpcRole>().notNull().default('minor'),
    /** Free, missing, imprisoned... (`alive` stays the authority on death). */
    status: text().$type<NpcStatus>().notNull().default('active'),
    appearance: text().notNull().default(''),
    /** Temperament and how they talk. */
    personality: text().notNull().default(''),
    /** What they want and what they won't do. */
    goals: text().notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('npcs_campaign_name_uq').on(t.campaignId, sql`lower(name)`),
    check('npcs_role_valid', sql`role IN ('major', 'minor')`),
    check('npcs_status_valid', sql`status IN ('active', 'missing', 'imprisoned', 'departed', 'unknown')`),
  ],
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
    /** The fully assembled prompt (system blocks and messages), stored only when DEBUG_PROMPTS is on. */
    prompt: jsonb(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex('turn_debug_campaign_turn_uq').on(t.campaignId, t.turnNumber)],
);

// ---------------------------------------------------------------- story memory

/**
 * The story ledger: facts established by the narration (a death, a betrayal, a secret revealed),
 * extracted after each turn. Written through the Mutator, so undoing a turn removes its facts.
 */
export const storyEvents = pgTable(
  'story_events',
  {
    id: pk(),
    campaignId: campaignRef(),
    turnNumber: integer().notNull(),
    type: text().$type<StoryEventType>().notNull(),
    /** One factual sentence, past tense, with names. */
    summary: text().notNull(),
    /** 1 = color, 5 = turns the whole story. */
    importance: integer().notNull().default(2),
    /** Hard canon: later narration must never contradict it (a death, an identity, a title held). */
    immutable: boolean().notNull().default(false),
    /** A later fact that replaces this one (a captive escapes, an office changes hands). */
    supersededBy: uuid().references((): AnyPgColumn => storyEvents.id, { onDelete: 'set null' }),
    searchVector: tsvector().generatedAlwaysAs(sql`to_tsvector('english', summary)`),
    createdAt: createdAt(),
  },
  (t) => [
    index('story_events_campaign_turn_idx').on(t.campaignId, t.turnNumber),
    index('story_events_search_gin').using('gin', t.searchVector),
    check('story_events_importance_range', sql`importance BETWEEN 1 AND 5`),
  ],
);

/**
 * Who and where a story event involves. Exactly one of the entity columns is set. Items aren't linked:
 * inventory rows come and go as things are used up, and the event summary names them anyway.
 */
export const storyEventEntities = pgTable(
  'story_event_entities',
  {
    id: pk(),
    campaignId: campaignRef(),
    eventId: uuid()
      .notNull()
      .references(() => storyEvents.id, { onDelete: 'cascade' }),
    npcId: uuid().references(() => npcs.id, { onDelete: 'cascade' }),
    locationId: uuid().references(() => locations.id, { onDelete: 'cascade' }),
  },
  (t) => [
    index('story_event_entities_event_idx').on(t.eventId),
    index('story_event_entities_npc_idx').on(t.npcId),
    index('story_event_entities_location_idx').on(t.locationId),
    check('story_event_entities_one_target', sql`num_nonnulls(npc_id, location_id) = 1`),
  ],
);

/** Open threads: promises, mysteries, enemies, debts. Resolved ones are kept with their resolution. */
export const storyThreads = pgTable(
  'story_threads',
  {
    id: pk(),
    campaignId: campaignRef(),
    kind: text().$type<ThreadKind>().notNull(),
    summary: text().notNull(),
    importance: integer().notNull().default(2),
    npcIds: uuid().array().notNull().default(sql`'{}'::uuid[]`),
    openedTurn: integer().notNull(),
    resolvedTurn: integer(),
    resolution: text().notNull().default(''),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index('story_threads_campaign_idx').on(t.campaignId),
    check('story_threads_importance_range', sql`importance BETWEEN 1 AND 5`),
  ],
);

/**
 * One row per turn the extraction pass has looked at: what it returned, and whether it was applied.
 * Failures are kept (with the error) and retried, never silently dropped.
 */
export const extractionRuns = pgTable(
  'extraction_runs',
  {
    id: serialPk(),
    campaignId: campaignRef(),
    turnNumber: integer().notNull(),
    /** The narration it read; a different id means the turn was undone and replayed. */
    messageId: bigint({ mode: 'number' }).notNull(),
    status: text().$type<'applied' | 'failed' | 'stale'>().notNull(),
    attempts: integer().notNull().default(1),
    model: text().notNull().default(''),
    /** The model's raw structured output (also kept when it failed validation). */
    output: jsonb(),
    /** What was applied, for the debug view. */
    applied: jsonb(),
    error: text().notNull().default(''),
    inputTokens: integer().notNull().default(0),
    outputTokens: integer().notNull().default(0),
    latencyMs: integer().notNull().default(0),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    uniqueIndex('extraction_runs_campaign_turn_uq').on(t.campaignId, t.turnNumber),
    check('extraction_runs_status_valid', sql`status IN ('applied', 'failed', 'stale')`),
  ],
);
