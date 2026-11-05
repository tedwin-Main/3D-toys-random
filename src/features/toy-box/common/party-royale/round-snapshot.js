// Packs host round state into slim snapshots and applies them to a guest mirror round.

import { createRoundSim, ACTIVE, QUALIFIED, OUT } from './round-sim.js';

const STATUS_BITS = { [ACTIVE]: 0, [QUALIFIED]: 2, [OUT]: 4 };
const f2 = (v) => Math.round(v * 100) / 100;
const f1 = (v) => Math.round(v * 10) / 10;

// Free-tier budgets per room. Relay egress: 400 KB/s ≈ 69 h of play a month on Render's 100 GB quota.
// Relay frames: 960/s (32-player worst case, Render CPU peak 0.035 of 0.15).
export const BUDGET = { relayBytes: 400e3, relayFrames: 960 };
const SNAP_TICKS = [1, 2, 3, 4]; // 60 / 30 / 20 / 15 Hz

/** ticks between snapshots to `guests` humans: the fastest rate inside both budgets (15 Hz floor) */
export function snapEvery({ bytes, guests }) {
  const fits = (ticks) => {
    const hz = 60 / ticks;
    return bytes * guests * hz <= BUDGET.relayBytes && guests * hz <= BUDGET.relayFrames;
  };
  return SNAP_TICKS.find(fits) ?? SNAP_TICKS.at(-1);
}

/** byte estimate before the first snapshot of a round */
// header + meta measured 70-80 B mid-round (capacity-test)
export const snapBytesEstimate = (beanCount) => 80 + beanCount * ROW_BYTES;

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

// Binary snapshot: same rounded values as the JSON rows, ~50% fewer bytes (32 beans fit one ~0.7 KB packet)
// [u8 version][u32 tick][u16 meta length][u16 skipped-column mask][meta JSON: ph rk keep D ev][rows: present columns only]
// Rows follow sim.list order, which the guest mirror shares (built from the same roster), so ids are not sent.
// A column at its base value in every row (no extra data this round, nobody slowed, ...) is skipped for the whole snapshot.
// ack goes as its low 16 bits (18 min of ticks); the guest unwraps it against its own input seq (unwrapAck).
const VERSION = 3, HEAD_BYTES = 9;
const utf8 = new TextEncoder(), unutf8 = new TextDecoder();
const ACK = 12;
// DataView accessors per wire type, looked up once instead of by name per field per row
const WIRE_TYPES = {
  Int8: { size: 1, min: -128, max: 127, set: DataView.prototype.setInt8, get: DataView.prototype.getInt8 },
  Uint8: { size: 1, min: 0, max: 255, set: DataView.prototype.setUint8, get: DataView.prototype.getUint8 },
  Int16: { size: 2, min: -32768, max: 32767, set: DataView.prototype.setInt16, get: DataView.prototype.getInt16 },
  Uint16: { size: 2, min: 0, max: 65535, set: DataView.prototype.setUint16, get: DataView.prototype.getUint16 },
};
// row column > packSnapshot row index, wire type, scale, base (wire value = (v - base) * scale). Index 0 (id) is implied.
const col = (index, type, scale, base = 0) => ({ index, scale, base, ...WIRE_TYPES[type] });
const FIELDS = [
  col(1, 'Int16', 100), col(2, 'Int16', 100), col(3, 'Int16', 100), col(4, 'Int16', 10), col(5, 'Int16', 10), col(6, 'Int16', 10),
  col(7, 'Int16', 100), col(8, 'Uint8', 1), col(9, 'Uint8', 100), col(10, 'Uint8', 1, -1), col(11, 'Uint8', 1), col(ACK, 'Uint16', 1),
  col(13, 'Int8', 100, 1), col(14, 'Uint8', 1),
];
const ROW_BYTES = FIELDS.reduce((sum, f) => sum + f.size, 0);
// gnd rides as collider index + 1 in one byte (-1 = airborne); mt (0 up to 2.55 s; longest stumble 1.2 s) in one byte
export const MAX_COURSE_COLLIDERS = 255;
const wireValue = (f, v) => (f.index === ACK ? v & 0xffff : Math.max(f.min, Math.min(f.max, Math.round((v - f.base) * f.scale))));
// integer math first so 1 - 0.45 reads back as exactly 0.55
const readValue = (f, wire) => (wire + f.base * f.scale) / f.scale;
const isPresent = (mask, c) => (mask & (1 << c)) !== 0;
let wireScratch = new Int32Array(32 * FIELDS.length);

/** Host > packSnapshot result as bytes for the wire */
export function encodeSnapshot(snap) {
  const meta = utf8.encode(JSON.stringify({ ph: snap.ph, rk: snap.rk, keep: snap.keep, D: snap.D, ev: snap.ev }));
  const rows = snap.P, cols = FIELDS.length;
  if (wireScratch.length < rows.length * cols) wireScratch = new Int32Array(rows.length * cols);
  const wire = wireScratch;
  let present = 0, stride = 0;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols; c++) {
      const v = (wire[r * cols + c] = wireValue(FIELDS[c], rows[r][FIELDS[c].index]));
      if (v !== 0) present |= 1 << c;
    }
  }
  for (let c = 0; c < cols; c++) if (isPresent(present, c)) stride += FIELDS[c].size;
  const out = new Uint8Array(HEAD_BYTES + meta.length + rows.length * stride);
  const view = new DataView(out.buffer);
  view.setUint8(0, VERSION); view.setUint32(1, snap.k); view.setUint16(5, meta.length);
  view.setUint16(7, ~present & ((1 << cols) - 1));
  out.set(meta, HEAD_BYTES);
  let at = HEAD_BYTES + meta.length;
  for (let r = 0; r < rows.length; r++) {
    for (let c = 0; c < cols; c++) {
      if (!isPresent(present, c)) continue;
      FIELDS[c].set.call(view, at, wire[r * cols + c]);
      at += FIELDS[c].size;
    }
  }
  return out;
}

/**
 * Guest > bytes back to the packSnapshot shape ({ g: 's', k, P rows, ... }); ids = mirror bean ids in list order.
 * null for another wire version or a row count that does not match the mirror (snapshot from another round).
 */
export function decodeSnapshot(bytes, ids) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (view.getUint8(0) !== VERSION) return null;
  const metaLen = view.getUint16(5), present = ~view.getUint16(7), rowsAt = HEAD_BYTES + metaLen;
  const columns = FIELDS.filter((_, c) => isPresent(present, c));
  const stride = columns.reduce((sum, f) => sum + f.size, 0);
  if (bytes.length - rowsAt !== ids.length * stride) return null;
  const snap = { g: 's', k: view.getUint32(1), ...JSON.parse(unutf8.decode(bytes.subarray(HEAD_BYTES, rowsAt))), P: new Array(ids.length) };
  let at = rowsAt;
  for (let r = 0; r < ids.length; r++) {
    const row = new Array(FIELDS.length + 1);
    row[0] = ids[r];
    for (const f of FIELDS) row[f.index] = f.base;
    for (const f of columns) { row[f.index] = readValue(f, f.get.call(view, at)); at += f.size; }
    snap.P[r] = row;
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
