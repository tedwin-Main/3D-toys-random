// Runs Splat Turf rules (paint grid, rolling blobs, paint bombs, seeded pillars, tile-share scoring, bots) with no rendering, for page attract, guest prediction and the relay server host.

import { pickLeader } from '../common/pick-leader.js';
import { axis, seq, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
export const G = 48, HALF = G / 2; // arena: G x G tiles, 1 unit each
export const MATCH_TIME = 90;
export const KEY_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'; // keyframe: one char per tile = owner slot
const R = 0.9, BARE_COLOR = '#e9e4f2', MAX_PLAYERS = 14, ATTRACT_BOTS = 6, ATTRACT_SEED = 7;
const OVERTIME = 15; // s added once when the lead is tied at time-up
const KEYFRAME_EVERY = 2; // s between full grid strings; deltas carry every change in between
const BOT_NAMES = ['Gloop', 'Splotch', 'Drip', 'Blorb', 'Smudge', 'Goober', 'Squish', 'Puddle', 'Blot', 'Jelly', 'Splash', 'Ooze', 'Smear', 'Glob'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f2 = (v) => Math.round(v * 100) / 100;
const timerUp = (v) => Math.ceil(Math.max(0, v) * 10) / 10; // countdown timers round up so a running one never reads 0
const rng = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const tileIdx = (x, z) => { const tx = Math.floor(x + HALF), tz = Math.floor(z + HALF); return tx < 0 || tz < 0 || tx >= G || tz >= G ? -1 : tz * G + tx; };
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** onEnd(): results ran out (host goes back to the lobby); onGridChange(): paint or palette changed (page re-uploads its texture) */
export function createTurfSim({ onEnd = () => {}, onGridChange = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World state
  const world = { mode: 'attract', phase: 'play', t: 0, players: new Map(), bombs: [], winner: null, seed: 7 };
  // Arena > paint grid: owner slot per tile (0 = bare); solid = pillar tiles; palette[slot] = color
  const grid = new Uint8Array(G * G), solid = new Uint8Array(G * G);
  let palette = [BARE_COLOR], arena = null;
  let events = [], deltas = [], lastBeep = 0, keyframeDue = true, keyframeT = 0;
  // Arena > seeded pillars, mirrored into all four quarters so no spawn corner is unfair
  function loadArena(seed) {
    if (arena?.seed === seed) return;
    const r = mulberry(seed), pillars = [];
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const x = 4 + Math.floor(r() * 15), z = 4 + Math.floor(r() * 15), w = 2 + Math.floor(r() * 3), d = 2 + Math.floor(r() * 3);
      for (const [sx, sz] of [[1, 1], [-1, 1], [1, -1], [-1, -1]]) pillars.push({ minx: sx > 0 ? x : -x - w, maxx: sx > 0 ? x + w : -x, minz: sz > 0 ? z : -z - d, maxz: sz > 0 ? z + d : -z });
    }
    solid.fill(0);
    for (const b of pillars) for (let z = b.minz; z < b.maxz; z++) for (let x = b.minx; x < b.maxx; x++) { const k = tileIdx(x + 0.5, z + 0.5); if (k >= 0) solid[k] = 1; }
    arena = { seed, pillars, hue: r() };
  }
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, slot: 0, x: 0, z: 0, vx: 0, vz: 0, face: 0, inX: 0, inZ: 0, bombSeq: 0, lastBomb: 0, bombCD: 0, tiles: 0, ai: { t: 0, tx: 0, tz: 0 }, skill: 0.55 + rng() * 0.4 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  function clearPlayers() { world.players.clear(); world.bombs = []; }
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function assignSlots() {
    // paint slot = palette index; slot 0 is bare floor
    palette = [BARE_COLOR];
    let s = 1;
    for (const p of world.players.values()) { p.slot = s++; palette.push(p.color); }
    onGridChange();
  }
  function spawnAll() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...world.players.values()], rng);
    ps.forEach((p, i) => {
      const a = (i / ps.length) * Math.PI * 2 + Math.PI / 4;
      let x = Math.cos(a) * 17, z = Math.sin(a) * 17;
      Object.assign(p, { x, z, vx: 0, vz: 0, bombCD: 2, face: Math.atan2(-x, -z) });
      resolve(p);
    });
  }
  function paint(x, z, r, slot) {
    const r2 = r * r;
    for (let tz = Math.floor(z - r + HALF); tz <= Math.floor(z + r + HALF); tz++) for (let tx = Math.floor(x - r + HALF); tx <= Math.floor(x + r + HALF); tx++) {
      if (tx < 0 || tz < 0 || tx >= G || tz >= G) continue;
      const cx = tx - HALF + 0.5 - x, cz = tz - HALF + 0.5 - z;
      if (cx * cx + cz * cz > r2) continue;
      const k = tz * G + tx;
      if (solid[k] || grid[k] === slot) continue;
      grid[k] = slot; deltas.push(k, slot); onGridChange();
    }
  }
  // Run engine > collisions: arena bounds + pillar boxes
  function resolve(p) {
    p.x = clamp(p.x, -HALF + R, HALF - R); p.z = clamp(p.z, -HALF + R, HALF - R);
    for (const b of arena.pillars) {
      const cx = clamp(p.x, b.minx, b.maxx), cz = clamp(p.z, b.minz, b.maxz);
      const dx = p.x - cx, dz = p.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= R * R) continue;
      if (d2 > 1e-8) {
        const d = Math.sqrt(d2), k = (R - d) / d; p.x += dx * k; p.z += dz * k;
        const nx = dx / d, nz = dz / d, vn = p.vx * nx + p.vz * nz;
        if (vn < 0) { p.vx -= nx * vn * 1.5; p.vz -= nz * vn * 1.5; }
      } else { p.x = b.maxx + R; }
    }
  }

  // Run engine > step: roll with terrain speed, paint trail, bombs, bumps
  // one blob's drive: own paint fast, enemy paint slow; shared by host sim and guest prediction
  function moveBlob(p, dt, play) {
    p.bombCD = Math.max(0, p.bombCD - dt);
    let ix = play ? p.inX : 0, iz = play ? p.inZ : 0;
    const l = Math.hypot(ix, iz); if (l > 1) { ix /= l; iz /= l; }
    const k = tileIdx(p.x, p.z), own = k >= 0 && grid[k] === p.slot, enemy = k >= 0 && grid[k] && !own;
    const max = own ? 12.5 : enemy ? 6.5 : 9.5;
    p.vx += ix * 40 * dt; p.vz += iz * 40 * dt;
    const drag = Math.exp(-(l > 0.1 ? 3 : 6) * dt); p.vx *= drag; p.vz *= drag;
    const sp = Math.hypot(p.vx, p.vz); if (sp > max) { p.vx *= max / sp; p.vz *= max / sp; }
    p.x += p.vx * dt; p.z += p.vz * dt;
    resolve(p);
    if (sp > 0.5) { let d = Math.atan2(p.vx, p.vz) - p.face; d = Math.atan2(Math.sin(d), Math.cos(d)); p.face += d * Math.min(1, dt * 10); }
  }
  function physics(dt) {
    const ps = [...world.players.values()];
    const play = world.phase === 'play';
    for (const p of ps) {
      moveBlob(p, dt, play);
      if (play) paint(p.x, p.z, 1.35, p.slot);
      if (play && p.bombSeq !== p.lastBomb) {
        p.lastBomb = p.bombSeq;
        if (p.bombCD <= 0) {
          p.bombCD = 5;
          const fx = Math.sin(p.face), fz = Math.cos(p.face);
          const tx = clamp(p.x + fx * 7, -HALF + 1, HALF - 1), tz = clamp(p.z + fz * 7, -HALF + 1, HALF - 1);
          world.bombs.push({ owner: p.id, slot: p.slot, color: p.color, sx: p.x, sz: p.z, tx, tz, t: 0, dur: 0.7 });
          events.push(['t', p.id]);
        }
      } else if (!play) p.lastBomb = p.bombSeq;
    }
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz);
      if (d >= R * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, ov = R * 2 - d;
      a.x += nx * ov / 2; a.z += nz * ov / 2; b.x -= nx * ov / 2; b.z -= nz * ov / 2;
      const vrel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
      if (vrel < 0) { const j2 = -vrel * 0.9; a.vx += j2 * nx; a.vz += j2 * nz; b.vx -= j2 * nx; b.vz -= j2 * nz; if (-vrel > 4) events.push(['u']); }
    }
    for (const b of world.bombs) {
      b.t += dt;
      if (b.t >= b.dur && !b.done) { b.done = true; if (play) paint(b.tx, b.tz, 3.6, b.slot); events.push(['s', +b.tx.toFixed(1), +b.tz.toFixed(1), b.color]); }
    }
    world.bombs = world.bombs.filter((b) => !b.done);
  }

  // Run engine > bots: head for nearest patch that isn't theirs, bomb enemy-heavy areas
  function botThink(p, dt) {
    const ai = p.ai;
    ai.t -= dt;
    if (ai.t <= 0) {
      ai.t = 0.6 + rng() * 0.6;
      let best = null, bs = -1e9;
      const rivals = [...world.players.values()].filter((q) => q !== p);
      // skill: weighs more patches, picks steadier, and claims ground rivals won't paint straight back
      for (let i = 0, n = Math.round(35 * p.skill); i < n; i++) {
        const x = (rng() - 0.5) * (G - 4), z = (rng() - 0.5) * (G - 4), k = tileIdx(x, z);
        if (k < 0 || solid[k]) continue;
        const v = grid[k] === p.slot ? -6 : grid[k] ? 4 : 3;
        const crowd = rivals.filter((q) => Math.hypot(q.x - x, q.z - z) < 7).length;
        const s = v - Math.hypot(x - p.x, z - p.z) * 0.18 - crowd * 2.5 * p.skill + rng() * 12 * (1 - p.skill);
        if (s > bs) { bs = s; best = [x, z]; }
      }
      if (best) { ai.tx = best[0]; ai.tz = best[1]; }
      // enemy paint ahead? throw a bomb
      const fx = p.x + Math.sin(p.face) * 7, fz = p.z + Math.cos(p.face) * 7, k = tileIdx(fx, fz);
      if (k >= 0 && grid[k] && grid[k] !== p.slot && rng() < 0.67 * p.skill) p.bombSeq++;
    }
    const dx = ai.tx - p.x, dz = ai.tz - p.z, l = Math.hypot(dx, dz) || 1;
    // wiggle so trails cover area instead of thin lines
    const w = Math.sin(performance.now() / 300 + p.id) * 0.5;
    p.inX = dx / l + (-dz / l) * w; p.inZ = dz / l + (dx / l) * w;
  }

  // Game > Phases: countdown, 90 s paint, results (tile share)
  function countTiles() {
    const counts = new Array(palette.length).fill(0);
    let open = 0;
    for (let i = 0; i < G * G; i++) { if (solid[i]) continue; open++; counts[grid[i]]++; }
    for (const p of world.players.values()) p.tiles = (counts[p.slot] ?? 0) / open;
    return counts;
  }
  function phases(dt) {
    if (world.mode === 'attract') {
      world.phase = 'play';
      world.t += dt;
      // attract: wipe the floor every 40 s so it never saturates
      if (world.t > 40) { world.t = 0; grid.fill(0); onGridChange(); }
      return;
    }
    if (world.phase === 'count') {
      world.t -= dt;
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'play'; world.t = MATCH_TIME; events.push(['c', 0]); }
    } else if (world.phase === 'play') {
      world.t -= dt;
      if (world.t <= 0) {
        countTiles();
        const { winner: top, tied } = pickLeader([...world.players.values()], (p) => p.tiles);
        // tied turf: one overtime, then a draw (join order never breaks a tie)
        if (!top && tied[0]?.tiles > 0 && !world.overtime) { world.overtime = true; world.t = OVERTIME; return; }
        world.phase = 'end'; world.t = 7; world.winner = top?.id ?? null; world.overtime = false;
      }
    } else if (world.phase === 'end') {
      world.t -= dt;
      if (world.t <= 0) { world.phase = 'done'; onEnd(); }
    }
  }
  function beginMatch() {
    grid.fill(0); onGridChange(); deltas = []; keyframeDue = true;
    assignSlots();
    world.phase = 'count'; world.t = 3; lastBeep = 4; world.winner = null; world.bombs = [];
    spawnAll();
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract'; world.t = 0;
    world.seed = ATTRACT_SEED; loadArena(ATTRACT_SEED);
    addBots(ATTRACT_BOTS);
    grid.fill(0); assignSlots(); spawnAll();
  }

  // Game > match: arena from the lobby seed, humans then bots (relay host)
  function startMatch({ seed, humans, bots }) {
    clearPlayers();
    names.reset();
    slowFields.reset();
    world.mode = 'match';
    world.seed = seq(seed) || ATTRACT_SEED;
    loadArena(world.seed);
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop (their paint stays); a joiner gets a new paint slot, or the newest bot's when all 14 seats are taken
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset();
    keyframeDue = true; // a late joiner gets seed, palette + grid in its first snapshot
  }
  function joinLate(h) {
    const bot = world.players.size >= MAX_PLAYERS ? [...world.players.values()].filter((q) => q.bot).pop() : null;
    if (world.players.size >= MAX_PLAYERS && !bot) return;
    if (bot) removePlayer(bot.id);
    const late = addPlayer(h.id, h.nick, h.color, false);
    late.slot = bot ? bot.slot : palette.length;
    palette[late.slot] = h.color;
    resolve(late);
    onGridChange();
  }
  // Multiplayer > guest input { x, z, b: bomb press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { inX: axis(inp.x), inZ: axis(inp.z) });
    applyPresses(p, { bombSeq: ['lastBomb', inp.b] });
  }
  // Run engine > one fixed step
  function step() {
    for (const p of world.players.values()) if (p.bot) botThink(p, STEP);
    physics(STEP);
    phases(STEP);
    keyframeT -= STEP;
  }
  // Multiplayer > snapshot (JSON): row per blob + bombs each time; grid as [tile, slot, ...] deltas plus a full keyframe every 2 s
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), win: world.winner,
      ...slowFields.pick({ seed: world.seed }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.face), p.slot, p.bot ? 1 : 0, timerUp(p.bombCD)]),
      B: world.bombs.map((b) => [f2(b.sx), f2(b.sz), f2(b.tx), f2(b.tz), f2(b.t), b.dur, b.color]),
    }, ps);
    if (deltas.length) snap.D = deltas;
    if (keyframeDue || keyframeT <= 0) { keyframeDue = false; keyframeT = KEYFRAME_EVERY; snap.K = Array.from(grid, (slot) => KEY_CHARS[slot]).join(''); snap.pal = palette; }
    if (events.length) snap.ev = events;
    events = []; deltas = [];
    return snap;
  }
  // page attract: paint already applied locally, nothing to send
  const dropDeltas = () => { deltas = []; };

  return {
    world, grid, addPlayer, removePlayer, clearPlayers, moveBlob, loadArena, countTiles, dropDeltas,
    startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get arena() { return arena; },
    get palette() { return palette; },
    set palette(colors) { palette = colors; },
    get events() { return events; },
    set events(list) { events = list; },
  };
}
