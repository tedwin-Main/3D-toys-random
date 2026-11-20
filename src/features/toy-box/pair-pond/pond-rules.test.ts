// Tests Pair Pond rules: flip two, a match keeps the pair and goes again, a miss passes the turn, hidden faces, timeouts, bots finish and remember.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createPondGame, pairsFor, pairsLeft } from './pond-rules.ts';
import { skillTrial } from '../common/skill-trial.ts';

const humans = [{ id: 1, nick: 'a', color: '#f00' }, { id: 2, nick: 'b', color: '#0f0' }];

// match with two humans, past the intro; peek(i) reads a face by flipping (test only)
function setup(clock = 10) {
  const game = createPondGame();
  game.startMatch({ seed: 5, humans, bots: 0, settings: { clock } });
  game.tick(3);
  return game;
}
const mover = (g) => g.state.P[g.state.turn].id;

// find a matching pair by flipping through the pond with throwaway games on the same seed
function knownFaces() {
  const g = setup();
  const faces = [];
  for (let i = 0; i < g.state.N; i++) {
    const probe = setup();
    probe.act(mover(probe), { t: 'flip', i });
    faces.push(probe.state.up[0].f);
  }
  return faces;
}

test('pairs scale with the table: 6 + seats, capped at 20', () => {
  assert.equal(pairsFor(2), 8);
  assert.equal(pairsFor(14), 20);
  assert.equal(setup().state.N, 16);
});

test('no face is public before its pad is flipped', () => {
  const g = setup();
  assert.ok(!/"faces"|"f":/.test(JSON.stringify(g.state)), 'state carries no faces');
  g.act(mover(g), { t: 'flip', i: 0 });
  assert.equal(g.state.up.length, 1);
  assert.equal(JSON.stringify(g.state).match(/"f":/g).length, 1, 'only the flipped pad');
});

test('a match keeps the pair and the same player goes again', () => {
  const faces = knownFaces(), a = faces.indexOf(faces[0], 1);
  const g = setup(), who = mover(g);
  g.act(who, { t: 'flip', i: 0 });
  g.act(who, { t: 'flip', i: a });
  assert.equal(g.state.ph, 'show');
  g.tick(1);
  assert.equal(mover(g), who, 'same turn');
  assert.equal(g.state.P.find((p) => p.id === who).score, 1);
  assert.deepEqual([g.state.claim[0].by, g.state.claim[a].by], [who, who]);
  assert.equal(pairsLeft(g.state), 7);
});

test('a miss flips back and passes the turn; only the mover may flip', () => {
  const faces = knownFaces(), b = faces.findIndex((f) => f !== faces[0]);
  const g = setup(), who = mover(g), other = who === 1 ? 2 : 1;
  assert.equal(g.act(other, { t: 'flip', i: 0 }), false, 'not your turn');
  g.act(who, { t: 'flip', i: 0 });
  assert.equal(g.act(who, { t: 'flip', i: 0 }), false, 'same pad twice');
  g.act(who, { t: 'flip', i: b });
  g.tick(2);
  assert.equal(mover(g), other);
  assert.deepEqual(g.state.up, []);
  assert.ok(g.state.claim.every((c) => !c));
});

test('the turn clock flips a random free pad for an idle human', () => {
  const g = setup(10);
  g.tick(10.1);
  assert.equal(g.state.up.length, 1, 'first flip forced');
  g.tick(10.1);
  assert.equal(g.state.ph, 'show', 'second flip forced');
});

test('bots play a full match; claimed pads = 2 x total score', () => {
  let ended = false;
  const g = createPondGame({ onEnd: () => { ended = true; } });
  g.startMatch({ seed: 9, humans: [], bots: 6 });
  for (let t = 0; t < 36000 && !ended; t++) g.tick(0.1);
  assert.ok(ended, 'match ends');
  const S = g.state, claimed = S.claim.filter(Boolean).length;
  assert.equal(claimed, S.N);
  assert.equal(claimed, 2 * S.P.reduce((a, p) => a + p.score, 0));
});

test('a 0.95 bot beats 0.45 bots at least 2x fair share', () => {
  const { share, fair } = skillTrial({ createGame: createPondGame, seats: 4, matches: 80 });
  assert.ok(share >= 2 * fair, `star share ${share.toFixed(2)} vs fair ${fair}`);
});
