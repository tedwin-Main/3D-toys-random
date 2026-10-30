// Handles guest-side input prediction and snapshot reconciliation.

// Multiplayer > Guest prediction
// step(p, dt): game's per-entity step; live(me): when to predict; seed(pred, me): fix-ups on start (copy arrays, sync seq counters); merge(pred, host): extra fields to take from host
export function createPrediction({ step, live, seed = () => {}, merge = () => {}, pos = ['x', 'z'], vel = ['vx', 'vz'], angle = null, lead = 0.04, snapDist = 2.5, snapVel = 4, blend = 0.2 }) {
  let pred = null, acc = 0;
  const err = (keys, a, b, ahead = 0) => Math.hypot(...keys.map((k, i) => a[k] + (ahead && vel[i] ? a[vel[i]] * ahead : 0) - b[k]));
  const api = {
    get state() { return pred; },
    // guest sim tick: start from host copy of me, apply local input, run fixed steps
    tick(me, input, dt, STEP) {
      // host says not live, or prediction itself fell/froze: drop it, render host copy
      if (!me || !live(me) || (pred && !live(pred))) { pred = null; acc = 0; return; }
      if (!pred) { pred = { ...me }; seed(pred, me); }
      Object.assign(pred, input);
      for (acc += dt; acc >= STEP; acc -= STEP) step(pred, STEP);
    },
    // applySnap for my row: host pos is ~half a round trip old, so aim slightly ahead
    correct(host) {
      if (!pred) return;
      const k = err(pos, host, pred, lead) > snapDist ? 1 : blend;
      const kv = err(vel, host, pred) > snapVel ? 1 : blend;
      pos.forEach((key, i) => { const v = vel[i]; const t = host[key] + (v ? host[v] * lead : 0); pred[key] += (t - pred[key]) * k; });
      vel.forEach((key) => { pred[key] += (host[key] - pred[key]) * kv; });
      if (angle && k === 1) pred[angle] = host[angle];
      merge(pred, host);
    },
    reset() { pred = null; acc = 0; },
  };
  // ?debug: expose for smoke tests
  if (/[?&]debug\b/.test(location.search)) (window.__preds ??= []).push(api);
  return api;
}

// heading blend the short way round (for merge hooks)
export const blendAngle = (a, b, k) => a + Math.atan2(Math.sin(b - a), Math.cos(b - a)) * k;
