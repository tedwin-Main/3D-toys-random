// Sanitizes guest input values before the host sim applies them.

// stick axis: finite, clamped to [-1, 1]; junk (string, NaN) becomes 0
export const axis = (v) => { const n = +v; return Number.isFinite(n) ? Math.max(-1, Math.min(1, n)) : 0; };

// any number (aim point, position): finite or fallback
export const num = (v, fallback = 0) => { const n = +v; return Number.isFinite(n) ? n : fallback; };

// press counter (dash, fire, jump): integer, junk becomes 0
export const seq = (v) => num(v) | 0;

/**
 * Press counters: presses = { seqKey: [lastKey, value] }.
 * First input the host sees from p (match start, host promotion): last-seen = current, so old presses never fire.
 */
export function applyPresses(p, presses) {
  for (const [key, [lastKey, value]] of Object.entries(presses)) {
    p[key] = seq(value);
    if (!p.inputSeen) p[lastKey] = p[key];
  }
  p.inputSeen = true;
}
