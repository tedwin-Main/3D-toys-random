// Counts fixed 60 Hz sim steps due from wall time, so browser guests and the server host tick at exactly the same average rate.

import { DT } from './course-colliders.js';

const STEP_MS = DT * 1000;

/** returns (nowMs) => steps due since the last call; after a stall at most maxCatchUp, the rest of the backlog is dropped */
export function createFixedSteps({ maxCatchUp = 5 } = {}) {
  let lastMs = null, behindMs = 0;
  return (nowMs) => {
    behindMs = lastMs == null ? STEP_MS : behindMs + nowMs - lastMs;
    lastMs = nowMs;
    const steps = Math.min(maxCatchUp, Math.floor(behindMs / STEP_MS));
    behindMs = steps === maxCatchUp ? 0 : behindMs - steps * STEP_MS;
    return steps;
  };
}
