/**
 * FILE: backend/crowd-scene.test.ts
 * PURPOSE: unit tests for deterministic scene generation, Waldo look and decoy constraints
 * UI: none
 * USED BY: npm test
 * KEY EXPORTS: none
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { generateScene, stampTarget, targetPosition } from './crowd-scene.ts';
import { WALDO } from './color-palette.ts';
import { WORLD_H, WORLD_W } from './scene-geometry.ts';

const params = { seed: 123456, theme: 'kl' as const, decoyRatio: 0.25, density: 200 };

test('same seed produces a bit-identical scene', () => {
  const a = generateScene(params);
  const b = generateScene(params);
  assert.deepEqual(a, b);
});

test('different seeds produce different scenes', () => {
  const a = generateScene(params);
  const b = generateScene({ ...params, seed: 999 });
  assert.notDeepEqual(a.people, b.people);
});

test('exactly one Waldo exists in race mode', () => {
  const s = generateScene(params);
  assert.equal(s.people.filter((p) => p.isTarget).length, 1);
  assert.ok(s.targetIndex >= 0);
  assert.equal(s.people[s.targetIndex].isTarget, true);
});

test('no decoy copies both the stripe and the hat', () => {
  for (const seed of [1, 2, 3, 77, 4242]) {
    const s = generateScene({ ...params, seed, decoyRatio: 0.4 });
    for (const p of s.people) {
      if (p.isTarget) continue;
      // Waldo's outfit changes every round, so compare against this scene's look
      const stripe = p.torsoA === s.look.stripeA && p.torsoB === s.look.stripeB;
      const hat = p.hat === s.look.hat && p.hatA === s.look.hatA && p.hatB === s.look.hatB;
      assert.ok(!(stripe && hat), `seed ${seed}: a decoy is a second Waldo`);
    }
  }
});

test('decoy count tracks the ratio', () => {
  const low = generateScene({ ...params, decoyRatio: 0.05 }).people.filter((p) => p.decoy).length;
  const high = generateScene({ ...params, decoyRatio: 0.4 }).people.filter((p) => p.decoy).length;
  assert.ok(high > low * 4, `${high} should dwarf ${low}`);
});

test('everyone stays inside the world', () => {
  for (const p of generateScene(params).people) {
    assert.ok(p.x >= 0 && p.x <= WORLD_W);
    assert.ok(p.y >= 0 && p.y <= WORLD_H);
  }
});

test('hide mode has no target until it is stamped', () => {
  const crowd = generateScene(params, false);
  assert.equal(crowd.targetIndex, -1);
  assert.equal(targetPosition(crowd), null);
  const stamped = stampTarget(crowd, 700, 700);
  assert.deepEqual(targetPosition(stamped), { x: 700, y: 700 });
  assert.equal(stamped.people.filter((p) => p.isTarget).length, 1);
});

test('people are sorted back to front for painter order', () => {
  const s = generateScene(params);
  for (let i = 1; i < s.people.length; i++) assert.ok(s.people[i].y >= s.people[i - 1].y);
});

test('Waldo appearance in crowd exactly matches target card spec', () => {
  for (const seed of [1, 2, 7, 42, 123456]) {
    const s = generateScene({ ...params, seed });
    const target = s.people[s.targetIndex];
    assert.equal(target.skin, WALDO.skin);
    assert.equal(target.hair, WALDO.hair);
    assert.equal(target.legs, WALDO.legs);
    assert.equal(target.torsoA, s.look.stripeA);
    assert.equal(target.torsoB, s.look.stripeB);
    assert.equal(target.hat, s.look.hat);
    assert.equal(target.hatA, s.look.hatA);
    assert.equal(target.hatB, s.look.hatB);
    assert.equal(target.accessory, s.look.accessory);
    assert.equal(target.flip, false);
  }
});

test('stamped Waldo in hide mode matches target card spec', () => {
  const crowd = generateScene(params, false);
  const stamped = stampTarget(crowd, 700, 700);
  const target = stamped.people[stamped.targetIndex];
  assert.equal(target.skin, WALDO.skin);
  assert.equal(target.hair, WALDO.hair);
  assert.equal(target.legs, WALDO.legs);
  assert.equal(target.torsoA, crowd.look.stripeA);
  assert.equal(target.torsoB, crowd.look.stripeB);
  assert.equal(target.hat, crowd.look.hat);
  assert.equal(target.accessory, crowd.look.accessory);
  assert.equal(target.flip, false);
});

test('no decoy copies Waldo accessory alongside stripe or hat', () => {
  for (const seed of [1, 2, 3, 77, 4242]) {
    const s = generateScene({ ...params, seed, decoyRatio: 0.4 });
    for (const p of s.people) {
      if (p.isTarget) continue;
      const copiesStripe = p.torsoA === s.look.stripeA && p.torsoB === s.look.stripeB;
      const copiesHat = p.hat === s.look.hat && p.hatA === s.look.hatA && p.hatB === s.look.hatB;
      if (copiesStripe || copiesHat) {
        assert.notEqual(p.accessory, s.look.accessory, `seed ${seed}: decoy copied accessory plus another trait`);
      }
    }
  }
});
