// Runs Cannon Cove rules (sailing, broadsides, cannonball arcs, hull hits, repair barrels, bots, match clock) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
export const R_SEA = 62; // buoy ring radius
// islands + rock stacks: [x, z, radius]
export const ISLANDS = [[0, 0, 7], [-30, -22, 5], [28, -26, 4.5], [-26, 28, 4.5], [31, 24, 5.5], [0, -44, 3.5], [0, 44, 3.5], [-46, 2, 3.5], [46, -2, 3.5]];
export const WIN_SINKS = 8, MAX_HP = 5, MAXS = 9.5, G = 12;
const MATCH_T = 180, RELOAD = 2.6, SHIP_R = 2.2, MAX_PLAYERS = 14, ATTRACT_BOTS = 8;
const BOT_NAMES = ['Redbeard', 'Saltjaw', 'Bilge Rat', 'Peg Leg', 'Calico', 'Barnacle', 'Squall', 'One-Eye', 'Mad Molly', 'Sea Dog', 'Cutlass', 'Plank', 'Flint', 'Kraken'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f2 = (v) => Math.round(v * 100) / 100;
const timerUp = (v) => Math.ceil(Math.max(0, v) * 10) / 10; // countdown timers round up so a running one never reads 0
const rng = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));

/** onEnd(): final standings ran out (host goes back to the lobby) */
export function createCannonSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World: ships, cannonballs, barrels
  const world = { mode: 'attract', phase: 'count', t: 3, left: MATCH_T, winner: null, balls: [], barrels: [] };
  const ships = new Map();
  let events = [], lastBeep = 0;
  function addShip(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, h: 0, speed: 0, hp: MAX_HP, sunk: 0, thr: 0, turn: 0, cdL: 0, cdR: 0, seqL: 0, seqR: 0, lastL: 0, lastR: 0, kills: 0, deaths: 0, lastHit: null, inv: 0, skill: 0.55 + rng() * 0.4, think: 0, target: null };
    ships.set(id, p);
    return p;
  }
  const removeShip = (id) => ships.delete(id);
  const clearShips = () => ships.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addShip(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function blocked(x, z, pad) { return ISLANDS.some(([ix, iz, r]) => Math.hypot(x - ix, z - iz) < r + pad); }
  function spawn(p, a) {
    let x, z, tries = 0;
    do { const r = R_SEA - 8 - rng() * 6; x = Math.cos(a) * r; z = Math.sin(a) * r; a += 0.4; tries++; } while ((blocked(x, z, 4) || [...ships.values()].some((q) => q !== p && !q.sunk && Math.hypot(q.x - x, q.z - z) < 7)) && tries < 20);
    Object.assign(p, { x, z, h: Math.atan2(-x, -z), speed: 0, hp: MAX_HP, sunk: 0, cdL: 1, cdR: 1, inv: 2.5, lastHit: null });
  }
  function beginMatch() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...ships.values()], rng);
    ps.forEach((p, k) => { spawn(p, (k / ps.length) * Math.PI * 2); p.kills = 0; p.deaths = 0; });
    world.balls = [];
    world.barrels = [];
    for (let k = 0; k < 5; k++) world.barrels.push(newBarrel());
    Object.assign(world, { phase: 'count', t: world.mode === 'attract' ? 1 : 3.5, left: world.mode === 'attract' ? 90 : MATCH_T, winner: null });
  }
  function newBarrel() {
    let x, z;
    do { const a = rng() * Math.PI * 2, r = 8 + rng() * (R_SEA - 14); x = Math.cos(a) * r; z = Math.sin(a) * r; } while (blocked(x, z, 2.5));
    return { x: +x.toFixed(1), z: +z.toFixed(1), t: 0 };
  }

  // Run engine > sailing: throttle eases speed, helm turns faster under way, islands + ships + buoy ring push back
  function stepShip(p, dt) {
    p.cdL -= dt; p.cdR -= dt; p.inv -= dt;
    if (p.sunk) { p.sunk += dt; if (p.sunk > 4 && world.phase === 'play') { spawn(p, rng() * Math.PI * 2); events.push(['r', p.id]); } return; }
    const live = world.phase === 'play';
    const thr = live ? clamp(p.thr, -1, 1) : 0, turn = live ? clamp(p.turn, -1, 1) : 0;
    const want = thr >= 0 ? thr * MAXS : thr * MAXS * 0.35;
    p.speed += clamp(want - p.speed, -6 * dt, 3.2 * dt);
    // positive helm = starboard (right) = heading decreases
    p.h = wrap(p.h - turn * (0.35 + 0.75 * Math.min(Math.abs(p.speed) / MAXS, 1)) * dt * Math.sign(p.speed || 1));
    p.x += Math.sin(p.h) * p.speed * dt; p.z += Math.cos(p.h) * p.speed * dt;
    for (const [ix, iz, r] of ISLANDS) {
      const dx = p.x - ix, dz = p.z - iz, d = Math.hypot(dx, dz), rr = r + SHIP_R * 0.8;
      if (d < rr && d > 1e-3) { p.x = ix + (dx / d) * rr; p.z = iz + (dz / d) * rr; p.speed *= 0.6; }
    }
    const d = Math.hypot(p.x, p.z), lim = R_SEA - SHIP_R;
    if (d > lim) { p.x *= lim / d; p.z *= lim / d; p.speed *= 0.7; }
    if (!live) return;
    const fire = (side) => {
      // side: -1 port (left), +1 starboard (right)
      const fx = Math.sin(p.h), fz = Math.cos(p.h), rx = -fz, rz = fx;
      const sx = rx * side, sz = rz * side;
      for (let k = -1; k <= 1; k++) {
        const v = 15 + rng() * 2;
        world.balls.push({ owner: p.id, x: p.x + sx * 1.5 + fx * k * 1.1, y: 1.3, z: p.z + sz * 1.5 + fz * k * 1.1, vx: sx * v + fx * p.speed + (rng() - 0.5), vy: 6.5 + rng(), vz: sz * v + fz * p.speed + (rng() - 0.5), t: 0 });
      }
      // firing ends spawn protection (no broadsides from behind it)
      p.inv = 0;
      events.push(['f', p.id, side]);
    };
    if (p.seqL !== p.lastL) { p.lastL = p.seqL; if (p.cdL <= 0) { p.cdL = RELOAD; fire(-1); } }
    if (p.seqR !== p.lastR) { p.lastR = p.seqR; if (p.cdR <= 0) { p.cdR = RELOAD; fire(1); } }
  }
  function shipCollide(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (a.sunk || b.sunk) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > SHIP_R * 2 || d < 1e-3) continue;
      const pen = (SHIP_R * 2 - d) / 2, nx = dx / d, nz = dz / d;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      a.speed *= 0.85; b.speed *= 0.85;
    }
  }
  // Run engine > cannonballs: ballistic arc, hull hit test in ship-local box, splash on water or island
  function stepBalls(dt) {
    for (let i = world.balls.length - 1; i >= 0; i--) {
      const b = world.balls[i];
      b.t += dt; b.vy -= G * dt;
      b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      let gone = false;
      for (const p of ships.values()) {
        if (p.id === b.owner && b.t < 0.4 || p.sunk || b.y > 2.4) continue;
        const dx = b.x - p.x, dz = b.z - p.z, fx = Math.sin(p.h), fz = Math.cos(p.h);
        const lz = dx * fx + dz * fz, lx = dx * -fz + dz * fx;
        if (Math.abs(lx) < 1.4 && lz > -2.6 && lz < 3.1) {
          gone = true;
          events.push(['h', p.id, +b.x.toFixed(1), +b.z.toFixed(1)]);
          if (p.inv <= 0 && p.id !== b.owner) {
            p.hp--; p.lastHit = b.owner;
            if (p.hp <= 0) {
              p.sunk = 0.001; p.deaths++; p.speed = 0;
              const k = ships.get(p.lastHit); if (k) k.kills++;
              events.push(['k', p.id, p.lastHit]);
            }
          }
          break;
        }
      }
      if (!gone && (b.y < 0 || blocked(b.x, b.z, 0) && b.y < 1.5)) { gone = true; events.push(['s', +b.x.toFixed(1), +b.z.toFixed(1), blocked(b.x, b.z, 0) ? 1 : 0]); }
      if (gone || b.t > 4) world.balls.splice(i, 1);
    }
    for (const br of world.barrels) {
      if (br.t > 0) { br.t -= dt; if (br.t <= 0) Object.assign(br, newBarrel()); continue; }
      for (const p of ships.values()) if (!p.sunk && Math.hypot(p.x - br.x, p.z - br.z) < SHIP_R + 0.8 && p.hp < MAX_HP) { p.hp = Math.min(MAX_HP, p.hp + 2); br.t = 12; events.push(['b', p.id]); break; }
    }
  }

  // Run engine > bots: hunt nearest ship, swing broadside-on at mid range, fire the facing battery, dodge islands and the buoy ring
  function botThink(p, dt) {
    if (p.sunk) return;
    p.think -= dt;
    if (p.think <= 0 || !ships.get(p.target?.id)?.hp) {
      p.think = 1.5 + rng();
      let best = null, bd = Infinity;
      for (const q of ships.values()) if (q !== p && !q.sunk) { const d = Math.hypot(q.x - p.x, q.z - p.z); if (d < bd) { bd = d; best = q; } }
      // hurt bots go for a barrel first
      const br = p.hp <= 2 ? world.barrels.filter((b) => b.t <= 0).sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z))[0] : null;
      p.target = br && (!best || Math.hypot(br.x - p.x, br.z - p.z) < 30) ? { barrel: br } : best;
    }
    const tg = p.target?.barrel ?? p.target;
    let want = p.h, thr = 0.8;
    if (tg) {
      const dx = tg.x - p.x, dz = tg.z - p.z, d = Math.hypot(dx, dz), bear = Math.atan2(dx, dz), rel = wrap(bear - p.h);
      if (p.target.barrel || d > 22) want = bear;
      else if (d < 9) want = bear + Math.PI;
      else want = bear - Math.sign(rel || 1) * Math.PI / 2;
      thr = p.target.barrel ? 1 : d > 22 ? 1 : 0.6;
      if (!p.target.barrel && d < 21) {
        // rel > 0 = target on the port (left) side
        const off = Math.abs(Math.abs(rel) - Math.PI / 2);
        if (off < 0.18 + p.skill * 0.15 && rng() < 0.08 + p.skill * 0.1) { if (rel > 0) p.seqL++; else p.seqR++; }
      }
    }
    // look ahead for islands and the arena edge
    const ax = p.x + Math.sin(p.h) * 9, az = p.z + Math.cos(p.h) * 9;
    for (const [ix, iz, r] of ISLANDS) if (Math.hypot(ax - ix, az - iz) < r + 4) { const side = Math.sign(wrap(Math.atan2(ix - p.x, iz - p.z) - p.h)) || 1; want = p.h - side * 1.2; }
    if (Math.hypot(ax, az) > R_SEA - 6) want = Math.atan2(-p.x, -p.z);
    p.turn = clamp(-wrap(want - p.h) * 2.2, -1, 1);
    p.thr = thr;
  }

  // Game > Phases: countdown, play, final standings
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { events.push(['c', 0]); world.phase = 'play'; }
    } else if (world.phase === 'play') {
      world.left -= dt;
      const top = [...ships.values()].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)[0];
      if (world.left <= 0 || top?.kills >= WIN_SINKS) {
        world.winner = top?.id ?? null;
        if (top) events.push(['w', top.id]);
        world.phase = 'final'; world.t = world.mode === 'attract' ? 3 : 10;
      }
    } else if (world.phase === 'final' && world.t <= 0) {
      if (world.mode === 'attract') beginMatch();
      else { world.phase = 'done'; onEnd(); }
    }
  }
  function startAttract() {
    clearShips();
    world.mode = 'attract';
    addBots(ATTRACT_BOTS);
    beginMatch();
  }

  // Game > match: humans then bots, shuffled around the buoy ring (relay host)
  function startMatch({ humans, bots }) {
    clearShips();
    names.reset();
    slowFields.reset();
    world.mode = 'match';
    for (const h of humans.slice(0, MAX_PLAYERS)) addShip(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - ships.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop; a late captain sails in at the ring (takes the worst bot's seat when all 14 are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...ships.values()]) if (!p.bot && !ids.has(p.id)) removeShip(p.id);
    for (const h of humans) if (!ships.has(h.id)) joinLate(h);
    slowFields.reset(); // a late joiner gets the barrels in its first snapshot
  }
  function joinLate(h) {
    if (ships.size >= MAX_PLAYERS) {
      const bot = [...ships.values()].filter((q) => q.bot).sort((a, b) => a.kills - b.kills)[0];
      if (!bot) return;
      removeShip(bot.id);
    }
    spawn(addShip(h.id, h.nick, h.color, false), rng() * Math.PI * 2);
  }
  // Multiplayer > guest input { a: sails, b: helm, l / r: port / starboard fire press counters }
  function applyInput(id, inp) {
    const p = ships.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { thr: axis(inp.a), turn: axis(inp.b) });
    applyPresses(p, { seqL: ['lastL', inp.l], seqR: ['lastR', inp.r] });
  }
  // Run engine > one fixed step
  function step() {
    const ps = [...ships.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepShip(p, STEP);
    shipCollide(ps);
    stepBalls(STEP);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per ship every time; barrels only when they change; cannonballs replay from fire events
  const shipFlags = (p) => (p.bot ? 1 : 0) | (p.sunk ? 2 : 0) | (p.inv > 0 ? 4 : 0);
  function snapshot() {
    const ps = [...ships.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), lf: f2(world.left), win: world.winner,
      ...slowFields.pick({ B: world.barrels.map((b) => [b.x, b.z, b.t > 0 ? 1 : 0]) }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.h), f2(p.speed), p.hp, shipFlags(p), timerUp(p.sunk), p.kills, p.deaths, timerUp(p.cdL), timerUp(p.cdR)]),
    }, ps);
    if (events.length) snap.ev = events;
    events = [];
    return snap;
  }

  return {
    world, ships, addShip, removeShip, clearShips, stepShip, startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get events() { return events; },
    set events(list) { events = list; },
  };
}
