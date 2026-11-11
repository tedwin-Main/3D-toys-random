// Plans a Putt Party bot putt a few candidates per sim step: rolls each aim + power through the hole physics and keeps the best resting spots.

import { T, SUB, clamp, physStep } from './golf-course.js';

const SWEEP_ANGLES = 24, CUP_OFFSETS = [0, 0.03, -0.03, 0.07, -0.07];
const POWERS = [0.1, 0.2, 0.32, 0.48, 0.66, 0.85, 1];
const ROLL_STEPS = 480; // 4 s of roll per candidate
const CUPPED = -100, SPLASHED = 999, OFF_COURSE = 500;
/** putt power 0..1 > launch speed */
export const puttSpeed = (power) => 1.5 + power * 13.5;
export const PLAN_CANDIDATES = (SWEEP_ANGLES + CUP_OFFSETS.length) * POWERS.length;

function candidateShots(hole, ball) {
  const direct = Math.atan2(hole.cup.x - ball.x, hole.cup.z - ball.z), angles = [];
  for (let k = 0; k < SWEEP_ANGLES; k++) angles.push((k / SWEEP_ANGLES) * Math.PI * 2);
  for (const offset of CUP_OFFSETS) angles.push(direct + offset);
  return angles.flatMap((a) => POWERS.map((p) => ({ a, p })));
}

// lower = better: cupped, else path distance to the cup from the rest spot
function rateShot(hole, ball, { a, p }, launchHt) {
  const speed = puttSpeed(p), probe = { x: ball.x, z: ball.z, vx: Math.sin(a) * speed, vz: Math.cos(a) * speed };
  for (let i = 0; i < ROLL_STEPS; i++) {
    const result = physStep(hole, probe, SUB, launchHt + i * SUB);
    if (result === 'c') return CUPPED + p;
    if (result === 's') return SPLASHED;
    if (probe.vx === 0 && probe.vz === 0) break;
  }
  const steps = hole.field[Math.floor(probe.z / T) * hole.cols + Math.floor(probe.x / T)] ?? -1;
  return (steps < 0 ? OFF_COURSE : steps * T) + 0.35 * Math.hypot(hole.cup.x - probe.x, hole.cup.z - probe.z);
}

/**
 * launchHt: hole clock when the putt will leave (windmill blades keep turning while the bot thinks).
 * advance(count): rate the next few candidates; pick(skill, rng): finish the search, return { a, p } with skill-scaled wobble.
 */
export function createShotPlan(hole, ball, launchHt) {
  const shots = candidateShots(hole, ball);
  let next = 0, best = null, second = null;

  function advance(count) {
    for (const stop = Math.min(shots.length, next + count); next < stop; next++) {
      const rated = { ...shots[next], score: rateShot(hole, ball, shots[next], launchHt) };
      if (!best || rated.score < best.score) { second = best; best = rated; } else if (!second || rated.score < second.score) second = rated;
    }
  }

  return {
    ball,
    advance,
    pick(skill, rng) {
      advance(shots.length);
      const shot = second && rng() > skill ? second : best;
      const wobble = () => ((rng() + rng() + rng() - 1.5) / 1.5) * (1.3 - skill);
      return { a: shot.a + wobble() * 0.05, p: clamp(shot.p * (1 + wobble() * 0.08), 0.05, 1) };
    },
  };
}
