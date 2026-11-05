// Builds party royale course colliders and answers bean ground, wall and hit queries.

export const DT = 1 / 60;
export const BEAN_R = 0.45;
export const BEAN_H = 1.6;
export const DIVE_H = 0.75; // diving bean slides under high bars
export const STEP_UP = 0.45;

// seeded rng: same seed = same course on every tab
export function mulberry32(seed) {
  // scramble first: nearby seeds (1, 2, 3...) would otherwise start with correlated draws
  let a = Math.imul((seed >>> 0) ^ 0x5bd1e995, 0x9e3779b1) >>> 0;
  a = Math.imul(a ^ (a >>> 15), 0x85ebca6b) >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Collider shapes. Every shape takes a pose { x, y, z, yaw, tilt } (yaw about Y, tilt about local X, three.js order: group.rotation.y then child.rotation.x).
 * move(t, col) => pose: kinematic motion as pure function of round clock, so guests render + predict it with no network.
 * tag: 'floor' | 'wall' | 'hit' (knocks beans down) | 'push' (bulldozes, never knocks) | 'bounce' (springs beans away) | 'goal' (no collision, view only)
 * knock / knockUp: per-obstacle fling strength and lift for 'hit'
 */
function shape(kind, dims, { x = 0, y = 0, z = 0, yaw = 0, tilt = 0, move = null, tag = 'floor', color = 0xffffff, ...extra }) {
  const base = { x, y, z, yaw, tilt };
  return { kind, ...dims, base, move, tag, color, off: false, p: { ...base }, pn: { ...base }, idx: -1, ...extra };
}
export const box = (o) => shape('box', { hx: o.hx, hy: o.hy, hz: o.hz, reach: Math.hypot(o.hx, o.hz) + Math.abs(o.hy * Math.sin(o.tilt ?? 0)) }, o);
export const cyl = (o) => shape('cyl', { r: o.r, hy: o.hy, reach: o.r }, o);
export const ball = (o) => shape('ball', { r: o.r, reach: o.r }, o);

/**
 * Course = colliders + rules data. Round modules build one per seed.
 * opts: { cols, killY (number or fn(t)), path [{ x, z, w }] (bot centerline), checkpoints [{ z, x, y, w }] (race respawns, ordered by progress), spawn(n, i) => pose, view {} (render hints) }
 */
export function createCourse({ cols, killY = -20, ...rest }) {
  cols.forEach((c, i) => (c.idx = i));
  const kinematic = cols.filter((c) => c.move);
  const course = {
    cols, kinematic, t: -1, ...rest,
    killYAt: typeof killY === 'function' ? killY : () => killY,
    // pose every kinematic collider at t and t + DT (point velocity = difference)
    update(t) {
      if (t === course.t) return;
      course.t = t;
      for (const c of kinematic) { Object.assign(c.p, c.move(t, c)); Object.assign(c.pn, c.move(t + DT, c)); }
    },
  };
  return course;
}

// Collider frames > world to yaw frame (lx, lz) and back
function toYaw(p, dx, dz) { const c = Math.cos(p.yaw), s = Math.sin(p.yaw); return [dx * c - dz * s, dx * s + dz * c]; }
function fromYaw(p, lx, lz) { const c = Math.cos(p.yaw), s = Math.sin(p.yaw); return [lx * c + lz * s, -lx * s + lz * c]; }

// box top / bottom height at yaw-frame lz, or null when (lx, lz) is off the footprint
function boxSpan(c, p, lx, lz) {
  const ct = Math.cos(p.tilt), st = Math.sin(p.tilt), u = (lz - c.hy * st) / ct;
  if (Math.abs(lx) > c.hx || Math.abs(u) > c.hz) return null;
  const mid = p.y - lz * Math.tan(p.tilt), half = c.hy / ct;
  return [mid - half, mid + half];
}

// Ground > highest surface top under (x, z) not above maxTop
export function supportAt(course, x, z, maxTop) {
  let best = null, bestTop = -Infinity;
  for (const c of course.cols) {
    if (c.off || c.tag === 'goal' || c.kind === 'ball') continue;
    const p = c.p, dx = x - p.x, dz = z - p.z;
    if (Math.abs(dx) > c.reach + 0.2 || Math.abs(dz) > c.reach + 0.2) continue;
    let top;
    if (c.kind === 'box') {
      const [lx, lz] = toYaw(p, dx, dz);
      const span = boxSpan(c, p, Math.sign(lx) * Math.max(0, Math.abs(lx) - 0.12), Math.sign(lz) * Math.max(0, Math.abs(lz) - 0.12));
      if (!span) continue;
      top = span[1];
    } else {
      if (dx * dx + dz * dz > (c.r + 0.12) ** 2) continue;
      top = p.y + c.hy;
    }
    if (top <= maxTop && top > bestTop) { bestTop = top; best = c; }
  }
  return best && { col: best, top: bestTop };
}

// downhill pull on a tilted box: [ax, az] per unit gravity
export function slopeOf(c) {
  const t = c.p.tilt;
  if (c.kind !== 'box' || Math.abs(t) < 0.03) return null;
  const s = Math.sin(t) * Math.cos(t);
  return [Math.sin(c.p.yaw) * s, Math.cos(c.p.yaw) * s];
}

// world velocity of the collider surface at world point (x, y, z): carry for riders, knock for pushers
export function pointVelocity(c, x, y, z) {
  if (!c.move) return [0, 0, 0];
  const p = c.p, q = c.pn;
  const [lx, lz] = toYaw(p, x - p.x, z - p.z);
  const ly = y - p.y + lz * Math.tan(p.tilt);
  const [wx, wz] = fromYaw(q, lx, lz);
  const ny = q.y + ly - lz * Math.tan(q.tilt);
  return [(q.x + wx - x) / DT, (ny - y) / DT, (q.z + wz - z) / DT];
}

// Bot sensing > vertical span [bottom, top] of collider c at pose p where a circle (x, z, pad) overlaps it, else null
export function colliderSpan(c, p, x, z, pad = BEAN_R) {
  if (c.off || c.tag === 'goal') return null;
  const dx = x - p.x, dz = z - p.z;
  if (Math.abs(dx) > c.reach + pad || Math.abs(dz) > c.reach + pad) return null;
  if (c.kind === 'box') {
    const [lx, lz] = toYaw(p, dx, dz);
    const hzEff = c.hz * Math.cos(p.tilt) + Math.abs(c.hy * Math.sin(p.tilt));
    if (Math.abs(lx) > c.hx + pad || Math.abs(lz) > hzEff + pad) return null;
    const mid = p.y - Math.max(-hzEff, Math.min(hzEff, lz)) * Math.tan(p.tilt), half = c.hy / Math.cos(p.tilt);
    return [mid - half, mid + half];
  }
  const r = c.r + pad;
  if (dx * dx + dz * dz > r * r) return null;
  return c.kind === 'cyl' ? [p.y - c.hy, p.y + c.hy] : [p.y - c.r, p.y + c.r];
}

/**
 * Walls > push bean out of every solid it overlaps sideways; returns list of contacts { col, nx, nz } for knock rules.
 * b: { x, y, z, h } (h = current bean height)
 */
export function pushOut(course, b, contacts = []) {
  const R = BEAN_R, y0 = b.y + STEP_UP, y1 = b.y + b.h;
  for (const c of course.cols) {
    if (c.off || c.tag === 'goal') continue;
    const p = c.p, dx = b.x - p.x, dz = b.z - p.z;
    if (Math.abs(dx) > c.reach + R || Math.abs(dz) > c.reach + R) continue;
    if (c.kind === 'box') pushOutBox(c, p, b, dx, dz, y0, y1, contacts);
    else if (c.kind === 'cyl') pushOutCyl(c, p, b, dx, dz, y0, y1, contacts);
    else pushOutBall(c, p, b, contacts);
  }
  return contacts;
}

function pushOutBox(c, p, b, dx, dz, y0, y1, contacts) {
  const R = BEAN_R;
  const [lx, lz] = toYaw(p, dx, dz);
  const ct = Math.cos(p.tilt), hzEff = c.hz * ct + Math.abs(c.hy * Math.sin(p.tilt));
  const px = c.hx + R - Math.abs(lx), pz = hzEff + R - Math.abs(lz);
  if (px <= 0 || pz <= 0) return;
  const mid = p.y - Math.max(-hzEff, Math.min(hzEff, lz)) * Math.tan(p.tilt), half = c.hy / ct;
  if (mid + half <= y0 || mid - half >= y1) return;
  const alongX = px < pz;
  const nlx = alongX ? Math.sign(lx) || 1 : 0, nlz = alongX ? 0 : Math.sign(lz) || 1;
  const [nx, nz] = fromYaw(p, nlx, nlz);
  const pen = alongX ? px : pz;
  b.x += nx * pen; b.z += nz * pen;
  contacts.push({ col: c, nx, nz });
}

function pushOutCyl(c, p, b, dx, dz, y0, y1, contacts) {
  const R = BEAN_R, d = Math.hypot(dx, dz);
  if (d >= c.r + R || p.y + c.hy <= y0 || p.y - c.hy >= y1) return;
  const nx = d > 1e-4 ? dx / d : 1, nz = d > 1e-4 ? dz / d : 0;
  b.x = p.x + nx * (c.r + R); b.z = p.z + nz * (c.r + R);
  contacts.push({ col: c, nx, nz });
}

// bean as vertical segment (y + R .. y + h - R) vs sphere
function pushOutBall(c, p, b, contacts) {
  const R = BEAN_R, cy = Math.max(b.y + R, Math.min(b.y + Math.max(R, b.h - R), p.y));
  const dx = b.x - p.x, dy = cy - p.y, dz = b.z - p.z, d = Math.hypot(dx, dy, dz);
  if (d >= c.r + R) return;
  const h = Math.hypot(dx, dz), nx = h > 1e-4 ? dx / h : 1, nz = h > 1e-4 ? dz / h : 0;
  const pen = c.r + R - d;
  b.x += nx * pen; b.z += nz * pen;
  contacts.push({ col: c, nx, nz });
}
