// Tests turn-sync host-only state acceptance and version reset on host change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createTurnSync } from './turn-sync.js';

// fake room: me = 2, host settable; deliver(d, from) fires data handlers
function fakeRoom(host = 1) {
  const fns = [];
  return {
    me: 2, host,
    get isHost() { return this.me === this.host; },
    on(type, fn) { if (type === 'data') fns.push(fn); },
    deliver(d, from) { fns.forEach((fn) => fn(d, from)); },
    send() {}, toHost() {},
  };
}

function setup() {
  const got = [];
  const sync = createTurnSync({ onState: (s) => got.push(s), onAction: () => {} });
  const room = fakeRoom();
  sync.attach(room);
  return { got, room };
}

test('guest ignores state from non-host peer', () => {
  const { got, room } = setup();
  room.deliver({ g: 'T', v: 1e9, s: 'spoof' }, 3);
  room.deliver({ g: 'T', v: 1, s: 'real' }, 1);
  assert.deepEqual(got, ['real']);
});

test('new host states land even with lower version', () => {
  const { got, room } = setup();
  room.deliver({ g: 'T', v: 40, s: 'old' }, 1);
  room.host = 3;
  room.deliver({ g: 'T', v: 1, s: 'new' }, 3);
  room.deliver({ g: 'T', v: 1, s: 'dup' }, 3);
  assert.deepEqual(got, ['old', 'new']);
});

test('non-numeric version is dropped', () => {
  const { got, room } = setup();
  room.deliver({ g: 'T', v: 'x', s: 'bad' }, 1);
  assert.deepEqual(got, []);
});

test('host drops replayed and non-numeric action seq', () => {
  const acts = [];
  const sync = createTurnSync({ onState: () => {}, onAction: (from, a) => acts.push(a) });
  const room = fakeRoom(2);
  sync.attach(room);
  room.deliver({ g: 'A', q: 1, a: 'a' }, 5);
  room.deliver({ g: 'A', q: 1, a: 'replay' }, 5);
  room.deliver({ g: 'A', q: 'z', a: 'junk' }, 5);
  room.deliver({ g: 'A', q: 2, a: 'b' }, 5);
  assert.deepEqual(acts, ['a', 'b']);
});
