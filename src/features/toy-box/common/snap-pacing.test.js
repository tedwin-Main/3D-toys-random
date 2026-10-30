// Tests snapshot pacing: steady arrival keeps game rate, bunched arrival softens it, pauses ignored, coast cap bounded.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createSnapPacing } from './snap-pacing.js';

function feed(gaps) {
  let t = 1000;
  const pacing = createSnapPacing({ now: () => t });
  pacing.arrived();
  for (const g of gaps) { t += g; pacing.arrived(); }
  return pacing;
}

test('steady 50 ms snapshots keep the game rate and cap', () => {
  const pacing = feed(Array(100).fill(50));
  assert.equal(pacing.rate(16), 16);
  assert.equal(pacing.cap(0.12), 0.12);
});

test('bunched snapshots soften smoothing, within the floor', () => {
  // TCP burst pattern: two at once, then a 100 ms hole
  const pacing = feed(Array(100).fill(0).map((_, i) => (i % 2 ? 100 : 1)));
  const r = pacing.rate(16);
  assert.ok(r < 12 && r >= 16 * 0.35, `rate ${r}`);
  assert.ok(pacing.cap(0.12) > 0.12 && pacing.cap(0.12) <= 0.18);
});

test('tab-hidden pause does not count as jitter', () => {
  const pacing = feed([...Array(50).fill(50), 3000, ...Array(5).fill(50)]);
  assert.equal(pacing.rate(16), 16);
});

test('arrived returns arrival time for snapAt', () => {
  let t = 1234;
  const pacing = createSnapPacing({ now: () => t });
  assert.equal(pacing.arrived(), 1234);
});
