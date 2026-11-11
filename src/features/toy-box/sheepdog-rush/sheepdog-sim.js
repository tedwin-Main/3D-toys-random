// Runs Sheepdog Rush rules (dogs, barks, fleeing flock, pen gates, scoring, bots, match clock) with no rendering, for page attract, guest prediction and the relay server host.

import { pickLeader } from '../common/pick-leader.js';
import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const R_FIELD = 28, GATE_W = 4.4, WIN_N = 30, SPEED = 8.5, S_MAX = 6, BARK_R = 9;
const PEN_A0 = 0.3, GATE_HALF = GATE_W / 2 / R_FIELD; // first pen angle; half gate width as field angle
// pen k of n sits at this angle around the ring fence
export const penAngle = (k, n) => (k / n) * Math.PI * 2 + PEN_A0;
const MATCH_T = 150, DR = 0.55, FLEE_R = 6.5, BARK_CD = 1.8, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const OVERTIME = 15; // s added once when the lead is tied at time-up
const BOT_NAMES = ['Shep', 'Bess', 'Fly', 'Moss', 'Rex', 'Nell', 'Gyp', 'Jess', 'Cap', 'Floss', 'Bob', 'Meg', 'Tess', 'Sweep'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f1 = (v) => Math.round(v * 10) / 10, f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): final standings ran out (host goes back to the lobby) */
export function createSheepdogSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 3, left: MATCH_T, players: new Map(), sheep: [], winner: null };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, pen: 99, x: 0, z: 0, vx: 0, vz: 0, face: 0, mx: 0, mz: 0, barkSeq: 0, lastBark: 0, barkCD: 0, barkT: 0, score: 0, skill: 0.55 + rng() * 0.4, aim: null, aimT: 0 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  // Run engine > which pen gate (if any) is at this field angle; pens sit evenly around the ring, one per dog
  function gateAt(x, z) {
    const n = world.players.size;
    if (!n) return -1;
    const th = Math.atan2(x, z), k = ((Math.round((th - PEN_A0) / ((Math.PI * 2) / n)) % n) + n) % n, a = penAngle(k, n);
    return Math.abs(Math.atan2(Math.sin(th - a), Math.cos(th - a))) < GATE_HALF ? k : -1;
  }
  function spawnSheep(s) {
    const a = rng() * Math.PI * 2, r = rng() * 9;
    // golden fleece is rare and worth 3, so packs of dogs fight over it
    Object.assign(s, { x: Math.sin(a) * r, z: Math.cos(a) * r, vx: 0, vz: 0, dead: 0, gold: rng() < 0.08, boost: 0, wa: rng() * 7, wt: rng() * 2, ws: 0.5 });
  }
  // match start shuffles pens (join order never fixes whose pen sits beside whose); roster changes keep current order
  function assignPens(shuffle = false) {
    const ps = [...world.players.values()];
    if (shuffle) shuffleInPlace(ps, rng); else ps.sort((a, b) => a.pen - b.pen);
    ps.forEach((p, k) => (p.pen = k));
  }
  function beginMatch() {
    assignPens(true);
    const ps = [...world.players.values()], n = ps.length;
    ps.forEach((p) => { const a = penAngle(p.pen, n); Object.assign(p, { x: Math.sin(a) * (R_FIELD - 4), z: Math.cos(a) * (R_FIELD - 4), vx: 0, vz: 0, face: a + Math.PI, score: 0, barkCD: 0, aim: null }); });
    world.sheep = Array.from({ length: Math.min(50, Math.max(22, 16 + n * 3)) }, () => { const s = {}; spawnSheep(s); return s; });
    Object.assign(world, { phase: 'count', t: world.mode === 'attract' ? 1.5 : 3.5, left: world.mode === 'attract' ? 60 : MATCH_T, winner: null });
  }

  // Run engine > dogs: run, bark impulse on nearby sheep, stay inside the ring fence
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function stepDog(p, dt) {
    const frozen = world.phase !== 'play';
    let mx = frozen ? 0 : p.mx, mz = frozen ? 0 : p.mz;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const acc = 46 * dt;
    p.vx += clamp(mx * SPEED - p.vx, -acc, acc);
    p.vz += clamp(mz * SPEED - p.vz, -acc, acc);
    if (ml > 0.1) p.face = Math.atan2(mx, mz);
    p.x += p.vx * dt; p.z += p.vz * dt;
    const r = Math.hypot(p.x, p.z);
    if (r > R_FIELD - 0.7) { p.x *= (R_FIELD - 0.7) / r; p.z *= (R_FIELD - 0.7) / r; }
    p.barkCD -= dt; p.barkT -= dt;
    if (p.barkSeq !== p.lastBark) {
      p.lastBark = p.barkSeq;
      if (p.barkCD <= 0 && !frozen) {
        p.barkCD = BARK_CD; p.barkT = 0.3;
        for (const s of world.sheep) {
          if (s.dead) continue;
          const dx = s.x - p.x, dz = s.z - p.z, l = Math.hypot(dx, dz);
          if (l < BARK_R && l > 1e-3) { const k = 4 + 9 * (1 - l / BARK_R); s.vx += (dx / l) * k; s.vz += (dz / l) * k; s.boost = 0.7; }
        }
        events.push(['b', p.id]);
      }
    }
  }
  function bumpDogs(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > DR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (DR * 2 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
    }
  }

  // Run engine > flock: flee dogs, separate, loose cohesion, graze-wander, ring fence with gate openings into pens
  function stepSheep(s, dt, dogs) {
    if (s.dead > 0) { s.dead -= dt; if (s.dead <= 0) { spawnSheep(s); events.push(['n', world.sheep.indexOf(s)]); } return; }
    let ax = 0, az = 0, panic = 0, cx = 0, cz = 0, cn = 0;
    for (const d of dogs) {
      const dx = s.x - d.x, dz = s.z - d.z, l = Math.hypot(dx, dz);
      if (l < FLEE_R && l > 1e-3) { const w = 1 - l / FLEE_R; ax += (dx / l) * w * 30; az += (dz / l) * w * 30; panic = Math.max(panic, w); }
      // dogs are solid: sheep get shoved out of the way
      if (l < 1.05 && l > 1e-3) { s.x = d.x + (dx / l) * 1.05; s.z = d.z + (dz / l) * 1.05; }
    }
    for (const o of world.sheep) {
      if (o === s || o.dead) continue;
      const dx = s.x - o.x, dz = s.z - o.z, l2 = dx * dx + dz * dz;
      if (l2 > 49) continue;
      cx += o.x; cz += o.z; cn++;
      if (l2 < 1.69 && l2 > 1e-6) { const l = Math.sqrt(l2); ax += (dx / l) * (1.3 - l) * 16; az += (dz / l) * (1.3 - l) * 16; }
    }
    if (cn) { ax += (cx / cn - s.x) * 0.5; az += (cz / cn - s.z) * 0.5; }
    if (panic < 0.05) {
      s.wt -= dt;
      if (s.wt <= 0) { s.wt = 1 + rng() * 3; s.wa = rng() * Math.PI * 2; s.ws = rng() < 0.4 ? 0 : 0.7; }
      ax += (Math.sin(s.wa) * s.ws - s.vx) * 2; az += (Math.cos(s.wa) * s.ws - s.vz) * 2;
    }
    s.vx += ax * dt; s.vz += az * dt;
    const damp = Math.exp(-dt * (panic > 0.05 ? 1.2 : 3));
    s.vx *= damp; s.vz *= damp;
    s.boost -= dt;
    const sp = Math.hypot(s.vx, s.vz), max = s.boost > 0 ? 10 : S_MAX;
    if (sp > max) { s.vx *= max / sp; s.vz *= max / sp; }
    s.x += s.vx * dt; s.z += s.vz * dt;
    const r = Math.hypot(s.x, s.z);
    if (r < R_FIELD - 0.5) return;
    const k = gateAt(s.x, s.z);
    if (k >= 0) { if (r > R_FIELD + 1.6) penSheep(s, k); return; }
    // off a gate: fence stops it (also catches sheep sliding sideways out of a gate mouth)
    s.x *= (R_FIELD - 0.5) / r; s.z *= (R_FIELD - 0.5) / r;
    const vr = (s.vx * s.x + s.vz * s.z) / (R_FIELD - 0.5);
    if (vr > 0) { s.vx -= (vr * s.x) / (R_FIELD - 0.5); s.vz -= (vr * s.z) / (R_FIELD - 0.5); }
  }
  function penSheep(s, k) {
    const owner = [...world.players.values()].find((p) => p.pen === k);
    const pts = s.gold ? 3 : 1;
    if (owner && world.phase === 'play') owner.score += pts;
    events.push(['p', owner?.id ?? 0, +s.x.toFixed(1), +s.z.toFixed(1), s.gold ? 1 : 0]);
    s.dead = 1.5; s.vx = s.vz = 0;
  }

  // Run engine > bots: pick a sheep near own gate, circle behind it, walk it in, bark when lined up
  function botThink(p, dt) {
    const n = world.players.size, a = penAngle(p.pen, n), gx = Math.sin(a) * (R_FIELD + 1), gz = Math.cos(a) * (R_FIELD + 1);
    p.aimT -= dt;
    let s = p.aim !== null ? world.sheep[p.aim] : null;
    if (!s || s.dead || p.aimT <= 0) {
      let best = -1, bc = Infinity;
      world.sheep.forEach((q, i) => {
        if (q.dead) return;
        const c = Math.hypot(q.x - p.x, q.z - p.z) * 0.6 + Math.hypot(q.x - gx, q.z - gz) - (q.gold ? 10 : 0) + rng() * 4;
        if (c < bc) { bc = c; best = i; }
      });
      p.aim = best < 0 ? null : best; p.aimT = 2 + rng() * 2;
      s = p.aim !== null ? world.sheep[p.aim] : null;
    }
    if (!s) { p.mx = p.mz = 0; return; }
    const sgx = gx - s.x, sgz = gz - s.z, sgl = Math.hypot(sgx, sgz) || 1, ux = sgx / sgl, uz = sgz / sgl;
    const dx = p.x - s.x, dz = p.z - s.z, along = dx * ux + dz * uz;
    let tx, tz, k = 1;
    if (along > -1.5) {
      // dog is between sheep and gate: swing wide around the side it is already on
      const side = dx * -uz + dz * ux >= 0 ? 1 : -1;
      tx = s.x - uz * side * 4.5 - ux * 2; tz = s.z + ux * side * 4.5 - uz * 2;
    } else {
      const hx = s.x - ux * 3.2, hz = s.z - uz * 3.2;
      if (Math.hypot(p.x - hx, p.z - hz) > 1.6) { tx = hx; tz = hz; }
      else { tx = s.x + ux * 2; tz = s.z + uz * 2; k = 0.45 + p.skill * 0.25; }
      if (p.barkCD <= 0 && sgl < 13 && Math.hypot(dx, dz) < 4.5 && rng() < 0.03 * p.skill) p.barkSeq++;
    }
    const r = Math.hypot(tx, tz);
    if (r > R_FIELD - 1) { tx *= (R_FIELD - 1) / r; tz *= (R_FIELD - 1) / r; }
    const lx = tx - p.x, lz = tz - p.z, l = Math.hypot(lx, lz);
    if (l > 1e-3) { const m = Math.min(1, l / 0.8) * k * (0.8 + p.skill * 0.2); p.mx = (lx / l) * m; p.mz = (lz / l) * m; } else p.mx = p.mz = 0;
  }

  // Game > Phases: countdown, play, final standings
  function phases(dt) {
    const ps = [...world.players.values()];
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { lastBeep = 0; events.push(['c', 0]); world.phase = 'play'; }
    } else if (world.phase === 'play') {
      world.left -= dt;
      const { winner: top, tied } = pickLeader(ps, (p) => p.score);
      // tied scoring lead at time-up: one overtime, then a draw (join order never breaks a tie)
      if (world.left <= 0 && !top && tied[0]?.score > 0 && !world.overtime && world.mode === 'match') { world.overtime = true; world.left = OVERTIME; }
      else if (world.left <= 0 || (top && top.score >= WIN_N)) {
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

  // Game > match: humans then bots, pens shuffled around the ring (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop; pens follow the seat list, so any join or leave re-spaces them around the ring
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id)), before = world.players.size;
    let changed = false;
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) { removePlayer(p.id); changed = true; }
    for (const h of humans) if (!world.players.has(h.id)) { joinLate(h); changed = true; }
    if (changed || before !== world.players.size) assignPens();
  }
  // keep 14 seats: a late human takes over the lowest-scoring bot's pen and count
  function joinLate(h) {
    const bot = world.players.size >= MAX_PLAYERS ? [...world.players.values()].filter((q) => q.bot).sort((a, b) => a.score - b.score)[0] : null;
    if (world.players.size >= MAX_PLAYERS && !bot) return;
    const late = addPlayer(h.id, h.nick, h.color, false);
    if (!bot) return;
    Object.assign(late, { x: bot.x, z: bot.z, score: bot.score, pen: bot.pen });
    removePlayer(bot.id);
  }
  // Multiplayer > guest input { x, z, b: bark press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.x), mz: axis(inp.z) });
    applyPresses(p, { barkSeq: ['lastBark', inp.b] });
  }
  // Run engine > one fixed step for dogs then the flock
  function step() {
    const ps = [...world.players.values()];
    if (world.phase === 'play') for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepDog(p, STEP);
    bumpDogs(ps);
    for (const s of world.sheep) stepSheep(s, STEP, ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per dog; flock packed flat as x, z, flags per sheep; events since the last one
  const dogFlags = (p) => (p.bot ? 1 : 0) | (p.barkT > 0 ? 2 : 0);
  const sheepFlags = (s) => (s.gold ? 1 : 0) | (s.dead > 0 ? 2 : 0);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), lf: f2(world.left), win: world.winner,
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.face), dogFlags(p), p.score, p.pen]),
      S: world.sheep.flatMap((s) => [f1(s.x), f1(s.z), sheepFlags(s)]),
    }, ps);
    if (events.length) snap.ev = events;
    events = [];
    return snap;
  }

  return {
    world, addPlayer, removePlayer, clearPlayers, stepDog, startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get events() { return events; },
    set events(list) { events = list; },
  };
}
