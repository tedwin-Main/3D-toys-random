// Runs Crown Keep rules (movement, shove dash, island falls, crown ring scoring and hops, bots) with no rendering, for page attract, guest prediction and the relay server host.

import { pickLeader } from '../common/pick-leader.js';
import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const R_ISLE = 22, ZONE_R = 4.2, WIN_PTS = 60, SPEED = 7.2;
// ring spots: summit in the middle, six hilltops around it
export const ZONES = [[0, 0], ...Array.from({ length: 6 }, (_, k) => { const a = (k / 6) * Math.PI * 2 + 0.5; return [Math.cos(a) * 12.5, Math.sin(a) * 12.5]; })];
const MATCH_T = 150, HOP_T = 18, PR = 0.78, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const OVERTIME = 15; // s added once when the lead is tied at time-up
const BOT_NAMES = ['Sir Bonk', 'Dame Wobble', 'Lancelot', 'Gawain', 'Percy', 'Morgana', 'Tristan', 'Bedivere', 'Galahad', 'Elaine', 'Kay', 'Mordred', 'Isolde', 'Merlin'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): final standings timer ran out (host goes back to the lobby) */
export function createCrownSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 3, left: MATCH_T, zone: 0, next: 1, hopT: HOP_T, hold: 0, crowd: 0, players: new Map(), winner: null };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, y: 0, z: 0, vx: 0, vz: 0, vy: 0, face: 0, fall: 0, stun: 0, dashT: 0, dashCD: 0, mx: 0, mz: 0, dashSeq: 0, lastDash: 0, pts: 0, falls: 0, skill: 0.6 + rng() * 0.35, wander: rng() * 6, lastWhole: 0 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function edgeSpawn(p, a) { Object.assign(p, { x: Math.sin(a) * (R_ISLE - 3), z: Math.cos(a) * (R_ISLE - 3), y: 0, vx: 0, vz: 0, vy: 0, face: a + Math.PI, fall: 0, stun: 0, dashT: 0 }); }
  function pickNext(cur) { let n; do n = Math.floor(rng() * ZONES.length); while (n === cur); return n; }
  function beginMatch() {
    // shuffled slots on a randomly turned ring + random first hill: join order never picks who starts nearest the ring
    const ps = [...world.players.values()], off = rng() * Math.PI * 2, zone = Math.floor(rng() * ZONES.length);
    shuffleInPlace(ps, rng);
    ps.forEach((p, k) => { edgeSpawn(p, off + (k / ps.length) * Math.PI * 2); p.pts = 0; p.falls = 0; p.lastWhole = 0; });
    Object.assign(world, { phase: 'count', t: world.mode === 'attract' ? 1.5 : 3.5, left: world.mode === 'attract' ? 60 : MATCH_T, zone, next: pickNext(zone), hopT: HOP_T, hold: 0, crowd: 0, winner: null });
  }

  // Run engine > movement, shove dash, island edge falls + respawn
  function stepPlayer(p, dt) {
    if (p.fall > 0) {
      p.fall += dt; p.vy -= 30 * dt; p.y += p.vy * dt; p.x += p.vx * dt; p.z += p.vz * dt;
      if (p.fall > 1.6) { edgeSpawn(p, rng() * Math.PI * 2); events.push(['r', p.id]); }
      return;
    }
    const frozen = world.phase !== 'play';
    let mx = frozen ? 0 : p.mx, mz = frozen ? 0 : p.mz;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    if (p.dashSeq !== p.lastDash) {
      p.lastDash = p.dashSeq;
      if (p.dashCD <= 0 && !frozen && p.stun <= 0) {
        const dl = ml > 0.1, dx = dl ? mx : Math.sin(p.face), dz = dl ? mz : Math.cos(p.face);
        p.vx = dx * 18; p.vz = dz * 18; p.dashT = 0.24; p.dashCD = 1.3;
        events.push(['d', p.id]);
      }
    }
    p.dashT -= dt; p.dashCD -= dt; p.stun -= dt;
    if (p.stun > 0) { const f = Math.exp(-dt * 2.2); p.vx *= f; p.vz *= f; }
    else if (p.dashT <= 0) {
      const acc = 44 * dt;
      p.vx += clamp(mx * SPEED - p.vx, -acc, acc);
      p.vz += clamp(mz * SPEED - p.vz, -acc, acc);
    }
    if (ml > 0.1 && p.stun <= 0) p.face = Math.atan2(mx, mz);
    p.x += p.vx * dt; p.z += p.vz * dt;
    if (Math.hypot(p.x, p.z) > R_ISLE + 0.2) { p.fall = 0.001; p.vy = 2; p.falls++; events.push(['f', p.id]); }
  }
  function bump(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.fall || b.fall) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > PR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (PR * 2 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) { a.vx += nx * vr * 0.6; a.vz += nz * vr * 0.6; b.vx -= nx * vr * 0.6; b.vz -= nz * vr * 0.6; }
      // a dashing knight launches whoever it hits; stun keeps the victim from walking the hit off
      const [hit, by, s] = a.dashT > 0 && b.dashT <= 0 ? [b, a, 1] : b.dashT > 0 && a.dashT <= 0 ? [a, b, -1] : [null];
      if (hit && hit.stun <= 0.1) {
        hit.vx = nx * s * 15 + by.vx * 0.3; hit.vz = nz * s * 15 + by.vz * 0.3; hit.stun = 0.55;
        by.vx *= 0.2; by.vz *= 0.2; by.dashT = 0;
        events.push(['s', by.id, hit.id, +((a.x + b.x) / 2).toFixed(1), +((a.z + b.z) / 2).toFixed(1)]);
      }
    }
  }

  // Run engine > bots: walk to the ring, shove rivals out of it, stay off the cliff edge
  function botThink(p, dt) {
    if (p.fall) return;
    const [zx, zz] = ZONES[world.zone], ps = [...world.players.values()];
    let tx = zx - p.x, tz = zz - p.z;
    const dz = Math.hypot(tx, tz);
    const rivals = ps.filter((q) => q !== p && !q.fall && Math.hypot(q.x - zx, q.z - zz) < ZONE_R + 2);
    if (dz < ZONE_R + 3 && rivals.length) {
      let best = null, bd = Infinity;
      for (const q of rivals) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = q; } }
      // line up on the far side of the rival so the shove points outward from the ring center
      const ox = best.x - zx, oz = best.z - zz, ol = Math.hypot(ox, oz) || 1;
      const ax = best.x - (ox / ol) * 1.2, az = best.z - (oz / ol) * 1.2;
      tx = (bd > 2.6 ? ax : best.x) - p.x; tz = (bd > 2.6 ? az : best.z) - p.z;
      if (bd < 3.4 && p.dashCD <= 0 && rng() < p.skill * 0.12) p.dashSeq++;
    } else if (dz < ZONE_R - 1.5) {
      p.wander += dt * 1.3;
      tx = Math.cos(p.wander) * 0.4; tz = Math.sin(p.wander) * 0.4;
    }
    const r = Math.hypot(p.x, p.z);
    if (r > R_ISLE - 4) { tx -= (p.x / r) * (r - (R_ISLE - 4)) * 1.5; tz -= (p.z / r) * (r - (R_ISLE - 4)) * 1.5; }
    const l = Math.hypot(tx, tz);
    if (l > 1e-4) { const k = Math.min(1, l / 0.6) * (0.75 + p.skill * 0.25); p.mx = (tx / l) * k; p.mz = (tz / l) * k; } else { p.mx = p.mz = 0; }
  }

  // Game > Phases: countdown, play (ring scoring + hops), final standings
  function phases(dt) {
    const ps = [...world.players.values()];
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { events.push(['c', 0]); world.phase = 'play'; }
    } else if (world.phase === 'play') {
      world.left -= dt; world.hopT -= dt;
      const [zx, zz] = ZONES[world.zone];
      const inside = ps.filter((p) => !p.fall && Math.hypot(p.x - zx, p.z - zz) < ZONE_R);
      world.hold = inside.length === 1 ? inside[0].id : 0;
      world.crowd = inside.length;
      // 1 pt/s shared by everyone in the ring: alone scores full rate, a crowd splits it
      for (const k of inside) {
        k.pts += dt / inside.length;
        if (Math.floor(k.pts) !== k.lastWhole) { k.lastWhole = Math.floor(k.pts); events.push(['p', k.id]); }
      }
      if (world.hopT <= 0) { world.zone = world.next; world.next = pickNext(world.zone); world.hopT = HOP_T; events.push(['m']); }
      const { winner: top, tied } = pickLeader(ps, (p) => p.pts);
      // tied scoring lead at time-up: one overtime, then a draw (join order never breaks a tie)
      if (world.left <= 0 && !top && tied[0]?.pts > 0 && !world.overtime && world.mode === 'match') { world.overtime = true; world.left = OVERTIME; }
      else if (world.left <= 0 || (top && top.pts >= WIN_PTS)) {
        world.winner = top?.id ?? null; world.overtime = false;
        if (top) events.push(['w', top.id]);
        world.phase = 'final'; world.t = world.mode === 'attract' ? 3 : 10;
      }
    } else if (world.phase === 'final' && world.t <= 0) {
      if (world.mode === 'attract') beginMatch();
      else { world.phase = 'done'; onEnd(); }
    }
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract';
    addBots(ATTRACT_BOTS);
    beginMatch();
  }

  // Game > match: humans then bots, countdown starts at once (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop; a late human takes the lowest-scoring bot's place when all 14 seats are taken
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      const bot = [...world.players.values()].filter((q) => q.bot).sort((a, b) => a.pts - b.pts)[0];
      if (!bot) return;
      removePlayer(bot.id);
    }
    edgeSpawn(addPlayer(h.id, h.nick, h.color, false), rng() * Math.PI * 2);
  }
  // Multiplayer > guest input { x, z, d: dash press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.x), mz: axis(inp.z) });
    applyPresses(p, { dashSeq: ['lastDash', inp.d] });
  }
  // Run engine > one fixed step for every knight
  function step() {
    const ps = [...world.players.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepPlayer(p, STEP);
    bump(ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per knight, events since the last one
  const knightFlags = (p) => (p.bot ? 1 : 0) | (p.fall ? 2 : 0) | (p.dashT > 0 ? 4 : 0) | (p.stun > 0 ? 8 : 0);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), lf: f2(world.left), z: world.zone, nz: world.next, ht: f2(world.hopT), h: world.hold, n: world.crowd, win: world.winner,
      P: ps.map((p) => [p.id, f2(p.x), f2(p.y), f2(p.z), f2(p.vx), f2(p.vz), f2(p.face), knightFlags(p), f2(p.pts), p.falls]),
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
