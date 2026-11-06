// Tests classic room games the relay runs (kart party, turbo ball): lobby-host control, JSON snapshots, guest input, leavers, match end.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from './room-relay-core.js';
import { hostedGames } from './hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';

const TICK_MS = 1000 / 60;
const GAMES = { 'kart-party': { rows: 'K', steer: 6, live: 'count' }, 'turbo-ball': { rows: 'P', steer: 6, live: 'play' } };

function join(core, game, room = '') {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeFrame(String(frame))), close() {}, isOpen: () => true });
  core.message(conn, JSON.stringify({ t: 'join', game, nick: 'p', room, cap: 14 }));
  const joined = inbox.find((m) => m.t === 'joined');
  return { conn, inbox, id: joined.id, code: joined.room, data: (g) => inbox.filter((m) => m.t === 'data' && m.data.g === g) };
}

function room(game) {
  const core = createRelayCore({ hostedGames });
  const host = join(core, game);
  const guests = [join(core, game, host.code), join(core, game, host.code)];
  let now = 0;
  const run = (ticks) => { for (let i = 0; i < ticks; i++) core.tickHosted((now += TICK_MS)); };
  const toServer = (p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));
  const lastSnap = (p) => p.data('s').at(-1)?.data;
  return { core, host, guests, run, toServer, lastSnap };
}

for (const [game, { rows, steer, live }] of Object.entries(GAMES)) {
  test(`${game}: only the lobby host starts it; snapshots reach every human from the server`, () => {
    const { host, guests, run, toServer, lastSnap } = room(game);
    toServer(guests[0], { g: 'run', bots: 4, seed: 7 });
    run(10);
    assert.equal(host.data('s').length, 0, 'guest cannot start');
    toServer(host, { g: 'run', bots: 4, seed: 7 });
    run(30);
    for (const p of [host, ...guests]) {
      assert.ok(p.data('s').length >= 9, '20 Hz snapshots');
      assert.equal(p.data('s')[0].from, SERVER_PEER);
      assert.equal(lastSnap(p)[rows].length, 7, '3 humans + 4 bots');
      assert.ok(!p.data('run').length, 'control frame stays on the server');
    }
  });

  test(`${game}: guest input steers its own row; a leaver drops out`, () => {
    const { core, host, guests, run, toServer, lastSnap } = room(game);
    toServer(host, { g: 'run', bots: 2, seed: 7 });
    for (let t = 0; t < 600 && lastSnap(host)?.ph !== live; t++) run(1);
    toServer(guests[0], { g: 'i', g2: 0, s: 1, d: 0, it: 0, r: 0, b: 0 });
    run(12);
    const row = (p, id) => lastSnap(p)[rows].find((r) => r[0] === id);
    assert.ok(row(host, guests[0].id)[steer] > 0.5, 'steer applied');
    assert.equal(row(host, guests[1].id)[steer], 0, 'no input, no steer');
    core.close(guests[1].conn);
    run(6);
    assert.equal(row(host, guests[1].id), undefined, 'leaver removed');
  });
}

test('kart-party: race ends on the server and tells the lobby host it is done', () => {
  const { core, host, run, toServer } = room('kart-party');
  toServer(host, { g: 'run', bots: 3, seed: 11 });
  for (let t = 0; t < 60 * 60 * 6 && !host.data('done').length; t += 600) run(600);
  assert.equal(host.data('done').length, 1, 'match done');
  assert.ok(!core.rooms.values().next().value.server.running);
});
