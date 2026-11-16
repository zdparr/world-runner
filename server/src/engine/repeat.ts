/**
 * Detects a narration that copies the previous one. Small local models sometimes reproduce their
 * last reply almost word for word, and once a copy is saved the history teaches them to keep doing
 * it. A turn that repeats is failed (nothing saved) so the loop never starts.
 */

/** Share of the shorter narration's word triples that also appear in the other. */
export function narrationOverlap(a: string, b: string): number {
  const A = trigrams(a);
  const B = trigrams(b);
  if (A.size === 0 || B.size === 0) return 0;
  let shared = 0;
  for (const g of A) if (B.has(g)) shared++;
  return shared / Math.min(A.size, B.size);
}

/**
 * At or above this, the narration is treated as a copy. Ordinary consecutive narrations of the
 * same scene measured 2-16% (names and stock phrases recur); a copy is near 100%.
 */
export const REPEAT_THRESHOLD = 0.6;

/** Too short to judge: one-line replies legitimately share most of their words. */
const MIN_TRIGRAMS = 20;

export function isRepeat(narration: string, previous: string | undefined): boolean {
  if (!previous) return false;
  const n = trigrams(narration).size;
  if (n < MIN_TRIGRAMS || trigrams(previous).size < MIN_TRIGRAMS) return false;
  return narrationOverlap(narration, previous) >= REPEAT_THRESHOLD;
}

/**
 * Share of word triples that are repeats of an earlier one in the same text. A model stuck in a
 * loop writes the same passage again and again (near 100% after a few cycles); ordinary prose
 * stays in single digits.
 */
export function selfRepetition(text: string): number {
  const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  const total = words.length - 2;
  if (total < MIN_TRIGRAMS) return 0;
  const seen = new Set<string>();
  let repeats = 0;
  for (let i = 0; i < total; i++) {
    const g = `${words[i]} ${words[i + 1]} ${words[i + 2]}`;
    if (seen.has(g)) repeats++;
    else seen.add(g);
  }
  return repeats / total;
}

/** At or above this, a narration is looping on itself. */
export const LOOP_THRESHOLD = 0.4;

export const isLooping = (narration: string) => selfRepetition(narration) >= LOOP_THRESHOLD;

function trigrams(text: string): Set<string> {
  const words = text.toLowerCase().match(/[\p{L}\p{N}']+/gu) ?? [];
  const out = new Set<string>();
  for (let i = 0; i + 2 < words.length; i++) out.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  return out;
}
