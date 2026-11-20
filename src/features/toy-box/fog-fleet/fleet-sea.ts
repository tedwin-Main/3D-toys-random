// Defines Fog Fleet sea helpers: sea size, fleet lengths, random boat placement and the hunt/target heat map bots aim with.

/** sea side by table size: 8 + seats/2 (9 for two, 15 for fourteen) */
export const sideFor = (seats: number) => 8 + Math.floor(Math.max(2, seats) / 2);
/** boat lengths per fleet: three boats up to 8 seats, two beyond */
export const fleetFor = (seats: number) => (seats <= 8 ? [3, 2, 2] : [3, 2]);

// every straight run of len cells on an n x n sea, as cell index lists
function runs(n: number, len: number) {
  const out = [];
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) for (const [dr, dc] of [[0, 1], [1, 0]]) {
    if (r + dr * (len - 1) >= n || c + dc * (len - 1) >= n) continue;
    out.push(Array.from({ length: len }, (_, k) => (r + dr * k) * n + c + dc * k));
  }
  return out;
}

/** boats of the given lengths on cells not in taken (taken grows); a boat with no room comes back empty */
export function placeFleet(n: number, lengths: number[], taken: Set<unknown>, rng: () => number) {
  return lengths.map((len) => {
    const spots = runs(n, len).filter((cells) => cells.every((i) => !taken.has(i)));
    if (!spots.length) return [];
    const cells = spots[Math.floor(rng() * spots.length)];
    for (const i of cells) taken.add(i);
    return cells;
  });
}

/**
 * Heat per cell for aiming. sea: '.' open, 'o' miss, 'x' hit boat afloat, '#' sunk; own: the bot's own cells (never targets, never enemy boats).
 * Every run of a boat length through open or hit cells adds heat to its open cells; runs through live hits add a lot (target mode).
 */
export function heatMap(sea: string, n: number, own: Set<unknown>, lengths: number[]) {
  const heat = new Array(n * n).fill(0);
  const open = (i) => !own.has(i) && (sea[i] === '.' || sea[i] === 'x');
  for (const len of new Set(lengths)) for (const cells of runs(n, len)) {
    if (!cells.every(open)) continue;
    const hits = cells.filter((i) => sea[i] === 'x').length;
    if (hits === len) continue;
    for (const i of cells) if (sea[i] === '.') heat[i] += 1 + hits * 12;
  }
  return heat;
}

/** legal targets for a seat: open cells not its own */
export const openCells = (sea: string, own: Set<unknown>) => [...sea].flatMap((c, i) => (c === '.' && !own.has(i) ? [i] : []));
