import type { MapArt } from './types';

/**
 * Ereth, from Valcrest north to Morvhal. Valcrest's green river country fills the south, with Aurion on
 * its hill above the River Vael, which runs down to a bay on the southern sea; the Western Sea bounds the
 * kingdom's west. Some eight days' march north, Fort Greywatch holds the kingdom's northern edge above the
 * grey hills of the Ashen Marches, the no-man's-land whose central hills hide the Heartspring. Beyond a
 * broken wall of mountains lies Morvhal, its capital Cinderhold on the flank of a slumbering volcano.
 * Coordinates are hours on foot from Aurion (x east, y north), the space of the locations' `map`.
 *
 * The Void Between is not in Ereth at all; it is placed at Aurion, where the character wakes.
 */
export const goddessBargainMap: MapArt = {
  id: 'goddess-bargain',
  bounds: { minX: -72, maxX: 70, minY: -38, maxY: 140 },

  land: [
    // The mainland: the west coast from Morvhal down to the Vael's bay, then east along the southern sea.
    [
      [-62, 400],
      [-56, 150],
      [-50, 138],
      [-55, 126],
      [-49, 112],
      [-45, 100],
      [-49, 88],
      [-43, 76],
      [-39, 64],
      [-43, 52],
      [-38, 40],
      [-34, 28],
      [-37, 16],
      [-31, 6],
      [-33, -4],
      [-27, -12],
      [-22, -19],
      [-15, -22],
      [-9, -21],
      [-5.5, -17], // the Vael's mouth, at the head of its bay
      [-1.5, -20],
      [4, -24],
      [12, -26],
      [22, -24.5],
      [32, -28],
      [42, -26],
      [52, -30],
      [64, -27],
      [76, -31],
      [400, -30],
      [400, 400],
    ],
    // Isles off the coasts.
    [
      [-58, 30],
      [-54, 33],
      [-50, 30],
      [-53, 26],
    ],
    [
      [-30, -28],
      [-25, -26.5],
      [-22, -29],
      [-27, -31],
    ],
  ],

  realms: [
    {
      name: 'Valcrest',
      color: '#d6a756',
      area: [[-400, 70], [-30, 72], [-10, 70], [10, 71.5], [30, 69], [50, 72], [400, 70], [400, -400], [-400, -400]],
    },
    {
      name: 'The Ashen Marches',
      color: '#8f8f96',
      area: [[-400, 70], [-30, 72], [-10, 70], [10, 71.5], [30, 69], [50, 72], [400, 70], [400, 101], [50, 98], [30, 100], [10, 99], [-10, 101], [-30, 99], [-400, 100]],
    },
    {
      name: 'Morvhal',
      color: '#b0443a',
      area: [[-400, 100], [-30, 99], [-10, 101], [10, 99], [30, 100], [50, 98], [400, 101], [400, 400], [-400, 400]],
    },
  ],

  borders: [
    [[-60, 70], [-30, 72], [-10, 70], [10, 71.5], [30, 69], [50, 72], [90, 70]],
    [[-60, 100], [-30, 99], [-10, 101], [10, 99], [30, 100], [50, 98], [90, 101]],
  ],

  rivers: [
    // The River Vael: from the northern uplands, past Aurion's hill, to its bay on the southern sea.
    [[10, 58], [8, 46], [5, 34], [2.5, 22], [-0.5, 12], [-2, 4], [-2.4, -3], [-3.4, -10], [-5.5, -17]],
    [[34, 30], [26, 20], [16, 10], [8, 0], [2, -5], [-3, -8]],
    // Western rivers to the Western Sea.
    [[-16, 46], [-22, 34], [-26, 20], [-31, 6]],
    // The eastern river, down to the southern sea.
    [[48, 62], [52, 42], [55, 22], [58, 2], [55, -12], [52, -30]],
    // Morvhal's river, from the volcanic heights west to the sea.
    [[6, 132], [-4, 128], [-18, 112], [-34, 106], [-45, 100]],
  ],

  ranges: [
    // The broken wall between the Marches and Morvhal; the way north runs through its gap.
    [[-44, 103], [-34, 101], [-22, 104], [-14, 102]],
    [[16, 103], [28, 101], [40, 104], [54, 102], [72, 105]],
    // The volcanic heights around Cinderhold.
    [[-28, 128], [-18, 124], [-10, 128], [-6, 134]],
    [[6, 126], [16, 122], [26, 128], [40, 126], [56, 130], [72, 128]],
    // Valcrest's eastern mountains.
    [[64, 74], [62, 60], [66, 46], [72, 34]],
  ],
  // The slumbering volcano above Cinderhold.
  peaks: [[-2.5, 121.5]],

  hills: [
    // The northern uplands below Greywatch.
    [[-20, 52], [0, 54], [22, 52], [30, 62], [18, 66], [-6, 64], [-22, 62]],
    // The grey hills of the Ashen Marches, and the central hills over the Heartspring.
    [[-38, 76], [-20, 77], [-16, 88], [-30, 94], [-40, 88]],
    [[-6, 77], [12, 76], [16, 86], [10, 94], [-6, 93], [-10, 86]],
    [[26, 78], [46, 76], [52, 88], [34, 94], [24, 88]],
    // Valcrest's downs.
    [[18, 30], [32, 36], [36, 46], [24, 46], [16, 38]],
    [[-28, -6], [-16, -4], [-14, -12], [-24, -14]],
    // Morvhal's ash-hills.
    [[-40, 108], [-24, 110], [-26, 118], [-40, 118]],
    [[46, 108], [62, 108], [64, 118], [48, 118]],
  ],

  forests: [
    { kind: 'broadleaf', area: [[-26, 22], [-12, 24], [-10, 14], [-18, 8], [-27, 12]] },
    { kind: 'broadleaf', area: [[22, -10], [36, -8], [40, -18], [26, -20]] },
    { kind: 'broadleaf', area: [[30, 48], [42, 50], [44, 40], [36, 38]] },
    { kind: 'broadleaf', area: [[-30, 40], [-22, 44], [-18, 36], [-28, 32]] },
    { kind: 'pine', area: [[40, 60], [54, 66], [58, 56], [46, 52]] },
    { kind: 'pine', area: [[-38, 56], [-28, 58], [-26, 48], [-36, 46]] },
    // The dark pines of Morvhal's western hills.
    { kind: 'pine', area: [[-48, 124], [-36, 130], [-32, 138], [-46, 140]] },
  ],

  marshes: [
    // The Vael's delta.
    [[-10, -14], [-4, -12], [-1, -17], [-8, -18.5]],
  ],

  labels: [
    { text: 'VALCREST', at: [31, 4], kind: 'realm' },
    { text: 'MORVHAL', at: [24, 112.5], kind: 'realm' },
    { text: 'The Western Sea', at: [-58, 46], kind: 'sea', rotate: -80 },
    { text: 'The Southern Sea', at: [26, -34.5], kind: 'sea' },
    { text: 'River Vael', at: [9, 26], kind: 'water', rotate: -72 },
  ],
};
