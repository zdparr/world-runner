import type { MapArt, Pt } from './types';

/**
 * Cindral and its valley, at city scale (a 20-minute walk is about 85 px). The broad Halva runs west to
 * east through the city; the walled old town and its canals sit on the north bank, with Highcourt on its
 * hill across the river. The Spire tore out of the vineyards at the north edge of the city, ringed by
 * the Foot's plaza and the boomtown of the north districts; the vineyard terraces climb the slopes
 * beyond, and orchards and water meadows fill the valley floor. The rest of Halvane lies past the
 * map's edge. Coordinates are hours on foot from the middle of Cindral (x east, y north); the Spire's
 * floors are not on the surface and are not drawn.
 *
 * The Halva is water, not a line: the land is two shapes, north and south of it, whose banks follow
 * points close enough together that the drawing leaves them smooth.
 */

const PX = 260;

/** Points every `step` hours along a line, so the drawn bank along it is not roughened. */
function densify(line: Pt[], step: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i]!;
    const [bx, by] = line[i + 1]!;
    const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step));
    for (let k = 0; k < n; k++) out.push([ax + ((bx - ax) * k) / n, ay + ((by - ay) * k) / n]);
  }
  out.push(line[line.length - 1]!);
  return out;
}

/** The two banks of a river `width` hours wide along a centre line: [north/left bank, south/right bank]. */
function banks(centre: Pt[], width: number): [Pt[], Pt[]] {
  const left: Pt[] = [];
  const right: Pt[] = [];
  centre.forEach((p, i) => {
    const a = centre[Math.max(0, i - 1)]!;
    const b = centre[Math.min(centre.length - 1, i + 1)]!;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const nx = -(b[1] - a[1]) / len;
    const ny = (b[0] - a[0]) / len;
    left.push([p[0] + (nx * width) / 2, p[1] + (ny * width) / 2]);
    right.push([p[0] - (nx * width) / 2, p[1] - (ny * width) / 2]);
  });
  return [left, right];
}

// The Halva, west to east through Cindral.
const HALVA = densify(
  [
    [-4.4, 0.62],
    [-3, 0.5],
    [-2.2, 0.36],
    [-1.4, 0.16],
    [-0.8, -0.04],
    [-0.3, -0.16],
    [0.3, -0.2],
    [0.9, -0.12],
    [1.5, -0.3],
    [2.2, -0.6],
    [3, -0.86],
    [4.4, -1.1],
  ],
  0.03,
);
const [NORTH_BANK, SOUTH_BANK] = banks(HALVA, 0.15);
const far = 60;

export const spireMap: MapArt = {
  id: 'spire',
  px: PX,
  bounds: { minX: -2.5, maxX: 2.5, minY: -2.2, maxY: 2.6 },

  land: [
    // North of the Halva: the old town, the north districts, the Spire, and the vineyard slopes.
    [...NORTH_BANK, [far, NORTH_BANK[NORTH_BANK.length - 1]![1]], [far, far], [-far, far], [-far, NORTH_BANK[0]![1]]],
    // South of it: Highcourt's hill and the valley farms.
    [...SOUTH_BANK, [far, SOUTH_BANK[SOUTH_BANK.length - 1]![1]], [far, -far], [-far, -far], [-far, SOUTH_BANK[0]![1]]],
    // Mill islet below the old town.
    [
      [1.12, -0.19],
      [1.22, -0.17],
      [1.26, -0.22],
      [1.16, -0.25],
    ],
  ],

  realms: [
    { name: 'Halvane', color: '#c98e5a', area: [[-far, -far], [far, -far], [far, far], [-far, far]] },
    // The walled city, both banks.
    {
      name: 'Cindral',
      color: '#d0674a',
      area: [[-0.62, 0.02], [-0.42, 0.24], [-0.1, 0.3], [0.3, 0.28], [0.62, 0.18], [0.82, -0.04], [0.78, -0.42], [0.6, -0.8], [0.3, -0.94], [-0.06, -0.86], [-0.32, -0.56], [-0.5, -0.3]],
      outline: true,
    },
    // The boomtown between the walls and the Spire.
    {
      name: 'The North Districts',
      color: '#e0b25a',
      area: [[-0.62, 0.02], [-0.42, 0.24], [-0.1, 0.3], [0.3, 0.28], [0.62, 0.18], [0.82, -0.04], [0.9, 0.3], [0.66, 0.56], [0.3, 0.7], [-0.24, 0.7], [-0.56, 0.52], [-0.78, 0.26]],
      outline: true,
    },
    // The Foot of the Spire: the plaza of torn vineyard round its base.
    {
      name: 'The Foot of the Spire',
      color: '#f2ead8',
      area: [[0.04, 0.55], [0.11, 0.52], [0.14, 0.45], [0.11, 0.38], [0.04, 0.35], [-0.03, 0.38], [-0.06, 0.45], [-0.03, 0.52]],
      outline: true,
    },
  ],

  borders: [],

  rivers: [
    // The Old Canal: off the Halva above the city, round the old town, and back in below it.
    [[-0.86, -0.02], [-0.62, 0.1], [-0.36, 0.2], [0, 0.22], [0.36, 0.18], [0.66, 0.06], [0.9, -0.1]],
    // The cross canal through the market quarter.
    [[-0.16, 0.21], [-0.12, 0.06], [-0.1, -0.15]],
    // The Vinebrook, down off the north slopes past the torn vineyards into the canal.
    [[-0.9, 3.4], [-0.7, 2.4], [-0.6, 1.5], [-0.62, 0.9], [-0.7, 0.5], [-0.62, 0.1]],
    // Streams off the hills into the Halva.
    [[2.2, 3.4], [2, 2.2], [1.7, 1.2], [1.5, 0.4], [1.3, -0.18]],
    [[-2.6, -3.2], [-2.2, -2], [-1.8, -1], [-1.5, 0.08]],
    [[1.4, -3.2], [1.6, -2.2], [1.9, -1.2], [2, -0.48]],
  ],

  ranges: [],
  peaks: [],

  hills: [
    // The vineyard terraces on the north slopes.
    [[-3.4, 1.2], [-2.2, 0.9], [-1.2, 1.1], [-0.6, 1.2], [-0.4, 2], [-1, 2.8], [-2.4, 3.4], [-3.4, 3.4]],
    [[0.5, 1.1], [1.2, 0.8], [2.4, 0.6], [3.4, 0.4], [3.4, 2.8], [2.6, 3.4], [1.2, 3.4], [0.6, 2.4]],
    [[-0.3, 1.5], [0.4, 1.4], [0.5, 2.6], [-0.2, 2.8]],
    // Highcourt's hill.
    [[-0.08, -0.72], [0.22, -0.56], [0.56, -0.62], [0.66, -0.88], [0.4, -1.08], [0.02, -1.02]],
    // The southern downs.
    [[-3.4, -1.6], [-2.4, -1.4], [-1.6, -2.2], [-2, -3.2], [-3.4, -3.2]],
    [[0.4, -2.2], [1.2, -1.9], [1.6, -2.6], [0.8, -3.2], [0, -3]],
  ],

  forests: [
    // Highcourt's cypress gardens.
    { kind: 'pine', area: [[0.6, -0.58], [0.8, -0.5], [0.86, -0.74], [0.68, -0.82]] },
    // Orchards and woods of the valley floor.
    { kind: 'broadleaf', area: [[-2.8, -0.2], [-2, -0.1], [-1.6, -0.6], [-2.2, -1.1], [-2.9, -0.9]] },
    { kind: 'broadleaf', area: [[-1.2, -1.2], [-0.6, -1.3], [-0.5, -1.9], [-1.1, -2.2], [-1.5, -1.7]] },
    { kind: 'broadleaf', area: [[2.4, 0.2], [3.3, 0], [3.3, -0.5], [2.5, -0.3]] },
    { kind: 'broadleaf', area: [[2.2, -1.6], [3, -1.5], [3.2, -2.4], [2.4, -2.6]] },
  ],

  marshes: [
    // Water meadows on the Halva's bends.
    [[1.6, -0.5], [2.1, -0.72], [2.6, -0.9], [2.5, -1.2], [1.9, -1.0], [1.5, -0.74]],
    [[-3.4, 0.4], [-2.6, 0.32], [-2.2, 0.2], [-2.6, 0.02], [-3.4, 0.1]],
  ],

  labels: [
    { text: 'HALVANE', at: [0.9, -1.5], kind: 'realm' },
    { text: 'the Halva', at: [-1.9, 0.48], kind: 'water', rotate: 14 },
    { text: 'River Halva', at: [2.0, -0.36], kind: 'water', rotate: 20 },
    { text: 'Old Canal', at: [0.4, 0.26], kind: 'water', rotate: -8 },
    { text: 'Vinebrook', at: [-0.78, 1.7], kind: 'water', rotate: -84 },
    { text: 'Highcourt Hill', at: [0.3, -1.18], kind: 'feature' },
    { text: 'the North Districts', at: [-0.42, 0.62], kind: 'feature' },
    { text: 'the torn vineyards', at: [0.1, 1.0], kind: 'feature' },
    { text: 'vineyard terraces', at: [-1.6, 1.9], kind: 'feature' },
    { text: 'the east terraces', at: [1.7, 1.7], kind: 'feature' },
    { text: 'water meadows', at: [2.05, -1.38], kind: 'feature' },
    { text: 'the old town', at: [0.36, 0.02], kind: 'feature' },
  ],
};
