// Runs Floor Is Lava rules (seeded spiral tower, jumper physics, head stomps, rising lava, crown or last survivor, bots) with no rendering, for page attract mode, own-jumper prediction and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { createSeededRng } from '../common/seeded-rng.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const PILLAR_R = 2.6, N_PLAT = 58;
// single jump peaks JUMP²/2G ≈ 3.3 m: clears the 1.75–2.5 m tower step without a perfect double jump
export const PR = 0.45, PH = 1.2, G = 32, RUN = 7.5, JUMP = 14.5, DJUMP = 11.5;
export const LAVA_DELAY = 9, STUN_T = 0.7;
export const lavaRate = (t) => 0.75 + t * 0.012;
export const platX = (p, t) => p.x + (p.mv ? p.ax * Math.sin(p.sp * t + p.ph) * p.amp : 0);
export const platZ = (p, t) => p.z + (p.mv ? p.az * Math.sin(p.sp * t + p.ph) * p.amp : 0);
const MAX_CLIMBERS = 14, ATTRACT_BOTS = 8, SPAWN_R = 4.6;
const BOT_NAMES = ['Ember', 'Magma', 'Cinder', 'Pumice', 'Basalt', 'Sizzle', 'Scorch', 'Obsidian', 'Flint', 'Ash', 'Blaze', 'Smoky', 'Vulcan', 'Pyro'];
const BOT_COLORS = ['#ff5d73', '#3fa7ff', '#ffd23f', '#2ec27e', '#a970ff', '#ff7bd5', '#00c2c7', '#ffffff', '#8bc34a', '#5c6bc0', '#e0b04a', '#26a69a', '#ff9f1c', '#b388ff'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** seeded spiral tower: wide base, rising platforms, side steps, movers, crown on top; same seed = same platform order on every tab */
export function buildTowerLayout(seed) {
  const r = createSeededRng(seed);
  // wide base catches missed jumps on the first lap of the spiral
  const plats = [{ x: 0, z: 0, w: 26, d: 26, y: 0, h: 2.5, base: true }];
  let a = r() * Math.PI * 2, y = 0;
  for (let i = 1; i <= N_PLAT; i++) {
    a += 0.52 + r() * 0.28; y += 1.75 + r() * 0.75;
    const rad = 9.2 + r() * 2.3, k = i / N_PLAT, s = 3.6 - k * 1.3 + r() * 0.6;
    const p = { x: Math.sin(a) * rad, z: Math.cos(a) * rad, w: s, d: s, y, h: 0.7, i };
    // every few steps a platform slides along the spiral tangent
    if (i % 5 === 3 && i < N_PLAT - 1) Object.assign(p, { mv: true, ax: Math.cos(a), az: -Math.sin(a), amp: 2 + r() * 1.5, sp: 0.8 + r() * 0.6, ph: r() * 6 });
    plats.push(p);
    if (i % 3 === 0) { const b = a + 0.25, rr = rad + 3.5; plats.push({ x: Math.sin(b) * rr, z: Math.cos(b) * rr, w: 2.4, d: 2.4, y: y - 0.9, h: 0.6, i: i - 0.5 }); }
  }
  const crownPlat = plats.find((p) => p.i === N_PLAT);
  Object.assign(crownPlat, { w: 4, d: 4, crown: true });
  return { seed, plats, crownPlat };
}

// head stomp victim: knocked down and dazed for a moment
export function squash(v) { v.stun = STUN_T; v.vy = Math.min(v.vy, -6); }

/**
 * onEnd(): final standings ran out (match over).
 * world.tower: { seed, plats, crownPlat }; world.time drives the moving platforms.
 * sim.events since the last drain: j jump [id, 1|2], s stomp [stomper, victim], b burn [id, x, lavaY, z], w winner, c count beep
 */
export function createLavaSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'count', t: 2, time: 0, lavaT: 0, lava: -4, winner: null, deaths: 0, tower: buildTowerLayout(1), players: new Map() };
  const names = createNameSync();
  const sim = { world, events: [] };
  const emit = (...event) => sim.events.push(event);
  const everyone = () => [...world.players.values()];
  let lastBeep = 0;

  // Game > World
  sim.addPlayer = (id, nick, color, bot) => {
    const p = { id, nick, color, bot, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, face: 0, ground: null, jumps: 0, coyote: 0, out: false, place: 0, best: 0, mx: 0, mz: 0, jump: 0, jumpSeq: 0, lastJump: 0, stun: 0, skill: 0.5 + rng() * 0.45, target: null, think: 0, stuck: 0 };
    world.players.set(id, p);
    return p;
  };
  sim.removePlayer = (id) => world.players.delete(id);
  sim.clearPlayers = () => world.players.clear();
  sim.groundIndex = (p) => (p.ground ? world.tower.plats.indexOf(p.ground) : -1);

  // Run engine > jumper physics: run, coyote + double jump, ride movers, platform sides + tops + undersides, pillar, crowd push, head stomps
  function sidePush(p, t) {
    for (const q of world.tower.plats) {
      const top = q.y, bot = q.y - q.h;
      if (p.y >= top - 0.05 || p.y + PH <= bot) continue;
      const qx = platX(q, t), qz = platZ(q, t), hx = q.w / 2, hz = q.d / 2;
      const cx = clamp(p.x, qx - hx, qx + hx), cz = clamp(p.z, qz - hz, qz + hz), dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d >= PR) continue;
      if (d > 1e-4) { p.x = cx + (dx / d) * PR; p.z = cz + (dz / d) * PR; }
      else { const ox = hx - Math.abs(p.x - qx), oz = hz - Math.abs(p.z - qz); if (ox < oz) p.x = qx + Math.sign(p.x - qx || 1) * (hx + PR); else p.z = qz + Math.sign(p.z - qz || 1) * (hz + PR); }
    }
    const pr = Math.hypot(p.x, p.z);
    if (pr < PILLAR_R + PR) { const s = (PILLAR_R + PR) / (pr || 1); p.x *= s; p.z *= s; }
  }
  function crowdPush(p, others) {
    for (const q of others) {
      if (q === p || q.out) continue;
      const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz);
      if (d < PR * 2 && d > 1e-4 && Math.abs(p.y - q.y) < PH * 0.8) { const push = (PR * 2 - d) * 0.5; p.x += (dx / d) * push; p.z += (dz / d) * push; }
    }
  }
  function landOrBump(p, prevY, t) {
    p.ground = null;
    for (const q of world.tower.plats) {
      const qx = platX(q, t), qz = platZ(q, t);
      if (Math.abs(p.x - qx) > q.w / 2 + PR * 0.5 || Math.abs(p.z - qz) > q.d / 2 + PR * 0.5) continue;
      if (p.vy <= 0 && prevY >= q.y - 0.02 && p.y <= q.y) { p.y = q.y; p.vy = 0; p.ground = q; p.jumps = 0; return; }
      const bot = q.y - q.h;
      if (p.vy > 0 && prevY + PH <= bot + 0.02 && p.y + PH > bot) { p.y = bot - PH; p.vy = 0; }
    }
  }
  // landing on someone's head bounces you and squashes them
  function stompFrom(p, prevY, others) {
    if (p.ground || p.vy >= 0) return null;
    for (const q of others) {
      if (q === p || q.out) continue;
      if (Math.hypot(p.x - q.x, p.z - q.z) < PR * 1.6 && prevY >= q.y + PH - 0.05 && p.y <= q.y + PH) { p.y = q.y + PH; p.vy = 13; p.jumps = 1; return q; }
    }
    return null;
  }
  function physics(p, dt, t, others) {
    const onGround = !!p.ground;
    // dazed after a head stomp: no running or jumping
    p.stun = Math.max(0, p.stun - dt);
    if (p.stun > 0 || world.phase !== 'play') { p.mx = p.mz = 0; p.jump = 0; }
    let mx = p.mx, mz = p.mz;
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    const k = 1 - Math.exp(-dt * (onGround ? 14 : 4));
    p.vx += (mx * RUN - p.vx) * k; p.vz += (mz * RUN - p.vz) * k;
    if (ml > 0.15) p.face = Math.atan2(mx, mz);
    p.coyote = onGround ? 0.1 : Math.max(0, p.coyote - dt);
    let jumped = 0;
    if (p.jump) {
      if (onGround || p.coyote > 0) { p.vy = JUMP; p.jumps = 1; p.coyote = 0; jumped = 1; }
      else if (p.jumps < 2) { p.vy = DJUMP; p.jumps = 2; jumped = 2; }
      p.jump = 0;
    }
    // ride the moving platform under the feet
    if (p.ground?.mv) { p.x += platX(p.ground, t + dt) - platX(p.ground, t); p.z += platZ(p.ground, t + dt) - platZ(p.ground, t); }
    p.x += p.vx * dt; p.z += p.vz * dt;
    sidePush(p, t);
    crowdPush(p, others);
    const prevY = p.y;
    p.vy = Math.max(p.vy - G * dt, -40);
    p.y += p.vy * dt;
    landOrBump(p, prevY, t);
    return { jumped, stomped: stompFrom(p, prevY, others) };
  }

  // one jumper step on the current clock: a fresh jump press (counter moved) jumps; used by the server for humans and by a tab predicting its own jumper
  sim.stepPlayer = (p, dt, others = everyone()) => {
    if (p.jumpSeq !== p.lastJump) { p.lastJump = p.jumpSeq; p.jump = 1; }
    const result = physics(p, dt, world.time, others);
    if (result.jumped) emit('j', p.id, result.jumped);
    if (result.stomped) { emit('s', p.id, result.stomped.id); squash(result.stomped); }
    return result;
  };

  // Run engine > bots: hop up the spiral toward the highest reachable platform, double jump when short
  function pickTarget(p, t) {
    const plats = world.tower.plats, from = p.ground ?? plats[0];
    let best = null, bestScore = -1e9;
    for (const q of plats) {
      if (q === from || q.y <= from.y + 0.3 || q.y > from.y + 4.6) continue;
      const d = Math.hypot(platX(q, t) - p.x, platZ(q, t) - p.z);
      if (d > 9 || d < 1.2) continue;
      const score = q.y * 2 - d * 0.6 - (q.mv ? 1.5 : 0) + rng() * 1.5 * (1 - p.skill);
      if (score > bestScore) { bestScore = score; best = q; }
    }
    if (best) return best;
    // nothing in hop range: head for the nearest platform that is higher at all
    let nearest = 1e9;
    for (const q of plats) {
      if (q.y <= from.y + 0.3 || q.y > from.y + 4.6) continue;
      const d = Math.hypot(platX(q, t) - p.x, platZ(q, t) - p.z);
      if (d < nearest) { nearest = d; best = q; }
    }
    return best;
  }
  // straight line cuts through the pillar: walk around it on the target's side
  function steerAroundPillar(p, dx, dz, d) {
    const along = -(p.x * dx + p.z * dz) / (d * d);
    if (!(along > 0 && along < 1 && Math.hypot(p.x + dx * along, p.z + dz * along) < PILLAR_R + 1.2)) return;
    const side = Math.sign(p.x * dz - p.z * dx) || 1, pr = Math.hypot(p.x, p.z) || 1;
    p.mx = (-p.z / pr) * side * 0.9 + (p.x / pr) * 0.3; p.mz = (p.x / pr) * side * 0.9 + (p.z / pr) * 0.3;
  }
  function botThink(p, dt, t) {
    if (p.out || world.phase !== 'play') { p.mx = p.mz = 0; return; }
    p.think -= dt;
    if (p.ground && (p.think <= 0 || !p.target || p.target.y <= p.ground.y)) { p.target = pickTarget(p, t); p.think = 0.8 + rng(); }
    const q = p.target;
    if (!q) {
      // nothing reachable: walk toward the pillar edge of the current platform and hope
      p.mx = -p.x * 0.1; p.mz = -p.z * 0.1;
      if (p.ground && rng() < 0.02) p.jump = 1;
      return;
    }
    const dx = platX(q, t + 0.3) - p.x, dz = platZ(q, t + 0.3) - p.z, d = Math.hypot(dx, dz) || 1;
    const edge = d - Math.max(q.w, q.d) / 2;
    p.mx = dx / d; p.mz = dz / d;
    steerAroundPillar(p, dx, dz, d);
    if (p.ground) {
      p.stuck += dt;
      // jump when the landing arc reaches the near edge of the target
      const h = q.y - p.y, disc = JUMP * JUMP - 2 * G * h, reach = disc > 0 ? (RUN * (JUMP + Math.sqrt(disc))) / G : 0;
      if (edge < reach * (0.45 + p.skill * 0.2) && edge > -0.5 && rng() < 0.3 + p.skill * 0.5) { p.jump = 1; p.stuck = 0; }
      if (p.stuck > 2.5) { p.jump = 1; p.stuck = 0; p.target = null; }
    } else {
      // second jump when falling and still below the target's top
      if (p.jumps < 2 && p.vy < 1 && p.y < q.y + 0.4 && edge > 0.3 && rng() < 0.3 + p.skill * 0.5) p.jump = 1;
      if (edge < 0 && Math.hypot(p.vx, p.vz) > 1) { p.mx *= 0.3; p.mz *= 0.3; }
    }
  }

  // Game > Phases: countdown on the base, climb with rising lava, crown or last survivor wins
  // shuffled slots: join order never fixes who starts beside whom
  function spawnAll() {
    const ps = shuffleInPlace(everyone(), rng), off = rng() * 6.28;
    ps.forEach((p, i) => {
      const a = off + (i / ps.length) * Math.PI * 2;
      Object.assign(p, { x: Math.sin(a) * SPAWN_R, y: 0, z: Math.cos(a) * SPAWN_R, vx: 0, vy: 0, vz: 0, face: a, ground: world.tower.plats[0], jumps: 0, out: false, place: 0, best: 0, target: null, stun: 0 });
    });
  }
  function newClimb(seed) {
    Object.assign(world, { tower: buildTowerLayout(seed), time: 0, lavaT: 0, lava: -6, winner: null, deaths: 0, phase: 'count', t: world.mode === 'attract' ? 1.5 : 3 });
    spawnAll();
  }
  const randomSeed = () => 1 + Math.floor(rng() * 1e9);

  const onCrown = (p) => {
    const c = world.tower.crownPlat;
    return p.ground === c || (Math.abs(p.y - c.y) < 0.05 && Math.hypot(p.x - platX(c, world.time), p.z - platZ(c, world.time)) < 2.3);
  };
  function finish(p) {
    world.winner = p?.id ?? null;
    if (p) p.place = 1;
    // climbers still up when the crown falls: ranked by height behind the winner, ahead of every lava victim
    everyone().filter((q) => !q.out && q !== p).sort((a, b) => b.y - a.y).forEach((q, k) => (q.place = k + 2));
    world.phase = 'final'; world.t = world.mode === 'attract' ? 5 : 9;
    emit('w', world.winner ?? 0);
  }
  // place from climbers still up: spectators + leavers never shift it
  function burn(p, ps) {
    p.out = true; world.deaths++;
    p.place = ps.filter((q) => !q.out).length + 1;
    emit('b', p.id, f2(p.x), f2(world.lava), f2(p.z));
  }
  function tickClimb(dt) {
    world.lavaT += dt;
    if (world.lavaT > LAVA_DELAY) world.lava += lavaRate(world.lavaT) * dt;
    const ps = everyone();
    for (const p of ps.filter((q) => !q.out)) {
      p.best = Math.max(p.best, p.y);
      if (p.y < world.lava + 0.15) burn(p, ps);
      else if (onCrown(p)) return finish(p);
    }
    const left = ps.filter((p) => !p.out);
    if (ps.length > 1 && left.length === 1) finish(left[0]);
    else if (!left.length) finish(ps.slice().sort((a, b) => a.place - b.place)[0]);
  }
  function tickCount() {
    if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit('c', lastBeep); }
    if (world.t <= 0) { lastBeep = 0; world.phase = 'play'; emit('c', 0); }
  }
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') tickCount();
    else if (world.phase === 'play') tickClimb(dt);
    else if (world.phase === 'final' && world.t <= 0) {
      if (world.mode === 'attract') newClimb(randomSeed());
      else onEnd();
    }
  }

  sim.startAttract = () => {
    sim.clearPlayers();
    world.mode = 'attract';
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], BOT_COLORS[i], true);
    newClimb(randomSeed());
  };
  // the tower seed is drawn here: every tab builds it from the snapshot's sd
  sim.startMatch = ({ humans, bots }) => {
    sim.clearPlayers();
    names.reset();
    sim.events = [];
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_CLIMBERS)) sim.addPlayer(h.id, h.nick, h.color, false);
    const botCount = Math.max(0, Math.min(bots, MAX_CLIMBERS - world.players.size));
    for (let i = 0; i < botCount; i++) sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, BOT_COLORS[i], true);
    newClimb(randomSeed());
  };

  // Multiplayer > roster: leavers drop; a late human takes a cooked bot's seat first in a full room, climbs if the countdown is still on, else spectates
  function joinLate(h) {
    if (world.players.size >= MAX_CLIMBERS) {
      const bot = everyone().find((q) => q.bot && q.out) ?? everyone().find((q) => q.bot);
      if (!bot) return;
      sim.removePlayer(bot.id);
    }
    Object.assign(sim.addPlayer(h.id, h.nick, h.color, false), { out: world.phase !== 'count', x: 0, y: 0, z: SPAWN_R, ground: world.tower.plats[0] });
  }
  sim.syncRoster = (humans) => {
    const here = new Set(humans.map((h) => h.id));
    for (const p of everyone()) if (!p.bot && !here.has(p.id)) sim.removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  };

  // Multiplayer > guest input { x, z: camera-relative move, j: jump press counter }
  sim.applyInput = (id, input) => {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    p.mx = axis(input.x); p.mz = axis(input.z);
    applyPresses(p, { jumpSeq: ['lastJump', input.j] });
  };

  // Run engine > one fixed step: clock, bots think, every climber moves, rules
  sim.step = () => {
    world.time += STEP;
    const ps = everyone();
    for (const p of ps) {
      if (p.out) continue;
      if (p.bot) botThink(p, STEP, world.time);
      sim.stepPlayer(p, STEP, ps);
    }
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): clock + lava + tower seed, one row per climber (gi = platform index under the feet), events since the last one
  const flags = (p) => (p.out ? 1 : 0) | (p.bot ? 2 : 0) | (p.ground ? 4 : 0);
  sim.snapshot = () => {
    const ps = everyone();
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), tm: f2(world.time), lt: f2(world.lavaT), lv: f2(world.lava), wn: world.winner, sd: world.tower.seed,
      P: ps.map((p) => [p.id, f2(p.x), f2(p.y), f2(p.z), f2(p.vx), f2(p.vy), f2(p.vz), f2(p.face), flags(p), p.place, f2(p.best), sim.groundIndex(p)]),
    }, ps);
    if (sim.events.length) snap.ev = sim.events;
    sim.events = [];
    return snap;
  };

  return sim;
}
