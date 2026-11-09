// Tests chi-square p-values against textbook critical values.

import test from 'node:test';
import assert from 'node:assert/strict';
import { chiSquareP } from './seat-stats.js';

test('chi-square critical values give their p', () => {
  // df 4: 13.277 at p 0.01, 9.488 at p 0.05; df 2: 5.991 at p 0.05
  assert.ok(Math.abs(chiSquareP(13.277, 4) - 0.01) < 0.001);
  assert.ok(Math.abs(chiSquareP(9.488, 4) - 0.05) < 0.001);
  assert.ok(Math.abs(chiSquareP(5.991, 2) - 0.05) < 0.001);
  assert.equal(chiSquareP(0, 3), 1);
});
