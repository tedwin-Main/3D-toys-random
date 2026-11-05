// Tests server-guided input timing: queue wait reports, the guest phase shift they ask for, and shifted fixed steps.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createInputQueue, leadShiftMs } from './input-sync.js';
import { createFixedSteps } from './fixed-steps.js';

const TICK = 1000 / 60;
const input = [0, 0, 0, 0, 0];

// one guest whose inputs land `leadMs` before each server take, for `ticks` ticks; returns the lead reports
function run(leadMs, ticks, { dropEvery = 0 } = {}) {
  let t = 0;
  const q = createInputQueue({ now: () => t }), reports = [];
  q.push({ s: 1, I: [input] });
  for (let k = 2; k <= ticks; k++) {
    t = k * TICK - leadMs;
    if (!dropEvery || k % dropEvery) q.push({ s: k, I: [input] });
    t = k * TICK;
    q.take();
    const lead = q.takeLead();
    if (lead) reports.push(lead);
  }
  return reports;
}

test('queue reports how long inputs waited, once per half second', () => {
  const reports = run(9, 121);
  assert.equal(reports.length, 4, '30 takes each');
  // primed 2 deep, then the standing-depth drain removes the extra tick: inputs wait just their lead
  assert.ok(reports.at(-1).lowMs === 9 && reports.every((r) => r.starvePct === 0), JSON.stringify(reports));
});

test('starved takes are reported', () => {
  const reports = run(9, 121, { dropEvery: 5 });
  assert.ok(reports.some((r) => r.starvePct > 0), JSON.stringify(reports));
});

test('guest shifts later while inputs wait, earlier when they starve, capped per report', () => {
  assert.equal(leadShiftMs({ lowMs: 2, starvePct: 0 }), 0);
  assert.equal(leadShiftMs({ lowMs: 6, starvePct: 0 }), 2);
  assert.equal(leadShiftMs({ lowMs: 30, starvePct: 0 }), 4);
  assert.equal(leadShiftMs({ lowMs: 30, starvePct: 10 }), -2);
});

test('shifted fixed steps keep one step per on-grid beat', () => {
  const stepsDue = createFixedSteps();
  let t = 0, steps = 0;
  for (let k = 0; k < 60; k++) steps += stepsDue((t += TICK));
  stepsDue.shift(5);
  const counts = [];
  t += 5; // ticker moved 5 ms later too
  for (let k = 0; k < 60; k++) counts.push(stepsDue((t += TICK)));
  assert.ok(counts.every((n) => n === 1), counts.join(''));
});
