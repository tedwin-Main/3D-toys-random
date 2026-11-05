// Tests party royale rounds run by the relay itself: lobby-host control, sticky round frame, binary snapshots with acks, drops, match end.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from './room-relay-core.js';
import { hostedGames } from './hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';
import { decodeSnapshot } from '../toy-box/common/party-royale/round-snapshot.js';

const TICK_MS = 1000 / 60;
const OUT_FLAG = 4;

// player socket: text frames decoded, binary frames kept as { from, bytes }
function fakeConn(core) {
  const inbox = [];
  const send = (frame, binary) => {
    if (!binary) return inbox.push(decodeFrame(String(frame)));
    const bar = frame.indexOf('|'.charCodeAt(0));
    inbox.push({ t: 'snap', from: Number(frame.toString('latin1', 1, bar)), bytes: new Uint8Array(frame.subarray(bar + 1)) });
  };
  const conn = core.connect({ send, close() {}, isOpen: () => true });
  return { conn, inbox, data: (g) => inbox.filter((m) => m.t === 'data' && m.data.g === g), snaps: () => inbox.filter((m) => m.t === 'snap') };
}

function join(core, game, room = '') {
  const p = fakeConn(core);
  core.message(p.conn, JSON.stringify({ t: 'join', game, nick: 'p', room, cap: 32 }));
  p.id = p.inbox.find((m) => m.t === 'joined').id;
  p.code = p.inbox.find((m) => m.t === 'joined').room;
  return p;
}

const toServer = (core, p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));

function room(game) {
  const core = createRelayCore({ hostedGames });
  const host = join(core, game);
  const guests = [join(core, game, host.code), join(core, game, host.code)];
  let now = 0;
  const run = (ticks) => { for (let i = 0; i < ticks; i++) core.tickHosted((now += TICK_MS)); };
  return { core, host, guests, run };
}

// my row in the newest snapshot, decoded against the round message's roster order
function myRow(p) {
  const r = p.data('r').at(-1).data;
  const snap = decodeSnapshot(p.snaps().at(-1).bytes, r.R.map(([id]) => id));
  return snap && { snap, row: snap.P.find((row) => row[0] === p.id) };
}

test('only the lobby host starts the match; control frames never reach players', () => {
  const { core, host, guests, run } = room('sweep-bar');
  toServer(core, guests[0], { g: 'run', bots: 3 });
  run(10);
  assert.equal(host.data('r').length, 0, 'guest cannot start');
  toServer(core, host, { g: 'run', bots: 3 });
  run(1);
  for (const p of [host, ...guests]) {
    const r = p.data('r');
    assert.equal(r.length, 1);
    assert.equal(r[0].from, SERVER_PEER);
    assert.equal(r[0].data.R.length, 6, '3 humans + 3 bots');
    assert.ok(!p.data('run').length, 'control frame stays on the server');
  }
});

test('late joiner gets the running round at once; snapshots ack each guest input', () => {
  const { core, host, guests, run } = room('sweep-bar');
  toServer(core, host, { g: 'run', bots: 2 });
  run(1);
  const late = join(core, 'sweep-bar', host.code);
  assert.equal(late.inbox.find((m) => m.t === 'data')?.data.g, 'r', 'sticky round frame replayed on join');
  const rk = host.data('r')[0].data.rk;
  toServer(core, guests[0], { g: 'i', rk, s: 1, I: [[0.5, 0, 0, 0, 0], [0.5, 0, 0, 0, 0], [0.5, 0, 0, 0, 0]] });
  run(10);
  for (const p of [host, ...guests]) assert.ok(p.snaps().length >= 5, 'binary snapshots to every human');
  assert.ok(myRow(guests[0]).row[12] >= 1, 'guest input acked');
  assert.equal(myRow(guests[1]).row[12], 0, 'no input, no ack');
});

test('a guest who leaves mid-round is knocked out of it', () => {
  const { core, host, guests, run } = room('sweep-bar');
  toServer(core, host, { g: 'run', bots: 2 });
  run(60 * 5); // through the intro
  const gone = guests[1].id;
  core.close(guests[1].conn);
  run(5);
  const { snap } = myRow(host);
  const row = snap.P.find((r) => r[0] === gone);
  assert.ok(row[11] & OUT_FLAG, 'left player is out');
});

test('full show runs on the server to a champion, then tells the lobby host it is done', () => {
  const { core, host, run } = room('bean-royale-show');
  toServer(core, host, { g: 'run', bots: 5 });
  for (let t = 0; t < 60 * 60 * 20 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('champ').length, 1, 'one champion');
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(!core.rooms.values().next().value.server.running);
});
