import { describe, expect, it } from 'vitest';
import { MAX_SKILL_LEVEL, resolveCheck, skillXpToNext, characterXpToNext, type Difficulty } from '@narrator/shared';
import { addXp } from '../src/engine/game';
import { rollD20 } from '../src/engine/rng';

describe('skill level-up thresholds', () => {
  it('costs 50 × (level + 1) xp per level', () => {
    expect([0, 1, 2, 3, 9].map(skillXpToNext)).toEqual([50, 100, 150, 200, 500]);
    expect([1, 2, 5].map(characterXpToNext)).toEqual([100, 200, 500]);
  });

  it('levels up exactly at the threshold, carrying the remainder', () => {
    expect(addXp(3, 199, 1, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 4, xp: 0 });
    expect(addXp(3, 190, 20, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 4, xp: 10 });
    expect(addXp(3, 198, 1, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 3, xp: 199 });
  });

  it('rolls over several levels at once', () => {
    // 0→1 costs 50, 1→2 costs 100, 2→3 costs 150: 310 xp from level 0 reaches level 3 with 10 left.
    expect(addXp(0, 0, 310, skillXpToNext, MAX_SKILL_LEVEL)).toEqual({ level: 3, xp: 10 });
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
