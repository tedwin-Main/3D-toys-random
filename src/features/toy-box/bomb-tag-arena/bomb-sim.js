// Runs Hot Potato rules (movement, bumps, bomb passing, fuse waves, bots, rounds) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const ROUNDS = 3, SPEED = 7.4, R_ARENA = 21;
// six pillars on a circle plus a wider one in the middle: { x, z, r }
export const PILLARS = [...Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2 + 0.3; return { x: Math.cos(a) * 11, z: Math.sin(a) * 11, r: 1.3 }; }), { x: 0, z: 0, r: 2 }];
const PR = 0.78, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const BOT_NAMES = ['Spud', 'Tater', 'Fritz', 'Hashbrown', 'Wedge', 'Gnocchi', 'Mash', 'Chip', 'Russet', 'Yukon', 'Rosti', 'Latke', 'Tot', 'Fry'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): final results timer ran out (host goes back to the lobby) */
export function createBombSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  // Game > World
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 3, round: 1, fuse: 0, fuseMax: 1, players: new Map(), outCount: 0, winner: null };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, face: 0, alive: true, bomb: false, immune: 0, dashT: 0, dashCD: 0, mx: 0, mz: 0, dashSeq: 0, lastDash: 0, pts: 0, wins: 0, place: 0, skill: 0.7 + rng() * 0.25, wander: rng() * 6 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function spawnAll() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...world.players.values()], rng), n = ps.length;
    ps.forEach((p, k) => { const a = (k / n) * Math.PI * 2; Object.assign(p, { x: Math.sin(a) * 16, z: Math.cos(a) * 16, vx: 0, vz: 0, face: a + Math.PI, alive: true, bomb: false, immune: 0, dashT: 0, dashCD: 0, place: 0 }); });
  }
  function startRound() {
    spawnAll();
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3.5; world.outCount = 0; world.winner = null; world.fuse = 0;
  }
  function startWave() {
    const alive = [...world.players.values()].filter((p) => p.alive);
    for (const p of alive) p.bomb = false;
    // roughly one bomb per four survivors
    const n = Math.max(1, Math.min(alive.length - 1, Math.round(alive.length / 4)));
    shuffleInPlace(alive, rng).slice(0, n).forEach((p) => { p.bomb = true; p.immune = 0; });
    world.fuseMax = world.fuse = 9 + alive.length * 0.7 + rng() * 5;
    world.phase = 'play';
    events.push(['a', n]);
  }

  // Run engine > movement, dash, pillars + rim, bumps, bomb passing
  function stepPlayer(p, dt) {
    if (!p.alive) return;
    const frozen = world.phase === 'count';
    let mx = frozen ? 0 : p.mx, mz = frozen ? 0 : p.mz;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const top = SPEED * (p.bomb ? 1.08 : 1);
    if (p.dashSeq !== p.lastDash) {
      p.lastDash = p.dashSeq;
      if (p.dashCD <= 0 && !frozen) {
        const dl = ml > 0.1 ? 1 : 0, dx = dl ? mx : Math.sin(p.face), dz = dl ? mz : Math.cos(p.face);
        p.vx = dx * 17; p.vz = dz * 17; p.dashT = 0.22; p.dashCD = 1.6;
        events.push(['d', p.id]);
      }
    }
    p.dashT -= dt; p.dashCD -= dt; p.immune -= dt;
    if (p.dashT <= 0) {
      const acc = 46 * dt;
      p.vx += clamp(mx * top - p.vx, -acc, acc);
      p.vz += clamp(mz * top - p.vz, -acc, acc);
    }
    if (ml > 0.1) p.face = Math.atan2(mx, mz);
    p.x += p.vx * dt; p.z += p.vz * dt;
    for (const c of PILLARS) {
      const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz), rr = c.r + PR;
      if (d < rr && d > 1e-4) { const nx = dx / d, nz = dz / d; p.x = c.x + nx * rr; p.z = c.z + nz * rr; const vn = p.vx * nx + p.vz * nz; if (vn < 0) { p.vx -= 1.6 * vn * nx; p.vz -= 1.6 * vn * nz; } }
    }
    const d = Math.hypot(p.x, p.z), lim = R_ARENA - PR;
    if (d > lim) { const nx = p.x / d, nz = p.z / d; p.x = nx * lim; p.z = nz * lim; const vn = p.vx * nx + p.vz * nz; if (vn > 0) { p.vx -= 1.6 * vn * nx; p.vz -= 1.6 * vn * nz; } }
  }
  function bump(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (!a.alive || !b.alive) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > PR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (PR * 2 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) { a.vx += nx * vr * 1.1; a.vz += nz * vr * 1.1; b.vx -= nx * vr * 1.1; b.vz -= nz * vr * 1.1; }
      if (world.phase !== 'play') continue;
      // pass the bomb; fresh holder can't hand it straight back
      if (a.bomb !== b.bomb) {
        const [from, to] = a.bomb ? [a, b] : [b, a];
        if (from.immune <= 0) { from.bomb = false; to.bomb = true; to.immune = 0.7; events.push(['p', from.id, to.id]); }
      }
    }
  }

  // Run engine > bots: holders chase the nearest runner with lead, runners flee holders and the rim
  function botThink(p, dt) {
    if (!p.alive) return;
    const others = [...world.players.values()].filter((q) => q.alive && q !== p);
    let tx = 0, tz = 0;
    if (p.bomb) {
      let best = null, bd = Infinity;
      for (const q of others) if (!q.bomb) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = q; } }
      if (best) {
        const lead = Math.min(bd / 12, 0.6) * p.skill;
        tx = best.x + best.vx * lead - p.x; tz = best.z + best.vz * lead - p.z;
        if (bd < 3.2 && p.dashCD <= 0 && rng() < p.skill * 0.25) p.dashSeq++;
      }
    } else {
      // skill = awareness: sharp runners spot a bomb from farther and dash away sooner
      for (const q of others) if (q.bomb) {
        const dx = p.x - q.x, dz = p.z - q.z, d = Math.hypot(dx, dz) || 1;
        if (d > 4 + 16 * p.skill) continue;
        const w = 1 / Math.max(d - 1, 0.5) ** 1.4;
        tx += (dx / d) * w; tz += (dz / d) * w;
        if (d < 1.4 + 1.6 * p.skill && p.dashCD <= 0 && rng() < p.skill * 0.2) p.dashSeq++;
      }
      // stay off the rim and out of pillars, with a lazy wander so runners spread out
      const r = Math.hypot(p.x, p.z);
      if (r > R_ARENA - 5) { tx -= (p.x / r) * 0.25 * (r - (R_ARENA - 5)); tz -= (p.z / r) * 0.25 * (r - (R_ARENA - 5)); }
      for (const c of PILLARS) { const dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz); if (d < c.r + 2.5) { tx += (dx / d) * 0.25; tz += (dz / d) * 0.25; } }
      p.wander += dt * 0.7;
      tx += Math.cos(p.wander) * 0.02; tz += Math.sin(p.wander) * 0.02;
      // tangential slip so runners circle away instead of backing into the wall
      const tl = Math.hypot(tx, tz);
      if (tl > 1e-4 && r > R_ARENA - 7) { const s = Math.sign(tx * -p.z + tz * p.x) || 1; tx += (-p.z / r) * s * tl * 0.8; tz += (p.x / r) * s * tl * 0.8; }
    }
    const l = Math.hypot(tx, tz);
    if (l > 1e-4) { p.mx = tx / l; p.mz = tz / l; } else { p.mx = p.mz = 0; }
  }

  // Game > Phases: countdown, bomb waves until one survives, round results, final
  function phases(dt) {
    const ps = [...world.players.values()];
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { events.push(['c', 0]); startWave(); }
    } else if ((world.phase === 'play' || world.phase === 'wave') && ps.length > 1 && ps.filter((p) => p.alive).length <= 1) {
      // rivals left mid-wave: last one standing wins now, no blast
      endBombRound(ps, ps.filter((p) => p.alive));
    } else if (world.phase === 'play') {
      world.fuse -= dt;
      if (world.fuse <= 0) {
        const holders = ps.filter((p) => p.alive && p.bomb);
        for (const h of holders) {
          events.push(['b', h.id, +h.x.toFixed(1), +h.z.toFixed(1)]);
          // blast shoves anyone nearby
          for (const q of ps) { if (!q.alive || q === h) continue; const dx = q.x - h.x, dz = q.z - h.z, d = Math.hypot(dx, dz); if (d < 5 && d > 1e-3) { q.vx += (dx / d) * (5 - d) * 4; q.vz += (dz / d) * (5 - d) * 4; q.dashT = 0.25; } }
        }
        for (const h of holders) { h.alive = false; h.bomb = false; h.pts += world.outCount; }
        for (const h of holders) { h.place = ps.filter((p) => p.alive).length + 1; }
        world.outCount += holders.length;
        const alive = ps.filter((p) => p.alive);
        if (alive.length <= 1 && ps.length > 1 || alive.length === 0) endBombRound(ps, alive);
        else { world.phase = 'wave'; world.t = 2.2; }
      }
    } else if (world.phase === 'wave' && world.t <= 0) startWave();
    else if (world.phase === 'round' && world.t <= 0) {
      if (world.mode === 'attract' || world.round < ROUNDS) { world.round = world.mode === 'attract' ? 1 : world.round + 1; startRound(); }
      else { world.phase = 'final'; world.t = 10; }
    } else if (world.phase === 'final' && world.t <= 0) { world.phase = 'done'; onEnd(); }
  }
  // round over: lone survivor scores + wins, bombs cleared
  function endBombRound(ps, alive) {
    const w = alive[0];
    if (w) { w.pts += world.outCount + 2; w.wins++; w.place = 1; w.bomb = false; world.winner = w.id; events.push(['w', w.id]); }
    world.phase = 'round'; world.t = world.mode === 'attract' ? 2.5 : 4.5;
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract'; world.round = 1;
    addBots(ATTRACT_BOTS);
    startRound();
  }

  // Game > match: humans then bots, round 1 starts at once (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    world.mode = 'match'; world.round = 1;
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    startRound();
  }
  // Multiplayer > roster: a leaving bomb holder hands it to the nearest player; a joiner replaces a bot when all 14 seats are taken and plays from the next round
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) { handOffBomb(p); removePlayer(p.id); }
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  }
  function handOffBomb(p) {
    if (!p.bomb || !p.alive) return;
    const dist = (o) => Math.hypot(o.x - p.x, o.z - p.z);
    const nearest = [...world.players.values()].filter((o) => o.alive && !o.bomb && o !== p).sort((a, b) => dist(a) - dist(b))[0];
    if (nearest) nearest.bomb = true;
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      // knocked-out bots go first
      const bot = [...world.players.values()].filter((q) => q.bot).sort((a, b) => a.alive - b.alive || a.pts - b.pts)[0];
      if (!bot) return;
      removePlayer(bot.id);
    }
    const joiner = addPlayer(h.id, h.nick, h.color, false);
    if (world.phase !== 'count') joiner.alive = false;
  }
  // Multiplayer > guest input { x, z, d: dash press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.x), mz: axis(inp.z) });
    applyPresses(p, { dashSeq: ['lastDash', inp.d] });
  }
  // Run engine > one fixed step for every player
  function step() {
    const ps = [...world.players.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepPlayer(p, STEP);
    bump(ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per player, events since the last one
  const playerFlags = (p) => (p.bot ? 1 : 0) | (p.alive ? 2 : 0) | (p.bomb ? 4 : 0) | (p.dashT > 0 ? 8 : 0);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), rd: world.round, fu: f2(world.fuse), fm: f2(world.fuseMax), oc: world.outCount, win: world.winner,
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.face), playerFlags(p), p.pts, p.wins, p.place]),
    }, ps);
    if (events.length) snap.ev = events;
    events = [];
    return snap;
  }

  return {
    world, addPlayer, removePlayer, clearPlayers, stepPlayer, startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get events() { return events; },
    set events(list) { events = list; },
  };
}
