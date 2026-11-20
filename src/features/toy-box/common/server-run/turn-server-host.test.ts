// Tests turn-server-host private views: own seat only, sent on change, resent to late joiners, cleared between matches.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createTurnServerHost } from './turn-server-host.ts';

// fake relay room: players list, sent frames as { data, to }
function fakeRoom(ids) {
  const sent = [];
  return {
    sent,
    lobbyHost: ids[0],
    players: ids.map((id) => ({ id, nick: `p${id}`, color: '#fff' })),
    send(data, { to = null } = {}) { sent.push({ data, to }); return 1; },
  };
}

// fake game: each seat's secret is a number in closure; act { t: 'bump' } changes only the actor's secret
function fakeGame() {
  const secrets = new Map();
  return {
    state: { ph: 'play' },
    startMatch({ humans }) { for (const h of humans) secrets.set(h.id, h.id * 10); },
    act(id) { secrets.set(id, secrets.get(id) + 1); return false; },
    syncRoster(humans) { for (const h of humans) if (!secrets.has(h.id)) secrets.set(h.id, h.id * 10); return false; },
    tick: () => false,
    viewFor: (id) => (secrets.has(id) ? { id, n: secrets.get(id) } : null),
  };
}

const views = (room) => room.sent.filter((f) => f.data.g === 'Y');

test('each seat gets only its own view, right after the first state', () => {
  const room = fakeRoom([1, 2]);
  const host = createTurnServerHost(room, { createGame: fakeGame });
  host.onData({ g: 'run', bots: 0 }, 1);
  assert.equal(room.sent[0].data.g, 'T');
  assert.deepEqual(views(room).map((f) => [f.to, f.data.s]), [[1, { id: 1, n: 10 }], [2, { id: 2, n: 20 }]]);
  assert.ok(views(room).every((f) => f.data.v === room.sent[0].data.v), 'view carries the public version');
});

test('a view goes out again only when it changes', () => {
  const room = fakeRoom([1, 2]);
  const host = createTurnServerHost(room, { createGame: fakeGame });
  host.onData({ g: 'run', bots: 0 }, 1);
  const before = views(room).length;
  host.tick(0); host.tick(1000);
  assert.equal(views(room).length, before, 'idle ticks send nothing');
  host.onData({ g: 'A', q: 1, a: { t: 'bump' } }, 2);
  assert.deepEqual(views(room).slice(before).map((f) => [f.to, f.data.s.n]), [[2, 21]]);
});

test('a late joiner gets their view; a new match resends everyone', () => {
  const room = fakeRoom([1, 2]);
  const host = createTurnServerHost(room, { createGame: fakeGame });
  host.onData({ g: 'run', bots: 0 }, 1);
  room.players.push({ id: 3, nick: 'p3', color: '#fff' });
  host.onRoster();
  assert.deepEqual(views(room).at(-1), { data: { g: 'Y', v: 1, s: { id: 3, n: 30 } }, to: 3 });
  host.onData({ g: 'stop' }, 1);
  const before = views(room).length;
  host.onData({ g: 'run', bots: 0 }, 1);
  assert.equal(views(room).length - before, 3, 'cache cleared between matches');
});
