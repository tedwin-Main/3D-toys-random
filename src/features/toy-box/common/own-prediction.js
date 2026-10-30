/**
 * FILE: src/features/toy-box/common/own-prediction.js
 * PURPOSE: guest-side prediction for own player: runs game step on local input at once, host snapshots pull it back (blend small drift, snap big error); drawn corrections fade out instead of jumping
 * UI: multiplayer action toys (guest's own car / player / ship)
 * USED BY: toy-box multiplayer pages (simTick guest branch, applySnap, render loop)
 * KEY EXPORTS: createPrediction, blendAngle
 */

// Multiplayer > Guest prediction
// step(p, dt): game's per-entity step; live(me): when to predict; seed(pred, me): fix-ups on start (copy arrays, sync seq counters); merge(pred, host): extra fields to take from host
export function createPrediction({ step, live, seed = () => {}, merge = () => {}, pos = ['x', 'z'], vel = ['vx', 'vz'], angle = null, lead = 0.04, snapDist = 2.5, snapVel = 4, blend = 0.2 }) {
  const FADE_S = 0.12; // drawn correction offset decay
  let pred = null, acc = 0;
  const offset = {}, view = {};
  const clearOffset = () => pos.forEach((k) => (offset[k] = 0));
  clearOffset();
  const err = (keys, a, b, ahead = 0) => Math.hypot(...keys.map((k, i) => a[k] + (ahead && vel[i] ? a[vel[i]] * ahead : 0) - b[k]));
  const api = {
    // drawn state: physics state plus fading correction offset
    get state() {
      if (!pred) return null;
      Object.assign(view, pred);
      pos.forEach((k) => (view[k] += offset[k]));
      return view;
    },
    // guest sim tick: start from host copy of me, apply local input, run fixed steps
    tick(me, input, dt, STEP) {
      // host says not live, or prediction itself fell/froze: drop it, render host copy
      if (!me || !live(me) || (pred && !live(pred))) { pred = null; acc = 0; clearOffset(); return; }
      if (!pred) { pred = { ...me }; seed(pred, me); }
      Object.assign(pred, input);
      for (acc += dt; acc >= STEP; acc -= STEP) step(pred, STEP);
      const fade = Math.exp(-dt / FADE_S);
      pos.forEach((k) => (offset[k] *= fade));
    },
    // applySnap for my row: host pos is ~half a round trip old, so aim slightly ahead
    correct(host) {
      if (!pred) return;
      const k = err(pos, host, pred, lead) > snapDist ? 1 : blend;
      const kv = err(vel, host, pred) > snapVel ? 1 : blend;
      // small fix: physics jumps, drawing keeps old spot and fades over; big error: teleport
      pos.forEach((key, i) => {
        const v = vel[i], t = host[key] + (v ? host[v] * lead : 0), d = (t - pred[key]) * k;
        pred[key] += d;
        offset[key] = k === 1 ? 0 : offset[key] - d;
      });
      vel.forEach((key) => { pred[key] += (host[key] - pred[key]) * kv; });
      if (angle && k === 1) pred[angle] = host[angle];
      merge(pred, host);
    },
    reset() { pred = null; acc = 0; clearOffset(); },
  };
  // ?debug: expose for smoke tests
  if (/[?&]debug\b/.test(location.search)) (window.__preds ??= []).push(api);
  return api;
}

// heading blend the short way round (for merge hooks)
export const blendAngle = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
