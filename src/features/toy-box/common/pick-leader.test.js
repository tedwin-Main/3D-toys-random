// Tests leader picking with ties and tiebreaks.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickLeader } from './pick-leader.js';

const P = (id, s, d = 0) => ({ id, s, d });

test('sole leader wins', () => {
  const r = pickLeader([P(1, 3), P(2, 5), P(3, 4)], (p) => p.s);
  assert.equal(r.winner.id, 2);
  assert.equal(r.tied.length, 1);
});

test('tie returns no winner, never first joiner', () => {
  const r = pickLeader([P(1, 5), P(2, 5), P(3, 1)], (p) => p.s);
  assert.equal(r.winner, null);
  assert.deepEqual(r.tied.map((p) => p.id), [1, 2]);
});

test('tiebreak splits equal scores', () => {
  const r = pickLeader([P(1, 5, 3), P(2, 5, 1)], (p) => p.s, (a, b) => b.d - a.d);
  assert.equal(r.winner.id, 2);
});

test('empty list', () => {
  assert.deepEqual(pickLeader([], (p) => p.s), { winner: null, tied: [] });
});
