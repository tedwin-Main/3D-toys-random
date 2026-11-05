// Tests binary snapshot codec (exact round trip, clamping) and the free-tier snapshot rate budgets.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoundSim } from './round-sim.js';
import { packSnapshot, encodeSnapshot, decodeSnapshot, snapEvery, snapBytesEstimate, BUDGET } from './round-snapshot.js';
import { unwrapAck } from './input-sync.js';
import spinnerGauntlet from './rounds/spinner-gauntlet.js';
import tailSnatch from './rounds/tail-snatch.js';
import eggHaul from './rounds/egg-haul.js';

function midRound(round, n) {
  const roster = Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `p${i + 1}`, color: '#fff', bot: i > 0 }));
  const sim = createRoundSim({ round, seed: 7, roster, keep: Math.ceil(n * 0.7) });
  for (let i = 0; i < 60 * 8; i++) { sim.step(); if (i % 4 === 0) sim.events.length = 0; } // host clears events per snapshot
  return sim;
}

const idsOf = (sim) => sim.list.map((b) => b.id);
const viaJson = (v) => JSON.parse(JSON.stringify(v)); // JSON wire already turned -0 into 0

test('binary snapshot decodes to exactly the JSON snapshot, ~50% smaller', () => {
  for (const round of [spinnerGauntlet, tailSnatch, eggHaul]) {
    const sim = midRound(round, 32);
    const snap = packSnapshot(sim, () => 4321, '2-99');
    const bytes = encodeSnapshot(snap);
    assert.deepEqual(viaJson(decodeSnapshot(bytes, idsOf(sim))), viaJson(snap));
    assert.ok(bytes.length < JSON.stringify(snap).length * 0.6, `${round.id}: ${bytes.length} vs ${JSON.stringify(snap).length}`);
  }
});

test('snapshot from another round or wire version decodes to null', () => {
  const sim = midRound(spinnerGauntlet, 4);
  const bytes = encodeSnapshot(packSnapshot(sim, () => 0, 'k'));
  assert.equal(decodeSnapshot(bytes, idsOf(sim).slice(1)), null, 'row count differs from mirror');
  bytes[0] = 1;
  assert.equal(decodeSnapshot(bytes, idsOf(sim)), null, 'old version');
});

test('ack rides as 16 bits and unwraps against the guest seq', () => {
  const sim = midRound(spinnerGauntlet, 2);
  for (const [ack, seq] of [[0, 0], [5, 9], [65535, 65540], [65536, 65536], [200000, 200007]]) {
    const row = decodeSnapshot(encodeSnapshot(packSnapshot(sim, () => ack, 'k')), idsOf(sim)).P[0];
    assert.equal(unwrapAck(row[12], seq), ack, `ack ${ack} at seq ${seq}`);
  }
});

test('out-of-range values clamp instead of wrapping', () => {
  const sim = midRound(spinnerGauntlet, 2);
  const snap = packSnapshot(sim, () => 0, 'k');
  snap.P[0][2] = -9999; // OUT bean far below the course
  const row = decodeSnapshot(encodeSnapshot(snap), idsOf(sim)).P[0];
  assert.equal(row[2], -327.68);
});

test('snapshot rate: fastest rate inside both free-tier budgets', () => {
  const hz = (bytes, guests) => 60 / snapEvery({ bytes, guests });
  const bytes14 = snapBytesEstimate(14), bytes32 = snapBytesEstimate(32);
  assert.equal(hz(bytes14, 14), 60, '14 humans');
  assert.equal(hz(bytes32, 32), 15, '32 humans');
  assert.equal(hz(bytes32, 3), 60, '3 humans + 29 bots');
  for (const guests of [1, 5, 14, 20, 32]) {
    const rate = hz(bytes32, guests);
    if (rate === 15) continue; // floor rate may exceed a budget by design
    assert.ok(bytes32 * guests * rate <= BUDGET.relayBytes && guests * rate <= BUDGET.relayFrames);
  }
});
