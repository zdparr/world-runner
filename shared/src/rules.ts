// Game rules shared by the engine (which enforces them) and the UI (which draws progress bars).

import { MAX_ITEM_GRADE, type ItemEnhancement, type ItemUsage } from './game';

export const MAX_SKILL_LEVEL = 20;
export const MAX_CHARACTER_LEVEL = 100;

/**
 * XP needed to go from skill `level` to `level + 1`. XP is stored as progress within the current level.
 * 25, 50, 75, ...: a handful of real uses or a few days of training reach the early levels, and
 * mastery (10+) takes a campaign's worth of work.
 */
export function skillXpToNext(level: number): number {
  return 25 * (level + 1);
}

/** XP needed to go from character `level` to `level + 1`: 100, 150, 200, ... */
export function characterXpToNext(level: number): number {
  return 50 * (level + 1);
}

/** Max HP gained per character level-up (current HP rises by the same amount). */
export const HP_PER_LEVEL = 3;

/**
 * Bonus the character's level adds to every check: experience counts for something even outside
 * their trained skills. +1 at levels 4, 7, 10, 13, and 16, then capped so a d20 still matters.
 */
export const LEVEL_BONUS_CAP = 5;
export function levelBonus(level: number): number {
  return Math.min(LEVEL_BONUS_CAP, Math.max(0, Math.floor((level - 1) / 3)));
}
/** The next character level that raises the level bonus, or null once it is capped. */
export function nextLevelBonusAt(level: number): number | null {
  return levelBonus(level) >= LEVEL_BONUS_CAP ? null : (levelBonus(level) + 1) * 3 + 1;
}

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Target number for d20 + modifiers. */
export const DIFFICULTY_DC: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 16, extreme: 20 };

/** Missing the DC by this much or less is a partial success (success at a cost). */
export const PARTIAL_MARGIN = 3;

export type CheckOutcome = 'success' | 'partial' | 'fail';

/** Skill XP for attempting a check, by difficulty. Harder tries teach more. */
export const CHECK_XP_BY_DIFFICULTY: Record<Difficulty, number> = { easy: 5, medium: 10, hard: 16, extreme: 25 };
/** Share of that XP by outcome: you learn from failure too, just less. */
const CHECK_XP_SHARE: Record<CheckOutcome, number> = { success: 1, partial: 0.8, fail: 0.6 };

export function checkXp(difficulty: Difficulty, outcome: CheckOutcome): number {
  return Math.round(CHECK_XP_BY_DIFFICULTY[difficulty] * CHECK_XP_SHARE[outcome]);
}

/**
 * Skill level at which a natural 1 stops being an automatic failure: a master doesn't fumble what
 * they could do in their sleep (the total still has to beat the DC).
 */
export const NO_FUMBLE_LEVEL = 6;

/**
 * Resolve a d20 roll. A natural 20 always succeeds and (below NO_FUMBLE_LEVEL) a natural 1 always
 * fails, so no check is ever certain for the unskilled.
 */
export function resolveCheck(
  roll: number,
  modifier: number,
  difficulty: Difficulty,
  skillLevel = 0,
): { total: number; dc: number; outcome: CheckOutcome } {
  const dc = DIFFICULTY_DC[difficulty];
  const total = roll + modifier;
  let outcome: CheckOutcome;
  if (roll === 20) outcome = 'success';
  else if (roll === 1 && skillLevel < NO_FUMBLE_LEVEL) outcome = 'fail';
  else if (total >= dc) outcome = 'success';
  else if (total >= dc - PARTIAL_MARGIN) outcome = 'partial';
  else outcome = 'fail';
  return { total, dc, outcome };
}

const OUTCOME_RANK: Record<CheckOutcome, number> = { fail: 0, partial: 1, success: 2 };

/**
 * What the character's training bought on this roll: 'skill' when the same roll untrained (no skill
 * or attribute bonus, level bonus kept) would have come out worse. The narrator credits it in the
 * story, and the UI marks it, so growth is felt rather than just tallied.
 */
export function trainingMadeTheDifference(
  roll: number,
  difficulty: Difficulty,
  outcome: CheckOutcome,
  trainedBonus: number,
  otherBonus: number,
): boolean {
  if (trainedBonus <= 0) return false;
  const untrained = resolveCheck(roll, otherBonus, difficulty).outcome;
  return OUTCOME_RANK[outcome] > OUTCOME_RANK[untrained];
}

// ---------------------------------------------------------------- conditions

export interface EffectBonus {
  effect: string;
  target: string;
  bonus: number;
}

/** Every condition modifier that applies to a check with this skill (and attribute). */
export function effectBonuses(
  effects: { name: string; modifiers?: { target: string; bonus: number }[] }[],
  skill: string,
  attribute: string | undefined,
): EffectBonus[] {
  const targets = new Set(['all', skill.toLowerCase(), ...(attribute ? [attribute.toLowerCase()] : [])]);
  return effects.flatMap((e) =>
    (e.modifiers ?? []).filter((m) => targets.has(m.target.trim().toLowerCase())).map((m) => ({ effect: e.name, target: m.target, bonus: m.bonus })),
  );
}

/**
 * Whether the character's conditions changed this roll's outcome: 'helped' when the same roll
 * without them would have come out worse, 'hurt' when it would have come out better.
 */
export function effectsMadeTheDifference(
  roll: number,
  difficulty: Difficulty,
  outcome: CheckOutcome,
  modifier: number,
  effectTotal: number,
  skillLevel: number,
): 'helped' | 'hurt' | null {
  if (effectTotal === 0) return null;
  const without = OUTCOME_RANK[resolveCheck(roll, modifier - effectTotal, difficulty, skillLevel).outcome];
  if (OUTCOME_RANK[outcome] > without) return 'helped';
  if (OUTCOME_RANK[outcome] < without) return 'hurt';
  return null;
}

/** "Curse: Honest Face (Persuasion -3, Deception -3)", for the narrator's context and the UI. */
export function describeEffect(e: { name: string; turnsRemaining: number | null; modifiers?: { target: string; bonus: number }[] }): string {
  const mods = (e.modifiers ?? []).map((m) => `${m.target === 'all' ? 'all checks' : m.target} ${m.bonus > 0 ? '+' : ''}${m.bonus}`);
  const extras = [...mods, ...(e.turnsRemaining ? [`${e.turnsRemaining} turns left`] : [])];
  return extras.length > 0 ? `${e.name} (${extras.join(', ')})` : e.name;
}

// ---------------------------------------------------------------- world

/** Every world should have at least this many locations, each with a purpose in the story. */
export const MIN_WORLD_LOCATIONS = 6;

// ---------------------------------------------------------------- skill tiers

export const SKILL_TIERS = [
  { min: 0, name: 'Novice' },
  { min: 3, name: 'Apprentice' },
  { min: 6, name: 'Journeyman' },
  { min: 10, name: 'Expert' },
  { min: 15, name: 'Master' },
  { min: 20, name: 'Grandmaster' },
] as const;

export function skillTier(level: number): string {
  let name: string = SKILL_TIERS[0].name;
  for (const t of SKILL_TIERS) if (level >= t.min) name = t.name;
  return name;
}

// ---------------------------------------------------------------- time skips and training

/** Longest stretch one time skip may cover. */
export const MAX_SKIP_DAYS = 90;
/** Skill XP for one full day of focused training on a primary skill. */
export const TRAINING_XP_PER_DAY = 15;
/** Focused hours that count as one full training day (a 3-hour session is half a day). */
export const TRAINING_HOURS_PER_DAY = 6;
/** A capable teacher speeds training up by this factor. */
export const TEACHER_MULTIPLIER = 1.5;
/** A secondary focus gets this share of the time. */
export const SECONDARY_SHARE = 0.5;
/** Past this level, training alone is half as effective: you need someone better to learn from. */
export const SELF_TAUGHT_LIMIT = 10;
/** Character XP per day spent training (seasoning, not a substitute for adventure). */
export const TRAINING_CHARACTER_XP_PER_DAY = 5;
/** Share of max HP recovered per day of rest or training. */
export const HEAL_SHARE_PER_DAY = 0.25;

export type TrainingFocus = 'primary' | 'secondary';

/** Skill XP earned by training one skill for `days` (fractional for sessions shorter than a day). */
export function trainingXp(days: number, focus: TrainingFocus, withTeacher: boolean, skillLevel: number): number {
  let rate = TRAINING_XP_PER_DAY * (focus === 'primary' ? 1 : SECONDARY_SHARE);
  if (withTeacher) rate *= TEACHER_MULTIPLIER;
  else if (skillLevel >= SELF_TAUGHT_LIMIT) rate *= 0.5;
  return Math.max(1, Math.round(days * rate));
}

// ---------------------------------------------------------------- attributes (ascension)

/** Added to every attribute automatically on each character level-up (ascension ruleset). */
export const ATTRIBUTE_GAIN_PER_LEVEL = 1;

/** Free stat points granted per character level-up for the player to allocate (ascension ruleset). */
export const STAT_POINTS_PER_LEVEL = 1;

/** Points per +1 an attribute adds to a skill check (ascension ruleset). */
export const POINTS_PER_ATTRIBUTE_BONUS = 3;

export function attributeBonus(score: number): number {
  return Math.floor(score / POINTS_PER_ATTRIBUTE_BONUS);
}

// ---------------------------------------------------------------- gear

const GRADE_NUMERALS = ['', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];

/** Check bonus from an item of this grade: Grade I +1 up to Grade VII +7. Ungraded gear adds nothing. */
export function gradeBonus(grade: number): number {
  return Math.max(0, Math.min(MAX_ITEM_GRADE, Math.trunc(grade)));
}

export function gradeLabel(grade: number): string {
  return grade > 0 ? `Grade ${GRADE_NUMERALS[Math.min(grade, MAX_ITEM_GRADE)]}` : 'ungraded';
}

export interface GearItem {
  name: string;
  equipped: boolean;
  grade: number;
  usage: ItemUsage;
  enhances: ItemEnhancement[];
}

export interface GearBonus {
  item: string;
  grade: number;
  usage: ItemUsage;
  bonus: number;
}

/**
 * The gear that counts on one check: the best equipped worn item that enhances the skill or the
 * attribute, plus the wielded item being used (`using`) if it does. At most one of each, so a
 * drawer of trinkets doesn't stack.
 */
export function gearBonuses(items: GearItem[], skill: string, attribute: string | undefined, using: string | undefined): GearBonus[] {
  const helps = (i: GearItem) =>
    i.equipped &&
    gradeBonus(i.grade) > 0 &&
    i.enhances.some((e) => (e.skill !== undefined && e.skill.toLowerCase() === skill.toLowerCase()) || (attribute !== undefined && e.attribute === attribute));
  const toBonus = (i: GearItem): GearBonus => ({ item: i.name, grade: i.grade, usage: i.usage, bonus: gradeBonus(i.grade) });
  const worn = items.filter((i) => i.usage === 'worn' && helps(i)).sort((a, b) => b.grade - a.grade)[0];
  const wielded = using ? items.find((i) => i.usage === 'wielded' && i.name.toLowerCase() === using.toLowerCase() && helps(i)) : undefined;
  return [wielded, worn].filter((i): i is GearItem => Boolean(i)).map(toBonus);
}
