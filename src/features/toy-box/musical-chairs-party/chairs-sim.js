// Runs Chair Scramble rules (dance, chair pop-ups, shove dash, claims, eliminations, bots) with no rendering, for page attract, guest prediction and the relay server host.

import { axis } from '../common/guest-input.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
export const R = 14; // stage radius
export const DASH_CD = 1.4;
const PR = 0.55, SPEED = 7, DASH_V = 15, CHAIR_R = 0.75, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const BOT_NAMES = ['Boogie', 'Disco', 'Funky', 'Groove', 'Shimmy', 'Twist', 'Hustle', 'Moonwalk', 'Salsa', 'Tango', 'Waltz', 'Robot', 'Cha-Cha', 'Mambo'];
const BOT_COLORS = ['#ff5d73', '#3fa7ff', '#ffb000', '#2ec27e', '#a970ff', '#ff7b2f', '#00c2c7', '#ff5fbf', '#8bc34a', '#5c6bc0', '#e0b04a', '#26a69a', '#7ae7ff', '#c0ca33'];
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): winner banner ran out (host goes back to the lobby) */
export function createChairsSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 2, round: 0, players: new Map(), chairs: [], claimT: 0, winner: null };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, face: 0, seat: -1, out: false, dashT: 0, dashCd: 0, mx: 0, mz: 0, dash: 0, skill: 0.55 + rng() * 0.4, react: 0, think: 0, wx: 0, wz: 0, target: -1, place: 0 };
    world.players.set(id, p);
    return p;
  }
  // a leaver's chair frees up
  function removePlayer(id) { const p = world.players.get(id); if (p?.seat >= 0 && world.chairs[p.seat]) world.chairs[p.seat].by = null; world.players.delete(id); }
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  const alive = () => [...world.players.values()].filter((p) => !p.out);
  function newMatch() {
    const ps = [...world.players.values()];
    ps.forEach((p, i) => {
      const a = (i / ps.length) * Math.PI * 2;
      Object.assign(p, { x: Math.cos(a) * 9, z: Math.sin(a) * 9, vx: 0, vz: 0, seat: -1, out: false, place: 0 });
    });
    world.round = 0; world.chairs = []; world.winner = null;
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3;
  }
  function startRound() {
    world.round++;
    for (const p of world.players.values()) p.seat = -1;
    world.chairs = [];
    world.phase = 'music';
    const n = alive().length;
    world.t = world.mode === 'attract' ? 3 + rng() * 3 : 5 + rng() * 8 - Math.min(n, 6) * 0.2;
    events.push(['m', world.round]);
  }
  function popChairs() {
    const n = Math.max(1, alive().length - 1), cs = [];
    for (let tries = 0; cs.length < n && tries < 4000; tries++) {
      const a = rng() * Math.PI * 2, r = Math.sqrt(rng()) * (R - 2.5), x = Math.cos(a) * r, z = Math.sin(a) * r;
      if (cs.every(([cx, cz]) => Math.hypot(cx - x, cz - z) > 3.4 - Math.min(tries / 2000, 1))) cs.push([+x.toFixed(2), +z.toFixed(2), +(rng() * 6.28).toFixed(2)]);
    }
    // nudge anyone standing right on a chair spot so the claim is a race, not a gift
    for (const p of alive()) for (const [cx, cz] of cs) {
      const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d < CHAIR_R + PR + 0.4) { const k = (CHAIR_R + PR + 0.6) / (d || 1); p.x = cx + (d ? dx : 1) * k; p.z = cz + (d ? dz : 0) * k; }
    }
    world.chairs = cs.map(([x, z, h]) => ({ x, z, h, by: null }));
    world.phase = 'scramble'; world.t = 8; world.claimT = 0.35;
    events.push(['x']);
  }

  // Run engine > movement, shove dash, bumps, chair claims
  function stepPlayer(p, dt) {
    p.dashCd = Math.max(0, p.dashCd - dt); p.dashT = Math.max(0, p.dashT - dt);
    if (p.seat >= 0) { const c = world.chairs[p.seat]; p.x = c.x; p.z = c.z; p.vx = p.vz = 0; return; }
    const can = world.phase === 'music' || world.phase === 'scramble' || p.out;
    let mx = can ? p.mx : 0, mz = can ? p.mz : 0;
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    const k = 1 - Math.exp(-dt * (p.dashT > 0 ? 1.5 : 9));
    p.vx += (mx * SPEED - p.vx) * k; p.vz += (mz * SPEED - p.vz) * k;
    if (can && p.dash && p.dashCd <= 0 && !p.out) {
      const fx = ml > 0.1 ? mx : Math.sin(p.face), fz = ml > 0.1 ? mz : Math.cos(p.face), fl = Math.hypot(fx, fz) || 1;
      p.vx = (fx / fl) * DASH_V; p.vz = (fz / fl) * DASH_V; p.dashT = 0.28; p.dashCd = DASH_CD;
      events.push(['d', p.id]);
    }
    p.dash = 0;
    p.x += p.vx * dt; p.z += p.vz * dt;
    const sp = Math.hypot(p.vx, p.vz);
    if (sp > 0.6) p.face = Math.atan2(p.vx, p.vz);
    const r = Math.hypot(p.x, p.z), lim = R - 0.8;
    if (r > lim) { p.x *= lim / r; p.z *= lim / r; const nx = p.x / lim, nz = p.z / lim, vn = p.vx * nx + p.vz * nz; if (vn > 0) { p.vx -= 1.5 * vn * nx; p.vz -= 1.5 * vn * nz; } }
  }
  function bumps(ps) {
    const solid = ps.filter((p) => !p.out);
    for (let i = 0; i < solid.length; i++) for (let j = i + 1; j < solid.length; j++) {
      const a = solid[i], b = solid[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > PR * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = PR * 2 - d;
      // seated players are anchored; the other one takes the whole push
      const wa = a.seat >= 0 ? 0 : b.seat >= 0 ? 1 : 0.5, wb = 1 - wa;
      a.x -= nx * pen * wa; a.z -= nz * pen * wa; b.x += nx * pen * wb; b.z += nz * pen * wb;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) {
        if (a.seat < 0) { a.vx += nx * vr * 0.9 - (b.dashT > 0 ? nx * 9 : 0); a.vz += nz * vr * 0.9 - (b.dashT > 0 ? nz * 9 : 0); }
        if (b.seat < 0) { b.vx -= nx * vr * 0.9 - (a.dashT > 0 ? -nx * 9 : 0); b.vz -= nz * vr * 0.9 - (a.dashT > 0 ? -nz * 9 : 0); }
        if (vr < -6) events.push(['b', +((a.x + b.x) / 2).toFixed(1), +((a.z + b.z) / 2).toFixed(1)]);
      }
    }
    // empty chairs are solid while rising, then claimable on touch
    for (const p of solid) {
      if (p.seat >= 0) continue;
      for (let i = 0; i < world.chairs.length; i++) {
        const c = world.chairs[i], dx = p.x - c.x, dz = p.z - c.z, d = Math.hypot(dx, dz);
        if (d > CHAIR_R + PR) continue;
        if (world.phase === 'scramble' && world.claimT <= 0 && !c.by) { c.by = p.id; p.seat = i; p.x = c.x; p.z = c.z; events.push(['s', p.id, i]); break; }
        const nx = d ? dx / d : 1, nz = d ? dz / d : 0;
        p.x = c.x + nx * (CHAIR_R + PR); p.z = c.z + nz * (CHAIR_R + PR);
        const vn = p.vx * nx + p.vz * nz; if (vn < 0) { p.vx -= 1.4 * vn * nx; p.vz -= 1.4 * vn * nz; }
      }
    }
  }

  // Run engine > bots: dance-wander during music, react to the stop, race for the best free chair, shove rivals near it
  function botThink(p, dt) {
    if (p.out) { p.mx = p.mz = 0; return; }
    if (p.seat >= 0) return;
    p.think -= dt;
    if (world.phase === 'music') {
      if (p.think <= 0 || Math.hypot(p.wx - p.x, p.wz - p.z) < 1) { p.think = 1.2 + rng() * 2; const a = rng() * 6.28, r = Math.sqrt(rng()) * (R - 2); p.wx = Math.cos(a) * r; p.wz = Math.sin(a) * r; }
      const dx = p.wx - p.x, dz = p.wz - p.z, d = Math.hypot(dx, dz) || 1;
      p.mx = (dx / d) * 0.55; p.mz = (dz / d) * 0.55;
      p.react = 0.12 + (1 - p.skill) * 0.8 + rng() * 0.2;
      p.target = -1;
      if (rng() < 0.002) p.dash = 1;
      return;
    }
    if (world.phase !== 'scramble') { p.mx = p.mz = 0; return; }
    if ((p.react -= dt) > 0) { p.mx *= 0.9; p.mz *= 0.9; return; }
    if (p.think <= 0 || p.target < 0 || world.chairs[p.target]?.by) {
      p.think = 0.2;
      const rivals = alive().filter((q) => q !== p && q.seat < 0);
      let best = -1, bs = 1e9;
      world.chairs.forEach((c, i) => {
        if (c.by) return;
        const d = Math.hypot(c.x - p.x, c.z - p.z);
        const closer = rivals.filter((q) => Math.hypot(c.x - q.x, c.z - q.z) < d - 1.2).length;
        const score = d + closer * 4;
        if (score < bs) { bs = score; best = i; }
      });
      p.target = best;
    }
    const c = world.chairs[p.target];
    if (!c) { p.mx = p.mz = 0; return; }
    const dx = c.x - p.x, dz = c.z - p.z, d = Math.hypot(dx, dz) || 1;
    p.mx = dx / d; p.mz = dz / d;
    // shove a rival who is closer to my chair, or dash in from far away
    const rival = alive().find((q) => q !== p && q.seat < 0 && Math.hypot(q.x - p.x, q.z - p.z) < 2.2 && Math.hypot(c.x - q.x, c.z - q.z) < d);
    if (p.dashCd <= 0 && (rival ? rng() < p.skill * 0.25 : d > 5 && rng() < 0.04)) {
      if (rival) { const rx = rival.x - p.x, rz = rival.z - p.z, rl = Math.hypot(rx, rz) || 1; p.mx = rx / rl; p.mz = rz / rl; }
      p.dash = 1;
    }
  }

  // Game > Phases: count, music, scramble, out reveal, next round / winner
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) startRound();
    } else if (world.phase === 'music') {
      if (world.t <= 0) popChairs();
    } else if (world.phase === 'scramble') {
      world.claimT -= dt;
      const al = alive(), seated = al.filter((p) => p.seat >= 0).length;
      if (seated >= world.chairs.length || seated >= al.length || world.t <= 0) {
        let losers = al.filter((p) => p.seat < 0);
        // nobody sat at all: keep one random survivor so the match can still end
        if (losers.length === al.length && al.length) { const keep = al[Math.floor(rng() * al.length)]; losers = losers.filter((p) => p !== keep); }
        const place = al.length;
        for (const p of losers) { p.out = true; p.place = place; events.push(['o', p.id, +p.x.toFixed(1), +p.z.toFixed(1)]); }
        world.phase = 'out'; world.t = 2.6;
      }
    } else if (world.phase === 'out') {
      if (world.t <= 0) {
        const al = alive();
        if (al.length <= 1) {
          world.winner = al[0]?.id ?? null; if (al[0]) al[0].place = 1;
          for (const p of world.players.values()) p.seat = -1;
          world.chairs = [];
          world.phase = 'final'; world.t = world.mode === 'attract' ? 5 : 9;
          events.push(['w', world.winner ?? 0]);
        } else startRound();
      }
    } else if (world.phase === 'final' && world.t <= 0) {
      if (world.mode === 'attract') newMatch();
      else { world.phase = 'done'; onEnd(); }
    }
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract';
    addBots(ATTRACT_BOTS);
    newMatch();
  }

  // Game > match: humans then bots, countdown starts at once (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    slowFields.reset();
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    newMatch();
  }
  // Multiplayer > roster: leavers drop; a late joiner watches as a ghost until the next match (takes an eliminated bot's seat first when all 14 are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset(); // a late joiner gets the chairs in its first snapshot
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      const all = [...world.players.values()], bot = all.find((q) => q.bot && q.out) ?? all.find((q) => q.bot);
      if (!bot) return;
      removePlayer(bot.id);
    }
    Object.assign(addPlayer(h.id, h.nick, h.color, false), { out: world.phase !== 'count', x: 0, z: R - 2 });
  }
  // Multiplayer > guest input { mx, mz, dq: shove press counter }; the first one only syncs the counter
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    p.mx = axis(inp.mx); p.mz = axis(inp.mz);
    const presses = Number(inp.dq) || 0;
    if (p.lastDq !== undefined && presses > p.lastDq) p.dash = 1;
    p.lastDq = presses;
  }
  // Run engine > one fixed step for every dancer
  function step() {
    const ps = [...world.players.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepPlayer(p, STEP);
    bumps(ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per dancer every time; chairs only when they change; events since the last one
  const dancerFlags = (p) => (p.out ? 1 : 0) | (p.bot ? 2 : 0) | (p.dashT > 0 ? 4 : 0);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), rd: world.round, wn: world.winner,
      ...slowFields.pick({ C: world.chairs.map((c) => [c.x, c.z, c.h, c.by ?? 0]) }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.face), p.seat, dancerFlags(p), f2(p.dashCd), p.place]),
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
