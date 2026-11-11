// Runs Snowball Brawl rules (walk, lobbed throws, crumbling forts, freeze and thaw, bots, match clock) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, num, seq } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
export const R_ARENA = 25, WALL_H = 1.5;
export const SPEED = 7.5, G = 20, MAX_AMMO = 5, CD = 0.38, RANGE = 22, MATCH = 120, HITS = 3, FREEZE_T = 3;
const WALL_HP = 5, PR = 0.7, REGEN = 0.75, INV_T = 1.6, MAX_PLAYERS = 14, ATTRACT_BOTS = 8, MAX_QUEUED_THROWS = 4;
// Field > snow forts: axis-aligned boxes { x, z, w, d }: four corner Ls, a center cross, four rim shields
const CORNER_FORTS = [[1, 1], [-1, 1], [1, -1], [-1, -1]].flatMap(([sx, sz]) => {
  const cx = sx * 10, cz = sz * 10;
  return [{ x: cx, z: cz - sz * 1.7, w: 4, d: 0.9 }, { x: cx - sx * 1.7, z: cz, w: 0.9, d: 4 }];
});
export const WALLS = [
  ...CORNER_FORTS,
  { x: 4.5, z: 0, w: 0.9, d: 3.4 }, { x: -4.5, z: 0, w: 0.9, d: 3.4 }, { x: 0, z: 4.5, w: 3.4, d: 0.9 }, { x: 0, z: -4.5, w: 3.4, d: 0.9 },
  { x: 0, z: 18.5, w: 5, d: 0.9 }, { x: 0, z: -18.5, w: 5, d: 0.9 }, { x: 18.5, z: 0, w: 0.9, d: 5 }, { x: -18.5, z: 0, w: 0.9, d: 5 },
];
// fort height shrinks with each hit; 0 once knocked down
export const wallH = (s) => (s.hp <= 0 ? 0 : WALL_H * (0.25 + 0.75 * (s.hp / WALL_HP)));
const BOT_NAMES = ['Frosty', 'Blizzard', 'Flurry', 'Sleet', 'Icicle', 'Yeti', 'Slushy', 'Avalanche', 'Mitten', 'Powder', 'Tundra', 'Snowcone', 'Glacier', 'Frostbite'];
const BOT_COLORS = ['#ff5d73', '#3fa7ff', '#ffb000', '#2ec27e', '#a970ff', '#ff7b2f', '#00c2c7', '#ff5fbf', '#8bc34a', '#5c6bc0', '#e0b04a', '#26a69a', '#7ae7ff', '#c0ca33'];
const f1 = (v) => Math.round(v * 10) / 10, f2 = (v) => Math.round(v * 100) / 100;
const timerUp = (v) => Math.ceil(v * 10) / 10; // countdown timers round up so a running one never reads 0
const rng = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** onEnd(): results ran out (host goes back to the lobby) */
export function createSnowballSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Game > World
  const world = { mode: 'attract', phase: 'count', t: 2, clock: MATCH, players: new Map(), balls: new Map(), walls: WALLS.map(() => ({ hp: WALL_HP, down: 0 })), nextBall: 1 };
  let events = [], lastBeep = 0;
  function addPlayer(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, face: 0, hits: 0, frozen: 0, inv: 0, score: 0, dealt: 0, ammo: MAX_AMMO, cd: 0, regen: 0, mx: 0, mz: 0, ax: 0, az: 0, fire: 0, pending: [], skill: 0.6 + rng() * 0.3, think: 0, strafe: rng() < 0.5 ? 1 : -1, target: null, ex: 0, ez: 0 };
    world.players.set(id, p);
    return p;
  }
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function spawnAll() {
    // shuffled slots: join order never fixes who starts beside whom (host is always first to join)
    const ps = shuffleInPlace([...world.players.values()], rng), off = rng() * Math.PI * 2;
    ps.forEach((p, i) => {
      const a = off + (i / ps.length) * Math.PI * 2;
      Object.assign(p, { x: Math.cos(a) * 21, z: Math.sin(a) * 21, vx: 0, vz: 0, face: Math.atan2(-Math.cos(a), -Math.sin(a)), hits: 0, frozen: 0, inv: 0, ammo: MAX_AMMO, ax: 0, az: 0, pending: [] });
    });
    world.balls.clear();
    world.walls.forEach((w) => { w.hp = WALL_HP; w.down = 0; });
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3;
  }

  // Run engine > throws: ballistic arc that reaches the aim point at chest height
  function throwBall(p, tx, tz) {
    if (world.phase !== 'play' || p.frozen > 0 || p.ammo < 1 || p.cd > 0) return false;
    let dx = tx - p.x, dz = tz - p.z, d = Math.hypot(dx, dz) || 1;
    const dc = clamp(d, 1.5, RANGE); dx *= dc / d; dz *= dc / d;
    const nx = dx / dc, nz = dz / dc, sx = p.x + nx * 0.6, sz = p.z + nz * 0.6;
    const T = 0.3 + dc / 32, y0 = 1.4, y1 = 0.9;
    const b = { id: world.nextBall++, x: sx, y: y0, z: sz, vx: (p.x + dx - sx) / T, vy: (y1 - y0 + 0.5 * G * T * T) / T, vz: (p.z + dz - sz) / T, owner: p.id };
    world.balls.set(b.id, b);
    // throwing ends post-thaw protection
    p.ammo--; p.cd = CD + (p.bot ? 0.25 + rng() * 0.5 : 0); p.face = Math.atan2(nx, nz); p.inv = 0;
    events.push(['t', p.id]);
    return true;
  }
  function hitPlayer(p, b) {
    const by = world.players.get(b.owner);
    if (p.frozen > 0 || p.inv > 0) { events.push(['h', p.id, b.owner, 0, f1(b.x), f1(b.y), f1(b.z)]); return; }
    p.hits++; p.vx += b.vx * 0.18; p.vz += b.vz * 0.18;
    if (by) by.dealt++;
    events.push(['h', p.id, b.owner, 1, f1(b.x), f1(b.y), f1(b.z)]);
    if (p.hits >= HITS) {
      p.hits = 0; p.frozen = FREEZE_T;
      if (by) by.score++;
      events.push(['f', p.id, b.owner]);
    }
  }
  function stepBalls(dt, ps) {
    for (const b of world.balls.values()) {
      b.vy -= G * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      let gone = false;
      for (let i = 0; i < WALLS.length && !gone; i++) {
        const W = WALLS[i], s = world.walls[i];
        if (s.hp <= 0 || b.y > wallH(s) + 0.15 || Math.abs(b.x - W.x) > W.w / 2 + 0.15 || Math.abs(b.z - W.z) > W.d / 2 + 0.15) continue;
        s.hp--; if (s.hp <= 0) s.down = 12;
        events.push(['w', i, f1(b.x), f1(b.y), f1(b.z)]);
        gone = true;
      }
      if (!gone) for (const p of ps) {
        if (p.id === b.owner || b.y > 2.1) continue;
        if (Math.hypot(b.x - p.x, b.z - p.z) < PR + 0.22) { hitPlayer(p, b); gone = true; break; }
      }
      if (!gone && b.y < 0.15) { events.push(['s', f1(b.x), f1(b.z)]); gone = true; }
      if (!gone && Math.hypot(b.x, b.z) > R_ARENA + 10) gone = true;
      if (gone) world.balls.delete(b.id);
    }
  }

  // Run engine > players: smoothed walk, fort + arena collision, ammo regen, freeze/thaw
  function pushOutBox(p, W) {
    const hx = W.w / 2, hz = W.d / 2, cx = clamp(p.x, W.x - hx, W.x + hx), cz = clamp(p.z, W.z - hz, W.z + hz);
    const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
    if (d >= PR) return;
    if (d < 1e-4) {
      const ox = hx - Math.abs(p.x - W.x), oz = hz - Math.abs(p.z - W.z);
      if (ox < oz) p.x = W.x + Math.sign(p.x - W.x || 1) * (hx + PR); else p.z = W.z + Math.sign(p.z - W.z || 1) * (hz + PR);
    } else { p.x = cx + (dx / d) * PR; p.z = cz + (dz / d) * PR; }
  }
  function stepPlayer(p, dt) {
    p.cd = Math.max(0, p.cd - dt); p.inv = Math.max(0, p.inv - dt);
    if (p.ammo < MAX_AMMO) { p.regen += dt; if (p.regen >= REGEN) { p.regen = 0; p.ammo++; } } else p.regen = 0;
    if (p.frozen > 0) { p.frozen -= dt; if (p.frozen <= 0) { p.frozen = 0; p.inv = INV_T; events.push(['u', p.id]); } }
    const live = world.phase === 'play' && p.frozen <= 0;
    let mx = live ? p.mx : 0, mz = live ? p.mz : 0;
    const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
    const k = 1 - Math.exp(-dt * (p.frozen > 0 ? 4 : 10));
    p.vx += (mx * SPEED - p.vx) * k; p.vz += (mz * SPEED - p.vz) * k;
    p.x += p.vx * dt; p.z += p.vz * dt;
    for (let i = 0; i < WALLS.length; i++) if (world.walls[i].hp > 0) pushOutBox(p, WALLS[i]);
    const r = Math.hypot(p.x, p.z); if (r > R_ARENA - PR) { p.x *= (R_ARENA - PR) / r; p.z *= (R_ARENA - PR) / r; }
    if (!live) return;
    const dx = p.ax - p.x, dz = p.az - p.z;
    if (dx * dx + dz * dz > 0.25) p.face = Math.atan2(dx, dz);
    if (p.pending.length > 3) p.pending.splice(0, p.pending.length - 3);
    if (p.pending.length && p.cd <= 0) { const [tx, tz] = p.pending.shift(); throwBall(p, tx, tz); }
    else if (p.fire) throwBall(p, p.ax, p.az);
  }
  function playerBumps(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > PR * 2 || d < 1e-4) continue;
      const pen = (PR * 2 - d) / 2, nx = dx / d, nz = dz / d;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
    }
  }
  function stepWalls(dt, ps) {
    world.walls.forEach((s, i) => {
      if (s.hp > 0 || (s.down -= dt) > 0) return;
      const W = WALLS[i];
      // only regrow when nobody stands inside the footprint
      if (ps.some((p) => Math.abs(p.x - W.x) < W.w / 2 + PR && Math.abs(p.z - W.z) < W.d / 2 + PR)) { s.down = 0.5; return; }
      s.hp = WALL_HP;
      events.push(['r', i]);
    });
  }

  // Run engine > bots: chase nearest thawed rival at throwing range, strafe, lead the aim, dodge incoming, back off when empty
  function botThink(p, dt, ps) {
    p.think -= dt;
    if (p.think <= 0) {
      p.think = 0.3 + rng() * 0.25;
      let best = null, bd = 1e9;
      for (const q of ps) {
        if (q === p || q.frozen > 0) continue;
        const d = Math.hypot(q.x - p.x, q.z - p.z) + (q.inv > 0 ? 8 : 0) + (q.id === p.target ? -3 : 0) + (q.hits ? -2 * q.hits : 0);
        if (d < bd) { bd = d; best = q; }
      }
      p.target = best?.id ?? null;
      if (rng() < 0.18) p.strafe *= -1;
      p.ex = (rng() - 0.5) * 2; p.ez = (rng() - 0.5) * 2;
    }
    const t = world.players.get(p.target);
    let mx = 0, mz = 0;
    p.fire = 0;
    if (t && t.frozen <= 0) {
      const dx = t.x - p.x, dz = t.z - p.z, d = Math.hypot(dx, dz) || 1, nx = dx / d, nz = dz / d;
      const want = p.ammo >= 1 ? 10 : 19, radial = clamp((d - want) / 4, -1, 1);
      mx = nx * radial - nz * p.strafe * 0.75; mz = nz * radial + nx * p.strafe * 0.75;
      const T = 0.3 + Math.min(d, RANGE) / 32, err = (1 - p.skill) * d * 0.3;
      p.ax = t.x + t.vx * T * p.skill + p.ex * err; p.az = t.z + t.vz * T * p.skill + p.ez * err;
      p.fire = d < RANGE + 1 && t.inv <= 0 && p.ammo >= 1 ? 1 : 0;
    } else { mx = -p.x * 0.05; mz = -p.z * 0.05; p.ax = p.x + Math.sin(p.face); p.az = p.z + Math.cos(p.face); }
    for (const b of world.balls.values()) {
      if (b.owner === p.id) continue;
      const rx = p.x - b.x, rz = p.z - b.z, vv = b.vx * b.vx + b.vz * b.vz || 1, tc = (rx * b.vx + rz * b.vz) / vv;
      if (tc < 0 || tc > 0.6) continue;
      const cx = b.x + b.vx * tc - p.x, cz = b.z + b.vz * tc - p.z, cl = Math.hypot(cx, cz);
      if (cl < 1.4 && rng() < p.skill * 0.5) {
        // step away from the ball's closest pass, sideways if it is dead on
        const sx = cl > 0.05 ? -cx / cl : -b.vz / Math.sqrt(vv), sz = cl > 0.05 ? -cz / cl : b.vx / Math.sqrt(vv);
        mx = sx; mz = sz;
        break;
      }
    }
    p.mx = mx; p.mz = mz;
  }

  // Game > Phases: countdown, 2-minute brawl (attract loops forever), results
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'play'; events.push(['c', 0]); }
    } else if (world.phase === 'play' && world.mode === 'match') {
      world.clock -= dt;
      if (world.clock <= 0) { world.clock = 0; world.phase = 'final'; world.t = 10; events.push(['e']); }
    } else if (world.phase === 'final' && world.t <= 0) { world.phase = 'done'; onEnd(); }
  }
  function startAttract() {
    clearPlayers();
    world.mode = 'attract'; world.clock = MATCH;
    addBots(ATTRACT_BOTS);
    spawnAll();
  }

  // Game > match: humans then bots, shuffled around the rim (relay host)
  function startMatch({ humans, bots }) {
    clearPlayers();
    names.reset();
    slowFields.reset();
    world.mode = 'match'; world.clock = MATCH;
    for (const h of humans.slice(0, MAX_PLAYERS)) addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.players.size)));
    spawnAll();
  }
  // Multiplayer > roster: leavers drop; a joining human spawns on the rim, shielded (takes a bot's seat when all 14 are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
    slowFields.reset(); // a late joiner gets scores + forts in its first snapshot
  }
  function joinLate(h) {
    if (world.players.size >= MAX_PLAYERS) {
      const bot = [...world.players.values()].find((q) => q.bot);
      if (!bot) return;
      removePlayer(bot.id);
    }
    const a = rng() * Math.PI * 2;
    Object.assign(addPlayer(h.id, h.nick, h.color, false), { x: Math.cos(a) * 21, z: Math.sin(a) * 21, inv: INV_T });
  }
  // Multiplayer > guest input { mx, mz, ax, az: aim point, q: [[throw seq, x, z], ...] last few throws }
  function applyInput(id, inp) {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { mx: axis(inp.mx), mz: axis(inp.mz), ax: num(inp.ax, p.ax), az: num(inp.az, p.az) });
    queueThrows(p, Array.isArray(inp.q) ? inp.q.filter(Array.isArray) : []);
  }
  // throws ride in several packets; each seq fires once. First packet only syncs the counter, so old throws never replay
  function queueThrows(p, throws) {
    if (p.lastThrow === undefined) { p.lastThrow = throws.length ? seq(throws.at(-1)[0]) : 0; return; }
    for (const [throwSeq, tx, tz] of throws) {
      if (seq(throwSeq) <= p.lastThrow) continue;
      p.lastThrow = seq(throwSeq);
      if (p.pending.length < MAX_QUEUED_THROWS) p.pending.push([num(tx), num(tz)]);
    }
  }
  // Run engine > one fixed step: kids, snowballs (two half steps so fast balls do not tunnel), forts
  function step() {
    const ps = [...world.players.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP, ps);
    for (const p of ps) stepPlayer(p, STEP);
    playerBumps(ps);
    for (let half = 0; half < 2; half++) stepBalls(STEP / 2, ps);
    stepWalls(STEP, ps);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): fast row per kid + every ball each time; scores + fort hp only when they change; events since the last one
  function snapshot() {
    const ps = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), ck: f2(world.clock),
      ...slowFields.pick({ W: world.walls.map((s) => s.hp), S: ps.map((p) => [p.id, p.hits, p.score, p.dealt]) }),
      B: [...world.balls.values()].map((b) => [b.id, f2(b.x), f2(b.y), f2(b.z), f1(b.vx), f1(b.vy), f1(b.vz)]),
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.face), f2(p.vx), f2(p.vz), timerUp(p.frozen), timerUp(p.inv), p.ammo]),
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
