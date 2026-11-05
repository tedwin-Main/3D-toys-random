// Connects a party royale round to the room: host input queues + snapshots, guest mirror + own-bean prediction.

import { DT } from './course-colliders.js';
import { stepBean } from './bean-physics.js';
import { ACTIVE } from './round-sim.js';
import { packSnapshot, encodeSnapshot, createMirror, applySnapshot, snapEvery, snapBytesEstimate } from './round-snapshot.js';
import { createInputLog, createInputQueue, createPredictor, inputEvery, RESEND_UNACKED } from './input-sync.js';

const guestsIn = (room) => Math.max(1, room.players.length - 1);

// guests split by path: direct link or relay
function guestLinks(room) {
  const others = room.players.filter((p) => p.id !== room.me);
  const directGuests = others.filter((p) => room.isDirect(p.id)).length;
  return { directGuests, relayGuests: others.length - directGuests };
}

/**
 * Host > per round: guest inputs land in jitter queues (tagged by round key so stale bundles are dropped),
 * snapshots (binary, rate from the free-tier budgets in snapEvery) carry acks so each guest can reconcile.
 * Snapshots go fast (direct link where open, lossy): each repeats the previous one's events so a dropped packet loses no banner or sound.
 */
export function createHostNet(room) {
  const queues = new Map();
  let roundKey = null, prev = null, lastBytes = 0;
  return {
    begin(key) { roundKey = key; queues.clear(); prev = null; lastBytes = 0; },
    onInput(from, msg) {
      if (msg.rk !== roundKey) return;
      if (!queues.has(from)) queues.set(from, createInputQueue());
      queues.get(from).push(msg);
    },
    // guest beans take one queued input per tick (host bean and bots set their own)
    applyInputs(sim) {
      for (const [id, q] of queues) {
        const b = sim.beans.get(id);
        if (b?.status === ACTIVE && !b.bot) Object.assign(b, q.take());
      }
    },
    // returns true when a snapshot went out (caller then plays + clears sim.events)
    sendSnapshot(sim) {
      const every = snapEvery({ bytes: lastBytes || snapBytesEstimate(sim.list.length), ...guestLinks(room) });
      if (sim.tick % every !== 0 && sim.phase !== 'end') return false;
      const snap = packSnapshot(sim, (id) => queues.get(id)?.ack ?? 0, roundKey);
      if (prev?.ev.length) Object.assign(snap, { pk: prev.k, pev: prev.ev });
      const bytes = encodeSnapshot(snap);
      room.send(bytes, { fast: true });
      prev = snap; lastBytes = bytes.length;
      return true;
    },
  };
}

/**
 * Guest > per round: mirror sim built from the round message, snapshots applied onto it (stale or reordered ones skipped),
 * own bean predicted from local input (round.predict runs too, e.g. gates burst locally).
 * Inputs go fast: every tick with the unacked tail repeated on a direct link, relay cadence by room size otherwise.
 */
export function createGuestRound(room, msg, round) {
  const mirror = createMirror(round, msg.seed, msg.keep, msg.R);
  const log = createInputLog();
  const pred = createPredictor({ step: (b, course) => { stepBean(b, course); round.predict?.(course, b); } });
  const stats = { snapshots: 0, corrections: [], confirmMs: [] };
  let mine = null, tickNo = 0, lastK = -1;
  return {
    mirror, pred, stats, key: msg.rk,
    get me() { return mine?.bean ?? null; },
    get predicting() { return !!pred.bean; },
    // render clock: predicted tick while my bean runs ahead, else last host tick
    get clock() { return pred.bean ? pred.predictedTick * DT : mirror.clock; },
    // returns events to play (this snapshot's, plus the previous one's if that packet never came), or null if skipped
    onSnapshot(s) {
      if (s.rk !== msg.rk || s.k <= lastK) return null;
      const events = s.pk > lastK ? [...s.pev, ...s.ev] : s.ev;
      lastK = s.k;
      stats.snapshots++;
      mine = applySnapshot(mirror, s, room.me);
      const live = mine && mirror.phase === 'play' && mine.bean.status === ACTIVE;
      if (!live) { pred.reset(); return events; }
      const err = pred.reconcile(mine.bean, mine.ack, s.k, mirror.course, log);
      const confirm = log.confirm(mine.ack);
      if (stats.corrections.length < 2000) stats.corrections.push(err);
      if (confirm != null && stats.confirmMs.length < 2000) stats.confirmMs.push(confirm);
      return events;
    },
    // one 60 Hz tick of local input: log, predict, bundle to host every inputEvery ticks
    tick(input) {
      log.record(input);
      pred.stepLocal(input, mirror.course);
      const fast = room.isDirect(room.host);
      if (++tickNo % inputEvery({ fast, guests: guestsIn(room) })) return;
      const bundle = log.flush({ resend: fast ? RESEND_UNACKED : 0 });
      if (bundle) room.toHost({ ...bundle, rk: msg.rk }, { fast: true });
    },
  };
}
