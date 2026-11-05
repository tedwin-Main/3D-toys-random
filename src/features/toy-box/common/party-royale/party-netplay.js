// Connects a party royale round to the room: server host input queues + snapshots, guest mirror + own-bean prediction.

import { DT } from './course-colliders.js';
import { stepBean } from './bean-physics.js';
import { ACTIVE } from './round-sim.js';
import { packSnapshot, createSnapshotWriter, createSnapshotReader, createMirror, applySnapshot, snapEvery, snapBytesEstimate } from './round-snapshot.js';
import { createInputLog, createInputQueue, createPredictor, inputEvery, unwrapAck, leadShiftMs } from './input-sync.js';
import { SERVER_PEER } from '../relay-wire.js';

/**
 * Host (relay server) > per round: guest inputs land in jitter queues (tagged by round key so stale bundles are dropped),
 * snapshots (binary, rate from the free-tier budgets in snapEvery) carry acks so each guest can reconcile.
 * room.players = humans only (every one a guest); the relay delivers in order, so no snapshot is ever lost.
 */
export function createHostNet(room) {
  const queues = new Map();
  // queue depth (ticks) before each guest take, ms the taken input waited, takes that found the queue empty (relay-stats reads + resets these)
  const stats = { depths: [], waits: [], starves: 0 };
  const writer = createSnapshotWriter();
  let roundKey = null, avgBytes = 0;
  return {
    stats,
    begin(key) { roundKey = key; queues.clear(); writer.reset(); avgBytes = 0; },
    onInput(from, msg) {
      if (msg.rk !== roundKey) return;
      if (!queues.has(from)) queues.set(from, createInputQueue());
      queues.get(from).push(msg);
    },
    // guest beans take one queued input per tick (host bean and bots set their own)
    applyInputs(sim) {
      for (const [id, q] of queues) {
        const b = sim.beans.get(id);
        if (b?.status !== ACTIVE || b.bot) continue;
        recordDepth(stats, q.depth);
        Object.assign(b, q.take());
        if (q.lastWaitMs != null && stats.waits.length < STATS_CAP) stats.waits.push(q.lastWaitMs);
        const lead = q.takeLead();
        if (lead) room.send({ g: 'lead', rk: roundKey, ...lead }, { to: id });
      }
    },
    // returns true when a snapshot went out (caller then plays + clears sim.events)
    sendSnapshot(sim) {
      const every = snapEvery({ bytes: avgBytes || snapBytesEstimate(sim.list.length), guests: room.players.length });
      if (sim.tick % every !== 0 && sim.phase !== 'end') return false;
      const bytes = writer.write(packSnapshot(sim, (id) => queues.get(id)?.ack ?? 0, roundKey));
      room.send(bytes);
      // key frames every 0.5 s between small deltas: rate follows the running average size
      avgBytes = avgBytes ? avgBytes * (1 - BYTES_EMA) + bytes.length * BYTES_EMA : bytes.length;
      return true;
    },
  };
}

const STATS_CAP = 20000;
const BYTES_EMA = 0.1;
function recordDepth(stats, depth) {
  if (stats.depths.length < STATS_CAP) stats.depths.push(depth);
  if (depth === 0) stats.starves++;
}

/**
 * Guest > per round: mirror sim built from the round message, snapshots applied onto it (stale ones skipped),
 * own bean predicted from local input (round.predict runs too, e.g. gates burst locally).
 * Input bundles go to the server host at the inputEvery cadence for the room size.
 */
export function createGuestRound(room, msg, round) {
  const mirror = createMirror(round, msg.seed, msg.keep, msg.R);
  const reader = createSnapshotReader(mirror.list.map((b) => b.id));
  const log = createInputLog();
  const pred = createPredictor({ step: (b, course) => { stepBean(b, course); round.predict?.(course, b); } });
  const stats = { snapshots: 0, corrections: [], confirmMs: [] };
  let mine = null, tickNo = 0, lastK = -1;
  return {
    mirror, pred, stats, key: msg.rk,
    get me() { return mine?.bean ?? null; },
    get predicting() { return !!pred.bean; },
    // binary frame from the server > snapshot, or null until this round's first key frame
    read: (bytes) => reader.read(bytes),
    // render clock: predicted tick while my bean runs ahead, else last host tick
    get clock() { return pred.bean ? pred.predictedTick * DT : mirror.clock; },
    // returns this snapshot's events to play, or null if skipped
    onSnapshot(s) {
      if (s.rk !== msg.rk || s.k <= lastK) return null;
      const events = s.ev;
      lastK = s.k;
      stats.snapshots++;
      mine = applySnapshot(mirror, s, room.me);
      const live = mine && mirror.phase === 'play' && mine.bean.status === ACTIVE;
      if (!live) { pred.reset(); return events; }
      const ack = unwrapAck(mine.ack, log.seq);
      const err = pred.reconcile(mine.bean, ack, s.k, mirror.course, log);
      const confirm = log.confirm(ack);
      if (stats.corrections.length < 2000) stats.corrections.push(err);
      if (confirm != null && stats.confirmMs.length < 2000) stats.confirmMs.push(confirm);
      return events;
    },
    // server lead report > ms to shift this guest's tick phase (0 for another round)
    leadShift(d) { return d.rk === msg.rk ? leadShiftMs(d) : 0; },
    // one 60 Hz tick of local input: log, predict, bundle to host every inputEvery ticks
    tick(input) {
      log.record(input);
      pred.stepLocal(input, mirror.course);
      if (++tickNo % inputEvery(room.players.length)) return;
      const bundle = log.flush();
      if (bundle) room.send({ ...bundle, rk: msg.rk }, { to: SERVER_PEER });
    },
  };
}
