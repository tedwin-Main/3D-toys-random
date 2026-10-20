// Scoring, difficulty ramp, misclick cooldown, and the hide-mode placement
// validator. Pure functions, shared by server and client so the UI can show the
// same numbers the server will award.

import { HIT_RADIUS, SPRITE_H, SPRITE_W } from './scene-geometry.ts';
import type { Prop, Scene } from './crowd-scene.ts';

export type Difficulty = 'easy' | 'normal' | 'hard';
export type Mode = 'race' | 'hide';

/** Hard cap on a round. Also the denominator for every time-based score. */
export const ROUND_MS = 90_000;

/** A wrong click locks the player out briefly: punishes screen-spam without taxing honest guesses. */
export const WRONG_COOLDOWN_MS = 2_000;

/**
 * Misses per round that cost nothing. Punishing the very first wrong click
 * made people afraid to commit to a guess; the penalty only bites once a
 * player is clearly spraying clicks around.
 */
export const WRONG_GRACE = 2;

export const RACE_ROUNDS = 5;

/** Difficulty sets where the decoy ramp STARTS; it climbs every round from there. */
const DECOY_START: Record<Difficulty, number> = { easy: 0.05, normal: 0.15, hard: 0.25 };
const DECOY_STEP = 0.0375;
export const DECOY_MAX = 0.4;

const DENSITY_START: Record<Difficulty, number> = { easy: 340, normal: 480, hard: 640 };
const DENSITY_STEP = 60;

export function decoyRatioFor(difficulty: Difficulty, roundIndex: number): number {
  return Math.min(DECOY_MAX, DECOY_START[difficulty] + roundIndex * DECOY_STEP);
}

export function densityFor(difficulty: Difficulty, roundIndex: number): number {
  return DENSITY_START[difficulty] + roundIndex * DENSITY_STEP;
}

/**
 * Decaying time score: everyone who finds it scores, faster is worth more, with
 * a floor so a slow-but-successful player still stays in the game.
 */
export function seekerScore(elapsedMs: number): number {
  const t = Math.max(0, Math.min(ROUND_MS, elapsedMs));
  return Math.max(100, Math.round(1000 * (1 - t / ROUND_MS)));
}

/**
 * The hunt length a good hide is expected to buy. The hider curve is measured
 * against this, NOT against ROUND_MS: real finds land in 3-30s, so scoring
 * avg/90s paid the hider ~25 points while the seeker banked ~975, which made
 * every hiding turn a wasted round.
 */
export const HIDER_PAR_MS = 25_000;

/**
 * Hider score: the average time it took to find them -- a longer hunt pays more,
 * topping out at HIDER_PAR_MS, scaled by the fraction of seekers who found them.
 * Zero if NOBODY found it, which is what stops corner-stuffing and 1px hides.
 */
export function hiderScore(findTimesMs: number[], seekerCount: number): number {
  if (findTimesMs.length === 0 || seekerCount === 0) return 0;
  const avg = findTimesMs.reduce((a, b) => a + b, 0) / findTimesMs.length;
  const foundShare = findTimesMs.length / seekerCount;
  return Math.round(1000 * Math.min(1, avg / HIDER_PAR_MS) * foundShare);
}

export function isHit(target: { x: number; y: number }, click: { x: number; y: number }): boolean {
  return Math.hypot(target.x - click.x, target.y - click.y) <= HIT_RADIUS;
}

export interface PlacementCheck {
  ok: boolean;
  reason?: string;
}

const EDGE_MARGIN = 60;
const CROWD_RADIUS = 110;
const MIN_NEIGHBOURS = 3;
const MAX_OVERLAP = 2;

/** Does a prop cover the sprite's body rather than just sit near it? */
function occludedByProp(props: Prop[], x: number, y: number): boolean {
  return props.some(
    (pr) =>
      x > pr.x - 4 && x < pr.x + pr.w + 4 &&
      y > pr.y + 8 && y < pr.y + pr.h + SPRITE_H * 0.4
  );
}

/**
 * Reject degenerate hides: screen edges, empty plains, behind-the-lamppost, and
 * stacked-on-three-people. The hider's skill is choosing a clever spot, not an
 * unfindable one -- and the scoring already pays zero for unfound hides.
 */
export function validatePlacement(scene: Scene, x: number, y: number, world: { w: number; h: number }): PlacementCheck {
  if (x < EDGE_MARGIN || y < EDGE_MARGIN || x > world.w - EDGE_MARGIN || y > world.h - EDGE_MARGIN) {
    return { ok: false, reason: 'Too close to the edge of the scene.' };
  }
  if (occludedByProp(scene.props, x, y)) {
    return { ok: false, reason: 'That spot is hidden behind scenery.' };
  }
  let neighbours = 0;
  let overlaps = 0;
  for (const p of scene.people) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= CROWD_RADIUS) neighbours++;
    if (Math.abs(p.x - x) < SPRITE_W * 0.6 && Math.abs(p.y - y) < SPRITE_H * 0.5) overlaps++;
  }
  if (neighbours < MIN_NEIGHBOURS) {
    return { ok: false, reason: 'Too exposed -- stand in a crowd.' };
  }
  if (overlaps > MAX_OVERLAP) {
    return { ok: false, reason: 'Too buried under other people.' };
  }
  return { ok: true };
}
