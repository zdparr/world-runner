import { z } from 'zod';

// Shapes of the structured (jsonb) game-state columns.

export const RELATIONSHIP_MIN = -100;
export const RELATIONSHIP_MAX = 100;

export const StatusEffect = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(500).default(''),
  /** null = lasts until removed. */
  turnsRemaining: z.number().int().positive().nullable().default(null),
});
export type StatusEffect = z.infer<typeof StatusEffect>;

export const MissionObjective = z.object({
  id: z.string().min(1).max(40),
  text: z.string().trim().min(1).max(500),
  done: z.boolean().default(false),
});
export type MissionObjective = z.infer<typeof MissionObjective>;

/** Objectives as authored: ids are optional and assigned server-side. */
export const MissionObjectiveInput = MissionObjective.extend({ id: MissionObjective.shape.id.optional() });
export type MissionObjectiveInput = z.input<typeof MissionObjectiveInput>;

const Tags = z.array(z.string().trim().toLowerCase().min(1).max(40)).max(20);

/** Applied automatically when a mission is completed. */
export const MissionRewards = z.object({
  money: z.number().int().nonnegative().optional(),
  xp: z.number().int().nonnegative().optional(),
  items: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        quantity: z.number().int().positive().default(1),
        description: z.string().max(2000).default(''),
        tags: Tags.default([]),
      }),
    )
    .optional(),
  skillXp: z.array(z.object({ skill: z.string().trim().min(1), amount: z.number().int().positive() })).optional(),
  relationships: z
    .array(
      z.object({
        npc: z.string().trim().min(1),
        affinity: z.number().int().min(-200).max(200).default(0),
        trust: z.number().int().min(-200).max(200).default(0),
      }),
    )
    .optional(),
});
export type MissionRewards = z.infer<typeof MissionRewards>;

export { Tags };

// ---------------------------------------------------------------- rulesets

/**
 * A campaign's rule set. `classic` is skills-only. `ascension` adds core attributes, stat points
 * granted on level-up, and daily quests (a game-like System only the player character can see).
 */
export const RULESETS = ['classic', 'ascension'] as const;
export const Ruleset = z.enum(RULESETS);
export type Ruleset = z.infer<typeof Ruleset>;

export const ATTRIBUTES = ['strength', 'agility', 'vitality', 'perception', 'will'] as const;
export const AttributeName = z.enum(ATTRIBUTES);
export type AttributeName = z.infer<typeof AttributeName>;

/** Core attribute scores (ascension ruleset). Missing attributes count as 0. */
export const Attributes = z.partialRecord(AttributeName, z.number().int().min(0).max(999));
export type Attributes = z.infer<typeof Attributes>;

export const MISSION_RECURRENCES = ['daily'] as const;
export const MissionRecurrence = z.enum(MISSION_RECURRENCES);
export type MissionRecurrence = z.infer<typeof MissionRecurrence>;

/** Applied automatically to a recurring mission left incomplete when the day ends. */
export const MissionPenalty = z.object({
  hpLoss: z.number().int().positive().max(10_000).optional(),
  statusEffect: StatusEffect.optional(),
});
export type MissionPenalty = z.infer<typeof MissionPenalty>;
