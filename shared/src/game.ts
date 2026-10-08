import { z } from 'zod';

// Shapes of the structured (jsonb) game-state columns.

export const RELATIONSHIP_MIN = -100;
export const RELATIONSHIP_MAX = 100;
/** Most money a character can hold, and the most one change can move (well within a JS safe integer). */
export const MONEY_MAX = 1_000_000_000_000;

/** Largest bonus or penalty one modifier can apply to a check. */
export const MAX_EFFECT_BONUS = 5;
export const MAX_EFFECT_MODIFIERS = 4;

/**
 * A condition's effect on the dice: `bonus` is added to every skill_check whose skill or attribute
 * matches `target` (case-insensitive), or to every check when `target` is "all".
 */
export const EffectModifier = z.object({
  target: z.string().trim().min(1).max(120),
  bonus: z
    .number()
    .int()
    .min(-MAX_EFFECT_BONUS)
    .max(MAX_EFFECT_BONUS)
    .refine((n) => n !== 0, 'bonus cannot be 0'),
});
export type EffectModifier = z.infer<typeof EffectModifier>;

export const StatusEffect = z.object({
  name: z.string().trim().min(1).max(80),
  description: z.string().max(500).default(''),
  /** null = lasts until removed. */
  turnsRemaining: z.number().int().positive().nullable().default(null),
  /**
   * What it does to checks. Absent on effects from before modifiers existed (the narrator is asked
   * to review those once); [] means reviewed, and the effect is purely narrative.
   */
  modifiers: z.array(EffectModifier).max(MAX_EFFECT_MODIFIERS).optional(),
});
export type StatusEffect = z.infer<typeof StatusEffect>;
/** Room for a summoned hero's blessings and curses as well as ordinary conditions. */
export const MAX_STATUS_EFFECTS = 60;

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
  money: z.number().int().nonnegative().max(MONEY_MAX).optional(),
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

/** How much the narrator writes per turn. */
export const NARRATION_LENGTHS = ['brief', 'standard', 'rich'] as const;
export const NarrationLength = z.enum(NARRATION_LENGTHS);
export type NarrationLength = z.infer<typeof NarrationLength>;

export const ATTRIBUTES = ['strength', 'agility', 'vitality', 'perception', 'will'] as const;
export const AttributeName = z.enum(ATTRIBUTES);
export type AttributeName = z.infer<typeof AttributeName>;

/** Core attribute scores (ascension ruleset). Missing attributes count as 0. */
export const Attributes = z.partialRecord(AttributeName, z.number().int().min(0).max(999));
export type Attributes = z.infer<typeof Attributes>;

// ---------------------------------------------------------------- gear

/** Item grades run I to VII (Threshold's own scale; elsewhere I is fine work and VII mythic). 0 = ungraded. */
export const MAX_ITEM_GRADE = 7;

/** Worn gear helps whenever it is equipped; a wielded item only when it is the one being used. */
export const ITEM_USAGES = ['worn', 'wielded'] as const;
export const ItemUsage = z.enum(ITEM_USAGES);
export type ItemUsage = z.infer<typeof ItemUsage>;

/** What a graded item enhances: one skill (by name) or one core attribute. */
export const ItemEnhancement = z
  .object({
    skill: z.string().trim().min(1).max(120).optional(),
    attribute: AttributeName.optional(),
  })
  .refine((e) => (e.skill === undefined) !== (e.attribute === undefined), { message: 'Name either a skill or an attribute' });
export type ItemEnhancement = z.infer<typeof ItemEnhancement>;
export const MAX_ENHANCEMENTS = 4;

export const MISSION_RECURRENCES = ['daily'] as const;
export const MissionRecurrence = z.enum(MISSION_RECURRENCES);
export type MissionRecurrence = z.infer<typeof MissionRecurrence>;

/**
 * A recurring practice the character keeps up every night (sleep training, evening drills). The
 * engine grants its training XP automatically each in-game night, so it never depends on the
 * narrator remembering. Hours are shared between the skills, as in a time skip.
 */
export const Routine = z.object({
  name: z.string().trim().min(1).max(80),
  skills: z.array(z.string().trim().min(1).max(120)).min(1).max(4),
  hours: z.number().min(0.5).max(12).default(2),
  /** Who teaches it, if anyone capable does (speeds training up). */
  teacher: z.string().trim().max(120).default(''),
  /** Paused routines are kept but not applied. */
  active: z.boolean().default(true),
});
export type Routine = z.infer<typeof Routine>;
export const MAX_ROUTINES = 8;

/** Applied automatically to a recurring mission left incomplete when the day ends. */
export const MissionPenalty = z.object({
  hpLoss: z.number().int().positive().max(10_000).optional(),
  statusEffect: StatusEffect.optional(),
});
export type MissionPenalty = z.infer<typeof MissionPenalty>;
