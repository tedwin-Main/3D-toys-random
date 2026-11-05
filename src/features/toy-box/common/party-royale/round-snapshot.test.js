// Tests binary snapshot codec (exact round trip, clamping) and the free-tier snapshot rate budgets.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoundSim } from './round-sim.js';
import { packSnapshot, encodeSnapshot, decodeSnapshot, snapEvery, snapBytesEstimate, BUDGET, MAX_COURSE_COLLIDERS } from './round-snapshot.js';
import { ROUNDS } from './show-director.js';
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

test('columns at their base value in every row are skipped and read back as that base', () => {
  const sim = midRound(spinnerGauntlet, 32);
  const snap = packSnapshot(sim, () => 0, 'k');
  for (const row of snap.P) { row[13] = 1; row[14] = 0; } // nobody slowed, no round extra
  const lean = encodeSnapshot(snap);
  snap.P[0][13] = 0.5; snap.P[0][14] = 3;
  const full = encodeSnapshot(snap);
  assert.ok(full.length - lean.length >= 2 * snap.P.length, `${lean.length} vs ${full.length}`);
  const rows = decodeSnapshot(lean, idsOf(sim)).P;
  assert.ok(rows.every((row) => row[13] === 1 && row[14] === 0));
  assert.deepEqual(viaJson(decodeSnapshot(full, idsOf(sim))), viaJson(snap));
});

test('every course fits its ground collider index in one byte', () => {
  for (const round of Object.values(ROUNDS)) {
    const { cols } = round.build(7, 32);
    assert.ok(cols.length < MAX_COURSE_COLLIDERS, `${round.id}: ${cols.length} colliders`);
  }
});

test('32 humans at the floor rate stay inside the relay egress budget', () => {
  for (const round of [spinnerGauntlet, tailSnatch, eggHaul]) {
    const sim = midRound(round, 32);
    const bytes = encodeSnapshot(packSnapshot(sim, () => 65535, '2-99')).length;
    const hz = 60 / snapEvery({ bytes, guests: 32 });
    assert.ok(bytes * 32 * hz <= BUDGET.relayBytes, `${round.id}: ${bytes} B x 32 x ${hz} Hz`);
  }
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
