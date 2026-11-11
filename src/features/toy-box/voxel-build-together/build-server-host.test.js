// Tests the Block Party plate the relay server keeps: edit order, credit, chunking, late joiner plate, lobby-host-only clear / load, fresh plate on restart.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from '../../multiplayer-rooms/room-relay-core.js';
import { hostedGames } from '../../multiplayer-rooms/hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../common/relay-wire.js';
import { MAX_BLOCKS, OPS_PER_MESSAGE } from './build-board.js';

function join(core, room = '') {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeFrame(String(frame))), close() {}, isOpen: () => true });
  core.message(conn, JSON.stringify({ t: 'join', game: 'block-party', nick: 'b', room, cap: 14 }));
  const joined = inbox.find((m) => m.t === 'joined');
  return { conn, inbox, id: joined.id, code: joined.room, data: (g) => inbox.filter((m) => m.t === 'data' && m.data.g === g).map((m) => m.data) };
}

function plate() {
  const core = createRelayCore({ hostedGames });
  const host = join(core), guest = join(core, host.code);
  let now = 0;
  const run = (ticks = 6) => { for (let i = 0; i < ticks; i++) core.tickHosted((now += 1000 / 60)); };
  const toServer = (p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));
  const sentOps = (p) => p.data('ops').flatMap((m) => m.o);
  toServer(host, { g: 'run' });
  return { core, host, guest, run, toServer, sentOps };
}

test('block-party: edits apply in arrival order and come back to everyone with author and new-block credit', () => {
  const { host, guest, run, toServer, sentOps } = plate();
  toServer(guest, { g: 'op', o: [[1, 0, 1, 4]] });
  toServer(host, { g: 'op', o: [[1, 0, 1, 7], [2, 0, 2, -1], [99, 0, 0, 3], [0, 0, 0, 'x']] });
  run();
  const ops = sentOps(host);
  assert.deepEqual(ops, [[1, 0, 1, 4, guest.id, 1], [1, 0, 1, 7, host.id, 0]], 'repaint is no new block; erase of empty, out of bounds and junk dropped');
  assert.deepEqual(sentOps(guest), ops, 'same order for every builder');
});

test('block-party: a late joiner asking hello gets the whole plate and builder counts', () => {
  const { core, host, run, toServer } = plate();
  toServer(host, { g: 'op', o: [[0, 0, 0, 1], [1, 0, 0, 2]] });
  run();
  const late = join(core, host.code);
  toServer(late, { g: 'hello' });
  const full = late.data('full').at(-1);
  assert.deepEqual(full.o, [0, 0, 0, 1, 1, 0, 0, 2]);
  assert.deepEqual(full.pl, [[host.id, 2]]);
});

test('block-party: big edits go out in 400-op chunks; the block cap holds', () => {
  const { host, run, toServer, sentOps } = plate();
  const fill = [];
  for (let y = 0; y < 30 && fill.length < MAX_BLOCKS + 50; y++) for (let z = 0; z < 40; z++) for (let x = 0; x < 40; x++) fill.push([x, y, z, 3]);
  for (let i = 0; i < fill.length; i += OPS_PER_MESSAGE) toServer(host, { g: 'op', o: fill.slice(i, i + OPS_PER_MESSAGE) });
  run();
  assert.ok(host.data('ops').every((m) => m.o.length <= OPS_PER_MESSAGE));
  assert.equal(sentOps(host).filter((op) => op[5] === 1).length, MAX_BLOCKS, 'credit stops at the cap');
});

test('block-party: only the lobby host clears or loads; a restart brings a fresh plate', () => {
  const { host, guest, run, toServer } = plate();
  toServer(host, { g: 'op', o: [[0, 0, 0, 1]] });
  toServer(guest, { g: 'clear' });
  toServer(guest, { g: 'load', o: [5, 5, 5, 5] });
  run();
  toServer(guest, { g: 'hello' });
  assert.deepEqual(guest.data('full').at(-1).o, [0, 0, 0, 1], 'guest clear / load ignored');
  toServer(host, { g: 'load', o: [5, 5, 5, 5, 6, 6, 6, 99] });
  assert.deepEqual(guest.data('full').at(-1).o, [5, 5, 5, 5], 'host load reaches everyone, bad color dropped');
  toServer(host, { g: 'clear' });
  assert.deepEqual(guest.data('full').at(-1).o, []);
  toServer(host, { g: 'op', o: [[1, 1, 1, 1]] });
  toServer(host, { g: 'stop' });
  toServer(host, { g: 'run' });
  assert.deepEqual(guest.data('full').at(-1), { g: 'full', o: [], pl: [] }, 'fresh plate on restart');
});
