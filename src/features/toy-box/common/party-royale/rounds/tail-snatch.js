// Builds Tail Snatch hunt: grab a tail from another bean; whoever holds a tail when the timer ends goes through.

import { box, cyl, createCourse, DT } from '../course-colliders.js';
import { CANDY } from '../course-kit.js';
import { steerTo, wander } from '../bean-bots.js';
import { respawn, findGrabTarget } from '../round-sim.js';

const HALF = 14, STEAL_RANGE = 1.4, IMMUNE = 2, STEAL_COOL = 1;
const PILLARS = [[-6, -6], [6, -6], [-6, 6], [6, 6]];

export default {
  id: 'tail-snatch', title: 'Tail Snatch', emoji: '🦊', kind: 'hunt', duration: 60,
  goal: 'Hold a tail when the clock runs out. No tail? Chase one down and press Grab to steal it.',
  theme: { sky: [0xffa8c8, 0xfff2b0], fog: 0xffe0ec },
  build() {
    const cols = [box({ x: 0, y: -0.5, z: 0, hx: HALF, hy: 0.5, hz: HALF, color: CANDY.floor })];
    for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      cols.push(box({ x: sx * (HALF + 0.3), y: 0.7, z: sz * (HALF + 0.3), hx: sx ? 0.3 : HALF + 0.6, hy: 0.7, hz: sz ? 0.3 : HALF + 0.6, tag: 'wall', color: CANDY.rail }));
    }
    for (const [x, z] of PILLARS) cols.push(cyl({ x, y: 1, z, r: 1.2, hy: 1, tag: 'wall', color: CANDY.post }));
    cols.push(box({ x: 0, y: 0.6, z: 0, hx: 3, hy: 0.6, hz: 0.4, tag: 'wall', color: CANDY.floorAlt }), box({ x: 0, y: 0.6, z: 0, hx: 0.4, hy: 0.6, hz: 3, tag: 'wall', color: CANDY.floorAlt }));
    return createCourse({ cols, killY: -8, spawn: ringSpawnSquare, checkpoints: [{ x: 0, y: 0, z: 8, w: 10 }], view: { arena: HALF } });
  },
  start(sim) {
    const order = [...sim.list].sort(() => sim.rng() - 0.5);
    order.forEach((b, i) => Object.assign(b, { tail: i < sim.keep, immune: 0, stealCool: 0 }));
  },
  tick(sim) {
    for (const b of sim.active) { b.immune = Math.max(0, b.immune - DT); b.stealCool = Math.max(0, b.stealCool - DT); }
  },
  // Grab > a bean without a tail steals one in reach; holders keep the normal bean grab
  grab(sim, b) {
    if (b.tail) return false;
    if (b.stealCool > 0) return true;
    const t = findGrabTarget(sim.active.filter((o) => o.tail && o.immune <= 0), b, STEAL_RANGE);
    if (t) {
      t.tail = false; t.stealCool = STEAL_COOL;
      b.tail = true; b.immune = IMMUNE;
      sim.emit('tail', b.id, t.id);
    }
    return true;
  },
  fell: (sim, b) => respawn(sim, b),
  over: (sim) => sim.playTime >= sim.round.duration || sim.active.length === 0,
  finish(sim) { for (const b of sim.active) (b.tail ? sim.qualify : sim.eliminate)(b); },
  packBean: (b) => (b.tail ? 1 : 0) | (b.immune > 0 ? 2 : 0),
  unpackBean(b, v) { b.tail = !!(v & 1); b.immune = v & 2 ? 1 : 0; },
  // Bots > holders run from the nearest chaser and juke; chasers cut toward the nearest stealable tail
  bot(sim, b) {
    if (b.tail) flee(sim, b);
    else chase(sim, b);
    return true;
  },
};

function ringSpawnSquare(i, n) {
  const a = (i / n) * Math.PI * 2, r = HALF * (i % 2 ? 0.55 : 0.8);
  return { x: Math.sin(a) * r, y: 0, z: Math.cos(a) * r, face: a + Math.PI };
}

function nearest(b, list) {
  let best = null, bd = Infinity;
  for (const o of list) { const d = Math.hypot(o.x - b.x, o.z - b.z); if (o !== b && d < bd) { bd = d; best = o; } }
  return best && { bean: best, d: bd };
}

function flee(sim, b) {
  const br = b.brain, threat = nearest(b, sim.active.filter((o) => !o.tail));
  if (!threat || threat.d > 6 + b.skill * 3) { wander(sim, b, HALF * 0.6); return; }
  br.jukeT = (br.jukeT ?? 0) - DT;
  if (br.jukeT <= 0) { br.juke = sim.rng() < 0.5 ? -1 : 1; br.jukeT = 0.5 + sim.rng() * 0.8; }
  const { bean: o, d } = threat, ax = (b.x - o.x) / d, az = (b.z - o.z) / d;
  // away + sideways juke, pulled back toward the middle near the rails
  let tx = b.x + (ax + az * br.juke * 0.6) * 4, tz = b.z + (az - ax * br.juke * 0.6) * 4;
  const lim = HALF - 2.5;
  if (Math.abs(tx) > lim || Math.abs(tz) > lim) { tx *= 0.4; tz *= 0.4; }
  steerTo(b, tx, tz, 0.8 + b.skill * 0.2);
}

function chase(sim, b) {
  const prey = nearest(b, sim.active.filter((o) => o.tail && o.immune <= 0));
  if (!prey) { wander(sim, b, HALF * 0.6); return; }
  const { bean: o, d } = prey, lead = Math.min(0.5, d / 12);
  steerTo(b, o.x + o.vx * lead, o.z + o.vz * lead);
  b.grab = d < STEAL_RANGE + 0.3;
}
