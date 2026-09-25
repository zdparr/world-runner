/**
 * Deterministic dice. Each roll is seeded from (campaign seed, turn, roll index within the turn),
 * so a roll can be reproduced exactly, and undoing a turn and replaying it gives the same dice:
 * no re-rolling by undo.
 */

// cyrb53-style 32-bit mix of several integers into one seed.
function mix(...parts: number[]): number {
  let h = 0x9e3779b9;
  for (const p of parts) {
    h = Math.imul(h ^ (p | 0), 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
  }
  return h >>> 0;
}

/** mulberry32: small, fast, well-distributed PRNG. Returns floats in [0, 1). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A d20 for the `index`-th roll of a turn. */
export function rollD20(campaignSeed: number, turnNumber: number, index: number): number {
  const next = mulberry32(mix(campaignSeed, turnNumber, index));
  return 1 + Math.floor(next() * 20);
}
