// Paces snapshot arrival to smooth remote entity interpolation.

const CALM_MS = 8; // ticker quantization at 60 Hz: below this counts as steady
const PAUSE_MS = 500; // longer gap = tab hidden / host migration, not jitter
const MIN_RATE = 0.35; // never soften past this share of the game's own rate
const MAX_CAP = 1.5; // coast window never past this multiple of the game's own cap

// Multiplayer > Guest snapshot pacing
export function createSnapPacing({ interval = 50, now = () => performance.now() } = {}) {
  let last = 0, mean = interval, jitter = 0;
  const api = {
    // applySnap: returns arrival time (for snapAt) and updates gap mean / jitter
    arrived() {
      const t = now(), gap = last ? t - last : 0;
      last = t;
      if (gap > 0 && gap < PAUSE_MS) {
        mean += (gap - mean) * 0.05;
        jitter += (Math.abs(gap - mean) - jitter) * 0.1;
      }
      return t;
    },
    // rate for 1 - exp(-dt * rate): game's rate when steady; jitter beyond calm adds to the time constant
    rate(base) {
      const extra = Math.max(0, jitter - CALM_MS) / 1000;
      return Math.max(base * MIN_RATE, base / (1 + base * extra));
    },
    // max seconds to coast on velocity past the newest snapshot: covers a typical late gap
    cap(base) {
      return Math.min(base * MAX_CAP, Math.max(base, (mean + 2 * jitter) / 1000));
    },
    get stats() { return { mean, jitter }; },
  };
  // ?debug: expose for smoke tests
  if (typeof location !== 'undefined' && /[?&]debug\b/.test(location.search)) globalThis.__pacing = api;
  return api;
}
