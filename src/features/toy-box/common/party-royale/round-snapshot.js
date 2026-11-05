// Packs host round state into slim snapshots and applies them to a guest mirror round.

import { createRoundSim, ACTIVE, QUALIFIED, OUT } from './round-sim.js';

const STATUS_BITS = { [ACTIVE]: 0, [QUALIFIED]: 2, [OUT]: 4 };
const f2 = (v) => Math.round(v * 100) / 100;
const f1 = (v) => Math.round(v * 10) / 10;

// snapshot every N ticks by fan-out load (rows sent = beans × guests): 30 Hz small rooms, 20 Hz mid, 15 Hz at 32 × 31
export const snapEvery = (beanCount, guestCount) => {
  const rows = beanCount * guestCount;
  return rows <= 256 ? 2 : rows <= 512 ? 3 : 4;
};

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
