// Builds Wall Rush survival: block walls with gaps slide across a square platform and shove beans off the edge.

import { box, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, latestStarted, PARKED } from '../course-kit.js';
import { steerTo, wander } from '../bean-bots.js';
import { INTRO } from '../round-sim.js';

const HALF = 12, BLOCKS = 8, BLOCK = (HALF * 2) / BLOCKS, SLOTS = 3, WALL_H = 1.5, RUN_OUT = HALF + 1.5;
// wall heading: +z, -z, +x, -x
const DIRS = [[0, 1], [0, -1], [1, 0], [-1, 0]];

export default {
  id: 'wall-rush', title: 'Wall Rush', emoji: '🧱', kind: 'survival', duration: 120,
  goal: 'Walls slide across the platform. Find the gap before the wall shoves you off the edge.',
  theme: { sky: [0xa8e6a0, 0xfff6c8], fog: 0xe0f8d8 },
  build(seed) {
    const rng = mulberry32(seed);
    const waves = waveSchedule(rng);
    const cols = [box({ x: 0, y: -0.5, z: 0, hx: HALF, hy: 0.5, hz: HALF, color: CANDY.floor })];
    for (let s = 0; s < SLOTS; s++) for (let k = 0; k < BLOCKS; k++) {
      cols.push(box({ ...PARKED, hx: BLOCK / 2 - 0.05, hy: WALL_H, hz: 0.45, tag: 'push', color: k % 2 ? CANDY.move : CANDY.rail, block: k, waves: waves.filter((_, i) => i % SLOTS === s), move: blockMove }));
    }
    return createCourse({ cols, waves, killY: -8, spawn: gridSpawn, view: { arena: HALF } });
  },
  // Bots > line up with the nearest gap of the next wall coming, otherwise drift around the middle
  bot(sim, b) {
    const wave = nextWave(sim, b, 8 + b.skill * 12);
    if (!wave) { wander(sim, b, HALF * 0.4); return true; }
    const [dx, dz] = DIRS[wave.dir], along = b.x * dx + b.z * dz, across = b.x * dz + b.z * dx;
    const br = b.brain;
    if (br.wave !== wave) { br.wave = wave; br.gap = nearestGap(wave, across) + (sim.rng() - 0.5) * BLOCK * (1.4 - b.skill); } // skill: misjudged gaps
    const stay = Math.max(-HALF + 3, Math.min(HALF - 4, along)); // keep off the edge the wall pushes toward
    steerTo(b, dx ? stay * dx : br.gap, dz ? stay * dz : br.gap);
    if (Math.abs(across - br.gap) < 0.4 && Math.abs(along - stay) < 1) b.mx = b.mz = 0;
    return true;
  },
};

// spawn on a grid in the middle, 6 across
function gridSpawn(i, n) {
  const per = Math.ceil(Math.sqrt(n)), row = Math.floor(i / per), col = i % per;
  return { x: (col - (per - 1) / 2) * 1.6, y: 0, z: (row - (Math.ceil(n / per) - 1) / 2) * 1.6, face: Math.PI };
}

// Schedules > a wall every 4.5 s easing to 2.6 s (walls overlap), faster each time, gaps shrink from 3 to 1
function waveSchedule(rng) {
  const out = [];
  let t = INTRO + 2, i = 0;
  while (t < INTRO + 130) {
    const speed = Math.min(7, 3.5 + i * 0.25), gapCount = i < 2 ? 3 : i < 6 ? 2 : 1;
    const gaps = new Set([...Array(BLOCKS).keys()].sort(() => rng() - 0.5).slice(0, gapCount));
    out.push({ start: t, dir: Math.floor(rng() * 4), speed, gaps, life: (RUN_OUT * 2) / speed });
    t += Math.max(2.6, 4.5 - i * 0.15); i++;
  }
  return out;
}

// Motion > block slides from one side to the other; gap blocks and finished waves park
function blockMove(t, c) {
  const w = latestStarted(c.waves, t);
  if (!w || w.gaps.has(c.block) || t - w.start > w.life) return PARKED;
  const [dx, dz] = DIRS[w.dir], along = -RUN_OUT + w.speed * (t - w.start), across = -HALF + BLOCK * (c.block + 0.5);
  return { x: dx ? along * dx : across, y: WALL_H, z: dz ? along * dz : across, yaw: dx ? Math.PI / 2 : 0, tilt: 0 };
}

// nearest wall front still coming at the bean, within notice distance
function nextWave(sim, b, notice) {
  const t = sim.clock;
  let best = null, bestGap = Infinity;
  for (const w of sim.course.waves) {
    if (w.start > t + 0.5) break;
    const age = t - w.start;
    if (age > w.life) continue;
    const [dx, dz] = DIRS[w.dir], front = -RUN_OUT + w.speed * age, gap = (b.x * dx + b.z * dz) - front;
    if (gap > -0.5 && gap < notice && gap < bestGap) { bestGap = gap; best = w; }
  }
  return best;
}

function nearestGap(w, across) {
  let best = 0, bd = Infinity;
  for (const k of w.gaps) {
    const c = -HALF + BLOCK * (k + 0.5), d = Math.abs(c - across);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
