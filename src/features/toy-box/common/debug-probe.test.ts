// Tests the ?debug window probe: gating, Map flattening, JSON safety.
import test from 'node:test';
import assert from 'node:assert/strict';
import { exposeGameDebug, normalizePlayer, toPlain } from './debug-probe.ts';

const lobby = { running: true, room: { code: 'ABCD', isHost: true, me: 1, players: [{ id: 1 }, { id: 2 }] } };
const read = () => ({ phase: 'fight', players: new Map([[1, { id: 1, nick: 'A', x: 1.23456, z: NaN, pts: 3 }]]), extra: { ball: { x: 2 } } });

test('no global without ?debug', () => {
  const target = { __GAME_DEBUG__: undefined };
  assert.equal(exposeGameDebug({ lobby, read }, { search: '?room=ABCD', target }), false);
  assert.equal(target.__GAME_DEBUG__, undefined);
});

test('?debug exposes room, phase, flattened players', () => {
  const target = { __GAME_DEBUG__: undefined };
  assert.equal(exposeGameDebug({ lobby, read, confirmMs: () => [10.5, 20] }, { search: '?room=ABCD&debug', target }), true);
  const d = target.__GAME_DEBUG__();
  assert.deepEqual(d.room, { code: 'ABCD', isHost: true, me: 1, peers: [1, 2] });
  assert.equal(d.running, true);
  assert.equal(d.phase, 'fight');
  assert.deepEqual(d.players[0], { id: 1, name: 'A', bot: false, x: 1.235, y: undefined, z: 'NaN', alive: true, score: 3 });
  assert.deepEqual(d.confirmMs, [10.5, 20]);
  assert.deepEqual(d.extra, { ball: { x: 2 } });
  assert.doesNotThrow(() => JSON.stringify(d));
});

test('alive falls back to out / dead flags', () => {
  assert.equal(normalizePlayer({ id: 1, out: true }).alive, false);
  assert.equal(normalizePlayer({ id: 1, dead: false }).alive, true);
});

test('toPlain caps depth on cycles', () => {
  const a = { n: 1, self: null }; a.self = a;
  assert.doesNotThrow(() => JSON.stringify(toPlain(a)));
});
