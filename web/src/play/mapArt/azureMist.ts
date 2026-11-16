import type { MapArt, Pt } from './types';

/**
 * Azure Mist Province, at the eastern edge of the Great Celestial Continent. Willowbrook sits in the
 * middle on its brook; Moonwater Lake lies half a day southwest in a bowl of hills, Spiritfall Market a
 * day northeast where the Mistfall drops off the uplands, Cloudveil Peak (the Azure Cloud Sect) two days
 * north, and the black Ironpeak range three days north-northeast, with the old Cloudveil-Ironpeak
 * border dispute in the saddle between them. Whispering Bamboo Forest fills the low country to the
 * southwest. The Mistfall reaches the Jade Sea through a reedy delta in the east. The Heartlands lie
 * beyond the western mountains, the Southern Wilds below, and the Northern Frost Wastes above.
 * Coordinates are hours on foot from Willowbrook (x east, y north).
 *
 * Moonwater is cut out of the land as a lake: the outline runs up its outflow river from the sea and
 * round its shore, along points close enough together that the drawing leaves both banks unroughened.
 */

const PX = 22;

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

// Moonwater's outflow, from the lake to the sea: down to Willow Brook, into the Mistfall, out through the delta.
const MOON_OUTLET: Pt = [-3.8, -4.33];
const OUTFLOW = densify(
  [MOON_OUTLET, [-2.6, -5.0], [-0.4, -5.3], [2.4, -4.8], [5, -4.3], [7.6, -4.7], [10, -4.6], [12.4, -5.6], [15, -5.6], [17.6, -5.2], [20.2, -6]],
  STEP,
);
const MOON_SHORE = oval(-5.8, -3.3, 2.6, 1.6, 20, -40, 1);

const lakeLoop = (river: Pt[], shore: Pt[]): Pt[] => [...[...river].reverse(), ...shore, ...river];

export const azureMistMap: MapArt = {
  id: 'azure-mist',
  px: PX,
  bounds: { minX: -24, maxX: 32, minY: -20, maxY: 33 },

  land: [
    // The continent: the east coast from the Frost Wastes down past the Mistfall delta into the Southern Wilds, then away west.
    [
      [33, 400],
      [30, 40],
      [28.5, 34],
      [27, 30.5],
      [28.4, 26.5],
      [25.6, 22.5],
      [26.4, 18],
      [24, 14],
      [21.6, 12.6], // Gull Bay
      [22.6, 9.4],
      [24.8, 7.4],
      [22.4, 3.6],
      [21.2, -0.4],
      [21.8, -4],
      ...lakeLoop(OUTFLOW, MOON_SHORE).slice(0, -1),
      [20.2, -6],
      [21.6, -8.6],
      [19.4, -12.6],
      [20.6, -16.4],
      [17.4, -20.6],
      [16.6, -26],
      [15, -60],
      [14, -400],
      [-400, -400],
      [-400, 400],
    ],
    // Moonwater's island of pines.
    [
      [-5.9, -3.0],
      [-5.5, -2.7],
      [-5.0, -2.9],
      [-5.1, -3.35],
      [-5.6, -3.45],
    ],
    // Skerries off the coast, the first of the Thousand Isles' scattered rocks.
    [
      [28, -1],
      [29.4, 0.2],
      [30.4, -1.4],
      [29, -2.6],
    ],
    [
      [29.5, 12],
      [31, 13],
      [31.6, 11.2],
      [30.2, 10.4],
    ],
    [
      [25.6, -12],
      [26.6, -11.2],
      [27.2, -12.6],
      [26, -13.4],
    ],
  ],

  realms: [
    {
      name: 'Azure Mist Province',
      color: '#6f9fc0',
      area: [[-15, -15.5], [-17, -4], [-15.5, 4], [-14, 10], [-12, 20], [-9, 28], [4, 29.5], [18, 29], [60, 30], [60, -15], [16, -16], [0, -16.5]],
    },
    {
      name: 'The Heartlands',
      color: '#c9a35a',
      area: [[-15, -15.5], [-17, -4], [-15.5, 4], [-14, 10], [-12, 20], [-9, 28], [-400, 28], [-400, -15.5]],
    },
    {
      name: 'The Northern Frost Wastes',
      color: '#b8c6d6',
      area: [[-400, 28], [-9, 28], [4, 29.5], [18, 29], [60, 30], [60, 400], [-400, 400]],
    },
    {
      name: 'The Southern Wilds',
      color: '#7f9a55',
      area: [[-400, -15.5], [-15, -15.5], [0, -16.5], [16, -16], [60, -15], [60, -400], [-400, -400]],
    },
    // The Azure Cloud Sect's mountain and the Crimson Blade Hall's range; their claims overlap in the saddle.
    {
      name: 'Cloudveil',
      color: '#a9c8e6',
      area: [[-10, 11], [-5, 10.5], [1, 11.5], [6, 14], [6.5, 20], [5, 25], [-1, 22], [-7, 20], [-11, 16]],
      outline: true,
    },
    {
      name: 'Ironpeak',
      color: '#c0504a',
      area: [[3.5, 18], [9, 17.6], [16, 17.4], [22, 18.6], [25, 23], [22, 27], [13, 27.4], [5, 26], [2.6, 22]],
      outline: true,
    },
  ],

  borders: [
    // The western mountains, the Heartlands' edge.
    [[-15, -15.5], [-17, -4], [-15.5, 4], [-14, 10], [-12, 20], [-9, 28]],
    // The Frost Wastes.
    [[-30, 27.4], [-9, 28], [4, 29.5], [18, 29], [30, 30.4]],
    // The Southern Wilds.
    [[-30, -15], [-15, -15.5], [0, -16.5], [16, -16], [22, -15]],
  ],

  rivers: [
    // Moonwater to the sea: its outflow, Willow Brook below the village, and the lower Mistfall through the delta.
    OUTFLOW,
    // Willow Brook: down from the hills, past Willowbrook, into Moonwater's outflow.
    [[-5.4, 8.6], [-3.6, 5], [-1.4, 2], [0.3, 0.25], [1.4, -1.4], [3, -3], [5, -4.3]],
    // The Mistfall: from the saddle between Cloudveil and Ironpeak, over the falls at Spiritfall, to the brook.
    [[4.6, 19.4], [5.4, 15.6], [7, 11.6], [7.6, 7.6], [7.3, 4.4], [8.2, 0.6], [9.4, -2.6], [10, -4.6]],
    // A stream off Cloudveil's eastern slopes into the Mistfall.
    [[1.2, 14.6], [3, 12], [5.4, 10.4], [7.2, 10]],
    // Streams out of the Ironpeak range to the sea.
    [[17, 19], [18.8, 15], [20.4, 12.4], [21.6, 12.6]],
    // A coastal stream through the eastern woods to the sea.
    [[13, 9.6], [16.4, 8], [19.6, 6], [23.2, 5]],
    // Down from the bamboo country, into the outflow below Moonwater.
    [[-9, -11], [-6.6, -8], [-4, -6.6], [-1.6, -5.4]],
  ],

  ranges: [
    // The green mountains along the western edge, the wall between the province and the Heartlands.
    [[-15, -15], [-16.4, -9], [-17.2, -3.6], [-15.8, 2], [-15.4, 6.6], [-14.6, 10.6], [-13.4, 15], [-12, 20], [-10.6, 24.6]],
    // The Cloudveil massif.
    [[-11.4, 13.6], [-8, 15.2], [-5.6, 17.8], [-1.6, 18.8], [1.6, 17.4], [3.8, 18.4]],
    // The Ironpeak range.
    [[5.8, 22.6], [9, 21.4], [12, 22.6], [15, 21.6], [18, 22.6], [21, 22], [23.6, 24.4], [24.8, 27.4]],
    [[8, 25.4], [12, 26], [16, 25.6]],
  ],
  // Cloudveil Peak, above the Azure Cloud Sect's abbey.
  peaks: [[-3, 16.6]],

  hills: [
    // The bowl of hills round Moonwater, between it and Willowbrook.
    [[-9, -1], [-6.4, 0.2], [-3, -0.4], [-1.2, -1.8], [-1.6, -3.4], [-2.6, -5.8], [-5, -6], [-8, -5.4], [-9.4, -3]],
    // The upland above Willowbrook and Spiritfall (terraced barley and orchards).
    [[-6, 3.6], [-2, 4.6], [3, 5.6], [5.6, 7.6], [4, 10], [-1, 9], [-6, 7]],
    // Willow Hill.
    [[0.2, 0.7], [1.6, 0.9], [1.9, 1.9], [0.6, 2.1]],
    // Downs toward the coast.
    [[12, 4], [17, 5], [18.6, 1], [14, -1], [11.6, 1]],
  ],

  forests: [
    // Whispering Bamboo Forest.
    { kind: 'broadleaf', area: [[-12.6, -6.4], [-9, -6], [-6.8, -6.8], [-3.6, -7.2], [-2, -9.6], [-3.4, -12.6], [-7, -14], [-11, -13], [-13.6, -10]] },
    // The whispering woods on the upland's flanks.
    { kind: 'broadleaf', area: [[9.6, 9], [14, 10], [16.6, 7.4], [13, 6.4], [10, 6.4]] },
    { kind: 'pine', area: [[18.6, 1.6], [21, 2], [21.6, -2.6], [19.4, -3]] },
    { kind: 'broadleaf', area: [[11.6, -10.6], [15.6, -10.8], [17, -14], [13.6, -15], [10.8, -13.4]] },
    { kind: 'broadleaf', area: [[2.6, -7.6], [7.4, -7.2], [9, -10.6], [4.6, -12], [1.4, -10]] },
    // Pines on Cloudveil's slopes and the Ironpeak foothills.
    { kind: 'pine', area: [[-10.6, 9.4], [-6.4, 10.6], [-2.4, 12.4], [-5.6, 14], [-10, 12.8]] },
    { kind: 'pine', area: [[9.4, 17.4], [14, 17], [17.6, 18.4], [13.6, 19.6], [10, 19.4]] },
    { kind: 'pine', area: [[-14, -1], [-11, -0.4], [-10.6, 3], [-13, 4]] },
    // Moonwater's island.
    { kind: 'pine', area: [[-6, -2.6], [-4.9, -2.6], [-4.9, -3.6], [-6, -3.6]] },
  ],

  marshes: [
    // The Mistfall delta.
    [[15.6, -4.4], [18.4, -3.8], [20.6, -5.2], [20.2, -7.4], [17.4, -7.6], [15.2, -6.8]],
  ],

  labels: [
    { text: 'AZURE MIST', at: [-3.4, 7.2], kind: 'realm' },
    { text: 'THE HEARTLANDS', at: [-20.4, 6], kind: 'realm', rotate: -90 },
    { text: 'THE SOUTHERN WILDS', at: [-1, -18.6], kind: 'realm' },
    { text: 'THE NORTHERN FROST WASTES', at: [2, 31.2], kind: 'realm' },
    { text: 'The Jade Sea', at: [28, -5.6], kind: 'sea' },
    { text: 'Cloudveil Peak', at: [-2.6, 20.6], kind: 'feature' },
    { text: 'the Disputed Saddle', at: [4.7, 21.4], kind: 'feature', rotate: -78 },
    { text: 'Mistfall', at: [9.6, 2.6], kind: 'water', rotate: -70 },
    { text: 'Willow Brook', at: [-3.6, 2.6], kind: 'water', rotate: -52 },
    { text: 'Mistfall Delta', at: [17.8, -9.2], kind: 'feature' },
    { text: 'Gull Bay', at: [23.4, 11.4], kind: 'water' },
  ],
};
