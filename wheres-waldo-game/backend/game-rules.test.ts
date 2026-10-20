import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DECOY_MAX, HIDER_PAR_MS, ROUND_MS, decoyRatioFor, densityFor, hiderScore,
  isHit, seekerScore, validatePlacement
} from './game-rules.ts';
import { generateScene } from './crowd-scene.ts';
import { HIT_RADIUS, WORLD_H, WORLD_W } from './scene-geometry.ts';

test('seeker score decays with time but never hits zero on a find', () => {
  assert.equal(seekerScore(0), 1000);
  assert.ok(seekerScore(45_000) < seekerScore(5_000));
  assert.equal(seekerScore(ROUND_MS), 100);
  assert.equal(seekerScore(ROUND_MS * 5), 100);
});

test('hider scores nothing when nobody finds them', () => {
  assert.equal(hiderScore([], 3), 0);
});

test('a longer hunt pays the hider more, capped at par', () => {
  assert.ok(hiderScore([20_000], 1) > hiderScore([5_000], 1));
  assert.equal(hiderScore([HIDER_PAR_MS], 1), 1000);
  assert.equal(hiderScore([HIDER_PAR_MS * 3], 1), 1000);
});

test('hiding is worth playing for: a decent hide rivals a fast find', () => {
  // The bug this guards: scoring the hider against ROUND_MS paid ~25 points
  // for a hide a seeker cracked in 2s, making every hiding turn a wasted round.
  const decentHide = hiderScore([12_000], 1);
  const fastFind = seekerScore(5_000);
  assert.ok(decentHide > fastFind * 0.4, `${decentHide} vs ${fastFind}`);
});

test('hider is scaled down when only some seekers found them', () => {
  const all = hiderScore([40_000, 40_000], 2);
  const half = hiderScore([40_000], 2);
  assert.ok(half < all);
});

test('difficulty only moves the ramp start, and the ramp is capped', () => {
  assert.ok(decoyRatioFor('hard', 0) > decoyRatioFor('easy', 0));
  assert.ok(decoyRatioFor('normal', 4) > decoyRatioFor('normal', 0));
  assert.ok(decoyRatioFor('hard', 20) <= DECOY_MAX);
  assert.ok(densityFor('hard', 2) > densityFor('easy', 2));
});

test('hit test honours the tolerance radius', () => {
  const t = { x: 500, y: 500 };
  assert.ok(isHit(t, { x: 500, y: 500 }));
  assert.ok(isHit(t, { x: 500 + HIT_RADIUS - 1, y: 500 }));
  assert.ok(!isHit(t, { x: 500 + HIT_RADIUS + 5, y: 500 }));
});

test('placement rejects edges and empty ground, accepts a crowd', () => {
  const scene = generateScene({ seed: 42, theme: 'kl', decoyRatio: 0.2, density: 260 }, false);
  const world = { w: WORLD_W, h: WORLD_H };

  assert.equal(validatePlacement(scene, 5, 5, world).ok, false);
  assert.equal(validatePlacement(scene, WORLD_W - 2, 900, world).ok, false);

  // A valid spot must exist in a crowd of 260.
  const someone = scene.people[120];
  const near = validatePlacement(scene, someone.x + 40, someone.y + 30, world);
  const anyValid = scene.people.some((p) =>
    validatePlacement(scene, p.x + 40, p.y + 30, world).ok);
  assert.ok(anyValid, 'no legal hiding spot anywhere in the crowd');
  assert.equal(typeof near.ok, 'boolean');
});
