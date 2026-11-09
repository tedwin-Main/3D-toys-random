// Builds Egg Haul team round: carry eggs into your team nest, steal from rival nests; the lowest team is out.

import { box, createCourse, DT } from '../course-colliders.js';
import { CANDY } from '../course-kit.js';
import { steerTo, wander } from '../bean-bots.js';
import { respawn, ACTIVE } from '../round-sim.js';
import { STUMBLE } from '../bean-physics.js';

const HALF = 15, NEST_R = 2.8, NEST_RING = 10.5, PICK_RANGE = 1.5, CARRY_SLOW = 0.75, PICK_COOL = 0.8;
export const TEAM_COLORS = [0xff5a6e, 0x3fa9ff, 0xffc93c, 0x5ad66f];
const teamCount = (n) => (n <= 9 ? 2 : n <= 20 ? 3 : 4);
const nestOf = (team, teams) => { const a = (team / teams) * Math.PI * 2 + Math.PI / 4; return { x: Math.sin(a) * NEST_RING, z: Math.cos(a) * NEST_RING }; };

export default {
  id: 'egg-haul', title: 'Egg Haul', emoji: '🥚', kind: 'team', duration: 90,
  goal: 'Teams race to stack eggs in their nest. Grab an egg, run it home, raid rival nests. Fewest eggs loses.',
  theme: { sky: [0x9be7ff, 0xfff4c4], fog: 0xe4f6ff },
  build(seed, n) {
    const teams = teamCount(n);
    const cols = [box({ x: 0, y: -0.5, z: 0, hx: HALF, hy: 0.5, hz: HALF, color: CANDY.floor })];
    for (const [sx, sz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      cols.push(box({ x: sx * (HALF + 0.3), y: 0.7, z: sz * (HALF + 0.3), hx: sx ? 0.3 : HALF + 0.6, hy: 0.7, hz: sz ? 0.3 : HALF + 0.6, tag: 'wall', color: CANDY.rail }));
    }
    const nests = Array.from({ length: teams }, (_, k) => nestOf(k, teams));
    return createCourse({ cols, teams, nests, killY: -8, spawn: (i, total) => teamSpawn(i, total, teams), checkpoints: [{ x: 0, y: 0, z: 0, w: 6 }], view: { arena: HALF, nests: nests.map((p, k) => ({ ...p, r: NEST_R, color: TEAM_COLORS[k] })) } });
  },
  start(sim) {
    const { teams } = sim.course;
    // team follows the start slot so each bean spawns at its own nest
    sim.list.forEach((b) => (b.team = b.slot % teams));
    const count = teams * 3 + 2;
    sim.data.eggs = Array.from({ length: count }, (_, k) => { const a = k * 2.4, r = 0.6 + (k % 4) * 0.7; return { x: Math.sin(a) * r, z: Math.cos(a) * r, carrier: 0, nest: -1 }; });
  },
  tick(sim) {
    for (const b of sim.active) b.pickCool = Math.max(0, (b.pickCool ?? 0) - DT);
    moveEggs(sim);
  },
  slow(sim, b) { if (carriedBy(sim, b)) b.slow = Math.min(b.slow, CARRY_SLOW); },
  // Grab > pick up a loose or rival-nest egg in reach; otherwise normal bean grab (grabbed carriers drop their egg)
  grab(sim, b) {
    if (carriedBy(sim, b) || b.heldBy > 0 || b.pickCool > 0) return true; // held or just dropped: no instant re-pick
    const egg = nearestEgg(sim, b, (e) => !e.carrier && e.nest !== b.team, PICK_RANGE);
    if (!egg) return false;
    egg.carrier = b.id; egg.nest = -1;
    sim.emit('egg', b.id);
    return true;
  },
  fell: (sim, b) => respawn(sim, b),
  over: (sim) => sim.playTime >= sim.round.duration || sim.active.length === 0,
  // Rules > the team with the fewest nest eggs is out (ties broken by seeded coin)
  finish(sim) {
    const scores = teamScores(sim), order = scores.map((s, k) => [s, sim.rng(), k]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const loser = order[0][2];
    sim.data.scores = scores; sim.data.loser = loser;
    for (const b of sim.active) (b.team === loser ? sim.eliminate : sim.qualify)(b);
  },
  // eggs as [x dm, z dm, carrier, nest]; a carried egg is drawn on its carrier, so its spot goes as 0, 0
  pack: (sim) => sim.data.eggs.flatMap((e) => (e.carrier ? [0, 0, e.carrier, e.nest] : [Math.round(e.x * 10), Math.round(e.z * 10), 0, e.nest])),
  unpack(sim, d) {
    sim.data.eggs = [];
    for (let k = 0; k < d.length; k += 4) sim.data.eggs.push({ x: d[k] / 10, z: d[k + 1] / 10, carrier: d[k + 2], nest: d[k + 3] });
  },
  packBean: (b) => b.team ?? 0,
  unpackBean(b, v) { b.team = v; },
  // Bots > carry home; one in four guards the nest; others take loose eggs, then raid the leading rival nest
  bot(sim, b) {
    const nest = sim.course.nests[b.team];
    if (carriedBy(sim, b)) { steerTo(b, nest.x, nest.z); return true; }
    const thief = nearestCarrier(sim, b, b.id % 4 === 0 ? 12 : 4);
    if (thief) { steerTo(b, thief.x + thief.vx * 0.2, thief.z + thief.vz * 0.2); b.grab = Math.hypot(thief.x - b.x, thief.z - b.z) < 1.4; return true; }
    const egg = targetEgg(sim, b);
    if (!egg) { wander(sim, b, 4, nest.x, nest.z); return true; }
    steerTo(b, egg.x, egg.z);
    b.grab = Math.hypot(egg.x - b.x, egg.z - b.z) < PICK_RANGE - 0.2;
    return true;
  },
};

export const eggsOf = (sim) => sim.data.eggs ?? [];
export function teamScores(sim) {
  const scores = new Array(sim.course.teams).fill(0);
  for (const e of eggsOf(sim)) if (!e.carrier && e.nest >= 0) scores[e.nest]++;
  return scores;
}

function teamSpawn(i, n, teams) {
  const team = i % teams, nest = nestOf(team, teams), k = Math.floor(i / teams);
  const a = k * 1.3;
  return { x: nest.x * 0.75 + Math.sin(a) * 1.4, y: 0, z: nest.z * 0.75 + Math.cos(a) * 1.4, face: Math.atan2(-nest.x, -nest.z) };
}

const carriedBy = (sim, b) => eggsOf(sim).find((e) => e.carrier === b.id);

function nestAt(sim, x, z) {
  return sim.course.nests.findIndex((p) => Math.hypot(p.x - x, p.z - z) < NEST_R);
}

// Rules > eggs ride carriers; knocked, grabbed or gone carriers drop them; walking into own nest drops it there
function moveEggs(sim) {
  for (const e of eggsOf(sim)) {
    if (!e.carrier) continue;
    const c = sim.beans.get(e.carrier);
    const drop = !c || c.status !== ACTIVE || c.mode === STUMBLE || c.heldBy > 0;
    if (c) { e.x = Math.max(-HALF + 0.5, Math.min(HALF - 0.5, c.x)); e.z = Math.max(-HALF + 0.5, Math.min(HALF - 0.5, c.z)); }
    const home = c && nestAt(sim, e.x, e.z) === c.team;
    if (drop && c) c.pickCool = PICK_COOL;
    if (drop || home) { e.carrier = 0; e.nest = nestAt(sim, e.x, e.z); sim.emit('drop', c?.id ?? 0, e.nest); }
  }
}

function nearestEgg(sim, b, ok, range = Infinity) {
  let best = null, bd = range;
  for (const e of eggsOf(sim)) { const d = Math.hypot(e.x - b.x, e.z - b.z); if (ok(e) && d < bd) { bd = d; best = e; } }
  return best;
}

// loose eggs first; else raid the rival nest holding the most
function targetEgg(sim, b) {
  const loose = nearestEgg(sim, b, (e) => !e.carrier && e.nest < 0);
  if (loose) return loose;
  const scores = teamScores(sim);
  let rival = -1;
  scores.forEach((s, k) => { if (k !== b.team && s > 0 && (rival < 0 || s > scores[rival])) rival = k; });
  return rival < 0 ? null : nearestEgg(sim, b, (e) => !e.carrier && e.nest === rival);
}

// rival carrying an egg within range (guards look further)
function nearestCarrier(sim, b, range) {
  let best = null, bd = range;
  for (const e of eggsOf(sim)) {
    const c = e.carrier && sim.beans.get(e.carrier);
    if (!c || c.team === b.team) continue;
    const d = Math.hypot(c.x - b.x, c.z - b.z);
    if (d < bd) { bd = d; best = c; }
  }
  return best;
}
