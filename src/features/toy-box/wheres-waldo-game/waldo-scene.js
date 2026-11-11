// Builds Waldo Hunt crowd scenes from a seed (themes, map layout, people, decoys, the Waldo stamp) with no drawing, so every tab and the relay server see the same crowd.

// Core > seeded-random: seeded PRNG (mulberry32), same crowd on every client
export function makeRng(seed) {
  let a = seed >>> 0;
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function randInt(rng, n) {
  return Math.floor(rng() * n);
}
export function pick (rng, items) {
  return items[randInt(rng, items.length)];
}
export function randRange(rng, min, max) {
  return min + rng() * (max - min);
}
export function shuffle (rng, items) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = randInt(rng, i + 1);
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

// Core > scene-geometry: world + view sizes, hit radius, camera clamp
export const WORLD_W = 2200;
export const WORLD_H = 1500;
export const VIEW_W = 1200;
export const VIEW_H = 760;
export const SPRITE_W = 32;
export const SPRITE_H = 66;
export const HIT_RADIUS = 26;
export function clampCamera(x, y) {
  return {
    x: Math.max(0, Math.min(WORLD_W - VIEW_W, x)),
    y: Math.max(0, Math.min(WORLD_H - VIEW_H, y))
  };
}

// Core > color-palette: skin/hair/outfit palettes, per-round Waldo looks
export const SKIN = ['#f0c8a0', '#d8a271', '#a9714b', '#7a4b2a', '#5a3620', '#f7dbbd'];
export const HAIR = ['#2b1d16', '#6b3f22', '#c08a3e', '#e0d6c2', '#8d8d8d', '#1a1a1a'];
export const TORSO = [
  '#2f6f9f', '#3c8f5a', '#8f5ea8', '#c9a227', '#444c56',
  '#1f8a8a', '#a8552f', '#6e7b8b', '#275a3a', '#b0485f'
];
export const LEGS = ['#2a3550', '#4a4a4a', '#6b5436', '#1f3b2c', '#5c3550', '#30506b'];
export const HATS = ['none', 'cap', 'beanie', 'bobble', 'sunhat', 'helmet', 'tudung', 'songkok'];
export const ACCESSORIES = ['none', 'glasses', 'bag', 'balloon', 'cane', 'scarf'];
export const INK = '#2a211a';
export const WALDO_LOOKS = [
  { name: 'Red & white', stripeA: '#d6263c', stripeB: '#f7f3ea', hat: 'bobble', hatA: '#d6263c', hatB: '#f7f3ea', accessory: 'glasses' },
  { name: 'Blue & white', stripeA: '#1f5fa8', stripeB: '#f2f2ea', hat: 'bobble', hatA: '#1f5fa8', hatB: '#f2f2ea', accessory: 'glasses' },
  { name: 'Green & cream', stripeA: '#1f7a4a', stripeB: '#f0e8cf', hat: 'beanie', hatA: '#1f7a4a', hatB: '#f0e8cf', accessory: 'scarf' },
  { name: 'Yellow & black', stripeA: '#e8b526', stripeB: '#2b2b2b', hat: 'cap', hatA: '#e8b526', hatB: '#2b2b2b', accessory: 'bag' },
  { name: 'Purple & white', stripeA: '#7a3f9f', stripeB: '#f4f0e6', hat: 'bobble', hatA: '#7a3f9f', hatB: '#f4f0e6', accessory: 'glasses' },
  { name: 'Orange & navy', stripeA: '#e0631f', stripeB: '#1e2c48', hat: 'sunhat', hatA: '#e0631f', hatB: '#1e2c48', accessory: 'cane' },
  { name: 'Teal & cream', stripeA: '#17827d', stripeB: '#f2ead6', hat: 'bobble', hatA: '#17827d', hatB: '#f2ead6', accessory: 'bag' },
  { name: 'Pink & grey', stripeA: '#cf3f74', stripeB: '#dcd8cf', hat: 'beanie', hatA: '#cf3f74', hatB: '#dcd8cf', accessory: 'glasses' }
];
export function waldoLookFor(seed) {
  const i = Math.abs(Math.floor(seed)) % WALDO_LOOKS.length;
  return WALDO_LOOKS[i];
}
export const WALDO = {
  ...WALDO_LOOKS[0],
  skin: '#f0c8a0',
  hair: '#6b3f22',
  legs: '#2a3550'
};
export const HAT_COLORS = ['#2f6f9f', '#3c8f5a', '#c9a227', '#444c56', '#8f5ea8', '#a8552f'];

// Core > map-themes: KL / kampung / pasar malam maps
export const THEME_IDS = ['kl', 'kampung', 'pasarmalam'];
export const PALM_TINTS = ['#2f6b3a', '#387a42', '#27592f'];
export const CAT_TINTS = ['#d8a24a', '#4a4440', '#e0d6c2'];
export const THEMES = {
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
export function getTheme(id) {
  return THEMES[id] ?? THEMES.kl;
}
export function specFor(theme, kind) {
  return theme.props.find((p) => p.kind === kind) ?? theme.props[0];
}

// Core > crowd-scene: seeded crowd, roads, props, decoys, Waldo stamp
export function layoutMap(rng, theme) {
  const L = theme.layout;
  const roads = [];
  const props = [];
  const vxs = [];
  for (let i = 0; i < L.cols; i++) {
    const slot = WORLD_W / (L.cols + 1);
    vxs.push(slot * (i + 1) + randRange(rng, -slot * 0.16, slot * 0.16));
  }
  const hys = [];
  for (let i = 0; i < L.rows; i++) {
    const slot = WORLD_H / (L.rows + 1);
    hys.push(slot * (i + 1) + randRange(rng, -slot * 0.14, slot * 0.14));
  }
  for (const x of vxs) roads.push({ x: x - L.roadW / 2, y: 0, w: L.roadW, h: WORLD_H, kind: L.roadKind });
  for (const y of hys) roads.push({ x: 0, y: y - L.roadW / 2, w: WORLD_W, h: L.roadW, kind: L.roadKind });
  let waterY = -1;
  if (L.water) {
    waterY = randRange(rng, WORLD_H * 0.6, WORLD_H * 0.82);
    roads.push({ x: 0, y: waterY, w: WORLD_W, h: 118, kind: 'water' });
    for (let x = 120; x < WORLD_W - 120; x += randRange(rng, 280, 460)) {
      const spec = specFor(theme, 'sampan');
      if (spec.kind !== 'sampan') break;
      props.push({ kind: 'sampan', x, y: waterY + randRange(rng, 8, 60), w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
    }
  }
  const onRoad = (x, y, w, h, pad = 0) =>
    roads.some((r) => x + w > r.x - pad && x < r.x + r.w + pad && y + h > r.y - pad && y < r.y + r.h + pad);
  for (const y of hys) {
    for (const side of [-1, 1]) {
      let x = randRange(rng, 20, 140);
      while (x < WORLD_W - 140) {
        const kind = pick(rng, L.terrace);
        const spec = specFor(theme, kind);
        const py = side < 0 ? y - L.roadW / 2 - spec.h - randRange(rng, 6, 18) : y + L.roadW / 2 + randRange(rng, 6, 18);
        const blocked = vxs.some((vx) => x + spec.w > vx - L.roadW && x < vx + L.roadW);
        if (!blocked && py > 10 && py + spec.h < WORLD_H - 10 && !(L.water && py + spec.h > waterY && waterY > 0)) {
          props.push({ kind, x, y: py, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
          x += spec.w + randRange(rng, 4, 26); // small party-wall gaps, not a solid slab
        } else {
          x += 60;
        }
      }
    }
  }
  for (const x of vxs) {
    for (const side of [-1, 1]) {
      let y = randRange(rng, 30, 160);
      while (y < WORLD_H - 150) {
        const kind = pick(rng, L.terrace);
        const spec = specFor(theme, kind);
        const px = side < 0 ? x - L.roadW / 2 - spec.w - randRange(rng, 6, 18) : x + L.roadW / 2 + randRange(rng, 6, 18);
        const blocked = hys.some((hy) => y + spec.h > hy - L.roadW && y < hy + L.roadW);
        if (!blocked && px > 10 && px + spec.w < WORLD_W - 10 && !(L.water && waterY > 0 && y + spec.h > waterY)) {
          props.push({ kind, x: px, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
          y += spec.h + randRange(rng, 10, 40);
        } else {
          y += 70;
        }
      }
    }
  }
  const built = props.filter((pr) => (L.terrace).includes(pr.kind));
  const onBuilding = (x, y, w, h) =>
    built.some((b) => x + w > b.x && x < b.x + b.w && y + h > b.y && y < b.y + b.h);
  for (const y of hys) {
    for (const side of [-1, 1]) {
      for (let x = randRange(rng, 60, 200); x < WORLD_W - 80; x += randRange(rng, 150, 240)) {
        const kind = pick(rng, L.kerb);
        const spec = specFor(theme, kind);
        const py = side < 0 ? y - L.roadW / 2 - spec.h - 2 : y + L.roadW / 2 + 2;
        if (py < 8 || py + spec.h > WORLD_H - 8) continue;
        if (L.water && waterY > 0 && py + spec.h > waterY) continue;
        if (onBuilding(x, py, spec.w, spec.h)) continue;
        props.push({ kind, x, y: py, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
      }
    }
  }
  for (const x of vxs) {
    for (const side of [-1, 1]) {
      for (let y = randRange(rng, 80, 220); y < WORLD_H - 90; y += randRange(rng, 170, 260)) {
        const kind = pick(rng, L.kerb);
        const spec = specFor(theme, kind);
        const px = side < 0 ? x - L.roadW / 2 - spec.w - 2 : x + L.roadW / 2 + 2;
        if (px < 8 || px + spec.w > WORLD_W - 8) continue;
        if (L.water && waterY > 0 && y + spec.h > waterY && y < waterY + 118) continue;
        if (onBuilding(px, y, spec.w, spec.h)) continue;
        props.push({ kind, x: px, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
      }
    }
  }
  if (L.field) {
    const spec = specFor(theme, L.field);
    for (let i = 0; i < 7; i++) {
      const bx = randRange(rng, 40, WORLD_W - spec.w * 2 - 40);
      const by = randRange(rng, 40, WORLD_H - spec.h * 2 - 40);
      for (let r = 0; r < 2; r++) {
        for (let c = 0; c < 2; c++) {
          const x = bx + c * (spec.w + 10);
          const y = by + r * (spec.h + 10);
          if (onRoad(x, y, spec.w, spec.h, 10)) continue;
          if (onBuilding(x, y, spec.w, spec.h)) continue;
          if (L.water && waterY > 0 && y + spec.h > waterY) continue;
          props.push({ kind: L.field, x, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
        }
      }
    }
  }
  for (let i = 0; i < 46; i++) {
    const kind = pick(rng, L.filler);
    const spec = specFor(theme, kind);
    const x = randRange(rng, 20, WORLD_W - spec.w - 20);
    const y = randRange(rng, 20, WORLD_H - spec.h - 20);
    if (onRoad(x, y, spec.w, spec.h, 14)) continue;
    if (onBuilding(x, y, spec.w, spec.h)) continue;
    props.push({ kind, x, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
  }
  for (let i = 0; i < 58; i++) {
    const kind = pick(rng, L.tiny);
    const spec = specFor(theme, kind);
    const x = randRange(rng, 16, WORLD_W - spec.w - 16);
    const y = randRange(rng, 16, WORLD_H - spec.h - 16);
    if (L.water && waterY > 0 && y + spec.h > waterY && y < waterY + 118) continue;
    if (onBuilding(x, y, spec.w, spec.h)) continue;
    props.push({ kind, x, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
  }
  props.sort((a, b) => a.y + a.h - (b.y + b.h));
  return { roads, props };
}
export function plainPerson(rng, x, y, themeId) {
  const theme = getTheme(themeId);
  const hat = pick(rng, theme.hats);
  const torso = pick(rng, theme.torso);
  return {
    x,
    y,
    skin: pick(rng, SKIN),
    hair: pick(rng, HAIR),
    torsoA: torso,
    torsoB: rng() < 0.35 ? pick(rng, theme.torso) : torso,
    legs: pick(rng, theme.legs),
    hat,
    hatA: pick(rng, theme.hatColors),
    hatB: pick(rng, theme.hatColors),
    accessory: pick(rng, ACCESSORIES),
    flip: rng() < 0.5,
    isTarget: false
  };
}
export function makeTargetLook(p, look = WALDO) {
  return {
    ...p,
    torsoA: look.stripeA,
    torsoB: look.stripeB,
    hat: look.hat,
    hatA: look.hatA,
    hatB: look.hatB,
    accessory: look.accessory,
    skin: WALDO.skin,
    hair: WALDO.hair,
    legs: WALDO.legs,
    flip: false,
    isTarget: true,
    decoy: undefined
  };
}
export function applyDecoy(rng, p, themeId, look) {
  const theme = getTheme(themeId);
  const nonTargetAccs = ACCESSORIES.filter((a) => a !== look.accessory);
  if (rng() < 0.5) {
    return {
      ...p,
      torsoA: look.stripeA,
      torsoB: look.stripeB,
      hat: pick(rng, HATS.filter((h) => h !== look.hat)),
      hatA: pick(rng, theme.hatColors),
      hatB: pick(rng, theme.hatColors),
      accessory: pick(rng, nonTargetAccs),
      decoy: 'stripe'
    };
  }
  const torso = pick(rng, theme.torso);
  return {
    ...p,
    hat: look.hat,
    hatA: look.hatA,
    hatB: look.hatB,
    torsoA: torso,
    torsoB: rng() < 0.35 ? pick(rng, theme.torso) : torso,
    accessory: pick(rng, nonTargetAccs),
    decoy: 'hat'
  };
}
export function insideProp(props, x, y) {
  for (const pr of props) {
    if (x > pr.x - SPRITE_W / 2 && x < pr.x + pr.w + SPRITE_W / 2 &&
        y > pr.y - SPRITE_H / 2 && y < pr.y + pr.h) {
      return true;
    }
  }
  return false;
}
export function generateScene(params, withTarget = true) {
  const rng = makeRng(params.seed);
  const theme = getTheme(params.theme);
  const look = waldoLookFor(params.seed);
  const { roads, props } = layoutMap(rng, theme);
  const people = [];
  const walkable = roads.filter((r) => r.kind !== 'water');
  const water = roads.filter((r) => r.kind === 'water');
  const inWater = (x, y) =>
    water.some((r) => x > r.x && x < r.x + r.w && y > r.y - 6 && y < r.y + r.h);
  const cols = 5;
  const rows = 4;
  const hubs = [];
  for (let cx = 0; cx < cols; cx++) {
    for (let cy = 0; cy < rows; cy++) {
      const cellW = WORLD_W / cols;
      const cellH = WORLD_H / rows;
      hubs.push({
        x: cellW * (cx + 0.5) + randRange(rng, -cellW * 0.3, cellW * 0.3),
        y: cellH * (cy + 0.5) + randRange(rng, -cellH * 0.3, cellH * 0.3),
        r: randRange(rng, 110, 230)
      });
    }
  }
  let guard = 0;
  while (people.length < params.density && guard < params.density * 40) {
    guard++;
    let x;
    let y;
    const roll = rng();
    if (roll < 0.52 && walkable.length) {
      const r = pick(rng, walkable);
      x = randRange(rng, r.x + 10, r.x + r.w - 10);
      y = randRange(rng, r.y + 10, r.y + r.h - 10);
    } else if (roll < 0.86) {
      const hub = pick(rng, hubs);
      const a = rng() * Math.PI * 2;
      const d = Math.sqrt(rng()) * hub.r;
      x = hub.x + Math.cos(a) * d;
      y = hub.y + Math.sin(a) * d * 0.8;
    } else {
      x = randRange(rng, 24, WORLD_W - 24);
      y = randRange(rng, 40, WORLD_H - 24);
    }
    if (x < 24 || y < 40 || x > WORLD_W - 24 || y > WORLD_H - 24) continue;
    if (inWater(x, y)) continue;
    if (insideProp(props, x, y)) continue;
    people.push(plainPerson(rng, x, y, params.theme));
  }
  const order = shuffle(rng, people.map((_, i) => i));
  const decoyCount = Math.floor(people.length * params.decoyRatio);
  for (let i = 0; i < decoyCount; i++) {
    const idx = order[i];
    people[idx] = applyDecoy(rng, people[idx], params.theme, look);
  }
  let targetIndex = -1;
  if (withTarget) {
    const candidate = order[decoyCount] ?? order[0];
    people[candidate] = makeTargetLook(people[candidate], look);
    targetIndex = candidate;
  }
  people.sort((a, b) => a.y - b.y);
  if (withTarget) targetIndex = people.findIndex((p) => p.isTarget);
  return { seed: params.seed, theme: params.theme, look, roads, people, props, targetIndex };
}
export function stampTarget(scene, x, y) {
  const base = plainPerson(makeRng(scene.seed ^ 0x9e3779b9), x, y, scene.theme);
  const target = makeTargetLook(base, scene.look);
  const people = [...scene.people, target].sort((a, b) => a.y - b.y);
  return { ...scene, people, targetIndex: people.findIndex((p) => p.isTarget) };
}
export function targetPosition(scene) {
  if (scene.targetIndex < 0) return null;
  const p = scene.people[scene.targetIndex];
  return { x: p.x, y: p.y };
}
