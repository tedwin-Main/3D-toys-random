// Builds Crown Summit final: sweepers, a ramp, sliding steps up to a summit; first bean to jump and grab the crown wins.

import { box, cyl, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, startPad, strip, ramp, spawnGrid, spinMove, slideMove } from '../course-kit.js';
import { steerTo, pressJump, reactWhenReady } from '../bean-bots.js';
import { respawn } from '../round-sim.js';

const RAMP_TOP = 3, STEP_COUNT = 5, STEP = 4, STEP_PITCH = 5, STEP_RISE = 1;
const LANDING_Z = -24, STEPS_Z = LANDING_Z - 2.5;
const stepZ = (k) => STEPS_Z - STEP / 2 - k * STEP_PITCH;
const SUMMIT_Y = RAMP_TOP + STEP_COUNT * STEP_RISE, SUMMIT_Z = stepZ(STEP_COUNT - 1) - STEP / 2 - 1 - 5;
const CROWN = { x: 0, y: SUMMIT_Y + 3, z: SUMMIT_Z, reach: 1.1 };
const crownBob = (t) => CROWN.y + Math.sin(t * 2) * 0.15;

export default {
  id: 'crown-summit', title: 'Crown Summit', emoji: '👑', kind: 'final', duration: 180,
  goal: 'Climb to the summit. The crown floats above it: jump and press Grab to take it. First grab wins the show.',
  theme: { sky: [0xffd36e, 0xffffff], fog: 0xfff0c8 },
  build(seed) {
    const rng = mulberry32(seed);
    const cols = [
      ...startPad({ z0: 0, width: 16 }),
      ...strip({ zStart: 0, length: 14, width: 12, rails: 1.2 }),
      ...[-4.5, -10].map((z, i) => box({ x: 0, y: 0.45, z, hx: 5.6, hy: 0.28, hz: 0.28, tag: 'hit', color: CANDY.hit, move: spinMove((i ? -1 : 1) * (1 + rng() * 0.4), rng() * 3) })),
      ...[-4.5, -10].map((z) => cyl({ x: 0, y: 0.7, z, r: 0.5, hy: 0.7, tag: 'wall', color: CANDY.post })),
      ramp({ zStart: -14, length: 10, width: 8, y0: 0, y1: RAMP_TOP }),
      ...strip({ zStart: LANDING_Z, length: 2, width: 8, y: RAMP_TOP, color: CANDY.pad }),
      ...slidingSteps(rng),
      box({ x: 0, y: SUMMIT_Y - 0.5, z: SUMMIT_Z, hx: 5, hy: 0.5, hz: 5, color: CANDY.goal }),
      box({ x: 0, y: SUMMIT_Y + 0.45, z: SUMMIT_Z, hx: 4.6, hy: 0.28, hz: 0.28, tag: 'hit', knock: 0.6, knockUp: 6, color: CANDY.move, move: spinMove(0.9 + rng() * 0.3) }),
      cyl({ x: 0, y: SUMMIT_Y + 0.3, z: SUMMIT_Z, r: 0.45, hy: 0.3, tag: 'wall', color: CANDY.post }),
    ];
    const course = createCourse({
      cols, killY: -10, spawn: spawnGrid({ zFront: 0, width: 14 }),
      checkpoints: [{ x: 0, y: 0, z: 5, w: 10 }, { x: 0, y: RAMP_TOP, z: LANDING_Z - 1, w: 5 }, { x: 0, y: SUMMIT_Y, z: SUMMIT_Z + 4, w: 6 }],
      path: [{ x: 0, z: -3, w: 8 }, { x: 0, z: -8, w: 8 }, { x: 0, z: -13, w: 6 }, { x: 0, z: -20, w: 5 }, { x: 0, z: LANDING_Z - 1, w: 4 }],
      view: { crown: CROWN },
    });
    course.steps = cols.filter((c) => c.step != null).map((c) => c.idx);
    return course;
  },
  crownAt: (t) => ({ ...CROWN, y: crownBob(t) }),
  // Grab > airborne bean whose hands reach the crown takes it; else normal bean grab
  grab(sim, b) {
    if (sim.data.crowned || !reachesCrown(b, sim.clock)) return false;
    sim.data.crowned = b.id;
    sim.emit('crown', b.id);
    return true;
  },
  fell: (sim, b) => respawn(sim, b),
  over: (sim) => !!sim.data.crowned || sim.playTime >= sim.round.duration || sim.active.length === 0,
  // Rules > crown winner; timer: nearest bean to the crown takes it
  finish(sim) {
    const winner = sim.data.crowned ? sim.beans.get(sim.data.crowned) : nearestToCrown(sim);
    for (const b of sim.active) (b === winner ? sim.qualify : sim.eliminate)(b);
  },
  pack: (sim) => sim.data.crowned ?? 0,
  unpack(sim, d) { sim.data.crowned = d || 0; },
  // Bots > course path to the landing, then hop step to step by their current x, then jump + grab at the crown
  bot(sim, b) {
    if (b.z > LANDING_Z - 1.5) return false;
    const steps = sim.course.steps, cols = sim.course.cols;
    const next = steps.find((i) => cols[i].base.z + STEP / 2 < b.z - 0.6);
    if (next != null) { steerTo(b, cols[next].p.x, cols[next].base.z); reactWhenReady(sim, b); return true; }
    const d = steerTo(b, CROWN.x, CROWN.z);
    if (d < 1.2 && b.gnd >= 0) pressJump(b);
    b.grab = b.gnd < 0 && d < 1.6;
    if (b.gnd >= 0) reactWhenReady(sim, b);
    return true;
  },
};

// Section > five steps, each a little higher, sliding side to side over the void
function slidingSteps(rng) {
  const out = [];
  for (let k = 0; k < STEP_COUNT; k++) {
    const y = RAMP_TOP + (k + 1) * STEP_RISE - 0.3;
    out.push(box({ x: 0, y, z: stepZ(k), hx: STEP / 2, hy: 0.3, hz: STEP / 2, color: k % 2 ? CANDY.floorAlt : CANDY.floor, step: k, move: slideMove('x', 2.2, 0.8 + rng() * 0.5, rng() * 6.28) }));
  }
  return out;
}

function reachesCrown(b, t) {
  const head = b.y + 1.6, cy = crownBob(t);
  return Math.hypot(b.x - CROWN.x, b.z - CROWN.z) < CROWN.reach && head > cy - 0.8 && head < cy + 1;
}

function nearestToCrown(sim) {
  let best = null, bd = Infinity;
  for (const b of sim.active) { const d = Math.hypot(b.x - CROWN.x, b.y - SUMMIT_Y, b.z - CROWN.z); if (d < bd) { bd = d; best = b; } }
  return best;
}
