// Builds Tilt Bridges race: long planks over the void that tip toward whichever side the beans crowd.

import { box, cyl, createCourse, mulberry32, DT } from '../course-colliders.js';
import { CANDY, startPad, finishPad, crossedFinish, strip, spawnGrid } from '../course-kit.js';

const PLANK_LEN = 12, PLANK_W = 6, ISLAND = 4, GAP = 0.5;
const MAX_TILT = 0.42, PUSH = 0.05, SPRING = 2.2, DAMP = 1.6;
const FINISH_Z = -(4 * (PLANK_LEN + GAP) + 3 * (ISLAND + GAP)) - GAP;

// tilt = last host angle, extrapolated by its spin so guests see smooth motion between snapshots
const tiltMove = (t, c) => ({ ...c.base, tilt: Math.max(-MAX_TILT, Math.min(MAX_TILT, c.angle + c.omega * (t - c.angleT))) });

export default {
  id: 'tilt-bridges', title: 'Tilt Bridges', emoji: '⚖️', kind: 'race', duration: 150,
  goal: 'Long planks over the void tip toward the crowd. Spread out, keep to the high side, and keep moving.',
  theme: { sky: [0x7ad0d8, 0xfff2c0], fog: 0xd0f0f0 },
  build(seed) {
    const rng = mulberry32(seed);
    const cols = [...startPad({ z0: 0, width: 16 })];
    const planks = [], checkpoints = [{ x: 0, y: 0, z: 5, w: 10 }], path = [];
    let z = -GAP;
    for (let i = 0; i < 4; i++) {
      const x = i % 2 ? -1.5 : 1.5, zc = z - PLANK_LEN / 2;
      planks.push(cols.length);
      cols.push(box({ x, y: -0.3, z: zc, yaw: Math.PI / 2, hx: PLANK_LEN / 2, hy: 0.3, hz: PLANK_W / 2, color: i % 2 ? CANDY.floorAlt : CANDY.floor, move: tiltMove, angle: (rng() - 0.5) * 0.2, omega: 0, angleT: 0 }));
      cols.push(cyl({ x, y: -1.2, z: zc, r: 0.5, hy: 0.6, tag: 'goal', color: CANDY.post }));
      path.push({ x, z: zc + 3, w: 3 }, { x, z: zc - 3, w: 3 });
      z -= PLANK_LEN + GAP;
      if (i < 3) {
        cols.push(...strip({ zStart: z, length: ISLAND, width: 8, color: CANDY.pad }));
        checkpoints.push({ x: 0, y: 0, z: z - ISLAND / 2, w: 5 });
        path.push({ x: 0, z: z - ISLAND / 2, w: 4 });
        z -= ISLAND + GAP;
      }
    }
    cols.push(...finishPad({ z0: FINISH_Z }));
    path.push({ x: 0, z: FINISH_Z - 4, w: 8 });
    return createCourse({ cols, planks, killY: -10, finishZ: FINISH_Z - 1, finished: crossedFinish(FINISH_Z, 0), spawn: spawnGrid({ zFront: 0, width: 14 }), checkpoints, path });
  },
  // Rules > each plank is a damped spring; beans standing off-centre push their side down
  tick(sim) {
    for (const i of sim.course.planks) {
      const c = sim.course.cols[i];
      let torque = 0;
      for (const b of sim.active) if (b.gnd === i) torque += b.x - c.base.x;
      const angle = c.angle + c.omega * (sim.clock - c.angleT);
      c.omega += (torque * PUSH - angle * SPRING - c.omega * DAMP) * DT;
      c.angle = Math.max(-MAX_TILT, Math.min(MAX_TILT, angle));
      if (Math.abs(c.angle) === MAX_TILT) c.omega = 0;
      c.angleT = sim.clock;
    }
  },
  pack: (sim) => sim.course.planks.flatMap((i) => [Math.round(sim.course.cols[i].angle * 1000) / 1000, Math.round(sim.course.cols[i].omega * 1000) / 1000]),
  unpack(sim, d) {
    sim.course.planks.forEach((i, k) => Object.assign(sim.course.cols[i], { angle: d[k * 2], omega: d[k * 2 + 1], angleT: sim.clock }));
  },
};
