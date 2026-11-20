// Picks Bridge Isles bot moves: the stone that most cuts own path length versus the other team's, blurred by low skill; swaps a central opening.

import { stonesToGo } from './bridge-board.ts';

const NOISE = 6, CENTER_PULL = 0.04;

/** state: public bridge state; team: mover's team; skill 0..1; rng(): [0, 1) */
export function pickStone(state, team: number, skill: number, rng: () => number) {
  const { B, n } = state, cells = B.split(''), mine = String(team + 1), mid = (n - 1) / 2;
  let best = -1, bestValue = -Infinity;
  for (let i = 0; i < cells.length; i++) {
    if (cells[i] !== '0') continue;
    cells[i] = mine;
    const own = stonesToGo(cells, n, team), theirs = stonesToGo(cells, n, 1 - team);
    cells[i] = '0';
    if (own === 0) return i;
    const r = Math.floor(i / n), c = i % n;
    const value = Math.min(theirs, 99) - own - (Math.abs(r - mid) + Math.abs(c - mid)) * CENTER_PULL + (rng() - 0.5) * (1 - skill) * NOISE;
    if (value > bestValue) { bestValue = value; best = i; }
  }
  return best;
}

/** pie rule: take over an opening stone near the middle (strong ones see it more often) */
export function wantsSwap(state, skill: number, rng: () => number) {
  const i = state.B.search(/[12]/), n = state.n, mid = (n - 1) / 2;
  if (i < 0) return false;
  const off = Math.abs(Math.floor(i / n) - mid) + Math.abs((i % n) - mid);
  return off <= n / 3 && rng() < skill;
}
