// Drives bot beans: follow course path, jump gaps and low hazards, dive under high ones, unstick.

import { DT, STEP_UP, BEAN_H, supportAt, colliderSpan } from './course-colliders.js';
import { RUN } from './bean-physics.js';

const LOOK = 0.4; // seconds ahead to test moving hazards
const THINK = 0.08;

// Bots > per tick: round hook may drive the bot; else generic course path follower
export function botInput(sim, b) {
  const br = b.brain;
  br.cool = (br.cool ?? 0) - DT;
  b.grab = false;
  if (sim.round.bot?.(sim, b)) return;
  followPath(sim, b);
}

export const pressJump = (b) => { b.jumpSeq++; };
export const pressDive = (b) => { b.diveSeq++; };

// aim input at (tx, tz); returns distance
export function steerTo(b, tx, tz, speed = 1) {
  const dx = tx - b.x, dz = tz - b.z, d = Math.hypot(dx, dz);
  if (d < 0.05) { b.mx = b.mz = 0; return d; }
  b.mx = (dx / d) * speed; b.mz = (dz / d) * speed;
  return d;
}

// Bots > path: next waypoint ahead (course runs toward -z), personal lane across its width
function followPath(sim, b) {
  const path = sim.course.path, br = b.brain;
  if (!path) { b.mx = b.mz = 0; return; }
  br.lane ??= (sim.rng() - 0.5) * 1.4;
  let i = 0;
  while (i < path.length - 1 && path[i].z >= b.z - 0.6) i++;
  const wp = path[i];
  steerTo(b, wp.x + br.lane * wp.w * 0.5, wp.z);
  unstick(sim, b);
  reactWhenReady(sim, b);
  const fin = sim.course.finishZ;
  if (fin != null && b.z - fin < 3 && b.z - fin > 1 && b.gnd >= 0 && !br.dived) { br.dived = true; pressDive(b); }
}

// Bots > hazards, gaps, walls in the heading; skill roll can miss a window
export function react(sim, b) {
  const len = Math.hypot(b.mx, b.mz) || 1, fx = b.mx / len, fz = b.mz / len;
  const haz = hazardAhead(sim, b);
  if (haz) {
    if (sim.rng() > 0.5 + b.skill * 0.5) { b.brain.cool = 0.3; return; }
    if (haz === 'low') pressJump(b);
    else if (haz === 'high') pressDive(b);
    else { const side = b.id % 2 ? 1 : -1; b.mx = fz * side; b.mz = -fx * side; b.brain.cool = 0.3; } // too tall: strafe out of its way
    return;
  }
  const { course } = sim;
  const near = supportAt(course, b.x + fx * 0.9, b.z + fz * 0.9, b.y + STEP_UP);
  if (!near || near.top < b.y - 1.2) {
    const far = supportAt(course, b.x + fx * 3.4, b.z + fz * 3.4, b.y + 1.6);
    if (far && far.top > b.y - 3 && sim.rng() < 0.4 + b.skill * 0.6) pressJump(b);
    else { b.mx = -fx * 0.3; b.mz = -fz * 0.3; }
    return;
  }
  const wall = wallAhead(course, b, fx, fz);
  if (wall != null) {
    if (wall < b.y + 1.9) pressJump(b);
    else b.brain.lane = (sim.rng() - 0.5) * 1.8;
  }
}

// top of a solid in the way at chest height, or null
function wallAhead(course, b, fx, fz) {
  const x = b.x + fx * 0.85, z = b.z + fz * 0.85;
  let top = null;
  for (const c of course.cols) {
    const s = colliderSpan(c, c.p, x, z, 0.3);
    if (s && s[1] > b.y + STEP_UP && s[0] < b.y + BEAN_H) top = Math.max(top ?? -Infinity, s[1]);
  }
  return top;
}

// throttled react: grounded, running, think cadence
export function reactWhenReady(sim, b) {
  if (b.gnd >= 0 && b.mode === RUN && b.brain.cool <= 0) { b.brain.cool = THINK; react(sim, b); }
}

// Bots > arena rounds: drift between random spots inside radius r, re-pick every few seconds
export function wander(sim, b, r, cx = 0, cz = 0) {
  const br = b.brain;
  br.wanderT = (br.wanderT ?? 0) - DT;
  if (br.wanderT <= 0 || br.tx == null) {
    const a = sim.rng() * Math.PI * 2, d = Math.sqrt(sim.rng()) * r;
    br.tx = cx + Math.sin(a) * d; br.tz = cz + Math.cos(a) * d; br.wanderT = 1.5 + sim.rng() * 2.5;
  }
  if (steerTo(b, br.tx, br.tz) < 0.8) b.mx = b.mz = 0;
}

// moving 'hit' collider where we will be in LOOK s: 'low' (jump it), 'high' (dive under), 'block'
export function hazardAhead(sim, b, look = LOOK) {
  const t = sim.course.t + look, x = b.x + b.vx * look, z = b.z + b.vz * look;
  for (const c of sim.course.kinematic) {
    if (c.tag !== 'hit' || c.off) continue;
    const s = colliderSpan(c, c.move(t, c), x, z, 0.75);
    if (!s || s[1] < b.y + 0.1 || s[0] > b.y + BEAN_H) continue;
    if (s[0] > b.y + 0.8) return 'high';
    if (s[1] < b.y + 1.5) return 'low';
    return 'block';
  }
  return null;
}

// Bots > no progress for 2 s: new lane + hop
function unstick(sim, b) {
  const br = b.brain;
  if (br.bestZ == null || b.z < br.bestZ - 0.5) { br.bestZ = b.z; br.stuckT = 0; return; }
  br.stuckT += DT;
  if (br.stuckT > 2) { br.stuckT = 0; br.bestZ = b.z; br.lane = (sim.rng() - 0.5) * 1.8; pressJump(b); }
}
