// Tests genre balance rules of relay-run games: kart mini-turbo, turbo ball kickoff boost and leaver backfill, crown ring that holds half the knights.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createKartSim, STEP as KART_STEP } from '../toy-box/kart-race-online/kart-sim.ts';
import { createTurboSim } from '../toy-box/rocket-ball-soccer/turbo-sim.ts';
import { createCrownSim, zoneRadius, ZONES } from '../toy-box/king-of-the-hill/crown-sim.ts';

const humans = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `h${i + 1}`, color: '#fff' }));

// kart at speed on the grid, pads removed so only the drift can grant boost
function racingKart() {
  const sim = createKartSim();
  sim.startMatch({ seed: 11, humans: humans(1), bots: 0 });
  sim.track.pads.length = 0;
  sim.world.phase = 'race';
  const p = sim.world.karts.get(1);
  Object.assign(p, { vx: Math.sin(p.h) * 20, vz: Math.cos(p.h) * 20, inGas: 1, inSteer: 0.4 });
  return { sim, p };
}
const drive = (sim, p, secs, drift) => { p.inDrift = drift; for (let t = 0; t < secs; t += KART_STEP) sim.stepKart(p, KART_STEP); };

test('kart: long drift release grants a mini-turbo, short drift does not', () => {
  const short = racingKart();
  drive(short.sim, short.p, 0.3, 1);
  drive(short.sim, short.p, KART_STEP, 0);
  assert.equal(short.p.boost, 0, 'tap drift gives nothing');

  const long = racingKart();
  drive(long.sim, long.p, 1.8, 1);
  drive(long.sim, long.p, KART_STEP, 0);
  assert.ok(long.p.boost > 0.9, `long drift boost ${long.p.boost}`);
  assert.equal(long.p.driftT, 0, 'drift timer resets on release');
});

test('turbo ball: kickoff resets every boost tank to a third', () => {
  const sim = createTurboSim();
  sim.startMatch({ humans: humans(2), bots: 2 });
  for (const p of sim.world.players.values()) assert.equal(p.boost, 0.33);
});

test('turbo ball: a leaver is replaced by a bot on the same team', () => {
  const sim = createTurboSim();
  sim.startMatch({ humans: humans(4), bots: 0 });
  const left = sim.world.players.get(2);
  sim.syncRoster(humans(4).filter((h) => h.id !== 2));
  const ps = [...sim.world.players.values()];
  assert.equal(ps.length, 4, 'seat kept');
  assert.equal(sim.world.players.has(2), false, 'leaver gone');
  const bot = ps.find((p) => p.bot);
  assert.equal(bot.team, left.team, 'bot joins the short team');
  assert.deepEqual([0, 1].map((t) => ps.filter((p) => p.team === t).length), [2, 2]);
});

// crown keep match in play, every knight walking straight at the ring centre; returns most knights ever inside at once
function crowdTheRing(count, secs = 6) {
  const sim = createCrownSim();
  sim.startMatch({ humans: humans(count), bots: 0 });
  sim.world.phase = 'play';
  let most = 0;
  for (let t = 0; t < secs; t += 1 / 60) {
    const [zx, zz] = ZONES[sim.world.zone];
    for (const p of sim.world.players.values()) { const dx = zx - p.x, dz = zz - p.z, l = Math.hypot(dx, dz) || 1; p.mx = dx / l; p.mz = dz / l; }
    sim.step();
    most = Math.max(most, sim.world.crowd);
  }
  return most;
}

test('crown keep: ring grows with the room but never holds more than half', () => {
  for (let n = 3; n <= 14; n++) assert.ok(zoneRadius(n) >= zoneRadius(n - 1), `radius never shrinks as knights join (${n})`);
  assert.ok(zoneRadius(2) > 0.5, 'ring stays visible around a lone holder');
  for (const n of [2, 6, 10, 14]) {
    const most = crowdTheRing(n);
    assert.ok(most >= 1 && most <= Math.max(1, Math.floor(n / 2)), `${n} knights: ${most} inside at once`);
  }
});

test('crown keep: ring eases to the new size when knights leave, snapshots carry it', () => {
  const sim = createCrownSim();
  sim.startMatch({ humans: humans(14), bots: 0 });
  assert.equal(sim.world.zoneR, zoneRadius(14));
  sim.syncRoster(humans(4));
  sim.step();
  assert.ok(sim.world.zoneR < zoneRadius(14) && sim.world.zoneR > zoneRadius(4), 'no pop on leave');
  for (let t = 0; t < 4; t += 1 / 60) sim.step();
  assert.ok(Math.abs(sim.world.zoneR - zoneRadius(4)) < 0.01, 'settled');
  assert.equal(sim.snapshot().zr, Math.round(sim.world.zoneR * 100) / 100);
});
