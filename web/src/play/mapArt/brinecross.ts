import type { MapArt } from './types';

/**
 * Brinecross, a smugglers' free port where the Saltmere meets the Grey Sound. The harbor is a bay
 * opening south onto the Sound. Dockside wraps its head: the market (at the map's origin, where the
 * story starts) on the north shore, the Drowned Lantern beached just off it, and the North Pier's
 * bonded warehouses at the bay's northern tip, where the North Pier runs out into the water. Upper Brinecross's terraces climb the
 * cliffs behind, with the Chapel of the Tide Mother at the cliff edge. The Saltmere comes down a gorge
 * through the cliffs into the bay's northwest corner, and Dockside's quays run down the west shore. The Saltworks' flooded pans line the eastern shore, a
 * short walk east through the alleys, and the stumps of the old sea wall still break the water off
 * them. Old Brinecross, the drowned city, lies under Dockside and the Saltworks (the dashed outline).
 * Coordinates are hours on foot from the market (x east, y north); the city is about an hour across.
 */
export const brinecrossMap: MapArt = {
  id: 'brinecross',
  px: 700,
  bounds: { minX: -0.95, maxX: 0.95, minY: -1.15, maxY: 0.6 },

  land: [
    // The mainland: down the western shore to its headland, round the harbor past the Saltmere's
    // mouth, the North Pier, the market and the Saltworks, and out past the eastern point.
    [
      [-5, 5],
      [-5, -5],
      [-1.2, -5],
      [-1.1, -1.3],
      [-0.8, -1.06],
      [-0.52, -0.94], // the western headland
      [-0.5, -0.82],
      [-0.6, -0.6],
      [-0.62, -0.35],
      [-0.58, -0.12],
      [-0.52, 0.02], // the Saltmere's mouth
      [-0.42, 0.08],
      [-0.3, 0.12], // the North Pier
      [-0.18, 0.06],
      [-0.06, -0.02],
      [0.06, -0.05], // the market's waterfront
      [0.2, -0.1],
      [0.32, -0.18],
      [0.42, -0.3], // the Saltworks
      [0.48, -0.48],
      [0.5, -0.7],
      [0.44, -0.9], // the eastern point
      [0.55, -1.0],
      [0.9, -1.1],
      [1.4, -5],
      [5, -5],
      [5, 5],
    ],
    // The North Pier.
    [
      [-0.315, 0.11],
      [-0.34, -0.1],
      [-0.31, -0.1],
      [-0.285, 0.11],
    ],
    // The fish piers off the market.
    [
      [-0.085, 0.0],
      [-0.095, -0.15],
      [-0.065, -0.15],
      [-0.055, 0.0],
    ],
    [
      [0.1, -0.04],
      [0.08, -0.18],
      [0.11, -0.18],
      [0.13, -0.05],
    ],
    // The stumps of the old sea wall.
    [
      [0.22, -0.38],
      [0.26, -0.36],
      [0.27, -0.4],
      [0.23, -0.42],
    ],
    [
      [0.28, -0.53],
      [0.32, -0.51],
      [0.33, -0.55],
      [0.29, -0.57],
    ],
    [
      [0.32, -0.68],
      [0.36, -0.66],
      [0.37, -0.7],
      [0.33, -0.72],
    ],
  ],

  realms: [
    {
      name: 'Upper Brinecross',
      color: '#ecc57a',
      area: [[-0.6, 0.18], [-0.34, 0.24], [-0.2, 0.2], [0.05, 0.14], [0.3, 0.1], [0.62, 0.04], [0.9, 0.2], [0.9, 0.75], [-0.6, 0.75]],
    },
    {
      name: 'Dockside',
      color: '#c8553d',
      area: [[-0.6, 0.18], [-0.34, 0.24], [-0.2, 0.2], [0.05, 0.14], [0.3, 0.1], [0.24, -0.04], [0.2, -0.3], [-0.2, -0.2], [-0.5, -0.9], [-0.8, -0.9], [-0.76, -0.1]],
    },
    {
      name: 'The Saltworks',
      color: '#9db4c0',
      area: [[0.3, 0.1], [0.62, 0.04], [0.95, -0.2], [1.0, -0.9], [0.6, -0.9], [0.24, -0.4], [0.24, -0.04]],
    },
    {
      name: 'Old Brinecross',
      color: '#7fa3ad',
      area: [[-0.24, 0.1], [0.1, 0.1], [0.42, 0.0], [0.7, -0.2], [0.76, -0.48], [0.6, -0.56], [0.38, -0.34], [0.1, -0.16], [-0.24, -0.1]],
      outline: true,
    },
  ],

  borders: [],

  rivers: [
    // The Saltmere, down its gorge through the cliffs into the bay.
    [[-0.82, 0.8], [-0.74, 0.56], [-0.66, 0.36], [-0.58, 0.18], [-0.52, 0.02]],
  ],

  ranges: [],
  peaks: [],

  hills: [
    // The cliffs under Upper Brinecross, on both sides of the Saltmere's gorge.
    [[-0.54, 0.26], [-0.2, 0.24], [0.1, 0.2], [0.4, 0.14], [0.7, 0.1], [0.72, 0.3], [0.4, 0.34], [0.1, 0.4], [-0.2, 0.42], [-0.54, 0.4]],
    [[-0.98, 0.16], [-0.7, 0.12], [-0.64, 0.42], [-0.98, 0.5]],
  ],

  forests: [
    // Gardens of the merchant houses on the terraces.
    { kind: 'broadleaf', area: [[0.2, 0.52], [0.46, 0.5], [0.5, 0.66], [0.22, 0.7]] },
    { kind: 'pine', area: [[-0.95, -0.5], [-0.76, -0.46], [-0.74, -0.1], [-0.95, -0.06]] },
  ],

  marshes: [
    // The Saltworks' flooded evaporation pans.
    [[0.42, -0.08], [0.7, -0.14], [0.82, -0.4], [0.74, -0.62], [0.58, -0.56], [0.5, -0.3]],
  ],

  labels: [
    { text: 'UPPER BRINECROSS', at: [0.1, 0.5], kind: 'realm' },
    { text: 'DOCKSIDE', at: [-0.7, -0.45], kind: 'realm', rotate: -84 },
    { text: 'SALTWORKS', at: [0.72, -0.78], kind: 'realm', rotate: -70 },
    { text: 'The Grey Sound', at: [0.0, -1.06], kind: 'sea' },
    { text: 'The Harbor', at: [-0.12, -0.5], kind: 'water' },
    { text: 'the Saltmere', at: [-0.79, 0.42], kind: 'water', rotate: -68 },
    { text: 'the old sea wall', at: [0.2, -0.6], kind: 'feature', rotate: -62 },
    { text: 'Old Brinecross lies beneath', at: [0.58, 0.0], kind: 'feature', rotate: -28 },
    { text: 'the cliffs', at: [0.5, 0.22], kind: 'feature' },
  ],
};
