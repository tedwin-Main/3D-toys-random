// Tests Waldo Hunt rounds on the relay server: lobby-host control, race clicks + miss cooldown, hide placement, bots finishing a game, late joiner catch-up.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRelayCore } from '../../multiplayer-rooms/room-relay-core.js';
import { hostedGames } from '../../multiplayer-rooms/hosted-games.js';
import { encodeSend, decodeFrame, SERVER_PEER } from '../common/relay-wire.js';
import { createWaldoRounds, validatePlacement, WRONG_GRACE, ROUND_MS } from './waldo-rounds.js';
import { generateScene, targetPosition, WORLD_W, WORLD_H } from './waldo-scene.js';

function join(core, room = '') {
  const inbox = [];
  const conn = core.connect({ send: (frame) => inbox.push(decodeFrame(String(frame))), close() {}, isOpen: () => true });
  core.message(conn, JSON.stringify({ t: 'join', game: 'waldo-hunt', nick: 'w', room, cap: 14 }));
  const joined = inbox.find((m) => m.t === 'joined');
  return { conn, id: joined.id, code: joined.room, msgs: (t) => inbox.filter((m) => m.t === 'data' && m.data.g === 'm' && m.data.m.t === t).map((m) => m.data.m) };
}

function relayRoom() {
  const core = createRelayCore({ hostedGames });
  const host = join(core), guest = join(core, host.code);
  const toServer = (p, data) => core.message(p.conn, encodeSend(JSON.stringify(data), { to: SERVER_PEER }));
  return { core, host, guest, toServer };
}

// clock + message log around the round machine, no relay
function bench(settings, humans = [{ id: 1, nick: 'a' }, { id: 2, nick: 'b' }], bots = 0) {
  let t = 1000;
  const sent = [];
  const rounds = createWaldoRounds({ send: (to, m) => sent.push({ to, m }), now: () => t });
  rounds.start({ settings, humans, bots });
  const last = (type, to) => sent.filter((e) => e.m.t === type && (to === undefined || e.to === to)).at(-1)?.m;
  return { rounds, sent, last, advance: (ms) => { t += ms; rounds.tick(); } };
}

test('waldo-hunt: only the lobby host starts it; every human gets the round from the server', () => {
  const { host, guest, toServer } = relayRoom();
  toServer(guest, { g: 'run', bots: 0, settings: { mode: 'race' } });
  assert.equal(host.msgs('roundStart').length, 0, 'guest cannot start');
  toServer(host, { g: 'run', bots: 0, settings: { mode: 'race' } });
  for (const p of [host, guest]) assert.equal(p.msgs('roundStart').length, 1);
  assert.equal(host.msgs('view').at(-1).v.players.length, 2);
});

test('waldo-hunt: race click on Waldo scores; misses cost a cooldown after the free ones', () => {
  const { rounds, last } = bench({ mode: 'race' });
  const start = last('roundStart');
  const at = targetPosition(generateScene({ seed: start.seed, theme: start.theme, decoyRatio: start.decoy, density: start.density }, true));
  for (let i = 0; i <= WRONG_GRACE; i++) rounds.act(1, { t: 'click', x: 5, y: 5 });
  assert.ok(last('wrong', 1).cooldownMs > 0, 'third miss cools down');
  rounds.act(2, { t: 'click', x: at.x, y: at.y });
  assert.equal(last('found').id, 2);
  assert.ok(last('view').v.players.find((p) => p.id === 2).score >= 100);
});

test('waldo-hunt: hide mode hider places Waldo; a bad spot is refused; seekers then hunt that spot', () => {
  const { rounds, last, sent } = bench({ mode: 'hide' });
  const hider = sent.find((e) => e.m.t === 'placePrompt').to;
  rounds.act(hider, { t: 'place', x: 1, y: 1 });
  assert.match(last('error', hider).text, /edge/);
  const prompt = last('placePrompt');
  const scene = generateScene({ seed: prompt.seed, theme: prompt.theme, decoyRatio: prompt.decoy, density: prompt.density }, false);
  let spot = null;
  for (let x = 100; !spot && x < WORLD_W - 100; x += 37) for (let y = 100; !spot && y < WORLD_H - 100; y += 41) if (validatePlacement(scene, x, y, { w: WORLD_W, h: WORLD_H }).ok) spot = { x, y };
  rounds.act(hider, { t: 'place', ...spot });
  assert.deepEqual(last('roundStart').targetAt, spot);
});

test('waldo-hunt: bots finish a whole race game on the clock', () => {
  const { last, advance, sent } = bench({ mode: 'race', difficulty: 'easy' }, [], 6);
  for (let i = 0; i < 2000 && !last('gameEnd'); i++) advance(ROUND_MS / 100);
  assert.ok(last('gameEnd'), 'game over');
  assert.equal(sent.filter((e) => e.m.t === 'roundStart').length, 5, 'best of 5');
  assert.ok(last('view').v.players.some((p) => p.score > 0), 'bots found him');
});

test('waldo-hunt: a late joiner saying hello gets the running round and a seat', () => {
  const { core, host, toServer } = relayRoom();
  toServer(host, { g: 'run', bots: 0, settings: { mode: 'race' } });
  const late = join(core, host.code);
  toServer(late, { g: 'hello' });
  assert.equal(late.msgs('roundStart').length, 1);
  assert.ok(late.msgs('view').at(-1).v.players.some((p) => p.id === late.id));
});
