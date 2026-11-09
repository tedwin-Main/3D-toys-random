// Tests seat shuffle: keeps every seat, and spreads the first joiner evenly over all slots.

import test from 'node:test';
import assert from 'node:assert/strict';
import { shuffleInPlace } from './seat-shuffle.js';

test('shuffle keeps every seat exactly once', () => {
  const seats = shuffleInPlace([...Array(14).keys()]);
  assert.deepEqual([...seats].sort((a, b) => a - b), [...Array(14).keys()]);
});

test('first joiner lands in each of 6 slots about 1/6 of the time', () => {
  const hits = Array(6).fill(0), N = 60000;
  for (let n = 0; n < N; n++) hits[shuffleInPlace([0, 1, 2, 3, 4, 5]).indexOf(0)]++;
  for (const h of hits) assert.ok(Math.abs(h / N - 1 / 6) < 0.01, `slot share ${h / N}`);
});
