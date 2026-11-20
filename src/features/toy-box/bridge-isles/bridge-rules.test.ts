// Tests Bridge Isles rules: chain wins, pie-rule swap, teams by lot, teammates rotate, equal moves per team, timeouts, bots finish, skill.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBridgeGame, moverOf, sizeFor } from './bridge-rules.ts';
import { chainFor, stonesToGo, mirrorCell } from './bridge-board.ts';
import { skillTrial } from '../common/skill-trial.ts';

const humans = (k) => Array.from({ length: k }, (_, i) => ({ id: i + 1, nick: `h${i + 1}`, color: '#fff' }));

function setup(k = 2, settings = {}) {
  const game = createBridgeGame();
  game.startMatch({ seed: 3, humans: humans(k), bots: 0, settings: { clock: 10, ...settings } });
  game.tick(3.1);
  return game;
}
const play = (g, i) => g.act(moverOf(g.state).id, { t: 'stone', i });

test('chains join the right banks only', () => {
  const n = 3;
  assert.deepEqual(chainFor('010010010', n, 0)?.length, 3, 'Coral column top to bottom');
  assert.equal(chainFor('010010010', n, 1), null);
  assert.ok(chainFor('000222000', n, 1), 'Lagoon row left to right');
  assert.ok(chainFor('001010100', n, 0), 'hex diagonal links');
  assert.equal(stonesToGo('000000000', n, 0), 3);
  assert.equal(stonesToGo('000222000', n, 1), 0);
  assert.equal(stonesToGo('020020020', n, 1), 2, 'a column does not join left to right');
});

test('board grows with the table and teams split by lot within one seat', () => {
  assert.deepEqual([sizeFor(2), sizeFor(6), sizeFor(14)], [7, 9, 11]);
  const g = setup(7);
  const sizes = [0, 1].map((t) => g.state.P.filter((p) => p.team === t).length);
  assert.ok(Math.abs(sizes[0] - sizes[1]) <= 1, `teams ${sizes}`);
});

test('teams alternate and teammates take turns in rotation', () => {
  const g = setup(5);
  const seen = [];
  for (let k = 0; k < 10; k++) {
    const m = moverOf(g.state);
    seen.push([g.state.team, m.id]);
    play(g, g.state.B.indexOf('0', k * 3));
  }
  for (let k = 1; k < seen.length; k++) assert.notEqual(seen[k][0], seen[k - 1][0], 'teams alternate');
  for (const t of [0, 1]) {
    const ids = seen.filter(([team]) => team === t).map(([, id]) => id), size = g.state.P.filter((p) => p.team === t).length;
    for (let k = size; k < ids.length; k++) assert.equal(ids[k], ids[k - size], 'rotation repeats');
    assert.equal(new Set(ids.slice(0, size)).size, Math.min(size, ids.length), 'every teammate moves before a repeat');
  }
});

test('pie rule: the second team may take the opening stone, mirrored onto its banks', () => {
  const g = setup(2), n = g.state.n, opener = g.state.team;
  play(g, 1);
  assert.equal(g.state.swapOk, true);
  const swapper = moverOf(g.state).id;
  assert.equal(g.act(swapper, { t: 'swap' }), true);
  assert.equal(g.state.B[1], '0');
  assert.equal(g.state.B[mirrorCell(1, n)], String(2 - opener));
  assert.equal(g.state.team, opener, 'opening team moves next');
  assert.equal(g.act(moverOf(g.state).id, { t: 'swap' }), false, 'only once');
});

test('a full chain wins the round; best of 3 ends the match with team scores', () => {
  let ended = false;
  const g = createBridgeGame({ onEnd: () => { ended = true; } });
  g.startMatch({ seed: 11, humans: [], bots: 4, settings: { rounds: 3 } });
  for (let t = 0; t < 30000 && !ended; t++) {
    g.tick(0.1);
    const S = g.state;
    assert.match(S.B, /^[012]*$/);
    if (S.ph === 'round' && S.win.path) assert.ok(chainFor(S.B, S.n, S.win.team), 'round ends on a chain');
  }
  assert.ok(ended);
  const S = g.state;
  assert.ok(S.wins.some((w) => w >= 2), `wins ${S.wins}`);
  for (const p of S.P) assert.equal(p.score, S.wins[p.team]);
});

test('the turn clock places a stone on a free cell for an idle human', () => {
  const g = setup(2);
  const before = g.state.mv;
  g.tick(10.1);
  assert.equal(g.state.mv, before + 1);
  assert.equal((g.state.B.match(/[12]/g) ?? []).length, 1);
});

test('a 0.95 bot beats a 0.45 bot one on one at least 1.6x fair share', () => {
  const { share, fair } = skillTrial({ createGame: createBridgeGame, seats: 2, matches: 40, settings: { rounds: 3 } });
  assert.ok(share >= 1.6 * fair, `star share ${share.toFixed(2)} vs fair ${fair}`);
});
