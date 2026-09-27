import { describe, expect, it } from 'vitest';
import {
  MAX_SKILL_LEVEL,
  NO_FUMBLE_LEVEL,
  checkXp,
  levelBonus,
  nextLevelBonusAt,
  resolveCheck,
  skillTier,
  skillXpToNext,
  characterXpToNext,
  trainingMadeTheDifference,
  trainingXp,
  type Difficulty,
} from '@narrator/shared';
import { addXp } from '../src/engine/game';
import { rollD20 } from '../src/engine/rng';

describe('skill level-up thresholds', () => {
  it('costs 25 × (level + 1) skill xp and 50 × (level + 1) character xp per level', () => {
    expect([0, 1, 2, 3, 9].map(skillXpToNext)).toEqual([25, 50, 75, 100, 250]);
    expect([1, 2, 5].map(characterXpToNext)).toEqual([100, 150, 300]);
  });

  it('levels up exactly at the threshold, carrying the remainder', () => {
    expect(addXp(3, 99, 1, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 4, xp: 0 });
    expect(addXp(3, 90, 20, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 4, xp: 10 });
    expect(addXp(3, 98, 1, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 3, xp: 99 });
  });

  it('rolls over several levels at once', () => {
    // 0→1 costs 25, 1→2 costs 50, 2→3 costs 75: 160 xp from level 0 reaches level 3 with 10 left.
    expect(addXp(0, 0, 160, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 3, xp: 10 });
  });

  it('stops at the max level', () => {
    const capped = addXp(MAX_SKILL_LEVEL - 1, 0, 1_000_000, skillXpToNext, MAX_SKILL_LEVEL);
    expect(capped.level).toBe(MAX_SKILL_LEVEL);
    expect(capped.xp).toBeLessThan(skillXpToNext(MAX_SKILL_LEVEL));
  });
});

describe('skill_check dice', () => {
  const N = 20_000;
  const rolls = Array.from({ length: N }, (_, i) => rollD20(12345, Math.floor(i / 7) + 1, i % 7));

  it('is deterministic for a given seed, turn, and roll index', () => {
    expect(rollD20(42, 7, 0)).toBe(rollD20(42, 7, 0));
    const varied = new Set(Array.from({ length: 50 }, (_, i) => rollD20(42, 7, i)));
    expect(varied.size).toBeGreaterThan(10);
  });

  it('rolls every face of a d20 about equally often', () => {
    const counts = new Array(21).fill(0);
    for (const r of rolls) counts[r]++;
    expect(counts[0]).toBe(0);
    for (let face = 1; face <= 20; face++) {
      // Expected 1000 per face; allow ±15%.
      expect(counts[face]).toBeGreaterThan(850);
      expect(counts[face]).toBeLessThan(1150);
    }
  });

  function rate(level: number, difficulty: Difficulty, outcome: 'success' | 'partial' | 'fail') {
    return rolls.filter((r) => resolveCheck(r, level, difficulty).outcome === outcome).length / N;
  }

  it('matches the expected success rates', () => {
    // Untrained vs medium (DC 12): need 12+ → 45%.
    expect(rate(0, 'medium', 'success')).toBeCloseTo(0.45, 1);
    // Level 5 vs medium: need 7+ → 70%.
    expect(rate(5, 'medium', 'success')).toBeCloseTo(0.7, 1);
    // Skill makes checks easier, difficulty makes them harder.
    expect(rate(5, 'hard', 'success')).toBeLessThan(rate(5, 'medium', 'success'));
    expect(rate(8, 'hard', 'success')).toBeGreaterThan(rate(2, 'hard', 'success'));
  });

  it('never makes a check certain', () => {
    // Even at a huge skill level a natural 1 fails; even untrained, a natural 20 succeeds against extreme.
    expect(rate(50, 'easy', 'fail')).toBeGreaterThan(0.03);
    expect(rate(0, 'extreme', 'success')).toBeGreaterThan(0.03);
  });

  it('gives partial successes within 3 of the DC', () => {
    expect(resolveCheck(10, 0, 'medium').outcome).toBe('partial'); // 10 vs 12
    expect(resolveCheck(9, 0, 'medium').outcome).toBe('partial'); // 9 vs 12
    expect(resolveCheck(8, 0, 'medium').outcome).toBe('fail'); // 8 vs 12
    expect(rate(0, 'medium', 'partial')).toBeCloseTo(0.15, 1);
  });
});

describe('progression that pays off', () => {
  it('adds a capped level bonus to every check', () => {
    expect([1, 3, 4, 7, 10, 16, 40, 100].map(levelBonus)).toEqual([0, 0, 1, 2, 3, 5, 5, 5]);
    expect([1, 4, 6, 16].map(nextLevelBonusAt)).toEqual([4, 7, 7, null]);
  });

  it('teaches more on harder checks, and something even on failure', () => {
    expect(checkXp('easy', 'success')).toBe(5);
    expect(checkXp('hard', 'success')).toBe(16);
    expect(checkXp('extreme', 'fail')).toBe(15);
    expect(checkXp('medium', 'fail')).toBeLessThan(checkXp('medium', 'partial'));
  });

  it('names skill tiers', () => {
    expect([0, 2, 3, 6, 10, 15, 20].map(skillTier)).toEqual(['Novice', 'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master', 'Grandmaster']);
  });

  it('stops a natural 1 from fumbling once a skill is well trained', () => {
    expect(resolveCheck(1, 12, 'medium', NO_FUMBLE_LEVEL - 1).outcome).toBe('fail');
    expect(resolveCheck(1, 12, 'medium', NO_FUMBLE_LEVEL).outcome).toBe('success');
    expect(resolveCheck(1, 6, 'hard', NO_FUMBLE_LEVEL).outcome).toBe('fail'); // 7 vs 16 still misses
  });

  it('knows when training turned a roll', () => {
    // Roll 10 vs medium (12): untrained is a partial; +3 skill makes it a success.
    expect(trainingMadeTheDifference(10, 'medium', 'success', 3, 0)).toBe(true);
    // Roll 15 succeeds either way.
    expect(trainingMadeTheDifference(15, 'medium', 'success', 3, 0)).toBe(false);
    expect(trainingMadeTheDifference(10, 'medium', 'partial', 0, 0)).toBe(false);
  });

  it('makes weeks of training worth levels', () => {
    // Two weeks of primary training with a teacher: 14 × 15 × 1.5 = 315 xp, enough to take level 3 to level 5.
    expect(trainingXp(14, 'primary', true, 3)).toBe(315);
    expect(trainingXp(14, 'secondary', false, 3)).toBe(105);
    // Past level 10, training alone is half as effective.
    expect(trainingXp(10, 'primary', false, 12)).toBe(75);
    expect(trainingXp(10, 'primary', true, 12)).toBe(225);
    // A short session still counts for something.
    expect(trainingXp(0.01, 'primary', false, 0)).toBe(1);
  });
});
