// Runs Putt Party rules (honor order, one putt at a time, shot clock, ball knocks, water, stroke cap, scorecard, bots) with no rendering, for page attract mode and the relay server host.

import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';
import { HOLES, R, SLOPE, clamp, parseHole, physStep, tileUnder } from './golf-course.js';
import { createShotPlan, puttSpeed, PLAN_CANDIDATES } from './golf-shot-plan.js';

export const STEP = 1 / 60;
export const MAX_GOLFERS = 14;
const MAX_STROKES = 6, MAX_ROLL = 15, TURN_GAP = 0.6, DEFAULT_CLOCK = 20, ATTRACT_BOTS = 6;
// bot putt search is spread over the last moments of its think time, so one shot never stalls the relay tick
const PLANS_PER_STEP = 6, PLAN_LEAD = (PLAN_CANDIDATES / PLANS_PER_STEP) * STEP + 0.05;
const TEE_OFFSETS = [[-0.45, -0.45], [0.45, 0.45], [0.45, -0.45], [-0.45, 0.45]];
const BOT_NAMES = ['Birdie', 'Bogey Bob', 'Chip', 'Eagle Eye', 'Fore!', 'Gimme', 'Hacker', 'Lumpy', 'Mulligan', 'Putty', 'Sandy', 'Tee-Rex', 'Albatross', 'Shank'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const AT_REST = { vx: 0, vz: 0 };
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

export const totalStrokes = (ball) => ball.scores.reduce((sum, strokes) => sum + (strokes ?? 0), 0);

/**
 * onEnd(): final scorecard ran out (match over).
 * world.turn: whose putt it is; rolling: that putt is still moving; tt: shot clock (or gap before the next turn); order: tee-off order; last: previous putter
 * sim.events since the last drain: k putt, w wall, x ball knock, b bumper, s splash, c cupped, m picked up, t turn, o shot clock ran out
 */
export function createGolfSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'intro', t: 2.5, hole: 0, ht: 0, balls: new Map(), turn: null, rolling: false, roll: 0, tt: 0, clock: DEFAULT_CLOCK, order: [], last: null };
  const names = createNameSync(), slowFields = createChangedOnly(), lastShotSeq = new Map();
  const sim = { world, events: [] };
  const emit = (...event) => sim.events.push(event);
  const everyBall = () => [...world.balls.values()];
  let hole = null, plan = null;

  // Game > World
  sim.addPlayer = (id, nick, color, bot) => {
    const ball = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, lastX: 0, lastZ: 0, strokes: 0, teed: false, holed: false, done: false, scores: [], botT: 1, skill: 0.72 + rng() * 0.22, wallCD: 0 };
    world.order.push(id);
    world.balls.set(id, ball);
    return ball;
  };
  sim.removePlayer = (id) => {
    // last putter leaving: hand "last" to the seat before them so rotation still reaches whoever sat next
    if (world.last === id) { const k = world.order.indexOf(id), n = world.order.length; world.last = n > 1 ? world.order[(k - 1 + n) % n] : null; }
    world.balls.delete(id);
    world.order = world.order.filter((other) => other !== id);
  };
  sim.clearPlayers = () => { world.balls.clear(); world.order = []; world.last = null; };

  // spread across tee tiles, up to 4 balls per tile
  function teeSpot(k) {
    const tiles = hole.starts.length, tile = hole.starts[k % tiles], offset = TEE_OFFSETS[Math.floor(k / tiles) % TEE_OFFSETS.length];
    return { x: tile.x + offset[0], z: tile.z + offset[1] };
  }
  function placeAt(ball, spot) { Object.assign(ball, AT_REST, { x: spot.x, z: spot.z, lastX: spot.x, lastZ: spot.z }); }

  // honor: best score on the last hole tees off first, ties keep previous order; hole 1 order is drawn by lot
  function honorOrder(i) {
    if (i === 0) return shuffleInPlace(world.order, rng);
    const prev = new Map(world.order.map((id, k) => [id, k])), lastScore = (id) => world.balls.get(id)?.scores[i - 1] ?? 99;
    return world.order.sort((a, b) => lastScore(a) - lastScore(b) || prev.get(a) - prev.get(b));
  }

  function loadHole(i) {
    honorOrder(i);
    hole = parseHole(i);
    Object.assign(world, { hole: i, ht: 0, phase: 'intro', t: world.mode === 'attract' ? 1 : 2.8, turn: null, last: null, rolling: false, tt: 0 });
    plan = null;
    world.order.forEach((id, k) => {
      const ball = world.balls.get(id);
      placeAt(ball, teeSpot(k));
      Object.assign(ball, { strokes: 0, teed: false, holed: false, done: false });
    });
  }

  function shoot(ball, angle, power) {
    if (!ball || ball.done || ball.id !== world.turn || world.rolling || world.phase !== 'play' || !Number.isFinite(angle) || !Number.isFinite(power)) return;
    const speed = puttSpeed(clamp(power, 0.03, 1));
    Object.assign(ball, { lastX: ball.x, lastZ: ball.z, vx: Math.sin(angle) * speed, vz: Math.cos(angle) * speed, strokes: ball.strokes + 1, teed: true });
    world.rolling = true; world.roll = 0;
    plan = null;
    emit('k', ball.id, +power.toFixed(2));
  }

  // Game > Turn order: strict rotation in honor order (tee-off included), holed balls skipped
  function nextUp() {
    const n = world.order.length, from = world.order.indexOf(world.last);
    for (let k = 1; k <= n; k++) {
      const ball = world.balls.get(world.order[(from + k + n) % n]);
      if (ball && !ball.done) return ball;
    }
    return null;
  }

  // minigolf stroke cap: not holed after 6 strokes scores 7
  function pickUp(ball) { ball.done = true; ball.scores[world.hole] = MAX_STROKES + 1; emit('m', ball.id); }

  // putt in flight: wait for every ball to stop (cap so a ball stuck on a slope can't stall the room)
  function awaitRest(dt) {
    world.roll += dt;
    const inPlay = everyBall().filter((ball) => !ball.done);
    if (inPlay.some((ball) => ball.vx || ball.vz) && world.roll < MAX_ROLL) return;
    world.rolling = false;
    for (const ball of inPlay) {
      Object.assign(ball, AT_REST, { lastX: ball.x, lastZ: ball.z });
      if (ball.strokes >= MAX_STROKES) pickUp(ball);
    }
    world.turn = null; world.tt = TURN_GAP;
  }

  function callNextTurn(dt) {
    world.turn = null;
    world.tt -= dt;
    if (world.tt > 0) return;
    const ball = nextUp();
    if (!ball) return;
    world.turn = world.last = ball.id; world.tt = world.clock;
    ball.botT = world.mode === 'attract' ? 0.5 + rng() * 0.6 : 0.9 + rng() * 1.4;
    plan = null;
    emit('t', ball.id);
  }

  // shot clock ran out: penalty stroke, then a weak putt is played for them so the ball still moves
  function playForIdle(ball) {
    ball.strokes++; ball.teed = true;
    emit('o', ball.id);
    if (ball.strokes < MAX_STROKES) return true;
    pickUp(ball);
    world.turn = null; world.tt = TURN_GAP;
    return false;
  }

  // bot think time or a human's shot clock runs down; the putt search fills its last moments
  function awaitPutt(ball, dt) {
    world.tt -= dt;
    if (ball.bot) ball.botT -= dt;
    const timeLeft = ball.bot ? ball.botT : world.tt;
    if (timeLeft > PLAN_LEAD) return;
    if (plan?.ball !== ball) plan = createShotPlan(hole, ball, world.ht + Math.max(0, timeLeft));
    plan.advance(PLANS_PER_STEP);
    if (timeLeft > 0 || (!ball.bot && !playForIdle(ball))) return;
    const shot = plan.pick(ball.bot ? ball.skill : 0, rng);
    shoot(ball, shot.a, shot.p);
  }

  function turns(dt) {
    if (world.rolling) return awaitRest(dt);
    const ball = world.balls.get(world.turn);
    if (!ball || ball.done) callNextTurn(dt);
    else awaitPutt(ball, dt);
  }

  // Run engine > hole sim: substeps, ball-ball hits, water resets, cup, stroke cap
  // only the putter pays the splash penalty; a knocked ball just goes back where it rested
  function splash(ball) {
    emit('s', ball.id, +ball.x.toFixed(1), +ball.z.toFixed(1));
    Object.assign(ball, AT_REST, { x: ball.lastX, z: ball.lastZ });
    if (ball.id === world.turn) ball.strokes++;
  }

  // knocked in by a rival: holed plus a tap-in stroke; an un-teed ball scores 2 (tee shot + tap-in), never a free ace
  function cup(ball) {
    const strokes = ball.id === world.turn ? Math.max(1, ball.strokes) : Math.max(ball.teed ? 0 : 2, ball.strokes + 1);
    Object.assign(ball, AT_REST, { holed: true, done: true, x: hole.cup.x, z: hole.cup.z, teed: true, strokes });
    ball.scores[world.hole] = strokes;
    emit('c', ball.id, strokes);
  }

  function rollBall(ball, dt) {
    if (ball.done || (!ball.vx && !ball.vz && !SLOPE[tileUnder(hole, ball)])) return;
    const result = physStep(hole, ball, dt, world.ht);
    ball.wallCD -= dt;
    if (ball._wall > 1.2 && ball.wallCD <= 0) { ball.wallCD = 0.08; emit('w', ball.id, +Math.min(ball._wall / 8, 1).toFixed(2)); }
    if (ball._bump >= 0) emit('b', ball.id, ball._bump);
    if (result === 's') splash(ball);
    else if (result === 'c') cup(ball);
  }

  function knock(a, b) {
    if (a.done || b.done) return;
    const dx = b.x - a.x, dz = b.z - a.z, gap = Math.hypot(dx, dz);
    if (gap >= 2 * R || gap < 1e-6) return;
    const nx = dx / gap, nz = dz / gap, overlap = (2 * R - gap) / 2;
    a.x -= nx * overlap; a.z -= nz * overlap; b.x += nx * overlap; b.z += nz * overlap;
    const closing = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
    if (closing >= 0) return;
    const impulse = -closing * 0.95;
    a.vx -= nx * impulse; a.vz -= nz * impulse; b.vx += nx * impulse; b.vz += nz * impulse;
    if (-closing > 0.8) emit('x', a.id);
  }

  function simBalls(dt) {
    const inPlay = everyBall().filter((ball) => !ball.done);
    for (let sub = 0; sub < 2; sub++) {
      world.ht += dt / 2;
      for (const ball of inPlay) rollBall(ball, dt / 2);
      for (let i = 0; i < inPlay.length; i++) for (let j = i + 1; j < inPlay.length; j++) knock(inPlay[i], inPlay[j]);
    }
  }

  // Game > Phases: intro banner, play, scorecard, final
  function afterScorecard() {
    if (world.hole < HOLES.length - 1) loadHole(world.hole + 1);
    else if (world.mode === 'attract') { for (const ball of world.balls.values()) ball.scores = []; loadHole(0); }
    else { world.phase = 'final'; world.t = 12; }
  }

  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'play') {
      if (world.rolling || !everyBall().every((ball) => ball.done)) return;
      Object.assign(world, { phase: 'score', t: world.mode === 'attract' ? 1.5 : 5, turn: null });
    } else if (world.t > 0) return;
    else if (world.phase === 'intro') Object.assign(world, { phase: 'play', turn: null, tt: 0 });
    else if (world.phase === 'score') afterScorecard();
    else if (world.phase === 'final') onEnd();
  }

  sim.startAttract = () => {
    sim.clearPlayers();
    world.mode = 'attract';
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], BOT_COLORS[i], true);
    loadHole(0);
  };
  sim.startMatch = ({ humans, bots, settings = {} }) => {
    sim.clearPlayers();
    names.reset(); slowFields.reset(); lastShotSeq.clear();
    sim.events = [];
    world.mode = 'match';
    world.clock = clamp(Number(settings.clock) || DEFAULT_CLOCK, 5, 60);
    for (const h of humans.slice(0, MAX_GOLFERS)) sim.addPlayer(h.id, h.nick, h.color, false);
    const botCount = Math.max(0, Math.min(bots, MAX_GOLFERS - world.balls.size));
    for (let i = 0; i < botCount; i++) sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, BOT_COLORS[i], true);
    loadHole(0);
  };

  // Multiplayer > roster: leavers drop; a late human replaces the worst bot in a full room, takes the last seat, tees off when the rotation reaches them
  function joinLate(h) {
    if (world.balls.size >= MAX_GOLFERS) {
      const bot = everyBall().filter((ball) => ball.bot).sort((a, b) => totalStrokes(b) - totalStrokes(a))[0];
      if (!bot) return;
      sim.removePlayer(bot.id);
    }
    const ball = sim.addPlayer(h.id, h.nick, h.color, false);
    for (let i = 0; i < world.hole; i++) ball.scores[i] = HOLES[i].par + 2;
    placeAt(ball, teeSpot(world.balls.size - 1));
  }
  sim.syncRoster = (humans) => {
    const here = new Set(humans.map((h) => h.id));
    for (const ball of everyBall()) if (!ball.bot && !here.has(ball.id)) { sim.removePlayer(ball.id); lastShotSeq.delete(ball.id); }
    for (const h of humans) if (!world.balls.has(h.id)) joinLate(h);
    slowFields.reset();
  };

  // Multiplayer > guest input { shot: [angle, power], q: shot seq }: one message per putt, a resend of the same q is dropped
  sim.applyInput = (id, input) => {
    if (!Array.isArray(input.shot) || lastShotSeq.get(id) === input.q) return;
    lastShotSeq.set(id, input.q);
    shoot(world.balls.get(id), Number(input.shot[0]), Number(input.shot[1]));
  };

  // Run engine > one fixed step
  sim.step = () => {
    if (world.phase === 'play') { turns(STEP); simBalls(STEP); }
    else if (world.phase === 'intro') world.ht += STEP;
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): one row per ball, scorecard + order + clock only when they change, events since the last one
  const flags = (ball) => (ball.bot ? 1 : 0) | (ball.holed ? 2 : 0) | (ball.done ? 4 : 0) | (ball.teed ? 8 : 0);
  sim.snapshot = () => {
    const balls = everyBall();
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), hole: world.hole, ht: f2(world.ht), tn: world.turn, tt: f2(world.tt), rl: world.rolling ? 1 : 0,
      ...slowFields.pick({ sc: balls.map((ball) => [ball.id, ball.scores.map((strokes) => strokes ?? null)]), od: world.order, ck: world.clock }),
      B: balls.map((ball) => [ball.id, f2(ball.x), f2(ball.z), f2(ball.vx), f2(ball.vz), flags(ball), ball.strokes]),
    }, balls);
    if (sim.events.length) snap.ev = sim.events;
    sim.events = [];
    return snap;
  };

  return sim;
}
