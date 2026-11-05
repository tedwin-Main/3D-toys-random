// Builds Gate Gamble race: rows of identical gates, some burst open when touched, others are solid.

import { box, createCourse, mulberry32, BEAN_R } from '../course-colliders.js';
import { CANDY, startPad, finishPad, crossedFinish, strip, spawnGrid } from '../course-kit.js';
import { steerTo, reactWhenReady } from '../bean-bots.js';
import { ACTIVE } from '../round-sim.js';

const ROW_Z = [-10, -21, -32, -43, -54, -65, -76], OPEN_PER_ROW = [5, 5, 4, 4, 3, 3, 2], GATES = 7, GATE_W = 3;
const FINISH_Z = -88, WIDTH = GATES * GATE_W;

export default {
  id: 'gate-gamble', title: 'Gate Gamble', emoji: '🚪', kind: 'race', duration: 120,
  goal: 'Seven rows of gates. Some burst open, some are solid walls. Guess fast or follow the crowd.',
  theme: { sky: [0x8fd3ff, 0xfff0c8], fog: 0xe0f0ff },
  build(seed) {
    const rng = mulberry32(seed);
    const cols = [...startPad({ z0: 0, width: WIDTH }), ...strip({ zStart: 0, length: -FINISH_Z, width: WIDTH, rails: 2.5 })];
    const rows = ROW_Z.map((z, r) => gateRow(cols, rng, z, OPEN_PER_ROW[r]));
    cols.push(...finishPad({ z0: FINISH_Z, width: WIDTH }));
    return createCourse({
      cols, rows, killY: -10, finishZ: FINISH_Z - 1, finished: crossedFinish(FINISH_Z, 0),
      spawn: spawnGrid({ zFront: 0, width: WIDTH - 3 }),
      checkpoints: [{ x: 0, y: 0, z: 5, w: 14 }],
    });
  },
  // Rules > a bean touching a breakable gate bursts it for everyone
  tick(sim) { burstTouched(sim.course, sim.active, (g) => sim.emit('gate', g)); },
  // guest prediction bursts it locally too, so the own bean runs through without waiting a round trip
  predict(course, b) { burstTouched(course, [b]); },
  pack: (sim) => sim.course.rows.map((r) => r.gates.map((g) => (sim.course.cols[g].off ? 1 : 0)).join('')).join(''),
  unpack(sim, s) {
    let k = 0;
    for (const r of sim.course.rows) for (const g of r.gates) sim.course.cols[g].off = s[k++] === '1';
  },
  // Bots > per row: open gate nearest, else an untried one; remember solid gates they bounced off
  bot(sim, b) {
    const { rows, cols } = sim.course, br = b.brain;
    const r = rows.findIndex((row) => row.z < b.z - 0.4);
    if (r < 0) { steerTo(b, b.x * 0.5, FINISH_Z - 4); return true; }
    const row = rows[r];
    br.solid ??= new Set();
    let pick = br.pick?.[0] === r ? br.pick[1] : null;
    if (pick == null || br.solid.has(pick) || (!cols[pick].off && row.gates.some((g) => cols[g].off) && sim.rng() < 0.02)) {
      pick = choose(sim, b, row, br.solid); br.pick = [r, pick]; br.waitT = 0;
    }
    const gate = cols[pick], dx = gate.base.x - b.x, dz = row.z - b.z;
    if (Math.abs(dx) > 0.7 && dz > -2.2) steerTo(b, gate.base.x, row.z + 1.6);
    else steerTo(b, gate.base.x, row.z - 2);
    if (!gate.off && dz > -1.1 && Math.abs(dx) < 1.2) {
      br.waitT = (br.waitT ?? 0) + 1 / 60;
      if (br.waitT > 0.35) br.solid.add(pick);
    }
    reactWhenReady(sim, b);
    return true;
  },
};

// one row: 7 gates between posts, OPEN of them breakable (seeded)
function gateRow(cols, rng, z, open) {
  const order = [...Array(GATES).keys()].sort(() => rng() - 0.5), breakable = new Set(order.slice(0, open));
  const gates = [];
  for (let i = 0; i < GATES; i++) {
    const x = (i - (GATES - 1) / 2) * GATE_W;
    gates.push(cols.length);
    cols.push(box({ x, y: 1.6, z, hx: GATE_W / 2 - 0.15, hy: 1.6, hz: 0.25, tag: 'wall', color: CANDY.floorAlt, breakable: breakable.has(i), gate: true }));
    cols.push(box({ x: x + GATE_W / 2, y: 1.9, z, hx: 0.15, hy: 1.9, hz: 0.35, tag: 'wall', color: CANDY.post }));
  }
  return { z, gates };
}

function burstTouched(course, beans, onBurst = () => {}) {
  for (const row of course.rows) for (const g of row.gates) {
    const c = course.cols[g];
    if (!c.off && c.breakable && beans.some((b) => touchesGate(b, c))) { c.off = true; onBurst(g); }
  }
}

function touchesGate(b, c) {
  return b.status === ACTIVE && Math.abs(b.z - c.base.z) < c.hz + BEAN_R + 0.08 && Math.abs(b.x - c.base.x) < c.hx && b.y < c.base.y + c.hy;
}

// prefer open gates close by, then untried closed ones (seen-solid excluded)
function choose(sim, b, row, solid) {
  const { cols } = sim.course;
  let best = null, bs = -Infinity;
  for (const g of row.gates) {
    if (solid.has(g)) continue;
    const c = cols[g], d = Math.abs(c.base.x - b.x);
    const score = (c.off ? 6 : 0) - d * 0.35 + sim.rng() * 3;
    if (score > bs) { bs = score; best = g; }
  }
  return best ?? row.gates[0];
}
