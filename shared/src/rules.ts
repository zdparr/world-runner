// Game rules shared by the engine (which enforces them) and the UI (which draws progress bars).

export const MAX_SKILL_LEVEL = 20;
export const MAX_CHARACTER_LEVEL = 100;

/** XP needed to go from skill `level` to `level + 1`. XP is stored as progress within the current level. */
export function skillXpToNext(level: number): number {
  return 50 * (level + 1);
}

/** XP needed to go from character `level` to `level + 1`. */
export function characterXpToNext(level: number): number {
  return 100 * level;
}

/** Max HP gained per character level-up (current HP rises by the same amount). */
export const HP_PER_LEVEL = 2;

export const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'] as const;
export type Difficulty = (typeof DIFFICULTIES)[number];

/** Target number for d20 + skill level. */
export const DIFFICULTY_DC: Record<Difficulty, number> = { easy: 8, medium: 12, hard: 16, extreme: 20 };

/** Missing the DC by this much or less is a partial success (success at a cost). */
export const PARTIAL_MARGIN = 3;

export type CheckOutcome = 'success' | 'partial' | 'fail';

/** Skill XP earned by attempting a check, win or lose (you learn from failure too). */
export const CHECK_XP: Record<CheckOutcome, number> = { success: 10, partial: 7, fail: 5 };

/**
 * Resolve a d20 roll. A natural 20 always succeeds and a natural 1 always fails,
 * so no check is ever certain either way.
 */
export function resolveCheck(roll: number, modifier: number, difficulty: Difficulty): { total: number; dc: number; outcome: CheckOutcome } {
  const dc = DIFFICULTY_DC[difficulty];
  const total = roll + modifier;
  let outcome: CheckOutcome;
  if (roll === 20) outcome = 'success';
  else if (roll === 1) outcome = 'fail';
  else if (total >= dc) outcome = 'success';
  else if (total >= dc - PARTIAL_MARGIN) outcome = 'partial';
  else outcome = 'fail';
  return { total, dc, outcome };
}
