// Builds Sweep Bar survival: low bar to jump, high bar to dive under, both speed up until few remain.

import { box, cyl, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, discFloor, ringSpawn } from '../course-kit.js';
import { wander, reactWhenReady, pressDive, hazardAhead } from '../bean-bots.js';
import { INTRO } from '../round-sim.js';

const R = 11;
// angle(t) = w0 t + a t² / 2 from play start: bars rest during countdown, then ramp up all round
const sweep = (w0, accel, dir, phase) => (t, c) => {
  const p = Math.max(0, t - INTRO);
  return { ...c.base, yaw: phase + dir * (w0 * p + 0.5 * accel * p * p) };
};

export default {
  id: 'sweep-bar', title: 'Sweep Bar', emoji: '🧹', kind: 'survival', duration: 120,
  goal: 'Jump the low bar, dive under the high bar. They keep speeding up. Stay on the platform.',
  theme: { sky: [0x9fd0ff, 0xffe0b0], fog: 0xd8ecff },
  build(seed) {
    const rng = mulberry32(seed), dir = rng() < 0.5 ? 1 : -1;
    const cols = [
      discFloor({ r: R }),
      cyl({ x: 0, y: 0.9, z: 0, r: 1.2, hy: 0.9, tag: 'wall', color: CANDY.post }),
      box({ x: 0, y: 0.45, z: 0, hx: R + 0.6, hy: 0.28, hz: 0.28, tag: 'hit', knock: 0.55, knockUp: 8, color: CANDY.hit, move: sweep(0.75, 0.014, dir, rng() * 6.28) }),
      box({ x: 0, y: 1.38, z: 0, hx: R + 0.6, hy: 0.3, hz: 0.3, tag: 'hit', knock: 0.55, knockUp: 3, color: CANDY.move, move: sweep(0.55, 0.012, -dir, rng() * 6.28) }),
    ];
    return createCourse({ cols, killY: -8, spawn: ringSpawn({ r: R * 0.8 }), view: { arena: R } });
  },
  // Bots > keep mid-ring, dive toward centre so the slide never carries off the edge
  bot(sim, b) {
    wander(sim, b, R * 0.45);
    const r = Math.hypot(b.x, b.z);
    if (r < 3) { b.mx = b.x / (r || 1); b.mz = b.z / (r || 1); }
    if (hazardAhead(sim, b) === 'high' && b.gnd >= 0 && b.mode === 0 && b.brain.cool <= 0 && sim.rng() < 0.5 + b.skill * 0.5) {
      const a = Math.atan2(-b.x, -b.z) + (sim.rng() - 0.5) * 0.6;
      b.mx = Math.sin(a); b.mz = Math.cos(a); b.brain.cool = 0.5;
      pressDive(b);
      return true;
    }
    reactWhenReady(sim, b);
    return true;
  },
};
