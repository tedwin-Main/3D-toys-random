/**
 * FILE: backend/crowd-scene.ts
 * PURPOSE: procedural map and crowd generator with deterministic seed
 * UI: SceneView canvas, TargetCard preview
 * USED BY: backend/game-lobby.ts, frontend/app.tsx, tests
 * KEY EXPORTS: generateScene, stampTarget, targetPosition, makeTargetLook
 */

import { makeRng, pick, randInt, randRange, shuffle, type Rng } from './seeded-random.ts';
import {
  ACCESSORIES, HAIR, HATS, LEGS, SKIN, TORSO, WALDO, waldoLookFor,
  type AccessoryKind, type HatKind, type WaldoLook
} from './color-palette.ts';
import { getTheme, specFor, type PropKind, type Theme, type ThemeId } from './map-themes.ts';
import { SPRITE_H, SPRITE_W, WORLD_H, WORLD_W } from './scene-geometry.ts';

export type { PropKind };

export interface Person {
  x: number;
  y: number;
  skin: string;
  hair: string;
  torsoA: string;
  torsoB: string;       // equal to torsoA means a plain shirt, differing means stripes
  legs: string;
  hat: HatKind;
  hatA: string;
  hatB: string;
  accessory: AccessoryKind;
  flip: boolean;        // mirrored sprite, cheap extra variety
  isTarget: boolean;
  /** Debug/validation only: which Waldo trait this decoy copies. */
  decoy?: 'stripe' | 'hat';
}

export interface Prop {
  kind: PropKind;
  x: number;
  y: number;
  w: number;
  h: number;
  tint: string;
}

/** A street, lane, market aisle or river. Drawn under every prop. */
export interface Road {
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'road' | 'path' | 'aisle' | 'water';
}

export interface Scene {
  seed: number;
  theme: ThemeId;
  /** This round's Waldo outfit -- the card, the ghost and the crowd all use it. */
  look: WaldoLook;
  roads: Road[];
  people: Person[];
  props: Prop[];
  /** Index into people[] of the Waldo sprite, or -1 when the hider places it. */
  targetIndex: number;
}

export interface SceneParams {
  seed: number;
  /** Which Malaysian map this round is set in -- picks ground, props and dress. */
  theme: ThemeId;
  /** Fraction of the crowd that copies one Waldo trait. 0.05 -> 0.40 across rounds. */
  decoyRatio: number;
  /** Total crowd size. */
  density: number;
}

/**
 * Lay the map out around a street grid instead of scattering props at random.
 *
 * Streets come first; everything else hangs off them -- terraces run shoulder
 * to shoulder along the frontage, kerb props repeat at intervals, blocks get
 * filled behind, and small life (cats, bins, bikes) lands anywhere. Random
 * placement is what made the old maps look like spilled furniture.
 */
function layoutMap(rng: Rng, theme: Theme): { roads: Road[]; props: Prop[] } {
  const L = theme.layout;
  const roads: Road[] = [];
  const props: Prop[] = [];

  // --- streets ---------------------------------------------------------
  const vxs: number[] = [];
  for (let i = 0; i < L.cols; i++) {
    const slot = WORLD_W / (L.cols + 1);
    vxs.push(slot * (i + 1) + randRange(rng, -slot * 0.16, slot * 0.16));
  }
  const hys: number[] = [];
  for (let i = 0; i < L.rows; i++) {
    const slot = WORLD_H / (L.rows + 1);
    hys.push(slot * (i + 1) + randRange(rng, -slot * 0.14, slot * 0.14));
  }
  for (const x of vxs) roads.push({ x: x - L.roadW / 2, y: 0, w: L.roadW, h: WORLD_H, kind: L.roadKind });
  for (const y of hys) roads.push({ x: 0, y: y - L.roadW / 2, w: WORLD_W, h: L.roadW, kind: L.roadKind });

  // kampung gets a river across the bottom third, with boats tied along it
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

  const onRoad = (x: number, y: number, w: number, h: number, pad = 0): boolean =>
    roads.some((r) => x + w > r.x - pad && x < r.x + r.w + pad && y + h > r.y - pad && y < r.y + r.h + pad);

  // --- terraces: unbroken runs of buildings facing each street ----------
  for (const y of hys) {
    for (const side of [-1, 1] as const) {
      let x = randRange(rng, 20, 140);
      while (x < WORLD_W - 140) {
        const kind = pick(rng, L.terrace);
        const spec = specFor(theme, kind);
        const py = side < 0 ? y - L.roadW / 2 - spec.h - randRange(rng, 6, 18) : y + L.roadW / 2 + randRange(rng, 6, 18);
        // leave the junctions clear so the cross streets actually read as streets
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

  // the same again down the vertical streets, so no street is left bare
  for (const x of vxs) {
    for (const side of [-1, 1] as const) {
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

  // Buildings are placed by now, so later props can be kept off their footprint
  // -- a bench on a roof was the main thing that still read as "scattered".
  const built = props.filter((pr) => (L.terrace as readonly string[]).includes(pr.kind));
  const onBuilding = (x: number, y: number, w: number, h: number): boolean =>
    built.some((b) => x + w > b.x && x < b.x + b.w && y + h > b.y && y < b.y + b.h);

  // --- kerb furniture: repeated at a steady beat along every frontage ---
  for (const y of hys) {
    for (const side of [-1, 1] as const) {
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
    for (const side of [-1, 1] as const) {
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

  // --- fields: a few whole blocks given over to one crop ----------------
  if (L.field) {
    const spec = specFor(theme, L.field);
    for (let i = 0; i < 7; i++) {
      const bx = randRange(rng, 40, WORLD_W - spec.w * 2 - 40);
      const by = randRange(rng, 40, WORLD_H - spec.h * 2 - 40);
      // plots come in 2x2 patches so a field reads as farmed, not dropped
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

  // --- block interiors --------------------------------------------------
  for (let i = 0; i < 46; i++) {
    const kind = pick(rng, L.filler);
    const spec = specFor(theme, kind);
    const x = randRange(rng, 20, WORLD_W - spec.w - 20);
    const y = randRange(rng, 20, WORLD_H - spec.h - 20);
    if (onRoad(x, y, spec.w, spec.h, 14)) continue;
    if (onBuilding(x, y, spec.w, spec.h)) continue;
    props.push({ kind, x, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
  }

  // --- small life, allowed on the street itself -------------------------
  for (let i = 0; i < 58; i++) {
    const kind = pick(rng, L.tiny);
    const spec = specFor(theme, kind);
    const x = randRange(rng, 16, WORLD_W - spec.w - 16);
    const y = randRange(rng, 16, WORLD_H - spec.h - 16);
    if (L.water && waterY > 0 && y + spec.h > waterY && y < waterY + 118) continue;
    if (onBuilding(x, y, spec.w, spec.h)) continue;
    props.push({ kind, x, y, w: spec.w, h: spec.h, tint: pick(rng, spec.tints) });
  }

  // back to front, so a building never paints over the one in front of it
  props.sort((a, b) => a.y + a.h - (b.y + b.h));
  return { roads, props };
}

function plainPerson(rng: Rng, x: number, y: number, themeId: ThemeId): Person {
  const theme = getTheme(themeId);
  const hat = pick(rng, theme.hats) as HatKind;
  const torso = pick(rng, theme.torso);
  return {
    x,
    y,
    skin: pick(rng, SKIN),
    hair: pick(rng, HAIR),
    torsoA: torso,
    // a second colour means stripes/batik banding rather than a plain shirt
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

/** Apply the round's full Waldo signature to a person. */
export function makeTargetLook(p: Person, look: WaldoLook = WALDO): Person {
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

// Scene generator: apply decoy near-miss
function applyDecoy(rng: Rng, p: Person, themeId: ThemeId, look: WaldoLook): Person {
  const theme = getTheme(themeId);
  // accessory excluded so decoys copy one trait only, never both
  const nonTargetAccs = ACCESSORIES.filter((a) => a !== look.accessory);
  if (rng() < 0.5) {
    return {
      ...p,
      torsoA: look.stripeA,
      torsoB: look.stripeB,
      // hat must differ or decoy duplicates target
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

/** True when a point is inside a prop's solid body (people never spawn there). */
function insideProp(props: Prop[], x: number, y: number): boolean {
  for (const pr of props) {
    if (x > pr.x - SPRITE_W / 2 && x < pr.x + pr.w + SPRITE_W / 2 &&
        y > pr.y - SPRITE_H / 2 && y < pr.y + pr.h) {
      return true;
    }
  }
  return false;
}

/**
 * Generate the crowd. `withTarget: false` is the hide mode case -- the crowd is
 * built first and the hider's chosen coordinate is stamped in afterwards.
 */
export function generateScene(params: SceneParams, withTarget = true): Scene {
  const rng = makeRng(params.seed);
  const theme = getTheme(params.theme);
  const look = waldoLookFor(params.seed);
  const { roads, props } = layoutMap(rng, theme);
  const people: Person[] = [];
  const walkable = roads.filter((r) => r.kind !== 'water');
  const water = roads.filter((r) => r.kind === 'water');
  const inWater = (x: number, y: number): boolean =>
    water.some((r) => x > r.x && x < r.x + r.w && y > r.y - 6 && y < r.y + r.h);

  // Crowds cluster around hubs (the market, the fountain) with a thinner scatter
  // between them. An even confetti spread reads as a spreadsheet and gives the
  // hider nothing to disappear into.
  // Hubs sit on a jittered grid rather than at pure random points: random
  // placement clumps and leaves whole quadrants empty, which is dead panning.
  const cols = 5;
  const rows = 4;
  const hubs: Array<{ x: number; y: number; r: number }> = [];
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
    let x: number;
    let y: number;
    const roll = rng();
    if (roll < 0.52 && walkable.length) {
      // Most of the crowd is on the street -- that is where a crowd actually
      // is, and it gives the map obvious rivers of people to scan along.
      const r = pick(rng, walkable);
      x = randRange(rng, r.x + 10, r.x + r.w - 10);
      y = randRange(rng, r.y + 10, r.y + r.h - 10);
    } else if (roll < 0.86) {
      // Clustered: pick a hub, then a point in its disc (sqrt keeps it even, not spiky).
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

  // Decoys are chosen by seeded shuffle so every client picks the same ones.
  const order = shuffle(rng, people.map((_, i) => i));
  const decoyCount = Math.floor(people.length * params.decoyRatio);
  for (let i = 0; i < decoyCount; i++) {
    const idx = order[i];
    people[idx] = applyDecoy(rng, people[idx], params.theme, look);
  }

  let targetIndex = -1;
  if (withTarget) {
    // The target is drawn from the non-decoy tail so we never overwrite a decoy
    // and quietly lower the difficulty we just set.
    const candidate = order[decoyCount] ?? order[0];
    people[candidate] = makeTargetLook(people[candidate], look);
    targetIndex = candidate;
  }

  // Painter's order: back to front, so overlap looks like depth.
  people.sort((a, b) => a.y - b.y);
  if (withTarget) targetIndex = people.findIndex((p) => p.isTarget);

  return { seed: params.seed, theme: params.theme, look, roads, people, props, targetIndex };
}

/** Insert the hider's Waldo at an exact coordinate (hide mode). */
export function stampTarget(scene: Scene, x: number, y: number): Scene {
  const base = plainPerson(makeRng(scene.seed ^ 0x9e3779b9), x, y, scene.theme);
  const target = makeTargetLook(base, scene.look);
  const people = [...scene.people, target].sort((a, b) => a.y - b.y);
  return { ...scene, people, targetIndex: people.findIndex((p) => p.isTarget) };
}

export function targetPosition(scene: Scene): { x: number; y: number } | null {
  if (scene.targetIndex < 0) return null;
  const p = scene.people[scene.targetIndex];
  return { x: p.x, y: p.y };
}
