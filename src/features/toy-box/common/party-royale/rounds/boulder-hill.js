// Builds Boulder Hill race: climb ramps while boulders roll down, goo rises from below and swallows stragglers.

import { ball, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, startPad, finishPad, crossedFinish, strip, ramp, spawnGrid, latestStarted, PARKED } from '../course-kit.js';
import { respawn, INTRO } from '../round-sim.js';

const W = 14, ROCK_R = 1.1, ROCK_SPEED = 6.5, POOL = 14, FALL_G = 25;
// hill profile toward -z: [length, rise]; flat ledges hold checkpoints
const PROFILE = [[6, 0], [14, 3], [5, 0], [14, 3], [5, 0], [14, 3], [5, 0], [14, 3]];
const FINISH_Z = -PROFILE.reduce((s, [len]) => s + len, 0);
const TOP_Y = PROFILE.reduce((s, [, rise]) => s + rise, 0);
const GOO_START = -2, GOO_DELAY = 15, GOO_RATE = 0.18;
const gooAt = (t) => GOO_START + GOO_RATE * Math.max(0, t - INTRO - GOO_DELAY);

// surface height at z (start pad z > 0 is flat y 0, finish pad flat at top)
function heightAt(z) {
  let z0 = 0, y = 0;
  for (const [len, rise] of PROFILE) {
    if (z >= z0 - len) return y + (rise * (z0 - z)) / len;
    z0 -= len; y += rise;
  }
  return y;
}

export default {
  id: 'boulder-hill', title: 'Boulder Hill', emoji: '🪨', kind: 'race', duration: 150,
  goal: 'Climb the hill. Boulders roll down, goo rises from below. Fall too low and the goo keeps you.',
  theme: { sky: [0xffb877, 0xfff0d0], fog: 0xffe0c0 },
  build(seed) {
    const rng = mulberry32(seed);
    const cols = [...startPad({ z0: 0, width: W }), ...hill()];
    const rocks = rockSchedule(rng);
    for (let k = 0; k < POOL; k++) cols.push(ball({ ...PARKED, r: ROCK_R, tag: 'hit', knock: 1, color: CANDY.post, shots: rocks.filter((_, i) => i % POOL === k), move: rockMove }));
    cols.push(...finishPad({ z0: FINISH_Z, y: TOP_Y, width: W }));
    const ledges = checkpointsAndPath();
    return createCourse({
      cols, killY: (t) => Math.max(-12, gooAt(t)), finishZ: FINISH_Z - 1, finished: crossedFinish(FINISH_Z, TOP_Y),
      spawn: spawnGrid({ zFront: 0, width: W - 2 }), ...ledges, view: { goo: true },
    });
  },
  // Rules > fall: back to last ledge if goo has not reached it, else the goo keeps you
  fell(sim, b) {
    const cp = sim.course.checkpoints[b.cp];
    if (cp.y > gooAt(sim.clock) + 0.6) respawn(sim, b);
    else sim.eliminate(b);
  },
};

// Course > ramps + ledges from PROFILE, no rails (boulders fling beans off the sides)
function hill() {
  const out = [];
  let z0 = 0, y = 0;
  PROFILE.forEach(([len, rise], i) => {
    out.push(rise ? ramp({ zStart: z0, length: len, width: W, y0: y, y1: y + rise }) : strip({ zStart: z0, length: len, width: W, y, color: i ? CANDY.pad : CANDY.floor })[0]);
    z0 -= len; y += rise;
  });
  return out;
}

function checkpointsAndPath() {
  const checkpoints = [{ x: 0, y: 0, z: 5, w: W - 4 }], path = [];
  let z0 = 0, y = 0;
  for (const [len, rise] of PROFILE) {
    if (!rise && z0 < 0) checkpoints.push({ x: 0, y, z: z0 - len / 2, w: W - 4 });
    path.push({ x: 0, z: z0 - len / 2, w: W - 4 });
    z0 -= len; y += rise;
  }
  path.push({ x: 0, z: FINISH_Z - 4, w: W - 4 });
  return { checkpoints, path };
}

// Schedules > boulders leave the top every 1.6 s easing to 0.9 s; each drifts off one side before the bottom
function rockSchedule(rng) {
  const out = [];
  for (let t = INTRO + 2; t < INTRO + 160;) {
    const x0 = (rng() - 0.5) * (W - 4), side = rng() < 0.5 ? -1 : 1, exitT = 4 + rng() * 5;
    const vx = (side * (W / 2 + ROCK_R + 0.2) - x0) / exitT;
    out.push({ start: t, x0, vx, exitT });
    t += Math.max(0.9, 1.6 - (t - INTRO) * 0.01) + rng() * 0.4;
  }
  return out;
}

// Motion > roll down the profile, drift sideways, drop off the edge, then park
function rockMove(t, c) {
  const s = latestStarted(c.shots, t);
  const age = s ? t - s.start : Infinity;
  if (age > s?.exitT + 2.5 || !s) return PARKED;
  const z = FINISH_Z + 1 + ROCK_SPEED * age, x = s.x0 + s.vx * Math.min(age, s.exitT + 1);
  const drop = age > s.exitT ? 0.5 * FALL_G * (age - s.exitT) ** 2 : 0;
  return { x, y: heightAt(z) + ROCK_R * 1.03 - drop, z, yaw: 0, tilt: 0 };
}
