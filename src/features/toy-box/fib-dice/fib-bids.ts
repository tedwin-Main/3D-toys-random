// Holds Fib Dice bid rules shared by the rules, bots, page and tests: what counts as a raise, the smallest raise, and counting a face with wild stars.

/** stars (1) are wild; bids name a face 2..6 */
export const FACES = [2, 3, 4, 5, 6];

/** next bid beats prev: more dice, or as many dice of a higher face */
export const isRaise = (next: { n: number; f: number }, prev: { n: number; f: number } | null) => !prev || next.n > prev.n || (next.n === prev.n && next.f > prev.f);

/** smallest legal raise, or null when even that would claim more dice than the table holds */
export function minRaise(bid: { n: number; f: number } | null, total: number) {
  const next = !bid ? { n: 1, f: 2 } : bid.f < 6 ? { n: bid.n, f: bid.f + 1 } : { n: bid.n + 1, f: 2 };
  return next.n <= total ? next : null;
}

/** dice on the table showing face f or a wild star */
export const countFace = (cups: Record<string, number[]>, f: number) => Object.values(cups).flat().filter((d) => d === f || d === 1).length;
