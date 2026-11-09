// Runs one party royale round on host: phases, qualify / eliminate rules, grabs, bots.

import { DT, mulberry32 } from './course-colliders.js';
import { newBean, stepBean, bumpBeans, stumble, RUN, STUMBLE } from './bean-physics.js';
import { botInput } from './bean-bots.js';

export const INTRO = 4; // seconds of frozen countdown before play
export const ACTIVE = 'in', QUALIFIED = 'q', OUT = 'out';
const GRAB_RANGE = 1.3, GRAB_BREAK = 2.4, GRAB_MAX = 3;

/**
 * round: module from rounds/*.js; seed: course seed; roster: [{ id, nick, color, bot }]; keep: beans that advance.
 * Round hooks (all optional): start, tick, fell, grab, over, finish, bot, slow
 */
export function createRoundSim({ round, seed, roster, keep }) {
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const course = round.build(seed, roster.length);
  // active list rebuilt once per tick (or after a status change): bots and round rules read it many times a tick
  let activeCache = null, activeTick = -1;
  const sim = {
    round, seed, course, rng, keep: Math.max(1, Math.min(keep, roster.length)),
    clock: 0, tick: 0, phase: 'intro', beans: new Map(), list: [], events: [],
    qualified: [], out: [], result: null, data: {},
    get playTime() { return Math.max(0, sim.clock - INTRO); },
    get active() {
      if (activeCache && activeTick === sim.tick) return activeCache;
      activeTick = sim.tick;
      return (activeCache = sim.list.filter((b) => b.status === ACTIVE));
    },
    emit(...e) { sim.events.push(e); },
    qualify(b) { if (b.status !== ACTIVE) return; b.status = QUALIFIED; activeCache = null; sim.qualified.push(b.id); sim.emit('q', b.id, sim.qualified.length); },
    eliminate(b) { if (b.status !== ACTIVE) return; b.status = OUT; activeCache = null; b.outTick = sim.tick; sim.out.push(b.id); sim.emit('o', b.id); },
    step: () => stepRound(sim),
  };
  const slots = spawnOrder(seed, roster.length);
  roster.forEach((r, i) => {
    const b = newBean(r.id, { nick: r.nick, color: r.color, bot: !!r.bot, status: ACTIVE, cp: 0, holding: null, heldBy: 0, holdT: 0, skill: 0.65 + rng() * 0.3, brain: {}, slot: slots[i] });
    placeAtSpawn(b, course.spawn(slots[i], roster.length));
    sim.beans.set(b.id, b); sim.list.push(b);
  });
  course.update(0);
  round.start?.(sim);
  return sim;
}

// seeded shuffle of start slots (own stream, same on host and guests): join order never decides the front row
export function spawnOrder(seed, n) {
  const r = mulberry32(seed ^ 0x5bd1e995), slots = [...Array(n).keys()];
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  return slots;
}

function placeAtSpawn(b, pose) {
  Object.assign(b, { x: pose.x, y: pose.y, z: pose.z, face: pose.face ?? Math.PI, vx: 0, vy: 0, vz: 0, mode: RUN, mt: 0, gnd: -1, fell: false });
}

// Run engine > one host tick: bots think, grabs, every active bean steps, round rules judge
function stepRound(sim) {
  const { course, round } = sim;
  sim.tick++; sim.clock = sim.tick * DT;
  course.update(sim.clock);
  if (sim.phase === 'end') return;
  const live = sim.active, frozen = sim.phase === 'intro';
  for (const b of live) {
    if (b.bot && !frozen) botInput(sim, b);
    b.slow = 1;
  }
  if (!frozen) applyGrabs(sim, live);
  for (const b of live) {
    if (frozen) { b.mx = b.mz = 0; b.lastJump = b.jumpSeq; b.lastDive = b.diveSeq; }
    round.slow?.(sim, b);
    stepBean(b, course, sim.emit);
  }
  bumpBeans(live, sim.emit);
  for (const b of live) judgeBean(sim, b);
  if (frozen) { if (sim.clock >= INTRO) { sim.phase = 'play'; sim.emit('go'); } return; }
  round.tick?.(sim);
  if (isOver(sim)) endRound(sim);
}

// Rules > falls, checkpoints, finish line
function judgeBean(sim, b) {
  const { course, round } = sim;
  if (b.fell) {
    b.fell = false;
    if (round.fell) round.fell(sim, b);
    else if (round.kind === 'race') respawn(sim, b);
    else sim.eliminate(b);
    return;
  }
  const cps = course.checkpoints ?? [];
  while (b.cp + 1 < cps.length && b.z <= cps[b.cp + 1].z && b.gnd >= 0) b.cp++;
  if (sim.phase === 'play' && course.finished?.(b)) sim.qualify(b);
}

export function respawn(sim, b) {
  const cp = sim.course.checkpoints?.[b.cp] ?? sim.course.spawn(0, 1);
  const w = cp.w ?? 4;
  placeAtSpawn(b, { x: cp.x + (sim.rng() - 0.5) * w, y: cp.y + 0.2, z: cp.z + (sim.rng() - 0.5) * 1.5, face: Math.PI });
  b.mode = STUMBLE; b.mt = 0.5; b.brain.bestZ = null;
  sim.emit('r', b.id);
}

// Grab > hold a bean in front: both slow down; round hook may take the grab first (tails, eggs, crown)
function applyGrabs(sim, live) {
  for (const b of live) {
    if (!b.grab || b.mode !== RUN || sim.round.grab?.(sim, b)) { release(b); continue; }
    if (b.holding == null) { b.holding = findGrabTarget(live, b)?.id ?? null; b.holdT = 0; }
    const t = b.holding != null && sim.beans.get(b.holding);
    b.holdT += DT;
    if (!t || t.status !== ACTIVE || Math.hypot(t.x - b.x, t.z - b.z) > GRAB_BREAK || b.holdT > GRAB_MAX) { release(b); continue; }
    t.heldBy = 2; b.slow = Math.min(b.slow, 0.6);
  }
  for (const b of live) if (b.heldBy > 0) { b.heldBy--; b.slow = Math.min(b.slow, 0.45); }
}
function release(b) { b.holding = null; b.holdT = 0; }

export function findGrabTarget(list, b, range = GRAB_RANGE) {
  let best = null, bd = range;
  const fx = Math.sin(b.face), fz = Math.cos(b.face);
  for (const o of list) {
    if (o === b || o.status !== ACTIVE || Math.abs(o.y - b.y) > 1.4) continue;
    const dx = o.x - b.x, dz = o.z - b.z, d = Math.hypot(dx, dz);
    if (d < bd && (dx * fx + dz * fz) / (d || 1) > 0.2) { bd = d; best = o; }
  }
  return best;
}

// Rules > round over: race quota filled, survivors down to quota, timer, or round hook
function isOver(sim) {
  const { round } = sim;
  if (round.over) return round.over(sim);
  const left = sim.active.length;
  if (left === 0) return true;
  if (sim.playTime >= round.duration) return true;
  if (round.kind === 'race') return sim.qualified.length >= sim.keep;
  return left <= sim.keep;
}

function endRound(sim) {
  if (sim.round.finish) sim.round.finish(sim);
  else if (sim.round.kind === 'race') for (const b of sim.active) sim.eliminate(b);
  else for (const b of sim.active) sim.qualify(b);
  if (!sim.qualified.length) reviveLastFallers(sim);
  sim.phase = 'end';
  sim.result = { qualified: [...sim.qualified], out: [...sim.out] };
  sim.emit('end');
}

// nobody left standing: beans that went out within the last second share the qualify (a show never ends empty)
const TIE_WINDOW = 60;
function reviveLastFallers(sim) {
  const last = Math.max(...sim.list.map((b) => b.outTick ?? -Infinity));
  for (const b of sim.list) {
    if (b.outTick == null || b.outTick < last - TIE_WINDOW) continue;
    sim.out.splice(sim.out.indexOf(b.id), 1);
    b.status = ACTIVE; sim.qualify(b);
  }
}

// knock helper for round hooks (cannon balls, tail steals): stumble + fling
export function fling(sim, b, vx, vy, vz, len = 0.8) {
  b.vx = vx; b.vy = vy; b.vz = vz;
  stumble(b, len, sim.emit);
}
