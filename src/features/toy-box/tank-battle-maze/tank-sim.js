// Runs Tank Brawl rules (seeded maze, tank drive, bouncing shells, crates, respawns, bots, match clock) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, num, seq, applyPresses } from '../common/guest-input.js';
import { createNameSync } from '../common/snapshot-names.js';
import { createChangedOnly } from '../common/server-run/changed-only.js';

export const STEP = 1 / 60;
// Arena > maze grid: W x H cells of CELL units, wall thickness TH
export const W = 15, H = 11, CELL = 7, WALL_H = 2.2;
export const HALF_W = (W * CELL) / 2, HALF_H = (H * CELL) / 2;
export const MATCH_TIME = 180, KILL_CAP = 15;
const TH = 0.9, TANK_R = 1.25, SHELL_R = 0.28, SHELL_V = 23, MAX_SHELLS = 5, MAX_PLAYERS = 14, ATTRACT_BOTS = 6, ATTRACT_SEED = 1;
const BOT_NAMES = ['Sarge', 'Rusty', 'Boomer', 'Tread', 'Gizmo', 'Major Tom', 'Bolt', 'Clank', 'Dozer', 'Pixel', 'Spud', 'Ace', 'Tracker', 'Howitzer'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
function mulberry(a) { return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/** onEnd(): results ran out (host goes back to the lobby) */
export function createTankSim({ onEnd = () => {} } = {}) {
  const names = createNameSync();
  const slowFields = createChangedOnly();
  // Arena > Seeded maze: backtracker carve, then knock out extra walls for loops
  // Arena > Seeded maze: backtracker carve, then knock out extra walls for loops
  let maze = null;
  function genMaze(seed) {
    const r = mulberry(seed);
    // hW[y][x]: wall on top edge of cell (x,y), y = 0..H; vW[y][x]: wall on left edge, x = 0..W
    const hW = Array.from({ length: H + 1 }, () => Array(W).fill(true));
    const vW = Array.from({ length: H }, () => Array(W + 1).fill(true));
    const seen = Array.from({ length: H }, () => Array(W).fill(false));
    const stack = [[Math.floor(r() * W), Math.floor(r() * H)]];
    seen[stack[0][1]][stack[0][0]] = true;
    while (stack.length) {
      const [x, y] = stack[stack.length - 1];
      const opts = [[1, 0], [-1, 0], [0, 1], [0, -1]].filter(([dx, dy]) => { const nx = x + dx, ny = y + dy; return nx >= 0 && ny >= 0 && nx < W && ny < H && !seen[ny][nx]; });
      if (!opts.length) { stack.pop(); continue; }
      const [dx, dy] = opts[Math.floor(r() * opts.length)];
      if (dx === 1) vW[y][x + 1] = false; if (dx === -1) vW[y][x] = false; if (dy === 1) hW[y + 1][x] = false; if (dy === -1) hW[y][x] = false;
      seen[y + dy][x + dx] = true;
      stack.push([x + dx, y + dy]);
    }
    for (let y = 1; y < H; y++) for (let x = 0; x < W; x++) if (hW[y][x] && r() < 0.42) hW[y][x] = false;
    for (let y = 0; y < H; y++) for (let x = 1; x < W; x++) if (vW[y][x] && r() < 0.42) vW[y][x] = false;
    // merge runs of edges into long wall boxes
    const boxes = [];
    for (let y = 0; y <= H; y++) { let s = -1; for (let x = 0; x <= W; x++) { const on = x < W && hW[y][x]; if (on && s < 0) s = x; if (!on && s >= 0) { boxes.push({ minx: s * CELL - HALF_W - TH / 2, maxx: x * CELL - HALF_W + TH / 2, minz: y * CELL - HALF_H - TH / 2, maxz: y * CELL - HALF_H + TH / 2 }); s = -1; } } }
    for (let x = 0; x <= W; x++) { let s = -1; for (let y = 0; y <= H; y++) { const on = y < H && vW[y][x]; if (on && s < 0) s = y; if (!on && s >= 0) { boxes.push({ minx: x * CELL - HALF_W - TH / 2, maxx: x * CELL - HALF_W + TH / 2, minz: s * CELL - HALF_H - TH / 2, maxz: y * CELL - HALF_H + TH / 2 }); s = -1; } } }
    // occupancy grid (0.5 u) for cheap line-of-sight
    const GR = 0.5, gw = Math.ceil((W * CELL) / GR) + 2, gh = Math.ceil((H * CELL) / GR) + 2;
    const occ = new Uint8Array(gw * gh);
    for (const b of boxes) for (let gz = Math.floor((b.minz + HALF_H) / GR); gz <= Math.floor((b.maxz + HALF_H) / GR); gz++) for (let gx = Math.floor((b.minx + HALF_W) / GR); gx <= Math.floor((b.maxx + HALF_W) / GR); gx++) if (gx >= 0 && gz >= 0 && gx < gw && gz < gh) occ[gz * gw + gx] = 1;
    return { seed, hW, vW, boxes, occ, gw, gh, GR };
  }
  const cellCenter = (cx, cy) => [cx * CELL - HALF_W + CELL / 2, cy * CELL - HALF_H + CELL / 2];
  const cellOf = (x, z) => [clamp(Math.floor((x + HALF_W) / CELL), 0, W - 1), clamp(Math.floor((z + HALF_H) / CELL), 0, H - 1)];
  function blocked(x, z) { const g = Math.floor((x + HALF_W) / maze.GR), h = Math.floor((z + HALF_H) / maze.GR); return g < 0 || h < 0 || g >= maze.gw || h >= maze.gh || maze.occ[h * maze.gw + g] === 1; }
  function los(ax, az, bx, bz) {
    const d = Math.hypot(bx - ax, bz - az), n = Math.ceil(d / 0.4);
    for (let i = 1; i < n; i++) if (blocked(ax + (bx - ax) * (i / n), az + (bz - az) * (i / n))) return false;
    return true;
  }
  function bfsPath(from, to) {
    const key = (x, y) => y * W + x, prev = new Int32Array(W * H).fill(-2);
    const q = [from]; prev[key(...from)] = -1;
    while (q.length) {
      const [x, y] = q.shift();
      if (x === to[0] && y === to[1]) break;
      const nb = [];
      if (x < W - 1 && !maze.vW[y][x + 1]) nb.push([x + 1, y]);
      if (x > 0 && !maze.vW[y][x]) nb.push([x - 1, y]);
      if (y < H - 1 && !maze.hW[y + 1][x]) nb.push([x, y + 1]);
      if (y > 0 && !maze.hW[y][x]) nb.push([x, y - 1]);
      for (const n of nb) if (prev[key(...n)] === -2) { prev[key(...n)] = key(x, y); q.push(n); }
    }
    const path = [];
    let k = key(...to);
    if (prev[k] === -2) return path;
    while (k !== -1 && k !== key(...from)) { path.unshift([k % W, Math.floor(k / W)]); k = prev[k]; }
    return path;
  }

  // Game > World state
  const world = { mode: 'attract', phase: 'play', t: 0, tanks: new Map(), shells: [], crates: [], crateId: 1, crateT: 4, winner: null, seed: 1 };
  let events = [], lastBeep = 0;

  function addTank(id, nick, color, bot) {
    const p = { id, nick, color, bot, x: 0, z: 0, ang: 0, tur: 0, alive: false, respawn: 0.5, inv: 0, kills: 0, deaths: 0, shield: false, triple: 0, speed: 0, cd: 0, inT: 0, inR: 0, aim: 0, fireSeq: 0, lastFire: 0, ai: { t: 0, path: [], target: null } };
    world.tanks.set(id, p);
    return p;
  }
  const removeTank = (id) => world.tanks.delete(id);
  function clearTanks() { world.tanks.clear(); world.shells = []; world.crates = []; }
  const addBots = (n) => { for (let i = 0; i < n; i++) addTank(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };
  function spawn(p) {
    // farthest-from-enemies cell out of a random sample
    let best = null, bd = -1;
    for (let i = 0; i < 14; i++) {
      const [x, z] = cellCenter(Math.floor(rng() * W), Math.floor(rng() * H));
      let d = 1e9;
      for (const q of world.tanks.values()) if (q !== p && q.alive) d = Math.min(d, Math.hypot(q.x - x, q.z - z));
      if (d > bd) { bd = d; best = [x, z]; }
    }
    Object.assign(p, { x: best[0], z: best[1], ang: rng() * Math.PI * 2, alive: true, inv: 2, shield: false, triple: 0, speed: 0, cd: 0.5 });
    p.tur = p.ang;
  }

  // Run engine > collisions: circle vs wall boxes
  function pushOut(o, r) {
    for (const b of maze.boxes) {
      const cx = clamp(o.x, b.minx, b.maxx), cz = clamp(o.z, b.minz, b.maxz);
      const dx = o.x - cx, dz = o.z - cz, d2 = dx * dx + dz * dz;
      if (d2 >= r * r) continue;
      if (d2 > 1e-8) { const d = Math.sqrt(d2), k = (r - d) / d; o.x += dx * k; o.z += dz * k; }
      else { const px = Math.min(o.x - b.minx, b.maxx - o.x), pz = Math.min(o.z - b.minz, b.maxz - o.z); if (px < pz) o.x += o.x - b.minx < b.maxx - o.x ? -(px + r) : px + r; else o.z += o.z - b.minz < b.maxz - o.z ? -(pz + r) : pz + r; }
    }
    o.x = clamp(o.x, -HALF_W + r, HALF_W - r); o.z = clamp(o.z, -HALF_H + r, HALF_H - r);
  }
  // shells reflect on the axis of least penetration
  function shellWalls(s) {
    for (const b of maze.boxes) {
      if (s.x + SHELL_R < b.minx || s.x - SHELL_R > b.maxx || s.z + SHELL_R < b.minz || s.z - SHELL_R > b.maxz) continue;
      const ox = Math.min(s.x + SHELL_R - b.minx, b.maxx - (s.x - SHELL_R)), oz = Math.min(s.z + SHELL_R - b.minz, b.maxz - (s.z - SHELL_R));
      if (ox < oz) { s.vx = -s.vx; s.x += s.x < (b.minx + b.maxx) / 2 ? -ox : ox; }
      else { s.vz = -s.vz; s.z += s.z < (b.minz + b.maxz) / 2 ? -oz : oz; }
      s.bounces++; s.armed = true;
      events.push(['b', +s.x.toFixed(1), +s.z.toFixed(1)]);
      return;
    }
  }
  function fire(p) {
    const mine = world.shells.filter((s) => s.owner === p.id).length;
    if (p.cd > 0 || mine >= MAX_SHELLS + (p.triple > 0 ? 6 : 0)) return;
    const angs = p.triple > 0 ? [p.tur - 0.22, p.tur, p.tur + 0.22] : [p.tur];
    for (const a of angs) {
      const s = { owner: p.id, x: p.x + Math.sin(a) * 1.9, z: p.z + Math.cos(a) * 1.9, vx: Math.sin(a) * SHELL_V, vz: Math.cos(a) * SHELL_V, life: 4, bounces: 0, armed: false, age: 0 };
      // muzzle inside a wall: fizzle instead of tunnelling through
      if (blocked(s.x, s.z)) continue;
      world.shells.push(s);
    }
    p.cd = 0.45;
    // firing ends spawn protection (no shooting from behind the bubble)
    p.inv = 0;
    events.push(['f', p.id]);
  }
  function kill(victim, killerId) {
    if (victim.shield) { victim.shield = false; victim.inv = 0.6; events.push(['s', victim.id]); return; }
    victim.alive = false; victim.respawn = 2.6; victim.deaths++;
    const killer = world.tanks.get(killerId);
    if (killer && killer !== victim) killer.kills++;
    else if (killer === victim) victim.kills = Math.max(0, victim.kills - 1);
    events.push(['x', +victim.x.toFixed(1), +victim.z.toFixed(1), victim.color], ['k', killerId, victim.id]);
  }

  // Run engine > step: drive, shells, crates, phases
  // one tank's drive + turret swing; shared by host sim and guest prediction
  function driveTank(p, dt) {
    const sp = (p.inT >= 0 ? 9 : 6) * (p.speed > 0 ? 1.5 : 1);
    p.ang += clamp(p.inR, -1, 1) * 2.7 * dt;
    const th = clamp(p.inT, -1, 1);
    p.x += Math.sin(p.ang) * th * sp * dt; p.z += Math.cos(p.ang) * th * sp * dt;
    p.moved = th;
    pushOut(p, TANK_R);
    let da = p.aim - p.tur; da = Math.atan2(Math.sin(da), Math.cos(da));
    p.tur += clamp(da, -7 * dt, 7 * dt);
  }
  function physics(dt) {
    const playing = world.phase === 'play';
    for (const p of world.tanks.values()) {
      if (!p.alive) { if (playing && (p.respawn -= dt) <= 0 && p.inRound !== false) spawn(p); continue; }
      p.cd = Math.max(0, p.cd - dt); p.inv = Math.max(0, p.inv - dt); p.triple = Math.max(0, p.triple - dt); p.speed = Math.max(0, p.speed - dt);
      if (!playing) continue;
      driveTank(p, dt);
      if (p.fireSeq !== p.lastFire) { p.lastFire = p.fireSeq; fire(p); }
    }
    // tank vs tank separation
    const ts = [...world.tanks.values()].filter((p) => p.alive);
    for (let i = 0; i < ts.length; i++) for (let j = i + 1; j < ts.length; j++) {
      const a = ts[i], b = ts[j], dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz);
      if (d < TANK_R * 2 && d > 1e-4) { const k = (TANK_R * 2 - d) / d / 2; a.x += dx * k; a.z += dz * k; b.x -= dx * k; b.z -= dz * k; }
    }
    // shells: 2 substeps for thin walls; owner immune until first bounce or 0.25 s
    for (const s of world.shells) {
      for (let k = 0; k < 2; k++) {
        s.x += s.vx * dt / 2; s.z += s.vz * dt / 2;
        shellWalls(s);
      }
      s.life -= dt; s.age += dt;
      if (s.age > 0.25) s.armed = true;
      if (s.bounces > 3) s.life = 0;
      for (const p of ts) {
        if (!p.alive || s.life <= 0 || p.inv > 0) continue;
        if (p.id === s.owner && !s.armed) continue;
        if (Math.hypot(p.x - s.x, p.z - s.z) < TANK_R + SHELL_R) { s.life = 0; kill(p, s.owner); }
      }
    }
    // shell vs shell: both pop
    for (let i = 0; i < world.shells.length; i++) for (let j = i + 1; j < world.shells.length; j++) {
      const a = world.shells[i], b = world.shells[j];
      if (a.life > 0 && b.life > 0 && Math.hypot(a.x - b.x, a.z - b.z) < SHELL_R * 2) { a.life = b.life = 0; events.push(['b', +a.x.toFixed(1), +a.z.toFixed(1)]); }
    }
    world.shells = world.shells.filter((s) => s.life > 0);
    // crates: spawn every few seconds, max 4
    if (playing) {
      world.crateT -= dt;
      if (world.crateT <= 0 && world.crates.length < 4) {
        world.crateT = 7 + rng() * 5;
        const [x, z] = cellCenter(Math.floor(rng() * W), Math.floor(rng() * H));
        world.crates.push({ id: world.crateId++, x, z, type: ['triple', 'shield', 'speed'][Math.floor(rng() * 3)] });
      }
      for (const c of world.crates) for (const p of ts) if (!c.taken && Math.hypot(p.x - c.x, p.z - c.z) < 2) {
        c.taken = true;
        if (c.type === 'triple') p.triple = 9; else if (c.type === 'shield') p.shield = true; else p.speed = 8;
        events.push(['p', p.id, c.type]);
      }
      world.crates = world.crates.filter((c) => !c.taken);
    }
  }

  // Run engine > bots: BFS toward target, aim with lead when in sight, dodge incoming shells
  function botThink(p, dt) {
    const ai = p.ai;
    ai.t -= dt;
    if (ai.t <= 0) {
      ai.t = 0.25 + rng() * 0.15;
      let best = null, bd = 1e9;
      for (const q of world.tanks.values()) if (q !== p && q.alive) { const d = Math.hypot(q.x - p.x, q.z - p.z) * (los(p.x, p.z, q.x, q.z) ? 0.5 : 1); if (d < bd) { bd = d; best = q; } }
      if (!best && world.crates.length) best = world.crates[0];
      ai.target = best;
      ai.path = best ? bfsPath(cellOf(p.x, p.z), cellOf(best.x, best.z)) : [];
      ai.see = best && best.ang !== undefined && los(p.x, p.z, best.x, best.z);
      ai.jit = (rng() - 0.5) * 0.12;
    }
    const t = ai.target;
    let gx = p.x, gz = p.z;
    if (ai.path.length) { [gx, gz] = cellCenter(...ai.path[0]); if (Math.hypot(gx - p.x, gz - p.z) < 2) ai.path.shift(); }
    else if (t) { gx = t.x; gz = t.z; }
    if (ai.see && t && Math.hypot(t.x - p.x, t.z - p.z) < 9) { gx = p.x - (t.x - p.x); gz = p.z - (t.z - p.z); }
    // dodge: sidestep a shell that will pass close
    for (const s of world.shells) {
      if (s.owner === p.id) continue;
      const rx = p.x - s.x, rz = p.z - s.z, v2 = s.vx * s.vx + s.vz * s.vz, tt = (rx * s.vx + rz * s.vz) / v2;
      if (tt > 0 && tt < 0.6) { const cx = s.x + s.vx * tt - p.x, cz = s.z + s.vz * tt - p.z; if (Math.hypot(cx, cz) < 2.2) { gx = p.x - s.vz; gz = p.z + s.vx; break; } }
    }
    let want = Math.atan2(gx - p.x, gz - p.z), d = want - p.ang;
    d = Math.atan2(Math.sin(d), Math.cos(d));
    // tanks can reverse: if target is behind, back up instead of a full spin
    if (Math.abs(d) > 2.2) { d = Math.atan2(Math.sin(d + Math.PI), Math.cos(d + Math.PI)); p.inT = -1; } else p.inT = Math.abs(d) < 0.8 ? 1 : 0.25;
    p.inR = clamp(d * 2.5, -1, 1);
    if (t && ai.see && t.ang !== undefined) {
      const dist = Math.hypot(t.x - p.x, t.z - p.z), lead = dist / SHELL_V;
      const tv = t.moved ?? 0;
      const ax = t.x + Math.sin(t.ang) * tv * 9 * lead, az = t.z + Math.cos(t.ang) * tv * 9 * lead;
      p.aim = Math.atan2(ax - p.x, az - p.z) + ai.jit;
      let e = p.aim - p.tur; e = Math.atan2(Math.sin(e), Math.cos(e));
      if (Math.abs(e) < 0.12 && p.cd <= 0 && rng() < 0.08) p.fireSeq++;
    } else p.aim = p.ang;
  }

  // Game > Phases: countdown, timed deathmatch, results
  function phases(dt) {
    if (world.mode === 'attract') { world.phase = 'play'; return; }
    if (world.phase === 'count') {
      world.t -= dt;
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); events.push(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'play'; world.t = MATCH_TIME; events.push(['c', 0]); }
    } else if (world.phase === 'play') {
      world.t -= dt;
      const top = [...world.tanks.values()].sort((a, b) => b.kills - a.kills || a.deaths - b.deaths)[0];
      if (world.t <= 0 || (top && top.kills >= KILL_CAP)) { world.phase = 'end'; world.t = 7; world.winner = top?.id ?? null; world.shells = []; }
    } else if (world.phase === 'end') {
      world.t -= dt;
      if (world.t <= 0) { world.phase = 'done'; onEnd(); }
    }
  }
  function beginMatch() {
    world.phase = 'count'; world.t = 3; lastBeep = 4; world.winner = null; world.shells = []; world.crates = []; world.crateT = 4;
    for (const p of world.tanks.values()) { p.kills = p.deaths = 0; spawn(p); }
  }
  // Arena > maze for this seed; walls are rebuilt only when the seed changes
  function loadMaze(seed) {
    if (maze?.seed !== seed) maze = genMaze(seed);
  }
  function startAttract() {
    clearTanks();
    world.mode = 'attract';
    loadMaze(ATTRACT_SEED);
    addBots(ATTRACT_BOTS);
    for (const p of world.tanks.values()) spawn(p);
  }

  // Game > match: maze from the lobby seed, humans then bots (relay host)
  function startMatch({ seed, humans, bots }) {
    clearTanks();
    names.reset();
    slowFields.reset();
    world.mode = 'match';
    world.seed = seq(seed) || ATTRACT_SEED;
    loadMaze(world.seed);
    for (const h of humans.slice(0, MAX_PLAYERS)) addTank(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_PLAYERS - world.tanks.size)));
    beginMatch();
  }
  // Multiplayer > roster: leavers drop; a joining human rolls in at the next respawn (replaces the newest bot when all 14 seats are taken)
  function syncRoster(humans) {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.tanks.values()]) if (!p.bot && !ids.has(p.id)) removeTank(p.id);
    for (const h of humans) if (!world.tanks.has(h.id)) joinLate(h);
    slowFields.reset(); // a late joiner gets seed + crates in its first snapshot
  }
  function joinLate(h) {
    if (world.tanks.size >= MAX_PLAYERS) {
      const bot = [...world.tanks.values()].filter((q) => q.bot).pop();
      if (!bot) return;
      removeTank(bot.id);
    }
    addTank(h.id, h.nick, h.color, false);
  }
  // Multiplayer > guest input { t: throttle, r: turn, a: turret aim angle, f: fire press counter }
  function applyInput(id, inp) {
    const p = world.tanks.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { inT: axis(inp.t), inR: axis(inp.r), aim: num(inp.a, p.aim) });
    applyPresses(p, { fireSeq: ['lastFire', inp.f] });
  }
  // Run engine > one fixed step
  function step() {
    for (const p of world.tanks.values()) if (p.bot && p.alive) botThink(p, STEP);
    physics(STEP);
    phases(STEP);
  }
  // Multiplayer > snapshot (JSON): one row per tank + every shell each time; maze seed + crates only when they change; events since the last one
  const tankFlags = (p) => (p.alive ? 1 : 0) | (p.shield ? 2 : 0) | (p.inv > 0 ? 4 : 0) | (p.bot ? 8 : 0);
  function snapshot() {
    const ps = [...world.tanks.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), win: world.winner,
      ...slowFields.pick({ seed: world.seed, C: world.crates.map((c) => [c.id, c.x, c.z, c.type]) }),
      T: ps.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.ang), f2(p.tur), tankFlags(p), p.kills, p.deaths, Math.ceil(p.triple), Math.ceil(p.speed), f2(p.moved ?? 0), f2(p.respawn)]),
      S: world.shells.map((s) => [f2(s.x), f2(s.z), f2(s.vx), f2(s.vz)]),
    }, ps);
    if (events.length) snap.ev = events;
    events = [];
    return snap;
  }

  return {
    world, addTank, removeTank, clearTanks, driveTank, loadMaze, startAttract, startMatch, syncRoster, applyInput, step, snapshot,
    get maze() { return maze; },
    get events() { return events; },
    set events(list) { events = list; },
  };
}
