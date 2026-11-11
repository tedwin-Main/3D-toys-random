// Holds the Block Party voxel plate (bounds, block cap, palette range, op checks, per-builder credit) with no rendering, for the page and the relay server host.

export const GX = 40, GY = 30, GZ = 40, MAX_BLOCKS = 12000, PALETTE_SIZE = 16;
/** ops per message: senders chunk to this, receivers ignore the rest */
export const OPS_PER_MESSAGE = 400;
export const ERASE = -1;
export const cellKey = (x, y, z) => (y * GZ + z) * GX + x;
export const unkey = (k) => [k % GX, Math.floor(k / (GX * GZ)), Math.floor(k / GX) % GZ];
export const inBounds = (x, y, z) => x >= 0 && x < GX && y >= 0 && y < GY && z >= 0 && z < GZ;
/** op = [x, y, z, color] (color ERASE removes); anything else from the wire is dropped */
export const isValidOp = (op) => Array.isArray(op) && op.slice(0, 4).every(Number.isInteger) && op[3] >= ERASE && op[3] < PALETTE_SIZE;

/**
 * cells: Map cellKey > color. set() returns the previous color (ERASE = empty) or undefined when out of bounds.
 * placed: Map builder id > blocks that really landed (block cap can refuse one).
 */
export function createBuildBoard() {
  const cells = new Map(), placed = new Map();

  function set(x, y, z, color) {
    if (!inBounds(x, y, z)) return undefined;
    const k = cellKey(x, y, z), prev = cells.has(k) ? cells.get(k) : ERASE;
    if (color === ERASE) cells.delete(k);
    else if (cells.size < MAX_BLOCKS || cells.has(k)) cells.set(k, color);
    return prev;
  }

  // builder credit only for a block that really landed
  const isNewBlock = (x, y, z, color, prev) => color !== ERASE && prev === ERASE && cells.has(cellKey(x, y, z));

  return {
    cells,
    placed,
    set,
    isNewBlock,
    get: (x, y, z) => cells.get(cellKey(x, y, z)),
    credit(who) { placed.set(who, (placed.get(who) ?? 0) + 1); },
    clear() { cells.clear(); },
    // flat [x, y, z, color, ...] for a full-plate message or a save
    encode: () => [...cells].flatMap(([k, color]) => [...unkey(k), color]),
    load(flat) {
      cells.clear();
      if (!Array.isArray(flat)) return;
      for (let i = 0; i + 3 < flat.length; i += 4) {
        const op = flat.slice(i, i + 4);
        if (isValidOp(op) && op[3] !== ERASE) set(...op);
      }
    },
  };
}
