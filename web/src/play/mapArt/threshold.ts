import type { MapArt } from './types';

/**
 * Threshold: Solano City, a fictional West Coast metro. Coordinates are hours on foot (about 3 miles
 * an hour) from Corbel Remediation's yard in Vireo (x east, y north), the same space as the world's
 * location `map` positions.
 *
 * The Pacific is to the west, with the Port of Solano's harbor where the Solano River (a dry concrete
 * channel most of the year) reaches the sea. The river comes down out of the Sierra Vieja in the
 * northeast, runs along the south edge of downtown, through Ninebridge (the riverside district the
 * Ninebridge Spill emptied, named for its bridges), and past the industrial flats of Vireo to the
 * harbor. Vireo lies south of the river around the Corbel yard, with the Ostrander Parkade half an
 * hour north toward Ninebridge and the Tolliver Cordon the same distance southeast. Downtown (the
 * Harlow Annex and Kestrel Tower) is two to three hours northeast; Palisandro's strip malls and
 * Kuzma Aquatics about three hours southeast. The Alta Loma hills rise north of downtown; the
 * coast runs north past Seabright's beaches and south past the Solano Slough's marsh.
 */
export const thresholdMap: MapArt = {
  id: 'threshold',
  px: 140,
  bounds: { minX: -5, maxX: 6, minY: -4.5, maxY: 5 },

  land: [
    // The coast: north past Seabright, in to the harbor at the river's mouth, then away southeast.
    [
      [-5.6, 30],
      [-5.5, 7],
      [-5.2, 5.6],
      [-4.8, 4.4],
      [-4.5, 3.6],
      [-4.25, 2.9], // Seabright
      [-4.05, 2.2],
      [-3.75, 1.5],
      [-3.5, 1.0],
      [-3.45, 0.62], // north breakwater
      [-3.0, 0.55],
      [-2.6, 0.45],
      [-2.35, 0.28], // the river's mouth
      [-2.3, 0.0],
      [-2.45, -0.3],
      [-2.8, -0.42],
      [-3.15, -0.5],
      [-3.4, -0.62], // Pier Point, the harbor's south arm
      [-3.35, -0.9],
      [-3.05, -1.2],
      [-2.75, -1.7],
      [-2.55, -2.3],
      [-2.2, -2.9],
      [-1.85, -3.4],
      [-1.4, -3.9],
      [-0.9, -4.4],
      [-0.4, -5.0],
      [1, -7],
      [3, -30],
      [30, -30],
      [30, 30],
    ],
    // Mole Island, the container terminal across the harbor mouth.
    [
      [-3.95, 0.2],
      [-3.45, 0.22],
      [-3.0, 0.12],
      [-3.05, -0.08],
      [-3.5, -0.08],
      [-3.95, -0.05],
    ],
  ],

  realms: [
    // Vireo: the industrial flats south of the river, around the Corbel yard.
    {
      name: 'Vireo',
      color: '#c8553d',
      area: [[-2.3, 0.3], [-1.6, 0.55], [-0.6, 0.62], [0.1, 0.74], [0.8, 0.7], [1.5, 0.75], [1.65, -0.2], [1.45, -1.25], [0.2, -1.45], [-1.2, -1.4], [-2.35, -1.0]],
    },
    // Ninebridge, both banks of the river between Vireo and downtown.
    {
      name: 'Ninebridge',
      color: '#a9a3c9',
      area: [[-0.2, 0.74], [0.1, 0.74], [0.8, 0.7], [1.5, 0.75], [1.6, 1.2], [1.25, 1.45], [0.6, 1.62], [-0.15, 1.45], [-0.35, 1.05]],
      outline: true,
    },
    // Downtown: the Harlow Annex, the company towers, the old courthouse blocks.
    {
      name: 'Downtown',
      color: '#ecc57a',
      area: [[1.25, 1.45], [1.6, 1.2], [2.35, 1.3], [2.75, 1.6], [2.8, 2.35], [2.4, 2.65], [1.6, 2.6], [1.15, 2.1]],
      outline: true,
    },
    // Palisandro: strip malls, taquerias and tract homes to the southeast.
    {
      name: 'Palisandro',
      color: '#5fa38d',
      area: [[1.65, -0.2], [2.9, -0.4], [3.9, -0.9], [4.1, -2.2], [3.5, -3.1], [2.2, -3.0], [1.45, -2.2], [1.45, -1.25]],
    },
    // The Port of Solano, on the harbor's south shore.
    {
      name: 'Port of Solano',
      color: '#6f8fb0',
      area: [[-3.5, -0.4], [-2.3, -0.2], [-2.0, -0.6], [-2.35, -1.0], [-3.2, -1.1]],
      outline: true,
    },
    // Alta Loma, the hill neighborhoods north of downtown, where the money lives.
    {
      name: 'Alta Loma',
      color: '#d6a756',
      area: [[0.0, 2.9], [1.15, 2.7], [2.6, 2.75], [3.6, 3.3], [3.4, 4.6], [1.8, 5.0], [0.2, 4.6], [-0.4, 3.7]],
    },
    // Solano International, on the coastal flats north of the harbor.
    {
      name: 'Solano International Airport',
      color: '#b5a88f',
      area: [[-3.3, 1.15], [-2.0, 1.25], [-1.8, 1.85], [-3.0, 1.85]],
      outline: true,
    },
    // Seabright, the beach town on the north coast.
    {
      name: 'Seabright',
      color: '#9db4c0',
      area: [[-5.0, 3.9], [-4.1, 3.85], [-3.6, 3.2], [-3.3, 2.5], [-3.15, 1.6], [-3.6, 1.4], [-4.5, 1.9]],
    },
  ],

  borders: [
    // The Solano city limits, through the foothills to the east.
    [[3.0, 7], [3.8, 5.2], [4.3, 3.6], [4.4, 2.0], [4.7, 0.4], [4.8, -1.2], [4.4, -2.8], [4.0, -6]],
  ],

  rivers: [
    // The Solano River, out of the Sierra Vieja, along downtown's south edge, through Ninebridge and
    // past Vireo to the harbor. Concrete-lined and dry most of the year.
    [[7.0, 6.0], [6.0, 4.9], [5.3, 4.0], [4.6, 3.1], [3.8, 2.3], [3.1, 1.6], [2.5, 1.25], [1.9, 1.1], [1.3, 0.98], [0.75, 1.0], [0.2, 0.92], [-0.4, 0.75], [-1.0, 0.6], [-1.6, 0.48], [-2.1, 0.3], [-2.4, 0.18]],
    // Arroyo Seco, a dry wash down from Alta Loma into the river at Ninebridge.
    [[0.4, 4.8], [0.55, 3.8], [0.4, 2.8], [0.55, 1.9], [0.6, 1.0]],
    // Palisandro Creek, down from the southern foothills to the slough.
    [[5.5, -2.0], [4.4, -2.0], [3.4, -1.9], [2.2, -2.3], [0.8, -2.5], [-0.6, -2.1], [-1.6, -1.8], [-2.5, -1.9]],
  ],

  ranges: [
    // The Sierra Vieja, the mountain wall behind the city to the northeast and east.
    // The river cuts its canyon between the two.
    [[2.6, 5.6], [3.4, 5.15], [4.4, 4.9]],
    [[5.5, 3.5], [5.65, 2.4], [5.75, 1.0], [5.8, -0.6]],
  ],
  // Mount Calder, above the river's canyon.
  peaks: [[4.95, 4.5]],

  hills: [
    // The Alta Loma hills north of downtown.
    [[-0.2, 3.2], [1.0, 2.95], [2.4, 3.1], [3.4, 3.6], [3.2, 4.5], [1.6, 4.8], [0.2, 4.4]],
    // The eastern foothills.
    [[4.2, 0.2], [5.0, 0.0], [5.1, 2.4], [4.7, 2.9], [4.2, 2.0]],
    [[4.3, -1.0], [5.5, -1.2], [5.6, -3.0], [4.6, -3.4], [4.1, -2.4]],
    // The Bellavista Hills, south of the creek.
    [[-0.7, -3.0], [0.7, -3.0], [0.8, -3.4], [-0.6, -3.4]],
    // The Seabright bluffs.
    [[-4.6, 4.6], [-3.9, 4.4], [-3.7, 3.9], [-4.4, 4.0]],
  ],

  forests: [
    // Cerro Park, the big wild park in the Alta Loma hills.
    { kind: 'broadleaf', area: [[1.0, 3.4], [2.3, 3.35], [2.5, 4.1], [1.3, 4.3]] },
    // Pines on the Sierra Vieja's lower slopes.
    { kind: 'pine', area: [[3.5, 3.9], [4.3, 3.7], [4.4, 4.3], [3.6, 4.5]] },
    // Pines in the southern foothills.
    { kind: 'pine', area: [[4.9, -3.4], [5.8, -3.6], [5.8, -4.6], [4.9, -4.6]] },
    // Lindqvist Park, by the river at the east end of downtown.
    { kind: 'broadleaf', area: [[2.9, 1.95], [3.4, 1.95], [3.5, 2.4], [3.0, 2.45]] },
  ],

  marshes: [
    // The Solano Slough, the tidal marsh south of the port.
    [[-2.75, -1.35], [-1.9, -1.25], [-1.6, -1.6], [-1.75, -2.2], [-2.45, -2.25]],
  ],

  labels: [
    { text: 'Pacific Ocean', at: [-4.3, -2.6], kind: 'sea' },
    { text: 'Solano Harbor', at: [-2.85, 0.33], kind: 'water' },
    { text: 'Solano River (dry)', at: [-1.15, 0.72], kind: 'water', rotate: 13 },
    { text: 'Solano River', at: [3.75, 2.05], kind: 'water', rotate: 44 },
    { text: 'Arroyo Seco', at: [0.36, 2.4], kind: 'water', rotate: -85 },
    { text: 'Palisandro Creek', at: [0.5, -2.65], kind: 'water', rotate: -6 },
    { text: 'VIREO', at: [-0.9, -0.9], kind: 'realm' },
    { text: 'PALISANDRO', at: [2.75, -2.6], kind: 'realm' },
    { text: 'ALTA LOMA', at: [1.7, 4.62], kind: 'realm' },
    { text: 'Downtown', at: [1.95, 2.48], kind: 'feature' },
    { text: 'Ninebridge Memorial Wall', at: [0.95, 0.6], kind: 'feature' },
    { text: 'Port of Solano', at: [-2.75, -0.8], kind: 'feature' },
    { text: 'Mole Island', at: [-3.5, -0.25], kind: 'feature' },
    { text: 'Solano Slough', at: [-2.15, -2.45], kind: 'feature' },
    { text: 'Seabright', at: [-3.9, 3.0], kind: 'feature' },
    { text: 'Cerro Park', at: [1.75, 3.6], kind: 'feature' },
    { text: 'Lindqvist Park', at: [3.2, 1.8], kind: 'feature' },
    { text: 'Sierra Vieja', at: [5.33, 2.1], kind: 'feature', rotate: -86 },
    { text: 'Mount Calder', at: [4.95, 4.05], kind: 'feature' },
    { text: 'the eastern foothills', at: [5.3, -0.78], kind: 'feature' },
    { text: 'Solano city limits', at: [4.2, -0.3], kind: 'feature', rotate: -84 },
    { text: 'the rail yards', at: [-1.5, -0.2], kind: 'feature' },
    { text: 'the flats', at: [0.2, -1.1], kind: 'feature' },
    { text: 'Solano International Airport', at: [-2.3, 1.55], kind: 'feature' },
    { text: 'Las Palmas', at: [-1.5, 2.6], kind: 'feature' },
    { text: 'Westlake', at: [-1.0, 3.8], kind: 'feature' },
    { text: 'Bellavista Hills', at: [0.0, -3.6], kind: 'feature' },
    { text: 'South Solano', at: [-0.9, -2.9], kind: 'feature' },
  ],
};
