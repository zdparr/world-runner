import type { MapArt, Pt } from './types';

/**
 * Breach Day: the Kansas City metro and the Kaw valley out to Lawrence. Coordinates are hours on foot
 * (about 3 miles an hour) from the character's Midtown apartment by Westport (x east, y north), the
 * same space as the world's location `map` positions; real places sit at their real offsets, and the
 * world's places under Kansas City (Kaw Point, Union Station, the West Bottoms and the rest) have their
 * own positions, drawn as dots rather than labels. The 'Kansas City' dot itself marks downtown.
 *
 * The Missouri River comes down from Leavenworth in the northwest, past Parkville and Riverside, turns
 * east at Kaw Point (where the Kansas River comes in from the west, about 1.3 hours north-northwest of
 * the apartment) and runs along the north edge of downtown, then away east past the Bluffside bluffs
 * and Independence's north side. It is drawn as open water: the land is two shapes, north and south
 * of it. The state line runs straight south from the West Bottoms along State Line Road (x ≈ -0.4);
 * north of the Kaw the river itself is the line. Downtown, the Crossroads and Union Station are about
 * an hour north of the apartment; Swope Park an hour and a half southeast; Overland Park and the
 * Church of the Open Door two to three hours southwest; Lawrence about twelve hours west up the Kaw.
 */

/** The Missouri's channel, upstream to downstream. */
const MISSOURI: Pt[] = [
  [-5.2, 10],
  [-5.6, 7.2],
  [-5.75, 6.2],
  [-5.6, 5.4], // Leavenworth
  [-5.0, 4.8],
  [-4.4, 4.2],
  [-3.6, 3.4],
  [-2.8, 3.15],
  [-1.7, 3.0], // Parkville
  [-1.2, 2.85],
  [-0.78, 2.5], // Riverside
  [-0.6, 2.1],
  [-0.53, 1.75],
  [-0.48, 1.48], // Kaw Point
  [-0.32, 1.32],
  [-0.08, 1.26], // Broadway Bridge
  [0.18, 1.33], // Berkley Riverfront
  [0.42, 1.48],
  [0.62, 1.66],
  [0.95, 1.76],
  [1.3, 1.82],
  [1.62, 1.98],
  [1.92, 2.08],
  [2.3, 2.06],
  [2.7, 1.9],
  [3.1, 1.72],
  [3.5, 1.72],
  [3.95, 1.85],
  [4.5, 2.1],
  [5.1, 2.55],
  [5.7, 2.85],
  [6.4, 3.1],
  [7.5, 3.3],
  [9, 3.6],
];

/** One bank of a river channel: the line moved `d` hours to its left (d > 0) or right, resampled finely. */
function bank(line: Pt[], d: number): Pt[] {
  const out: Pt[] = [];
  for (let i = 0; i < line.length - 1; i++) {
    const [ax, ay] = line[i]!;
    const [bx, by] = line[i + 1]!;
    const len = Math.hypot(bx - ax, by - ay);
    const steps = Math.max(1, Math.ceil(len / 0.1));
    for (let s = 0; s < steps; s++) {
      const t = s / steps;
      // Average the neighbouring segments' normals at each vertex so the banks don't kink.
      const prev = line[Math.max(0, i - 1)]!;
      const [tx, ty] = s === 0 ? [bx - prev[0], by - prev[1]] : [bx - ax, by - ay];
      const tl = Math.hypot(tx, ty);
      out.push([ax + (bx - ax) * t - (ty / tl) * d, ay + (by - ay) * t + (tx / tl) * d]);
    }
  }
  const [ax, ay] = line[line.length - 2]!;
  const [bx, by] = line[line.length - 1]!;
  const l = Math.hypot(bx - ax, by - ay);
  out.push([bx - ((by - ay) / l) * d, by + ((bx - ax) / l) * d]);
  return out;
}

const HALF_WIDTH = 0.065; // the Missouri drawn about 0.4 mi wide, a little wider than life

export const breachDayMap: MapArt = {
  id: 'breach-day',
  px: 85,
  bounds: { minX: -13, maxX: 6, minY: -6.5, maxY: 6 },

  land: [
    // North of the Missouri: Platte and Clay counties (the Northland).
    [...bank(MISSOURI, HALF_WIDTH), [40, 3.6], [40, 40], [-5.2, 40]],
    // South of the Missouri: Kansas, Jackson County, Johnson County, and on west past Lawrence.
    [...bank(MISSOURI, -HALF_WIDTH), [40, 3.5], [40, -40], [-40, -40], [-40, 40], [-5.3, 40]],
  ],

  realms: [
    // Kansas south of the river, west of State Line Road (tinted lightly as a whole).
    {
      name: 'Kansas',
      color: '#d6a756',
      area: [[-0.4, -40], [-0.4, 0.9], [-0.46, 1.3], [-0.6, 1.9], [-0.8, 2.55], [-1.7, 3.05], [-3.6, 3.4], [-5.6, 5.4], [-5.8, 40], [-40, 40], [-40, -40]],
    },
    // The Northland, north of the river.
    {
      name: 'The Northland',
      color: '#6f8fb0',
      area: [[-5.6, 5.4], [-3.6, 3.4], [-1.7, 3.0], [-0.6, 2.1], [-0.48, 1.48], [-0.08, 1.26], [0.62, 1.66], [1.92, 2.08], [3.1, 1.72], [5.1, 2.55], [5.7, 2.85], [6.4, 3.1], [7.5, 3.3], [9, 3.6], [40, 3.6], [40, 40], [-5.6, 40]],
    },
    // Downtown Kansas City, Missouri: River Market and the loop down through the Crossroads to Union Station.
    {
      name: 'Downtown',
      color: '#ecc57a',
      area: [[-0.2, 0.58], [0.1, 0.55], [0.36, 0.62], [0.42, 0.95], [0.36, 1.3], [0.12, 1.33], [-0.1, 1.27], [-0.17, 1.02]],
      outline: true,
    },
    // Downtown Kansas City, Kansas, Strawberry Hill and the Fairfax bottoms.
    {
      name: 'Kansas City, Kansas',
      color: '#a9a3c9',
      area: [[-2.2, 0.75], [-1.5, 0.66], [-0.62, 0.75], [-0.5, 1.35], [-0.6, 1.95], [-0.8, 2.5], [-1.5, 2.3], [-2.3, 1.6]],
    },
    // Independence, around its old Square.
    {
      name: 'Independence',
      color: '#9a5f8f',
      area: [[2.2, 0.0], [3.0, -0.3], [4.1, -0.1], [4.0, 1.3], [3.3, 1.65], [2.4, 1.45], [2.1, 0.8]],
    },
    // Johnson County's suburbs: Overland Park, Leawood, Lenexa, Olathe.
    {
      name: 'Johnson County',
      color: '#c98e4a',
      area: [[-0.4, -0.3], [-1.6, -0.2], [-3.2, -0.5], [-4.2, -1.2], [-5.2, -3.4], [-5.4, -40], [-0.4, -40]],
    },
    // Lawrence and the KU campus on Mount Oread.
    {
      name: 'Lawrence',
      color: '#9db4c0',
      area: [[-12.4, -1.5], [-11.2, -1.45], [-10.9, -1.9], [-11.0, -2.7], [-12.3, -2.75], [-12.6, -2.1]],
      outline: true,
    },
  ],

  borders: [
    // The Kansas-Missouri line down State Line Road, from the Kaw's mouth south out of the map.
    [[-0.45, 1.3], [-0.4, 0.95], [-0.4, -3], [-0.4, -8]],
  ],

  rivers: [
    // The Kansas (Kaw): from past Lawrence down through De Soto and Bonner Springs, Argentine and
    // Armourdale, then north to the Missouri at Kaw Point.
    [[-14.5, -1.0], [-13.15, -1.33], [-12.3, -1.55], [-11.63, -1.6], [-10.9, -1.75], [-10.11, -2.02], [-9.22, -2.36], [-8.4, -2.25], [-7.79, -2.1], [-6.89, -1.68], [-6.0, -0.87], [-5.28, 0.02], [-4.6, 0.3], [-3.85, 0.28], [-3.2, 0.12], [-2.6, 0.05], [-2.06, 0.28], [-1.52, 0.62], [-1.2, 0.52], [-0.98, 0.5], [-0.7, 0.68], [-0.55, 0.92], [-0.5, 1.15], [-0.48, 1.42]],
    // The Wakarusa, past Lawrence's south side to the Kaw at Eudora.
    [[-14.5, -3.3], [-13.4, -3.15], [-12.3, -3.05], [-11.0, -2.95], [-10.0, -2.75], [-9.25, -2.4]],
    // The Blue River: up from the south through Swope Park and the east side to the Missouri.
    [[-0.5, -7], [-0.2, -5], [0.27, -3.4], [0.5, -2.3], [1.0, -1.6], [1.25, -1.15], [1.34, -0.45], [1.5, 0.45], [1.36, 1.15], [1.45, 1.75]],
    // Brush Creek, through the Plaza to the Blue.
    [[-2.2, -0.75], [-1.2, -0.55], [-0.6, -0.42], [-0.13, -0.38], [0.4, -0.45], [0.85, -0.7], [1.2, -1.05]],
    // The Little Blue, up from Lee's Summit past Independence's east side.
    [[3.6, -6.5], [4.0, -4.6], [4.25, -3.0], [4.1, -1.8], [4.4, -0.4], [4.55, 0.9], [4.75, 2.05]],
    // Line Creek, down through the Northland to the river at Riverside.
    [[-0.3, 6.5], [-0.4, 5.0], [-0.55, 3.8], [-0.72, 2.75]],
  ],

  ranges: [],
  peaks: [],

  hills: [
    // Bluffs along the Northland's side of the river, Parkville to Riverside.
    [[-3.0, 3.35], [-1.9, 3.2], [-1.1, 3.05], [-0.95, 3.4], [-1.9, 3.55], [-3.0, 3.7]],
    // The north bluffs above the East Bottoms, where the Bluffside Underground runs under the limestone.
    [[1.4, 2.2], [2.9, 2.0], [3.2, 2.45], [1.6, 2.6]],
    // Cliff Drive and Kessler Park, the bluffs east of downtown.
    [[0.45, 1.22], [1.2, 1.5], [1.25, 1.7], [0.45, 1.45]],
    // Strawberry Hill and the KCK bluffs above the Kaw.
    [[-1.3, 1.0], [-0.75, 1.0], [-0.7, 1.5], [-1.25, 1.45]],
    // The Kaw valley's bluffs by Bonner Springs and Edwardsville.
    [[-5.6, 0.55], [-3.7, 0.65], [-3.7, 1.05], [-5.6, 1.0]],
    [[-6.6, -2.1], [-5.6, -1.2], [-5.2, -1.4], [-6.3, -2.4]],
    // Mount Oread, the University of Kansas's hill in Lawrence.
    [[-12.2, -2.05], [-11.85, -2.0], [-11.8, -2.35], [-12.2, -2.4]],
  ],

  forests: [
    // Swope Park: woods, the zoo, golf courses, and Lake of the Woods.
    { kind: 'broadleaf', area: [[0.72, -0.8], [1.6, -0.75], [1.9, -1.15], [1.85, -1.7], [1.2, -1.7], [0.75, -1.35]] },
    // Wyandotte County Lake Park.
    { kind: 'broadleaf', area: [[-4.1, 2.0], [-3.3, 2.0], [-3.25, 2.6], [-4.0, 2.65]] },
    // Shawnee Mission Park.
    { kind: 'broadleaf', area: [[-3.9, -1.0], [-3.1, -1.0], [-3.1, -1.6], [-3.9, -1.6]] },
    // Fleming Park, around Lake Jacomo and Longview Lake.
    { kind: 'broadleaf', area: [[3.9, -1.8], [5.2, -1.9], [5.3, -3.0], [4.2, -3.4], [3.6, -2.8]] },
    // Penn Valley Park, below Union Station and the Liberty Memorial.
    { kind: 'broadleaf', area: [[-0.08, 0.38], [0.14, 0.38], [0.14, 0.53], [-0.08, 0.53]] },
    // Weston Bend, on the bluffs below Leavenworth.
    { kind: 'broadleaf', area: [[-5.3, 5.9], [-4.5, 5.5], [-4.3, 6.2], [-5.1, 6.4]] },
    // Clinton State Park, by Clinton Lake west of Lawrence.
    { kind: 'broadleaf', area: [[-13.4, -2.4], [-12.8, -2.4], [-12.8, -2.9], [-13.4, -2.9]] },
  ],

  marshes: [
    // Missouri bottomland east of Liberty.
    [[4.6, 2.5], [5.8, 3.05], [5.6, 3.5], [4.5, 3.0]],
    // The Kaw's floodplain below Eudora and De Soto.
    [[-8.9, -2.7], [-7.4, -2.5], [-7.5, -2.9], [-8.8, -3.1]],
  ],

  labels: [
    { text: 'KANSAS', at: [-7.6, -4.9], kind: 'realm' },
    { text: 'MISSOURI', at: [3.0, -5.4], kind: 'realm' },
    { text: 'Missouri River', at: [-3.35, 3.05], kind: 'water', rotate: 16 },
    { text: 'Missouri River', at: [3.55, 1.87], kind: 'water', rotate: -4 },
    { text: 'Kansas River', at: [-3.6, 0.0], kind: 'water', rotate: 4 },
    { text: 'Kansas River', at: [-9.6, -1.95], kind: 'water', rotate: 17 },
    { text: 'Wakarusa River', at: [-11.2, -3.15], kind: 'water', rotate: 3 },
    { text: 'Blue River', at: [1.6, -0.1], kind: 'water', rotate: -82 },
    { text: 'Little Blue', at: [4.65, 0.2], kind: 'water', rotate: -82 },
    { text: 'Brush Creek', at: [-1.35, -0.46], kind: 'water', rotate: -8 },
    { text: 'the Northeast', at: [1.55, 1.3], kind: 'feature' },
    { text: 'Westport', at: [-0.58, -0.1], kind: 'feature' },
    { text: 'the Plaza', at: [-0.08, -0.6], kind: 'feature' },
    { text: 'Brookside', at: [-0.12, -1.1], kind: 'feature' },
    { text: 'Waldo', at: [-0.1, -1.75], kind: 'feature' },
    { text: 'Kansas City Zoo', at: [1.25, -1.48], kind: 'feature' },
    { text: 'North Kansas City', at: [0.55, 1.98], kind: 'feature' },
    { text: 'Kansas City, Kansas', at: [-1.6, 1.98], kind: 'feature' },
    { text: 'Armourdale', at: [-1.05, 0.2], kind: 'feature' },
    { text: 'Argentine', at: [-1.95, 0.45], kind: 'feature' },
    { text: 'Overland Park', at: [-1.45, -1.75], kind: 'feature' },
    { text: 'Mission', at: [-1.25, -0.95], kind: 'feature' },
    { text: 'Shawnee', at: [-2.5, -0.65], kind: 'feature' },
    { text: 'Shawnee Mission Park', at: [-3.5, -1.85], kind: 'feature' },
    { text: 'Lenexa', at: [-2.8, -2.25], kind: 'feature' },
    { text: 'Olathe', at: [-4.2, -4.1], kind: 'feature' },
    { text: 'Leawood', at: [-0.95, -3.4], kind: 'feature' },
    { text: 'JOHNSON COUNTY', at: [-2.6, -4.6], kind: 'feature' },
    { text: 'Grandview', at: [0.9, -4.0], kind: 'feature' },
    { text: 'Raytown', at: [2.3, -1.05], kind: 'feature' },
    { text: 'Independence', at: [3.15, 0.55], kind: 'feature' },
    { text: "Lee's Summit", at: [3.4, -3.75], kind: 'feature' },
    { text: 'Fleming Park', at: [4.6, -3.6], kind: 'feature' },
    { text: 'Blue Springs', at: [5.3, -0.95], kind: 'feature' },
    { text: 'THE NORTHLAND', at: [1.6, 4.9], kind: 'feature' },
    { text: 'Gladstone', at: [0.6, 3.3], kind: 'feature' },
    { text: 'Liberty', at: [3.0, 4.3], kind: 'feature' },
    { text: 'Parkville', at: [-1.75, 2.75], kind: 'feature' },
    { text: 'Riverside', at: [-0.2, 2.6], kind: 'feature' },
    { text: 'Kansas City International', at: [-2.3, 5.5], kind: 'feature' },
    { text: 'Leavenworth', at: [-6.5, 5.5], kind: 'feature' },
    { text: 'Wyandotte County Lake', at: [-3.7, 1.75], kind: 'feature' },
    { text: 'Edwardsville', at: [-4.4, 0.45], kind: 'feature' },
    { text: 'Bonner Springs', at: [-5.2, -0.3], kind: 'feature' },
    { text: 'De Soto', at: [-6.95, -1.35], kind: 'feature' },
    { text: 'Eudora', at: [-9.2, -2.75], kind: 'feature' },
    { text: 'University of Kansas', at: [-11.95, -2.55], kind: 'feature' },
    { text: 'Clinton Lake', at: [-12.4, -3.4], kind: 'feature' },
    { text: 'the Kaw valley', at: [-8.6, -0.6], kind: 'feature' },
    { text: 'I-70 to Topeka', at: [-12.2, -0.75], kind: 'feature' },
  ],
};
