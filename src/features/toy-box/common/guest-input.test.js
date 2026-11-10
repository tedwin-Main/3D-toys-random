// Tests guest input sanitizing and press-counter sync.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { axis, num, seq, applyPresses } from './guest-input.js';

test('axis clamps and zeroes junk', () => {
  assert.equal(axis(0.5), 0.5);
  assert.equal(axis(50), 1);
  assert.equal(axis(-9), -1);
  assert.equal(axis('abc'), 0);
  assert.equal(axis(NaN), 0);
  assert.equal(axis(undefined), 0);
});

test('num and seq drop non-finite values', () => {
  assert.equal(num(Infinity, 3), 3);
  assert.equal(num('2.5'), 2.5);
  assert.equal(seq('x'), 0);
  assert.equal(seq(7.9), 7);
});

test('first input syncs last-seen so no phantom press', () => {
  const p = { lastDash: 0 };
  applyPresses(p, { dashSeq: ['lastDash', 12] });
  assert.equal(p.dashSeq, 12);
  assert.equal(p.lastDash, 12);
  applyPresses(p, { dashSeq: ['lastDash', 13] });
  assert.equal(p.dashSeq, 13);
  assert.equal(p.lastDash, 12);
});
