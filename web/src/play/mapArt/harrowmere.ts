import type { MapArt } from './types';

/**
 * Harrowmere, a rain-soaked harbor city. The harbor opens west onto the Sound. Downtown and the Old
 * Market stand on its east shore, and the Lantern Arcade is hidden in the Old Market at the map's
 * origin. Pier Nine's burned ruin is on the downtown waterfront. The Skerrows' wharves line the north
 * harbor, across the Harrow and its bridge, with the rail line behind them and the Calling-Stones'
 * mudflat on the open coast to the north. Aldgrave Hill rises northeast of downtown, above the
 * harbor, and the row-house hills climb beyond it. The harbor's southern lobe is the South Bay, where
 * the container cranes stand, and Ardwick, the garage district that hides the Undermarket, lies
 * between the bay and downtown. Coordinates are hours on foot from the Old Market (x east, y north).
 * The city's sub-places are placed on their own; the city itself sits at the Old Market.
 */
export const harrowmereMap: MapArt = {
  id: 'harrowmere',
  px: 360,
  bounds: { minX: -2.3, maxX: 1.6, minY: -1.45, maxY: 1.95 },

  land: [
    // The mainland: down the open coast past the Calling-Stones' flats, round the north headland into
    // the harbor, along the Skerrows and the downtown waterfront, round the South Bay, and out to the
    // south headland.
    [
      [-1.3, 5],
      [-1.32, 2.6],
      [-1.2, 2.05],
      [-1.12, 1.7],
      [-1.2, 1.35], // the Calling-Stones' mudflat
      [-1.5, 1.1],
      [-1.8, 0.9],
      [-2.0, 0.66], // the north headland
      [-1.86, 0.56],
      [-1.5, 0.66],
      [-1.2, 0.74],
      [-0.95, 0.72],
      [-0.75, 0.64], // the Skerrows' wharves
      [-0.55, 0.55],
      [-0.42, 0.47], // the Harrow's mouth
      [-0.33, 0.33],
      [-0.27, 0.12], // the downtown waterfront
      [-0.29, -0.08],
      [-0.33, -0.22], // Pier Nine
      [-0.3, -0.38],
      [-0.18, -0.55],
      [-0.06, -0.72], // head of the South Bay
      [-0.12, -0.9],
      [-0.36, -1.0],
      [-0.7, -1.02],
      [-1.05, -0.98],
      [-1.4, -0.9],
      [-1.75, -0.78],
      [-2.0, -0.72], // the south headland
      [-2.05, -0.86],
      [-1.8, -1.05],
      [-1.5, -1.25],
      [-1.3, -1.6],
      [-1.25, -2.4],
      [-1.2, -5],
      [6, -5],
      [6, 5],
    ],
    // Pier Nine, the burned guildhall pier.
    [
      [-0.3, -0.19],
      [-0.52, -0.2],
      [-0.52, -0.25],
      [-0.3, -0.25],
    ],
    // The container terminal's mole across the South Bay.
    [
      [-0.12, -0.86],
      [-0.55, -0.8],
      [-0.6, -0.86],
      [-0.2, -0.95],
    ],
    // Gull Rock and a skerry at the harbor mouth.
    [
      [-1.62, -0.02],
      [-1.5, 0.05],
      [-1.43, -0.04],
      [-1.55, -0.12],
    ],
    [
      [-2.1, 0.3],
      [-2.03, 0.36],
      [-1.99, 0.28],
    ],
  ],

  realms: [
    {
      name: 'The Old Market',
      color: '#d6a756',
      area: [[-0.4, 0.06], [0.06, 0.08], [0.2, 0.0], [0.2, -0.18], [0.02, -0.26], [-0.4, -0.3]],
    },
    {
      name: 'Downtown',
      color: '#7fa3ad',
      area: [[-0.4, 0.06], [0.06, 0.08], [0.2, 0.0], [0.42, 0.06], [0.4, 0.42], [0.1, 0.62], [-0.45, 0.5]],
    },
    {
      name: 'Aldgrave Hill',
      color: '#9a5f8f',
      area: [[0.42, 0.06], [0.4, 0.42], [0.25, 0.78], [0.35, 0.9], [0.8, 1.25], [1.3, 1.36], [1.65, 1.1], [1.65, 0.45], [1.1, 0.25], [0.92, 0.06], [0.66, -0.02]],
    },
    {
      name: 'The Skerrows',
      color: '#5fa38d',
      area: [[-0.45, 0.5], [-0.3, 0.72], [-0.6, 0.98], [-1.3, 1.08], [-2.1, 0.8], [-1.6, 0.6], [-1.0, 0.66]],
    },
    {
      name: 'Ardwick',
      color: '#c8553d',
      area: [[0.2, 0.0], [0.42, 0.06], [0.66, -0.02], [0.62, -0.62], [0.2, -0.68], [-0.1, -0.6], [-0.4, -0.3], [0.02, -0.26], [0.2, -0.18]],
    },
    {
      name: 'The South Bay terminal',
      color: '#a9a3c9',
      area: [[-0.1, -0.6], [0.2, -0.68], [0.3, -1.2], [-0.2, -1.3], [-1.1, -1.2], [-1.0, -0.85]],
    },
  ],

  borders: [
    // The rail line behind the Skerrows, along the north harbor and over the Harrow into downtown.
    [[-1.4, 1.22], [-1.0, 1.0], [-0.62, 0.86], [-0.3, 0.66], [0.0, 0.4], [0.12, 0.12]],
  ],

  rivers: [
    // The Harrow: down from the northeastern hills, under the bridge, into the harbor between downtown and the Skerrows.
    [[1.7, 2.4], [1.25, 1.7], [0.8, 1.25], [0.35, 0.9], [-0.05, 0.7], [-0.42, 0.47]],
  ],

  ranges: [],
  peaks: [],

  hills: [
    // Aldgrave Hill, with Vane House at the top.
    [[0.46, 0.2], [0.68, 0.12], [0.92, 0.3], [0.86, 0.6], [0.6, 0.62], [0.46, 0.44]],
    // The row-house hills climbing east of the city.
    [[1.15, 0.0], [1.5, 0.2], [1.8, 0.5], [1.8, -0.9], [1.4, -1.0], [1.0, -0.5]],
    [[0.5, 1.45], [1.0, 1.7], [0.95, 2.2], [0.3, 2.2], [0.15, 1.75]],
  ],

  forests: [
    // The Aldgrave gardens and a park on the heights.
    { kind: 'broadleaf', area: [[0.7, 0.62], [0.95, 0.66], [1.0, 0.48], [0.82, 0.44]] },
    { kind: 'broadleaf', area: [[1.3, 0.5], [1.6, 0.7], [1.55, 1.0], [1.25, 0.85]] },
    { kind: 'pine', area: [[-0.9, 2.0], [-0.5, 2.1], [-0.4, 1.7], [-0.8, 1.6]] },
  ],

  marshes: [
    // The Calling-Stones' mudflat, under water except at the lowest tides.
    [[-1.22, 1.62], [-1.0, 1.62], [-0.86, 1.42], [-1.0, 1.24], [-1.24, 1.3]],
  ],

  labels: [
    { text: 'ALDGRAVE HILL', at: [1.0, 0.95], kind: 'realm' },
    { text: 'THE SKERROWS', at: [-1.15, 0.92], kind: 'realm' },
    { text: 'ARDWICK', at: [0.62, -0.5], kind: 'realm' },
    { text: 'THE HEIGHTS', at: [1.05, -1.22], kind: 'realm' },
    { text: 'The Sound', at: [-1.95, -1.25], kind: 'sea' },
    { text: 'Harrowmere Harbor', at: [-1.0, 0.2], kind: 'water' },
    { text: 'South Bay', at: [-0.55, -0.62], kind: 'water' },
    { text: 'the Harrow', at: [0.62, 1.2], kind: 'water', rotate: -38 },
    { text: 'container cranes', at: [-0.42, -1.12], kind: 'feature' },
    { text: 'rail line', at: [-1.0, 1.1], kind: 'feature', rotate: -22 },
    { text: 'Old Market', at: [0.1, -0.24], kind: 'feature' },
    { text: 'Downtown', at: [0.08, 0.44], kind: 'feature' },
    { text: 'Harrow Bridge', at: [-0.08, 0.58], kind: 'feature' },
    { text: 'Vane House', at: [0.72, 0.52], kind: 'feature' },
  ],
};
