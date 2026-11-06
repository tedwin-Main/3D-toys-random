// Runs Kart Party race rules (kart physics, items, bots, laps, phases) with no rendering, for page attract, guest prediction and the relay server host.

import { buildTrackData, W, NS } from './kart-track.js';
import { createNameSync } from '../common/snapshot-names.js';

export const STEP = 1 / 60;
export const LAPS = 3;
export const ITEM_ICON = { boost: '🍄', banana: '🍌', shell: '🐢' };
export const MAX_KARTS = 14;
const BOT_NAMES = ['Zoom', 'Turbo Tina', 'Revs', 'Skid', 'Nitro', 'Vroom', 'Piston', 'Drift King', 'Lugnut', 'Sparky', 'Gears', 'Torque', 'Clutch', 'Muffler'];
const BOT_COLORS = ['#9b5de5', '#00bbf9', '#00f5d4', '#f15bb5', '#fee440', '#8ac926', '#ff924c', '#6a4c93', '#e76f51', '#2a9d8f', '#b5179e', '#577590', '#ef476f', '#06d6a0'];
const ATTRACT_BOTS = 8, ATTRACT_SEED = 3;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const f2 = (v) => Math.round(v * 100) / 100;
const rng = Math.random;

/** onEnd(): results timer ran out in a match (host goes back to the lobby) */
export function createKartSim({ onEnd = () => {} } = {}) {
  const world = { mode: 'attract', phase: 'race', t: 0, raceT: 0, karts: new Map(), bananas: [], shells: [], order: [], seed: null };
  const names = createNameSync();
  let track = null, lastBeep = 0;
  const sim = { world, events: [], get track() { return track; } };
  const emit = (e) => sim.events.push(e);

  // Track > rebuild only when the seed changes; returns true when rebuilt (page then rebuilds meshes)
  sim.loadTrack = (seed) => {
    if (world.seed === seed && track) return false;
    world.seed = seed;
    track = buildTrackData(seed);
    return true;
  };

  // Game > World
  sim.addKart = (id, nick, color, bot) => {
    const p = { id, nick, color, bot, x: 0, z: 0, h: 0, vx: 0, vz: 0, steer: 0, idx: 0, lastIdx: 0, lap: 0, half: false, prog: 0, boost: 0, spin: 0, item: null, finished: false, finishT: 0, place: 1, inGas: 0, inSteer: 0, inDrift: 0, itemSeq: 0, lastItem: 0, resetSeq: 0, lastReset: 0, skill: 0.9 + rng() * 0.08, lane: (rng() - 0.5) * W * 0.5, aiItemT: 2 + rng() * 4, vl: 0, vf: 0 };
    world.karts.set(id, p);
    return p;
  };
  sim.removeKart = (id) => world.karts.delete(id);
  sim.clearKarts = () => { world.karts.clear(); world.bananas = []; world.shells = []; world.order = []; };
  sim.ranked = () => [...world.karts.values()].sort((a, b) => b.prog - a.prog);
  const addBots = (n) => { for (let i = 0; i < n; i++) sim.addKart(-1 - i, world.mode === 'match' ? `${BOT_NAMES[i]} 🤖` : BOT_NAMES[i], BOT_COLORS[i], true); };

  function gridSlot(k) {
    // staggered 2-wide grid behind the line
    const back = 8 + Math.floor(k / 2) * 6, side = (k % 2 ? 1 : -1) * W * 0.24;
    const i = (NS - Math.round(back / (track.len / NS))) % NS;
    return { i, x: track.P[i].x + track.Sd[i].x * side, z: track.P[i].z + track.Sd[i].z * side };
  }
  const heading = (i) => Math.atan2(track.Tn[i].x, track.Tn[i].z);
  function gridAll() {
    [...world.karts.values()].forEach((p, k) => {
      const g = gridSlot(k);
      Object.assign(p, { x: g.x, z: g.z, h: heading(g.i), vx: 0, vz: 0, idx: g.i, lastIdx: g.i, lap: 0, half: false, boost: 0, spin: 0, item: null, finished: false, finishT: 0 });
    });
  }
  function nearestIdx(x, z, from) {
    let best = from, bd = Infinity;
    for (let k = -70; k <= 70; k++) { const i = (from + k + NS) % NS, p = track.P[i], d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = i; } }
    return { i: best, d: Math.sqrt(bd) };
  }

  // Run engine > kart physics (all karts): forward/lateral split, grip vs drift, offroad, boost, spin-out
  sim.stepKart = (p, dt) => {
    const racing = world.phase === 'race' && !p.finished;
    const fx = Math.sin(p.h), fz = Math.cos(p.h);
    let vf = p.vx * fx + p.vz * fz, vl = p.vx * fz - p.vz * fx;
    const near = nearestIdx(p.x, p.z, p.idx), off = near.d > W / 2 + 1.4;
    let gas = racing || (p.finished && world.mode === 'match') ? p.inGas : 0;
    if (p.finished) gas = Math.min(gas, 0.4);
    if (p.spin > 0) gas = 0;
    if (gas > 0) vf += 20 * gas * dt * (1 - Math.max(vf, 0) / (off ? 16 : 35 + p.boost * 14));
    else if (gas < 0) vf -= (vf > 0 ? 34 : 10) * -gas * dt;
    vf *= 1 - (off ? 1.4 : 0.25) * dt;
    if (world.phase !== 'race' || p.spin > 0) vf *= 1 - 2.2 * dt;
    p.steer += (clamp(p.inSteer, -1, 1) - p.steer) * (1 - Math.exp(-dt * 10));
    const speedK = clamp(Math.abs(vf) / 7, 0, 1) * Math.sign(vf || 1);
    const drift = p.inDrift && Math.abs(vf) > 6;
    const grip = drift ? 1.1 : off ? 3.5 : 7.5;
    p.h += p.steer * (drift ? 2.6 : 1.9) * speedK * dt * (1 - Math.min(Math.abs(vf) / 90, 0.35));
    if (p.spin > 0) { p.spin -= dt; p.h += 9 * dt; }
    vl *= Math.exp(-grip * dt);
    const nfx = Math.sin(p.h), nfz = Math.cos(p.h);
    p.vx = nfx * vf + nfz * vl; p.vz = nfz * vf - nfx * vl;
    p.x += p.vx * dt; p.z += p.vz * dt;
    p.vf = vf; p.vl = vl;
    p.lastIdx = p.idx;
    p.idx = nearestIdx(p.x, p.z, p.idx).i;
    p.boost = Math.max(0, p.boost - dt * 0.7);
    if (racing) for (const b of track.pads) if ((b.x - p.x) ** 2 + (b.z - p.z) ** 2 < 7) { if (p.boost < 0.6) emit(['o', p.id]); p.boost = 1; }
    if (p.boost > 0.5 && gas > 0) { const k = 1 + 3 * dt; p.vx *= k; p.vz *= k; }
    // laps: far half must be visited before the line counts
    if (p.idx > NS * 0.45 && p.idx < NS * 0.55) p.half = true;
    if (p.half && p.idx < NS * 0.1 && p.lastIdx > NS * 0.9) {
      p.half = false;
      // ghost = guest prediction copy: laps + finish order stay host-only
      if (racing && !p.ghost) {
        p.lap++;
        if (p.lap >= LAPS) { p.finished = true; p.finishT = world.raceT; world.order.push(p.id); emit(['F', p.id]); }
        else emit(['L', p.id, p.lap]);
      }
    }
    p.prog = p.finished ? 1e6 - world.order.indexOf(p.id) : p.lap * NS + p.idx + (p.half || p.idx < NS * 0.5 ? 0 : -NS);
    if (p.resetSeq !== p.lastReset) {
      p.lastReset = p.resetSeq;
      const i = p.idx; Object.assign(p, { x: track.P[i].x, z: track.P[i].z, h: heading(i), vx: 0, vz: 0 });
    }
  };
  function separate(ps) {
    for (let i = 0; i < ps.length; i++) for (let j = i + 1; j < ps.length; j++) {
      const a = ps[i], b = ps[j], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz);
      if (d > 2.6 || d < 1e-3) continue;
      const push = (2.6 - d) / d / 2;
      a.x -= dx * push; a.z -= dz * push; b.x += dx * push; b.z += dz * push;
      // trade a little velocity so bumps feel physical
      const nx = dx / d, nz = dz / d, vrel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
      if (vrel < 0) { a.vx += nx * vrel * 0.5; a.vz += nz * vrel * 0.5; b.vx -= nx * vrel * 0.5; b.vz -= nz * vrel * 0.5; }
    }
  }

  // Run engine > items: boxes, bananas (spin-out), homing shells
  function useItem(p) {
    const it = p.item;
    if (!it || p.finished) return;
    p.item = null;
    const fx = Math.sin(p.h), fz = Math.cos(p.h);
    if (it === 'boost') { p.boost = 1.6; emit(['o', p.id]); }
    else if (it === 'banana') { world.bananas.push({ x: p.x - fx * 3, z: p.z - fz * 3, owner: p.id, life: 60 }); emit(['t', p.id]); }
    else if (it === 'shell') { world.shells.push({ x: p.x + fx * 2.6, z: p.z + fz * 2.6, h: p.h, owner: p.id, life: 5, idx: p.idx }); emit(['t', p.id]); }
  }
  function hitKart(p) { if (p.spin > 0) return; p.spin = 1.1; emit(['h', p.id]); }
  function items(dt, ps) {
    for (const b of track.boxes) {
      b.t = Math.max(0, b.t - dt);
      if (b.t > 0) continue;
      for (const p of ps) if (!p.item && !p.finished && (p.x - b.x) ** 2 + (p.z - b.z) ** 2 < 4) {
        b.t = 3;
        // rubber-banding: back markers get more shells and boosts
        const back = p.place / Math.max(ps.length, 1);
        const r = rng();
        p.item = r < 0.25 + back * 0.35 ? 'boost' : r < 0.55 + back * 0.2 ? 'shell' : 'banana';
        emit(['b', p.id]);
        break;
      }
    }
    for (const b of world.bananas) {
      b.life -= dt;
      for (const p of ps) if (b.life > 0 && (p.x - b.x) ** 2 + (p.z - b.z) ** 2 < 2.4) { b.life = 0; hitKart(p); }
    }
    world.bananas = world.bananas.filter((b) => b.life > 0);
    for (const s of world.shells) stepShell(s, dt, ps);
    world.shells = world.shells.filter((s) => s.life > 0);
  }
  // home on nearest kart ahead within 45 u, otherwise follow the track tangent
  function stepShell(s, dt, ps) {
    s.life -= dt;
    let tgt = null, bd = 45 * 45;
    for (const p of ps) { if (p.id === s.owner && s.life > 4.6) continue; const dx = p.x - s.x, dz = p.z - s.z, d = dx * dx + dz * dz; if (d < bd && dx * Math.sin(s.h) + dz * Math.cos(s.h) > 0) { bd = d; tgt = p; } }
    s.idx = nearestIdx(s.x, s.z, s.idx).i;
    const want = tgt ? Math.atan2(tgt.x - s.x, tgt.z - s.z) : heading((s.idx + 6) % NS);
    let d = want - s.h; d = Math.atan2(Math.sin(d), Math.cos(d));
    s.h += clamp(d, -3.2 * dt, 3.2 * dt);
    s.x += Math.sin(s.h) * 46 * dt; s.z += Math.cos(s.h) * 46 * dt;
    for (const p of ps) if (s.life > 0 && !(p.id === s.owner && s.life > 4.6) && (p.x - s.x) ** 2 + (p.z - s.z) ** 2 < 3) { s.life = 0; hitKart(p); }
    for (const b of world.bananas) if (s.life > 0 && (b.x - s.x) ** 2 + (b.z - s.z) ** 2 < 2) { s.life = 0; b.life = 0; emit(['x', +s.x.toFixed(1), +s.z.toFixed(1)]); }
  }

  // Run engine > bots: aim at a lookahead point on their lane, brake to curvature speed, fire items
  function botThink(p, dt) {
    const i = (p.idx + 14) % NS;
    p.lane += (Math.sin(world.raceT * 0.23 + p.id) * W * 0.28 - p.lane) * dt * 0.5;
    const tx = track.P[i].x + track.Sd[i].x * p.lane, tz = track.P[i].z + track.Sd[i].z * p.lane;
    let d = Math.atan2(tx - p.x, tz - p.z) - p.h; d = Math.atan2(Math.sin(d), Math.cos(d));
    p.inSteer = clamp(d * 3, -1, 1);
    const v = Math.hypot(p.vx, p.vz), target = track.vmax[p.idx] * p.skill;
    p.inGas = v < target ? 1 : v > target + 3 ? -0.6 : 0.2;
    p.inDrift = 0;
    if (p.item) { p.aiItemT -= dt; if (p.aiItemT <= 0) { p.aiItemT = 1.5 + rng() * 4; p.itemSeq++; } }
  }

  // Game > Phases: countdown, race, results
  function phases(dt) {
    const ps = [...world.karts.values()];
    if (world.mode === 'attract') {
      world.phase = 'race'; world.raceT += dt;
      for (const p of ps) if (p.lap >= LAPS) { p.lap = 0; p.finished = false; world.order = world.order.filter((id) => id !== p.id); }
      return;
    }
    if (world.phase === 'count') {
      world.t -= dt;
      if (Math.ceil(world.t) !== lastBeep && world.t > 0) { lastBeep = Math.ceil(world.t); emit(['c', lastBeep]); }
      if (world.t <= 0) { world.phase = 'race'; world.raceT = 0; emit(['c', 0]); }
    } else if (world.phase === 'race') {
      world.raceT += dt;
      const humans = ps.filter((p) => !p.bot);
      // race ends when every human is home, or 25 s after the winner
      if (world.order.length && (humans.every((p) => p.finished) || world.raceT - (world.karts.get(world.order[0])?.finishT ?? world.raceT) > 25)) { world.phase = 'end'; world.t = 9; }
    } else if (world.phase === 'end') {
      world.t -= dt;
      if (world.t <= 0) { world.phase = 'done'; onEnd(); }
    }
  }
  function startRace() {
    world.phase = 'count'; world.t = 3.5; lastBeep = 4; world.raceT = 0; world.order = []; world.bananas = []; world.shells = [];
    for (const b of track.boxes) b.t = 0;
    gridAll();
  }

  // Game > attract: bots only on the fixed demo circuit
  sim.startAttract = () => {
    sim.clearKarts();
    world.mode = 'attract';
    sim.loadTrack(ATTRACT_SEED);
    addBots(ATTRACT_BOTS);
    gridAll();
  };
  // Game > match: humans then bots on the room's seeded circuit (relay host)
  sim.startMatch = ({ seed, humans, bots }) => {
    sim.clearKarts();
    world.mode = 'match';
    sim.loadTrack(seed);
    for (const h of humans.slice(0, MAX_KARTS)) sim.addKart(h.id, h.nick, h.color, false);
    addBots(Math.max(0, Math.min(bots, MAX_KARTS - world.karts.size)));
    startRace();
  };
  // Multiplayer > roster: leavers drop; a joining human takes over the last-placed bot's spot (keeps 14 seats)
  sim.syncRoster = (humans) => {
    const ids = new Set(humans.map((h) => h.id));
    for (const p of [...world.karts.values()]) if (!p.bot && !ids.has(p.id)) sim.removeKart(p.id);
    for (const h of humans) if (!world.karts.has(h.id)) joinLate(h);
  };
  function joinLate(h) {
    let from = null;
    if (world.karts.size >= MAX_KARTS) { from = [...world.karts.values()].filter((q) => q.bot).sort((a, b) => a.prog - b.prog)[0]; if (from) sim.removeKart(from.id); else return; }
    const k = sim.addKart(h.id, h.nick, h.color, false);
    const src = from ?? [...world.karts.values()].sort((a, b) => a.prog - b.prog)[0];
    if (src && src !== k) Object.assign(k, { x: src.x, z: src.z, h: src.h, idx: src.idx, lastIdx: src.idx, lap: src.lap, half: src.half });
    else { const g = gridSlot(world.karts.size - 1); Object.assign(k, { x: g.x, z: g.z, h: heading(g.i), idx: g.i, lastIdx: g.i }); }
  }
  // Multiplayer > guest input: first one syncs the item / reset counters so old presses never fire
  sim.applyInput = (id, inp) => {
    const p = world.karts.get(id);
    if (!p || p.bot) return;
    if (!p.inputSeen) { p.inputSeen = true; p.lastItem = inp.it; p.lastReset = inp.r; }
    Object.assign(p, { inGas: clamp(+inp.g2 || 0, -1, 1), inSteer: clamp(+inp.s || 0, -1, 1), inDrift: inp.d ? 1 : 0, itemSeq: inp.it | 0, resetSeq: inp.r | 0 });
  };

  // Run engine > one fixed step for every kart
  sim.step = () => {
    const ps = [...world.karts.values()];
    for (const p of ps) if (p.bot) botThink(p, STEP);
    for (const p of ps) { sim.stepKart(p, STEP); if (p.itemSeq !== p.lastItem) { p.lastItem = p.itemSeq; if (world.phase === 'race') useItem(p); } }
    if (world.phase === 'race') { separate(ps); items(STEP, ps); }
    sim.ranked().forEach((p, i) => (p.place = i + 1));
    phases(STEP);
  };

  // Multiplayer > snapshot (JSON): rows per kart, box / banana / shell state, events since the last one
  sim.snapshot = () => {
    const snap = names.stamp({
      g: 's', ph: world.phase, t: f2(world.t), rt: f2(world.raceT), seed: world.seed, ord: world.order, ev: sim.events,
      K: [...world.karts.values()].map((p) => [p.id, f2(p.x), f2(p.z), f2(p.h), f2(p.vx), f2(p.vz), f2(p.steer), p.lap, p.idx, (p.bot ? 1 : 0) | (p.finished ? 2 : 0) | (p.half ? 4 : 0), f2(p.boost), p.item, p.place, f2(p.finishT), f2(p.spin), Math.round(p.prog)]),
      Bx: track.boxes.map((b) => (b.t > 0 ? 1 : 0)),
      Ba: world.bananas.map((b) => [f2(b.x), f2(b.z)]),
      Sh: world.shells.map((s) => [f2(s.x), f2(s.z), f2(s.h)]),
    }, world.karts.values());
    sim.events = [];
    return snap;
  };

  return sim;
}
