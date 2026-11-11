// Makes a repeatable random number source from a match seed, for rules the relay server runs.

/** mulberry32: returns rng() in [0, 1); same seed, same sequence */
export function createSeededRng(seed) {
  let state = (Number(seed) | 0) || 0x9e3779b9;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let mixed = Math.imul(state ^ (state >>> 15), 1 | state);
    mixed = (mixed + Math.imul(mixed ^ (mixed >>> 7), 61 | mixed)) ^ mixed;
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}
