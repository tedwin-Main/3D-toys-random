// Runs Turbo Ball match rules (car physics on a floor that curves up into drivable walls, ball, bots, goals, phases) with no rendering, for page attract, guest prediction and the relay server host.

import { createNameSync } from '../common/snapshot-names.ts';
import { tickOrder } from '../common/seat-shuffle.ts';

export const STEP = 1 / 60;
// Field > half length, half width, goal mouth half width / depth / crossbar, corner radius, ball radius
export const L = 30, WD = 18, GOAL_W = 5.5, GOAL_D = 4.5, GOAL_H = 5, CR = 6, BR = 1.5;
// Field > ramp radius where the floor curves up into every wall (Rocket League style), highest drivable point, ceiling
export const RR = 4, WALL_TOP = 13, CEIL = 14;
export const TEAM = ['#3fa7ff', '#ff9f43'];
const BOT_NAMES = ['Striker', 'Keeper', 'Nitro', 'Volley', 'Header', 'Bicycle', 'Panenka', 'Rabona', 'Chip', 'Nutmeg', 'Curler', 'Sweeper', 'Libero', 'Tiki'];
const MATCH_TIME = 180, CAR_R = 1.35, CAR_G = 16, STICK_MIN = 4, BALL_HIT = CAR_R + BR + 0.2, MAX_CARS = 14, ATTRACT_BOTS = 8, ROLE_EVERY = 0.4, KICKOFF_BOOST = 0.33; // Rocket League kickoff: every car 33 of 100 boost
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/**
 * Arena surface near a point inset from it (0 = car wheels, BR = ball centre): the floor, a quarter-circle ramp of radius RR,
 * then vertical walls around the rounded outline; the goal mouths cut the end walls (no ramp) below the crossbar.
 * gap: distance inside the surface (negative = through it); n: unit normal pointing into the arena.
 */
export function arenaSurface(x: number, y: number, z: number, inset: number) {
  let d, gx, gz;
  if (Math.abs(z) < GOAL_W - inset * 0.6 && y + inset * 0.2 < GOAL_H) { d = Math.abs(z) - WD; gx = 0; gz = Math.sign(z) || 1; }
  else {
    const qx = Math.abs(x) - (L - CR), qz = Math.abs(z) - (WD - CR), sx = Math.sign(x) || 1, sz = Math.sign(z) || 1;
    if (qx > 0 && qz > 0) { const l = Math.hypot(qx, qz); d = l - CR; gx = (sx * qx) / l; gz = (sz * qz) / l; }
    else if (qx > qz) { d = qx - CR; gx = sx; gz = 0; }
    else { d = qz - CR; gx = 0; gz = sz; }
  }
  // core: floor raised by RR, outline pulled in by RR; the surface sits RR - inset out from it
  const a = Math.max(0, d + RR), b = Math.max(0, RR - y), dist = Math.hypot(a, b), r = RR - inset;
  if (dist > 1e-6) return { gap: r - dist, nx: (-gx * a) / dist, ny: b / dist, nz: (-gz * a) / dist };
  const wall = -(d + RR), floor = y - RR;
  return wall < floor ? { gap: r + wall, nx: -gx, ny: 0, nz: -gz } : { gap: r + floor, nx: 0, ny: 1, nz: 0 };
}

/** onEnd(): full-time timer ran out in a match (host goes back to the lobby) */
export function createTurboSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'count', t: 3, clock: MATCH_TIME, score: [0, 0], over: false, players: new Map(), ball: { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, last: null }, lastGoal: null };
  const names = createNameSync();
  let lastBeep = 0, roleT = 0, tieTeam = 0;
  const emit = (e) => sim.events.push(e);

  // Game > World
  const addPlayer = (id, nick, color, bot, team) => {
    const p = { id, nick, color, bot, team, x: 0, y: 0, z: 0, h: 0, vx: 0, vy: 0, vz: 0, fx: 0, fy: 0, fz: 1, ux: 0, uy: 1, uz: 0, air: false, steer: 0, boost: 1, boosting: false, goals: 0, inGas: 0, inSteer: 0, inBoost: 0, skill: 0.75 + rng() * 0.2, role: 0 };
    world.players.set(id, p);
    return p;
  };
  const removePlayer = (id) => world.players.delete(id);
  const clearPlayers = () => world.players.clear();
  const teamSizes = () => [0, 1].map((t) => [...world.players.values()].filter((q) => q.team === t).length);
  // even sides: coin-flipped team (tieTeam), so the first joiner isn't always Blue
  const smallerTeam = () => { const n = teamSizes(); return n[0] === n[1] ? tieTeam : n[0] < n[1] ? 0 : 1; };

  function kickoff() {
    Object.assign(world.ball, { x: 0, y: BR + 3, z: 0, vx: 0, vy: 0, vz: 0, last: null });
    for (const t of [0, 1]) {
      const team = [...world.players.values()].filter((p) => p.team === t), s = t === 0 ? -1 : 1;
      // fan out across own half facing the ball
      team.forEach((p, k) => {
        const row = Math.floor(k / 3), col = k % 3, z = (col - 1) * 9 + (row % 2 ? 4 : 0);
        // every kickoff resets boost to a third, so a full tank never carries over
        Object.assign(p, { x: s * (12 + row * 8), y: 0, z, vx: 0, vy: 0, vz: 0, steer: 0, boost: KICKOFF_BOOST });
        onFloor(p, s < 0 ? Math.PI / 2 : -Math.PI / 2);
      });
    }
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3;
  }

  // a car parked flat on the floor facing heading h
  function onFloor(p, h) { Object.assign(p, { y: 0, vy: 0, h, fx: Math.sin(h), fy: 0, fz: Math.cos(h), ux: 0, uy: 1, uz: 0, air: false }); }

  // goal pocket past the end line: side nets and back net are flat walls, the net roof caps the ball
  function pocket(o, r) {
    if (Math.abs(o.x) < L - r || Math.abs(o.z) > GOAL_W || o.y > GOAL_H) return 0;
    const s = Math.sign(o.x), back = L + GOAL_D - r;
    let hit = 0;
    if (Math.abs(o.x) > back) { o.x = s * back; if (o.vx * s > 0) { o.vx *= -0.6; hit = 1; } }
    if (Math.abs(o.x) > L && Math.abs(o.z) > GOAL_W - r) { const sz = Math.sign(o.z); o.z = sz * (GOAL_W - r); if (o.vz * sz > 0) { o.vz *= -0.6; hit = 1; } }
    if (Math.abs(o.x) > L && o.y > GOAL_H - r) { o.y = GOAL_H - r; o.vy = -Math.abs(o.vy) * 0.5; }
    return hit;
  }

  // forward pressed into the surface plane; falls back to the velocity, then any direction on it
  function alongSurface(p, n) {
    for (const [x, y, z] of [[p.fx, p.fy, p.fz], [p.vx, p.vy, p.vz], [n.ny, -n.nx, 0], [0, -n.nz, n.ny]]) {
      const k = x * n.nx + y * n.ny + z * n.nz, tx = x - k * n.nx, ty = y - k * n.ny, tz = z - k * n.nz, l = Math.hypot(tx, ty, tz);
      if (l > 0.2) { p.fx = tx / l; p.fy = ty / l; p.fz = tz / l; return; }
    }
  }

  // sit the car on the surface: velocity and nose follow the curve with speed kept; too slow on a steep wall drops off
  function hug(p, n) {
    p.x -= n.nx * n.gap; p.y -= n.ny * n.gap; p.z -= n.nz * n.gap;
    const sp = Math.hypot(p.vx, p.vy, p.vz), vn = p.vx * n.nx + p.vy * n.ny + p.vz * n.nz;
    p.vx -= vn * n.nx; p.vy -= vn * n.ny; p.vz -= vn * n.nz;
    const tl = Math.hypot(p.vx, p.vy, p.vz);
    if (tl > 1e-4 && vn <= 0) { p.vx *= sp / tl; p.vy *= sp / tl; p.vz *= sp / tl; }
    alongSurface(p, n);
    Object.assign(p, { ux: n.nx, uy: n.ny, uz: n.nz, air: false });
    if (p.y > WALL_TOP) { p.y = WALL_TOP; p.vy = Math.min(p.vy, 0); }
    if (n.ny < 0.35 && Math.hypot(p.vx, p.vy, p.vz) < STICK_MIN) { p.air = true; p.vx += n.nx * 2; p.vy += n.ny * 2; p.vz += n.nz * 2; }
  }

  // Run engine > car physics on the arena surface: forward/lateral split, boost, gravity along the surface (none on the flat floor),
  // ramps into walls and corners; airborne cars fly ballistic, boost still pushes the nose, and land on whatever surface they meet
  const stepCar = (p, dt) => {
    const live = world.phase === 'play' || world.phase === 'goal' || world.mode === 'attract' && world.phase !== 'count';
    const gas = live ? p.inGas : 0;
    p.boosting = live && p.inBoost && p.boost > 0.01 && gas >= 0;
    if (p.boosting) p.boost = Math.max(0, p.boost - 0.38 * dt);
    else p.boost = Math.min(1, p.boost + 0.06 * dt);
    p.steer += (clamp(p.inSteer, -1, 1) * (live ? 1 : 0) - p.steer) * (1 - Math.exp(-dt * 12));
    if (p.air) flyCar(p, dt);
    else driveCar(p, dt, gas);
    p.h = Math.atan2(p.fx, p.fz);
  };
  function driveCar(p, dt, gas) {
    const n = arenaSurface(p.x, p.y, p.z, 0);
    alongSurface(p, n);
    const { fx, fy, fz } = p;
    // gravity minus its push into the surface
    const gn = -CAR_G * n.ny;
    const vx = p.vx - gn * n.nx * dt, vy = p.vy - (CAR_G + gn * n.ny) * dt, vz = p.vz - gn * n.nz * dt;
    // side axis = up x forward
    const lx = n.ny * fz - n.nz * fy, ly = n.nz * fx - n.nx * fz, lz = n.nx * fy - n.ny * fx;
    let vf = vx * fx + vy * fy + vz * fz, vl = vx * lx + vy * ly + vz * lz;
    const top = p.boosting ? 30 : 21;
    if (p.boosting) vf += 30 * dt;
    if (gas > 0) vf += 24 * gas * dt * (1 - Math.max(vf, 0) / top);
    else if (gas < 0) vf -= (vf > 0 ? 36 : 14) * -gas * dt;
    else vf *= 1 - 1.4 * dt;
    vf = clamp(vf, -11, top + 2);
    // steer: turn the nose about the surface normal
    const turn = p.steer * 2.7 * clamp(vf / 7, -1, 1) * dt, c = Math.cos(turn), s = Math.sin(turn);
    p.fx = fx * c + lx * s; p.fy = fy * c + ly * s; p.fz = fz * c + lz * s;
    const mx = lx * c - fx * s, my = ly * c - fy * s, mz = lz * c - fz * s;
    vl *= Math.exp(-7 * dt);
    p.vx = p.fx * vf + mx * vl; p.vy = p.fy * vf + my * vl; p.vz = p.fz * vf + mz * vl;
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    pocket(p, CAR_R);
    const next = arenaSurface(p.x, p.y, p.z, 0);
    // surface fell away (off a ramp into the goal mouth): airborne
    if (next.gap > 0.35) p.air = true;
    else hug(p, next);
  }
  function flyCar(p, dt) {
    p.vy -= CAR_G * dt;
    if (p.boosting) { p.vx += p.fx * 30 * dt; p.vy += p.fy * 30 * dt; p.vz += p.fz * 30 * dt; }
    const sp = Math.hypot(p.vx, p.vy, p.vz);
    if (sp > 32) { p.vx *= 32 / sp; p.vy *= 32 / sp; p.vz *= 32 / sp; }
    p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt;
    if (p.y > CEIL - 1) { p.y = CEIL - 1; p.vy = -Math.abs(p.vy) * 0.3; }
    pocket(p, CAR_R);
    const n = arenaSurface(p.x, p.y, p.z, 0);
    if (n.gap <= 0) hug(p, n);
  }
  function carBumps(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dy = b.y - a.y, dz = b.z - a.z, d = Math.hypot(dx, dy, dz);
      if (d > CAR_R * 2 || d < 1e-4) continue;
      const nx = dx / d, ny = dy / d, nz = dz / d, pen = (CAR_R * 2 - d) / 2;
      a.x -= nx * pen; a.y -= ny * pen; a.z -= nz * pen; b.x += nx * pen; b.y += ny * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny + (b.vz - a.vz) * nz;
      if (vr < 0) {
        a.vx += nx * vr * 0.85; a.vy += ny * vr * 0.85; a.vz += nz * vr * 0.85; b.vx -= nx * vr * 0.85; b.vy -= ny * vr * 0.85; b.vz -= nz * vr * 0.85;
        if (vr < -8) emit(['u']);
      }
    }
  }

  // Run engine > ball: gravity, bounce, rolling drag, car hits with loft, goals
  function stepBall(dt, ps) {
    const b = world.ball;
    b.vy -= 24 * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (b.y > CEIL) { b.y = CEIL; b.vy = -Math.abs(b.vy) * 0.5; }
    let hit = pocket(b, BR);
    // floor, ramps and walls: bounce what drives into them, roll along the rest
    const n = arenaSurface(b.x, b.y, b.z, BR);
    if (n.gap < 0) {
      b.x -= n.nx * n.gap; b.y -= n.ny * n.gap; b.z -= n.nz * n.gap;
      const vn = b.vx * n.nx + b.vy * n.ny + b.vz * n.nz;
      if (vn < 0) {
        const k = vn < -2 ? (n.ny > 0.7 ? 1.55 : 1.65) : 1;
        b.vx -= k * vn * n.nx; b.vy -= k * vn * n.ny; b.vz -= k * vn * n.nz;
        if (n.ny < 0.7 && vn < -6) hit = 1;
      }
    }
    const ground = n.gap < 0.05 && n.ny > 0.7, k = Math.exp(-(ground ? 0.45 : 0.08) * dt);
    b.vx *= k; b.vz *= k;
    if (hit && Math.hypot(b.vx, b.vz) > 6) emit(['k', 0.4]);
    for (const p of ps) ballHit(b, p);
    const sp = Math.hypot(b.vx, b.vz);
    if (sp > 45) { b.vx *= 45 / sp; b.vz *= 45 / sp; }
    if (world.phase === 'play' && Math.abs(b.x) > L + BR * 0.6 && Math.abs(b.z) < GOAL_W) scoreGoal(b);
  }
  // car body: a sphere above the wheels along the car's up, so wall riders hit the ball off the wall
  function ballHit(b, p) {
    const cx = p.x + p.ux * 0.7, cy = p.y + p.uy * 0.7, cz = p.z + p.uz * 0.7;
    const dx = b.x - cx, dy = b.y - cy, dz = b.z - cz, d = Math.hypot(dx, dy, dz);
    if (d > BALL_HIT || d < 1e-4) return;
    const nx = dx / d, ny = dy / d, nz = dz / d;
    b.x = cx + nx * BALL_HIT; b.y = cy + ny * BALL_HIT; b.z = cz + nz * BALL_HIT;
    const vr = (b.vx - p.vx) * nx + (b.vy - p.vy) * ny + (b.vz - p.vz) * nz;
    if (vr >= 0) return;
    const hit = -vr, push = hit * 1.4 + 2.5, loft = Math.min(hit * 0.35, 9);
    b.vx += nx * push + p.ux * loft; b.vy += ny * push + p.uy * loft; b.vz += nz * push + p.uz * loft;
    p.vx += nx * vr * 0.2; p.vy += ny * vr * 0.2; p.vz += nz * vr * 0.2;
    b.last = p.id;
    if (hit > 3) emit(['k', Math.min(hit / 20, 1)]);
  }
  // ball in the right-hand goal (+x) scores for Blue, left-hand for Orange
  function scoreGoal(b) {
    const team = b.x > 0 ? 0 : 1;
    world.score[team]++;
    const scorer = world.players.get(b.last);
    if (scorer && scorer.team === team) scorer.goals++;
    world.lastGoal = { team, by: scorer && scorer.team === team ? scorer.id : null, own: !!scorer && scorer.team !== team };
    emit(['g', team, b.last ?? 0, world.lastGoal.own ? 1 : 0, +b.x.toFixed(1), +b.z.toFixed(1)]);
    world.phase = 'goal'; world.t = 3;
  }

  // Run engine > bots: striker gets behind the ball toward the enemy goal, support trails, keeper guards
  function assignRoles() {
    const b = world.ball;
    for (const t of [0, 1]) {
      const team = [...world.players.values()].filter((p) => p.team === t && p.bot);
      const all = [...world.players.values()].filter((p) => p.team === t);
      const own = t === 0 ? -L : L;
      // nearest-to-ball bot attacks, deepest bot keeps goal when the team has 3+
      const byBall = team.slice().sort((p, q) => Math.hypot(p.x - b.x, p.z - b.z) - Math.hypot(q.x - b.x, q.z - b.z));
      byBall.forEach((p, i) => (p.role = i === 0 ? 0 : 1));
      if (all.length >= 3 && team.length >= 2) { const keeper = team.slice().sort((p, q) => Math.abs(p.x - own) - Math.abs(q.x - own))[0]; if (keeper.role !== 0) keeper.role = 2; }
    }
  }
  function botThink(p) {
    const b = world.ball, s = p.team === 0 ? 1 : -1, oppX = s * (L + 2), ownX = -s * L;
    let tx, tz, boost = 0, gasMax = 1;
    const lead = 0.25;
    const bx = b.x + b.vx * lead, bz = b.z + b.vz * lead;
    if (p.role === 0) {
      const gx = oppX - bx, gz = 0 - bz, gl = Math.hypot(gx, gz) || 1;
      const behindX = bx - (gx / gl) * 3.2, behindZ = bz - (gz / gl) * 3.2;
      const toBallX = bx - p.x, toBallZ = bz - p.z, tbl = Math.hypot(toBallX, toBallZ) || 1;
      const aligned = (toBallX * gx + toBallZ * gz) / (tbl * gl);
      if (aligned > 0.55) { tx = bx; tz = bz; boost = tbl > 8 && aligned > 0.85 ? 1 : 0; }
      else {
        // swing around the ball instead of knocking it backward
        const side = Math.sign((p.z - bz) || 1);
        tx = behindX; tz = behindZ + (Math.abs(p.x - behindX) < 4 ? 0 : side * 3);
        boost = Math.hypot(tx - p.x, tz - p.z) > 18 ? 1 : 0;
      }
    } else if (p.role === 2) {
      tx = ownX + s * 3; tz = clamp(bz * 0.5, -GOAL_W + 1, GOAL_W - 1);
      if (Math.hypot(bx - ownX, bz) < 14) { tx = bx - s * 2.5; tz = bz; boost = 1; }
      if (Math.hypot(tx - p.x, tz - p.z) < 2) gasMax = 0;
    } else {
      tx = clamp(bx - s * 10, -L + 4, L - 4); tz = clamp(-bz * 0.6 + (p.id % 2 ? 6 : -6), -WD + 3, WD - 3);
      if (Math.hypot(tx - p.x, tz - p.z) < 3) gasMax = 0.2;
    }
    // aim in the surface plane (side axis = up x forward); on a steep wall lean downhill to come back to the floor
    const ax = tx - p.x, ay = p.uy < 0.7 ? -10 : 0, az = tz - p.z;
    const lx = p.uy * p.fz - p.uz * p.fy, ly = p.uz * p.fx - p.ux * p.fz, lz = p.ux * p.fy - p.uy * p.fx;
    const d = Math.atan2(ax * lx + ay * ly + az * lz, ax * p.fx + ay * p.fy + az * p.fz);
    p.inSteer = clamp(d * 2.4, -1, 1);
    p.inGas = Math.abs(d) > 2.2 ? -0.6 : gasMax * (Math.abs(d) > 1.2 ? 0.5 : 1);
    p.inBoost = boost && Math.abs(d) < 0.35 && rng() < p.skill ? 1 : 0;
  }

  // Game > Phases: kickoff countdown, play, goal celebration, full time
  function phases(dt) {
    world.t -= dt;
    if (world.phase === 'count') {
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'play'; emit(['c', 0]); }
    } else if (world.phase === 'play') {
      if (world.mode === 'match') world.clock -= dt;
      if (world.clock <= 0 && world.mode === 'match') {
        // tied at full time: next goal wins
        if (world.score[0] === world.score[1]) { world.clock = 0; world.over = true; }
        else fullTime();
      }
    } else if (world.phase === 'goal' && world.t <= 0) {
      if (world.over || (world.mode === 'match' && world.clock <= 0)) fullTime();
      else kickoff();
    } else if (world.phase === 'final' && world.t <= 0) { world.phase = 'done'; onEnd(); }
  }
  function fullTime() { world.phase = 'final'; world.t = 10; emit(['f']); }
  function resetMatch(mode) {
    sim.clearPlayers();
    tieTeam = rng() < 0.5 ? 0 : 1;
    Object.assign(world, { mode, score: [0, 0], clock: MATCH_TIME, over: false });
  }

  // Game > attract: 4v4 bots
  const startAttract = () => {
    resetMatch('attract');
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], TEAM[i % 2], true, i % 2);
    kickoff();
  };
  // Game > match: humans alternate teams, bots fill the smaller side (relay host)
  const startMatch = ({ humans, bots }) => {
    resetMatch('match');
    for (const h of humans.slice(0, MAX_CARS)) sim.addPlayer(h.id, h.nick, h.color, false, smallerTeam());
    for (let i = 0; i < Math.min(bots, MAX_CARS - world.players.size); i++) { const t = smallerTeam(); sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, TEAM[t], true, t); }
    kickoff();
  };
  // Multiplayer > roster: a leaver's car is taken over by a bot (teams stay even); a joining human takes a bot's place on the smaller team (keeps 14 seats)
  const syncRoster = (humans) => {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) replaceWithBot(p);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  };
  function replaceWithBot(p) {
    sim.removePlayer(p.id);
    let id = -1;
    while (world.players.has(id)) id--;
    const name = BOT_NAMES[(-id - 1) % BOT_NAMES.length];
    const bot = sim.addPlayer(id, `${name} 🤖`, TEAM[p.team], true, p.team);
    const { x, y, z, h, vx, vy, vz, fx, fy, fz, ux, uy, uz, air, boost } = p;
    Object.assign(bot, { x, y, z, h, vx, vy, vz, fx, fy, fz, ux, uy, uz, air, boost });
  }
  function joinLate(h) {
    const t = smallerTeam();
    if (world.players.size >= MAX_CARS) { const bot = [...world.players.values()].find((q) => q.bot && q.team === t); if (!bot) return; sim.removePlayer(bot.id); }
    const car = sim.addPlayer(h.id, h.nick, h.color, false, t);
    Object.assign(car, { x: (t === 0 ? -1 : 1) * (L - 6), z: 0 });
    onFloor(car, t === 0 ? Math.PI / 2 : -Math.PI / 2);
  }
  const applyInput = (id, inp) => {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { inGas: clamp(+inp.g2 || 0, -1, 1), inSteer: clamp(+inp.s || 0, -1, 1), inBoost: inp.b ? 1 : 0 });
  };

  // Run engine > one step: bot roles every 0.4 s, two physics substeps, phase clock
  const step = (dt = STEP) => {
    const ps = tickOrder(world.players.values(), rng); // fresh order each tick: a kickoff touch on the same substep never favors the earlier joiner
    roleT -= dt;
    if (roleT <= 0) { roleT = ROLE_EVERY; assignRoles(); }
    for (const p of ps) if (p.bot) botThink(p);
    for (let k = 0; k < 2; k++) {
      for (const p of ps) sim.stepCar(p, dt / 2);
      carBumps(ps);
      if (world.phase !== 'count') stepBall(dt / 2, ps);
    }
    phases(dt);
  };

  // Multiplayer > snapshot (JSON): ball, one row per car (position, nose, velocity; flags bot 1, boosting 2, airborne 4), events since the last one
  const snapshot = () => {
    const b = world.ball;
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), ck: f2(world.clock), sc: world.score, ov: world.over ? 1 : 0, ev: sim.events,
      B: [f2(b.x), f2(b.y), f2(b.z), f2(b.vx), f2(b.vy), f2(b.vz)],
      P: [...world.players.values()].map((p) => [p.id, f2(p.x), f2(p.y), f2(p.z), f2(p.fx), f2(p.fy), f2(p.fz), f2(p.vx), f2(p.vy), f2(p.vz), f2(p.steer), (p.bot ? 1 : 0) | (p.boosting ? 2 : 0) | (p.air ? 4 : 0), p.team, f2(p.boost), p.goals]),
    }, world.players.values());
    sim.events = [];
    return snap;
  };

  const sim = { world, events: [], addPlayer, removePlayer, clearPlayers, stepCar, startAttract, startMatch, syncRoster, applyInput, step, snapshot };
  return sim;
}
