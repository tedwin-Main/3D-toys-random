// Tests Basket Draft rules: scoring, cheese majority, secret simultaneous picks, passing direction, private hands, card conservation, timeouts, bots, skill.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createBasketGame } from './basket-rules.ts';
import { scoreTableau, cheeseBonus, handFor } from './basket-cards.ts';
import { skillTrial } from '../common/skill-trial.ts';

const humans = (k) => Array.from({ length: k }, (_, i) => ({ id: i + 1, nick: `h${i + 1}`, color: '#fff' }));

function setup(k = 3) {
  const game = createBasketGame();
  game.startMatch({ seed: 8, humans: humans(k), bots: 0, settings: { clock: 10 } });
  game.tick(3.1);
  return game;
}
const cardsHeld = (g) => g.state.P.reduce((a, p) => a + p.hand + p.tab.length, 0) + g.state.deck;

test('round scoring: apples 1, pie pairs 5, sandwich sets 10, ants -2 unless a blanket covers them', () => {
  assert.equal(scoreTableau(['apple', 'apple', 'pie', 'pie', 'pie']).total, 7);
  assert.equal(scoreTableau(['sandwich', 'sandwich', 'sandwich', 'sandwich']).total, 10);
  assert.equal(scoreTableau(['ant', 'ant', 'blanket']).total, -2);
  assert.equal(scoreTableau(['blanket']).total, 1, 'a spare blanket is a comfy point');
  assert.equal(scoreTableau(['cheese']).total, 0, 'cheese waits for the end');
});

test('cheese majority: 6 for most, 3 for second, ties split, none for no cheese', () => {
  assert.deepEqual(cheeseBonus([{ id: 1, cheese: 3 }, { id: 2, cheese: 1 }, { id: 3, cheese: 1 }, { id: 4, cheese: 0 }]), { 1: 6, 2: 1, 3: 1, 4: 0 });
  assert.deepEqual(cheeseBonus([{ id: 1, cheese: 2 }, { id: 2, cheese: 2 }, { id: 3, cheese: 1 }]), { 1: 4, 2: 4, 3: 0 });
  assert.deepEqual(cheeseBonus([{ id: 1, cheese: 0 }]), { 1: 0 });
});

test('hands are private and the right size; the public state names no card in a hand', () => {
  const g = setup();
  assert.equal(g.state.hs, handFor(3));
  for (const p of g.state.P) {
    const v = g.viewFor(p.id);
    assert.equal(v.id, p.id);
    assert.equal(v.hand.length, p.hand);
  }
  assert.ok(!/"hand":\[/.test(JSON.stringify(g.state)));
  assert.equal(g.viewFor(99), null);
});

test('picks stay sealed until everyone is in, then show together and hands pass left in round 1', () => {
  const g = setup(), [a, b, c] = g.state.P;
  const handB = g.viewFor(b.id).hand;
  g.act(a.id, { t: 'pick', i: 0 });
  assert.equal(g.state.P[0].pick, null, 'sealed');
  assert.equal(g.act(a.id, { t: 'pick', i: 1 }), false, 're-pick is no public change');
  g.act(b.id, { t: 'pick', i: 0 });
  g.act(c.id, { t: 'pick', i: 0 });
  g.tick(0.1);
  assert.equal(g.state.ph, 'reveal');
  assert.ok(g.state.P.every((p) => p.pick && p.tab.length === 1));
  g.tick(2);
  assert.deepEqual(g.viewFor(c.id).hand, handB.slice(1), 'c gets b\'s hand minus b\'s pick');
  assert.ok(g.state.P.every((p) => p.hand === g.state.hs - 1), 'hands shrink one per pick');
});

test('an idle human gets a random card when the pick clock runs out; every card stays in one place', () => {
  const g = setup();
  const total = g.state.total;
  g.tick(10.1);
  assert.equal(g.state.ph, 'reveal');
  assert.ok(g.state.P.every((p) => p.tab.length === 1));
  assert.equal(cardsHeld(g), total);
});

test('bots play three rounds; cards conserved; the match ends with the cheese bonus', () => {
  let ended = false;
  const g = createBasketGame({ onEnd: () => { ended = true; } });
  g.startMatch({ seed: 2, humans: [], bots: 7 });
  for (let t = 0; t < 20000 && !ended; t++) {
    g.tick(0.1);
    if (g.state.rd) assert.equal(cardsHeld(g), g.state.total);
  }
  assert.ok(ended);
  assert.equal(g.state.rd, 3);
  assert.ok(g.state.bonus);
});

test('a 0.95 bot beats 0.45 bots at least 2x fair share', () => {
  const { share, fair } = skillTrial({ createGame: createBasketGame, seats: 4, matches: 80 });
  assert.ok(share >= 2 * fair, `star share ${share.toFixed(2)} vs fair ${fair}`);
});
