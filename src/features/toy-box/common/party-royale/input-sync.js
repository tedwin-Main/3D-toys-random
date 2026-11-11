// Syncs guest inputs to host by tick sequence and predicts own bean with replay reconciliation.

import { DT } from './course-colliders.js';
import { stepBean } from './bean-physics.js';

export { inputEvery } from '../server-run/relay-budget.js';
const HISTORY = 300;
// drain window 0.2 s: a jitter spike's backlog leaves within ~0.4 s (0.5 s windows held it ~1 s; simulated Render-like link: mean wait 12.8 > 8.8 ms)
const QUEUE_PRIME = 2, QUEUE_MAX = 12, DRAIN_WINDOW = 12, STANDING_PCT = 0.1;
// input arrival phase: aim for the earliest 5% of inputs to land ~3 ms before the next server tick. Late ones stay rare,
// so a standing extra input shows in the depth percentile and gets drained: inputs then wait about their lead, not a whole tick more.
const STEP_MS = DT * 1000;
const LEAD_WINDOW = 60, LEAD_LOW_PCT = 0.05, LEAD_TARGET_MS = 3, LEAD_GAIN = 0.5, LEAD_STEP_MAX_MS = 4, LEAD_STARVE_PCT = 3, LEAD_BACK_MS = 2;
// ms an arrival lands before the next tick; arrivals in the last quarter tick count as late (negative) ones
const arrivalLead = (nextTickAt, at) => {
  const ahead = (((nextTickAt - at) % STEP_MS) + STEP_MS) % STEP_MS;
  return ahead > STEP_MS * 0.75 ? ahead - STEP_MS : ahead;
};

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
 * Primes 2 deep. Each 0.2 s window records the depth before every take; the depth it almost never drops below
 * (10th percentile, so one late burst does not count) is pure lag, and the next window drains it
 * by skipping to newer inputs (press counters are cumulative: no jump or dive lost).
 */
export function createInputQueue({ now = () => performance.now() } = {}) {
  const q = [];
  let lastQueued = 0, ack = 0, primed = false, cur = unpackInput([0, 0, 0, 0, 0]), lastWaitMs = null;
  const depths = [], leads = [];
  let drain = 0, takes = 0, starves = 0, lead = null, lastTakeAt = null;
  return {
    get ack() { return ack; },
    get depth() { return q.length; },
    // ms the input taken last sat in the queue (null when the take found it empty)
    get lastWaitMs() { return lastWaitMs; },
    // once per window: { lowMs, starvePct } = how early this guest's inputs land before the server tick, for its phase shift (then cleared)
    takeLead() { const out = lead; lead = null; return out; },
    push({ s, I }) {
      const at = now();
      if (lastTakeAt != null) leads.push(arrivalLead(lastTakeAt + STEP_MS, at));
      I.forEach((p, k) => { const seq = s + k; if (seq > lastQueued) { q.push([seq, p, at]); lastQueued = seq; } });
    },
    take() {
      if (!primed && q.length < QUEUE_PRIME) return cur;
      primed = true;
      trackStanding();
      if (q.length > QUEUE_MAX) q.splice(0, q.length - QUEUE_PRIME);
      if (drain > 0 && q.length > 1) { q.shift(); drain--; }
      const next = q.shift();
      lastTakeAt = now();
      lastWaitMs = next ? lastTakeAt - next[2] : null;
      trackLead();
      if (next) { ack = next[0]; cur = unpackInput(next[1]); }
      return cur;
    },
  };
  function trackLead() {
    takes++;
    if (lastWaitMs == null) starves++;
    if (takes < LEAD_WINDOW) return;
    leads.sort((a, b) => a - b);
    if (leads.length) lead = { lowMs: Math.round(leads[Math.floor(leads.length * LEAD_LOW_PCT)] * 10) / 10, starvePct: Math.round((100 * starves) / takes) };
    leads.length = 0; takes = 0; starves = 0;
  }
  function trackStanding() {
    depths.push(q.length);
    if (depths.length < DRAIN_WINDOW) return;
    depths.sort((a, b) => a - b);
    drain = Math.max(0, depths[Math.floor(DRAIN_WINDOW * STANDING_PCT)] - 1);
    depths.length = 0;
  }
}

/**
 * Guest > ms to move its tick phase after a server lead report: later while inputs land early, earlier when they land late or starve.
 * Damped and capped per report so network jitter does not swing the phase.
 */
export function leadShiftMs({ lowMs, starvePct }) {
  if (starvePct > LEAD_STARVE_PCT) return -LEAD_BACK_MS;
  return Math.max(-LEAD_STEP_MAX_MS, Math.min(LEAD_STEP_MAX_MS, (lowMs - LEAD_TARGET_MS) * LEAD_GAIN));
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
