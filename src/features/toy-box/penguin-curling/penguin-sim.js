// Runs Penguin Curling rules (throw order, aim + charge, belly-slide physics, sweeping, knocks, ring scoring, bots) with no rendering, for page attract mode and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { pickLeader } from '../common/pick-leader.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
// rink: half width, front wall, lake edge, hog line (a throw must cross it)
export const XW = 8.5, FRONT = 6, BACK = -47, HOG = -22;
// [radius from the fish, points]
export const RINGS = [[1.0, 5], [2.2, 3], [3.5, 2], [5.0, 1]];
export const ROUNDS = 8;
/** penguin still on the move: its player can sweep and lean */
export const SLIDING_SPEED = 0.3;
const AIM_T = 10, PR = 0.5, FR = 4.5, FR_SWEEP = 2.9, VMIN = 5, VMAX = 22, LEAN = 1.8, WAIT_Z = 3.6;
// charge meter rises and falls this fast: a slow tap-tap sweep, not a reflex hold
const CHARGE_RATE = 0.7;
const CLOSEST_BONUS = 2, MAX_PENGUINS = 14, ATTRACT_BOTS = 8, ATTRACT_ROUNDS = 2;
const BOT_NAMES = ['Pingu', 'Waddles', 'Flipper', 'Tux', 'Mumble', 'Pebble', 'Iceberg', 'Snowy', 'Kowalski', 'Rico', 'Chilly', 'Frosty', 'Sardine', 'Puddles'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const THROW_PHASES = ['count', 'aim', 'slide', 'rest'];
const BEHIND_HACK = { vx: 0, vz: 0, aim: 0, pow: 0, chT: 0, held: false, charging: false, launched: false, out: false, hog: false, sweep: false, plan: null };
const f2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
// charge meter sweeps up and back down
const tri = (u) => 1 - Math.abs(1 - (u % 2));
const rng = Math.random;
// fewer rounds in big rooms so 14 one-at-a-time throws per round stay a party game
const roundsFor = (penguins) => clamp(Math.ceil(40 / Math.max(1, penguins)), 3, ROUNDS);
const speedOf = (p) => Math.hypot(p.vx, p.vz);

/**
 * onEnd(): final standings ran out (match over).
 * world.turn: id of the penguin throwing now; order: this round's throw order; ti: index of turn in order
 * sim.events since the last drain: c count beep, u turn up, l launch, k knock, x bank hit, s splash, h hogged, p points, b best of round, w winner
 */
export function createPenguinSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'count', t: 3, round: 0, rounds: ROUNDS, hx: 0, hz: -37, best: 0, players: new Map(), winner: null, turn: null, order: [], ti: -1 };
  const names = createNameSync(), slowFields = createChangedOnly();
  const sim = { world, events: [] };
  const emit = (...event) => sim.events.push(event);
  const everyone = () => [...world.players.values()];
  const distToFish = (p) => Math.hypot(p.x - world.hx, p.z - world.hz);
  let lastBeep = 0;

  // Game > World
  sim.addPlayer = (id, nick, color, bot) => {
    const p = { id, nick, color, bot, x: 0, z: 0, ax: 0, score: 0, last: 0, skill: 0.35 + rng() * 0.55, shotSeq: 0, lastShot: 0, pendingTaps: 0, ...BEHIND_HACK };
    world.players.set(id, p);
    return p;
  };
  sim.removePlayer = (id) => world.players.delete(id);
  sim.clearPlayers = () => world.players.clear();

  // throw order: shuffled in round 1, then leader first so last place throws last (the hammer); ties keep last round's order
  function lineUp() {
    const ps = everyone(), prev = new Map(world.order.map((id, k) => [id, k]));
    if (world.round === 1) ps.sort(() => rng() - 0.5);
    else ps.sort((a, b) => b.score - a.score || (prev.get(a.id) ?? 99) - (prev.get(b.id) ?? 99));
    // last end's final thrower never opens the next end (no back-to-back throws)
    const lastThrower = world.order.findLast((id) => world.players.has(id));
    if (ps.length > 1 && ps[0].id === lastThrower) [ps[0], ps[1]] = [ps[1], ps[0]];
    for (const p of ps) Object.assign(p, BEHIND_HACK);
    Object.assign(world, { order: ps.map((p) => p.id), ti: -1, turn: null });
    bench();
  }

  // penguins still to throw wait in a row behind the hack, next up on the left
  function bench() {
    const waiting = world.order.slice(world.ti + 1).map((id) => world.players.get(id)).filter((p) => p && !p.launched);
    const n = waiting.length, gap = Math.min(1.6, 14 / Math.max(1, n - 1));
    waiting.forEach((p, k) => Object.assign(p, { x: (k - (n - 1) / 2) * gap, z: WAIT_Z }));
  }

  // next thrower steps onto the hack; nobody left means the end is scored
  function nextTurn() {
    do world.ti++; while (world.ti < world.order.length && !world.players.has(world.order[world.ti]));
    if (world.ti >= world.order.length) { world.turn = null; scoreRound(); return; }
    const p = world.players.get(world.order[world.ti]);
    Object.assign(p, { x: 0, z: 0, vx: 0, vz: 0, aim: 0, pow: 0, chT: 0, charging: false, plan: null });
    world.turn = p.id;
    bench();
    world.phase = 'aim'; world.t = AIM_T;
    emit('u', p.id);
  }

  function startRound() {
    world.round++;
    world.hx = (rng() - 0.5) * 8; world.hz = -33 - rng() * 7; world.best = 0;
    lineUp();
    world.phase = 'count';
    world.t = world.round > 1 ? 1.6 : world.mode === 'attract' ? 1.5 : 3.5;
  }

  function startRounds() {
    for (const p of world.players.values()) { p.score = 0; p.last = 0; }
    Object.assign(world, { round: 0, rounds: world.mode === 'attract' ? ATTRACT_ROUNDS : roundsFor(world.players.size), winner: null, order: [] });
    startRound();
  }

  // Run engine > aim + charge meter, launch, belly-slide friction, sweep, lean, banks, lake
  function launch(p, pow = p.pow) {
    const v = VMIN + pow * (VMAX - VMIN);
    Object.assign(p, { launched: true, charging: false, pow, vx: Math.sin(p.aim) * v, vz: -Math.cos(p.aim) * v });
    emit('l', p.id);
  }

  function aimAndCharge(p, dt) {
    if (world.phase !== 'aim' || p.id !== world.turn) { p.pendingTaps = 0; return; }
    p.aim = clamp(p.aim + p.ax * 0.7 * dt, -0.4, 0.4);
    // tap once to start the meter, tap again to launch at that charge; taps made off-turn never carry over
    if (p.pendingTaps > 0) {
      p.pendingTaps--;
      if (p.charging) { launch(p); return; }
      p.charging = true; p.chT = 0; p.pow = 0;
    }
    if (!p.charging) return;
    p.chT += dt; p.pow = tri(p.chT * CHARGE_RATE);
  }

  function hitRinkEdges(p) {
    if (Math.abs(p.x) > XW - PR) {
      p.x = Math.sign(p.x) * (XW - PR);
      if (Math.abs(p.vx) > 1.5) emit('x', p.id, +p.x.toFixed(1), +p.z.toFixed(1));
      p.vx *= -0.6;
    }
    if (p.z > FRONT - PR) { p.z = FRONT - PR; p.vz *= -0.5; }
    if (p.z < BACK) { Object.assign(p, { out: true, vx: 0, vz: 0, z: BACK - 1.1, sweep: false }); emit('s', p.id); }
  }

  function slide(p, dt) {
    const speed = speedOf(p);
    p.sweep = p.held && speed > SLIDING_SPEED;
    if (speed < 1e-3) { p.vx = p.vz = 0; return; }
    const slowed = Math.max(0, speed - (p.sweep ? FR_SWEEP : FR) * dt);
    // lean: push sideways to the direction of travel
    if (speed > 1) { const px = -p.vz / speed, pz = p.vx / speed; p.vx += px * p.ax * LEAN * dt; p.vz += pz * p.ax * LEAN * dt; }
    const leaned = speedOf(p) || 1;
    p.vx *= slowed / leaned; p.vz *= slowed / leaned;
    p.x += p.vx * dt; p.z += p.vz * dt;
    hitRinkEdges(p);
  }

  function stepPlayer(p, dt) {
    if (p.out) return;
    if (p.launched) slide(p, dt);
    else aimAndCharge(p, dt);
  }

  // a penguin still on the start line acts like a fixed post: only the slider moves
  function bounceOffWaiting(slider, nx, nz, overlap, side) {
    slider.x += nx * side * overlap; slider.z += nz * side * overlap;
    const vn = slider.vx * nx + slider.vz * nz;
    if (vn * side < 0) { slider.vx -= 1.8 * vn * nx; slider.vz -= 1.8 * vn * nz; }
  }

  function knock(a, b, nx, nz, overlap) {
    const closing = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
    a.x -= nx * overlap / 2; a.z -= nz * overlap / 2; b.x += nx * overlap / 2; b.z += nz * overlap / 2;
    if (closing >= 0) return;
    const impulse = -1.92 * closing / 2;
    a.vx -= impulse * nx; a.vz -= impulse * nz; b.vx += impulse * nx; b.vz += impulse * nz;
    if (-closing > 1.5) emit('k', a.id, b.id, +((a.x + b.x) / 2).toFixed(1), +((a.z + b.z) / 2).toFixed(1), +(-closing).toFixed(1));
  }

  function collide(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.out || b.out || (!a.launched && !b.launched)) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > PR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, overlap = PR * 2 - d;
      if (a.launched && b.launched) knock(a, b, nx, nz, overlap);
      else if (a.launched) bounceOffWaiting(a, nx, nz, overlap, -1);
      else bounceOffWaiting(b, nx, nz, overlap, 1);
    }
  }

  // Run engine > bots: aim at the fish (or knock the leader off it), release at the right charge, sweep if short, lean toward the line
  function planThrow(p, plan) {
    const sitters = everyone().filter((q) => q !== p && q.launched && !q.out && speedOf(q) < 0.1 && distToFish(q) < 3.5);
    let extra = 0;
    // takeout: knock the rival sitting closest to the fish, more likely with the hammer (last throw of the end)
    const hammer = world.ti === world.order.length - 1;
    if (sitters.length && rng() < (hammer ? 0.85 : 0.45) * p.skill) {
      const target = sitters.sort((a, b) => distToFish(a) - distToFish(b))[0];
      plan.tx = target.x; plan.tz = target.z; extra = 4;
    }
    const error = 1.1 - p.skill;
    plan.tx += (rng() - 0.5) * 3.5 * error; plan.tz += (rng() - 0.5) * 6 * error;
    const v = Math.sqrt(2 * FR * (Math.hypot(plan.tx - p.x, plan.tz - p.z) + extra));
    plan.want = clamp((v - VMIN) / (VMAX - VMIN) + (rng() - 0.5) * 0.3 * error, 0.04, 1);
  }

  function botAim(p) {
    if (world.phase !== 'aim' || p.id !== world.turn) { p.ax = 0; return; }
    p.plan ??= { at: AIM_T - 1 - rng() * 1.6, tx: world.hx, tz: world.hz, want: null };
    const plan = p.plan;
    if (plan.want === null && world.t <= plan.at + 0.8) planThrow(p, plan);
    p.ax = clamp((Math.atan2(plan.tx - p.x, -(plan.tz - p.z)) - p.aim) * 6, -1, 1);
    // tap 1 starts the meter at plan.at, tap 2 fires once it reaches the wanted charge
    if (!p.charging) { if (world.t <= plan.at) p.shotSeq++; }
    else if (Math.abs(p.pow - plan.want) < 0.03) p.shotSeq++;
  }

  function botSlide(p) {
    const speed = speedOf(p);
    if (speed < SLIDING_SPEED) { p.held = false; p.ax = 0; return; }
    const ux = p.vx / speed, uz = p.vz / speed, tx = p.plan?.tx ?? world.hx, tz = p.plan?.tz ?? world.hz;
    const dx = tx - p.x, dz = tz - p.z, ahead = dx * ux + dz * uz, sideways = dx * -uz + dz * ux;
    p.held = ahead > (speed * speed) / (2 * FR) + 0.4 && rng() < p.skill * 0.8;
    p.ax = clamp(sideways * 0.6, -1, 1) * p.skill;
  }

  function botThink(p) {
    if (p.out) p.held = false;
    else if (p.launched) botSlide(p);
    else botAim(p);
  }

  // Game > Phases: countdown, then per throw: aim (10 s shot clock) > slide (until every penguin stops) > rest; round scores after the last throw, final standings
  function ringPoints(p) {
    if (p.out) return 0;
    return RINGS.find(([radius]) => distToFish(p) < radius)?.[1] ?? 0;
  }

  function scoreRound() {
    const ps = everyone();
    for (const p of ps) p.last = ringPoints(p);
    // closest to the fish gets a bonus on top of its ring points
    const best = ps.filter((p) => p.last).sort((a, b) => distToFish(a) - distToFish(b))[0] ?? null;
    if (best) best.last += CLOSEST_BONUS;
    for (const p of ps) { p.score += p.last; if (p.last) emit('p', p.id, p.last); }
    world.best = best?.id ?? 0;
    emit('b', world.best, best?.last ?? 0);
    world.phase = 'score'; world.t = 3.2;
  }

  function tickCount() {
    if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit('c', lastBeep); }
    if (world.t <= 0) { lastBeep = 0; emit('c', 0); nextTurn(); }
  }

  function tickAim() {
    const p = world.players.get(world.turn);
    // thrower left mid-turn: next one up
    if (!p) return nextTurn();
    if (!p.launched && world.t > 0) return;
    // shot clock ran out: a gentle push from wherever the meter was
    if (!p.launched) launch(p, p.charging ? p.pow : 0.5 + rng() * 0.2);
    world.phase = 'slide'; world.t = 10;
  }

  function tickSlide() {
    const ps = everyone();
    if (world.t > 0 && !ps.every((p) => p.out || speedOf(p) < 0.05)) return;
    for (const p of ps) p.vx = p.vz = 0;
    // hog line: a throw that stops short of the blue line is out of play, off to the snow bank
    const p = world.players.get(world.turn);
    if (p && !p.out && p.z > HOG) { Object.assign(p, { out: true, hog: true, x: Math.sign(p.x || 1) * (XW + 1) }); emit('h', p.id); }
    world.phase = 'rest'; world.t = 0.8;
  }

  function showFinal() {
    // tied top score = shared draw, never decided by join order
    const { winner: top } = pickLeader(everyone(), (p) => p.score);
    world.winner = top?.id ?? null;
    if (top) emit('w', top.id);
    world.phase = 'final'; world.t = world.mode === 'attract' ? 3 : 10;
  }

  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') tickCount();
    else if (world.phase === 'aim') tickAim();
    else if (world.phase === 'slide') tickSlide();
    else if (world.t > 0) return;
    else if (world.phase === 'rest') nextTurn();
    else if (world.phase === 'score') { if (world.round < world.rounds) startRound(); else showFinal(); }
    else if (world.mode === 'attract') startRounds();
    else onEnd();
  }

  sim.startAttract = () => {
    sim.clearPlayers();
    world.mode = 'attract';
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], BOT_COLORS[i], true);
    startRounds();
  };
  sim.startMatch = ({ humans, bots }) => {
    sim.clearPlayers();
    names.reset(); slowFields.reset();
    sim.events = [];
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PENGUINS)) sim.addPlayer(h.id, h.nick, h.color, false);
    const botCount = Math.max(0, Math.min(bots, MAX_PENGUINS - world.players.size));
    for (let i = 0; i < botCount; i++) sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, BOT_COLORS[i], true);
    startRounds();
  };

  // Multiplayer > roster: leavers drop; a late human takes the lowest-scoring bot's place in a full room, throws last this round or waits at the side for the next one
  function joinLate(h) {
    if (world.players.size >= MAX_PENGUINS) {
      const bot = everyone().filter((q) => q.bot).sort((a, b) => a.score - b.score)[0];
      if (!bot) return;
      sim.removePlayer(bot.id);
    }
    const p = Object.assign(sim.addPlayer(h.id, h.nick, h.color, false), { x: XW - 0.6, z: WAIT_Z });
    if (THROW_PHASES.includes(world.phase)) { world.order.push(p.id); bench(); }
  }
  sim.syncRoster = (humans) => {
    const here = new Set(humans.map((h) => h.id));
    for (const p of everyone()) if (!p.bot && !here.has(p.id)) sim.removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset();
  };
  // Multiplayer > guest input { x: steer, h: SLIDE held (sweep), t: SLIDE tap counter (tap 1 charges, tap 2 throws) }
  sim.applyInput = (id, input) => {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    p.ax = axis(input.x); p.held = !!input.h;
    applyPresses(p, { shotSeq: ['lastShot', input.t] });
  };

  // Run engine > one fixed step for every penguin
  sim.step = () => {
    const ps = everyone();
    for (const p of ps) if (p.bot) botThink(p);
    // new SLIDE taps become one pending tap per step, so a fast double tap still reads as two
    for (const p of ps) {
      const taps = p.shotSeq - p.lastShot;
      if (taps <= 0) continue;
      p.pendingTaps = Math.min(2, p.pendingTaps + taps);
      p.lastShot = p.shotSeq;
    }
    for (const p of ps) stepPlayer(p, STEP);
    collide(ps);
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): one row per penguin, round facts only when they change, events since the last one
  const flags = (p) => (p.bot ? 1 : 0) | (p.launched ? 2 : 0) | (p.out ? 4 : 0) | (p.charging ? 8 : 0) | (p.sweep ? 16 : 0) | (p.hog ? 32 : 0);
  sim.snapshot = () => {
    const ps = everyone();
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), tu: world.turn, ti: world.ti,
      ...slowFields.pick({ rd: world.round, rs: world.rounds, hx: f2(world.hx), hz: f2(world.hz), b: world.best, win: world.winner, o: world.order }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.aim), f2(p.pow), flags(p), p.score, p.last]),
    }, ps);
    if (sim.events.length) snap.ev = sim.events;
    sim.events = [];
    return snap;
  };

  return sim;
}
