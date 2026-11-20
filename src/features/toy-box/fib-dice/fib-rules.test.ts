// Tests Fib Dice rules: raises, wild stars, who loses the die, loser opens, hidden cups, own-seat views, timeouts, cap, bots finish, skill.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createFibGame, diceFor, diceOnTable } from './fib-rules.ts';
import { isRaise, minRaise, countFace } from './fib-bids.ts';
import { atLeast } from './fib-bots.ts';
import { skillTrial } from '../common/skill-trial.ts';

const humans = (k) => Array.from({ length: k }, (_, i) => ({ id: i + 1, nick: `h${i + 1}`, color: '#fff' }));

function setup(k = 3, settings = {}) {
  const game = createFibGame();
  game.startMatch({ seed: 21, humans: humans(k), bots: 0, settings: { clock: 10, rounds: 10, ...settings } });
  game.tick(3.1);
  return game;
}
const mover = (g) => g.state.P[g.state.turn];
const allDice = (g) => Object.fromEntries(g.state.P.map((p) => [p.id, g.viewFor(p.id).dice]));

test('raises: more dice, or as many of a higher face; minimum raise rolls 6 over to the next count', () => {
  assert.ok(isRaise({ n: 3, f: 2 }, { n: 2, f: 6 }));
  assert.ok(isRaise({ n: 2, f: 5 }, { n: 2, f: 4 }));
  assert.ok(!isRaise({ n: 2, f: 4 }, { n: 2, f: 4 }));
  assert.ok(!isRaise({ n: 1, f: 6 }, { n: 2, f: 2 }));
  assert.deepEqual(minRaise(null, 10), { n: 1, f: 2 });
  assert.deepEqual(minRaise({ n: 3, f: 6 }, 10), { n: 4, f: 2 });
  assert.equal(minRaise({ n: 10, f: 6 }, 10), null);
});

test('stars are wild: they count toward any face', () => {
  assert.equal(countFace({ a: [1, 4, 4], b: [2, 1, 6] }, 4), 4);
  assert.equal(countFace({ a: [1, 4, 4], b: [2, 1, 6] }, 6), 3);
});

test('dice per cup shrink as the table grows', () => {
  assert.deepEqual([diceFor(2), diceFor(6), diceFor(7), diceFor(10), diceFor(11), diceFor(14)], [5, 5, 4, 4, 3, 3]);
});

test('cups stay off the public state; each view is that seat only', () => {
  const g = setup();
  assert.ok(!/"dice"|"cups"/.test(JSON.stringify(g.state)));
  for (const p of g.state.P) {
    const v = g.viewFor(p.id);
    assert.equal(v.id, p.id);
    assert.equal(v.dice.length, p.score);
  }
  assert.equal(g.viewFor(999), null, 'no view for strangers');
});

test('only the mover bids, bids must rise, nobody calls their own bid', () => {
  const g = setup();
  const a = mover(g), other = g.state.P.find((p) => p !== a);
  assert.equal(g.act(other.id, { t: 'bid', n: 1, f: 3 }), false, 'not your turn');
  assert.equal(g.act(a.id, { t: 'bid', n: 1, f: 1 }), false, 'no bids on stars');
  assert.equal(g.act(a.id, { t: 'call' }), false, 'nothing to call');
  assert.ok(g.act(a.id, { t: 'bid', n: 2, f: 3 }));
  const b = mover(g);
  assert.notEqual(b, a);
  assert.equal(g.act(b.id, { t: 'bid', n: 2, f: 3 }), false, 'same bid is no raise');
  assert.equal(g.act(b.id, { t: 'bid', n: 99, f: 3 }), false, 'more dice than the table');
});

test('a false bid costs the bidder a die, a true one the caller; the loser opens next', () => {
  for (const tooHigh of [true, false]) {
    const g = setup();
    const a = mover(g), real = countFace(allDice(g), 5);
    g.act(a.id, { t: 'bid', n: tooHigh ? real + 1 : Math.max(1, real), f: 5 });
    const b = mover(g), before = diceOnTable(g.state);
    g.act(b.id, { t: 'call' });
    const loser = tooHigh ? a : b;
    assert.equal(g.state.res.loser, loser.id);
    assert.equal(g.state.res.count, real);
    assert.equal(diceOnTable(g.state), before - 1, 'exactly one die lost');
    g.tick(6);
    assert.equal(mover(g).id, loser.id, 'loser opens');
    assert.equal(g.viewFor(loser.id).dice.length, loser.score, 'fresh roll, one die short');
  }
});

test('an idle human bids the minimum raise when the clock runs out', () => {
  const g = setup();
  const a = mover(g);
  g.tick(10.1);
  assert.deepEqual(g.state.bid, { n: 1, f: 2, by: a.id });
});

test('the challenge cap ends the match; bots play it out and dice never go negative', () => {
  let ended = false;
  const g = createFibGame({ onEnd: () => { ended = true; } });
  g.startMatch({ seed: 4, humans: [], bots: 8, settings: { rounds: 12 } });
  let last = diceOnTable(g.state), ch = 0;
  for (let t = 0; t < 40000 && !ended; t++) {
    g.tick(0.1);
    const S = g.state;
    if (S.ch !== ch) { assert.equal(diceOnTable(S), last - 1); last = diceOnTable(S); ch = S.ch; }
    assert.ok(S.P.every((p) => p.score >= 0));
  }
  assert.ok(ended);
  assert.equal(g.state.ch, 12);
});

test('binomial odds: at least k of m', () => {
  assert.equal(atLeast(0, 5, 0.3), 1);
  assert.equal(atLeast(6, 5, 0.3), 0);
  assert.ok(Math.abs(atLeast(1, 2, 0.5) - 0.75) < 1e-9);
});

test('a 0.95 bot beats 0.45 bots at least 2x fair share', () => {
  const { share, fair } = skillTrial({ createGame: createFibGame, seats: 4, matches: 150, settings: { rounds: 40 } });
  assert.ok(share >= 2 * fair, `star share ${share.toFixed(2)} vs fair ${fair}`);
});
