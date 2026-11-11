import { emptyCrownMap } from './emptyCrown';
import type { MapArt } from './types';

export type { MapArt, Pt } from './types';

/** Drawn maps by id: a campaign's `map.art` names one (set from its world's `mapArt`). */
const ARTS: Record<string, MapArt> = {
  [emptyCrownMap.id]: emptyCrownMap,
};

export function findMapArt(id: string | null | undefined): MapArt | null {
  return id ? (ARTS[id] ?? null) : null;
}
