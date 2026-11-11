// Runs Light Cycles rules (trail grid, right-angle turns, guest turn rewind, boost energy, crashes, round points, bots) with no rendering, for page attract mode and the relay server host.

import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const A = 100, HALF = A / 2;
export const ROUNDS = 5, SPEED = 17, BOOST = 28;
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]];
// a human cycle waits this long at a wall for a turn still in flight before derezzing
export const GRACE = 0.25;
export const cellOf = (x, z) => { const cx = Math.floor(x + HALF), cz = Math.floor(z + HALF); return cx < 0 || cz < 0 || cx >= A || cz >= A ? -1 : cz * A + cx; };
export const cellCenter = (c) => [c % A - HALF + 0.5, Math.floor(c / A) - HALF + 0.5];
const MAX_RIDERS = 14, ATTRACT_BOTS = 8, MAX_TURN_LOG = 8;
const REWIND = 6; // cells: ~350 ms at ride speed, ~210 ms boosting
const KEYFRAME_STEPS = 60; // corner keyframe at least once a second
const BOT_NAMES = ['Flynn', 'Quorra', 'Rinzler', 'Byte', 'Pixel', 'Vector', 'Glitch', 'Neon', 'Raster', 'Sector', 'Kernel', 'Cache', 'Daemon', 'Proxy'];
const BOT_COLORS = ['#ff9f43', '#c77dff', '#5ee07a', '#ff6ec7', '#ffd23f', '#a3e635', '#3fa7ff', '#ff5a5f', '#14b8a6', '#f8fafc', '#8b5cf6', '#2de2e6', '#00ffa3', '#ff3df5'];
// 16 spawns in a starburst: 3 abreast per direction at 8 out, plus 4 corner riders at 14 out, all heading outward so no early crossings
const SLOTS = [];
for (const [out, k] of [[8, 0], [8, -6], [8, 6], [14, 14]]) for (let dir = 0; dir < 4; dir++) { const [dx, dz] = DIRS[dir]; SLOTS.push({ x: dx * out - dz * k + 0.5, z: dz * out + dx * k + 0.5, dir }); }
const f2 = (v) => Math.round(v * 100) / 100;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rng = Math.random;

/**
 * onEnd(): final standings ran out (match over).
 * sim.grid: trail owner gid per 1x1 cell (0 = free); a rider's corners + head draw its trail.
 * sim.events since the last drain: t turn [id, x, z, dir], x crash [id, x, z, place], c count beep, w round winner
 */
export function createCycleSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'count', t: 3, round: 1, players: new Map(), outCount: 0, winner: null };
  const grid = new Int16Array(A * A);
  const names = createNameSync(), lastTurnCount = new Map();
  const sim = { world, grid, events: [] };
  const emit = (...event) => sim.events.push(event);
  const everyone = () => [...world.players.values()];
  let nextGid = 1, lastBeep = 0, stepNo = 0, keyframeAt = -KEYFRAME_STEPS, keyframeDirty = true;

  // Game > World
  sim.addPlayer = (id, nick, color, bot) => {
    const p = { id, nick, color, bot, x: 0, z: 0, dir: 0, alive: true, boost: false, energy: 1, pts: 0, wins: 0, corners: [], cells: [], cell: -1, turns: [], ack: 0, stall: 0, inBoost: false, think: 0, skill: 0.75 + rng() * 0.22, place: 0, gid: 0 };
    world.players.set(id, p);
    return p;
  };
  sim.removePlayer = (id) => {
    const p = world.players.get(id);
    if (p) clearTrail(p);
    world.players.delete(id);
  };
  sim.clearPlayers = () => { world.players.clear(); grid.fill(0); };
  function clearTrail(p) { for (const c of p.cells) if (grid[c] === p.gid) grid[c] = 0; }

  // shuffle riders over the slots in use so nobody keeps the same start lane every round
  function startRound() {
    grid.fill(0);
    nextGid = 1;
    const ps = everyone();
    const order = shuffleInPlace(SLOTS.map((s, i) => i).slice(0, Math.min(ps.length, SLOTS.length)), rng);
    ps.forEach((p, k) => {
      const slot = SLOTS[order[k % SLOTS.length]];
      Object.assign(p, { x: slot.x, z: slot.z, dir: slot.dir, alive: true, boost: false, energy: 1, corners: [slot.x, slot.z], cells: [], turns: [], stall: 0, place: 0, gid: nextGid++ });
      p.cell = cellOf(p.x, p.z);
      grid[p.cell] = p.gid; p.cells.push(p.cell);
    });
    Object.assign(world, { phase: 'count', t: world.mode === 'attract' ? 1.5 : 3.5, outCount: 0, winner: null });
    keyframeDirty = true;
  }

  // Run engine > turns snap to cell centers, cells lit as the head enters them
  // queued turn = [dir, pressed cell (-1 = now), guest turn count]
  function turn(p, d) {
    if (!p.alive || world.phase !== 'play') return;
    const cx = Math.floor(p.x + HALF) - HALF + 0.5, cz = Math.floor(p.z + HALF) - HALF + 0.5;
    Object.assign(p, { x: cx, z: cz, stall: 0, dir: (p.dir + (d > 0 ? 1 : 3)) % 4 });
    p.corners.push(cx, cz);
    emit('t', p.id, cx, cz, p.dir);
  }

  // place from riders still on the grid: late-join spectators and leavers never shift it
  function crash(p) {
    p.alive = false;
    p.pts += world.outCount;
    world.outCount++;
    p.place = everyone().filter((q) => q.alive).length + 1;
    clearTrail(p);
    emit('x', p.id, +p.x.toFixed(1), +p.z.toFixed(1), p.place);
  }

  function applyTurn(p, [d, cell, count]) {
    if (count) p.ack = count;
    const rewound = cell >= 0 ? rewindTo(p, cell) : 0;
    if (rewound < 0) keyframeDirty = true; // turned off the pressed cell: resend corners
    turn(p, d);
    if (rewound > 0) ride(p, rewound); // replay the lost travel on the new heading, where the guest already sees it
  }

  // Lag compensation > guest turn pressed a few cells back (same straight run) rewinds the cycle to that cell; -1 = out of reach
  function rewindTo(p, cell) {
    const k = p.cells.lastIndexOf(cell);
    if (k < 0 || p.cells.length - 1 - k > REWIND) return -1;
    const n = p.corners.length;
    if (p.cells.lastIndexOf(cellOf(p.corners[n - 2], p.corners[n - 1])) > k) return -1; // turned since
    for (const c of p.cells.splice(k + 1)) if (grid[c] === p.gid) grid[c] = 0;
    const [cx, cz] = cellCenter(cell), back = Math.abs(p.x - cx) + Math.abs(p.z - cz);
    Object.assign(p, { cell, x: cx, z: cz });
    return back;
  }

  // pressed cell still 1-2 cells ahead (guest saw itself ahead of the server): hold the turn till the head gets there
  function turnDue(p, [, cell]) {
    if (cell < 0 || cell === p.cell || p.cell < 0) return true;
    const [dx, dz] = DIRS[p.dir], ex = cell % A - p.cell % A, ez = Math.floor(cell / A) - Math.floor(p.cell / A);
    const ahead = ex * dx + ez * dz, side = ex * dz - ez * dx;
    return side !== 0 || ahead <= 0 || ahead > 2;
  }

  function stepCycle(p, dt) {
    if (!p.alive || world.phase !== 'play') return;
    if (p.turns.length && turnDue(p, p.turns[0])) applyTurn(p, p.turns.shift());
    if (p.stall > 0) { p.stall -= dt; if (p.stall <= 0) crash(p); return; }
    p.boost = p.inBoost && p.energy > 0.02;
    p.energy = clamp(p.energy + (p.boost ? -0.5 : 0.12) * dt, 0, 1);
    ride(p, (p.boost ? BOOST : SPEED) * dt);
  }

  // walk cell by cell so fast cycles can't skip through a wall; humans get GRACE for a turn still in flight
  function ride(p, dist) {
    const [dx, dz] = DIRS[p.dir];
    for (let remain = dist; remain > 0;) {
      const stepLen = Math.min(remain, 0.45);
      p.x += dx * stepLen; p.z += dz * stepLen; remain -= stepLen;
      const c = cellOf(p.x, p.z);
      if (c === p.cell) continue;
      if (c < 0 || grid[c]) {
        if (p.bot) return crash(p);
        p.x -= dx * stepLen; p.z -= dz * stepLen; p.stall = GRACE;
        return;
      }
      grid[c] = p.gid; p.cells.push(c); p.cell = c;
    }
  }

  // Run engine > bots: compare straight / left / right by reachable area, steer away early
  function freeRay(x, z, dir, max) {
    const [dx, dz] = DIRS[dir];
    let n = 0;
    for (let k = 1; k <= max; k++) { const c = cellOf(x + dx * k, z + dz * k); if (c < 0 || grid[c]) break; n++; }
    return n;
  }
  const seen = new Int32Array(A * A);
  let seenMark = 0;
  function area(x, z, dir, limit) {
    const [dx, dz] = DIRS[dir], start = cellOf(x + dx, z + dz);
    if (start < 0 || grid[start]) return 0;
    seenMark++;
    const queue = [start]; seen[start] = seenMark;
    let n = 0;
    for (let head = 0; head < queue.length && n < limit; head++) {
      const c = queue[head]; n++;
      const cx = c % A, cz = (c - cx) / A;
      for (const [ex, ez] of DIRS) {
        const nx = cx + ex, nz = cz + ez;
        if (nx < 0 || nz < 0 || nx >= A || nz >= A) continue;
        const ni = nz * A + nx;
        if (grid[ni] || seen[ni] === seenMark) continue;
        seen[ni] = seenMark; queue.push(ni);
      }
    }
    return n;
  }
  // skill = foresight: how much free space it counts, and how steady the pick is; weak riders sometimes judge by the straight ray only
  function rateHeading(p, d, dir) {
    const ray = freeRay(p.x, p.z, dir, 30);
    const look = Math.round(120 + 380 * p.skill), myopic = rng() < 0.6 * (1 - p.skill);
    return { d, s: (myopic ? 0 : (Math.min(area(p.x, p.z, dir, look), look) / look) * 400) + ray * 2 + (d === 0 ? 6 : 0) + rng() * 40 * (1.1 - p.skill) };
  }
  function botThink(p, dt) {
    if (!p.alive || world.phase !== 'play') return;
    p.think -= dt;
    const ahead = freeRay(p.x, p.z, p.dir, 30);
    const danger = ahead < 1.5 + (p.boost ? 7 : 4) * p.skill;
    if (!danger && p.think > 0) return;
    p.think = 0.25 + rng() * 0.35;
    const opts = [[0, p.dir], [1, (p.dir + 1) % 4], [-1, (p.dir + 3) % 4]].map(([d, dir]) => rateHeading(p, d, dir));
    // rare random wiggle keeps bots from drawing perfect squares
    if (!danger && rng() < 0.08) opts[1 + Math.floor(rng() * 2)].s += 30;
    const best = opts.sort((a, b) => b.s - a.s)[0];
    if (best.d) p.turns.push([best.d, -1]);
    p.inBoost = !danger && ahead > 20 && rng() < 0.4 * p.skill;
  }

  // Game > Phases: countdown, ride until one survives, round results, final
  function tickCount() {
    if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit('c', lastBeep); }
    if (world.t <= 0) { lastBeep = 0; world.phase = 'play'; emit('c', 0); }
  }
  function tickPlay() {
    const ps = everyone(), alive = ps.filter((p) => p.alive);
    if (alive.length && (ps.length <= 1 || alive.length > 1)) return;
    const w = alive[0];
    if (w) { w.pts += world.outCount + 2; w.wins++; w.place = 1; world.winner = w.id; emit('w', w.id); }
    world.phase = 'round'; world.t = world.mode === 'attract' ? 2.5 : 4;
  }
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') tickCount();
    else if (world.phase === 'play') tickPlay();
    else if (world.t > 0) return;
    else if (world.phase === 'round') {
      if (world.mode === 'attract' || world.round < ROUNDS) { world.round = world.mode === 'attract' ? 1 : world.round + 1; startRound(); }
      else { world.phase = 'final'; world.t = 10; }
    } else if (world.phase === 'final') onEnd();
  }

  sim.startAttract = () => {
    sim.clearPlayers();
    world.mode = 'attract'; world.round = 1;
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], BOT_COLORS[i], true);
    startRound();
  };
  sim.startMatch = ({ humans, bots }) => {
    sim.clearPlayers();
    names.reset(); lastTurnCount.clear();
    sim.events = [];
    world.mode = 'match'; world.round = 1;
    for (const h of humans.slice(0, MAX_RIDERS)) sim.addPlayer(h.id, h.nick, h.color, false);
    const botCount = Math.max(0, Math.min(bots, MAX_RIDERS - world.players.size));
    for (let i = 0; i < botCount; i++) sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, BOT_COLORS[i], true);
    startRound();
  };

  // Multiplayer > roster: leavers drop; a late human replaces a bot (crashed ones first) in a full room and rides from next round
  function joinLate(h) {
    if (world.players.size >= MAX_RIDERS) {
      const bot = everyone().filter((q) => q.bot).sort((a, b) => a.alive - b.alive || a.pts - b.pts)[0];
      if (!bot) return;
      sim.removePlayer(bot.id);
    }
    Object.assign(sim.addPlayer(h.id, h.nick, h.color, false), { alive: false, gid: nextGid++ });
  }
  sim.syncRoster = (humans) => {
    const here = new Set(humans.map((h) => h.id));
    for (const p of everyone()) if (!p.bot && !here.has(p.id)) { sim.removePlayer(p.id); lastTurnCount.delete(p.id); }
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  };

  // Multiplayer > guest input { b: boost held, tn: turns pressed so far, q: last few turns [dir, cell] }
  // turns carry a running count so repeated or dropped packets can't double-turn; the first packet only syncs the count
  sim.applyInput = (id, input) => {
    const p = world.players.get(id);
    const count = Number(input.tn);
    if (!p || p.bot || !Number.isInteger(count)) return;
    p.inBoost = !!input.b;
    const last = lastTurnCount.get(id);
    if (last !== undefined && count <= last) return;
    lastTurnCount.set(id, count);
    if (last === undefined || !p.alive || world.phase !== 'play') { p.ack = Math.max(p.ack, count); return; }
    const log = Array.isArray(input.q) ? input.q.slice(-MAX_TURN_LOG) : [];
    const fresh = log.slice(Math.max(0, log.length - (count - last)));
    fresh.forEach(([dir, cell = -1], i) => p.turns.push([Math.sign(dir) || 1, Number.isInteger(cell) ? cell : -1, count - fresh.length + 1 + i]));
  };

  // Run engine > one fixed step
  sim.step = () => {
    stepNo++;
    const ps = everyone();
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) stepCycle(p, STEP);
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): one row per rider, corner keyframe when a turn was rewound away or once a second, events since the last one
  const flags = (p) => (p.bot ? 1 : 0) | (p.alive ? 2 : 0) | (p.boost ? 4 : 0) | (p.stall > 0 ? 8 : 0);
  sim.snapshot = () => {
    const ps = everyone();
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), rd: world.round, oc: world.outCount, win: world.winner,
      P: ps.map((p) => [p.id, f2(p.x), f2(p.z), p.dir, flags(p), f2(p.energy), p.pts, p.wins, p.place, p.ack]),
    }, ps);
    if (keyframeDirty || stepNo - keyframeAt >= KEYFRAME_STEPS) {
      snap.K = ps.map((p) => [p.id, p.corners]);
      keyframeDirty = false; keyframeAt = stepNo;
    }
    if (sim.events.length) snap.ev = sim.events;
    sim.events = [];
    return snap;
  };

  return sim;
}
