// Provides shared course pieces: start pad with spawn grid, finish pad, rails, arena floors.

import { box, cyl } from './course-colliders.js';

export const CANDY = { floor: 0xf7f1ff, floorAlt: 0xe8dcff, rail: 0xff7ac6, hit: 0xff4f6d, bounce: 0x46d6ff, move: 0xffd23f, goal: 0x5ee07a, pad: 0xbfe8ff, post: 0x7f6bff };

// Spawn > rows of 8 across width, front row nearest the course (course runs toward -z)
export function spawnGrid({ x = 0, y = 0, zFront, width = 14, face = Math.PI }) {
  return (i) => {
    const row = Math.floor(i / 8), col = i % 8;
    return { x: x + (col - 3.5) * Math.min(1.7, width / 8), y, z: zFront + 1.2 + row * 1.6, face };
  };
}

// Start pad from z0 back to z0 + depth, low back wall so nobody walks off behind
export function startPad({ z0 = 0, depth = 12, width = 18, y = 0 }) {
  return [
    box({ x: 0, y: y - 0.5, z: z0 + depth / 2, hx: width / 2, hy: 0.5, hz: depth / 2, color: CANDY.pad }),
    box({ x: 0, y: y + 1, z: z0 + depth + 0.3, hx: width / 2, hy: 1, hz: 0.3, tag: 'wall', color: CANDY.rail }),
  ];
}

// Finish pad from z0 forward to z0 - depth; arch is view-only, line at z0 - 1
export function finishPad({ z0, depth = 10, width = 16, y = 0 }) {
  return [
    box({ x: 0, y: y - 0.5, z: z0 - depth / 2, hx: width / 2, hy: 0.5, hz: depth / 2, color: CANDY.goal }),
    box({ x: -width / 2 + 0.4, y: y + 2.5, z: z0 - 1, hx: 0.4, hy: 2.5, hz: 0.4, color: CANDY.rail, tag: 'wall' }),
    box({ x: width / 2 - 0.4, y: y + 2.5, z: z0 - 1, hx: 0.4, hy: 2.5, hz: 0.4, color: CANDY.rail, tag: 'wall' }),
    box({ x: 0, y: y + 5.2, z: z0 - 1, hx: width / 2, hy: 0.35, hz: 0.4, color: CANDY.goal, tag: 'goal' }),
  ];
}
export const crossedFinish = (z0, y) => (b) => b.z < z0 - 1 && b.y > y - 0.6;

// straight floor strip from zStart toward -z, optional side rails
export function strip({ zStart, length, width, y = 0, x = 0, rails = 0, color = CANDY.floor }) {
  const out = [box({ x, y: y - 0.5, z: zStart - length / 2, hx: width / 2, hy: 0.5, hz: length / 2, color })];
  if (rails) for (const s of [-1, 1]) out.push(box({ x: x + s * (width / 2 + 0.25), y: y + rails / 2, z: zStart - length / 2, hx: 0.25, hy: rails / 2, hz: length / 2, tag: 'wall', color: CANDY.rail }));
  return out;
}

// ramp from height y0 at zStart up / down to y1 at zStart - length (top surface)
export function ramp({ zStart, length, width, y0, y1, x = 0, color = CANDY.floorAlt }) {
  const tilt = Math.atan2(y1 - y0, length), c = Math.cos(tilt);
  return box({ x, y: (y0 + y1) / 2 - 0.5 / c, z: zStart - length / 2, hx: width / 2, hy: 0.5, hz: length / 2 / c, tilt, color });
}

// round arena floor (survival rounds), top at y
export const discFloor = ({ r, y = 0, x = 0, z = 0, color = CANDY.floor }) => cyl({ x, y: y - 0.6, z, r, hy: 0.6, color });

// spawn on a ring / disc: up to 32 beans in two rings facing center
export function ringSpawn({ r, y = 0 }) {
  return (i, n) => {
    const inner = n > 16 ? Math.ceil(n / 2) : n, ring = i < inner ? 0 : 1, k = ring ? i - inner : i, m = ring ? n - inner : inner;
    const a = (k / m) * Math.PI * 2 + ring * 0.2, rr = r * (ring ? 0.55 : 0.85);
    return { x: Math.sin(a) * rr, y, z: Math.cos(a) * rr, face: a + Math.PI };
  };
}

// Motion > yaw spin at rad/s about the collider's own center
export const spinMove = (spin, phase = 0) => (t, c) => ({ ...c.base, yaw: c.base.yaw + phase + spin * t });
// Motion > sine slide along x / y / z: amp units, w rad/s
export const slideMove = (axis, amp, w, phase = 0) => (t, c) => ({ ...c.base, [axis]: c.base[axis] + amp * Math.sin(w * t + phase) });

// Schedules > last item in a start-sorted list that began at or before t (binary search), or null
export function latestStarted(list, t) {
  let lo = 0, hi = list.length - 1, found = null;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (list[mid].start <= t) { found = list[mid]; lo = mid + 1; } else hi = mid - 1;
  }
  return found;
}
// parked pose for pooled obstacles with nothing to do right now
export const PARKED = { x: 0, y: -200, z: 0, yaw: 0, tilt: 0 };
