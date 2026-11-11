// Runs Balloon Battle rules (lance scooters, tail pops, spare pickups, ghosts, bots, match clock) with no rendering, for page attract, guest prediction and the relay server host.

import { pickLeader } from '../common/pick-leader.js';
import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
export const R_ARENA = 26, WIN_POPS = 20, MAX_BAL = 5, TAIL = 1.25, PICK_N = 4;
// center carousel + ring of 5 posts: [x, z, radius]
export const PILLARS = [[0, 0, 3.2], ...Array.from({ length: 5 }, (_, k) => { const a = (k / 5) * Math.PI * 2 + 0.6; return [Math.sin(a) * 14, Math.cos(a) * 14, 1.3]; })];
const LANCE = 1.35, HIT_R = 1.25, SR = 0.8;
const MATCH_T = 150, SPEED = 9, TURN = 3.4, DASH_V = 19, OUT_T = 4, START_BAL = 3, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const OVERTIME = 15; // s added once when the lead is tied at time-up
const BOT_NAMES = ['Poppy', 'Bingo', 'Squeak', 'Twirl', 'Pinky', 'Zippo', 'Bubbles', 'Dizzy', 'Fizz', 'Noodle', 'Sprocket', 'Jinx', 'Tango', 'Sparky'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): final standings ran out (host goes back to the lobby) */
export function createBalloonSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 3, left: MATCH_T, players: new Map(), picks: [], winner: null };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, h: 0, mx: 0, mz: 0, dashSeq: 0, lastDash: 0, dashT: 0, dashCD: 0, bal: START_BAL, pops: 0, outs: 0, out: 0, inv: 0, lastHit: 0, skill: 0.5 + rng() * 0.45, tgt: null, tgtT: 0, wiggle: rng() * 6 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function rimSpawn(p, a) { Object.assign(p, { x: Math.sin(a) * (R_ARENA - 3), z: Math.cos(a) * (R_ARENA - 3), vx: 0, vz: 0, h: a + Math.PI, dashT: 0, bal: START_BAL, out: 0, inv: 2 }); }
  function placePick(k) {
    // random open spot: off the pillars, inside the rim
    for (let tries = 0; tries < 20; tries++) {
      const a = rng() * Math.PI * 2, r = 5 + rng() * (R_ARENA - 8), x = Math.sin(a) * r, z = Math.cos(a) * r;
      if (PILLARS.every(([px, pz, pr]) => Math.hypot(x - px, z - pz) > pr + 1.5)) { world.picks[k] = { x, z, t: 0 }; return; }
    }
  }
  function beginMatch() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...world.players.values()], rng);
    ps.forEach((p, k) => { rimSpawn(p, (k / ps.length) * Math.PI * 2); p.pops = 0; p.outs = 0; p.inv = 0; });
    world.picks = [];
    for (let k = 0; k < PICK_N; k++) placePick(k);
    Object.assign(world, { phase: 'count', t: world.mode === 'attract' ? 1.5 : 3.5, left: world.mode === 'attract' ? 60 : MATCH_T, winner: null });
  }

  // Run engine > scooter steering (stick sets heading + throttle, limited turn rate), dash, rim + pillar bounces, ghosts
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function stepPlayer(p, dt) {
    p.inv -= dt; p.dashT -= dt; p.dashCD -= dt;
    if (p.out > 0) {
      p.out -= dt;
      if (p.out <= 0) { rimSpawn(p, rng() * Math.PI * 2); events.push(['r', p.id]); }
    }
    const frozen = world.phase !== 'play';
    let mx = frozen ? 0 : p.mx, mz = frozen ? 0 : p.mz;
    const ml = Math.min(1, Math.hypot(mx, mz));
    // turn rate cap is the whole game: you can't spin instantly to guard your balloons
    if (ml > 0.15) { let dh = Math.atan2(mx, mz) - p.h; dh = Math.atan2(Math.sin(dh), Math.cos(dh)); p.h += clamp(dh, -TURN * dt, TURN * dt); }
    const fx = Math.sin(p.h), fz = Math.cos(p.h);
    if (p.dashSeq !== p.lastDash) {
      p.lastDash = p.dashSeq;
      if (p.dashCD <= 0 && !frozen && !p.out) { p.vx = fx * DASH_V; p.vz = fz * DASH_V; p.dashT = 0.35; p.dashCD = 2.2; events.push(['d', p.id]); }
    }
    if (p.dashT <= 0) {
      const k = Math.min(1, dt * 3.2), sp = SPEED * (ml > 0.15 ? ml : 0) * (p.out ? 1.1 : 1);
      p.vx += (fx * sp - p.vx) * k; p.vz += (fz * sp - p.vz) * k;
    }
    p.x += p.vx * dt; p.z += p.vz * dt;
    const r = Math.hypot(p.x, p.z);
    if (r > R_ARENA - SR) {
      const nx = p.x / r, nz = p.z / r, vn = p.vx * nx + p.vz * nz;
      p.x = nx * (R_ARENA - SR); p.z = nz * (R_ARENA - SR);
      if (vn > 0) { p.vx -= 1.6 * vn * nx; p.vz -= 1.6 * vn * nz; }
    }
    if (p.out) return;
    for (const [px, pz, pr] of PILLARS) {
      const dx = p.x - px, dz = p.z - pz, d = Math.hypot(dx, dz);
      if (d < pr + SR && d > 1e-4) {
        const nx = dx / d, nz = dz / d, vn = p.vx * nx + p.vz * nz;
        p.x = px + nx * (pr + SR); p.z = pz + nz * (pr + SR);
        if (vn < 0) { p.vx -= 1.6 * vn * nx; p.vz -= 1.6 * vn * nz; }
      }
    }
    world.picks.forEach((k, i) => {
      if (!k || k.t > 0 || p.bal >= MAX_BAL) return;
      if (Math.hypot(p.x - k.x, p.z - k.z) < 1.4) { p.bal++; k.t = 8; events.push(['g', p.id, i]); }
    });
  }
  // Run engine > lance vs tail hit test + body bumps (ghosts pass through everything)
  function contacts(ps) {
    for (const a of ps) {
      if (a.out || world.phase !== 'play') continue;
      const tx = a.x + Math.sin(a.h) * LANCE, tz = a.z + Math.cos(a.h) * LANCE;
      for (const b of ps) {
        if (b === a || b.out || b.inv > 0) continue;
        const bx = b.x - Math.sin(b.h) * TAIL, bz = b.z - Math.cos(b.h) * TAIL;
        if (Math.hypot(tx - bx, tz - bz) > HIT_R) continue;
        b.bal--; b.inv = 1; b.lastHit = a.id; a.pops++;
        b.vx += Math.sin(b.h) * 6; b.vz += Math.cos(b.h) * 6;
        if (b.bal <= 0) { b.out = OUT_T; b.outs++; }
        events.push(['p', a.id, b.id, +bx.toFixed(1), +bz.toFixed(1), b.bal <= 0 ? 1 : 0]);
      }
    }
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.out || b.out) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > SR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (SR * 2 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) {
        a.vx += nx * vr * 0.9; a.vz += nz * vr * 0.9; b.vx -= nx * vr * 0.9; b.vz -= nz * vr * 0.9;
        if (-vr > 5) events.push(['b', a.id, b.id]);
      }
    }
  }

  // Run engine > bots: grab spares when low, else stalk a rival's tail (swing wide of its lance), dash in for the poke, swerve when tailed
  function botThink(p, dt) {
    if (p.out) { p.mx = Math.sin(p.wiggle) * 0.4; p.mz = Math.cos(p.wiggle) * 0.4; p.wiggle += dt; return; }
    const ps = [...world.players.values()].filter((q) => q !== p && !q.out);
    let tx = 0, tz = 0, attack = null;
    const spare = p.bal < 3 && world.picks.filter((k) => k && k.t <= 0).sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0];
    p.tgtT -= dt;
    const cur = world.players.get(p.tgt);
    if (!cur || cur.out || p.tgtT <= 0) {
      const pick = ps.sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[Math.floor(rng() * Math.min(2, ps.length))];
      p.tgt = pick?.id ?? null; p.tgtT = 2.5 + rng() * 2.5;
    }
    const t = world.players.get(p.tgt);
    if (spare && Math.hypot(spare.x - p.x, spare.z - p.z) < 14) { tx = spare.x; tz = spare.z; }
    else if (t && !t.out) {
      const fx = Math.sin(t.h), fz = Math.cos(t.h), rx = p.x - t.x, rz = p.z - t.z;
      const behind = rx * fx + rz * fz < -0.5;
      if (behind) { tx = t.x - fx * TAIL; tz = t.z - fz * TAIL; attack = t; }
      else {
        // in front of the target: arc around its side to reach the tail without eating its lance
        const side = rx * fz - rz * fx >= 0 ? 1 : -1;
        tx = t.x + fz * side * 4 - fx * 3; tz = t.z - fx * side * 4 - fz * 3;
      }
    } else { tx = Math.sin(p.wiggle) * 10; tz = Math.cos(p.wiggle) * 10; p.wiggle += dt * 0.3; }
    // swerve when someone's lance is closing on our own tail
    const myTx = p.x - Math.sin(p.h) * TAIL, myTz = p.z - Math.cos(p.h) * TAIL;
    const threat = ps.find((q) => Math.hypot(q.x + Math.sin(q.h) * LANCE - myTx, q.z + Math.cos(q.h) * LANCE - myTz) < 3.2);
    if (threat && rng() < p.skill) { const s = Math.sin(p.wiggle * 3) > 0 ? 1 : -1; tx = p.x + Math.cos(p.h) * s * 6; tz = p.z - Math.sin(p.h) * s * 6; }
    let lx = tx - p.x, lz = tz - p.z;
    // steer around pillars
    for (const [px, pz, pr] of PILLARS) { const dx = p.x - px, dz = p.z - pz, d = Math.hypot(dx, dz); if (d < pr + 3) { lx += (dx / d) * (pr + 3 - d) * 2; lz += (dz / d) * (pr + 3 - d) * 2; } }
    const l = Math.hypot(lx, lz) || 1;
    p.mx = lx / l; p.mz = lz / l;
    if (attack && p.dashCD <= 0) {
      const dist = Math.hypot(attack.x - Math.sin(attack.h) * TAIL - (p.x + Math.sin(p.h) * LANCE), attack.z - Math.cos(attack.h) * TAIL - (p.z + Math.cos(p.h) * LANCE));
      const facing = (Math.sin(p.h) * lx + Math.cos(p.h) * lz) / l;
      if (dist < 5 && facing > 0.85 && rng() < 0.08 * p.skill) p.dashSeq++;
    }
  }

  // Game > Phases: countdown, play, final standings
  function phases(dt) {
    const ps = [...world.players.values()];
    world.t -= dt;
    for (const k of world.picks) if (k && k.t > 0) { k.t -= dt; if (k.t <= 0) placePick(world.picks.indexOf(k)); }
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { lastBeep = 0; events.push(['c', 0]); world.phase = 'play'; }
    } else if (world.phase === 'play') {
      world.left -= dt;
      const { winner: top, tied } = pickLeader(ps, (p) => p.pops);
      // tied scoring lead at time-up: one overtime, then a draw (join order never breaks a tie)
      if (world.left <= 0 && !top && tied[0]?.pops > 0 && !world.overtime && world.mode === 'match') { world.overtime = true; world.left = OVERTIME; }
      else if (world.left <= 0 || (top && top.pops >= WIN_POPS)) {
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

  // Game > match: humans then bots, shuffled onto the rim (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    slowFields.reset();
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop; a late human spawns on the rim (takes the lowest-scoring bot's seat when all 14 are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset(); // a late joiner gets the pickups in its first snapshot
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      const bot = [...world.players.values()].filter((q) => q.bot).sort((a, b) => a.pops - b.pops)[0];
      if (!bot) return;
      removePlayer(bot.id);
    }
    rimSpawn(addPlayer(h.id, h.nick, h.color, false), rng() * Math.PI * 2);
  }
  // Multiplayer > guest input { x, z, d: dash press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.x), mz: axis(inp.z) });
    applyPresses(p, { dashSeq: ['lastDash', inp.d] });
  }
  // Run engine > one fixed step for every scooter
  function step() {
    const ps = [...world.players.values()];
    if (world.phase === 'play') for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepPlayer(p, STEP);
    contacts(ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per scooter every time; pickups only when they change; events since the last one
  const scooterFlags = (p) => (p.bot ? 1 : 0) | (p.dashT > 0 ? 2 : 0) | (p.out > 0 ? 4 : 0) | (p.inv > 0 ? 8 : 0);
  const pickRow = (k) => (k ? [f2(k.x), f2(k.z), k.t > 0 ? 0 : 1] : [0, 0, 0]);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), lf: f2(world.left), win: world.winner,
      ...slowFields.pick({ K: world.picks.map(pickRow) }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.h), scooterFlags(p), p.bal, p.pops, p.outs]),
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
