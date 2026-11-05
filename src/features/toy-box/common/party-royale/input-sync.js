// Syncs guest inputs to host by tick sequence and predicts own bean with replay reconciliation.

import { DT } from './course-colliders.js';
import { stepBean } from './bean-physics.js';

const EVERY_TICK_GUESTS = 8;

/**
 * Ticks per guest input bundle. Relay CPU grows with message count
 * (capacity-test, 32 players: every tick 75% of Render free CPU, every 2 ticks 64%), so small rooms send every tick, big ones every 2.
 */
export const inputEvery = (guests) => (guests <= EVERY_TICK_GUESTS ? 1 : 2);
const HISTORY = 300;
const QUEUE_PRIME = 2, QUEUE_MAX = 12, DRAIN_WINDOW = 30, STANDING_PCT = 0.1;

/** Guest > full input seq from a snapshot ack sent as its low 16 bits: newest seq <= own seq with those bits */
export const unwrapAck = (ack, seq) => seq - ((seq - ack) & 0xffff);

const packInput = (b) => [Math.round(b.mx * 100) / 100, Math.round(b.mz * 100) / 100, b.jumpSeq, b.diveSeq, b.grab ? 1 : 0];
const unpackInput = ([mx, mz, j, d, g]) => ({ mx, mz, jumpSeq: j, diveSeq: d, grab: !!g });

// Guest > numbered input log: one input per tick; flush = unsent ones; confirm = press-to-ack time
export function createInputLog({ now = () => performance.now() } = {}) {
  const hist = new Map(), sentAt = new Map();
  let seq = 0, firstUnsent = 1, acked = 0;
  return {
    get seq() { return seq; },
    record(input) {
      seq++;
      hist.set(seq, packInput(input)); sentAt.set(seq, now());
      hist.delete(seq - HISTORY); sentAt.delete(seq - HISTORY);
      return seq;
    },
    at(s) { const p = hist.get(s); return p && unpackInput(p); },
    flush() {
      const from = firstUnsent;
      if (from > seq) return null;
      const I = [];
      for (let s = from; s <= seq; s++) I.push(hist.get(s));
      firstUnsent = seq + 1;
      return { g: 'i', s: from, I };
    },
    // host ack from a snapshot: ms since that input was recorded, or null if no newer ack
    confirm(ack) {
      if (ack <= acked) return null;
      acked = ack;
      const t = sentAt.get(ack);
      return t == null ? null : now() - t;
    },
  };
}

/**
 * Host > per-guest jitter buffer, one input per tick (ack = last applied seq).
 * Primes 2 deep. Each 0.5 s window records the depth before every take; the depth it almost never drops below
 * (10th percentile, so one late burst does not count) is pure lag, and the next window drains it
 * by skipping to newer inputs (press counters are cumulative: no jump or dive lost).
 */
export function createInputQueue() {
  const q = [];
  let lastQueued = 0, ack = 0, primed = false, cur = unpackInput([0, 0, 0, 0, 0]);
  const depths = [];
  let drain = 0;
  return {
    get ack() { return ack; },
    get depth() { return q.length; },
    push({ s, I }) {
      I.forEach((p, k) => { const seq = s + k; if (seq > lastQueued) { q.push([seq, p]); lastQueued = seq; } });
    },
    take() {
      if (!primed && q.length < QUEUE_PRIME) return cur;
      primed = true;
      trackStanding();
      if (q.length > QUEUE_MAX) q.splice(0, q.length - QUEUE_PRIME);
      if (drain > 0 && q.length > 1) { q.shift(); drain--; }
      const next = q.shift();
      if (next) { ack = next[0]; cur = unpackInput(next[1]); }
      return cur;
    },
  };
  function trackStanding() {
    depths.push(q.length);
    if (depths.length < DRAIN_WINDOW) return;
    depths.sort((a, b) => a - b);
    drain = Math.max(0, depths[Math.floor(DRAIN_WINDOW * STANDING_PCT)] - 1);
    depths.length = 0;
  }
}

/**
 * Guest > own-bean prediction. Host state at ack + replay of unacked inputs with obstacles at matching ticks,
 * so what the guest sees (and jumps over) is what the host will simulate when those inputs land.
 * step(bean, course): one fixed step (defaults to stepBean)
 */
export function createPredictor({ step = stepBean } = {}) {
  let pred = null, tick = 0;
  const offset = { x: 0, y: 0, z: 0 };
  return {
    get bean() { return pred; },
    get predictedTick() { return tick; },
    offset,
    reset() { pred = null; offset.x = offset.y = offset.z = 0; },
    // snapshot: rebuild from host copy, replay unacked inputs; visual offset hides the jump
    reconcile(hostBean, ack, hostTick, course, log) {
      const was = pred && { x: pred.x, y: pred.y, z: pred.z, tick };
      pred = { ...hostBean, ...log.at(log.seq) };
      const acked = log.at(ack);
      // presses up to ack are already in host state; before any ack, treat first unacked counters as baseline
      const base = acked ?? log.at(ack + 1) ?? pred;
      pred.lastJump = base.jumpSeq; pred.lastDive = base.diveSeq;
      tick = hostTick;
      for (let s = ack + 1; s <= log.seq; s++) advance(log.at(s), course);
      if (was && was.tick === tick) { offset.x += was.x - pred.x; offset.y += was.y - pred.y; offset.z += was.z - pred.z; }
      return was ? Math.hypot(was.x - pred.x, was.y - pred.y, was.z - pred.z) : 0;
    },
    // local tick: apply this tick's input at once (no round trip wait)
    stepLocal(input, course) { if (pred) advance(input, course); },
    // render: correction offset fades out over ~0.15 s
    decay(dt) { const k = Math.exp(-dt * 12); offset.x *= k; offset.y *= k; offset.z *= k; },
  };
  function advance(input, course) {
    if (!input) return;
    tick++;
    Object.assign(pred, input);
    course.update(tick * DT);
    step(pred, course);
  }
}
