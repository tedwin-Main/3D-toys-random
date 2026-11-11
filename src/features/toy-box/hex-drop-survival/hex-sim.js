// Runs Hex Drop rules (three hex floors that fall when stepped on, hopping beans, eliminations, 3 rounds, bots) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
// Arena > hex layers: pointy-top axial grid of radius N, tile size S, 169 tiles per floor; floor heights in LAYERS
export const S = 1.5, LAYERS = [0, -9, -18], OUT_Y = -27, FALL_DELAY = 0.55;
export const ROUNDS = 3, SPEED = 7.2, GRAV = 30;
const N = 7, SQ3 = Math.sqrt(3), JUMP = 11.5, MAX_PLAYERS = 14, ATTRACT_BOTS = 8, KEYFRAME_EVERY = 1; // s between full tile-state strings
const HEX_KEYS = [];
for (let q = -N; q <= N; q++) for (let r = -N; r <= N; r++) if (Math.abs(q + r) <= N) HEX_KEYS.push([q, r]);
export const PER_FLOOR = HEX_KEYS.length;
const KEY_INDEX = new Map(HEX_KEYS.map(([q, r], k) => [q * 100 + r, k]));
// tile index under (x, z) on floor L, or -1 off the grid
function hexAt(x, z, L) {
  const qf = (SQ3 / 3 * x - z / 3) / S, rf = (2 / 3 * z) / S, sf = -qf - rf;
  let q = Math.round(qf), r = Math.round(rf);
  const s = Math.round(sf), dq = Math.abs(q - qf), dr = Math.abs(r - rf), ds = Math.abs(s - sf);
  if (dq > dr && dq > ds) q = -r - s; else if (dr > ds) r = -q - s;
  const k = KEY_INDEX.get(q * 100 + r);
  return k === undefined ? -1 : L * PER_FLOOR + k;
}
const BOT_NAMES = ['Jelly', 'Wobbles', 'Bean', 'Squish', 'Hopper', 'Noodle', 'Gumdrop', 'Pip', 'Marsh', 'Boing', 'Taffy', 'Sprout', 'Fizz', 'Dumpling'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f1 = (v) => Math.round(v * 10) / 10, f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** onEnd(): final standings ran out (host goes back to the lobby); onTilesReset(): every tile is solid again (page redraws) */
export function createHexSim({ onEnd = () => {}, onTilesReset = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 3, round: 1, players: new Map(), outCount: 0, winner: null };
  let events = [], trig = [], lastBeep = 0;
  // Arena > tile state: 0 solid, 1 shaking (stepped on), 2 falling; animTiles = indexes still moving
  const tiles = LAYERS.flatMap((y, L) => HEX_KEYS.map(([q, r]) => ({ L, q, r, x: S * SQ3 * (q + r / 2), z: S * 1.5 * r, y, state: 0, t: 0, drop: 0, vy: 0 })));
  const animTiles = new Set();
  let keyframeDue = true, keyframeT = 0;
  function resetTiles() {
    for (const t of tiles) Object.assign(t, { state: 0, t: 0, drop: 0, vy: 0 });
    animTiles.clear();
    onTilesReset();
  }
  function triggerTile(i) { const t = tiles[i]; if (!t || t.state !== 0) return false; t.state = 1; t.t = FALL_DELAY; animTiles.add(i); return true; }
  function stepTiles(dt) {
    for (const i of animTiles) {
      const t = tiles[i];
      if (t.state === 1) { t.t -= dt; if (t.t <= 0) { t.state = 2; t.vy = 0; } }
      else if (t.state === 2) { t.vy -= 30 * dt; t.drop += t.vy * dt; if (t.drop < -14) animTiles.delete(i); }
    }
  }
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, face: 0, alive: true, ground: false, mx: 0, mz: 0, jumpSeq: 0, lastJump: 0, jumpBuf: 0, pts: 0, wins: 0, place: 0, tx: 0, tz: 0, thinkT: 0, skill: 0.75 + rng() * 0.2 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function spawnAll() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...world.players.values()], rng), n = ps.length;
    ps.forEach((p, k) => {
      const a = (k / n) * Math.PI * 2, r = n > 1 ? 9 : 0;
      Object.assign(p, { x: Math.sin(a) * r, z: Math.cos(a) * r, y: 0, vx: 0, vy: 0, vz: 0, face: a + Math.PI, alive: true, ground: true, jumpBuf: 0, place: 0 });
    });
  }
  function startRound() {
    resetTiles();
    spawnAll();
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3.5; world.outCount = 0; world.winner = null;
    keyframeDue = true;
  }

  // Run engine > movement, jumping, landing on the highest live tile, bumping
  function stepPlayer(p, dt) {
    if (!p.alive) return;
    const frozen = world.phase === 'count';
    let mx = frozen ? 0 : p.mx, mz = frozen ? 0 : p.mz;
    const ml = Math.hypot(mx, mz);
    if (ml > 1) { mx /= ml; mz /= ml; }
    const acc = p.ground ? 42 : 14;
    p.vx += clamp(mx * SPEED - p.vx, -acc * dt, acc * dt);
    p.vz += clamp(mz * SPEED - p.vz, -acc * dt, acc * dt);
    if (ml > 0.1) p.face = Math.atan2(mx, mz);
    if (p.jumpSeq !== p.lastJump) { p.lastJump = p.jumpSeq; p.jumpBuf = 0.15; }
    p.jumpBuf -= dt;
    if (p.jumpBuf > 0 && p.ground && !frozen) { p.vy = JUMP; p.ground = false; p.jumpBuf = 0; events.push(['j', p.id]); }
    const py = p.y;
    p.vy -= GRAV * dt;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.ground) {
      const i = hexAt(p.x, p.z, layerOf(py));
      if (i >= 0 && tiles[i].state !== 2) { p.y = tiles[i].y; p.vy = 0; if (!p.ghost && world.phase === 'play' && triggerTile(i)) trig.push(i); }
      else p.ground = false;
    } else if (p.vy <= 0) {
      for (let L = 0; L < LAYERS.length; L++) {
        const yL = LAYERS[L];
        if (py >= yL - 0.05 && p.y <= yL) {
          const i = hexAt(p.x, p.z, L);
          if (i >= 0 && tiles[i].state !== 2) { p.y = yL; p.vy = 0; p.ground = true; events.push(['l', p.id]); break; }
        }
      }
    }
    // ghost = guest prediction copy: never touches tiles or placings
    if (p.y < OUT_Y) {
      p.alive = false;
      if (p.ghost) return;
      p.pts += world.outCount;
      world.outCount++;
      p.place = world.players.size - world.outCount + 1;
      events.push(['o', p.id, p.place]);
    }
  }
  function layerOf(y) { let best = 0; for (let L = 0; L < LAYERS.length; L++) if (Math.abs(LAYERS[L] - y) < Math.abs(LAYERS[best] - y)) best = L; return best; }
  function bump(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j];
      if (!a.alive || !b.alive || Math.abs(a.y - b.y) > 1.3) continue;
      const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > 0.95 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (0.95 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) { a.vx += nx * vr * 0.9; a.vz += nz * vr * 0.9; b.vx -= nx * vr * 0.9; b.vz -= nz * vr * 0.9; }
    }
  }

  // Run engine > bots: head for solid tiles with solid neighbours, hop gaps, keep moving
  function solidAt(x, z, L) { const i = hexAt(x, z, L); return i >= 0 && tiles[i].state === 0; }
  function botThink(p, dt) {
    if (!p.alive) return;
    const L = layerOf(p.y);
    p.thinkT -= dt;
    const tdist = Math.hypot(p.tx - p.x, p.tz - p.z);
    if (p.thinkT <= 0 || tdist < 1.2 || !solidAt(p.tx, p.tz, L)) {
      p.thinkT = 0.5 + rng() * 0.5;
      let best = null, bs = -Infinity;
      // skill = how many tiles it weighs and how steady the pick is
      for (let k = 0, n = Math.round(10 + 40 * p.skill); k < n; k++) {
        const t = tiles[L * PER_FLOOR + Math.floor(rng() * PER_FLOOR)];
        if (t.state !== 0) continue;
        const d = Math.hypot(t.x - p.x, t.z - p.z);
        if (d < 2.5 || d > 12) continue;
        let nb = 0;
        for (const [dq, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, -1], [-1, 1]]) { const kk = KEY_INDEX.get((t.q + dq) * 100 + t.r + dr); if (kk !== undefined && tiles[L * PER_FLOOR + kk].state === 0) nb++; }
        // also prefer tiles away from the rim and from other beans
        const sc = nb * 1.4 - d * 0.25 - Math.hypot(t.x, t.z) * 0.06 + rng() * 8 * (1 - p.skill);
        if (sc > bs) { bs = sc; best = t; }
      }
      if (best) { p.tx = best.x; p.tz = best.z; }
    }
    let dx = p.tx - p.x, dz = p.tz - p.z;
    const d = Math.hypot(dx, dz) || 1;
    dx /= d; dz /= d;
    p.mx = dx; p.mz = dz;
    if (p.ground) {
      const ahead1 = solidAt(p.x + dx * 1.3, p.z + dz * 1.3, L) || hexAt(p.x + dx * 1.3, p.z + dz * 1.3, L) === hexAt(p.x, p.z, L);
      if (!ahead1 && solidAt(p.x + dx * 3.6, p.z + dz * 3.6, L) && rng() < p.skill) p.jumpBuf = 0.1;
      else if (!ahead1) p.thinkT = 0;
    }
  }

  // Game > Phases: countdown, play until one bean stands, round results, final
  function phases(dt) {
    const ps = [...world.players.values()];
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'play'; events.push(['c', 0]); }
    } else if (world.phase === 'play') {
      const alive = ps.filter((p) => p.alive);
      if (alive.length === 0 || (ps.length > 1 && alive.length <= 1)) {
        const w = alive[0];
        if (w) { w.pts += world.outCount + 2; w.wins++; w.place = 1; world.winner = w.id; events.push(['w', w.id]); }
        world.phase = 'round'; world.t = world.mode === 'attract' ? 2.5 : 4.5;
      }
    } else if (world.phase === 'round' && world.t <= 0) {
      if (world.mode === 'attract' || world.round < ROUNDS) { world.round = world.mode === 'attract' ? 1 : world.round + 1; startRound(); }
      else { world.phase = 'final'; world.t = 10; }
    } else if (world.phase === 'final' && world.t <= 0) { world.phase = 'done'; onEnd(); }
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract'; world.round = 1;
    addBots(ATTRACT_BOTS);
    startRound();
  }

  // Game > match: humans then bots, round 1 (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    slowFields.reset();
    world.mode = 'match'; world.round = 1;
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    startRound();
  }
  // Multiplayer > roster: leavers drop; a late joiner sits out the current round (takes a bot's seat, already-out ones first, when all 14 are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset();
    keyframeDue = true; // a late joiner gets scores + floors in its first snapshot
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      const bot = [...world.players.values()].filter((q) => q.bot).sort((a, b) => a.alive - b.alive || a.pts - b.pts)[0];
      if (!bot) return;
      removePlayer(bot.id);
    }
    const late = addPlayer(h.id, h.nick, h.color, false);
    if (world.phase !== 'count') Object.assign(late, { alive: false, y: OUT_Y - 5 });
    else Object.assign(late, { x: (rng() - 0.5) * 4, z: (rng() - 0.5) * 4, ground: true });
  }
  // Multiplayer > guest input { x, z, j: jump press counter }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.x), mz: axis(inp.z) });
    applyPresses(p, { jumpSeq: ['lastJump', inp.j] });
  }
  // Run engine > one fixed step
  function step() {
    const ps = [...world.players.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepPlayer(p, STEP);
    bump(ps);
    stepTiles(STEP);
    phases(STEP);
    keyframeT -= STEP;
  }
  // Multiplayer > snapshot (JSON): fast row per bean; scores only when they change; tiles as trigger indexes + a full state string every second
  const beanFlags = (p) => (p.bot ? 1 : 0) | (p.alive ? 2 : 0) | (p.ground ? 4 : 0);
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), rd: world.round, oc: world.outCount, win: world.winner,
      ...slowFields.pick({ S: ps.map((p) => [p.id, p.pts, p.wins, p.place]) }),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.y), f2(p.z), f1(p.vx), f1(p.vy), f1(p.vz), f2(p.face), beanFlags(p)]),
    }, ps);
    if (trig.length) snap.tr = trig;
    if (keyframeDue || keyframeT <= 0) { keyframeDue = false; keyframeT = KEYFRAME_EVERY; snap.K = tiles.map((t) => t.state).join(''); }
    if (events.length) snap.ev = events;
    events = []; trig = [];
    return snap;
  }
  // page attract: tile triggers already applied locally, nothing to send
  const dropTriggers = () => { trig = []; };

  return {
    world, tiles, animTiles, addPlayer, removePlayer, clearPlayers, stepPlayer, stepTiles, triggerTile, resetTiles, dropTriggers,
    startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get events() { return events; },
    set events(list) { events = list; },
  };
}
