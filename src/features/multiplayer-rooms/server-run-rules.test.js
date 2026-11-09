// Tests genre balance rules of relay-run games: kart mini-turbo, turbo ball kickoff boost and leaver backfill.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createKartSim, STEP as KART_STEP } from '../toy-box/kart-race-online/kart-sim.js';
import { createTurboSim } from '../toy-box/rocket-ball-soccer/turbo-sim.js';

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
