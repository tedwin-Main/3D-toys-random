// Tests party royale netcode under Render-like lag: lagged guests must play as well as host-local bots.

import test from 'node:test';
import assert from 'node:assert/strict';
import { mulberry32 } from './course-colliders.js';
import { createRoundSim, ACTIVE } from './round-sim.js';
import { packSnapshot, encodeSnapshot, decodeSnapshot, createMirror, applySnapshot, snapEvery, snapBytesEstimate } from './round-snapshot.js';
import { createInputLog, createInputQueue, createPredictor, inputEvery, RESEND_UNACKED } from './input-sync.js';
import { botInput } from './bean-bots.js';
import sweepBar from './rounds/sweep-bar.js';
import spinnerGauntlet from './rounds/spinner-gauntlet.js';

const TICK_MS = 1000 / 60;

// Net > link with one-way delay + jitter: ordered = relay socket (TCP); lossy = direct data channel (unordered, drops `loss` share)
function createLink(rng, oneWayMs, jitterMs, { lossy = false, loss = 0 } = {}) {
  const q = [];
  let lastAt = 0;
  return {
    send(now, msg) {
      if (lossy && rng() < loss) return;
      const at = now + oneWayMs + rng() * jitterMs;
      lastAt = lossy ? at : Math.max(lastAt, at);
      q.push([lastAt, JSON.stringify(msg)]);
      if (lossy) q.sort((a, b) => a[0] - b[0]);
    },
    *due(now) { while (q.length && q[0][0] <= now) yield JSON.parse(q.shift()[1]); },
  };
}

// Guest > mirror + prediction; "player" = bot brain reading only what this guest can see
function createGuest(id, round, seed, keep, roster, { predict, rng, every, resend }) {
  const mirror = createMirror(round, seed, keep, roster.map((r) => [r.id, r.nick, r.color, r.bot]));
  const log = createInputLog(), pred = createPredictor();
  const local = { mx: 0, mz: 0, jumpSeq: 0, diveSeq: 0, grab: false };
  const view = { course: mirror.course, round, rng, beans: mirror.beans, get list() { return mirror.list; }, get active() { return mirror.list.filter((b) => b.status === ACTIVE); } };
  const corrections = [], confirms = [];
  let mine = null, lastAck = 0, lastK = -1;
  return {
    id, corrections, confirms,
    // tickNo = guest tick on arrival; input seq = guest tick, so tickNo - seq = press-to-confirm loop
    onSnapshot(s, tickNo) {
      if (s.k <= lastK) return;
      lastK = s.k;
      mine = applySnapshot(mirror, s, id);
      const live = mine && mirror.phase === 'play' && mine.bean.status === ACTIVE;
      // every input newly acked by this snapshot: pressed at tick seq, confirmed now
      if (!live) lastAck = mine?.ack ?? lastAck;
      else for (; lastAck < mine.ack; lastAck++) confirms.push((tickNo - lastAck - 1) * TICK_MS);
      if (!live || !predict) { pred.reset(); return; }
      const err = pred.reconcile(mine.bean, mine.ack, s.k, mirror.course, log);
      if (pred.bean) corrections.push(err);
    },
    // one guest tick: decide on predicted (or stale) self, log input, step prediction; returns bundle every `every` ticks
    tick(tickNo) {
      const self = predict ? pred.bean : mine?.bean && mirror.phase === 'play' && mine.bean.status === ACTIVE && { ...mine.bean };
      if (self) {
        if (!predict) mirror.course.update(mirror.clock);
        const j = self.jumpSeq, d = self.diveSeq;
        botInput(view, self);
        Object.assign(local, { mx: self.mx, mz: self.mz, grab: self.grab, jumpSeq: local.jumpSeq + (self.jumpSeq - j), diveSeq: local.diveSeq + (self.diveSeq - d) });
      } else Object.assign(local, { mx: 0, mz: 0, grab: false });
      log.record(local);
      if (predict) pred.stepLocal(local, mirror.course);
      return tickNo % every === 0 ? log.flush({ resend }) : null;
    },
  };
}

// Run a full round: host sim + lagged guests through links; returns host sim + guests
// direct = lossy data channel cadence (every tick + unacked resend); else relay cadence for the room size
function playLagged(round, { seed, players, guests, oneWayMs, jitterMs, predict = true, keep, direct = false, loss = 0 }) {
  const every = inputEvery({ fast: direct, guests }), resend = direct ? RESEND_UNACKED : 0;
  const rng = mulberry32(seed * 7 + 1);
  const roster = Array.from({ length: players }, (_, i) => ({ id: i + 1, nick: `p${i + 1}`, color: '#fff', bot: i >= guests }));
  const sim = createRoundSim({ round, seed, roster, keep });
  const gs = roster.slice(0, guests).map((r) => ({
    g: createGuest(r.id, round, seed, keep, roster, { predict, rng, every, resend }),
    up: createLink(rng, oneWayMs, jitterMs, { lossy: direct, loss }), down: createLink(rng, oneWayMs, jitterMs, { lossy: direct, loss }), q: createInputQueue(),
  }));
  const snapGap = snapEvery({ bytes: snapBytesEstimate(players), relayGuests: direct ? 0 : guests, directGuests: direct ? guests : 0 });
  for (let t = 1; sim.phase !== 'end' && t < 60 * 240; t++) {
    const now = t * TICK_MS;
    for (const x of gs) {
      for (const m of x.up.due(now)) x.q.push(m);
      const b = sim.beans.get(x.g.id), inp = x.q.take();
      if (b.status === ACTIVE) Object.assign(b, inp);
    }
    sim.step();
    if (sim.tick % snapGap === 0) {
      const s = decodeSnapshot(encodeSnapshot(packSnapshot(sim, (id) => gs.find((x) => x.g.id === id)?.q.ack ?? 0, 'k')), sim.list.map((b) => b.id)); // wire codec in the loop
      sim.events = [];
      for (const x of gs) x.down.send(now, s);
    }
    for (const x of gs) {
      for (const s of x.down.due(now)) x.g.onSnapshot(s, t);
      const bundle = x.g.tick(t);
      if (bundle) x.up.send(now, bundle);
    }
  }
  return { sim, guests: gs.map((x) => x.g) };
}

const mean = (a) => a.reduce((s, v) => s + v, 0) / Math.max(1, a.length);
const pct = (a, q) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))] ?? 0; };

// survival rank of the first `guests` roster slots (1 = first out, n = winner); guests = 0 gives the all-bot baseline for the same slots
function sweepRanks({ predict = true, guests = 5, seeds, oneWayMs = 125, jitterMs = 40, direct = false, loss = 0 }) {
  const ranks = [], corr = [];
  for (const seed of seeds) {
    const { sim, guests: gs } = playLagged(sweepBar, { seed, players: 14, guests, oneWayMs, jitterMs, predict, keep: 1, direct, loss });
    const order = new Map(sim.out.map((id, i) => [id, i + 1]));
    for (const b of sim.list) if (b.id <= 5) ranks.push(order.get(b.id) ?? sim.list.length);
    for (const g of gs) corr.push(...g.corrections);
  }
  return { rank: mean(ranks), corr };
}

const SEEDS = Array.from({ length: 48 }, (_, i) => 1000 + i * 7919);

test('sweep bar: guests at 125 ms one-way + 40 ms jitter survive like bots in the same slots', () => {
  const baseline = sweepRanks({ guests: 0, seeds: SEEDS });
  const lagged = sweepRanks({ seeds: SEEDS });
  const stale = sweepRanks({ predict: false, seeds: SEEDS });
  console.log(`  mean survival rank of slots 1-5 (7.5 = fair): all bots ${baseline.rank.toFixed(2)}, lagged guests ${lagged.rank.toFixed(2)}, lagged guests without prediction ${stale.rank.toFixed(2)}`);
  console.log(`  corrections p50 ${pct(lagged.corr, 0.5).toFixed(3)} p95 ${pct(lagged.corr, 0.95).toFixed(3)} max ${pct(lagged.corr, 1).toFixed(2)} units (n=${lagged.corr.length})`);
  // 96-seed run: lag costs 0.9 of 14 places, no prediction costs 3.7; 1.5 leaves room for sampling noise at 48 seeds
  assert.ok(lagged.rank >= baseline.rank - 1.5, 'lag costs under 1.5 places of 14');
  assert.ok(lagged.rank > stale.rank + 2, 'prediction clearly beats acting on stale snapshots');
  assert.ok(pct(lagged.corr, 0.5) < 0.05, 'typical correction tiny');
});

test('spinner gauntlet: lagged guests finish like host-local bots', () => {
  const guestQ = [], botQ = [];
  let corr = [];
  for (const seed of SEEDS.slice(0, 12)) {
    const { sim, guests } = playLagged(spinnerGauntlet, { seed, players: 14, guests: 5, oneWayMs: 125, jitterMs: 40, keep: 9 });
    sim.qualified.forEach((id, i) => (id <= 5 ? guestQ : botQ).push(i + 1));
    for (const b of sim.list) if (!sim.qualified.includes(b.id)) (b.id <= 5 ? guestQ : botQ).push(15);
    corr = corr.concat(...guests.map((g) => g.corrections));
  }
  console.log(`  finish place guests ${mean(guestQ).toFixed(2)} vs bots ${mean(botQ).toFixed(2)} (15 = eliminated); corrections p95 ${pct(corr, 0.95).toFixed(3)}`);
  assert.ok(mean(guestQ) <= mean(botQ) * 1.2);
});


// input confirm loop (press > host applies > ack back on guest). Relay = live Render SG numbers (28 ms one-way, 5 ms jitter).
// Old pipeline (3-tick bundles, 20 Hz snapshots, fixed 2-deep queue) measured p50 117 / p95 133 ms here; floor = network + 1 tick.
function confirmLoop(opts) {
  const confirms = [];
  for (const seed of SEEDS.slice(0, 8)) {
    const { guests } = playLagged(sweepBar, { seed, players: 14, guests: 5, keep: 1, ...opts });
    for (const g of guests) confirms.push(...g.confirms);
  }
  return { p50: pct(confirms, 0.5), p95: pct(confirms, 0.95) };
}

test('input confirm loop: relay at Render SG latency, and a direct link', () => {
  const relay = confirmLoop({ oneWayMs: 28, jitterMs: 5 });
  const direct = confirmLoop({ oneWayMs: 8, jitterMs: 4, direct: true, loss: 0.02 });
  console.log(`  confirm loop relay p50 ${relay.p50.toFixed(0)} / p95 ${relay.p95.toFixed(0)} ms (network 56-66); direct link 8 ms one-way, 2% loss: p50 ${direct.p50.toFixed(0)} / p95 ${direct.p95.toFixed(0)} ms`);
  const tick = 1000 / 60;
  assert.ok(relay.p50 <= 56 + tick && relay.p95 <= 66 + tick, 'relay: network round trip + at most 1 tick');
  assert.ok(direct.p50 <= 24 + tick, 'direct: peer round trip + at most 1 tick, even with 2% loss');
});

test('lossy direct link (5% loss, reordering): guests still survive like bots', () => {
  const seeds = SEEDS.slice(0, 24);
  const baseline = sweepRanks({ guests: 0, seeds });
  const lossy = sweepRanks({ seeds, oneWayMs: 40, jitterMs: 30, direct: true, loss: 0.05 });
  console.log(`  mean survival rank slots 1-5: bots ${baseline.rank.toFixed(2)}, guests on lossy direct link ${lossy.rank.toFixed(2)}; corrections p95 ${pct(lossy.corr, 0.95).toFixed(3)}`);
  assert.ok(lossy.rank >= baseline.rank - 1.5);
  assert.ok(pct(lossy.corr, 0.5) < 0.05);
});

test('jitter queue drains standing lag after a burst, without losing a press', () => {
  const q = createInputQueue();
  const input = (s) => [0.5, 0, s >= 8 ? 1 : 0, 0, 0]; // jump pressed at tick 8, inside the burst
  let seq = 0, ticks = 0;
  const pushTicks = (n) => { const s = seq + 1; seq += n; q.push({ s, I: Array.from({ length: n }, (_, k) => input(s + k)) }); };
  pushTicks(2);
  pushTicks(10); // burst: a stalled link delivers 10 ticks at once
  const depths = [];
  let jumped = false;
  for (; ticks < 120; ticks++) {
    pushTicks(1);
    const took = q.take();
    jumped ||= took.jumpSeq === 1;
    depths.push(q.depth);
  }
  assert.ok(depths.slice(-30).every((d) => d <= 2), `queue back to 2 deep within 1.5 s, got ${depths.slice(-30)}`);
  assert.ok(jumped, 'the jump pressed during the drain still lands');
  assert.equal(q.ack, seq - q.depth);
});
