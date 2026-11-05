// Steps one bean: run, jump, dive, stumble, platform carry, wall push and landing.

import { DT, BEAN_R, BEAN_H, DIVE_H, STEP_UP, supportAt, slopeOf, pointVelocity, pushOut } from './course-colliders.js';

export const RUN = 0, DIVE = 1, STUMBLE = 2;
export const MOVE = {
  speed: 9, accel: 60, airAccel: 20, jump: 11.5, gravity: 32,
  diveSpeed: 12.5, diveUp: 4.5, diveMin: 0.35, diveRecover: 0.3, slideFriction: 16,
  stumble: 0.9, knockSpeed: 4.5, bounce: 13, slopePull: 0.7,
};
const NOOP = () => {};
const LEDGE_ASSIST = 0.3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

export function newBean(id, extra = {}) {
  return {
    id, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, face: 0, h: BEAN_H,
    mode: RUN, mt: 0, gnd: -1, coyote: 0, jbuf: 0, dbuf: 0, fell: false, slow: 1,
    // input, written by host (local keys, guest bundles, bots) or by guest prediction
    mx: 0, mz: 0, jumpSeq: 0, diveSeq: 0, grab: false, lastJump: 0, lastDive: 0,
    ...extra,
  };
}

// Run engine > one fixed step for one bean. emit(type, id, ...) gets fx events (host only; prediction passes none)
export function stepBean(b, course, emit = NOOP) {
  const wasGround = b.gnd >= 0, prevY = b.y;
  readButtons(b, wasGround, emit);
  steer(b, course, wasGround);
  if (wasGround) carry(b, course.cols[b.gnd]);
  b.vy -= MOVE.gravity * DT;
  b.x += b.vx * DT; b.y += b.vy * DT; b.z += b.vz * DT;
  b.h = b.mode === RUN ? BEAN_H : DIVE_H; // diving or knocked flat: high bars pass over
  for (const hit of pushOut(course, b)) knock(b, hit, emit);
  land(b, course, prevY, wasGround, emit);
  if (b.y < course.killYAt(course.t)) b.fell = true;
}

// Input > jump + dive edges from press counters, jump buffer + coyote time
function readButtons(b, wasGround, emit) {
  if (b.jumpSeq !== b.lastJump) { b.lastJump = b.jumpSeq; b.jbuf = 0.15; }
  if (b.diveSeq !== b.lastDive) { b.lastDive = b.diveSeq; b.dbuf = 0.1; }
  b.jbuf -= DT; b.dbuf -= DT;
  b.coyote = wasGround ? 0.1 : b.coyote - DT;
  if (b.mode !== RUN) return;
  if (b.jbuf > 0 && b.coyote > 0) {
    b.vy = MOVE.jump * Math.min(1, b.slow + 0.25); b.jbuf = 0; b.coyote = 0; b.gnd = -1;
    emit('j', b.id);
  } else if (b.dbuf > 0) startDive(b, wasGround, emit);
}

function startDive(b, wasGround, emit) {
  if (Math.hypot(b.mx, b.mz) > 0.1) b.face = Math.atan2(b.mx, b.mz); // dive where the stick points
  const sp = Math.max(Math.hypot(b.vx, b.vz), MOVE.diveSpeed * b.slow);
  b.vx = Math.sin(b.face) * sp; b.vz = Math.cos(b.face) * sp;
  b.vy = wasGround ? MOVE.diveUp : Math.max(b.vy, MOVE.diveUp * 0.6);
  b.mode = DIVE; b.mt = MOVE.diveMin; b.dbuf = 0; b.gnd = -1;
  emit('d', b.id);
}

// Run engine > horizontal control: run steers, dive + stumble slide out with friction; slopes pull downhill
function steer(b, course, wasGround) {
  b.mt = Math.max(0, b.mt - DT); // floor 0: only compared against 0 and stumble lengths; keeps the snapshot byte small
  if (b.mode !== RUN && b.mt <= 0 && wasGround) b.mode = RUN;
  if (b.mode === RUN) {
    let mx = b.mx, mz = b.mz;
    const len = Math.hypot(mx, mz);
    if (len > 1) { mx /= len; mz /= len; }
    const top = MOVE.speed * b.slow, a = (wasGround ? MOVE.accel : MOVE.airAccel) * DT;
    b.vx += clamp(mx * top - b.vx, -a, a);
    b.vz += clamp(mz * top - b.vz, -a, a);
    if (len > 0.1) b.face = Math.atan2(mx, mz);
  } else if (wasGround) {
    const sp = Math.hypot(b.vx, b.vz), k = sp > 1e-4 ? Math.max(0, sp - MOVE.slideFriction * DT) / sp : 0;
    b.vx *= k; b.vz *= k;
  }
  const slope = b.gnd >= 0 && slopeOf(course.cols[b.gnd]);
  if (slope) { b.vx += slope[0] * MOVE.gravity * MOVE.slopePull * DT; b.vz += slope[1] * MOVE.gravity * MOVE.slopePull * DT; }
}

// Ground > ride moving / spinning floors: move with the surface, turn with its yaw
function carry(b, col) {
  if (!col?.move) return;
  const [vx, vy, vz] = pointVelocity(col, b.x, b.y, b.z);
  b.x += vx * DT; b.z += vz * DT;
  if (vy > 0) b.y += vy * DT;
  b.face += col.pn.yaw - col.p.yaw;
}

// Walls > moving 'hit' pushers knock beans over, 'push' walls bulldoze without knocking; bouncers spring; still walls stop
function knock(b, { col, nx, nz }, emit) {
  const [cvx, , cvz] = pointVelocity(col, b.x, b.y + 0.8, b.z);
  const into = cvx * nx + cvz * nz, vn = b.vx * nx + b.vz * nz;
  if (col.tag === 'bounce') {
    b.vx = nx * MOVE.bounce + cvx; b.vz = nz * MOVE.bounce + cvz; b.vy = Math.max(b.vy, 5);
    stumble(b, 0.35, emit, col);
  } else if (into > 0.5 && col.tag !== 'push' && (col.tag === 'hit' || into > MOVE.knockSpeed)) {
    // per-obstacle fling: knock scales sideways push, knockUp = lift (pop over a low sweeper so it passes under)
    const k = col.knock ?? 1;
    b.vx = (cvx * 1.15 + nx * 3) * k; b.vz = (cvz * 1.15 + nz * 3) * k; b.vy = Math.max(b.vy, col.knockUp ?? 4.5 + into * 0.25);
    stumble(b, MOVE.stumble, emit, col);
  } else if (vn < into) {
    b.vx += nx * (into - vn); b.vz += nz * (into - vn);
  }
}

export function stumble(b, len, emit = NOOP, col = null) {
  if (b.mode !== STUMBLE || b.mt < len * 0.5) emit('h', b.id, col ? col.idx : -1);
  b.mode = STUMBLE; b.mt = Math.max(b.mt, len); b.gnd = -1;
}

// Ground > snap onto highest surface we fell onto or walked over (step-up while grounded)
function land(b, course, prevY, wasGround, emit) {
  // airborne: 0.3 ledge assist so a bean that dips under a tile edge while crossing a gap still lands on it
  const maxTop = Math.max(prevY, b.y) + (wasGround ? STEP_UP : b.vy <= 0 ? LEDGE_ASSIST : 0.05);
  const s = supportAt(course, b.x, b.z, maxTop);
  const snap = wasGround && b.vy <= 0 ? 0.35 : 0;
  if (s && b.y <= s.top + snap && (b.vy <= 0.01 || b.y < s.top)) {
    if (!wasGround && b.vy < -4) emit('l', b.id);
    if (!wasGround && b.mode === DIVE) b.mt = Math.max(b.mt, MOVE.diveRecover);
    b.y = s.top; if (b.vy < 0) b.vy = 0;
    b.gnd = s.col.idx;
  } else b.gnd = -1;
}

// Host > beans shove each other apart; a diving bean knocks the one it hits
export function bumpBeans(list, emit = NOOP) {
  const D = BEAN_R * 2;
  for (let i = 0; i < list.length; i++) for (let j = i + 1; j < list.length; j++) {
    const a = list[i], c = list[j];
    if (Math.abs(a.y - c.y) > 1.3) continue;
    const dx = c.x - a.x, dz = c.z - a.z, d = Math.hypot(dx, dz);
    if (d >= D || d < 1e-4) continue;
    const nx = dx / d, nz = dz / d, pen = (D - d) / 2;
    a.x -= nx * pen; a.z -= nz * pen; c.x += nx * pen; c.z += nz * pen;
    const vr = (c.vx - a.vx) * nx + (c.vz - a.vz) * nz;
    if (vr < 0) { a.vx += nx * vr * 0.5; a.vz += nz * vr * 0.5; c.vx -= nx * vr * 0.5; c.vz -= nz * vr * 0.5; }
    if (a.mode === DIVE && c.mode !== STUMBLE && vr < -6) stumble(c, 0.6, emit);
    else if (c.mode === DIVE && a.mode !== STUMBLE && vr < -6) stumble(a, 0.6, emit);
  }
}
