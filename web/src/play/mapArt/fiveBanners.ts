import type { MapArt } from './types';

/**
 * The Five Banners around Dunmarrow, at the scale of a city and its country. The free city stands on the
 * neutral ground where the Quinthane was sworn, where the five peoples' lands come nearest one another:
 * the gray forest of Liraun half a day north (its edge the Verge, with the Ommerstones deeper in), the Karrowdeep
 * mountains to the northwest with the Pettifold's warren-hills below them in the west, Cendral's river
 * country south and southwest, and the Haddari steppe east. Unbannered country lies at the corners: the
 * Brakespine's giant-hills in the northeast and the Vashk fens in the southeast. Inside the city the
 * Quincunx sits at the center, the Vexillary up the Weavers' Stair to the northwest, Scrivelow under the
 * western quarter, Grethmoor on the south road and the Tollward Gatehouse at the east gate.
 * Coordinates are hours on foot from the Quincunx (x east, y north), the space of the locations' `map`.
 */
export const fiveBannersMap: MapArt = {
  id: 'five-banners',
  px: 110,
  bounds: { minX: -5.5, maxX: 5.5, minY: -3.6, maxY: 8.4 },

  land: [
    // The continent; its coasts lie far off to the south, beyond Cendral and the fens.
    [
      [-300, 300],
      [300, 300],
      [300, -70],
      [40, -50],
      [10, -46],
      [-30, -40],
      [-80, -48],
      [-300, -60],
    ],
  ],

  realms: [
    {
      name: 'Liraun',
      color: '#a9b8a0',
      area: [[-300, 5.3], [-4, 5.2], [-2.4, 5.0], [-0.5, 5.3], [1.5, 5.1], [3.2, 5.1], [3.9, 6.2], [3.6, 300], [-300, 300]],
    },
    {
      name: 'The Karrowdeep',
      color: '#b07a4f',
      area: [[-300, 5.3], [-4, 5.2], [-2.4, 5.0], [-2.6, 3.6], [-2.2, 2.2], [-2.8, 1.3], [-300, 1.1]],
    },
    {
      name: 'The Pettifold',
      color: '#7f9a8a',
      area: [[-300, 1.1], [-2.8, 1.3], [-2.4, 0.2], [-2.7, -1.2], [-300, -1.4]],
    },
    {
      name: 'Cendral',
      color: '#d6a756',
      area: [[-300, -1.4], [-2.7, -1.2], [-1.5, -1.9], [0, -2.1], [1.6, -1.8], [2.4, -2.3], [2.6, -300], [-300, -300]],
    },
    {
      name: 'The Haddari Khanate',
      color: '#c8553d',
      area: [[3.2, 5.1], [3.6, 4.4], [2.7, 3.2], [3.1, 1.6], [2.7, 0], [3.1, -1.4], [3.9, -2.1], [300, -2.4], [300, 4.6], [5.4, 4.8], [4.4, 5.0]],
    },
    {
      name: 'Dunmarrow',
      color: '#7f95ad',
      area: [[-0.95, 0.85], [-0.3, 1.05], [0.5, 0.85], [0.95, 0.25], [0.9, -0.5], [0.45, -0.95], [-0.3, -0.98], [-0.95, -0.6], [-1.12, 0.1]],
      outline: true,
    },
  ],

  borders: [
    // Liraun's eaves.
    [[-6.5, 5.3], [-4, 5.2], [-2.4, 5.0], [-0.5, 5.3], [1.5, 5.1], [3.2, 5.1], [3.9, 6.2], [3.6, 9.5]],
    // The Karrowdeep and the Pettifold.
    [[-2.4, 5.0], [-2.6, 3.6], [-2.2, 2.2], [-2.8, 1.3], [-2.4, 0.2], [-2.7, -1.2], [-1.5, -1.9], [0, -2.1], [1.6, -1.8], [2.4, -2.3], [2.6, -4.5]],
    [[-6.5, 1.1], [-2.8, 1.3]],
    [[-6.5, -1.4], [-2.7, -1.2]],
    // The Khanate's frontier, from the Brakespine down to the fens.
    [[6.5, 4.7], [5.4, 4.8], [4.4, 5.0], [3.2, 5.1], [3.6, 4.4], [2.7, 3.2], [3.1, 1.6], [2.7, 0], [3.1, -1.4], [3.9, -2.1], [6.5, -2.4]],
  ],

  rivers: [
    // Out of Liraun, past the Verge, round the east of Dunmarrow and away southwest through Cendral to the sea.
    [[0.6, 9.5], [1.0, 7.6], [0.9, 6.2], [1.25, 4.6], [1.05, 3], [1.3, 1.6], [1.2, 0.4], [1.15, -0.6], [0.7, -1.4], [-0.3, -1.9], [-1.6, -2.4], [-2.8, -2.9], [-4.4, -3.4], [-6, -4.6], [-14, -16], [-30, -40]],
    // Down from the Karrowdeep, past the Pettifold hills, to join it.
    [[-3.7, 4.9], [-3.1, 3.7], [-2.35, 2.6], [-2.0, 1.2], [-1.75, -0.4], [-1.9, -1.4], [-1.6, -2.4]],
    // Off the Brakespine, across the steppe and into the Vashk fens.
    [[6.4, 9.5], [6.0, 7.4], [5.6, 5.6], [5.2, 4.2], [5.0, 2.8], [5.15, 1.2], [4.8, -0.4], [4.3, -1.8], [3.9, -2.6], [3.6, -3.6], [4.4, -4.6], [12, -20], [40, -50]],
  ],

  ranges: [
    // The Karrowdeep's southern ranges.
    [[-6.2, 4.75], [-5.2, 4.5], [-4.1, 4.7], [-3.1, 4.4]],
    [[-6.2, 3.7], [-5.2, 3.9], [-4.4, 3.6], [-3.4, 3.8]],
    [[-6.2, 2.0], [-5.6, 1.6]],
    // The Brakespine.
    [[4.3, 5.7], [4.8, 6.6], [5.4, 7.2], [6.2, 8.6]],
  ],
  peaks: [[-4.7, 4.25]],

  hills: [
    // The Pettifold's warren-hills, above the goblin guild-cities.
    [[-6.2, 1.0], [-3.1, 1.1], [-3.0, 0.35], [-6.2, 0.35]],
    [[-6.2, -0.5], [-3.0, -0.5], [-3.2, -1.1], [-6.2, -1.2]],
    // The Brakespine's foothills.
    [[3.9, 6.6], [4.4, 5.4], [6.4, 5.0], [6.4, 6.4]],
    // Low rises of the steppe, where the kheregs stand.
    [[3.6, 2.2], [5.6, 2.4], [5.8, 3.6], [3.8, 3.6]],
    // The rise the Vexillary stands on.
    [[-1.8, 0.4], [-1.25, 0.5], [-1.2, 1.4], [-1.9, 1.4]],
  ],

  forests: [
    // Liraun, the gray forest.
    { kind: 'broadleaf', area: [[-6, 5.5], [-2.4, 5.3], [-0.5, 5.6], [1.5, 5.4], [3.3, 5.4], [3.8, 6.3], [3.4, 9], [-6, 9]] },
    // Pines on the Karrowdeep's lower slopes.
    { kind: 'pine', area: [[-5.2, 2.3], [-3.6, 2.3], [-3.3, 1.5], [-5.4, 1.5]] },
    // Copses on the neutral ground and in Cendral's river country.
    { kind: 'broadleaf', area: [[-1.6, 3.0], [-0.4, 3.2], [-0.2, 2.2], [-1.4, 2.0]] },
    { kind: 'broadleaf', area: [[1.8, 2.6], [2.4, 2.8], [2.5, 1.6], [1.8, 1.5]] },
    { kind: 'broadleaf', area: [[-4.8, -1.6], [-3.4, -1.6], [-3.2, -2.4], [-4.8, -2.5]] },
    { kind: 'broadleaf', area: [[0.6, -2.6], [1.8, -2.4], [2.0, -3.4], [0.8, -3.6]] },
  ],

  marshes: [
    // The Vashk fens.
    [[2.8, -2.4], [3.5, -2.45], [3.6, -3.1], [6.2, -3.6], [6.2, -4.2], [2.9, -4.2]],
    [[4.3, -2.5], [6.2, -2.6], [6.2, -3.0], [5.6, -3.0]],
  ],

  labels: [
    { text: 'LIRAUN', at: [-1.2, 7.7], kind: 'realm' },
    { text: 'KARROWDEEP', at: [-4.05, 2.75], kind: 'realm' },
    { text: 'PETTIFOLD', at: [-4.15, -0.05], kind: 'realm' },
    { text: 'CENDRAL', at: [-2.4, -3.0], kind: 'realm' },
    { text: 'HADDARI', at: [3.95, 0.85], kind: 'realm' },
    { text: 'Dunmarrow', at: [-0.1, -1.18], kind: 'feature' },
    { text: 'The Neutral Ground', at: [1.0, 3.9], kind: 'feature' },
    { text: 'The Brakespine', at: [4.45, 7.05], kind: 'feature', rotate: -57 },
    { text: 'The Vashk Fens', at: [4.7, -3.2], kind: 'feature' },
    { text: 'The Haddari Steppe', at: [3.95, 0.25], kind: 'feature' },
  ],
};
