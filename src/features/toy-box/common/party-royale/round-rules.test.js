// Tests every party royale round headless with 14 and 32 bots, plus a full show down to one winner.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './course-colliders.js';
import { createRoundSim, INTRO, ACTIVE } from './round-sim.js';
import { ROUNDS, nextRound } from './show-director.js';

const bots = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `b${i + 1}`, color: '#fff', bot: true }));
const keepOf = (round, n) => (round.kind === 'final' ? 1 : Math.ceil(n * 0.6));

function play(round, roster, keep, seed) {
  const sim = createRoundSim({ round, seed, roster, keep });
  const limit = (INTRO + round.duration + 2) * 60;
  while (sim.phase !== 'end' && sim.tick < limit) {
    sim.step();
    sim.events.length = 0;
    for (const b of sim.list) if (b.status === ACTIVE) assert.ok(Number.isFinite(b.x + b.y + b.z + b.vx + b.vy + b.vz), `${round.id}: bean ${b.id} NaN at tick ${sim.tick}`);
  }
  return sim;
}

for (const round of Object.values(ROUNDS)) {
  for (const n of [14, 32]) {
    test(`${round.id}: ${n} bots finish the round with a clean result`, () => {
      for (const seed of [1, 2]) {
        const keep = keepOf(round, n), sim = play(round, bots(n), keep, seed);
        assert.equal(sim.phase, 'end', `seed ${seed}: round ended before its timer`);
        assert.equal(sim.qualified.length + sim.out.length, n, `seed ${seed}: every bean qualified or out`);
        assert.ok(sim.qualified.length >= 1, `seed ${seed}: somebody goes through`);
        if (round.kind === 'final') assert.equal(sim.qualified.length, 1, `seed ${seed}: final crowns exactly one`);
        if (round.kind === 'race') assert.ok(sim.qualified.length >= keep, `seed ${seed}: race quota filled (${sim.qualified.length}/${keep})`);
      }
    });
  }
}

test('bean royale show: 32 bots play rounds down to one crowned winner', () => {
  for (const seed of [11, 12, 13]) {
    const rng = mulberry32(seed);
    let roster = bots(32), roundNo = 0;
    const played = [];
    for (let plan = nextRound({ remaining: roster.length, roundNo, played, rng }); plan; plan = nextRound({ remaining: roster.length, roundNo, played, rng })) {
      const sim = play(plan.round, roster, plan.keep, seed * 100 + roundNo);
      played.push(plan.id); roundNo++;
      const through = new Set(sim.qualified);
      roster = roster.filter((r) => through.has(r.id));
      assert.ok(roster.length >= 1, `round ${plan.id} left nobody`);
      assert.ok(roundNo <= 10, 'show ends within 10 rounds');
    }
    assert.equal(roster.length, 1, `seed ${seed}: one winner (${played.join(' > ')})`);
  }
});
