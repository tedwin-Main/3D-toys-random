// Tests server-guided input timing: arrival lead reports, the guest phase shift they ask for, and shifted fixed steps.

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

test('queue reports how early inputs land before the next tick, once a second', () => {
  const reports = run(9, 241);
  assert.equal(reports.length, 4, '60 takes each');
  assert.ok(reports.every((r) => r.lowMs === 9 && r.starvePct === 0), JSON.stringify(reports));
});

test('inputs landing just after the tick count as late', () => {
  const reports = run(-2, 241);
  assert.ok(reports.every((r) => r.lowMs === -2), JSON.stringify(reports));
  assert.ok(leadShiftMs(reports[0]) < 0, 'shift earlier');
});

test('starved takes are reported', () => {
  const reports = run(9, 241, { dropEvery: 5 });
  assert.ok(reports.some((r) => r.starvePct > 0), JSON.stringify(reports));
});

test('guest shifts later while inputs wait, earlier when they starve, capped per report', () => {
  assert.equal(leadShiftMs({ lowMs: 3, starvePct: 0 }), 0);
  assert.equal(leadShiftMs({ lowMs: 7, starvePct: 0 }), 2);
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
