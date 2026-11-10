import { z } from 'zod';

// World-map geometry. Positions are in hours of travel on foot from the map's origin: x east, y north.

/** Furthest a place can sit from the origin on either axis (about a year's walk). */
export const MAX_MAP_HOURS = 100_000;
/** A day's travel on foot, for describing distances. */
export const HOURS_PER_DAY = 8;

/** The eight compass points, clockwise from north. */
export const COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'] as const;
export const Compass = z.enum(COMPASS);
export type Compass = z.infer<typeof Compass>;

const COMPASS_NAMES: Record<Compass, string> = {
  N: 'north',
  NE: 'northeast',
  E: 'east',
  SE: 'southeast',
  S: 'south',
  SW: 'southwest',
  W: 'west',
  NW: 'northwest',
};

export interface MapPoint {
  x: number;
  y: number;
}

/** The point `hours` of travel from `from` in `direction`. */
export function offset(from: MapPoint, direction: Compass, hours: number): MapPoint {
  const angle = (COMPASS.indexOf(direction) * Math.PI) / 4; // 0 = north, clockwise
  const round = (n: number) => Math.round(n * 100) / 100;
  return { x: round(from.x + Math.sin(angle) * hours), y: round(from.y + Math.cos(angle) * hours) };
}

/** Straight-line hours of travel between two points. */
export function distance(a: MapPoint, b: MapPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/** The nearest compass point from `from` toward `to`. */
export function bearing(from: MapPoint, to: MapPoint): Compass {
  const angle = Math.atan2(to.x - from.x, to.y - from.y); // 0 = north, clockwise
  const sector = Math.round(angle / (Math.PI / 4));
  return COMPASS[((sector % 8) + 8) % 8]!;
}

/** "3 hours", "about 2 days": how long the trip is on foot. */
export function describeHours(hours: number): string {
  if (hours < 0.75) return 'under an hour';
  if (hours < HOURS_PER_DAY * 0.75) {
    const h = Math.round(hours);
    return `${h} hour${h === 1 ? '' : 's'}`;
  }
  const days = Math.round((hours / HOURS_PER_DAY) * 2) / 2;
  return `about ${days} day${days === 1 ? '' : 's'}`;
}

/** "about 2 days northwest": where `to` lies from `from`. */
export function describeRoute(from: MapPoint, to: MapPoint): string {
  const hours = distance(from, to);
  if (hours < 0.25) return 'right here';
  return `${describeHours(hours)} ${COMPASS_NAMES[bearing(from, to)]}`;
}
