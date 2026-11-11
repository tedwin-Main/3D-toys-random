// Tests turn-sync against a server-run match: server-only states, actions to the server, cleared state, match end, version restart on a new room.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTurnSync } from './turn-sync.js';
import { SERVER_PEER } from './relay-wire.js';

// fake room: deliver(data, from) fires data handlers, sent collects outgoing frames
function fakeRoom() {
  const handlers = [], sent = [];
  return {
    sent,
    on(type, fn) { if (type === 'data') handlers.push(fn); },
    deliver(data, from) { handlers.forEach((fn) => fn(data, from)); },
    send(data, opts) { sent.push({ data, opts }); },
  };
}

function setup() {
  const got = [];
  let doneCount = 0;
  const sync = createTurnSync({ onState: (s) => got.push(s), onDone: () => doneCount++ });
  const room = fakeRoom();
  sync.attach(room);
  return { got, sync, room, doneCount: () => doneCount };
}

test('states count only from the server; replayed versions are dropped', () => {
  const { got, room } = setup();
  room.deliver({ g: 'T', v: 1e9, s: 'spoof' }, 3);
  room.deliver({ g: 'T', v: 1, s: 'real' }, SERVER_PEER);
  room.deliver({ g: 'T', v: 1, s: 'dup' }, SERVER_PEER);
  assert.deepEqual(got, ['real']);
});

test('non-numeric version and lobby control frames are dropped', () => {
  const { got, room } = setup();
  room.deliver({ g: 'T', v: 'x', s: 'bad' }, SERVER_PEER);
  room.deliver({ _lobby: 'start', g: 'T', v: 1, s: 'lobby' }, SERVER_PEER);
  assert.deepEqual(got, []);
});

test('every action goes to the server with a rising seq', () => {
  const { sync, room } = setup();
  sync.act({ t: 'bank' });
  sync.act({ t: 'bank' });
  assert.deepEqual(room.sent, [
    { data: { g: 'A', q: 1, a: { t: 'bank' } }, opts: { to: SERVER_PEER } },
    { data: { g: 'A', q: 2, a: { t: 'bank' } }, opts: { to: SERVER_PEER } },
  ]);
});

test('null state clears the last state without a draw; done only counts from the server', () => {
  const { got, sync, room, doneCount } = setup();
  room.deliver({ g: 'T', v: 1, s: 'play' }, SERVER_PEER);
  assert.equal(sync.state, 'play');
  room.deliver({ g: 'T', v: 2, s: null }, SERVER_PEER);
  room.deliver({ g: 'done' }, 3);
  assert.equal(doneCount(), 0);
  room.deliver({ g: 'done' }, SERVER_PEER);
  assert.deepEqual(got, ['play']);
  assert.equal(sync.state, null);
  assert.equal(doneCount(), 1);
});

test('joining another room restarts the version count', () => {
  const { got, sync, room } = setup();
  room.deliver({ g: 'T', v: 40, s: 'old room' }, SERVER_PEER);
  const next = fakeRoom();
  sync.attach(next);
  assert.equal(sync.state, null);
  next.deliver({ g: 'T', v: 1, s: 'new room' }, SERVER_PEER);
  assert.deepEqual(got, ['old room', 'new room']);
});
