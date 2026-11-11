// Tests changed-only snapshot fields: first pick sends all, later picks only changes, refresh and reset resend everything.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createChangedOnly } from './changed-only.js';

test('first pick sends every field; unchanged fields then stay out', () => {
  const fields = createChangedOnly({ refreshEvery: 100 });
  assert.deepEqual(fields.pick({ seed: 7, order: [1, 2] }), { seed: 7, order: [1, 2] });
  assert.deepEqual(fields.pick({ seed: 7, order: [1, 2] }), {});
  assert.deepEqual(fields.pick({ seed: 7, order: [2, 1] }), { order: [2, 1] });
});

test('every refreshEvery-th pick is a full copy; reset forces one', () => {
  const fields = createChangedOnly({ refreshEvery: 3 });
  const sizes = [1, 2, 3, 4].map(() => Object.keys(fields.pick({ a: 1, b: 2 })).length);
  assert.deepEqual(sizes, [2, 0, 0, 2]);
  fields.reset();
  assert.deepEqual(fields.pick({ a: 1, b: 2 }), { a: 1, b: 2 });
});
