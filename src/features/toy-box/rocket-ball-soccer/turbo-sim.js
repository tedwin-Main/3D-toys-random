// Runs Turbo Ball match rules (car physics, ball, bots, goals, phases) with no rendering, for page attract, guest prediction and the relay server host.

import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
// Field > half length, half width, goal mouth half width / depth / crossbar, corner radius, ball radius
export const L = 30, WD = 18, GOAL_W = 5.5, GOAL_D = 4.5, GOAL_H = 5, CR = 6, BR = 1.5;
export const TEAM = ['#3fa7ff', '#ff9f43'];
const BOT_NAMES = ['Striker', 'Keeper', 'Nitro', 'Volley', 'Header', 'Bicycle', 'Panenka', 'Rabona', 'Chip', 'Nutmeg', 'Curler', 'Sweeper', 'Libero', 'Tiki'];
const MATCH_TIME = 180, CAR_R = 1.35, MAX_CARS = 14, ATTRACT_BOTS = 8, ROLE_EVERY = 0.4;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): full-time timer ran out in a match (host goes back to the lobby) */
export function createTurboSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'count', t: 3, clock: MATCH_TIME, score: [0, 0], over: false, players: new Map(), ball: { x: 0, y: BR, z: 0, vx: 0, vy: 0, vz: 0, last: null }, lastGoal: null };
  const names = createNameSync();
  let lastBeep = 0, roleT = 0;
  const sim = { world, events: [] };
  const emit = (e) => sim.events.push(e);

  // Game > World
  sim.addPlayer = (id, nick, color, bot, team) => {
    const p = { id, nick, color, bot, team, x: 0, z: 0, h: 0, vx: 0, vz: 0, steer: 0, boost: 1, boosting: false, goals: 0, inGas: 0, inSteer: 0, inBoost: 0, skill: 0.75 + rng() * 0.2, role: 0 };
    world.players.set(id, p);
    return p;
  };
  sim.removePlayer = (id) => world.players.delete(id);
  sim.clearPlayers = () => world.players.clear();
  const teamSizes = () => [0, 1].map((t) => [...world.players.values()].filter((q) => q.team === t).length);
  const smallerTeam = () => { const n = teamSizes(); return n[0] <= n[1] ? 0 : 1; };

  function kickoff() {
    Object.assign(world.ball, { x: 0, y: BR + 3, z: 0, vx: 0, vy: 0, vz: 0, last: null });
    for (const t of [0, 1]) {
      const team = [...world.players.values()].filter((p) => p.team === t), s = t === 0 ? -1 : 1;
      // fan out across own half facing the ball
      team.forEach((p, k) => {
        const row = Math.floor(k / 3), col = k % 3, z = (col - 1) * 9 + (row % 2 ? 4 : 0);
        Object.assign(p, { x: s * (12 + row * 8), z, h: s < 0 ? Math.PI / 2 : -Math.PI / 2, vx: 0, vz: 0, steer: 0, boost: Math.max(p.boost, 0.35) });
      });
    }
    world.phase = 'count'; world.t = world.mode === 'attract' ? 1.5 : 3;
  }

  // Run engine > car physics: forward/lateral split, boost, walls + rounded corners + goal mouths
  function clampArena(o, r, allowGoal) {
    // goal pocket: inside the mouth the car or ball may go past the end line
    if (allowGoal && Math.abs(o.z) < GOAL_W - r * 0.6 && Math.abs(o.x) > L - r) {
      const s = Math.sign(o.x), back = L + GOAL_D - r;
      let hit = 0;
      if (Math.abs(o.x) > back) { o.x = s * back; if (o.vx * s > 0) { o.vx *= -0.6; hit = 1; } }
      if (Math.abs(o.z) > GOAL_W - r) { o.z = Math.sign(o.z) * (GOAL_W - r); o.vz *= -0.6; hit = 1; }
      return hit;
    }
    let hit = 0;
    const xl = L - r, zl = WD - r;
    if (Math.abs(o.x) > xl) { o.x = Math.sign(o.x) * xl; if (o.vx * Math.sign(o.x) > 0) { o.vx *= -0.65; hit = 1; } }
    if (Math.abs(o.z) > zl) { o.z = Math.sign(o.z) * zl; if (o.vz * Math.sign(o.z) > 0) { o.vz *= -0.65; hit = 1; } }
    const cx = Math.sign(o.x) * (L - CR), cz = Math.sign(o.z) * (WD - CR);
    if (Math.abs(o.x) > L - CR && Math.abs(o.z) > WD - CR) {
      const dx = o.x - cx, dz = o.z - cz, d = Math.hypot(dx, dz), lim = CR - r;
      if (d > lim) { const nx = dx / d, nz = dz / d; o.x = cx + nx * lim; o.z = cz + nz * lim; const vn = o.vx * nx + o.vz * nz; if (vn > 0) { o.vx -= 1.65 * vn * nx; o.vz -= 1.65 * vn * nz; hit = 1; } }
    }
    return hit;
  }
  sim.stepCar = (p, dt) => {
    const live = world.phase === 'play' || world.phase === 'goal' || world.mode === 'attract' && world.phase !== 'count';
    const fx = Math.sin(p.h), fz = Math.cos(p.h);
    let vf = p.vx * fx + p.vz * fz, vl = p.vx * fz - p.vz * fx;
    const gas = live ? p.inGas : 0;
    p.boosting = live && p.inBoost && p.boost > 0.01 && gas >= 0;
    const top = p.boosting ? 30 : 21;
    if (p.boosting) { vf += 30 * dt; p.boost = Math.max(0, p.boost - 0.38 * dt); }
    else p.boost = Math.min(1, p.boost + 0.06 * dt);
    if (gas > 0) vf += 24 * gas * dt * (1 - Math.max(vf, 0) / top);
    else if (gas < 0) vf -= (vf > 0 ? 36 : 14) * -gas * dt;
    else vf *= 1 - 1.4 * dt;
    vf = clamp(vf, -11, top + 2);
    p.steer += (clamp(p.inSteer, -1, 1) * (live ? 1 : 0) - p.steer) * (1 - Math.exp(-dt * 12));
    p.h += p.steer * 2.7 * clamp(vf / 7, -1, 1) * dt;
    vl *= Math.exp(-7 * dt);
    const nfx = Math.sin(p.h), nfz = Math.cos(p.h);
    p.vx = nfx * vf + nfz * vl; p.vz = nfz * vf - nfx * vl;
    p.x += p.vx * dt; p.z += p.vz * dt;
    clampArena(p, CAR_R, true);
  };
  function carBumps(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > CAR_R * 2 || d < 1e-4) continue;
      const nx = dx / d, nz = dz / d, pen = (CAR_R * 2 - d) / 2;
      a.x -= nx * pen; a.z -= nz * pen; b.x += nx * pen; b.z += nz * pen;
      const vr = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vr < 0) { a.vx += nx * vr * 0.85; a.vz += nz * vr * 0.85; b.vx -= nx * vr * 0.85; b.vz -= nz * vr * 0.85; if (vr < -8) emit(['u']); }
    }
  }

  // Run engine > ball: gravity, bounce, rolling drag, car hits with loft, goals
  function stepBall(dt, ps) {
    const b = world.ball;
    b.vy -= 24 * dt;
    b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
    if (b.y < BR) { b.y = BR; if (b.vy < -2) { b.vy *= -0.55; } else b.vy = 0; }
    if (b.y > 14) { b.y = 14; b.vy = -Math.abs(b.vy) * 0.5; }
    const ground = b.y < BR + 0.05, k = Math.exp(-(ground ? 0.45 : 0.08) * dt);
    b.vx *= k; b.vz *= k;
    // crossbar height: above it the goal mouth is a wall
    const inMouth = b.y < GOAL_H - 0.3;
    if (clampArena(b, BR, inMouth) && Math.hypot(b.vx, b.vz) > 6) emit(['k', 0.4]);
    if (!inMouth && Math.abs(b.x) > L - BR && Math.abs(b.z) < GOAL_W) { b.x = Math.sign(b.x) * (L - BR); b.vx = -b.vx * 0.6; }
    for (const p of ps) ballHit(b, p);
    const sp = Math.hypot(b.vx, b.vz);
    if (sp > 45) { b.vx *= 45 / sp; b.vz *= 45 / sp; }
    if (world.phase === 'play' && Math.abs(b.x) > L + BR * 0.6 && Math.abs(b.z) < GOAL_W) scoreGoal(b);
  }
  function ballHit(b, p) {
    const dx = b.x - p.x, dz = b.z - p.z, d = Math.hypot(dx, dz);
    if (d > CAR_R + BR || d < 1e-4 || b.y > 3.4) return;
    const nx = dx / d, nz = dz / d;
    b.x = p.x + nx * (CAR_R + BR); b.z = p.z + nz * (CAR_R + BR);
    const vr = (b.vx - p.vx) * nx + (b.vz - p.vz) * nz;
    if (vr >= 0) return;
    const hit = -vr;
    b.vx += nx * (hit * 1.4 + 2.5); b.vz += nz * (hit * 1.4 + 2.5);
    b.vy += Math.min(hit * 0.35, 9);
    p.vx += nx * vr * 0.2; p.vz += nz * vr * 0.2;
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
    let d = Math.atan2(tx - p.x, tz - p.z) - p.h; d = Math.atan2(Math.sin(d), Math.cos(d));
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
    Object.assign(world, { mode, score: [0, 0], clock: MATCH_TIME, over: false });
  }

  // Game > attract: 4v4 bots
  sim.startAttract = () => {
    resetMatch('attract');
    for (let i = 0; i < ATTRACT_BOTS; i++) sim.addPlayer(-1 - i, BOT_NAMES[i], TEAM[i % 2], true, i % 2);
    kickoff();
  };
  // Game > match: humans alternate teams, bots fill the smaller side (relay host)
  sim.startMatch = ({ humans, bots }) => {
    resetMatch('match');
    for (const h of humans.slice(0, MAX_CARS)) sim.addPlayer(h.id, h.nick, h.color, false, smallerTeam());
    for (let i = 0; i < Math.min(bots, MAX_CARS - world.players.size); i++) { const t = smallerTeam(); sim.addPlayer(-1 - i, `${BOT_NAMES[i]} 🤖`, TEAM[t], true, t); }
    kickoff();
  };
  // Multiplayer > roster: leavers drop; a joining human takes a bot's place on the smaller team (keeps 14 seats)
  sim.syncRoster = (humans) => {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) sim.removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  };
  function joinLate(h) {
    const t = smallerTeam();
    if (world.players.size >= MAX_CARS) { const bot = [...world.players.values()].find((q) => q.bot && q.team === t); if (!bot) return; sim.removePlayer(bot.id); }
    const car = sim.addPlayer(h.id, h.nick, h.color, false, t);
    Object.assign(car, { x: (t === 0 ? -1 : 1) * (L - 6), z: 0, h: t === 0 ? Math.PI / 2 : -Math.PI / 2 });
  }
  sim.applyInput = (id, inp) => {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    Object.assign(p, { inGas: clamp(+inp.g2 || 0, -1, 1), inSteer: clamp(+inp.s || 0, -1, 1), inBoost: inp.b ? 1 : 0 });
  };

  // Run engine > one step: bot roles every 0.4 s, two physics substeps, phase clock
  sim.step = (dt = STEP) => {
    const ps = [...world.players.values()];
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

  // Multiplayer > snapshot (JSON): ball, one row per car, events since the last one
  sim.snapshot = () => {
    const b = world.ball;
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), ck: f2(world.clock), sc: world.score, ov: world.over ? 1 : 0, ev: sim.events,
      B: [f2(b.x), f2(b.y), f2(b.z), f2(b.vx), f2(b.vy), f2(b.vz)],
      P: [...world.players.values()].map((p) => [p.id, f2(p.x), f2(p.z), f2(p.h), f2(p.vx), f2(p.vz), f2(p.steer), (p.bot ? 1 : 0) | (p.boosting ? 2 : 0), p.team, f2(p.boost), p.goals]),
    }, world.players.values());
    sim.events = [];
    return snap;
  };

  return sim;
}
