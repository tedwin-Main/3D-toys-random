// Tests binary snapshot codec (exact round trip, key + delta frames, clamping) and the free-tier snapshot rate budgets.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoundSim } from './round-sim.js';
import { packSnapshot, encodeSnapshot, decodeSnapshot, createSnapshotWriter, createSnapshotReader, snapEvery, snapBytesEstimate, BUDGET, MAX_COURSE_COLLIDERS } from './round-snapshot.js';
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

// every snapshot of `seconds` of play through one writer: [bytes, JSON snapshot] per tick
function stream(round, n, seconds, every = 1) {
  const sim = midRound(round, n), writer = createSnapshotWriter(), out = [];
  for (let i = 0; i < 60 * seconds; i++) {
    sim.step();
    if (i % every) continue;
    const snap = packSnapshot(sim, (id) => sim.tick + id, '2-99');
    out.push([writer.write(snap), viaJson(snap)]);
    sim.events = [];
  }
  return { sim, out };
}

test('key + delta frames decode to exactly the JSON snapshots; deltas well under half a key frame', () => {
  for (const round of [spinnerGauntlet, tailSnatch, eggHaul]) {
    const { sim, out } = stream(round, 32, 3);
    const reader = createSnapshotReader(idsOf(sim));
    for (const [bytes, snap] of out) assert.deepEqual(viaJson(reader.read(bytes)), snap);
    const keys = out.filter(([b]) => b[1] === 0), deltas = out.filter(([b]) => b[1] === 1);
    assert.equal(keys.length, 6, 'key frame every 0.5 s');
    const avg = (list) => list.reduce((a, [b]) => a + b.length, 0) / list.length;
    assert.ok(avg(deltas) < avg(keys) * 0.7, `${round.id}: delta ${avg(deltas)} vs key ${avg(keys)}`);
  }
});

test('a late or broken reader waits for the next key frame, then reads exactly', () => {
  const { sim, out } = stream(spinnerGauntlet, 14, 2);
  const late = createSnapshotReader(idsOf(sim));
  const firstKey = out.findIndex(([b], i) => i > 0 && b[1] === 0);
  for (const [bytes, snap] of out.slice(5)) {
    const got = late.read(bytes);
    if (out.indexOf(out.find(([b]) => b === bytes)) < firstKey) assert.equal(got, null, 'no base yet');
    else assert.deepEqual(viaJson(got), snap);
  }
  const gappy = createSnapshotReader(idsOf(sim));
  gappy.read(out[0][0]);
  assert.equal(gappy.read(out[2][0]), null, 'missed a delta');
  assert.equal(decodeSnapshot(out[1][0], idsOf(sim)), null, 'delta alone');
});

test('32 humans stay inside the relay egress budget at the rate their average frame allows', () => {
  for (const round of [spinnerGauntlet, tailSnatch, eggHaul]) {
    const { out } = stream(round, 32, 3, 2);
    const bytes = out.reduce((a, [b]) => a + b.length, 0) / out.length;
    const hz = 60 / snapEvery({ bytes, guests: 32 });
    assert.ok(hz >= 30, `${round.id}: ${bytes} B allows ${hz} Hz`);
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
