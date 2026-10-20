// Procedural layered sprites in a hand-drawn storybook style: every shape is
// filled flat and then outlined in ink, the way the classic Where's Waldo
// spreads are drawn. No image assets -- a person is still just a function of
// their palette, which is what lets the generator swap one layer to build a
// near-miss decoy.
//
// Props, ground and clothing all come from the round's theme (map-themes.ts),
// so the same code draws a KL street, a kampung and a pasar malam.

import { SPRITE_H, SPRITE_W } from '../../backend/scene-geometry.ts';
import { HAIR, INK, SKIN } from '../../backend/color-palette.ts';
import { makeRng } from '../../backend/seeded-random.ts';
import type { Person, Prop, Road } from '../../backend/crowd-scene.ts';
import { getTheme, type ThemeId } from '../../backend/map-themes.ts';

// ---------------------------------------------------------------- colour utils

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** amt > 0 lightens, amt < 0 darkens. Used for shading and highlights. */
function shade(hex: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const f = (c: number) => Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt));
  return `rgb(${f(r)}, ${f(g)}, ${f(b)})`;
}

function capsule(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number): void {
  const r = Math.min(w, h) / 2;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

/**
 * Fill the current path, then ink its edge. This one helper is the whole art
 * style -- flat colour inside a dark line, no soft edges anywhere.
 */
function fillInk(ctx: CanvasRenderingContext2D, fill: string, lw = 1.1): void {
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.stroke();
}

/** Ink an already-built path without filling it (window bars, rails, fronds). */
function ink(ctx: CanvasRenderingContext2D, lw = 1): void {
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.stroke();
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r = 2): void {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

// ------------------------------------------------------------------ ground tex

// One cached pattern per theme -- rebuilding the tile every frame is the kind
// of thing that quietly eats a whole frame budget.
const groundPatterns = new Map<ThemeId, CanvasPattern | null>();

/**
 * Ground tile for a theme: city paving, kampung grass, or wet night asphalt.
 * It stays low-contrast on purpose -- a busy ground competes with the stripes
 * the player is actually scanning for.
 */
export function getGroundPattern(ctx: CanvasRenderingContext2D, themeId: ThemeId): CanvasPattern | null {
  const cached = groundPatterns.get(themeId);
  if (cached !== undefined) return cached;

  const theme = getTheme(themeId);
  const tile = document.createElement('canvas');
  tile.width = 200;
  tile.height = 200;
  const t = tile.getContext('2d');
  if (!t) return null;

  t.fillStyle = theme.ground.base;
  t.fillRect(0, 0, 200, 200);
  const grain = makeRng(20260104 + themeId.length * 7717);

  if (theme.ground.style === 'paving') {
    // slab seams: a straight grid, drawn as ink so it matches the sprites
    t.strokeStyle = theme.ground.line;
    t.globalAlpha = 0.35;
    t.lineWidth = 1;
    for (let i = 0; i <= 200; i += 50) {
      t.beginPath();
      t.moveTo(i + 0.5, 0);
      t.lineTo(i + 0.5, 200);
      t.moveTo(0, i + 0.5);
      t.lineTo(200, i + 0.5);
      t.stroke();
    }
    t.globalAlpha = 1;
    // a couple of faintly darker slabs so the grid is not perfectly uniform.
    // At full strength this reads as a chessboard and fights the sprites.
    t.globalAlpha = 0.3;
    t.fillStyle = theme.ground.patch;
    for (let i = 0; i < 4; i++) {
      t.fillRect(Math.floor(grain() * 4) * 50 + 1, Math.floor(grain() * 4) * 50 + 1, 48, 48);
    }
    t.globalAlpha = 1;
  } else if (theme.ground.style === 'field') {
    // grass clumps: short ink ticks in clusters, plus bare earth patches
    // many small clumps rather than a few big ones -- big blobs make the
    // 200px tile boundary obvious once the camera pans
    t.globalAlpha = 0.45;
    t.fillStyle = theme.ground.patch;
    for (let i = 0; i < 30; i++) {
      t.beginPath();
      t.ellipse(grain() * 200, grain() * 200, 6 + grain() * 12, 4 + grain() * 8, grain() * 3, 0, Math.PI * 2);
      t.fill();
    }
    t.globalAlpha = 1;
    t.strokeStyle = theme.ground.line;
    t.globalAlpha = 0.3;
    t.lineWidth = 1;
    for (let i = 0; i < 260; i++) {
      const x = grain() * 200;
      const y = grain() * 200;
      t.beginPath();
      t.moveTo(x, y);
      t.lineTo(x + (grain() - 0.5) * 3, y - 3 - grain() * 3);
      t.stroke();
    }
    t.globalAlpha = 1;
  } else {
    // wet asphalt: puddles catching the market lights
    t.fillStyle = theme.ground.patch;
    for (let i = 0; i < 10; i++) {
      t.beginPath();
      t.ellipse(grain() * 200, grain() * 200, 16 + grain() * 30, 8 + grain() * 14, grain() * 3, 0, Math.PI * 2);
      t.fill();
    }
    t.strokeStyle = theme.ground.line;
    t.globalAlpha = 0.5;
    t.lineWidth = 1;
    for (let i = 0; i < 9; i++) {
      const x = grain() * 200;
      const y = grain() * 200;
      t.beginPath();
      t.ellipse(x, y, 10 + grain() * 22, 4 + grain() * 8, 0, 0, Math.PI * 2);
      t.stroke();
    }
    t.globalAlpha = 1;
  }

  // shared speckle, keeps any of the three from looking like printed vinyl
  for (let i = 0; i < 1800; i++) {
    const a = 0.03 + grain() * 0.05;
    t.fillStyle = grain() < 0.35 ? `rgba(255,255,255,${a})` : `rgba(30,24,16,${a})`;
    t.beginPath();
    t.arc(grain() * 200, grain() * 200, 0.5 + grain() * 0.8, 0, Math.PI * 2);
    t.fill();
  }

  const pattern = ctx.createPattern(tile, 'repeat');
  groundPatterns.set(themeId, pattern);
  return pattern;
}

/**
 * Night wash for pasar malam: a cool darkening pass over the whole view with
 * warm holes punched where the stall bulbs hang. Called once per frame, after
 * the scene, so it tints people and props alike.
 */
export function drawNightWash(
  ctx: CanvasRenderingContext2D,
  lamps: Array<{ x: number; y: number; r: number }>,
  vx: number, vy: number, vw: number, vh: number
): void {
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.fillStyle = 'rgba(40, 44, 78, 0.42)';
  ctx.fillRect(vx, vy, vw, vh);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const l of lamps) {
    if (l.x < vx - l.r || l.x > vx + vw + l.r || l.y < vy - l.r || l.y > vy + vh + l.r) continue;
    const g = ctx.createRadialGradient(l.x, l.y, 0, l.x, l.y, l.r);
    g.addColorStop(0, 'rgba(255, 196, 110, 0.34)');
    g.addColorStop(0.5, 'rgba(255, 170, 80, 0.12)');
    g.addColorStop(1, 'rgba(255, 160, 70, 0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(l.x, l.y, l.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** Where a prop's light source sits, for the night wash. Non-lit props return null. */
export function lampOf(pr: Prop): { x: number; y: number; r: number } | null {
  if (pr.kind === 'nightStall') return { x: pr.x + pr.w / 2, y: pr.y + pr.h * 0.3, r: 150 };
  if (pr.kind === 'satay') return { x: pr.x + pr.w / 2, y: pr.y + pr.h * 0.4, r: 95 };
  if (pr.kind === 'lamppost') return { x: pr.x + pr.w / 2, y: pr.y + 8, r: 100 };
  if (pr.kind === 'stringlights') return { x: pr.x + pr.w / 2, y: pr.y + pr.h * 0.4, r: 110 };
  if (pr.kind === 'fruitcart') return { x: pr.x + pr.w / 2, y: pr.y + pr.h * 0.25, r: 80 };
  return null;
}

// --------------------------------------------------------------------- roads

/**
 * Streets, lanes, market aisles and the kampung river. Drawn as one layer
 * under every prop -- this is the skeleton the whole map is arranged on.
 */
export function drawRoad(ctx: CanvasRenderingContext2D, r: Road, themeId: ThemeId): void {
  const theme = getTheme(themeId);
  ctx.save();
  if (r.kind === 'water') {
    ctx.fillStyle = theme.night ? '#2a3450' : '#6f93a8';
    ctx.fillRect(r.x, r.y, r.w, r.h);
    // ripple lines, the cheapest way to say "this is moving water"
    ctx.strokeStyle = 'rgba(255,255,255,0.3)';
    ctx.lineWidth = 1.4;
    for (let i = 0; i < 26; i++) {
      const y = r.y + ((i * 37) % r.h);
      const x = r.x + ((i * 211) % (r.w - 60));
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + 14, y - 4, x + 30, y);
      ctx.stroke();
    }
    ctx.strokeStyle = '#7a6a44';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(r.x, r.y);
    ctx.lineTo(r.x + r.w, r.y);
    ctx.moveTo(r.x, r.y + r.h);
    ctx.lineTo(r.x + r.w, r.y + r.h);
    ctx.stroke();
    ctx.restore();
    return;
  }

  ctx.fillStyle = theme.road.fill;
  ctx.fillRect(r.x, r.y, r.w, r.h);

  const horizontal = r.w > r.h;
  if (r.kind === 'road') {
    // kerbs plus a dashed centre line
    ctx.strokeStyle = theme.road.edge;
    ctx.lineWidth = 4;
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(r.x, r.y + 2);
      ctx.lineTo(r.x + r.w, r.y + 2);
      ctx.moveTo(r.x, r.y + r.h - 2);
      ctx.lineTo(r.x + r.w, r.y + r.h - 2);
    } else {
      ctx.moveTo(r.x + 2, r.y);
      ctx.lineTo(r.x + 2, r.y + r.h);
      ctx.moveTo(r.x + r.w - 2, r.y);
      ctx.lineTo(r.x + r.w - 2, r.y + r.h);
    }
    ctx.stroke();
    ctx.strokeStyle = '#d8c25a';
    ctx.lineWidth = 3;
    ctx.setLineDash([26, 22]);
    ctx.beginPath();
    if (horizontal) {
      ctx.moveTo(r.x, r.y + r.h / 2);
      ctx.lineTo(r.x + r.w, r.y + r.h / 2);
    } else {
      ctx.moveTo(r.x + r.w / 2, r.y);
      ctx.lineTo(r.x + r.w / 2, r.y + r.h);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (r.kind === 'path') {
    // dirt lane: wobbly edges, no markings
    ctx.strokeStyle = theme.road.edge;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    if (horizontal) {
      for (const edge of [r.y, r.y + r.h]) {
        ctx.moveTo(r.x, edge);
        for (let x = r.x; x < r.x + r.w; x += 70) ctx.quadraticCurveTo(x + 35, edge + ((x / 70) % 2 ? 4 : -4), x + 70, edge);
      }
    } else {
      for (const edge of [r.x, r.x + r.w]) {
        ctx.moveTo(edge, r.y);
        for (let y = r.y; y < r.y + r.h; y += 70) ctx.quadraticCurveTo(edge + ((y / 70) % 2 ? 4 : -4), y + 35, edge, y + 70);
      }
    }
    ctx.stroke();
  } else {
    // market aisle: just a scuffed border where the stalls end
    ctx.strokeStyle = theme.road.edge;
    ctx.lineWidth = 2;
    ctx.strokeRect(r.x + 1, r.y + 1, r.w - 2, r.h - 2);
  }
  ctx.restore();
}

// ---------------------------------------------------------------------- props

/** Every prop sits on the same soft contact shadow -- it is what glues it down. */
function contactShadow(ctx: CanvasRenderingContext2D, pr: Prop): void {
  ctx.fillStyle = 'rgba(45, 36, 24, 0.16)';
  ctx.beginPath();
  ctx.ellipse(pr.x + pr.w / 2, pr.y + pr.h - 2, pr.w * 0.46, Math.max(3, pr.h * 0.09), 0, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * A head and shoulders in a window or doorway. Buildings used to be empty
 * shells, which is the one thing the printed spreads never are -- there is
 * always somebody leaning out. Purely set dressing: Waldo is never one of
 * these, they only exist to give the eye more to reject.
 *
 * Seeded off the opening's own coordinates so every client draws the same
 * neighbours without anything crossing the wire.
 */
function drawOccupant(ctx: CanvasRenderingContext2D, cx: number, baseY: number, scale: number, seed: number): void {
  const rng = makeRng(Math.floor(Math.abs(seed) * 7919) + 13);
  if (rng() < 0.42) return; // plenty of windows stay empty, or it reads as a doll's house
  const shirts = ['#2f6f9f', '#c9452f', '#3c8f5a', '#c9a227', '#8f5ea8', '#e2622b', '#2f9f8f'];
  const skin = SKIN[Math.floor(rng() * SKIN.length)];
  const hair = HAIR[Math.floor(rng() * HAIR.length)];
  const shirt = shirts[Math.floor(rng() * shirts.length)];
  const r = 3.4 * scale;

  // shoulders first, cropped by the sill
  ctx.beginPath();
  ctx.ellipse(cx, baseY, r * 1.5, r * 1.15, 0, Math.PI, Math.PI * 2);
  fillInk(ctx, shirt, 0.8);
  // head
  ctx.beginPath();
  ctx.arc(cx, baseY - r * 1.5, r, 0, Math.PI * 2);
  fillInk(ctx, skin, 0.8);
  // hair cap
  ctx.beginPath();
  ctx.arc(cx, baseY - r * 1.62, r * 0.98, Math.PI * 1.08, Math.PI * 1.92);
  fillInk(ctx, hair, 0.7);
  // eyes
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx - r * 0.34, baseY - r * 1.45, r * 0.14, 0, Math.PI * 2);
  ctx.arc(cx + r * 0.34, baseY - r * 1.45, r * 0.14, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * `occupants` turns on the faces at windows, doorways and stall counters.
 * They are extra things to check and reject, so they are a hard-mode feature
 * -- easy and normal keep the buildings empty.
 */
export function drawProp(ctx: CanvasRenderingContext2D, pr: Prop, occupants = false): void {
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  contactShadow(ctx, pr);

  const cx = pr.x + pr.w / 2;

  switch (pr.kind) {
    // ------------------------------------------------------------------ KL
    case 'shoplot': {
      // Pre-war shophouse: five-foot-way arches below, louvred shutters above,
      // clay tile roof. The row of arches is what makes it read as KL/Penang.
      const roofH = pr.h * 0.2;
      const bodyY = pr.y + roofH;
      rect(ctx, pr.x, bodyY, pr.w, pr.h - roofH, 2);
      fillInk(ctx, pr.tint, 1.3);

      // upper-floor shutters
      const shutters = 3;
      const sw = pr.w / (shutters + 1);
      for (let i = 0; i < shutters; i++) {
        const x = pr.x + sw * 0.5 + i * sw;
        const winY = bodyY + pr.h * 0.1;
        const winH = pr.h * 0.26;
        rect(ctx, x, winY, sw * 0.62, winH, 1.5);
        fillInk(ctx, shade(pr.tint, -0.45), 1);
        // somebody at the window, drawn before the louvres so the slats cross them
        ctx.save();
        rect(ctx, x, winY, sw * 0.62, winH, 1.5);
        ctx.clip();
        if (occupants) drawOccupant(ctx, x + sw * 0.31, winY + winH * 0.95, 1.1, pr.x + x + i * 31);
        ctx.restore();
        ctx.beginPath();
        for (let l = 1; l < 4; l++) {
          ctx.moveTo(x, winY + (winH / 4) * l);
          ctx.lineTo(x + sw * 0.62, winY + (winH / 4) * l);
        }
        ink(ctx, 0.7);
      }

      // ground-floor arcade
      const archY = bodyY + pr.h * 0.46;
      const archH = pr.h - roofH - pr.h * 0.46;
      for (let i = 0; i < shutters; i++) {
        const x = pr.x + sw * 0.5 + i * sw;
        const aw = sw * 0.62;
        ctx.beginPath();
        ctx.moveTo(x, archY + archH);
        ctx.lineTo(x, archY + aw / 2);
        ctx.arc(x + aw / 2, archY + aw / 2, aw / 2, Math.PI, 0);
        ctx.lineTo(x + aw, archY + archH);
        ctx.closePath();
        fillInk(ctx, shade(pr.tint, -0.55), 1);
        // a customer standing in the five-foot-way
        ctx.save();
        ctx.beginPath();
        ctx.rect(x, archY, aw, archH);
        ctx.clip();
        if (occupants) drawOccupant(ctx, x + aw / 2, archY + archH - 1, 1.5, pr.y + x + i * 57);
        ctx.restore();
      }

      // clay tile roof with ridge
      ctx.beginPath();
      ctx.moveTo(pr.x - 5, pr.y + roofH);
      ctx.lineTo(pr.x + 10, pr.y);
      ctx.lineTo(pr.x + pr.w - 10, pr.y);
      ctx.lineTo(pr.x + pr.w + 5, pr.y + roofH);
      ctx.closePath();
      fillInk(ctx, '#a8502f', 1.3);
      ctx.beginPath();
      for (let i = 1; i < 8; i++) {
        const fx = pr.x + (pr.w / 8) * i;
        ctx.moveTo(fx - 4, pr.y + roofH);
        ctx.lineTo(fx, pr.y);
      }
      ink(ctx, 0.7);
      break;
    }

    case 'tower': {
      // Glass block: a flat slab, a window grid, and a mast. Depth comes from
      // the darker side face, not from perspective -- the camera is top-down.
      rect(ctx, pr.x, pr.y, pr.w * 0.82, pr.h, 2);
      fillInk(ctx, pr.tint, 1.3);
      rect(ctx, pr.x + pr.w * 0.82, pr.y + pr.h * 0.05, pr.w * 0.18, pr.h * 0.95, 2);
      fillInk(ctx, shade(pr.tint, -0.3), 1.2);
      ctx.fillStyle = shade(pr.tint, -0.5);
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 4; c++) {
          if ((r * 4 + c) % 5 === 0) continue; // a few lit/empty panes break the grid
          ctx.fillRect(pr.x + 7 + c * (pr.w * 0.17), pr.y + 10 + r * (pr.h * 0.095), pr.w * 0.12, pr.h * 0.055);
        }
      }
      ctx.beginPath();
      ctx.moveTo(cx - 6, pr.y);
      ctx.lineTo(cx - 6, pr.y - 16);
      ink(ctx, 1.2);
      break;
    }

    case 'cone': {
      ctx.beginPath();
      ctx.moveTo(cx, pr.y);
      ctx.lineTo(pr.x + pr.w * 0.9, pr.y + pr.h * 0.82);
      ctx.lineTo(pr.x + pr.w * 0.1, pr.y + pr.h * 0.82);
      ctx.closePath();
      fillInk(ctx, pr.tint, 1.1);
      rect(ctx, pr.x, pr.y + pr.h * 0.8, pr.w, pr.h * 0.2, 1.5);
      fillInk(ctx, shade(pr.tint, -0.2), 1.1);
      rect(ctx, pr.x + pr.w * 0.22, pr.y + pr.h * 0.42, pr.w * 0.56, pr.h * 0.16, 1);
      fillInk(ctx, '#f2ece0', 0.8);
      break;
    }

    // ------------------------------------------------------------- kampung
    case 'stiltHouse': {
      // Rumah panggung: timber box lifted on stilts, zinc gable roof, a short
      // flight of steps. The gap under the floor is the giveaway silhouette.
      const roofH = pr.h * 0.34;
      const bodyY = pr.y + roofH;
      const bodyH = pr.h * 0.42;
      const stiltY = bodyY + bodyH;

      ctx.fillStyle = 'rgba(40, 32, 20, 0.2)';
      ctx.fillRect(pr.x + 6, stiltY, pr.w - 12, pr.h - roofH - bodyH - 4);
      for (let i = 0; i < 4; i++) {
        const sx = pr.x + 10 + i * ((pr.w - 24) / 3);
        rect(ctx, sx, stiltY, 6, pr.h - roofH - bodyH, 1);
        fillInk(ctx, '#7a5a3a', 1);
      }

      rect(ctx, pr.x, bodyY, pr.w, bodyH, 2);
      fillInk(ctx, pr.tint, 1.3);
      // plank lines
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        ctx.moveTo(pr.x, bodyY + (bodyH / 4) * i);
        ctx.lineTo(pr.x + pr.w, bodyY + (bodyH / 4) * i);
      }
      ink(ctx, 0.6);
      // shuttered windows, propped open
      for (const fx of [0.18, 0.62]) {
        const wx = pr.x + pr.w * fx;
        const wy = bodyY + bodyH * 0.22;
        const ww = pr.w * 0.2;
        const wh = bodyH * 0.46;
        rect(ctx, wx, wy, ww, wh, 1.5);
        fillInk(ctx, shade(pr.tint, -0.5), 1);
        ctx.save();
        rect(ctx, wx, wy, ww, wh, 1.5);
        ctx.clip();
        if (occupants) drawOccupant(ctx, wx + ww / 2, wy + wh * 0.98, 1.2, pr.x + pr.y + fx * 1000);
        ctx.restore();
      }
      // steps down to the ground
      for (let i = 0; i < 3; i++) {
        rect(ctx, pr.x + pr.w * 0.38, stiltY + i * ((pr.h - roofH - bodyH) / 3), pr.w * 0.24, 4, 1);
        fillInk(ctx, '#8a6a42', 0.9);
      }
      // zinc gable roof, overhanging both ends
      ctx.beginPath();
      ctx.moveTo(pr.x - 10, bodyY);
      ctx.lineTo(cx, pr.y);
      ctx.lineTo(pr.x + pr.w + 10, bodyY);
      ctx.closePath();
      fillInk(ctx, '#9aa3a8', 1.3);
      ctx.beginPath();
      for (let i = 1; i < 7; i++) {
        ctx.moveTo(pr.x - 10 + ((pr.w + 20) / 7) * i, bodyY);
        ctx.lineTo(cx - (cx - (pr.x - 10 + ((pr.w + 20) / 7) * i)) * 0.12, pr.y + roofH * 0.1);
      }
      ink(ctx, 0.7);
      break;
    }

    case 'paddy': {
      // Flooded paddy square: water inside a raised earth bund, shoots in rows.
      rect(ctx, pr.x, pr.y, pr.w, pr.h, 4);
      fillInk(ctx, '#8a7a52', 1.3);
      rect(ctx, pr.x + 5, pr.y + 5, pr.w - 10, pr.h - 10, 3);
      fillInk(ctx, '#9fb6a8', 1);
      ctx.strokeStyle = shade(pr.tint, -0.3);
      ctx.lineWidth = 2;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 11; c++) {
          const x = pr.x + 14 + c * ((pr.w - 28) / 10);
          const y = pr.y + 16 + r * ((pr.h - 32) / 4);
          ctx.beginPath();
          ctx.moveTo(x, y + 6);
          ctx.lineTo(x - 4, y - 4);
          ctx.moveTo(x, y + 6);
          ctx.lineTo(x + 4, y - 4);
          ctx.moveTo(x, y + 6);
          ctx.lineTo(x, y - 6);
          ctx.stroke();
        }
      }
      break;
    }

    case 'sampan': {
      // Flat-bottomed boat seen from above: hull, cross ribs, one paddle.
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y + pr.h / 2);
      ctx.quadraticCurveTo(cx, pr.y - 4, pr.x + pr.w, pr.y + pr.h / 2);
      ctx.quadraticCurveTo(cx, pr.y + pr.h + 4, pr.x, pr.y + pr.h / 2);
      ctx.closePath();
      fillInk(ctx, pr.tint, 1.3);
      ctx.beginPath();
      for (let i = 1; i < 4; i++) {
        const x = pr.x + (pr.w / 4) * i;
        ctx.moveTo(x, pr.y + pr.h * 0.18);
        ctx.lineTo(x, pr.y + pr.h * 0.82);
      }
      ink(ctx, 0.9);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.6, pr.y + pr.h * 0.2);
      ctx.lineTo(pr.x + pr.w * 0.95, pr.y - pr.h * 0.3);
      ink(ctx, 1.4);
      break;
    }

    case 'banana': {
      // Banana plant: a short stem and big split leaves radiating out.
      rect(ctx, cx - 4, pr.y + pr.h * 0.45, 8, pr.h * 0.55, 2);
      fillInk(ctx, '#7a7a46', 1.1);
      const leaves = 6;
      for (let i = 0; i < leaves; i++) {
        const a = Math.PI + (i / (leaves - 1)) * Math.PI;
        const lx = cx + Math.cos(a) * pr.w * 0.42;
        const ly = pr.y + pr.h * 0.42 + Math.sin(a) * pr.h * 0.3;
        ctx.save();
        ctx.translate(cx, pr.y + pr.h * 0.45);
        ctx.rotate(Math.atan2(ly - (pr.y + pr.h * 0.45), lx - cx));
        ctx.beginPath();
        ctx.ellipse(pr.w * 0.26, 0, pr.w * 0.3, pr.h * 0.12, 0, 0, Math.PI * 2);
        fillInk(ctx, i % 2 ? pr.tint : shade(pr.tint, -0.14), 1.1);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(pr.w * 0.54, 0);
        ink(ctx, 0.8);
        ctx.restore();
      }
      break;
    }

    case 'well': {
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h * 0.62, pr.w * 0.46, pr.h * 0.3, 0, 0, Math.PI * 2);
      fillInk(ctx, pr.tint, 1.3);
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h * 0.58, pr.w * 0.32, pr.h * 0.2, 0, 0, Math.PI * 2);
      fillInk(ctx, '#3f4a52', 1);
      // frame and bucket rope
      ctx.beginPath();
      ctx.moveTo(pr.x + 6, pr.y + pr.h * 0.6);
      ctx.lineTo(pr.x + 9, pr.y);
      ctx.lineTo(pr.x + pr.w - 9, pr.y);
      ctx.lineTo(pr.x + pr.w - 6, pr.y + pr.h * 0.6);
      ink(ctx, 1.4);
      ctx.beginPath();
      ctx.moveTo(cx, pr.y + 2);
      ctx.lineTo(cx, pr.y + pr.h * 0.3);
      ink(ctx, 0.8);
      rect(ctx, cx - 5, pr.y + pr.h * 0.3, 10, 9, 1);
      fillInk(ctx, '#8a6a42', 1);
      break;
    }

    // --------------------------------------------------------- pasar malam
    case 'nightStall': {
      // Tarpaulin roof on poles, a trestle of goods, and a bare bulb on a wire.
      const roofY = pr.y + pr.h * 0.12;
      ctx.beginPath();
      ctx.moveTo(pr.x + 6, roofY + pr.h * 0.16);
      ctx.lineTo(pr.x + 6, pr.y + pr.h);
      ctx.moveTo(pr.x + pr.w - 6, roofY + pr.h * 0.16);
      ctx.lineTo(pr.x + pr.w - 6, pr.y + pr.h);
      ink(ctx, 1.4);

      rect(ctx, pr.x + 8, pr.y + pr.h * 0.52, pr.w - 16, pr.h * 0.3, 2);
      fillInk(ctx, '#6b5436', 1.2);
      // goods: a row of bright boxes on the trestle
      for (let i = 0; i < 5; i++) {
        const bw = (pr.w - 24) / 5;
        rect(ctx, pr.x + 12 + i * bw, pr.y + pr.h * 0.42, bw - 3, pr.h * 0.12, 1);
        fillInk(ctx, ['#d8453c', '#f0c23c', '#2f9f8f', '#e2622b', '#8f4fa8'][i], 0.9);
      }

      // the stallholder, behind their own counter
      if (occupants) drawOccupant(ctx, cx + pr.w * 0.18, pr.y + pr.h * 0.46, 1.6, pr.x + pr.y);

      // sagging tarpaulin
      ctx.beginPath();
      ctx.moveTo(pr.x, roofY + pr.h * 0.18);
      ctx.quadraticCurveTo(cx, roofY - pr.h * 0.12, pr.x + pr.w, roofY + pr.h * 0.18);
      ctx.lineTo(pr.x + pr.w, roofY + pr.h * 0.3);
      ctx.quadraticCurveTo(cx, roofY + pr.h * 0.02, pr.x, roofY + pr.h * 0.3);
      ctx.closePath();
      fillInk(ctx, pr.tint, 1.3);

      // bulb: the light source the night wash punches a warm hole for
      ctx.beginPath();
      ctx.moveTo(cx, roofY + pr.h * 0.05);
      ctx.lineTo(cx, roofY + pr.h * 0.24);
      ink(ctx, 0.8);
      ctx.beginPath();
      ctx.arc(cx, roofY + pr.h * 0.3, 5, 0, Math.PI * 2);
      fillInk(ctx, '#ffd98a', 1);
      break;
    }

    case 'satay': {
      // Charcoal grill: a long tray, skewers laid across it, smoke going up.
      rect(ctx, pr.x, pr.y + pr.h * 0.45, pr.w, pr.h * 0.4, 2);
      fillInk(ctx, pr.tint, 1.3);
      rect(ctx, pr.x + 4, pr.y + pr.h * 0.5, pr.w - 8, pr.h * 0.2, 1);
      fillInk(ctx, '#d8552a', 1);
      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const x = pr.x + 7 + i * ((pr.w - 14) / 6);
        ctx.moveTo(x, pr.y + pr.h * 0.44);
        ctx.lineTo(x, pr.y + pr.h * 0.78);
      }
      ink(ctx, 1.2);
      // smoke curls
      ctx.strokeStyle = 'rgba(230, 226, 214, 0.5)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const x = pr.x + pr.w * (0.25 + i * 0.25);
        ctx.beginPath();
        ctx.moveTo(x, pr.y + pr.h * 0.42);
        ctx.quadraticCurveTo(x + 7, pr.y + pr.h * 0.2, x - 4, pr.y);
        ctx.stroke();
      }
      break;
    }

    case 'durian': {
      // A heap of durians on a mat. Spikes are drawn as a ring of short ticks.
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h * 0.8, pr.w * 0.5, pr.h * 0.18, 0, 0, Math.PI * 2);
      fillInk(ctx, '#9a8a6a', 1.1);
      const fruit: Array<[number, number, number]> = [
        [cx - pr.w * 0.26, pr.y + pr.h * 0.62, pr.w * 0.2],
        [cx + pr.w * 0.24, pr.y + pr.h * 0.6, pr.w * 0.21],
        [cx, pr.y + pr.h * 0.4, pr.w * 0.23]
      ];
      for (const [fx, fy, fr] of fruit) {
        ctx.beginPath();
        ctx.ellipse(fx, fy, fr, fr * 0.85, 0, 0, Math.PI * 2);
        fillInk(ctx, pr.tint, 1.1);
        ctx.beginPath();
        for (let i = 0; i < 12; i++) {
          const a = (i / 12) * Math.PI * 2;
          ctx.moveTo(fx + Math.cos(a) * fr * 0.95, fy + Math.sin(a) * fr * 0.8);
          ctx.lineTo(fx + Math.cos(a) * (fr + 3.5), fy + Math.sin(a) * (fr * 0.85 + 3));
        }
        ink(ctx, 0.8);
      }
      break;
    }

    case 'stools': {
      // Folding table plus the red plastic stools every hawker centre owns.
      rect(ctx, pr.x + pr.w * 0.18, pr.y, pr.w * 0.64, pr.h * 0.34, 2);
      fillInk(ctx, '#d8d2c4', 1.2);
      for (const [sx, sy] of [[0.0, 0.5], [0.4, 0.62], [0.78, 0.48]] as const) {
        rect(ctx, pr.x + pr.w * sx, pr.y + pr.h * sy, pr.w * 0.22, pr.h * 0.2, 2);
        fillInk(ctx, pr.tint, 1.1);
        ctx.beginPath();
        ctx.moveTo(pr.x + pr.w * sx + 3, pr.y + pr.h * sy + pr.h * 0.2);
        ctx.lineTo(pr.x + pr.w * sx + 3, pr.y + pr.h * sy + pr.h * 0.36);
        ctx.moveTo(pr.x + pr.w * sx + pr.w * 0.22 - 3, pr.y + pr.h * sy + pr.h * 0.2);
        ctx.lineTo(pr.x + pr.w * sx + pr.w * 0.22 - 3, pr.y + pr.h * sy + pr.h * 0.36);
        ink(ctx, 1);
      }
      break;
    }


    // ------------------------------------------------- street furniture & life
    case 'lamppost': {
      // tall post with a lamp head -- doubles as a light source on the night map
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h - 2, 9, 4, 0, 0, Math.PI * 2);
      fillInk(ctx, shade(pr.tint, -0.3), 1);
      rect(ctx, cx - 3, pr.y + 10, 6, pr.h - 12, 2);
      fillInk(ctx, pr.tint, 1.1);
      ctx.beginPath();
      ctx.moveTo(cx, pr.y + 14);
      ctx.quadraticCurveTo(cx, pr.y + 4, cx + 12, pr.y + 5);
      ink(ctx, 2.2);
      ctx.beginPath();
      ctx.ellipse(cx + 13, pr.y + 9, 7, 5, 0, 0, Math.PI * 2);
      fillInk(ctx, '#ffd98a', 1);
      break;
    }

    case 'sign': {
      // shop signboard on a pole, the vertical kind that lines every KL street
      rect(ctx, cx - 2.5, pr.y + 20, 5, pr.h - 22, 1);
      fillInk(ctx, '#56606b', 1);
      rect(ctx, pr.x, pr.y, pr.w, pr.h * 0.42, 3);
      fillInk(ctx, pr.tint, 1.2);
      ctx.strokeStyle = 'rgba(255,255,255,0.75)';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      for (let i = 0; i < 3; i++) {
        const y = pr.y + pr.h * 0.1 + i * (pr.h * 0.1);
        ctx.moveTo(pr.x + 6, y);
        ctx.lineTo(pr.x + pr.w - 6 - (i === 2 ? 8 : 0), y);
      }
      ctx.stroke();
      break;
    }

    case 'bin': {
      rect(ctx, pr.x + 2, pr.y + 6, pr.w - 4, pr.h - 6, 3);
      fillInk(ctx, pr.tint, 1.2);
      rect(ctx, pr.x, pr.y, pr.w, 7, 2);
      fillInk(ctx, shade(pr.tint, -0.3), 1.1);
      ctx.beginPath();
      for (let i = 1; i < 3; i++) {
        ctx.moveTo(pr.x + 4, pr.y + 6 + (pr.h - 6) * (i / 3));
        ctx.lineTo(pr.x + pr.w - 4, pr.y + 6 + (pr.h - 6) * (i / 3));
      }
      ink(ctx, 0.7);
      break;
    }

    case 'potted': {
      ctx.beginPath();
      ctx.moveTo(pr.x + 4, pr.y + pr.h * 0.55);
      ctx.lineTo(pr.x + pr.w - 4, pr.y + pr.h * 0.55);
      ctx.lineTo(pr.x + pr.w - 8, pr.y + pr.h);
      ctx.lineTo(pr.x + 8, pr.y + pr.h);
      ctx.closePath();
      fillInk(ctx, '#b4714a', 1.1);
      for (const [dx, dy, r] of [[-0.22, 0.3, 0.3], [0.22, 0.28, 0.28], [0, 0.14, 0.32]] as const) {
        ctx.beginPath();
        ctx.arc(cx + pr.w * dx, pr.y + pr.h * dy, pr.w * r, 0, Math.PI * 2);
        fillInk(ctx, pr.tint, 1);
      }
      break;
    }

    case 'motorbike': {
      // kapcai seen from the side: two wheels, a seat and handlebars
      for (const wx of [pr.x + 9, pr.x + pr.w - 9]) {
        ctx.beginPath();
        ctx.arc(wx, pr.y + pr.h - 8, 8, 0, Math.PI * 2);
        fillInk(ctx, '#2f2b28', 1.1);
        ctx.beginPath();
        ctx.arc(wx, pr.y + pr.h - 8, 3, 0, Math.PI * 2);
        fillInk(ctx, '#8d8d8d', 0.8);
      }
      ctx.beginPath();
      ctx.moveTo(pr.x + 9, pr.y + pr.h - 10);
      ctx.lineTo(pr.x + pr.w * 0.4, pr.y + pr.h * 0.42);
      ctx.lineTo(pr.x + pr.w * 0.76, pr.y + pr.h * 0.42);
      ctx.lineTo(pr.x + pr.w - 9, pr.y + pr.h - 10);
      ctx.closePath();
      fillInk(ctx, pr.tint, 1.2);
      rect(ctx, pr.x + pr.w * 0.34, pr.y + pr.h * 0.3, pr.w * 0.34, pr.h * 0.18, 2);
      fillInk(ctx, '#2f2b28', 1);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w - 11, pr.y + pr.h * 0.42);
      ctx.lineTo(pr.x + pr.w - 6, pr.y + pr.h * 0.12);
      ctx.lineTo(pr.x + pr.w - 16, pr.y + pr.h * 0.12);
      ink(ctx, 1.6);
      break;
    }

    case 'bicycle': {
      for (const wx of [pr.x + 10, pr.x + pr.w - 10]) {
        ctx.beginPath();
        ctx.arc(wx, pr.y + pr.h - 9, 9, 0, Math.PI * 2);
        ink(ctx, 1.4);
      }
      ctx.beginPath();
      ctx.moveTo(pr.x + 10, pr.y + pr.h - 9);
      ctx.lineTo(pr.x + pr.w * 0.42, pr.y + pr.h * 0.3);
      ctx.lineTo(pr.x + pr.w - 10, pr.y + pr.h - 9);
      ctx.lineTo(pr.x + pr.w * 0.5, pr.y + pr.h - 9);
      ctx.closePath();
      ctx.strokeStyle = pr.tint;
      ctx.lineWidth = 2.6;
      ctx.stroke();
      ink(ctx, 0.9);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.42, pr.y + pr.h * 0.3);
      ctx.lineTo(pr.x + pr.w * 0.3, pr.y + pr.h * 0.22);
      ink(ctx, 1.6);
      break;
    }

    case 'cat': {
      // a cat asleep on the kerb. Pure set dressing, and the thing people point at.
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h * 0.62, pr.w * 0.38, pr.h * 0.34, 0, 0, Math.PI * 2);
      fillInk(ctx, pr.tint, 1);
      ctx.beginPath();
      ctx.arc(pr.x + pr.w * 0.22, pr.y + pr.h * 0.42, pr.h * 0.3, 0, Math.PI * 2);
      fillInk(ctx, pr.tint, 1);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.12, pr.y + pr.h * 0.24);
      ctx.lineTo(pr.x + pr.w * 0.16, pr.y + pr.h * 0.02);
      ctx.lineTo(pr.x + pr.w * 0.3, pr.y + pr.h * 0.2);
      fillInk(ctx, pr.tint, 0.8);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.78, pr.y + pr.h * 0.6);
      ctx.quadraticCurveTo(pr.x + pr.w * 1.05, pr.y + pr.h * 0.3, pr.x + pr.w * 0.82, pr.y + pr.h * 0.12);
      ink(ctx, 2);
      break;
    }

    case 'chicken': {
      // ayam kampung, scratching about where the crowd isn't
      ctx.beginPath();
      ctx.ellipse(cx, pr.y + pr.h * 0.6, pr.w * 0.36, pr.h * 0.3, 0, 0, Math.PI * 2);
      fillInk(ctx, pr.tint, 1);
      ctx.beginPath();
      ctx.arc(pr.x + pr.w * 0.72, pr.y + pr.h * 0.32, pr.h * 0.22, 0, Math.PI * 2);
      fillInk(ctx, pr.tint, 0.9);
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.86, pr.y + pr.h * 0.34);
      ctx.lineTo(pr.x + pr.w, pr.y + pr.h * 0.4);
      ctx.lineTo(pr.x + pr.w * 0.86, pr.y + pr.h * 0.46);
      fillInk(ctx, '#e0a03c', 0.7);
      ctx.beginPath();
      ctx.arc(pr.x + pr.w * 0.7, pr.y + pr.h * 0.14, pr.h * 0.1, 0, Math.PI * 2);
      fillInk(ctx, '#c9452f', 0.7);
      ctx.beginPath();
      ctx.moveTo(cx, pr.y + pr.h * 0.84);
      ctx.lineTo(cx, pr.y + pr.h);
      ctx.moveTo(cx + 5, pr.y + pr.h * 0.84);
      ctx.lineTo(cx + 5, pr.y + pr.h);
      ink(ctx, 1.1);
      break;
    }

    case 'laundry': {
      // washing line between two poles -- instant "people live here"
      ctx.beginPath();
      ctx.moveTo(pr.x + 4, pr.y + pr.h);
      ctx.lineTo(pr.x + 4, pr.y + 6);
      ctx.moveTo(pr.x + pr.w - 4, pr.y + pr.h);
      ctx.lineTo(pr.x + pr.w - 4, pr.y + 6);
      ink(ctx, 2);
      ctx.beginPath();
      ctx.moveTo(pr.x + 4, pr.y + 7);
      ctx.quadraticCurveTo(cx, pr.y + 16, pr.x + pr.w - 4, pr.y + 7);
      ink(ctx, 0.9);
      const colours = ['#d8453c', '#f0c23c', '#2f6f9f', '#3c8f5a', '#e8e2d4'];
      for (let i = 0; i < 5; i++) {
        const x = pr.x + 14 + i * ((pr.w - 28) / 4);
        const sag = Math.sin((i / 4) * Math.PI) * 7;
        rect(ctx, x - 7, pr.y + 9 + sag, 14, pr.h * 0.5, 2);
        fillInk(ctx, colours[i], 1);
      }
      break;
    }

    case 'fruitcart': {
      // pushcart stacked with fruit under a parasol
      rect(ctx, pr.x, pr.y + pr.h * 0.42, pr.w, pr.h * 0.34, 2);
      fillInk(ctx, pr.tint, 1.2);
      for (const wx of [pr.x + 12, pr.x + pr.w - 12]) {
        ctx.beginPath();
        ctx.arc(wx, pr.y + pr.h * 0.86, 7, 0, Math.PI * 2);
        fillInk(ctx, '#2f2b28', 1);
      }
      const fruits = ['#e2622b', '#f0c23c', '#d84a6a', '#3c8f5a', '#e08a3c'];
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(pr.x + 10 + i * ((pr.w - 20) / 6), pr.y + pr.h * 0.36, 6, 0, Math.PI * 2);
        fillInk(ctx, fruits[i % fruits.length], 0.9);
      }
      ctx.beginPath();
      ctx.moveTo(pr.x + pr.w * 0.5, pr.y + pr.h * 0.42);
      ctx.lineTo(pr.x + pr.w * 0.5, pr.y + 8);
      ink(ctx, 1.4);
      ctx.beginPath();
      ctx.ellipse(pr.x + pr.w * 0.5, pr.y + 8, pr.w * 0.42, 7, 0, Math.PI, Math.PI * 2);
      fillInk(ctx, '#d8453c', 1.1);
      break;
    }

    case 'stringlights': {
      // bulbs strung between two poles over the aisle
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y + 4);
      ctx.quadraticCurveTo(cx, pr.y + pr.h * 0.7, pr.x + pr.w, pr.y + 4);
      ink(ctx, 1);
      for (let i = 1; i < 8; i++) {
        const u = i / 8;
        // point on the quadratic sag, so the bulbs actually hang off the wire
        const bx = (1 - u) * (1 - u) * pr.x + 2 * (1 - u) * u * cx + u * u * (pr.x + pr.w);
        const by = (1 - u) * (1 - u) * (pr.y + 4) + 2 * (1 - u) * u * (pr.y + pr.h * 0.7) + u * u * (pr.y + 4);
        ctx.beginPath();
        ctx.arc(bx, by + 5, 4, 0, Math.PI * 2);
        fillInk(ctx, i % 2 ? '#ffd98a' : pr.tint, 0.8);
      }
      break;
    }

    // ------------------------------------------------------- shared by themes
    case 'palm': {
      // Coconut palm: leaning ringed trunk, drooping fronds, a few nuts.
      const topY = pr.y + pr.h * 0.3;
      const lean = pr.w * 0.1;
      ctx.beginPath();
      ctx.moveTo(cx - 5, pr.y + pr.h);
      ctx.quadraticCurveTo(cx - 3 + lean, pr.y + pr.h * 0.6, cx + lean, topY);
      ctx.lineTo(cx + lean + 5, topY);
      ctx.quadraticCurveTo(cx + 4 + lean, pr.y + pr.h * 0.6, cx + 5, pr.y + pr.h);
      ctx.closePath();
      fillInk(ctx, '#8a6a46', 1.2);
      ctx.beginPath();
      for (let i = 1; i < 6; i++) {
        const ty = pr.y + pr.h - (pr.h * 0.7 / 6) * i;
        ctx.moveTo(cx - 5 + lean * (i / 6), ty);
        ctx.lineTo(cx + 5 + lean * (i / 6), ty);
      }
      ink(ctx, 0.7);

      const hx = cx + lean + 2;
      const fronds = 7;
      for (let i = 0; i < fronds; i++) {
        const a = Math.PI + (i / (fronds - 1)) * Math.PI;
        ctx.save();
        ctx.translate(hx, topY);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(pr.w * 0.3, -pr.h * 0.06, pr.w * 0.5, pr.h * 0.08);
        ctx.quadraticCurveTo(pr.w * 0.3, pr.h * 0.02, 0, pr.h * 0.05);
        ctx.closePath();
        fillInk(ctx, i % 2 ? pr.tint : shade(pr.tint, -0.14), 1.1);
        ctx.restore();
      }
      ctx.beginPath();
      ctx.arc(hx - 5, topY + 4, 4, 0, Math.PI * 2);
      ctx.arc(hx + 5, topY + 5, 4, 0, Math.PI * 2);
      fillInk(ctx, '#7a6236', 1);
      break;
    }

    case 'stall': {
      // Day market stall: counter under a scalloped awning.
      const bodyY = pr.y + pr.h * 0.34;
      const bodyH = pr.h * 0.66;
      if (occupants) drawOccupant(ctx, cx, bodyY + 2, 1.5, pr.x * 3 + pr.y);
      rect(ctx, pr.x, bodyY, pr.w, bodyH, 3);
      fillInk(ctx, pr.tint, 1.3);
      ctx.fillStyle = 'rgba(0,0,0,0.12)';
      ctx.fillRect(pr.x + 1, bodyY + bodyH * 0.62, pr.w - 2, bodyH * 0.36);
      const scallops = 6;
      const sw = pr.w / scallops;
      for (let i = 0; i < scallops; i++) {
        ctx.beginPath();
        ctx.moveTo(pr.x + i * sw, pr.y);
        ctx.lineTo(pr.x + (i + 1) * sw, pr.y);
        ctx.lineTo(pr.x + (i + 1) * sw, bodyY - sw * 0.35);
        ctx.arc(pr.x + (i + 0.5) * sw, bodyY - sw * 0.35, sw / 2, 0, Math.PI);
        ctx.lineTo(pr.x + i * sw, pr.y);
        fillInk(ctx, i % 2 ? '#f2ece0' : '#c9452f', 1);
      }
      break;
    }

    case 'bench': {
      for (let i = 0; i < 3; i++) {
        rect(ctx, pr.x, pr.y + i * (pr.h * 0.17), pr.w, pr.h * 0.13, 2);
        fillInk(ctx, i === 0 ? shade(pr.tint, 0.12) : pr.tint, 1);
      }
      ctx.beginPath();
      ctx.moveTo(pr.x + 5, pr.y + pr.h * 0.5);
      ctx.lineTo(pr.x + 5, pr.y + pr.h);
      ctx.moveTo(pr.x + pr.w - 5, pr.y + pr.h * 0.5);
      ctx.lineTo(pr.x + pr.w - 5, pr.y + pr.h);
      ink(ctx, 1.4);
      break;
    }

    default: {
      // crate: planks plus a cross brace
      rect(ctx, pr.x, pr.y, pr.w, pr.h, 2);
      fillInk(ctx, pr.tint, 1.2);
      ctx.beginPath();
      ctx.moveTo(pr.x, pr.y);
      ctx.lineTo(pr.x + pr.w, pr.y + pr.h);
      ctx.moveTo(pr.x + pr.w, pr.y);
      ctx.lineTo(pr.x, pr.y + pr.h);
      ink(ctx, 0.9);
    }
  }
  ctx.restore();
}

// --------------------------------------------------------------------- people

/**
 * Draw one person centred on (x, y). Layer order is shadow, legs, torso, arms,
 * head, hair, hat, accessory -- the same order the generator thinks in, and
 * every layer gets an ink outline so the crowd reads as drawn, not rendered.
 *
 * Nothing here moves. The scene is a still illustration, like the printed
 * spreads -- an idle sway was tried and it made the crowd read as a game
 * engine rather than a drawing.
 */
export function drawPerson(ctx: CanvasRenderingContext2D, p: Person, atX = p.x, atY = p.y): void {
  const w = SPRITE_W;
  const h = SPRITE_H;
  const left = atX - w / 2;
  const top = atY - h / 2;

  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  if (p.flip) {
    ctx.translate(atX * 2, 0);
    ctx.scale(-1, 1);
  }

  // contact shadow -- sells the painter's-order depth sort, stays grounded
  ctx.fillStyle = 'rgba(55, 44, 30, 0.18)';
  ctx.beginPath();
  ctx.ellipse(atX, top + h - 1.5, w * 0.34, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  const hipY = top + h * 0.63;
  const footY = top + h * 0.96;

  // legs as capsules, with darker shoes -- feet planted, no idle motion here
  capsule(ctx, left + w * 0.26, hipY, w * 0.19, footY - hipY);
  fillInk(ctx, p.legs, 0.9);
  capsule(ctx, left + w * 0.55, hipY, w * 0.19, footY - hipY);
  fillInk(ctx, p.legs, 0.9);
  capsule(ctx, left + w * 0.23, footY - 2.5, w * 0.25, 4.5);
  fillInk(ctx, shade(p.legs, -0.45), 0.9);
  capsule(ctx, left + w * 0.52, footY - 2.5, w * 0.25, 4.5);
  fillInk(ctx, shade(p.legs, -0.45), 0.9);

  // torso: rounded with narrower shoulders, so the silhouette is a body not a box
  const torsoTop = top + h * 0.3;
  const torsoH = h * 0.35;
  const shoulderInset = w * 0.2;
  const torsoPath = () => {
    ctx.beginPath();
    ctx.moveTo(left + shoulderInset + 2, torsoTop);
    ctx.quadraticCurveTo(atX, torsoTop - 2.2, left + w - shoulderInset - 2, torsoTop);
    ctx.quadraticCurveTo(left + w - shoulderInset + 1.5, torsoTop + torsoH * 0.5, left + w - shoulderInset, torsoTop + torsoH);
    ctx.quadraticCurveTo(atX, torsoTop + torsoH + 1.8, left + shoulderInset, torsoTop + torsoH);
    ctx.quadraticCurveTo(left + shoulderInset - 1.5, torsoTop + torsoH * 0.5, left + shoulderInset + 2, torsoTop);
    ctx.closePath();
  };

  torsoPath();
  ctx.save();
  ctx.clip();
  if (p.torsoA === p.torsoB) {
    ctx.fillStyle = p.torsoA;
    ctx.fillRect(left - 2, torsoTop - 3, w + 4, torsoH + 6);
  } else {
    // stripes follow a gentle curve rather than flat bands, so they wrap the body
    const bands = 5;
    const bandH = torsoH / bands;
    for (let i = 0; i < bands; i++) {
      ctx.fillStyle = i % 2 ? p.torsoB : p.torsoA;
      const yTop = torsoTop + i * bandH;
      ctx.beginPath();
      ctx.moveTo(left - 2, yTop);
      ctx.quadraticCurveTo(atX, yTop + 1.4, left + w + 2, yTop);
      ctx.lineTo(left + w + 2, yTop + bandH + 0.6);
      ctx.quadraticCurveTo(atX, yTop + bandH + 2, left - 2, yTop + bandH + 0.6);
      ctx.closePath();
      ctx.fill();
    }
  }
  // one flat shadow down the right side -- a gradient here reads as 3D render,
  // which is exactly the look this pass is moving away from
  ctx.fillStyle = 'rgba(40, 30, 20, 0.12)';
  ctx.fillRect(left + w * 0.62, torsoTop - 3, w, torsoH + 6);
  ctx.restore();
  torsoPath();
  ink(ctx, 1.1);

  // arms, angled slightly out from the body
  const armW = w * 0.15;
  const armH = torsoH * 0.78;
  ctx.save();
  ctx.translate(left + shoulderInset - armW * 0.35, torsoTop + 2);
  ctx.rotate(0.14);
  capsule(ctx, 0, 0, armW, armH);
  fillInk(ctx, shade(p.torsoA, -0.08), 0.9);
  ctx.restore();
  ctx.save();
  ctx.translate(left + w - shoulderInset + armW * 0.35 - armW, torsoTop + 2);
  ctx.rotate(-0.14);
  capsule(ctx, 0, 0, armW, armH);
  fillInk(ctx, shade(p.torsoA, -0.08), 0.9);
  ctx.restore();

  // hands
  ctx.beginPath();
  ctx.arc(left + shoulderInset - armW * 0.1, torsoTop + armH + 1.5, armW * 0.56, 0, Math.PI * 2);
  fillInk(ctx, p.skin, 0.8);
  ctx.beginPath();
  ctx.arc(left + w - shoulderInset + armW * 0.1, torsoTop + armH + 1.5, armW * 0.56, 0, Math.PI * 2);
  fillInk(ctx, p.skin, 0.8);

  // neck
  const headR = w * 0.27;
  const headY = torsoTop - headR * 0.72;
  ctx.fillStyle = shade(p.skin, -0.18);
  ctx.fillRect(atX - w * 0.09, headY + headR * 0.55, w * 0.18, headR * 0.7);

  // head, with ears
  ctx.beginPath();
  ctx.arc(atX - headR * 0.92, headY + headR * 0.1, headR * 0.26, 0, Math.PI * 2);
  fillInk(ctx, p.skin, 0.8);
  ctx.beginPath();
  ctx.arc(atX + headR * 0.92, headY + headR * 0.1, headR * 0.26, 0, Math.PI * 2);
  fillInk(ctx, p.skin, 0.8);
  ctx.beginPath();
  ctx.ellipse(atX, headY, headR, headR * 1.05, 0, 0, Math.PI * 2);
  fillInk(ctx, p.skin, 1);

  // eyes -- tiny, but they stop the crowd reading as furniture
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(atX - headR * 0.33, headY + headR * 0.1, headR * 0.11, 0, Math.PI * 2);
  ctx.arc(atX + headR * 0.33, headY + headR * 0.1, headR * 0.11, 0, Math.PI * 2);
  ctx.fill();
  // a single ink smile line, the cheapest way to make a crowd look friendly
  ctx.beginPath();
  ctx.arc(atX, headY + headR * 0.25, headR * 0.3, 0.35, Math.PI - 0.35);
  ink(ctx, 0.7);

  // hair: a swept cap shape rather than a half-disc. A tudung covers it, so
  // skip it there -- drawing both leaves a fringe poking through the scarf.
  if (p.hat !== 'tudung') {
    ctx.beginPath();
    ctx.moveTo(atX - headR * 1.02, headY + headR * 0.18);
    ctx.quadraticCurveTo(atX - headR * 1.08, headY - headR * 1.15, atX, headY - headR * 1.08);
    ctx.quadraticCurveTo(atX + headR * 1.08, headY - headR * 1.12, atX + headR * 1.0, headY + headR * 0.22);
    ctx.quadraticCurveTo(atX + headR * 0.72, headY - headR * 0.38, atX - headR * 0.1, headY - headR * 0.3);
    ctx.quadraticCurveTo(atX - headR * 0.72, headY - headR * 0.22, atX - headR * 1.02, headY + headR * 0.18);
    ctx.closePath();
    fillInk(ctx, p.hair, 0.9);
  }

  drawHat(ctx, p, atX, headY, headR);
  drawAccessory(ctx, p, atX, headY, headR, left, w, h, torsoTop, torsoH, armH);

  ctx.restore();
}

function drawHat(ctx: CanvasRenderingContext2D, p: Person, cx: number, headY: number, headR: number): void {
  const domeY = headY - headR * 0.18;

  switch (p.hat) {
    case 'cap':
      ctx.beginPath();
      ctx.ellipse(cx, domeY, headR * 1.04, headR * 0.92, 0, Math.PI, Math.PI * 2);
      fillInk(ctx, p.hatA, 1);
      ctx.beginPath();
      ctx.ellipse(cx + headR * 0.55, domeY + headR * 0.06, headR * 0.95, headR * 0.2, 0, 0, Math.PI);
      fillInk(ctx, shade(p.hatA, -0.2), 1);
      break;

    case 'beanie':
      ctx.beginPath();
      ctx.ellipse(cx, domeY + headR * 0.1, headR * 1.05, headR * 0.95, 0, Math.PI, Math.PI * 2);
      fillInk(ctx, p.hatA, 1);
      rect(ctx, cx - headR * 1.08, domeY + headR * 0.02, headR * 2.16, headR * 0.3, headR * 0.15);
      fillInk(ctx, p.hatB, 1);
      break;

    case 'bobble': {
      // Waldo's hat: striped dome plus a pom-pom. The SHAPE is identical for
      // decoys and only the palette differs -- that is the whole near-miss.
      const domePath = () => {
        ctx.beginPath();
        ctx.ellipse(cx, domeY + headR * 0.12, headR * 1.06, headR * 1.0, 0, Math.PI, Math.PI * 2);
      };
      domePath();
      ctx.save();
      ctx.clip();
      const bands = 4;
      const topY = domeY - headR * 0.9;
      const bandH = (headR * 1.05) / bands;
      for (let i = 0; i < bands; i++) {
        ctx.fillStyle = i % 2 ? p.hatB : p.hatA;
        ctx.beginPath();
        ctx.moveTo(cx - headR * 1.2, topY + i * bandH);
        ctx.quadraticCurveTo(cx, topY + i * bandH + 1.2, cx + headR * 1.2, topY + i * bandH);
        ctx.lineTo(cx + headR * 1.2, topY + (i + 1) * bandH + 0.6);
        ctx.quadraticCurveTo(cx, topY + (i + 1) * bandH + 1.8, cx - headR * 1.2, topY + (i + 1) * bandH + 0.6);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      domePath();
      ink(ctx, 1);

      ctx.beginPath();
      ctx.arc(cx, domeY - headR * 1.0, headR * 0.3, 0, Math.PI * 2);
      fillInk(ctx, p.hatB, 0.9);
      break;
    }

    case 'sunhat':
      // wide straw brim -- the kampung field hat
      ctx.beginPath();
      ctx.ellipse(cx, domeY + headR * 0.2, headR * 1.62, headR * 0.32, 0, 0, Math.PI * 2);
      fillInk(ctx, p.hatA, 1.1);
      ctx.beginPath();
      ctx.ellipse(cx, domeY + headR * 0.2, headR * 0.76, headR * 0.76, 0, Math.PI, Math.PI * 2);
      fillInk(ctx, shade(p.hatA, -0.12), 1);
      break;

    case 'helmet':
      ctx.beginPath();
      ctx.ellipse(cx, domeY + headR * 0.3, headR * 1.12, headR * 1.05, 0, Math.PI, Math.PI * 2);
      fillInk(ctx, p.hatA, 1.1);
      ctx.beginPath();
      ctx.ellipse(cx - headR * 0.4, domeY - headR * 0.3, headR * 0.3, headR * 0.16, -0.5, 0, Math.PI * 2);
      fillInk(ctx, 'rgba(255,255,255,0.5)', 0.6);
      break;

    case 'tudung': {
      // Headscarf: wraps the whole head and falls past the jaw onto the
      // shoulders, which is what distinguishes it from a cap at this size.
      ctx.beginPath();
      ctx.moveTo(cx - headR * 1.18, headY + headR * 1.5);
      ctx.quadraticCurveTo(cx - headR * 1.3, headY - headR * 1.3, cx, headY - headR * 1.25);
      ctx.quadraticCurveTo(cx + headR * 1.3, headY - headR * 1.3, cx + headR * 1.18, headY + headR * 1.5);
      ctx.quadraticCurveTo(cx, headY + headR * 1.75, cx - headR * 1.18, headY + headR * 1.5);
      ctx.closePath();
      fillInk(ctx, p.hatA, 1.1);
      // face opening, cut back over the skin that is already drawn beneath
      ctx.save();
      ctx.beginPath();
      ctx.ellipse(cx, headY + headR * 0.08, headR * 0.78, headR * 0.92, 0, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = p.skin;
      ctx.fillRect(cx - headR * 1.4, headY - headR * 1.4, headR * 2.8, headR * 2.8);
      ctx.fillStyle = INK;
      ctx.beginPath();
      ctx.arc(cx - headR * 0.33, headY + headR * 0.1, headR * 0.11, 0, Math.PI * 2);
      ctx.arc(cx + headR * 0.33, headY + headR * 0.1, headR * 0.11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, headY + headR * 0.25, headR * 0.3, 0.35, Math.PI - 0.35);
      ink(ctx, 0.7);
      ctx.restore();
      ctx.beginPath();
      ctx.ellipse(cx, headY + headR * 0.08, headR * 0.78, headR * 0.92, 0, 0, Math.PI * 2);
      ink(ctx, 1);
      break;
    }

    case 'songkok':
      // Flat-topped velvet cap, straight sides -- deliberately boxy so it does
      // not get mistaken for the bobble dome at a glance.
      ctx.beginPath();
      ctx.moveTo(cx - headR * 1.0, domeY + headR * 0.22);
      ctx.lineTo(cx - headR * 0.94, domeY - headR * 0.72);
      ctx.lineTo(cx + headR * 0.94, domeY - headR * 0.72);
      ctx.lineTo(cx + headR * 1.0, domeY + headR * 0.22);
      ctx.closePath();
      fillInk(ctx, p.hatA, 1.1);
      ctx.beginPath();
      ctx.moveTo(cx - headR * 0.96, domeY - headR * 0.38);
      ctx.lineTo(cx + headR * 0.96, domeY - headR * 0.38);
      ink(ctx, 0.7);
      break;

    default:
      break;
  }
}

function drawAccessory(
  ctx: CanvasRenderingContext2D, p: Person, cx: number, headY: number, headR: number,
  left: number, w: number, h: number, torsoTop: number, torsoH: number, armH: number
): void {
  switch (p.accessory) {
    case 'glasses':
      ctx.beginPath();
      ctx.arc(cx - headR * 0.36, headY + headR * 0.1, headR * 0.31, 0, Math.PI * 2);
      ctx.moveTo(cx + headR * 0.67, headY + headR * 0.1);
      ctx.arc(cx + headR * 0.36, headY + headR * 0.1, headR * 0.31, 0, Math.PI * 2);
      ctx.moveTo(cx - headR * 0.05, headY + headR * 0.08);
      ctx.quadraticCurveTo(cx, headY - headR * 0.02, cx + headR * 0.05, headY + headR * 0.08);
      ink(ctx, 1.1);
      break;

    case 'bag':
      ctx.beginPath();
      ctx.moveTo(left + w * 0.72, torsoTop + 2);
      ctx.lineTo(left + w * 0.9, torsoTop + torsoH * 0.55);
      ink(ctx, 1);
      rect(ctx, left + w * 0.78, torsoTop + torsoH * 0.52, w * 0.28, h * 0.15, 2);
      fillInk(ctx, '#7a5433', 0.9);
      break;

    case 'balloon': {
      ctx.beginPath();
      ctx.moveTo(left + w * 0.92, torsoTop + armH);
      ctx.quadraticCurveTo(left + w * 1.1, torsoTop - h * 0.1, left + w * 1.0, torsoTop - h * 0.26);
      ink(ctx, 0.7);
      ctx.beginPath();
      ctx.ellipse(left + w * 1.0, torsoTop - h * 0.33, w * 0.2, w * 0.23, 0, 0, Math.PI * 2);
      fillInk(ctx, '#e4a33c', 1);
      break;
    }

    case 'cane':
      ctx.beginPath();
      ctx.moveTo(left + w * 0.93, torsoTop + armH);
      ctx.lineTo(left + w * 0.93, torsoTop + h * 0.62);
      ctx.moveTo(left + w * 0.93, torsoTop + armH);
      ctx.arc(left + w * 0.86, torsoTop + armH, w * 0.07, Math.PI * 1.1, Math.PI * 2.2);
      ink(ctx, 1.5);
      break;

    case 'scarf': {
      ctx.beginPath();
      ctx.ellipse(cx, torsoTop - 0.5, w * 0.3, h * 0.045, 0, 0, Math.PI * 2);
      fillInk(ctx, '#9c3b4e', 0.9);
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.1, torsoTop);
      ctx.quadraticCurveTo(cx + w * 0.26, torsoTop + h * 0.08, cx + w * 0.16, torsoTop + h * 0.15);
      ctx.lineTo(cx + w * 0.05, torsoTop + h * 0.12);
      ctx.closePath();
      fillInk(ctx, '#9c3b4e', 0.9);
      break;
    }

    default:
      break;
  }
}
