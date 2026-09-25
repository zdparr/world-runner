import { z } from 'zod';
import {
  MissionObjective,
  MissionObjectiveInput,
  MissionRewards,
  RELATIONSHIP_MAX,
  RELATIONSHIP_MIN,
  StatusEffect,
  Tags,
} from './game';

// CRUD contracts. `*Create` schemas validate POST bodies, `*Update` schemas validate PATCH bodies,
// and the interfaces describe what the API returns (timestamps as ISO strings).

const Name = z.string().trim().min(1).max(120);
const LongText = z.string().max(50_000);
const Id = z.uuid();

/**
 * PATCH schema from a create shape: every field optional, create-time defaults NOT applied
 * (zod 4 applies defaults even inside .optional(), so they are unwrapped first).
 */
function updateOf<T extends z.ZodRawShape>(shape: T) {
  const entries = Object.entries(shape).map(([key, field]) => {
    const base = field instanceof z.ZodDefault ? (field.unwrap() as z.ZodType) : (field as z.ZodType);
    return [key, base.optional()];
  });
  return z
    .object(Object.fromEntries(entries) as { [K in keyof T]: z.ZodOptional<T[K]> })
    .strict()
    .refine((o) => Object.keys(o).length > 0, 'Nothing to update');
}

// ---------------------------------------------------------------- campaigns

const campaignShape = {
  name: Name,
  worldBible: LongText.default(''),
  narratorStyle: LongText.default(''),
  currencyName: z.string().trim().min(1).max(40).default('gold'),
  historyWindow: z.number().int().min(2).max(40).default(8),
  summaryInterval: z.number().int().min(2).max(100).default(10),
};
export const CampaignCreate = z.object(campaignShape).strict();
export const CampaignUpdate = updateOf({ ...campaignShape, rollingSummary: LongText });
export type CampaignCreate = z.input<typeof CampaignCreate>;
export type CampaignUpdate = z.input<typeof CampaignUpdate>;

export interface Campaign {
  id: string;
  name: string;
  worldBible: string;
  narratorStyle: string;
  rollingSummary: string;
  currencyName: string;
  turnCount: number;
  historyWindow: number;
  summaryInterval: number;
  rngSeed: number;
  createdAt: string;
  updatedAt: string;
}

export interface CampaignListItem {
  id: string;
  name: string;
  turnCount: number;
  characterName: string | null;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- player character

const characterShape = {
  name: Name,
  archetype: z.string().trim().max(60).default(''),
  bio: LongText.default(''),
  currentLocationId: Id.nullable().default(null),
  money: z.number().int().nonnegative().default(0),
  level: z.number().int().min(1).max(100).default(1),
  xp: z.number().int().nonnegative().default(0),
  hp: z.number().int().nonnegative().default(10),
  maxHp: z.number().int().positive().default(10),
  statusEffects: z.array(StatusEffect).max(30).default([]),
};
export const CharacterUpsert = z
  .object(characterShape)
  .strict()
  .refine((c) => c.hp <= c.maxHp, { message: 'hp cannot exceed maxHp', path: ['hp'] });
// hp <= maxHp across a partial update is enforced by a DB check constraint.
export const CharacterUpdate = updateOf(characterShape);
export type CharacterUpsert = z.input<typeof CharacterUpsert>;
export type CharacterUpdate = z.input<typeof CharacterUpdate>;

export interface PlayerCharacter {
  campaignId: string;
  name: string;
  archetype: string;
  bio: string;
  currentLocationId: string | null;
  money: number;
  level: number;
  xp: number;
  hp: number;
  maxHp: number;
  statusEffects: StatusEffect[];
  updatedAt: string;
}

// ---------------------------------------------------------------- skills

const skillShape = {
  name: Name,
  level: z.number().int().min(0).max(100).default(1),
  xp: z.number().int().nonnegative().default(0),
  description: LongText.default(''),
};
export const SkillCreate = z.object(skillShape).strict();
export const SkillUpdate = updateOf(skillShape);
export type SkillCreate = z.input<typeof SkillCreate>;

export interface Skill {
  id: string;
  campaignId: string;
  name: string;
  level: number;
  xp: number;
  description: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- inventory

const itemShape = {
  name: Name,
  description: LongText.default(''),
  quantity: z.number().int().positive().default(1),
  tags: Tags.default([]),
  equipped: z.boolean().default(false),
  properties: z.record(z.string(), z.unknown()).default({}),
};
export const ItemCreate = z.object(itemShape).strict();
export const ItemUpdate = updateOf(itemShape);
export type ItemCreate = z.input<typeof ItemCreate>;

export interface InventoryItem {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  quantity: number;
  tags: string[];
  equipped: boolean;
  properties: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- locations

const locationShape = {
  name: Name,
  description: LongText.default(''),
  parentLocationId: Id.nullable().default(null),
  tags: Tags.default([]),
};
export const LocationCreate = z.object(locationShape).strict();
export const LocationUpdate = updateOf(locationShape);
export type LocationCreate = z.input<typeof LocationCreate>;

export interface Location {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  parentLocationId: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- NPCs

const npcShape = {
  name: Name,
  shortDescription: z.string().max(2000).default(''),
  faction: z.string().trim().max(120).default(''),
  locationId: Id.nullable().default(null),
  alive: z.boolean().default(true),
  notes: LongText.default(''),
};
export const NpcCreate = z.object(npcShape).strict();
export const NpcUpdate = updateOf(npcShape);
export type NpcCreate = z.input<typeof NpcCreate>;

export interface Npc {
  id: string;
  campaignId: string;
  name: string;
  shortDescription: string;
  faction: string;
  locationId: string | null;
  alive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- relationships

const Score = z.number().int().min(RELATIONSHIP_MIN).max(RELATIONSHIP_MAX);
const relationshipShape = {
  npcId: Id,
  affinity: Score.default(0),
  trust: Score.default(0),
  status: z.string().trim().max(60).default('stranger'),
  historyNotes: LongText.default(''),
};
export const RelationshipCreate = z.object(relationshipShape).strict();
const { npcId: _npcId, ...relationshipMutable } = relationshipShape;
export const RelationshipUpdate = updateOf(relationshipMutable);
export type RelationshipCreate = z.input<typeof RelationshipCreate>;

export interface Relationship {
  id: string;
  campaignId: string;
  npcId: string;
  affinity: number;
  trust: number;
  status: string;
  historyNotes: string;
  notesSinceCondense: number;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- lore

const loreShape = {
  title: Name,
  body: LongText.default(''),
  keywords: z.array(z.string().trim().toLowerCase().min(1).max(60)).max(40).default([]),
  alwaysInclude: z.boolean().default(false),
};
export const LoreCreate = z.object(loreShape).strict();
export const LoreUpdate = updateOf(loreShape);
export type LoreCreate = z.input<typeof LoreCreate>;

export interface LoreEntry {
  id: string;
  campaignId: string;
  title: string;
  body: string;
  keywords: string[];
  alwaysInclude: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- missions

export const MISSION_STATUSES = ['offered', 'active', 'completed', 'failed'] as const;
export type MissionStatus = (typeof MISSION_STATUSES)[number];

const missionShape = {
  title: Name,
  description: LongText.default(''),
  giverNpcId: Id.nullable().default(null),
  status: z.enum(MISSION_STATUSES).default('offered'),
  objectives: z.array(MissionObjectiveInput).max(30).default([]),
  rewards: MissionRewards.default({}),
};
export const MissionCreate = z.object(missionShape).strict();
export const MissionUpdate = updateOf(missionShape);
export type MissionCreate = z.input<typeof MissionCreate>;

export interface Mission {
  id: string;
  campaignId: string;
  title: string;
  description: string;
  giverNpcId: string | null;
  status: MissionStatus;
  objectives: MissionObjective[];
  rewards: MissionRewards;
  rewardsGranted: boolean;
  createdAt: string;
  updatedAt: string;
}

// ---------------------------------------------------------------- history (read-only via CRUD)

export type MessageRole = 'player' | 'narrator';

export interface Message {
  id: number;
  campaignId: string;
  turnNumber: number;
  role: MessageRole;
  content: string;
  summarized: boolean;
  createdAt: string;
}

export interface StateEvent {
  id: number;
  campaignId: string;
  turnNumber: number;
  eventType: string;
  payload: Record<string, unknown>;
  humanReadable: string;
  createdAt: string;
}

export interface TurnDebug {
  id: number;
  campaignId: string;
  turnNumber: number;
  model: string;
  contextManifest: unknown;
  toolCalls: unknown;
  inputTokens: number;
  outputTokens: number;
  cacheReadTokens: number;
  cacheCreationTokens: number;
  latencyMs: number;
  createdAt: string;
}

export interface Page<T> {
  items: T[];
  /** Pass as `before` to fetch the next (older) page; null when exhausted. */
  nextBefore: number | null;
}

// ---------------------------------------------------------------- character sheet (builder)

/** Skills and items in a sheet save: rows with an id are updated, rows without are created, missing rows are deleted. */
export const SheetSkill = SkillCreate.extend({ id: Id.optional() });
export const SheetItem = ItemCreate.extend({ id: Id.optional() });

function duplicateNames(rows: { name: string }[]): string[] {
  const seen = new Set<string>();
  const dups = new Set<string>();
  for (const { name } of rows) {
    const key = name.toLowerCase();
    if (seen.has(key)) dups.add(name);
    seen.add(key);
  }
  return [...dups];
}

export const CharacterSheetSave = z
  .object({
    character: CharacterUpsert,
    skills: z.array(SheetSkill).max(50),
    items: z.array(SheetItem).max(200),
  })
  .strict()
  .superRefine((sheet, ctx) => {
    for (const [key, label] of [
      ['skills', 'skill'],
      ['items', 'item'],
    ] as const) {
      for (const name of duplicateNames(sheet[key])) {
        ctx.addIssue({ code: 'custom', path: [key], message: `Two ${label}s are named "${name}"` });
      }
    }
  });
export type CharacterSheetSave = z.input<typeof CharacterSheetSave>;

export interface CharacterSheet {
  character: PlayerCharacter | null;
  skills: Skill[];
  items: InventoryItem[];
}

// ---------------------------------------------------------------- templates

export interface CampaignTemplate {
  id: string;
  name: string;
  description: string;
}

export const CampaignFromTemplate = z
  .object({
    templateId: z.string().min(1),
    name: Name,
    /** Include the template's pre-made character. Off: you build your own. */
    includeCharacter: z.boolean().default(false),
  })
  .strict();
export type CampaignFromTemplate = z.input<typeof CampaignFromTemplate>;

// ---------------------------------------------------------------- play screen snapshot

/** Everything the play screen's sidebar shows, in one request. */
export interface CampaignState {
  campaign: Pick<Campaign, 'id' | 'name' | 'currencyName' | 'turnCount' | 'rollingSummary' | 'summaryInterval'>;
  /** Whether post-turn memory upkeep (summary, note condensing) can run: needs an API key. */
  memoryEnabled: boolean;
  character: PlayerCharacter | null;
  location: Pick<Location, 'id' | 'name' | 'description'> | null;
  skills: Skill[];
  items: InventoryItem[];
  relationships: (Relationship & { npcName: string; npcAlive: boolean })[];
  missions: (Mission & { giverName: string | null })[];
}
