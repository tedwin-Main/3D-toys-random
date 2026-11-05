// Plans the Bean Royale Show: lists every round and picks the next one plus its qualify quota from beans left.

import gateGamble from './rounds/gate-gamble.js';
import spinnerGauntlet from './rounds/spinner-gauntlet.js';
import ghostTiles from './rounds/ghost-tiles.js';
import tiltBridges from './rounds/tilt-bridges.js';
import boulderHill from './rounds/boulder-hill.js';
import sweepBar from './rounds/sweep-bar.js';
import wallRush from './rounds/wall-rush.js';
import cannonRain from './rounds/cannon-rain.js';
import patternPanic from './rounds/pattern-panic.js';
import tailSnatch from './rounds/tail-snatch.js';
import eggHaul from './rounds/egg-haul.js';
import crownSummit from './rounds/crown-summit.js';

export const ROUNDS = Object.fromEntries([gateGamble, spinnerGauntlet, ghostTiles, tiltBridges, boulderHill, sweepBar, wallRush, cannonRain, patternPanic, tailSnatch, eggHaul, crownSummit].map((r) => [r.id, r]));

const OPENERS = ['gate-gamble', 'spinner-gauntlet', 'ghost-tiles', 'tilt-bridges', 'boulder-hill'];
const MIDDLE = ['sweep-bar', 'wall-rush', 'cannon-rain', 'pattern-panic', 'tail-snatch', 'egg-haul', 'tilt-bridges', 'boulder-hill'];
const FINALS = ['crown-summit', 'sweep-bar', 'cannon-rain', 'pattern-panic'];
const OPEN_KEEP = 0.7, MIDDLE_KEEP = 0.55, FINAL_AT = 6, MAX_ROUNDS = 5;

/** quota for a round with `remaining` beans: share kept, at least 1 out, at least 1 through */
export const keepFor = (remaining, share) => Math.max(1, Math.min(remaining - 1, Math.round(remaining * share)));

/**
 * Next round of the show, or null when one bean is left.
 * roundNo: 0-based rounds played so far; played: ids already used (no repeats until the pool runs dry); rng: seeded () => [0, 1)
 */
export function nextRound({ remaining, roundNo, played = [], rng }) {
  if (remaining <= 1) return null;
  const final = remaining <= FINAL_AT || (roundNo >= MAX_ROUNDS - 1 && roundNo > 0);
  if (final) return pick(FINALS, played, rng, 1, true);
  if (roundNo === 0) return pick(OPENERS, played, rng, keepFor(remaining, OPEN_KEEP));
  const pool = MIDDLE.filter((id) => id !== 'egg-haul' || remaining >= 6);
  return pick(pool, played, rng, keepFor(remaining, MIDDLE_KEEP));
}

function pick(pool, played, rng, keep, final = false) {
  const fresh = pool.filter((id) => !played.includes(id));
  const from = fresh.length ? fresh : pool;
  const id = from[Math.floor(rng() * from.length)];
  return { id, round: ROUNDS[id], keep, final };
}
