// Tests relay seat caps and data frames: routing, sender id set by relay, shared frame buffer, sticky replay.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore, MAX_SEATS } from './room-relay-core.js';
import { encodeSend, decodeFrame } from '../toy-box/common/relay-wire.js';

function fakeConn(core) {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeOrBad(String(frame))), close() {}, isOpen: () => true });
  return { conn, inbox, last: (t) => inbox.filter((m) => m.t === t).at(-1) };
}

// clients drop frames whose payload is not JSON; keep a marker so tests can see them
function decodeOrBad(frame) {
  try { return decodeFrame(frame); } catch { return { t: 'bad', frame }; }
}

function fill(core, game, cap, count) {
  const host = fakeConn(core);
  core.message(host.conn, JSON.stringify({ t: 'join', game, nick: 'host', cap }));
  const code = host.last('joined').room, all = [host];
  for (let i = 1; i < count; i++) {
    const p = fakeConn(core);
    core.message(p.conn, JSON.stringify({ t: 'join', game, nick: `p${i}`, room: code, cap: 99 }));
    all.push(p);
  }
  return all;
}

test('room without cap seats 14, the 15th join is refused', () => {
  const all = fill(createRelayCore(), 'sumo', undefined, 15);
  assert.equal(all.filter((p) => p.last('joined')).length, 14);
  assert.equal(all[14].last('error').message, 'Room is full.');
});

test('party royale room seats 32 with distinct colours; 33rd refused; joiner cap cannot raise it', () => {
  const all = fill(createRelayCore(), 'bean-royale-show', 32, 33);
  const seated = all.filter((p) => p.last('joined'));
  assert.equal(seated.length, MAX_SEATS);
  assert.equal(new Set(seated.map((p) => p.last('joined').color)).size, 32);
  assert.equal(all[32].last('error').message, 'Room is full.');
});

test('cap above the relay ceiling clamps to 32', () => {
  const all = fill(createRelayCore(), 'bean-royale-show', 500, 34);
  assert.equal(all.filter((p) => p.last('joined')).length, 32);
});

function room(n) {
  const core = createRelayCore();
  const all = fill(core, 'bean-royale-show', 32, n);
  const send = (p, data, opts) => core.message(p.conn, encodeSend(JSON.stringify(data), opts));
  return { core, all, send };
}
const datas = (p) => p.inbox.filter((m) => m.t === 'data');

test('data frames reach everyone else, a listed peer set, or one peer; from is set by the relay', () => {
  const { all: [host, a, b, c], send } = room(4);
  send(host, { g: 's', k: 1 });
  assert.deepEqual([a, b, c].map((p) => datas(p).at(-1)), Array(3).fill({ t: 'data', from: host.last('joined').id, data: { g: 's', k: 1 } }));
  assert.equal(datas(host).length, 0, 'sender never gets its own frame');
  send(host, { g: 's', k: 2 }, { to: [a.last('joined').id, c.last('joined').id, a.last('joined').id] });
  assert.deepEqual([a, b, c].map((p) => datas(p).length), [2, 1, 2], 'list send, duplicates ignored');
  send(a, { g: 'i' }, { to: host.last('joined').id });
  assert.equal(datas(host).at(-1).from, a.last('joined').id);
});

test('payload cannot spoof the sender id; malformed headers are dropped', () => {
  const { core, all: [host, a, b] } = room(3);
  const hostId = host.last('joined').id;
  // key injection in the payload: relay frame keeps a's id up front, the payload is bad JSON and gets dropped
  core.message(a.conn, `>|0|1,"from":${hostId}`);
  assert.equal(b.inbox.at(-1).frame, `<${a.last('joined').id}|1,"from":${hostId}`);
  assert.equal(datas(b).length, 0);
  for (const bad of [`>${hostId}x|0|{}`, '>|2|{}', '>nope', '>|0']) core.message(a.conn, bad);
  assert.equal(host.inbox.filter((m) => m.t === 'data' || m.t === 'bad').length, 1, 'only the injection frame got through, as bad JSON');
});

test('one frame buffer is shared by all receivers', () => {
  const core = createRelayCore(), frames = [];
  const join = (room) => {
    const conn = core.connect({ send: (f) => frames.push(f), close() {}, isOpen: () => true });
    core.message(conn, JSON.stringify({ t: 'join', game: 'g', nick: 'x', room, cap: 8 }));
    return conn;
  };
  const host = join('');
  const code = core.rooms.values().next().value.code;
  for (let i = 0; i < 5; i++) join(code);
  frames.length = 0;
  core.message(host, encodeSend('{"g":"s"}'));
  assert.equal(frames.length, 5);
  assert.ok(frames.every((f) => f === frames[0]));
});

test('sticky host payload replays to late joiners', () => {
  const { core, all: [host], send } = room(2);
  send(host, { g: 'r', id: 'sweep-bar' }, { sticky: true });
  const late = fakeConn(core);
  core.message(late.conn, JSON.stringify({ t: 'join', game: 'bean-royale-show', room: host.last('joined').room }));
  assert.deepEqual(datas(late).at(-1), { t: 'data', from: host.last('joined').id, data: { g: 'r', id: 'sweep-bar' } });
});
