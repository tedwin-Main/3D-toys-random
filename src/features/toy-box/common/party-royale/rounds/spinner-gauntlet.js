// Builds Spinner Gauntlet race: sweeper bars, swinging hammers, spinning discs, side rams, ramp to finish.

import { box, cyl, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, startPad, finishPad, crossedFinish, strip, ramp, spawnGrid, spinMove, slideMove } from '../course-kit.js';

const FINISH_Z = -112, FINISH_Y = 2;

export default {
  id: 'spinner-gauntlet', title: 'Spinner Gauntlet', emoji: '🌀', kind: 'race', duration: 150,
  goal: 'Hop the sweepers, dodge the hammers, ride the discs. Finish before the spots fill.',
  theme: { sky: [0x7fc8ff, 0xffd6f0], fog: 0xcfe6ff },
  build(seed) {
    const rng = mulberry32(seed);
    const cols = [
      ...startPad({ z0: 0, width: 18 }),
      ...sweeperField(rng, 0),
      ...strip({ zStart: -28, length: 6, width: 10, color: CANDY.pad }),
      ...hammerBridge(rng, -34),
      ...strip({ zStart: -54, length: 6, width: 10, color: CANDY.pad }),
      ...discHops(rng, -60),
      ...strip({ zStart: -87, length: 5, width: 10, color: CANDY.pad }),
      ...ramBridge(rng, -92),
      ...finishPad({ z0: FINISH_Z, y: FINISH_Y }),
    ];
    return createCourse({
      cols, killY: -10, finishZ: FINISH_Z - 1, finished: crossedFinish(FINISH_Z, FINISH_Y),
      spawn: spawnGrid({ zFront: 0, width: 16 }),
      checkpoints: [{ x: 0, y: 0, z: 6, w: 12 }, { x: 0, y: 0, z: -31, w: 7 }, { x: 0, y: 0, z: -57, w: 7 }, { x: 0, y: 0, z: -89.5, w: 7 }],
      path: [
        { x: 0, z: -4, w: 12 }, { x: 0, z: -12, w: 12 }, { x: 0, z: -20, w: 12 }, { x: 0, z: -27, w: 8 },
        { x: 0, z: -40, w: 2.5 }, { x: 0, z: -48, w: 2.5 }, { x: 0, z: -55, w: 6 },
        ...discPath, { x: 0, z: -88, w: 6 }, { x: 0, z: -100, w: 4 }, { x: 0, z: -108, w: 4 }, { x: 0, z: FINISH_Z - 4, w: 10 },
      ],
    });
  },
};

// Section > wide floor with three low sweeper bars (jump them); hubs alternate spin direction
function sweeperField(rng, z0) {
  const out = strip({ zStart: z0, length: 28, width: 16, rails: 1.2 });
  [-7, -15, -23].forEach((dz, i) => {
    const spin = (i % 2 ? -1 : 1) * (1.1 + rng() * 0.4), phase = rng() * Math.PI;
    out.push(cyl({ x: 0, y: 0.7, z: z0 + dz, r: 0.6, hy: 0.7, color: CANDY.post, tag: 'wall' }));
    out.push(box({ x: 0, y: 0.45, z: z0 + dz, hx: 7.7, hy: 0.28, hz: 0.28, tag: 'hit', color: CANDY.hit, move: spinMove(spin, phase) }));
  });
  return out;
}

// Section > narrow bridge over the void, hammers swing across it (wait for the gap)
function hammerBridge(rng, z0) {
  const out = strip({ zStart: z0, length: 20, width: 4.5 });
  [-4, -10, -16].forEach((dz) => {
    out.push(box({ x: 0, y: 1.1, z: z0 + dz, hx: 1.1, hy: 1.1, hz: 0.7, tag: 'hit', color: CANDY.move, move: slideMove('x', 4.2, 1.6 + rng() * 0.5, rng() * 6.28) }));
  });
  return out;
}

// Section > three spinning discs over the void, centre post on each (go round it)
const DISCS = [[-1.5, -64], [1.5, -73], [-1.2, -82]];
const discPath = DISCS.map(([x, z], i) => ({ x: x + (i % 2 ? -2 : 2), z, w: 2 }));
function discHops(rng, z0) {
  const out = [];
  DISCS.forEach(([x, z], i) => {
    const spin = (i % 2 ? -1 : 1) * (0.6 + rng() * 0.3);
    out.push(cyl({ x, y: -0.3, z, r: 4.2, hy: 0.3, color: i % 2 ? CANDY.floorAlt : CANDY.floor, move: spinMove(spin) }));
    out.push(cyl({ x, y: 0.6, z, r: 0.7, hy: 0.6, tag: 'wall', color: CANDY.bounce }));
  });
  return out;
}

// Section > bridge with side rams punching across, then a ramp up to the finish pad
function ramBridge(rng, z0) {
  const out = strip({ zStart: z0, length: 10, width: 7 });
  [-2.5, -7.5].forEach((dz, i) => {
    const side = i % 2 ? 1 : -1, w = 1.8 + rng() * 0.4, phase = rng() * 6.28;
    out.push(box({ x: side * 6.2, y: 0.9, z: z0 + dz, hx: 2.5, hy: 0.9, hz: 1, tag: 'hit', color: CANDY.hit,
      move: (t, c) => ({ ...c.base, x: c.base.x - side * 3.6 * Math.max(0, Math.sin(w * t + phase)) ** 3 }) }));
  });
  out.push(ramp({ zStart: z0 - 10, length: 10, width: 7, y0: 0, y1: FINISH_Y }));
  return out;
}
