import { describeRoute, distance, type MapPoint } from '@narrator/shared';

interface MapRow {
  id: string;
  name: string;
  parentLocationId: string | null;
  mapX: number | null;
  mapY: number | null;
}

/** A place's own map position, or its nearest placed parent's (a tavern sits where its town does). */
export function effectivePosition<T extends MapRow>(rows: T[], loc: T): MapPoint | null {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const seen = new Set<string>();
  for (let cur: T | undefined = loc; cur && !seen.has(cur.id); cur = cur.parentLocationId ? byId.get(cur.parentLocationId) : undefined) {
    seen.add(cur.id);
    if (cur.mapX !== null && cur.mapY !== null) return { x: cur.mapX, y: cur.mapY };
  }
  return null;
}

/**
 * The placed places nearest `loc`, with how far and which way each lies ("about 1 day west").
 * Leaves out the place itself, anything inside it, and anything it is inside.
 */
export function nearbyPlaces<T extends MapRow>(rows: T[], loc: T, limit = 6): { name: string; route: string }[] {
  const from = effectivePosition(rows, loc);
  if (!from) return [];
  const byId = new Map(rows.map((x) => [x.id, x]));
  const ancestry = (r: T): Set<string> => {
    const seen = new Set<string>();
    for (let cur: T | undefined = r; cur && !seen.has(cur.id); cur = cur.parentLocationId ? byId.get(cur.parentLocationId) : undefined) seen.add(cur.id);
    return seen;
  };
  const around = ancestry(loc);
  const related = (r: T) => around.has(r.id) || ancestry(r).has(loc.id);
  return rows
    .filter((r) => r.mapX !== null && r.mapY !== null && !related(r))
    .map((r) => ({ r, d: distance(from, { x: r.mapX!, y: r.mapY! }) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, limit)
    .map(({ r }) => ({ name: r.name, route: describeRoute(from, { x: r.mapX!, y: r.mapY! }) }));
}

/** Top-level places with no map position, while others have one (the world is mapped, but not all of it). */
export function unplacedPlaces<T extends MapRow>(rows: T[]): T[] {
  if (!rows.some((r) => r.mapX !== null && r.mapY !== null)) return [];
  return rows.filter((r) => !r.parentLocationId && (r.mapX === null || r.mapY === null));
}
