import type { MapArt, Pt } from './types';

/**
 * The Kingdom of Aldermere. The frontier is in the west: the Thornwood, with Millbrook at its eastern
 * edge where the Mill bends out of the trees; the Saltmarsh Coast's fogs and channels where the Mill
 * meets the Sea of Fogs, two and a half days west; the Greywall Mountains and their ruined dwarven
 * holds across the north, with the drowned abbey's lake (Abbey Mere, the Mill's source) at the edge of
 * their foothills; and the volcanic Ashen Reach to the south, running down to the Southern Sea. Ten
 * days east along the King's Road, Solhaven stands on its hill above the broad Aldwater.
 * Coordinates are hours on foot from the Waking Glade in the Thornwood (x east, y north).
 *
 * Abbey Mere is cut out of the land as a lake: the outline runs up the Mill from the sea and round the
 * shore, along points close enough together that the drawing leaves both banks unroughened.
 */

const PX = 10;

/** Points every `step` hours along a line, so the drawn coast and river along it are not roughened. */
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

/** An oval shore, `n` points round from `startDeg`, turning the way `sign` says (1 anticlockwise). */
function oval(cx: number, cy: number, rx: number, ry: number, n: number, startDeg: number, sign: 1 | -1): Pt[] {
  return Array.from({ length: n }, (_, i) => {
    const a = ((startDeg + (sign * 360 * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });
}

const STEP = (0.9 * 8) / PX;

// The Mill, from Abbey Mere down through the Thornwood, round Millbrook's bend, past Hollin's Ford to the sea.
const MILL = densify(
  [
    [-7.67, 16.44],
    [-6, 13],
    [-3.6, 9],
    [-1.4, 5],
    [0.4, 2],
    [1.4, 0.4],
    [0.8, -1.2],
    [-2, -2.4],
    [-5, -3],
    [-8, -3.6],
    [-12, -4.2],
    [-16, -4.6],
    [-19.4, -5.4],
    [-23.4, -5],
  ],
  STEP,
);
const ABBEY_MERE = oval(-9.6, 17.9, 3, 1.9, 22, -50, -1);
const lakeLoop = (river: Pt[], shore: Pt[]): Pt[] => [...[...river].reverse(), ...shore, ...river.slice(0, -1)];

export const aldermereMap: MapArt = {
  id: 'aldermere',
  px: PX,
  bounds: { minX: -38, maxX: 96, minY: -48, maxY: 52 },

  land: [
    // The kingdom: the west coast from beyond the Greywall down past the Saltmarsh Coast, then the south
    // coast under the Ashen Reach to the Aldwater's mouth, and away east past the map's edge.
    [
      [-40, 400],
      [-32, 64],
      [-30, 54],
      [-33, 47],
      [-28.6, 40],
      [-26, 31],
      [-29.4, 24.6],
      [-26.6, 19],
      [-25, 13.4],
      [-27.6, 9],
      [-23.4, 6.6],
      [-22.4, 2],
      [-24.2, -1.6],
      ...lakeLoop(MILL, ABBEY_MERE),
      [-21.6, -8.4],
      [-24.6, -11.2],
      [-22.8, -15],
      [-25.6, -19.6],
      [-22.4, -24],
      [-21, -30],
      [-16.6, -35],
      [-10, -38.6],
      [-4, -41.6],
      [3, -42.4],
      [10, -40.4],
      [16, -41.4],
      [22, -38.4],
      [28, -40.6],
      [36, -38.6],
      [44, -36.4],
      [52, -38.4],
      [60, -36.6],
      [68, -33.4],
      [76, -34.6],
      [82, -33.4],
      [86.6, -31.6], // the Aldwater's mouth
      [90, -34.4],
      [98, -36],
      [110, -38],
      [140, -42],
      [400, -50],
      [400, 400],
    ],
    // Isles in the Sea of Fogs, off the Saltmarsh.
    [
      [-31, -10],
      [-29, -8.6],
      [-28, -10.6],
      [-30, -12],
    ],
    [
      [-33.6, 14],
      [-31.4, 15.6],
      [-30, 13.4],
      [-32.4, 12],
    ],
    // A smoking isle off the Ashen Reach.
    [
      [6, -46.6],
      [9, -45],
      [11, -47.2],
      [8, -49],
    ],
  ],

  realms: [
    {
      name: 'Aldermere',
      color: '#5f8fb8',
      area: [[-200, 22], [-20, 22.6], [-8, 21.4], [6, 22], [20, 23.6], [36, 25], [52, 27.4], [66, 28.6], [400, 30], [400, -400], [40, -400], [34, -28], [26, -18], [10, -14], [-10, -15], [-200, -16]],
    },
    {
      name: 'The Ashen Reach',
      color: '#c25a3c',
      area: [[-200, -16], [-10, -15], [10, -14], [26, -18], [34, -28], [40, -400], [-200, -400]],
    },
    {
      name: 'The Greywall',
      color: '#9aa0a8',
      area: [[-200, 22], [-20, 22.6], [-8, 21.4], [6, 22], [20, 23.6], [36, 25], [52, 27.4], [66, 28.6], [400, 30], [400, 400], [-200, 400]],
    },
  ],

  borders: [
    [[-40, 22], [-20, 22.6], [-8, 21.4], [6, 22], [20, 23.6], [36, 25], [52, 27.4], [66, 28.6], [110, 31]],
    [[-40, -16], [-10, -15], [10, -14], [26, -18], [34, -28], [36, -40]],
  ],

  rivers: [
    // The Mill, from Abbey Mere to the Sea of Fogs.
    MILL,
    // The Aldwater: out of the Greywall's eastern end, past Solhaven, to the Southern Sea.
    [[62, 36], [68, 28], [73, 20], [77, 11], [80.8, 3], [80.4, -6], [81.4, -14], [84, -22], [85, -27], [86.6, -31.6]],
    // The Wend: from the Greywall foothills southeast across the heartland into the Aldwater.
    [[26, 26], [30, 19], [36, 13], [44, 8], [52, 4.4], [60, 1], [68, -3.6], [75, -6.6], [80.4, -6]],
    // A stream down from the Greywall to the Mill above the Thornwood.
    [[4, 22], [2, 16], [-2, 10.6], [-3.4, 8.2]],
    // Down from the Reach's southern cliffs to the sea, warm with ash.
    [[16, -26], [18, -31], [21, -35], [22, -38.4]],
    // The Saltmarsh's tidal creek.
    [[-14, -12], [-17.6, -10.6], [-21.6, -8.4]],
  ],

  ranges: [
    // The Greywall Mountains, wall of the north.
    [[-26, 28.6], [-21, 26.6], [-16, 27.6], [-10, 26.2], [-4, 27.4], [2, 25.6], [8, 27.4], [14, 28.6], [20, 30], [26, 31.4], [32, 33], [40, 35], [48, 36.6], [56, 39], [64, 41], [74, 44]],
    [[-18, 34], [-10, 35], [-2, 34], [6, 36], [14, 37.6], [22, 40]],
    // The Ashen Reach's black ridges round the calderas.
    [[-12, -26], [-7, -24.2], [-2, -27], [4, -25.4], [10, -28.4], [16, -24.6], [22, -26.6]],
    [[-16, -32], [-10, -33.4]],
  ],
  // The great calderas of the Ashen Reach; the tallest Greywall peak above the old holds.
  peaks: [[-4, -30.4], [8, -32], [2, 30.4]],

  hills: [
    // The Greywall foothills.
    [[-16, 14], [-12, 13], [-6, 14.6], [-1, 14], [6, 15.6], [14, 18.4], [18, 22], [8, 23.4], [-2, 23], [-12, 23.4], [-18, 21]],
    // The Ashen badlands.
    [[-14, -17], [-4, -16], [8, -16], [20, -19], [26, -22], [24, -32], [14, -36], [0, -38], [-12, -36], [-18, -28], [-18, -20]],
    // The heartland's downs along the King's Road.
    [[22, 8], [30, 10], [34, 4], [28, -2], [20, 0]],
    [[56, 14], [64, 16], [68, 10], [60, 7]],
    [[36, 22.6], [42, 25.6], [52, 26.4], [60, 27.6], [66, 25], [58, 22.4], [46, 21.6]],
    [[8, 4], [14, 6], [16, 1], [10, -0.6]],
    [[22, -26], [30, -24], [34, -30], [26, -33]],
    [[44, -18], [54, -16], [58, -24], [46, -26]],
    // Solhaven's hill country.
    [[76, 6], [79, 8], [82, 6], [79, 4.4]],
  ],

  forests: [
    // The Thornwood, west of Millbrook.
    { kind: 'broadleaf', area: [[-11, 6], [-6, 8.4], [-1.6, 7], [1.2, 3.6], [0.6, 1.4], [0.4, -1.8], [1, -5], [-2, -8.6], [-7, -9.4], [-11.6, -7], [-13, -1.6]] },
    // Pines on the Greywall's southern slopes.
    { kind: 'pine', area: [[-24, 18], [-19, 18.6], [-17.6, 23], [-23, 24.4]] },
    { kind: 'pine', area: [[22, 22], [28, 22.6], [30, 27], [24, 28]] },
    // Woods of the heartland.
    { kind: 'broadleaf', area: [[12, -4], [18, -3.4], [20, -9], [14, -10.6], [10, -8]] },
    { kind: 'broadleaf', area: [[38, 18], [46, 19], [48, 13], [40, 12.6]] },
    { kind: 'broadleaf', area: [[60, -10], [68, -12], [70, -20], [62, -22], [58, -16]] },
    { kind: 'broadleaf', area: [[86, 12], [92, 14], [94, 6], [88, 4]] },
    { kind: 'broadleaf', area: [[30, -14], [38, -12], [40, -20], [32, -23]] },
    { kind: 'pine', area: [[44, 22], [52, 23.4], [56, 20], [48, 18.4]] },
    { kind: 'broadleaf', area: [[70, -24], [76, -22], [78, -28], [72, -30]] },
  ],

  marshes: [
    // The Saltmarsh Coast.
    [[-22, 4], [-17.4, 2.6], [-14.6, -1.6], [-13.6, -8], [-16, -12.4], [-21, -12], [-23, -8.6], [-23.4, -2]],
    // Reeds at the Aldwater's mouth.
    [[82, -27], [86, -26.4], [88, -30.4], [84, -31.4]],
  ],

  labels: [
    { text: 'ALDERMERE', at: [44, -6], kind: 'realm' },
    { text: 'THE DWARVEN HOLDS', at: [14, 45], kind: 'realm' },
    { text: 'The Sea of Fogs', at: [-31, -24], kind: 'sea', rotate: -80 },
    { text: 'The Southern Sea', at: [52, -44], kind: 'sea' },
    { text: 'Abbey Mere', at: [-11.6, 20.6], kind: 'water' },
    { text: 'River Mill', at: [-11, -2.6], kind: 'water' },
    { text: 'the Aldwater', at: [83.6, -12], kind: 'water', rotate: 80 },
    { text: 'the Wend', at: [46, 9.2], kind: 'water', rotate: -24 },
    { text: "the King's Road", at: [40, 1.2], kind: 'feature' },
    { text: 'the Calderas', at: [2, -35], kind: 'feature' },
    { text: 'Greywall foothills', at: [6, 19.4], kind: 'feature' },
  ],
};
