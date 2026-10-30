/**
 * FILE: src/features/toy-box/common/snapshot-interp.js
 * PURPOSE: guest-side snapshot interpolation: draws remote players ~100 ms in the past, sliding between two real host snapshots so uneven arrival never jerks
 * UI: multiplayer action toys (other players on a guest screen)
 * USED BY: toy-box multiplayer pages (snapshot() ts, applySnap push, render loop at)
 * KEY EXPORTS: createInterp, hostClock
 */

const KEEP = 8; // samples per entity; 400 ms at 20 Hz
const EXTRAPOLATE_MAX = 100; // ms past newest sample, then hold
const MIGRATE_JUMP = 500; // ms clock-offset jump = new host clock

// host: timestamp for snapshot ts field
export const hostClock = () => Math.round(performance.now());

const lerp = (a, b, k) => a + (b - a) * k;
const lerpAngle = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;

// Multiplayer > Guest interpolation
export function createInterp({ delay = 100, keys = ['x', 'y', 'z', 'vx', 'vy', 'vz'], angles = ['h', 'face', 'ang'], now = () => performance.now() } = {}) {
  const buffers = new Map(), views = new Map();
  let minOff = Infinity, lastTs = null;

  // arrival minus host time; min over time = one-way lag without jitter, creeps up slowly to follow clock drift
  function syncClock(ts) {
    if (ts === lastTs) return;
    lastTs = ts;
    const off = now() - ts;
    if (Math.abs(off - minOff) > MIGRATE_JUMP && minOff !== Infinity) { buffers.clear(); minOff = off; return; }
    minOff = Math.min(minOff + 0.02, off);
  }
  function sampleOf(ts, entity) {
    const s = { t: ts };
    for (const k of keys) if (typeof entity[k] === 'number') s[k] = entity[k];
    for (const k of angles) if (typeof entity[k] === 'number') s[k] = entity[k];
    return s;
  }
  // lerp between bracketing samples; past newest, run on velocity briefly
  function blend(buf, t) {
    const last = buf[buf.length - 1];
    if (t >= last.t) {
      const ahead = Math.min(t - last.t, EXTRAPOLATE_MAX) / 1000, out = { ...last };
      for (const [p, v] of [['x', 'vx'], ['y', 'vy'], ['z', 'vz']]) if (p in last && v in last) out[p] = last[p] + last[v] * ahead;
      return out;
    }
    let i = buf.length - 1;
    while (i > 0 && buf[i - 1].t > t) i--;
    if (i === 0) return buf[0];
    const a = buf[i - 1], b = buf[i], k = (t - a.t) / (b.t - a.t || 1), out = {};
    for (const key of keys) if (key in a && key in b) out[key] = lerp(a[key], b[key], k);
    for (const key of angles) if (key in a && key in b) out[key] = lerpAngle(a[key], b[key], k);
    return out;
  }

  const api = {
    push(id, ts, entity) {
      if (typeof ts !== 'number') return;
      syncClock(ts);
      let buf = buffers.get(id);
      if (!buf) buffers.set(id, (buf = []));
      if (buf.length && ts <= buf[buf.length - 1].t) return;
      buf.push(sampleOf(ts, entity));
      if (buf.length > KEEP) buf.shift();
    },
    at(id, entity) {
      const buf = buffers.get(id);
      if (!buf?.length) return null;
      const view = views.get(id) ?? {};
      views.set(id, view);
      return Object.assign(view, entity, blend(buf, now() - minOff - delay));
    },
    forget(id) { buffers.delete(id); views.delete(id); },
  };
  // ?debug: expose for smoke tests
  if (typeof location !== 'undefined' && /[?&]debug\b/.test(location.search)) (globalThis.__interps ??= []).push(api);
  return api;
}
