import type { MapArt } from './types';

/**
 * The Empty Crown: the Reach in the middle, Ulvhal's fjords to the north, Kestrany's river country to
 * the east, Carthen's hills to the south, Corsal off the southwest coast, and Mount Ysmere in the
 * passes between Carthen and Kestrany. Coordinates are hours on foot from Thornwick (x east, y north),
 * the same space as the world's location `map` positions, so the places sit where the land says.
 *
 * Far to the west, beyond `bounds`, lie the Hearthstone Isles and Avandre, the later phase's secret
 * continent. The map widens to fit placed places, so that land comes into view only once the narrator
 * creates a place there (positions in the 'Avandre: Places and the Map' lore).
 */
export const emptyCrownMap: MapArt = {
  id: 'empty-crown',
  bounds: { minX: -84, maxX: 104, minY: -100, maxY: 100 },

  land: [
    // The mainland: the west coast from Ulvhal's fjords down past Saltmere Bay to Carthen, then out past the map's edges.
    [
      [-60, 400],
      [-46, 104],
      [-44, 96],
      [-47, 89],
      [-41, 84],
      [-34, 79.6],
      [-26, 78.8],
      [-19.5, 77.8],
      [-17, 76.4], // head of Skarn Fjord
      [-19.5, 74.6],
      [-27, 73.4],
      [-36, 71.2],
      [-42, 66],
      [-39, 60],
      [-33, 58.6],
      [-27, 56.6],
      [-34, 54.4],
      [-39, 50],
      [-37, 42],
      [-33, 34],
      [-34, 26],
      [-30, 19],
      [-27, 15.6], // Saltmere Bay, north headland
      [-22, 13.8],
      [-17.5, 11.8],
      [-15, 9.4], // bay head, the Thorn's mouth
      [-18, 8.4],
      [-24, 8.1], // Gull's Rest's beach
      [-29, 6.6],
      [-33, 3], // south headland
      [-32, -4],
      [-34, -12],
      [-31, -20],
      [-34, -28],
      [-38, -35],
      [-36, -41],
      [-31, -47],
      [-29, -55],
      [-31, -62],
      [-26, -68],
      [-23, -76],
      [-24, -81],
      [-21, -88],
      [-26, -95],
      [-30, -104],
      [-40, -400],
      [400, -400],
      [400, 400],
    ],
    // Corsal, the League's free island.
    [
      [-50, -44.5],
      [-46, -41.5],
      [-41, -42.5],
      [-38.6, -46.5],
      [-40, -51],
      [-44.5, -53],
      [-49, -51],
      [-51, -47.5],
    ],
    // Skerries and small isles.
    [
      [-52, 74],
      [-49, 76],
      [-47, 73],
      [-50, 71],
    ],
    [
      [-56, 32],
      [-53, 34],
      [-51, 31],
      [-54, 29],
    ],
    [
      [-46, -20],
      [-44, -18.5],
      [-43, -21],
      [-45, -22],
    ],
    // The Hearthstone Isles, the League's secret midsummer anchorage far out in the Western Sea.
    [
      [-222, -44],
      [-214, -40],
      [-208, -45],
      [-212, -52],
      [-220, -52],
    ],
    [
      [-230, -58],
      [-226, -55],
      [-223, -59],
      [-227, -62],
    ],
    [
      [-200, -36],
      [-197, -34],
      [-194, -37],
      [-198, -39],
    ],
    // Avandre, across the Stillwater: its east coast from the northern pines down past Ammerine and the
    // Ilu delta to the Greenmaw, then away west past any map's edge.
    [
      [-480, 400],
      [-470, 250],
      [-458, 214],
      [-462, 186],
      [-450, 160],
      [-454, 132],
      [-446, 104],
      [-452, 78],
      [-444, 52],
      [-447, 30],
      [-440, 14],
      [-439, 6], // Ammerine's bay
      [-441, -1],
      [-446, -8],
      [-450, -30],
      [-445, -52],
      [-452, -78],
      [-446, -104],
      [-441, -128],
      [-434, -146],
      [-433, -156], // the Ilu's mouth
      [-440, -168],
      [-452, -190],
      [-470, -214],
      [-496, -238],
      [-530, -256],
      [-560, -262],
      [-600, -258],
      [-640, -270],
      [-700, -300],
      [-760, -400],
      [-1400, -400],
      [-1400, 400],
    ],
  ],

  realms: [
    {
      name: 'Ulvhal',
      color: '#6f8fb0',
      area: [[-200, 400], [44, 400], [40, 90], [36, 70], [34, 58], [20, 52], [0, 50], [-20, 50], [-200, 48]],
    },
    {
      name: 'Kestrany',
      color: '#d6a756',
      area: [[34, 58], [40, 90], [44, 400], [400, 400], [400, -120], [70, -70], [56, -60], [44, -48], [30, -36], [28, -20], [32, 0], [34, 20], [32, 40]],
    },
    {
      name: 'Carthen',
      color: '#c8553d',
      area: [[-39, -36], [-10, -38], [10, -36], [18, -30], [30, -36], [44, -48], [56, -60], [70, -70], [400, -120], [400, -400], [-200, -400], [-200, -70], [-60, -66], [-34, -56], [-34, -48], [-37, -42]],
    },
    {
      name: 'The Reach',
      color: '#5fa38d',
      area: [[-200, 48], [-20, 50], [0, 50], [20, 52], [34, 58], [32, 40], [34, 20], [32, 0], [28, -20], [30, -36], [18, -30], [10, -36], [-10, -38], [-39, -36], [-200, -36]],
    },
    {
      name: 'Corsal',
      color: '#9db4c0',
      area: [[-56, -38], [-36, -38], [-34, -56], [-56, -58]],
    },
    {
      name: 'Mount Ysmere',
      color: '#ecc57a',
      area: [[36, -38], [40.2, -39.8], [42, -44], [40.2, -48.2], [36, -50], [31.8, -48.2], [30, -44], [31.8, -39.8]],
      outline: true,
    },
    {
      name: 'The Hearthstone Isles',
      color: '#9db4c0',
      area: [[-234, -30], [-190, -30], [-190, -66], [-234, -66]],
    },
    {
      name: 'The Sallow Coast',
      color: '#a3b86c',
      area: [[-490, 140], [-400, 140], [-400, -60], [-500, -60], [-505, 0], [-495, 60]],
    },
    {
      name: 'Nhal',
      color: '#a9a3c9',
      area: [[-495, 60], [-505, 0], [-500, -60], [-580, -60], [-590, 40], [-570, 150], [-530, 160], [-490, 140]],
    },
    {
      name: 'The Amaranth Empire',
      color: '#9a5f8f',
      area: [[-400, -60], [-400, -400], [-1400, -400], [-1400, 40], [-590, 40], [-580, -60]],
    },
    {
      name: 'The Ochre Steppe',
      color: '#c98e4a',
      area: [[-1400, 40], [-1400, 400], [-400, 400], [-400, 140], [-490, 140], [-530, 160], [-570, 150], [-590, 40]],
    },
  ],

  borders: [
    [[-60, 49], [-20, 50], [0, 50], [20, 52], [34, 58]],
    [[34, 58], [36, 70], [40, 90], [44, 120]],
    [[34, 58], [32, 40], [34, 20], [32, 0], [28, -20], [30, -36]],
    [[30, -36], [18, -30], [10, -36], [-10, -38], [-39, -36]],
    [[30, -36], [44, -48], [56, -60], [70, -70], [130, -110]],
    // Avandre: the steppe's frontier, the Sallow Coast against Nhal, and the empire's northern line.
    [[-400, 140], [-490, 140], [-530, 160], [-570, 150], [-590, 40], [-1400, 40]],
    [[-490, 140], [-495, 60], [-505, 0], [-500, -60]],
    [[-400, -60], [-580, -60], [-590, 40]],
  ],

  rivers: [
    // The Thorn: down from the Iron Hills, past Ashen Keep and Thornwick, through Hob's Ford to Saltmere Bay.
    [[9, 31], [7, 24], [4, 16.5], [3.5, 8], [2, 2.2], [-3, 1.2], [-8, 0.9], [-12, 4], [-15, 9.4]],
    // The Grey: out of the east, through Greywater Fens, into the Thorn by Thornwick.
    [[33, -12], [26, -7], [18, -4], [10, -2.5], [3, 1.6]],
    // The Aubre: Kestrany's great river, through Aubrel and away southeast.
    [[56, 56], [60, 40], [62, 22], [64.5, 4.5], [70, -10], [84, -30], [100, -46], [130, -60]],
    [[40, 30], [50, 18], [60, 11], [63.5, 8]],
    // The Varre: from the Ysmere passes down past Castel Varre to the sea.
    [[26, -56], [18, -62], [9, -68], [5, -70.4], [-4, -73], [-14, -75], [-23, -76]],
    // The Skarn: down from the Ulvhal spine to the fjord head.
    [[2, 96], [-4, 86], [-10, 79], [-17, 76.4]],
    // The Ilu: the Amaranth Empire's great river, past Ilun Teshar to its delta below Sethra.
    [[-800, -120], [-720, -138], [-660, -142], [-600, -150], [-540, -146], [-490, -150], [-433, -155]],
    // The Amme: out of the Pale Spine to Ammerine's bay.
    [[-528, 22], [-500, 16], [-470, 10], [-439, 6]],
    // The Ochre: across the steppe past the Hundred Fires, away west.
    [[-560, 200], [-600, 186], [-650, 170], [-720, 160], [-800, 150]],
  ],

  ranges: [
    // The Ysmere range, the wall between Carthen and Kestrany.
    [[16, -26], [24, -34], [32, -40], [40, -47], [48, -54], [58, -61], [68, -68], [78, -72], [90, -74]],
    // Ulvhal's spine.
    [[-4, 58], [4, 64], [12, 70], [20, 78], [26, 88], [30, 104]],
    [[-30, 90], [-22, 96], [-14, 106]],
    // The Pale Spine, Avandre's wall between the coast and the steppe.
    [[-512, -60], [-522, -20], [-530, 20], [-526, 60], [-538, 120], [-552, 170], [-570, 220]],
  ],
  // Mount Ysmere; the Veil above Nhal Amar.
  peaks: [[35, -41.5], [-534, 102]],

  hills: [
    // The Iron Hills.
    [[-6, 24], [2, 22], [12, 25], [14, 32], [8, 37], [-2, 36], [-8, 30]],
    // Kestran downs.
    [[44, 40], [56, 44], [60, 52], [48, 54], [40, 48]],
    // Carthen's hill country.
    [[-14, -50], [0, -48], [14, -52], [20, -62], [10, -64], [-4, -64], [-16, -60]],
    [[-20, -84], [-8, -82], [-4, -92], [-16, -96]],
    [[30, -76], [46, -74], [54, -86], [36, -92]],
    // The Sootfells and the Tinward Downs.
    [[-508, 46], [-486, 46], [-478, 60], [-490, 70], [-506, 66]],
    [[-488, -12], [-462, -10], [-458, -30], [-480, -36], [-490, -26]],
  ],

  forests: [
    // The Wending Wood.
    { kind: 'broadleaf', area: [[-9, -5], [0, -4.6], [9, -6], [11, -13], [4, -19], [-6, -18], [-11, -12]] },
    { kind: 'broadleaf', area: [[40, -4], [50, -2], [52, -12], [42, -14]] },
    { kind: 'broadleaf', area: [[70, 40], [82, 42], [84, 30], [72, 30]] },
    { kind: 'pine', area: [[-10, 60], [4, 62], [0, 72], [-14, 70]] },
    { kind: 'pine', area: [[14, 84], [24, 92], [16, 98], [6, 92]] },
    { kind: 'pine', area: [[-34, 86], [-24, 84], [-20, 92], [-32, 94]] },
    // The Greenmaw, and the pines of Avandre's north coast.
    { kind: 'broadleaf', area: [[-580, -210], [-500, -206], [-480, -236], [-560, -256], [-600, -240]] },
    { kind: 'pine', area: [[-476, 150], [-454, 160], [-458, 206], [-484, 214], [-492, 180]] },
  ],

  marshes: [
    // Greywater Fens.
    [[8, -1], [16, -0.6], [22, -2], [24, -7], [16, -9], [9, -6]],
    // The Ilu delta.
    [[-452, -144], [-436, -146], [-436, -162], [-454, -164]],
  ],

  labels: [
    { text: 'ULVHAL', at: [8, 84], kind: 'realm' },
    { text: 'KESTRANY', at: [76, 22], kind: 'realm' },
    { text: 'CARTHEN', at: [12, -86], kind: 'realm' },
    { text: 'THE REACH', at: [-16, 42], kind: 'realm' },
    { text: 'The Western Sea', at: [-62, 8], kind: 'sea' },
    { text: 'Saltmere Bay', at: [-38, 11], kind: 'water' },
    { text: 'Skarn Fjord', at: [-38, 76], kind: 'water' },
    { text: 'The Ysmere Range', at: [60, -52], kind: 'feature', rotate: 33 },
    { text: 'The Hearthstone Isles', at: [-212, -70], kind: 'water' },
    { text: 'The Stillwater', at: [-330, -10], kind: 'sea' },
    { text: 'THE SALLOW COAST', at: [-480, 120], kind: 'realm' },
    { text: 'NHAL', at: [-560, 10], kind: 'realm' },
    { text: 'THE AMARANTH EMPIRE', at: [-590, -95], kind: 'realm' },
    { text: 'THE OCHRE STEPPE', at: [-610, 130], kind: 'realm' },
    { text: 'The Pale Spine', at: [-548, 50], kind: 'feature', rotate: -75 },
    { text: 'The Greenmaw', at: [-540, -232], kind: 'feature' },
  ],
};
