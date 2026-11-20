// Picks Fib Dice bot moves from own dice and the binomial odds of everyone else's: raise the likeliest bid or call "Fib!", blurred by low skill.

import { minRaise, isRaise } from './fib-bids.ts';

const P_MATCH = 1 / 3; // a hidden die shows the face or a wild star
const NOISE = 1.6, BLUFF = 0.5;
const RAISE_CALLED = 0.4; // share of raises the next seat actually calls (tuned: 0.95 vs 0.45 bots)

/** P(at least k successes in m tries at chance p) */
export function atLeast(k: number, m: number, p: number) {
  if (k <= 0) return 1;
  if (k > m) return 0;
  let term = (1 - p) ** m, below = 0;
  for (let i = 0; i < k; i++) { below += term; term *= ((m - i) / (i + 1)) * (p / (1 - p)); }
  return Math.max(0, 1 - below);
}

const matches = (dice: number[], f: number) => dice.filter((d) => d === f || d === 1).length;

/**
 * dice: own cup; total: dice on the table; bid: { n, f } | null; skill 0..1; rng(): [0, 1).
 * Returns { t: 'call' } or { t: 'bid', n, f }.
 */
export function botMove(dice: number[], total: number, bid, skill: number, rng: () => number) {
  const others = total - dice.length;
  const odds = (n, f) => atLeast(n - matches(dice, f), others, P_MATCH);
  const blur = (p) => p + (rng() - 0.5) * (1 - skill) * NOISE;
  // weak bots sometimes just nudge the bid along, whatever their cup says
  if (rng() < (1 - skill) * BLUFF) {
    const r = minRaise(bid, total);
    return r ? { t: 'bid', ...r } : { t: 'call' };
  }
  let best = null;
  const from = bid ? bid.n : 1;
  for (let n = from; n <= Math.min(total, from + 2); n++) {
    for (let f = 2; f <= 6; f++) {
      if (bid && !isRaise({ n, f }, bid)) continue;
      // openers aim near what the table likely holds, not just 1
      const p = blur(odds(n, f)) - (bid ? 0 : Math.abs(n - (matches(dice, f) + others * P_MATCH) * 0.8) * 0.05);
      if (!best || p > best.p) best = { n, f, p };
    }
  }
  // calling loses when the bid is true; raising loses only if the raise is false and gets called: take the smaller risk
  if (!best || (bid && blur(odds(bid.n, bid.f)) < (1 - best.p) * RAISE_CALLED)) return { t: 'call' };
  return { t: 'bid', n: best.n, f: best.f };
}
