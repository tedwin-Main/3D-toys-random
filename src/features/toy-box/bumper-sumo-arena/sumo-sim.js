// Runs Bumper Sumo rules (car physics, bumps, shrinking ring, bots, rounds) with no rendering, for page attract, guest prediction and the relay server host.

import { axis, applyPresses } from '../common/guest-input.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const R0 = 13;
const R_MIN = 5.2, CAR_R = 1.1;
export const WINS_TO_TAKE_MATCH = 3;
const MAX_CARS = 14, ATTRACT_BOTS = 4;
const BOT_NAMES = ['Bonk', 'Wobbles', 'Turbo', 'Pip', 'Mochi', 'Zippy', 'Rumble', 'Noodle', 'Biscuit', 'Ziggy', 'Pogo', 'Waffles', 'Bumpy', 'Squeak'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const f2 = (v) => Math.round(v * 100) / 100;
const lerp = (a, b, k) => a + (b - a) * k;
const smoothstep = (x, lo, hi) => { const k = Math.max(0, Math.min(1, (x - lo) / (hi - lo))); return k * k * (3 - 2 * k); };
const rng = Math.random;

/** onEnd(): match-end banner ran out (host goes back to the lobby) */
export function createSumoSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'fight', t: 0, ring: R0, round: 0, winner: null, players: new Map() };
  const names = createNameSync();
  const sim = { world, events: [] };
  const emit = (e) => sim.events.push(e);
  let lastBeep = 0;

  // Game > World
  sim.addPlayer = (id, nick, color, bot) => {
    const p = { id, nick, color, bot, x: 0, z: 0, vx: 0, vz: 0, ang: 0, y: 0, vy: 0, alive: false, falling: false, dashCD: 0, dashT: 0, wins: 0, inX: 0, inZ: 0, dashSeq: 0, lastDash: 0, respawn: 0, aiT: 0, aiX: 0, aiZ: 0, skill: 0.55 + rng() * 0.4 };
    world.players.set(id, p);
    return p;
  };
  sim.removePlayer = (id) => world.players.delete(id);
  sim.clearPlayers = () => world.players.clear();
  const addBots = (n) => { for (let i = 0; i < n; i++) sim.addPlayer(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };

  function spawnAll() {
    // shuffled slots each round: join order never fixes who starts beside whom
    const ps = shuffleInPlace([...world.players.values()], rng);
    ps.forEach((p, i) => {
      const a = (i / ps.length) * Math.PI * 2;
      // 14 cars need a wider circle so nobody spawns touching
      const sr = Math.min(R0 - 2, Math.max(7, ps.length * 0.75));
      Object.assign(p, { x: Math.cos(a) * sr, z: Math.sin(a) * sr, vx: 0, vz: 0, y: 0, vy: 0, alive: true, falling: false, dashCD: 0, dashT: 0, ang: Math.atan2(-Math.cos(a), -Math.sin(a)) });
    });
  }

  // Run engine > one car's drive + dash + drag + speed cap; shared by the sim and guest prediction; true when a dash fired
  sim.moveCar = (p, dt, canMove) => {
    let dashed = false;
    p.dashCD = Math.max(0, p.dashCD - dt);
    p.dashT = Math.max(0, p.dashT - dt);
    if (canMove) {
      let ix = p.inX, iz = p.inZ;
      const l = Math.hypot(ix, iz);
      if (l > 1) { ix /= l; iz /= l; }
      p.vx += ix * 26 * dt; p.vz += iz * 26 * dt;
      if (p.dashSeq !== p.lastDash) {
        p.lastDash = p.dashSeq;
        if (p.dashCD <= 0) {
          const dl = Math.hypot(ix, iz);
          const dx = dl > 0.1 ? ix / dl : Math.sin(p.ang), dz = dl > 0.1 ? iz / dl : Math.cos(p.ang);
          p.vx += dx * 17; p.vz += dz * 17; p.dashCD = 1.3; p.dashT = 0.3;
          dashed = true;
        }
      }
    }
    const drag = Math.exp(-1.7 * dt);
    p.vx *= drag; p.vz *= drag;
    const sp = Math.hypot(p.vx, p.vz), max = p.dashT > 0 ? 26 : 13;
    if (sp > max) { p.vx *= max / sp; p.vz *= max / sp; }
    p.x += p.vx * dt; p.z += p.vz * dt;
    if (sp > 0.6) { let da = Math.atan2(p.vx, p.vz) - p.ang; da = Math.atan2(Math.sin(da), Math.cos(da)); p.ang += da * Math.min(1, dt * 8); }
    return dashed;
  };

  // Run engine > physics step: drive, dash, bumps, ring edge falls
  function physics(dt) {
    const ps = [...world.players.values()];
    const canMove = world.phase === 'fight';
    for (const p of ps) {
      if (p.falling) { fall(p, dt); continue; }
      if (p.alive && sim.moveCar(p, dt, canMove)) emit(['d', p.id]);
    }
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) bump(ps[i], ps[j]);
    for (const p of ps) {
      if (!p.alive || p.falling) continue;
      if (Math.hypot(p.x, p.z) > world.ring + 0.25) Object.assign(p, { falling: true, alive: false, vy: 2, splashed: false, respawn: 1.6 });
    }
  }
  function fall(p, dt) {
    p.vy -= 28 * dt; p.y += p.vy * dt; p.x += p.vx * dt * 0.6; p.z += p.vz * dt * 0.6;
    if (p.y < -2.6 && !p.splashed) { p.splashed = true; emit(['s', f2(p.x), f2(p.z)]); }
  }
  // impulse along the normal; a dashing car counts heavier so the shove wins
  function bump(a, b) {
    if (!a.alive || !b.alive || a.falling || b.falling) return;
    const dx = a.x - b.x, dz = a.z - b.z, d = Math.hypot(dx, dz);
    if (d >= CAR_R * 2 || d < 1e-4) return;
    const nx = dx / d, nz = dz / d, ov = CAR_R * 2 - d;
    a.x += nx * ov / 2; a.z += nz * ov / 2; b.x -= nx * ov / 2; b.z -= nz * ov / 2;
    const vrel = (a.vx - b.vx) * nx + (a.vz - b.vz) * nz;
    if (vrel >= 0) return;
    const ma = a.dashT > 0 ? 2.4 : 1, mb = b.dashT > 0 ? 2.4 : 1;
    const jimp = (-(1 + 0.95) * vrel / (1 / ma + 1 / mb)) * 1.3;
    a.vx += jimp / ma * nx; a.vz += jimp / ma * nz; b.vx -= jimp / mb * nx; b.vz -= jimp / mb * nz;
    if (-vrel > 2) emit(['b', f2((a.x + b.x) / 2), f2((a.z + b.z) / 2), f2(Math.min(10, -vrel))]);
  }

  // Run engine > bots: chase nearest rival, flee edge, dash when lined up
  function botThink(p, dt) {
    p.aiT -= dt;
    if (p.aiT > 0) return;
    p.aiT = 0.12 + rng() * 0.1;
    let best = null, bd = 1e9;
    for (const q of world.players.values()) {
      if (q === p || !q.alive || q.falling) continue;
      const d = Math.hypot(q.x - p.x, q.z - p.z);
      if (d < bd) { bd = d; best = q; }
    }
    let tx = -p.x, tz = -p.z;
    if (best) { tx = best.x - p.x + best.x * 0.25; tz = best.z - p.z + best.z * 0.25; }
    const r = Math.hypot(p.x, p.z);
    // skill = edge sense: sharp bots start backing off the rim sooner (0.75 = old 4.5)
    const edge = smoothstep(r, world.ring - (1.5 + 4 * p.skill), world.ring - 1);
    const l = Math.hypot(tx, tz) || 1;
    // skill steadies steering and times dashes (0.75 = old fixed bot)
    const wob = 1.6 * (1 - p.skill);
    p.inX = lerp(tx / l, -p.x / (r || 1), edge) + (rng() - 0.5) * wob;
    p.inZ = lerp(tz / l, -p.z / (r || 1), edge) + (rng() - 0.5) * wob;
    if (best && bd < 5 && edge < 0.5 && rng() < 0.47 * p.skill) p.dashSeq++;
  }

  // Game > Phases: countdown, fight with shrinking ring, round + match end
  function phases(dt) {
    const ps = [...world.players.values()];
    if (world.mode === 'attract') return attractPhase(ps, dt);
    if (world.phase === 'count') countPhase(dt);
    else if (world.phase === 'fight') fightPhase(ps, dt);
    else if (world.phase === 'roundEnd') roundEndPhase(ps, dt);
    else if (world.phase === 'matchEnd') { world.t -= dt; if (world.t <= 0) { world.phase = 'done'; onEnd(); } }
  }
  function attractPhase(ps, dt) {
    world.phase = 'fight';
    world.ring = R0;
    for (const p of ps) if (!p.alive && p.falling && (p.respawn -= dt) <= 0) Object.assign(p, { x: (rng() - 0.5) * 6, z: (rng() - 0.5) * 6, vx: 0, vz: 0, y: 0, vy: 0, falling: false, alive: true });
  }
  function countPhase(dt) {
    world.t -= dt;
    if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit(['c', lastBeep]); }
    if (world.t <= 0) { world.phase = 'fight'; world.t = 0; emit(['c', 0]); }
  }
  function fightPhase(ps, dt) {
    world.t += dt;
    world.ring = Math.max(R_MIN, R0 - Math.max(0, world.t - 10) * 0.16);
    // last car on the ring takes the round; also ends when rivals leave (no endless solo practice)
    const alive = ps.filter((p) => p.inRound && p.alive);
    if (alive.length > 1) return;
    world.winner = alive[0]?.id ?? null;
    if (alive[0]) alive[0].wins++;
    world.phase = 'roundEnd'; world.t = 3.2;
  }
  function roundEndPhase(ps, dt) {
    world.t -= dt;
    if (world.t > 0) return;
    const champ = ps.find((p) => p.wins >= WINS_TO_TAKE_MATCH);
    if (champ) Object.assign(world, { phase: 'matchEnd', t: 6, winner: champ.id });
    else startRound();
  }
  function startRound() {
    world.round++;
    Object.assign(world, { phase: 'count', t: 3, ring: R0, winner: null });
    lastBeep = 4;
    for (const p of world.players.values()) p.inRound = true;
    spawnAll();
  }

  // Game > attract: bots bump around behind the lobby
  sim.startAttract = () => {
    sim.clearPlayers();
    world.mode = 'attract';
    world.round = 0;
    addBots(ATTRACT_BOTS);
    spawnAll();
  };
  // Game > match: humans then bots, first round starts at once (relay host)
  sim.startMatch = ({ humans, bots }) => {
    sim.clearPlayers();
    names.reset();
    world.mode = 'match';
    world.round = 0;
    for (const h of humans.slice(0, MAX_CARS)) sim.addPlayer(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_CARS - world.players.size)));
    startRound();
  };
  // Multiplayer > roster: leavers drop; a joiner replaces the newest bot when all 14 seats are taken and waits for the next round
  sim.syncRoster = (humans) => {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.players.values()]) if (!p.bot && !ids.has(p.id)) sim.removePlayer(p.id);
    for (const h of humans) if (!world.players.has(h.id)) joinLate(h);
  };
  function joinLate(h) {
    if (world.players.size >= MAX_CARS) {
      const bot = [...world.players.values()].filter((q) => q.bot).pop();
      if (!bot) return;
      sim.removePlayer(bot.id);
    }
    Object.assign(sim.addPlayer(h.id, h.nick, h.color, false), { inRound: false, x: 0, z: -40 });
  }
  // Multiplayer > guest input { x, z, d: dash press counter }
  sim.applyInput = (id, inp) => {
    const p = world.players.get(id);
    if (!p || p.bot) return;
    p.inX = axis(inp.x); p.inZ = axis(inp.z);
    applyPresses(p, { dashSeq: ['lastDash', inp.d] });
  };

  // Run engine > one fixed step for every car
  sim.step = () => {
    for (const p of world.players.values()) if (p.bot && p.alive) botThink(p, STEP);
    physics(STEP);
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): one row per car, events since the last one
  const carFlags = (p) => (p.alive ? 1 : 0) | (p.falling ? 2 : 0) | (p.inRound ? 4 : 0) | (p.bot ? 8 : 0);
  sim.snapshot = () => {
    const cars = [...world.players.values()];
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), ring: f2(world.ring), rd: world.round, win: world.winner,
      P: cars.map((p) => [p.id, f2(p.x), f2(p.z), f2(p.vx), f2(p.vz), f2(p.ang), f2(p.y), carFlags(p), f2(p.dashT), p.wins, f2(p.dashCD), f2(p.vy)]),
    }, cars);
    if (sim.events.length) snap.ev = sim.events;
    sim.events = [];
    return snap;
  };

  return sim;
}
