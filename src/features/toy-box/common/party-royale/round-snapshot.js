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

// Binary snapshot: same rounded values as the JSON rows. Key frames ~50% under JSON; delta frames ~45% of a key frame.
// Header: [u8 version][u8 kind][u32 tick][u16 meta length][meta JSON: ph rk keep D ev], then
//   key:   [u16 skipped-column mask][rows: present columns only]; a column at its base value in every row is skipped
//   delta: [u32 base tick][per row: u16 changed-column mask + zigzag varint change per changed column] against the previous frame;
//          meta fields equal to the previous frame's (round data D, phase, ...) are left out
// The relay delivers every frame to every guest in order, so deltas chain on the frame before; a key frame every
// KEY_TICKS lets late joiners (and any reader that lost the chain) start. Rows follow sim.list order, which the guest
// mirror shares (built from the same roster), so ids are not sent. ack goes as its low 16 bits (unwrapAck).
const VERSION = 4, HEAD_BYTES = 8, KEY = 0, DELTA = 1;
const KEY_TICKS = 30; // 0.5 s
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
const COLS = FIELDS.length;
const ROW_BYTES = FIELDS.reduce((sum, f) => sum + f.size, 0);
// gnd rides as collider index + 1 in one byte (-1 = airborne); mt (0 up to 2.55 s; longest stumble 1.2 s) in one byte
export const MAX_COURSE_COLLIDERS = 255;
const wireValue = (f, v) => (f.index === ACK ? v & 0xffff : Math.max(f.min, Math.min(f.max, Math.round((v - f.base) * f.scale))));
// integer math first so 1 - 0.45 reads back as exactly 0.55
const readValue = (f, wire) => (wire + f.base * f.scale) / f.scale;
const isPresent = (mask, c) => (mask & (1 << c)) !== 0;

function toWire(rows) {
  const wire = new Int32Array(rows.length * COLS);
  for (let r = 0; r < rows.length; r++) for (let c = 0; c < COLS; c++) wire[r * COLS + c] = wireValue(FIELDS[c], rows[r][FIELDS[c].index]);
  return wire;
}

/** Host > snapshot frames for one round: a key frame first and every KEY_TICKS, deltas between. reset() at each new round. */
export function createSnapshotWriter() {
  let prev = null, prevK = 0, prevMeta = {}, keyK = -Infinity;
  return {
    reset() { prev = null; keyK = -Infinity; },
    write(snap) {
      const wire = toWire(snap.P), meta = metaJson(snap);
      const key = !prev || prev.length !== wire.length || snap.k - keyK >= KEY_TICKS;
      const changed = key ? meta : Object.fromEntries(Object.entries(meta).filter(([name, json]) => json !== prevMeta[name]));
      const bytes = key ? keyFrame(snap, wire, changed) : deltaFrame(snap, wire, prev, prevK, changed);
      if (key) keyK = snap.k;
      prev = wire; prevK = snap.k; prevMeta = meta;
      return bytes;
    },
  };
}

/** Guest > reads one round's frames; ids = mirror bean ids in list order. null until a key frame, or for a frame from another round. */
export function createSnapshotReader(ids) {
  let prev = null, prevK = -1, prevMeta = null;
  return {
    read(bytes) {
      const frame = readFrame(bytes, ids, prev, prevK);
      if (frame) frame.snap = { ...prevMeta, ...frame.snap };
      prev = frame?.wire ?? null; prevK = frame ? frame.snap.k : -1;
      prevMeta = frame && Object.fromEntries(META_FIELDS.map((name) => [name, frame.snap[name]]));
      return frame?.snap ?? null;
    },
  };
}

/** Host > one self-contained key frame (tests, tools) */
export const encodeSnapshot = (snap) => keyFrame(snap, toWire(snap.P), metaJson(snap));

/** Guest > a key frame back to the packSnapshot shape; null for a delta, another version or a row count unlike the mirror's */
export const decodeSnapshot = (bytes, ids) => readFrame(bytes, ids, null, -1)?.snap ?? null;

const META_FIELDS = ['ph', 'rk', 'keep', 'D', 'ev'];
// meta field > its JSON text (compared between frames, then joined into the frame's meta object)
const metaJson = (snap) => Object.fromEntries(META_FIELDS.map((name) => [name, JSON.stringify(snap[name] ?? null)]));

function header(snap, kind, bodyBytes, fields) {
  const meta = utf8.encode(`{${Object.entries(fields).map(([name, json]) => `"${name}":${json}`).join(',')}}`);
  const out = new Uint8Array(HEAD_BYTES + meta.length + bodyBytes);
  const view = new DataView(out.buffer);
  view.setUint8(0, VERSION); view.setUint8(1, kind); view.setUint32(2, snap.k); view.setUint16(6, meta.length);
  out.set(meta, HEAD_BYTES);
  return { out, view, at: HEAD_BYTES + meta.length };
}

function keyFrame(snap, wire, fields) {
  const rows = wire.length / COLS;
  let present = 0, stride = 0;
  for (let i = 0; i < wire.length; i++) if (wire[i] !== 0) present |= 1 << i % COLS;
  for (let c = 0; c < COLS; c++) if (isPresent(present, c)) stride += FIELDS[c].size;
  const { out, view, at: start } = header(snap, KEY, 2 + rows * stride, fields);
  view.setUint16(start, ~present & ((1 << COLS) - 1));
  let at = start + 2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < COLS; c++) {
      if (!isPresent(present, c)) continue;
      FIELDS[c].set.call(view, at, wire[r * COLS + c]);
      at += FIELDS[c].size;
    }
  }
  return out;
}

let deltaScratch = new Uint8Array(4096);
function deltaFrame(snap, wire, prev, prevK, fields) {
  if (deltaScratch.length < wire.length * 4 + 4) deltaScratch = new Uint8Array(wire.length * 4 + 4);
  const body = deltaScratch;
  let at = 4; // base tick written last
  for (let r = 0; r < wire.length / COLS; r++) {
    const maskAt = at;
    let mask = 0;
    at += 2;
    for (let c = 0; c < COLS; c++) {
      const d = wire[r * COLS + c] - prev[r * COLS + c];
      if (d === 0) continue;
      mask |= 1 << c;
      at = writeVarint(body, at, d >= 0 ? d * 2 : -d * 2 - 1);
    }
    body[maskAt] = mask >> 8; body[maskAt + 1] = mask & 0xff;
  }
  const { out, view, at: start } = header(snap, DELTA, at, fields);
  out.set(body.subarray(0, at), start);
  view.setUint32(start, prevK);
  return out;
}

function readFrame(bytes, ids, prev, prevK) {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (bytes.length < HEAD_BYTES || view.getUint8(0) !== VERSION) return null;
  const kind = view.getUint8(1), k = view.getUint32(2), metaEnd = HEAD_BYTES + view.getUint16(6);
  const wire = kind === KEY ? readKeyRows(view, metaEnd, ids.length) : kind === DELTA && prev ? readDeltaRows(bytes, view, metaEnd, prev, prevK) : null;
  if (!wire || wire.length !== ids.length * COLS) return null;
  const snap = { g: 's', k, ...JSON.parse(unutf8.decode(bytes.subarray(HEAD_BYTES, metaEnd))), P: new Array(ids.length) };
  for (let r = 0; r < ids.length; r++) {
    const row = new Array(COLS + 1);
    row[0] = ids[r];
    for (let c = 0; c < COLS; c++) row[FIELDS[c].index] = readValue(FIELDS[c], wire[r * COLS + c]);
    snap.P[r] = row;
  }
  return { snap, wire };
}

function readKeyRows(view, at, rows) {
  const present = ~view.getUint16(at);
  const columns = FIELDS.map((f, c) => c).filter((c) => isPresent(present, c));
  const stride = columns.reduce((sum, c) => sum + FIELDS[c].size, 0);
  if (view.byteLength - at - 2 !== rows * stride) return null;
  const wire = new Int32Array(rows * COLS);
  at += 2;
  for (let r = 0; r < rows; r++) {
    for (const c of columns) { wire[r * COLS + c] = FIELDS[c].get.call(view, at); at += FIELDS[c].size; }
  }
  return wire;
}

function readDeltaRows(bytes, view, at, prev, prevK) {
  if (view.getUint32(at) !== prevK) return null; // missed a frame: wait for the next key frame
  const wire = prev.slice();
  at += 4;
  for (let r = 0; r < prev.length / COLS; r++) {
    if (at + 2 > bytes.length) return null;
    const mask = (bytes[at] << 8) | bytes[at + 1];
    at += 2;
    for (let c = 0; c < COLS; c++) {
      if (!isPresent(mask, c)) continue;
      let z = 0, shift = 1, b;
      do { if (at >= bytes.length) return null; b = bytes[at++]; z += (b & 0x7f) * shift; shift *= 128; } while (b & 0x80);
      wire[r * COLS + c] += z % 2 ? -(z + 1) / 2 : z / 2;
    }
  }
  return at === bytes.length ? wire : null;
}

function writeVarint(buf, at, z) {
  while (z >= 0x80) { buf[at++] = (z & 0x7f) | 0x80; z = Math.floor(z / 128); }
  buf[at++] = z;
  return at;
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
