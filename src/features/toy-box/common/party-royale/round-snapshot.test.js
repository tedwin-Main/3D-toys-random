// Tests binary snapshot codec (exact round trip, clamping) and the free-tier snapshot rate budgets.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoundSim } from './round-sim.js';
import { packSnapshot, encodeSnapshot, decodeSnapshot, snapEvery, snapBytesEstimate, BUDGET } from './round-snapshot.js';
import spinnerGauntlet from './rounds/spinner-gauntlet.js';
import tailSnatch from './rounds/tail-snatch.js';
import eggHaul from './rounds/egg-haul.js';

function midRound(round, n) {
  const roster = Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `p${i + 1}`, color: '#fff', bot: i > 0 }));
  const sim = createRoundSim({ round, seed: 7, roster, keep: Math.ceil(n * 0.7) });
  for (let i = 0; i < 60 * 8; i++) { sim.step(); if (i % 4 === 0) sim.events.length = 0; } // host clears events per snapshot
  return sim;
}

test('binary snapshot decodes to exactly the JSON snapshot, ~40% smaller', () => {
  for (const round of [spinnerGauntlet, tailSnatch, eggHaul]) {
    const snap = packSnapshot(midRound(round, 32), () => 4321, '2-99');
    Object.assign(snap, { pk: snap.k - 2, pev: [['j', 3]] });
    const bytes = encodeSnapshot(snap);
    const viaJson = (v) => JSON.parse(JSON.stringify(v)); // JSON wire already turned -0 into 0
    assert.deepEqual(viaJson(decodeSnapshot(bytes)), viaJson(snap));
    assert.ok(bytes.length < JSON.stringify(snap).length * 0.7, `${round.id}: ${bytes.length} vs ${JSON.stringify(snap).length}`);
  }
});

test('out-of-range values clamp instead of wrapping', () => {
  const snap = packSnapshot(midRound(spinnerGauntlet, 2), () => 0, 'k');
  snap.P[0][2] = -9999; // OUT bean far below the course
  snap.P[0][0] = -7; // bot ids are negative
  const row = decodeSnapshot(encodeSnapshot(snap)).P[0];
  assert.equal(row[2], -327.68);
  assert.equal(row[0], -7);
});

test('snapshot rate: fastest rate inside every free-tier budget', () => {
  const hz = (o) => 60 / snapEvery(o);
  const bytes14 = snapBytesEstimate(14), bytes32 = snapBytesEstimate(32);
  assert.equal(hz({ bytes: bytes14, relayGuests: 0, directGuests: 13 }), 60, '14 humans all direct');
  assert.equal(hz({ bytes: bytes14, relayGuests: 13, directGuests: 0 }), 30, '14 humans on relay');
  assert.equal(hz({ bytes: bytes32, relayGuests: 31, directGuests: 0 }), 15, '32 humans on relay');
  assert.equal(hz({ bytes: bytes32, relayGuests: 2, directGuests: 0 }), 60, '3 humans + 29 bots');
  for (const relayGuests of [0, 5, 13, 31]) for (const directGuests of [0, 4, 16]) {
    const rate = hz({ bytes: bytes32, relayGuests, directGuests });
    if (rate === 15) continue; // floor rate may exceed a budget by design
    assert.ok(bytes32 * relayGuests * rate <= BUDGET.relayBytes && relayGuests * rate <= BUDGET.relayFrames);
  }
});
