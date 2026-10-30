// Tests snapshot interpolation: midpoint lerp, angle short way, extrapolation cap, host-migration reset.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createInterp } from './snapshot-interp.js';

// fake clock: arrival = host ts + 30 ms lag
function setup() {
  let t = 0;
  const interp = createInterp({ delay: 100, now: () => t });
  const arrive = (id, ts, e, arrival = ts + 30) => { t = arrival; interp.push(id, ts, e); };
  return { interp, arrive, at: (ms, id = 1, e = {}) => { t = ms; return interp.at(id, e); } };
}

test('lerps midway between bracketing snapshots', () => {
  const { arrive, at } = setup();
  arrive(1, 1000, { x: 0, z: 0 });
  arrive(1, 1050, { x: 10, z: 4 });
  // render time = now - 30 lag - 100 delay; 1155 maps to 1025
  const v = at(1155);
  assert.equal(v.x, 5);
  assert.equal(v.z, 2);
});

test('angle blends the short way round', () => {
  const { arrive, at } = setup();
  arrive(1, 1000, { h: 3.1 });
  arrive(1, 1050, { h: -3.1 });
  const v = at(1155);
  assert.ok(Math.abs(Math.abs(v.h) - Math.PI) < 0.01);
});

test('extrapolates by velocity at most 100 ms, then holds', () => {
  const { arrive, at } = setup();
  arrive(1, 1000, { x: 0, vx: 10 });
  assert.equal(at(1000 + 30 + 100 + 50).x, 0.5);
  assert.equal(at(1000 + 30 + 100 + 900).x, 1);
});

test('keeps entity fields the render loop reads', () => {
  const { arrive, at } = setup();
  arrive(1, 1000, { x: 0 });
  assert.equal(at(1130, 1, { x: 9, nick: 'Ann', alive: true }).nick, 'Ann');
});

test('new host clock resets buffers instead of freezing', () => {
  const { interp, arrive, at } = setup();
  arrive(1, 1000, { x: 0 });
  arrive(1, 1050, { x: 1 });
  // new host's clock reads 90000 when local clock reads 1200
  arrive(1, 90000, { x: 50 }, 1200);
  assert.equal(at(1200 + 100).x, 50);
  assert.equal(interp.at(2), null);
});
