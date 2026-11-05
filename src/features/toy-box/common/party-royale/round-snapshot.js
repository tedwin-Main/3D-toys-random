// Packs host round state into slim snapshots and applies them to a guest mirror round.

import { createRoundSim, ACTIVE, QUALIFIED, OUT } from './round-sim.js';

const STATUS_BITS = { [ACTIVE]: 0, [QUALIFIED]: 2, [OUT]: 4 };
const f2 = (v) => Math.round(v * 100) / 100;
const f1 = (v) => Math.round(v * 10) / 10;

// Free-tier budgets per room. Relay egress: 400 KB/s ≈ 69 h of play a month on Render's 100 GB quota.
// Relay frames: 960/s (32-player worst case, Render CPU peak 0.035 of 0.15). Host upload: 500 KB/s (4 Mbit/s).
export const BUDGET = { relayBytes: 400e3, relayFrames: 960, hostBytes: 500e3 };
const SNAP_TICKS = [1, 2, 3, 4]; // 60 / 30 / 20 / 15 Hz

/** ticks between snapshots: the fastest rate that keeps every budget (15 Hz floor) */
export function snapEvery({ bytes, relayGuests, directGuests }) {
  const hostCopies = directGuests + (relayGuests > 0 ? 1 : 0);
  const fits = (ticks) => {
    const hz = 60 / ticks;
    return bytes * relayGuests * hz <= BUDGET.relayBytes && relayGuests * hz <= BUDGET.relayFrames && bytes * hostCopies * hz <= BUDGET.hostBytes;
  };
  return SNAP_TICKS.find(fits) ?? SNAP_TICKS.at(-1);
}

/** byte estimate before the first snapshot of a round */
export const snapBytesEstimate = (beanCount) => 120 + beanCount * ROW_BYTES;

// Host > snapshot: row per bean [id, x, y, z, vx, vy, vz, face, mode, mt, gnd, flags, ack, slow, extra]
export function packSnapshot(sim, ackOf, roundKey) {
  const { round } = sim;
  return {
    g: 's', k: sim.tick, ph: sim.phase, rk: roundKey, keep: sim.keep,
    P: sim.list.map((b) => [b.id, f2(b.x), f2(b.y), f2(b.z), f1(b.vx), f1(b.vy), f1(b.vz), f2(b.face), b.mode, f2(b.mt), b.gnd,
      (b.bot ? 1 : 0) | STATUS_BITS[b.status] | (b.holding != null ? 8 : 0), ackOf(b.id), f2(b.slow), round.packBean?.(b) ?? 0]),
    D: round.pack?.(sim) ?? null,
    ev: sim.events,
  };
}

// Binary snapshot: same rounded values as the JSON rows, ~40% fewer bytes (32 beans fit one ~1.2 KB packet)
// [u8 version][u32 tick][u16 meta length][meta JSON: ph rk keep D ev pk pev][rows: ROW_BYTES each]
const VERSION = 1, HEAD_BYTES = 7, ROW_BYTES = 32;
const utf8 = new TextEncoder(), unutf8 = new TextDecoder();
// row field > [DataView type, bytes, scale]. Order matches packSnapshot rows.
const FIELDS = [
  ['Int32', 4, 1], ['Int16', 2, 100], ['Int16', 2, 100], ['Int16', 2, 100], ['Int16', 2, 10], ['Int16', 2, 10], ['Int16', 2, 10],
  ['Int16', 2, 100], ['Uint8', 1, 1], ['Int16', 2, 100], ['Int16', 2, 1], ['Uint8', 1, 1], ['Uint32', 4, 1], ['Int16', 2, 100], ['Int16', 2, 1],
];
const RANGE = { Int32: [-(2 ** 31), 2 ** 31 - 1], Int16: [-32768, 32767], Uint8: [0, 255], Uint32: [0, 2 ** 32 - 1] };
const clampTo = (type, v) => Math.max(RANGE[type][0], Math.min(RANGE[type][1], Math.round(v)));

/** Host > packSnapshot result as bytes for the wire */
export function encodeSnapshot(snap) {
  const meta = utf8.encode(JSON.stringify({ ph: snap.ph, rk: snap.rk, keep: snap.keep, D: snap.D, ev: snap.ev, pk: snap.pk, pev: snap.pev }));
  const out = new Uint8Array(HEAD_BYTES + meta.length + snap.P.length * ROW_BYTES);
  const view = new DataView(out.buffer);
  view.setUint8(0, VERSION); view.setUint32(1, snap.k); view.setUint16(5, meta.length);
  out.set(meta, HEAD_BYTES);
  let at = HEAD_BYTES + meta.length;
  for (const row of snap.P) {
    FIELDS.forEach(([type, size, scale], i) => { view[`set${type}`](at, clampTo(type, row[i] * scale)); at += size; });
  }
  return out;
}

/** Guest > bytes back to the packSnapshot shape ({ g: 's', k, P rows, ... }) */
export function decodeSnapshot(bytes) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const metaLen = view.getUint16(5), rowsAt = HEAD_BYTES + metaLen;
  const snap = { g: 's', k: view.getUint32(1), ...JSON.parse(unutf8.decode(bytes.subarray(HEAD_BYTES, rowsAt))), P: [] };
  for (let at = rowsAt; at + ROW_BYTES <= bytes.length;) {
    snap.P.push(FIELDS.map(([type, size, scale]) => { const v = view[`get${type}`](at) / scale; at += size; return v; }));
  }
  return snap;
}

const statusOf = (flags) => (flags & 4 ? OUT : flags & 2 ? QUALIFIED : ACTIVE);

// Guest > mirror: same round + seed builds the same course; beans come from rows
export function createMirror(round, seed, keep, names) {
  const roster = names.map(([id, nick, color, bot]) => ({ id, nick, color, bot }));
  return createRoundSim({ round, seed, roster, keep });
}

// Guest > apply rows onto mirror beans (positions, status, round extras); returns my row or null
export function applySnapshot(mirror, s, me) {
  mirror.tick = s.k; mirror.clock = s.k * (1 / 60); mirror.phase = s.ph;
  let mine = null;
  for (const row of s.P) {
    const b = mirror.beans.get(row[0]);
    if (!b) continue;
    readRow(b, row);
    mirror.round.unpackBean?.(b, row[14]);
    if (row[0] === me) mine = { bean: b, ack: row[12] };
  }
  if (s.D != null) mirror.round.unpack?.(mirror, s.D);
  return mine;
}

function readRow(b, [, x, y, z, vx, vy, vz, face, mode, mt, gnd, flags, , slow]) {
  Object.assign(b, { x, y, z, vx, vy, vz, face, mode, mt, gnd, slow, status: statusOf(flags), grabbing: !!(flags & 8) });
}

// host migration: promoted guest turns its mirror into the live sim (bots keep running, inputs restart)
export function adoptMirror(mirror) {
  mirror.qualified = mirror.list.filter((b) => b.status === QUALIFIED).map((b) => b.id);
  mirror.out = mirror.list.filter((b) => b.status === OUT).map((b) => b.id);
  mirror.events.length = 0;
  return mirror;
}
