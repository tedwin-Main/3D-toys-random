// Reads a Bridge Isles hex board: neighbors, a team's winning chain, and the stones a team still needs (shortest path) for bots.

// board: string of n*n cells, '0' empty, '1' Coral (joins top to bottom rows), '2' Lagoon (joins left to right columns)
const STEPS = [[-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0]];

export function hexNeighbors(i: number, n: number) {
  const r = Math.floor(i / n), c = i % n, out = [];
  for (const [dr, dc] of STEPS) {
    const rr = r + dr, cc = c + dc;
    if (rr >= 0 && cc >= 0 && rr < n && cc < n) out.push(rr * n + cc);
  }
  return out;
}

// team 0 starts on row 0 and ends on row n-1; team 1 on column 0 / column n-1
const onStart = (i, n, team) => (team === 0 ? i < n : i % n === 0);
const onEnd = (i, n, team) => (team === 0 ? i >= n * (n - 1) : i % n === n - 1);

/** cells of one connected chain joining team's two banks, or null */
export function chainFor(board: string, n: number, team: number) {
  const mark = String(team + 1), from = new Map();
  const queue = [];
  for (let i = 0; i < n * n; i++) if (board[i] === mark && onStart(i, n, team)) { queue.push(i); from.set(i, -1); }
  while (queue.length) {
    const i = queue.shift();
    if (onEnd(i, n, team)) {
      const path = [];
      for (let k = i; k >= 0; k = from.get(k)) path.push(k);
      return path;
    }
    for (const j of hexNeighbors(i, n)) if (board[j] === mark && !from.has(j)) { from.set(j, i); queue.push(j); }
  }
  return null;
}

/** empty cells team still has to fill to join its banks (0-1 BFS); Infinity when blocked */
export function stonesToGo(board: string | string[], n: number, team: number) {
  const mine = String(team + 1), cost = (i) => (board[i] === mine ? 0 : board[i] === '0' ? 1 : Infinity);
  const dist = new Array(n * n).fill(Infinity), deque = [];
  for (let i = 0; i < n * n; i++) if (onStart(i, n, team) && cost(i) < Infinity) { dist[i] = cost(i); if (cost(i)) deque.push(i); else deque.unshift(i); }
  while (deque.length) {
    const i = deque.shift();
    for (const j of hexNeighbors(i, n)) {
      const d = dist[i] + cost(j);
      if (d >= dist[j]) continue;
      dist[j] = d;
      if (cost(j)) deque.push(j); else deque.unshift(j);
    }
  }
  let best = Infinity;
  for (let i = 0; i < n * n; i++) if (onEnd(i, n, team)) best = Math.min(best, dist[i]);
  return best;
}

/** pie rule: the lone first stone at (r, c) becomes the other team's stone at (c, r), so both teams keep their own banks */
export const mirrorCell = (i: number, n: number) => (i % n) * n + Math.floor(i / n);
