import type { MapArt } from './types';

/**
 * Varenhold and the Stormgate Pass, at city scale. The fortress-city climbs a south-facing cliff at the
 * pass's southern mouth, the Bastion at its crown; the Stormgate runs north between two mountain walls,
 * past Shepherd's Rest (halfway up the road) to Greywatch, the nearest of the seven watchtowers, half a
 * day's climb above the city. The line of the wards crosses the pass beyond Greywatch, and past it lie the
 * Ashen Wastes. The Ironroot clans' mines fill the mountains east of the pass; Aurelan's southern vales
 * open below the cliffs, where the Storm river falls out of the pass and runs away south to the sea.
 * Coordinates are hours on foot from the Bastion (x east, y north), the space of the locations' `map`.
 */
export const varenholdMap: MapArt = {
  id: 'varenhold',
  px: 100,
  bounds: { minX: -6, maxX: 6, minY: -3.6, maxY: 8.4 },

  land: [
    // The whole north of the continent: Aurelan runs south for weeks to its coast, far beyond the map.
    [
      [-400, 400],
      [400, 400],
      [400, -90],
      [120, -96],
      [40, -84],
      [6, -88],
      [-30, -92],
      [-120, -86],
      [-400, -90],
    ],
  ],

  realms: [
    {
      name: 'Aurelan',
      color: '#c9a55a',
      area: [[-400, 6.3], [-4, 6.35], [-2, 6.1], [-0.9, 6.3], [0.4, 6.2], [1.4, 6.0], [2.2, 6.2], [2.2, 3], [2.0, 0.5], [2.3, -1.4], [3, -400], [-400, -400]],
    },
    {
      name: 'The Ironroot Holds',
      color: '#b07a4f',
      area: [[2.2, 6.2], [4, 6.3], [400, 6.3], [400, -400], [3, -400], [2.3, -1.4], [2.0, 0.5], [2.2, 3]],
    },
    {
      name: 'The Ashen Wastes',
      color: '#8f8f96',
      area: [[-400, 6.3], [-4, 6.35], [-2, 6.1], [-0.9, 6.3], [0.4, 6.2], [1.4, 6.0], [2.2, 6.2], [4, 6.3], [400, 6.3], [400, 400], [-400, 400]],
    },
    {
      name: 'Varenhold',
      color: '#d9cfbb',
      area: [[-0.75, 0.12], [-0.3, 0.22], [0.2, 0.2], [0.55, 0.05], [0.68, -0.35], [0.52, -0.8], [0.2, -0.98], [-0.25, -0.98], [-0.62, -0.75], [-0.78, -0.3]],
      outline: true,
    },
  ],

  borders: [
    // The line of the Stormgate Wards, beyond Greywatch: Aurelan's last frontier against the dead.
    [[-7, 6.4], [-4, 6.35], [-2, 6.1], [-0.9, 6.3], [0.4, 6.2], [1.4, 6.0], [2.2, 6.2], [4, 6.3], [7, 6.25]],
    // The Ironroot clans' marches, along the east wall of the pass.
    [[2.2, 6.2], [2.2, 3], [2.0, 0.5], [2.3, -1.4], [2.6, -3], [2.8, -4.5]],
  ],

  rivers: [
    // The Storm: from the snows at the head of the pass, down the valley floor, over the falls east of the
    // city, and away south through Aurelan's vales to the sea.
    [[-0.7, 10], [-0.55, 8], [-0.25, 6.6], [0.45, 5.4], [0.8, 4.2], [0.95, 3], [0.8, 1.7], [0.6, 0.7], [0.82, -0.2], [0.85, -1.2], [0.55, -2.2], [0.3, -3.2], [0.6, -4.4], [0, -20], [-4, -50], [6, -88]],
    // A torrent off the western wall, joining below the city.
    [[-3.4, 1.6], [-2.6, 0.6], [-1.6, -0.9], [-0.6, -1.8], [0.55, -2.2]],
    // From the Ironroot mines, down to the vale.
    [[3.6, 2.2], [3.1, 0.6], [2.6, -1], [1.7, -2.6], [0.4, -3.4]],
  ],

  ranges: [
    // The western wall of the Stormgate, and its spurs running away west.
    [[-1.1, -0.3], [-1.2, 1.2], [-1.0, 2.6], [-1.1, 4], [-1.2, 5.4], [-1.0, 6.6], [-1.4, 7.4]],
    [[-1.4, 0.9], [-2.4, 1.5], [-3.4, 1.1], [-4.4, 1.8], [-5.6, 1.5], [-6.8, 2]],
    [[-1.5, 3.3], [-2.5, 4.1], [-3.7, 3.7], [-4.9, 4.5], [-6.2, 4.2], [-7, 4.6]],
    [[-1.6, 5.9], [-2.5, 6.8], [-3.6, 6.5], [-4.8, 7.1], [-6.0, 6.8], [-7, 7.2]],
    [[-3.0, -0.6], [-3.2, 0.4], [-2.8, 2.4], [-3.1, 3], [-2.9, 5], [-3.2, 5.8]],
    [[-4.6, -0.7], [-5.2, 0.3], [-4.9, 2.8], [-5.4, 3.4], [-5.2, 5.4], [-5.6, 6]],
    // The eastern wall, and the Ironroot mountains behind it.
    [[1.55, -0.2], [1.75, 1.3], [1.6, 2.8], [1.5, 4.2], [1.4, 5.5], [1.2, 6.6], [1.5, 7.4]],
    [[1.8, 2.1], [2.8, 2.7], [3.9, 2.4], [5.0, 3.1], [6.2, 2.8], [7, 3.2]],
    [[1.6, 4.6], [2.6, 5.4], [3.8, 5.0], [4.9, 5.8], [6.1, 5.5], [7, 6]],
    [[2.6, -0.4], [2.9, 0.6], [2.7, 1.6]],
    [[3.4, 3.4], [3.5, 4.3]],
    [[5.6, 3.6], [5.4, 4.6]],
  ],
  // The great peaks flanking the pass.
  peaks: [[-2.1, 2.6], [2.3, 4.2], [-2.2, 5.3]],

  hills: [
    // The cliffs and crags either side of the city.
    [[-2.6, -0.5], [-1.3, -0.5], [-1.2, 0.5], [-2.2, 0.6]],
    // The cliff-foot and the southern foothills.
    [[-6.5, -0.9], [-1.2, -0.9], [-0.9, -1.5], [-3, -1.9], [-6.5, -1.7]],
    [[1.2, -0.7], [3.6, -0.6], [4.4, -1.4], [2.6, -1.8], [1.4, -1.4]],
    // The Ironroot mine country.
    [[3.4, -0.3], [6.5, -0.3], [6.5, 1.8], [4.6, 2.2], [3.6, 1.4]],
    // The ashen hills beyond the wards, where the pass opens onto the Wastes.
    [[-6.6, 7.6], [-3.6, 7.5], [-3.4, 8.8], [-6.6, 8.8]],
    [[3.6, 7.5], [6.6, 7.4], [6.6, 8.8], [3.4, 8.8]],
    [[-1.4, 6.8], [1.6, 6.8], [1.8, 7.35], [-1.6, 7.35]],
  ],

  forests: [
    // Pines on the lower slopes, either side of the city.
    { kind: 'pine', area: [[-5.6, -1.9], [-1.4, -1.9], [-1.0, -2.6], [-3.2, -3.0], [-5.6, -2.8]] },
    { kind: 'pine', area: [[1.5, -1.9], [3.9, -1.8], [4.6, -2.6], [2.6, -3.1]] },
    // Broadleaf woods in the vales of Aurelan.
    { kind: 'broadleaf', area: [[-4.6, -3.0], [-2.4, -3.1], [-2.0, -4], [-4.6, -4]] },
    { kind: 'broadleaf', area: [[3.6, -2.9], [5.8, -2.6], [6.4, -4], [3.8, -4]] },
    // High pine valleys between the spurs.
    { kind: 'pine', area: [[-2.1, 2.0], [-4.1, 2.1], [-4.3, 2.9], [-2.3, 3.1]] },
    { kind: 'pine', area: [[-2.2, 4.6], [-4.0, 4.6], [-4.2, 5.6], [-2.4, 5.8]] },
    { kind: 'pine', area: [[2.2, 3.1], [4.8, 3.5], [4.7, 4.3], [2.3, 4.2]] },
    // Stunted pines in the high valley below Shepherd's Rest.
    { kind: 'pine', area: [[-0.9, 1.0], [-0.2, 1.1], [-0.15, 1.9], [-0.85, 2.1]] },
  ],

  marshes: [],

  labels: [
    { text: 'AURELAN', at: [-3.1, -3.35], kind: 'realm' },
    { text: 'THE ASHEN WASTES', at: [0, 7.75], kind: 'realm' },
    { text: 'IRONROOT', at: [4.6, -0.95], kind: 'realm' },
    { text: 'Varenhold', at: [-0.05, -1.15], kind: 'feature' },
    { text: 'The Stormgate Pass', at: [-0.42, 3.7], kind: 'feature', rotate: -82 },
    { text: 'The Stormgate Wards', at: [-3.6, 6.0], kind: 'feature' },
    { text: 'The Storm', at: [0.42, 3.7], kind: 'water', rotate: -78 },
    { text: 'the southern vales', at: [-0.6, -2.75], kind: 'feature' },
  ],
};
