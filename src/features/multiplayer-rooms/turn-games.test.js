// Tests turn and secret-pick room games the relay runs: lobby-host control, states on change, human actions, hidden picks, late joiners, two matches in one room.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from './room-relay-core.js';
import { hostedGames } from './hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../toy-box/common/relay-wire.js';

const TICK_MS = 100;
const MATCH_TICK_CAP = 10 * 60 * 30; // 30 min of game time
/**
 * settings: lobby settings for the shortest match
 * ready(state, id): the human `id` may act now; action(state, id): what they send
 * acted(state, id): the action landed
 * secret(state): picks that must stay hidden until the reveal, when the game has them ('' = none showing)
 */
const GAMES = {
  'bank-or-bust': {
    settings: { rounds: 3 },
    ready: (s, id) => s.ph === 'wait' && s.roll > 0 && s.P.find((p) => p.id === id)?.bank == null,
    action: () => ({ t: 'bank' }),
    acted: (s, id) => s.P.find((p) => p.id === id).bank != null,
  },
  'lucky-low': {
    settings: { rounds: 8 },
    ready: (s) => s.ph === 'pick',
    action: () => ({ t: 'pick', v: 2 }),
    acted: (s, id) => s.P.find((p) => p.id === id).lock,
    secret: (s) => (s.ph === 'pick' && (s.res || /"picks"|sealed/.test(JSON.stringify(s))) ? 'picks in a pick-phase state' : ''),
  },
  'jar-guess': {
    settings: { rounds: 4 },
    ready: (s) => s.ph === 'guess',
    action: () => ({ t: 'guess', v: 42 }),
    acted: (s, id) => s.P.find((p) => p.id === id).lock,
    secret: (s) => (s.ph !== 'reveal' && s.ph !== 'final' && s.res ? 'guesses before the reveal' : ''),
  },
  'treasure-auction': {
    settings: { rounds: 6 },
    ready: (s) => s.ph === 'bid',
    action: () => ({ t: 'bid', v: 3 }),
    acted: (s, id) => s.P.find((p) => p.id === id).lock,
    secret: (s) => (s.ph !== 'result' && s.ph !== 'final' && s.res ? 'bids before the gavel' : ''),
  },
  'picnic-dash': {
    settings: { turns: 15 },
    ready: (s) => s.ph === 'plan',
    action: () => ({ t: 'step', d: 1 }),
    acted: (s, id) => s.P.find((p) => p.id === id).lock,
  },
  'fence-fields': {
    settings: { clock: 10, size: 4 },
    ready: (s, id) => s.ph === 'play' && s.P[s.turn]?.id === id,
    action: (s) => ({ t: 'edge', e: s.E.indexOf('0') }),
    acted: (s, id) => s.F.includes(id),
  },
  'gem-diggers': {
    settings: { clock: 10 },
    ready: (s, id) => s.ph === 'play' && s.P[s.turn]?.id === id,
    action: (s) => ({ t: 'dig', i: s.rev.indexOf(null) }),
    acted: (s, id) => s.rev.some((cell) => cell?.by === id),
    secret: (s) => (/"seed"|buried/.test(JSON.stringify(s)) ? 'field layout on the wire' : ''),
  },
  'siege-hills': {
    settings: { rounds: 1, clock: 15 },
    ready: (s, id) => s.ph === 'aim' && s.P[s.turn]?.id === id,
    action: () => ({ t: 'fire', a: Math.PI / 4, p: 0.6 }),
    acted: (s, id) => s.shot?.by === id,
  },
};

function join(core, game, room = '') {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeFrame(String(frame))), close() {}, isOpen: () => true });
  core.message(conn, JSON.stringify({ t: 'join', game, nick: 'p', room, cap: 14 }));
  const joined = inbox.find((m) => m.t === 'joined');
  const data = (g) => inbox.filter((m) => m.t === 'data' && m.data.g === g);
  return { conn, inbox, id: joined.id, code: joined.room, data, state: () => data('T').at(-1)?.data.s };
}

function room(game) {
  const core = createRelayCore({ hostedGames });
  const host = join(core, game);
  const guest = join(core, game, host.code);
  let now = 0, seq = 0;
  const run = (ticks) => { for (let i = 0; i < ticks; i++) core.tickHosted((now += TICK_MS)); };
  const toServer = (p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));
  const act = (p, action) => toServer(p, { g: 'A', q: ++seq, a: action });
  const start = (bots, settings) => toServer(host, { g: 'run', bots, seed: 7, settings });
  const runUntil = (stop) => { for (let t = 0; t < MATCH_TICK_CAP && !stop(); t++) run(1); return stop(); };
  return { core, host, guest, run, runUntil, toServer, act, start };
}

for (const [game, { settings, ready, action, acted, secret }] of Object.entries(GAMES)) {
  test(`${game}: only the lobby host starts it; first state reaches everyone from the server at once`, () => {
    const { host, guest, toServer, start } = room(game);
    toServer(guest, { g: 'run', bots: 2, seed: 7, settings });
    assert.equal(host.data('T').length, 0, 'guest cannot start');
    start(2, settings);
    for (const p of [host, guest]) {
      assert.equal(p.data('T').length, 1, 'state published inside run');
      assert.equal(p.data('T')[0].from, SERVER_PEER);
      assert.equal(p.state().P.length, 4, '2 humans + 2 bots');
      assert.ok(!p.data('run').length, 'control frame stays on the server');
    }
  });

  test(`${game}: a human action changes the state; a replayed action seq is dropped`, () => {
    const { host, guest, runUntil, toServer, act, start } = room(game);
    start(2, settings);
    assert.ok(runUntil(() => ready(host.state(), guest.id)), 'guest gets a turn');
    const before = host.data('T').length;
    act(guest, action(host.state(), guest.id));
    assert.ok(acted(host.state(), guest.id), 'action applied');
    assert.equal(host.data('T').length, before + 1, 'one state per action');
    toServer(guest, { g: 'A', q: 1, a: action(host.state(), guest.id) });
    assert.equal(host.data('T').length, before + 1, 'replay dropped');
  });

  test(`${game}: bots play a whole match to the end; the room then holds no state`, () => {
    const { core, host, runUntil, start } = room(game);
    start(4, settings);
    let sawFinal = false, leaked = '';
    assert.ok(runUntil(() => {
      const s = host.state();
      sawFinal ||= s?.ph === 'final';
      if (s && secret) leaked ||= secret(s);
      return host.data('done').length > 0;
    }), 'match ends');
    assert.ok(sawFinal, 'final phase shown');
    assert.equal(leaked, '', 'secret picks stay off the wire');
    assert.equal(host.state(), null, 'state cleared for late joiners');
    assert.ok(!core.rooms.values().next().value.server.running);
  });

  test(`${game}: a late joiner gets the state at once and a seat; a leaver loses theirs`, () => {
    const { core, host, guest, run, start } = room(game);
    start(12, settings);
    run(5);
    const late = join(core, game, host.code);
    assert.equal(late.inbox.find((m) => m.t === 'data')?.data.g, 'T', 'sticky state replayed on join');
    const seats = host.state().P;
    assert.ok(seats.some((p) => p.id === late.id), 'late joiner seated');
    assert.equal(seats.length, 14, 'a bot gave up its seat');
    core.close(guest.conn);
    assert.ok(!host.state().P.some((p) => p.id === guest.id), 'leaver removed');
  });

  test(`${game}: a second match in the same room keeps the version counting up`, () => {
    const { host, guest, run, toServer, start } = room(game);
    start(2, settings);
    run(30);
    toServer(host, { g: 'stop' });
    assert.equal(guest.state(), null, 'stop clears the state');
    start(2, settings);
    run(30);
    const versions = guest.data('T').map((m) => m.data.v);
    assert.ok(versions.every((v, i) => i === 0 || v > versions[i - 1]), `versions ${versions}`);
    assert.equal(guest.state().mode, 'match', 'second match delivers states');
  });
}
