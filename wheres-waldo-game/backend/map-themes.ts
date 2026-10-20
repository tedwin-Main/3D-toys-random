// Map themes. Each theme is a Malaysian setting: it decides the ground, the
// street layout, which props exist, and what the crowd wears. Everything here
// is pure data so the server and every client agree on the scene from the seed
// alone -- the theme id is the only extra thing that crosses the wire.

export type ThemeId = 'kl' | 'kampung' | 'pasarmalam';

export const THEME_IDS: readonly ThemeId[] = ['kl', 'kampung', 'pasarmalam'];

/** Prop kinds across all themes. Each one has a draw case in components/draw-sprites.ts. */
export type PropKind =
  // big structures
  | 'shoplot' | 'tower' | 'stiltHouse' | 'nightStall'
  // nature
  | 'palm' | 'banana' | 'paddy'
  // street furniture and market gear
  | 'stall' | 'satay' | 'durian' | 'stools' | 'crate' | 'fruitcart'
  | 'bench' | 'cone' | 'bin' | 'lamppost' | 'sign' | 'potted' | 'stringlights'
  // vehicles
  | 'motorbike' | 'bicycle' | 'sampan'
  // kampung life
  | 'well' | 'chicken' | 'laundry' | 'cat';

export interface PropSpec {
  kind: PropKind;
  w: number;
  h: number;
  tints: readonly string[];
}

/**
 * How a theme arranges itself. Props used to be dropped in random clusters,
 * which looked like spilled furniture -- now everything hangs off a street
 * grid: terraces line the streets shoulder to shoulder, kerb props repeat at
 * intervals along the frontage, and the blocks behind get filled in.
 */
export interface Layout {
  /** What the streets are: tarmac, a dirt lane, or a market aisle. */
  roadKind: 'road' | 'path' | 'aisle';
  roadW: number;
  /** Number of streets each way. */
  cols: number;
  rows: number;
  /** A river band across the map (kampung). */
  water: boolean;
  /** Big buildings, placed in an unbroken run facing the street. */
  terrace: readonly PropKind[];
  /** Repeated along the kerb at regular spacing -- trees, lamps, signage. */
  kerb: readonly PropKind[];
  /** Scattered inside the blocks behind the frontage. */
  filler: readonly PropKind[];
  /** Small life, dropped anywhere including on the street itself. */
  tiny: readonly PropKind[];
  /** Fills a whole block edge to edge (paddy fields). */
  field?: PropKind;
}

export interface Theme {
  id: ThemeId;
  name: string;
  blurb: string;
  /** true switches the renderer to a night wash + warm light pools under lamps. */
  night: boolean;
  ground: {
    base: string;
    patch: string;
    line: string;
    style: 'paving' | 'field' | 'wet';
  };
  /** Street surface colours, drawn under the props. */
  road: { fill: string; edge: string };
  /** Clothing palettes, so a KL office crowd doesn't wear kampung sarongs. */
  torso: readonly string[];
  legs: readonly string[];
  hatColors: readonly string[];
  hats: readonly string[];
  layout: Layout;
  props: readonly PropSpec[];
}

const PALM_TINTS = ['#2f6b3a', '#387a42', '#27592f'] as const;
const CAT_TINTS = ['#d8a24a', '#4a4440', '#e0d6c2'] as const;

export const THEMES: Record<ThemeId, Theme> = {
  // --------------------------------------------------------------- Kuala Lumpur
  kl: {
    id: 'kl',
    name: 'KL Sentral Rush',
    blurb: 'Midday in the city: shoplot terraces, towers and a crowd that is late for something.',
    night: false,
    ground: { base: '#cfc9bd', patch: '#bdb6a8', line: '#8d8578', style: 'paving' },
    road: { fill: '#6f6b66', edge: '#d8d3c8' },
    torso: ['#2f6f9f', '#3b4a63', '#8f5ea8', '#c9a227', '#444c56', '#1f8a8a', '#a8552f', '#6e7b8b', '#2a7f62', '#b0485f'],
    legs: ['#2a3550', '#3a3a3a', '#4a4256', '#1f3b2c', '#30506b', '#5b5248'],
    hatColors: ['#2f6f9f', '#3c8f5a', '#c9a227', '#444c56', '#8f5ea8', '#e07a3c'],
    hats: ['none', 'none', 'cap', 'tudung', 'tudung', 'helmet', 'songkok', 'sunhat'],
    layout: {
      roadKind: 'road', roadW: 98, cols: 3, rows: 2, water: false,
      terrace: ['shoplot', 'shoplot', 'shoplot', 'tower'],
      kerb: ['palm', 'lamppost', 'sign', 'bench', 'stall'],
      filler: ['stall', 'bench', 'potted', 'palm'],
      tiny: ['cone', 'motorbike', 'bicycle', 'bin', 'cat', 'potted']
    },
    props: [
      { kind: 'shoplot', w: 150, h: 118, tints: ['#d8a24a', '#9fc0b4', '#cf7f6a', '#b9a7cf', '#e3d4a8', '#8fb0c4'] },
      { kind: 'tower', w: 118, h: 180, tints: ['#8fa8b8', '#7d93a8', '#a3b4bd'] },
      { kind: 'palm', w: 70, h: 110, tints: PALM_TINTS },
      { kind: 'stall', w: 104, h: 76, tints: ['#c9452f', '#3f7a6a', '#8a5a3b', '#4a6b7f'] },
      { kind: 'bench', w: 86, h: 28, tints: ['#6b5436', '#5a4a3a'] },
      { kind: 'cone', w: 24, h: 32, tints: ['#e2622b'] },
      { kind: 'bin', w: 28, h: 38, tints: ['#3f6b4a', '#4a5560'] },
      { kind: 'lamppost', w: 26, h: 104, tints: ['#56606b'] },
      { kind: 'sign', w: 34, h: 86, tints: ['#2f6f9f', '#c9452f', '#3c8f5a'] },
      { kind: 'potted', w: 30, h: 42, tints: ['#3c8f5a', '#4a8f3c', '#2f7a52'] },
      { kind: 'motorbike', w: 54, h: 30, tints: ['#b0353c', '#2f4a8f', '#444c56'] },
      { kind: 'bicycle', w: 52, h: 28, tints: ['#2f8f8a', '#8f5ea8', '#555b63'] },
      { kind: 'cat', w: 26, h: 18, tints: CAT_TINTS }
    ]
  },

  // -------------------------------------------------------------------- Kampung
  kampung: {
    id: 'kampung',
    name: 'Kampung Sungai Damai',
    blurb: 'Stilt houses down a dirt lane, paddy blocks, a river with sampan tied up.',
    night: false,
    ground: { base: '#9db86a', patch: '#8aa75c', line: '#7a6a44', style: 'field' },
    road: { fill: '#b09a6a', edge: '#8a7a4a' },
    torso: ['#1f8a6a', '#c96a2f', '#7a3f6b', '#d8a93c', '#2f6f9f', '#a83f3f', '#4a7a3c', '#8a6a3c', '#3f5f8a', '#b06a8a'],
    legs: ['#6b5436', '#4a5a3c', '#7a4a3a', '#3a4a5a', '#5c4450', '#2f3f2f'],
    hatColors: ['#d8c48a', '#3c8f5a', '#c9a227', '#a8552f', '#8f5ea8', '#2f6f9f'],
    hats: ['none', 'tudung', 'tudung', 'tudung', 'songkok', 'sunhat', 'sunhat', 'cap'],
    layout: {
      roadKind: 'path', roadW: 64, cols: 2, rows: 2, water: true,
      terrace: ['stiltHouse'],
      kerb: ['palm', 'banana', 'well', 'laundry'],
      filler: ['banana', 'palm', 'potted', 'bench'],
      tiny: ['chicken', 'chicken', 'cat', 'bicycle', 'potted'],
      field: 'paddy'
    },
    props: [
      { kind: 'stiltHouse', w: 150, h: 124, tints: ['#c9b48a', '#a8906a', '#d8c9a8', '#b4a07a'] },
      { kind: 'palm', w: 76, h: 125, tints: PALM_TINTS },
      { kind: 'banana', w: 70, h: 95, tints: ['#4a8f3c', '#3c7a32'] },
      { kind: 'paddy', w: 170, h: 104, tints: ['#bcd06a', '#aec45e'] },
      { kind: 'sampan', w: 104, h: 40, tints: ['#8a5a3b', '#6b4a30'] },
      { kind: 'well', w: 52, h: 46, tints: ['#9a9188', '#857d74'] },
      { kind: 'laundry', w: 110, h: 54, tints: ['#d8d2c4'] },
      { kind: 'chicken', w: 22, h: 20, tints: ['#e3d4a8', '#b0704a', '#444038'] },
      { kind: 'potted', w: 30, h: 42, tints: ['#3c8f5a', '#4a8f3c', '#c96a2f'] },
      { kind: 'bench', w: 86, h: 28, tints: ['#6b5436', '#5a4a3a'] },
      { kind: 'bicycle', w: 52, h: 28, tints: ['#2f8f8a', '#8f5ea8', '#555b63'] },
      { kind: 'cat', w: 26, h: 18, tints: CAT_TINTS }
    ]
  },

  // ---------------------------------------------------------------- Pasar malam
  pasarmalam: {
    id: 'pasarmalam',
    name: 'Pasar Malam Nightside',
    blurb: 'Stall rows facing each other down a wet aisle. Tarpaulins, satay smoke, bulbs on a wire.',
    night: true,
    ground: { base: '#3a3a42', patch: '#32323a', line: '#55555f', style: 'wet' },
    road: { fill: '#2e2e36', edge: '#4a4a55' },
    torso: ['#e2622b', '#2f9f8f', '#d84a6a', '#f0c23c', '#5f6fbf', '#8f4fa8', '#3f8f4a', '#c9452f', '#4a9fd8', '#e08a3c'],
    legs: ['#2a2f40', '#3a3a3a', '#4a3f56', '#1f3b2c', '#30506b', '#50413a'],
    hatColors: ['#e2622b', '#2f9f8f', '#f0c23c', '#5f6fbf', '#d84a6a', '#444c56'],
    hats: ['none', 'none', 'cap', 'tudung', 'tudung', 'songkok', 'beanie', 'sunhat'],
    layout: {
      roadKind: 'aisle', roadW: 150, cols: 2, rows: 2, water: false,
      terrace: ['nightStall'],
      kerb: ['satay', 'durian', 'fruitcart', 'satay'],
      filler: ['stools', 'crate', 'palm', 'stools'],
      tiny: ['bin', 'cat', 'motorbike', 'crate', 'stringlights']
    },
    props: [
      { kind: 'nightStall', w: 136, h: 100, tints: ['#2f5f8f', '#8f2f3f', '#2f6b4a', '#7a5a2f', '#5f3f7a'] },
      { kind: 'satay', w: 92, h: 66, tints: ['#6b4a30', '#7a5436'] },
      { kind: 'durian', w: 78, h: 52, tints: ['#7a8f3c', '#6b7f32'] },
      { kind: 'fruitcart', w: 96, h: 62, tints: ['#8a5a3b', '#6b5436'] },
      { kind: 'stools', w: 78, h: 46, tints: ['#d8453c', '#2f6f9f', '#3c8f5a'] },
      { kind: 'crate', w: 42, h: 36, tints: ['#9c7a4a', '#8a6b3f'] },
      { kind: 'palm', w: 70, h: 110, tints: ['#1f4a2a', '#26542f'] },
      { kind: 'bin', w: 28, h: 38, tints: ['#3f6b4a', '#4a5560'] },
      { kind: 'lamppost', w: 26, h: 104, tints: ['#56606b'] },
      { kind: 'stringlights', w: 150, h: 30, tints: ['#f0c23c'] },
      { kind: 'motorbike', w: 54, h: 30, tints: ['#b0353c', '#2f4a8f', '#444c56'] },
      { kind: 'cat', w: 26, h: 18, tints: CAT_TINTS }
    ]
  }
};

export function getTheme(id: ThemeId): Theme {
  return THEMES[id] ?? THEMES.kl;
}

/** Size + tints for one prop kind inside a theme. */
export function specFor(theme: Theme, kind: PropKind): PropSpec {
  return theme.props.find((p) => p.kind === kind) ?? theme.props[0];
}
