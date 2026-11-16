import type { MapArt } from './types';

/**
 * Solvanza, the canal-and-harbor capital of Teravel, on the south shore of the Amber Sea. The harbor
 * opens north, sheltered by Lantern Point and its mole. The Customs Quay, where the character lands,
 * is at the map's origin on the harbor's east side; the Aureate, the patricians' island, lies just
 * north of it, across a narrow channel from the Mirror Court and its gardens. The Lantern Canal runs
 * east from the quay through the old city past the Lantern Exchange, and the north canal runs past
 * Little Vaskar to the sea. The Solva comes down from the southeastern hills under the oldest bridge
 * (the Drowned Market) and into the south harbor, with the Tanneries on its lower bank and the Salt
 * Quay's warehouses beside its mouth. The guild quarter (the Hall of the Concord, Furnace Lane) lies
 * east inside the walls; beyond them, the Saltmarsh Reach's vineyards, villas and salt pans.
 * Coordinates are hours on foot from the Customs Quay (x east, y north); the city is about 1.3 hours
 * across. The city's districts are placed on their own, and the city itself sits at its middle.
 *
 * The Ashfold, three days' sail north-east, is drawn at its true distance (24 hours, which the
 * narrator describes as about 3 days): the app widens the map to take it in. Vaskar lies two days
 * north of it, off the map.
 */
export const solvanzaMap: MapArt = {
  id: 'solvanza',
  pinFarPlaces: true, // the Ashfold is three days' sail away
  px: 600,
  bounds: { minX: -0.9, maxX: 1.6, minY: -0.85, maxY: 0.85 },

  land: [
    // The mainland: the open coast, Lantern Point, round the harbor past the Salt Quay and the Customs Quay, behind the
    // Aureate, along the north shore past the walls and the Saltmarsh Reach's inlets, and away east.
    [
      [-33, -33],
      [-33, 0.385],
      [-1.65, 0.413], // the open coast west of the harbor
      [-0.88, 0.44],
      [-0.688, 0.522],
      [-0.578, 0.632], // Lantern Point, the harbor light
      [-0.484, 0.55],
      [-0.495, 0.358],
      [-0.522, 0.138], // the harbor's west shore
      [-0.495, -0.055],
      [-0.396, -0.165],
      [-0.275, -0.198], // the Salt Quay
      [-0.198, -0.209], // the river's mouth
      [-0.11, -0.138],
      [-0.039, -0.028],
      [-0.033, 0.066], // the Customs Quay
      [0.044, 0.094],
      [0.198, 0.11],
      [0.253, 0.187], // the Aureate's channel, under the Mirror Court
      [0.242, 0.308],
      [0.275, 0.407],
      [0.341, 0.473], // the north canal comes out
      [0.522, 0.506],
      [0.77, 0.528],
      [1.018, 0.473],
      [1.1, 0.341], // an inlet of the Saltmarsh Reach
      [1.166, 0.33],
      [1.238, 0.462],
      [1.485, 0.55],
      [1.76, 0.506],
      [1.925, 0.385], // a second inlet
      [2.062, 0.522],
      [2.42, 0.578],
      [3.3, 0.495],
      [4.95, 0.77],
      [7.7, 0.66],
      [11, 1.32],
      [16.5, 1.65],
      [33, 2.2],
      [33, -33],
    ],
    // The Aureate, the patricians' island.
    [
      [-0.072, 0.165],
      [0.028, 0.132],
      [0.16, 0.154],
      [0.198, 0.231],
      [0.182, 0.341],
      [0.077, 0.396],
      [-0.033, 0.363],
      [-0.088, 0.259],
    ],
    // The harbor mole off Lantern Point.
    [
      [-0.484, 0.539],
      [-0.22, 0.561],
      [-0.198, 0.528],
      [-0.473, 0.495],
    ],
    // A rock in the roads.
    [
      [-1.21, 0.88],
      [-1.1, 0.935],
      [-1.045, 0.853],
      [-1.155, 0.797],
    ],
    // The Ashfold, three days' sail north-east, at its true distance (not scaled with the city).
    [
      [40, 40],
      [12.6, 40],
      [13.4, 28],
      [14.2, 24],
      [14.8, 21],
      [15.6, 19.6],
      [16.1, 18.4], // Highcairn's headland
      [15.6, 17.4],
      [16.3, 16.6], // Brackwater's anchorage
      [16, 15.6],
      [16.9, 14.8],
      [18, 13.6],
      [20, 12.6],
      [23, 12],
      [28, 11],
      [40, 10],
    ],
  ],

  realms: [
    { name: 'The Aureate', color: '#ecc57a', area: [[-0.138, 0.11], [0.22, 0.11], [0.22, 0.44], [-0.138, 0.44]], outline: true },
    { name: 'The Mirror Court', color: '#d6a756', area: [[0.259, 0.165], [0.429, 0.165], [0.44, 0.341], [0.275, 0.374]], outline: true },
    { name: 'The Old City', color: '#7fa3ad', area: [[-0.055, -0.055], [0, 0.094], [0.22, 0.11], [0.259, 0.165], [0.429, 0.165], [0.539, 0.11], [0.55, -0.22], [0.468, -0.396], [0.231, -0.341], [0.028, -0.286], [-0.11, -0.165]] },
    { name: 'Little Vaskar', color: '#6f8fb0', area: [[0.275, 0.374], [0.44, 0.341], [0.539, 0.253], [0.77, 0.22], [0.77, 0.605], [0.303, 0.55]] },
    { name: 'The Tanneries', color: '#c8553d', area: [[-0.198, -0.22], [0.028, -0.286], [0.231, -0.341], [0.468, -0.396], [0.688, -0.55], [0.33, -0.688], [-0.33, -0.55], [-0.22, -0.275]] },
    { name: 'The Salt Quay', color: '#9db4c0', area: [[-0.198, -0.22], [-0.22, -0.275], [-0.33, -0.55], [-0.55, -0.385], [-0.66, -0.11], [-0.55, 0.11], [-0.44, -0.11]] },
    { name: 'Guild Quarter', color: '#5fa38d', area: [[0.539, 0.11], [0.55, -0.22], [0.468, -0.396], [0.688, -0.55], [0.77, -0.22], [0.77, 0.22], [0.539, 0.253]] },
    { name: 'The Saltmarsh Reach', color: '#a3b86c', area: [[0.77, 0.66], [2.75, 0.66], [2.75, -1.65], [0.688, -0.55], [0.77, -0.22]] },
    { name: 'The Ashfold', color: '#8a9a6a', area: [[12, 40], [40, 40], [40, 10], [12, 10]] },
  ],

  borders: [
    // The city walls, from the north shore round to the harbor's west shore.
    [[0.743, 0.55], [0.781, 0.22], [0.759, -0.22], [0.671, -0.539], [0.385, -0.649], [0, -0.616], [-0.303, -0.506], [-0.522, -0.341], [-0.632, -0.11], [-0.578, 0.22], [-0.605, 0.495]],
  ],

  rivers: [
    // The Solva, down from the hills to the south harbor, under the oldest bridge.
    [[2.2, -1.32], [1.65, -0.99], [1.155, -0.743], [0.77, -0.55], [0.468, -0.396], [0.231, -0.341], [0.028, -0.286], [-0.099, -0.253], [-0.198, -0.22]],
    // The Lantern Canal, from the Solva through the old city to the harbor by the Customs Quay.
    [[0.561, -0.429], [0.55, -0.22], [0.44, -0.077], [0.275, 0], [0.121, 0.039], [-0.033, 0.039]],
    // The north canal, past Little Vaskar to the sea.
    [[0.341, 0.473], [0.451, 0.363], [0.539, 0.253], [0.55, 0.083], [0.44, -0.077]],
    // A cross canal from the Solva past the Swordyard to the Lantern Canal.
    [[0.044, -0.275], [0.022, -0.121], [0.066, -0.022], [0.121, 0.039]],
  ],

  ranges: [],
  peaks: [],

  hills: [
    // The hills up the Solva.
    [[1.43, -0.715], [1.87, -0.55], [2.31, -0.77], [2.2, -1.21], [1.65, -1.21]],
  ],

  forests: [
    // The Mirror Court's gardens, the Saltmarsh Reach's cypress-hedged villas and vineyards.
    { kind: 'broadleaf', area: [[0.308, 0.198], [0.413, 0.198], [0.418, 0.308], [0.319, 0.33]] },
    { kind: 'broadleaf', area: [[0.88, 0.165], [1.155, 0.22], [1.265, 0], [1.045, -0.11], [0.853, -0.028]] },
    { kind: 'broadleaf', area: [[1.43, 0.275], [1.705, 0.33], [1.815, 0.11], [1.54, 0.028]] },
  ],

  marshes: [
    // The Saltmarsh Reach's salt pans.
    [[1.265, 0.303], [1.54, 0.358], [1.87, 0.33], [1.87, 0.138], [1.54, 0.165], [1.265, 0.11]],
    [[0.825, -0.303], [1.155, -0.248], [1.32, -0.495], [0.99, -0.578]],
  ],

  labels: [
    { text: 'LITTLE VASKAR', at: [0.688, 0.413], kind: 'realm' },
    { text: 'THE TANNERIES', at: [0.165, -0.506], kind: 'realm' },
    { text: 'SALTMARSH REACH', at: [1.166, -0.484], kind: 'realm' },
    { text: 'The Amber Sea', at: [-0.22, 0.797], kind: 'sea' },
    { text: 'The Harbor', at: [-0.275, 0.248], kind: 'water' },
    { text: 'Lantern Canal', at: [0.33, -0.055], kind: 'water', rotate: -28 },
    { text: 'north canal', at: [0.583, 0.209], kind: 'water', rotate: -75 },
    { text: 'the Solva', at: [1.045, -0.704], kind: 'water', rotate: 27 },
    { text: 'city walls', at: [0.825, -0.055], kind: 'feature', rotate: -88 },
    { text: 'Lantern Point', at: [-0.66, 0.649], kind: 'feature' },
    { text: 'Furnace Lane', at: [0.539, -0.165], kind: 'feature' },
    { text: 'the oldest bridge', at: [0.253, -0.396], kind: 'feature' },
    { text: 'THE ASHFOLD', at: [21, 18.4], kind: 'realm' },
    { text: 'Amber Sea', at: [8, 9], kind: 'sea' },
    { text: 'to Vaskar, two days north ↑', at: [14, 19.5], kind: 'water' },
    { text: 'to Vaskar ↑', at: [-0.165, 0.743], kind: 'water' },
    { text: 'to the Ashfold, three days\' sail ↗', at: [0.825, 0.77], kind: 'water' },
  ],
};
