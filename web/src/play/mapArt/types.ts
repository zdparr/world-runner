/** A point in world coordinates: hours on foot from the world's origin, x east and y north. */
export type Pt = [number, number];

/**
 * A drawn terrain map for one world, in the same coordinates as its locations' `map` positions.
 * Shapes may run past `bounds` (the land goes on beyond the map's edge); `bounds` is the area shown.
 */
export interface MapArt {
  id: string;
  bounds: { minX: number; maxX: number; minY: number; maxY: number };
  /** Closed coastlines; everything outside them is sea. */
  land: Pt[][];
  /** Tinted territories, clipped to the land. `outline` draws the edge too (a small enclave). */
  realms: { name: string; color: string; area: Pt[]; outline?: boolean }[];
  /** Dashed frontiers, clipped to the land. */
  borders: Pt[][];
  /** Each from its source to its mouth. */
  rivers: Pt[][];
  /** Mountain chains, drawn as peaks along each line. */
  ranges: Pt[][];
  /** Single great peaks. */
  peaks: Pt[];
  hills: Pt[][];
  forests: { kind: 'broadleaf' | 'pine'; area: Pt[] }[];
  marshes: Pt[][];
  labels: { text: string; at: Pt; kind: 'realm' | 'sea' | 'water' | 'feature'; rotate?: number }[];
}
