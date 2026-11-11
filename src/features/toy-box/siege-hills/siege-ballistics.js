// Computes Siege Hills terrain heights, craters and boulder flight with no rendering, shared by the rules, bot aim and the page's arc preview.

export const STEP = 0.5; // metres between terrain height samples along x
export const FLOOR = -8;
export const G = 20;
export const BLAST = 2.7;
const MAX_SPEED = 31, CAT_R = 0.9, FLIGHT_DT = 1 / 120, MAX_FLIGHT = 9, SELF_HIT_GRACE = 0.35;
const BASE_HEIGHT = 6.5, SHORE = 6, PAD_HALF_WIDTH = 3, MIN_PAD_HEIGHT = 3.5;
const round2 = (v) => Math.round(v * 100) / 100;

/** ground height at x on heights H (one per STEP), linear between samples */
export function heightAt(H, x) {
  const f = x / STEP, i = Math.floor(f);
  if (i < 0) return H[0];
  if (i >= H.length - 1) return H[H.length - 1];
  return H[i] + (H[i + 1] - H[i]) * (f - i);
}

// flat pad where a catapult stands, blended into the hill at its edges
function flattenPad(H, x) {
  const centre = Math.round(x / STEP), padHeight = Math.max(H[centre], MIN_PAD_HEIGHT);
  for (let d = -PAD_HALF_WIDTH; d <= PAD_HALF_WIDTH; d++) {
    const i = centre + d;
    if (H[i] != null) H[i] = padHeight + (H[i] - padHeight) * (Math.abs(d) / PAD_HALF_WIDTH) ** 2;
  }
}

/** fresh hills W wide for a round, dropping into the sea at both ends, flat pads at catapult spots */
export function genTerrain(W, spots, rng) {
  const n = Math.round(W / STEP) + 1, H = new Array(n);
  const phase = [rng() * 9, rng() * 9, rng() * 9], amp = [3.2, 1.6, 0.6], freq = [0.07 + rng() * 0.03, 0.19, 0.5];
  for (let i = 0; i < n; i++) {
    const x = i * STEP, edge = Math.min(x, W - x);
    let h = BASE_HEIGHT;
    for (let k = 0; k < 3; k++) h += Math.sin(x * freq[k] + phase[k]) * amp[k];
    if (edge < SHORE) h -= (SHORE - edge) * 1.1;
    H[i] = Math.max(1, h);
  }
  for (const x of spots) flattenPad(H, x);
  return H.map(round2);
}

/** heights after a round crater of radius r at (ix, iy) */
export function crater(H, ix, iy, r) {
  const out = H.slice(), first = Math.max(0, Math.floor((ix - r) / STEP)), last = Math.min(H.length - 1, Math.ceil((ix + r) / STEP));
  for (let i = first; i <= last; i++) {
    const dx = i * STEP - ix;
    if (Math.abs(dx) > r) continue;
    const bottom = iy - Math.sqrt(r * r - dx * dx) * 0.8;
    if (out[i] > bottom) out[i] = Math.max(FLOOR + 1, round2(bottom));
  }
  return out;
}

export const launchPoint = (cat) => ({ x: cat.x, y: cat.y + 1.4 });
/** a = angle in radians, p = power 0..1 */
export const velocity = (a, p) => ({ vx: Math.cos(a) * p * MAX_SPEED, vy: Math.sin(a) * p * MAX_SPEED });

/**
 * Boulder flight until it hits something; wind is horizontal acceleration.
 * shot: { x0, y0, vx, vy, wind, shooter }; field: { H, W, cats }
 * returns { ix, iy, ft (flight seconds), off (left the field), direct (catapult id hit) }
 */
export function simulate({ x0, y0, vx, vy, wind, shooter }, { H, W, cats }) {
  let x = x0, y = y0, t = 0;
  for (; t < MAX_FLIGHT; t += FLIGHT_DT) {
    vx += wind * FLIGHT_DT; vy -= G * FLIGHT_DT;
    x += vx * FLIGHT_DT; y += vy * FLIGHT_DT;
    if (x < -2 || x > W + 2) return { ix: x, iy: y, ft: t, off: true };
    for (const cat of cats) if (cat.alive && (cat.id !== shooter || t > SELF_HIT_GRACE) && Math.hypot(x - cat.x, y - (cat.y + 0.6)) < CAT_R) return { ix: x, iy: y, ft: t, direct: cat.id };
    if (y <= heightAt(H, x)) return { ix: x, iy: heightAt(H, x), ft: t };
  }
  return { ix: x, iy: y, ft: t, off: true };
}
