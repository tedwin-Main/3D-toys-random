// Builds the seeded Kart Party circuit data (centerline, speeds, pads, item boxes) for the page and the relay server alike.

import { CatmullRomCurve3, Vector3 } from 'three';

export const W = 18, NS = 1000;

export function mulberry(a) {
  return () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

// Track > star-shaped closed spline, wide for 14 karts; pads on long straights, item box rows spread around the lap
export function buildTrackData(seed) {
  const rng = mulberry(seed);
  const K = 12, pts = [];
  for (let i = 0; i < K; i++) { const a = (i / K) * Math.PI * 2, r = 85 + rng() * 50; pts.push(new Vector3(Math.cos(a) * r * 1.3, 0, Math.sin(a) * r)); }
  const curve = new CatmullRomCurve3(pts, true, 'centripetal');
  const len = curve.getLength();
  const P = curve.getSpacedPoints(NS).slice(0, NS);
  const Tn = P.map((p, i) => P[(i + 1) % NS].clone().sub(P[(i - 1 + NS) % NS]).normalize());
  const Sd = Tn.map((t) => new Vector3(t.z, 0, -t.x));
  const ds = len / NS;
  const curv = Tn.map((t, i) => Tn[(i + 2) % NS].clone().sub(Tn[(i - 2 + NS) % NS]).length() / (4 * ds));
  const raw = curv.map((k) => Math.min(33, Math.sqrt(19 / Math.max(k, 1e-4))));
  const vmax = raw.map((_, i) => { let m = Infinity; for (let j = 0; j < 50; j++) m = Math.min(m, raw[(i + j) % NS] + j * 0.32); return m; });
  return { seed, len, P, Tn, Sd, curv, vmax, pads: boostPads(P, Sd, vmax), boxes: itemBoxes(P, Sd) };
}

function boostPads(P, Sd, vmax) {
  const straight = [];
  for (let i = 80; i < NS - 40; i++) if (vmax[i] > 31) straight.push(i);
  const pads = [];
  for (let k = 0; k < 4 && straight.length; k++) {
    const i = straight[Math.floor((k + 0.5) / 4 * straight.length)], side = (k % 2 ? 1 : -1) * W * 0.25;
    const p = P[i].clone().addScaledVector(Sd[i], side);
    pads.push({ x: p.x, z: p.z, i });
  }
  return pads;
}

function itemBoxes(P, Sd) {
  const boxes = [];
  for (const frac of [0.18, 0.5, 0.78]) {
    const i = Math.floor(frac * NS);
    for (let s = -2; s <= 2; s++) boxes.push({ x: P[i].x + Sd[i].x * s * 3.2, z: P[i].z + Sd[i].z * s * 3.2, t: 0 });
  }
  return boxes;
}
