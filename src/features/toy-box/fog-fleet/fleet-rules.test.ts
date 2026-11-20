// Tests Fog Fleet rules: sea and fleet sizes, legal aims only, simultaneous volley scoring, sinks, ghost shots, timeouts, hidden boats, late joiners, bot skill.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createFleetGame, HIT, SINK, SURVIVOR, shotsFor } from './fleet-rules.ts';
import { sideFor, fleetFor, placeFleet, heatMap } from './fleet-sea.ts';
import { skillTrial } from '../common/skill-trial.ts';

const humans = [{ id: 1, nick: 'a', color: '#f00' }, { id: 2, nick: 'b', color: '#0f0' }];

// two humans, aiming in round 1
function setup(settings = { clock: 10, rounds: 30 }) {
  const game = createFleetGame();
  game.startMatch({ seed: 5, humans, bots: 0, settings });
  game.tick(3.1);
  return game;
}
const boatsOf = (g, id) => g.viewFor(id).boats;
const seat = (g, id) => g.state.P.find((p) => p.id === id);

test('sea grows with the table; fleets shrink past 8 seats', () => {
  assert.equal(sideFor(2), 9);
  assert.equal(sideFor(14), 15);
  assert.deepEqual(fleetFor(8), [3, 2, 2]);
  assert.deepEqual(fleetFor(9), [3, 2]);
  const taken = new Set(), fleet = placeFleet(9, [3, 2, 2], taken, Math.random);
  assert.equal(new Set(fleet.flat()).size, 7, 'no overlap');
});

test('boats never ride the public state; each view holds only its own fleet', () => {
  const g = setup();
  assert.equal(g.state.ph, 'aim');
  assert.ok(!/boats|cells/.test(JSON.stringify(g.state)), 'no boats in public state');
  const mine = boatsOf(g, 1), theirs = boatsOf(g, 2);
  assert.equal(mine.flat().length, 7);
  assert.ok(!mine.flat().some((i) => theirs.flat().includes(i)), 'fleets do not overlap');
  assert.equal(g.viewFor(99), null);
});

test('aims: own cells, repeats, too many shots and shot cells are rejected', () => {
  const g = setup(), own = boatsOf(g, 1).flat(), open = [...Array(81).keys()].filter((i) => !own.includes(i));
  assert.equal(seat(g, 1).shots, 3);
  assert.equal(g.act(1, { t: 'aim', cells: [own[0]] }), false, 'own boat');
  assert.equal(g.act(1, { t: 'aim', cells: [open[0], open[0]] }), false, 'repeat');
  assert.equal(g.act(1, { t: 'aim', cells: open.slice(0, 4) }), false, 'too many');
  assert.equal(g.act(1, { t: 'aim', cells: open.slice(0, 2) }), false, 'partial aim stored, no public change');
  assert.equal(seat(g, 1).lock, false);
  assert.deepEqual(g.viewFor(1).aim, open.slice(0, 2));
  assert.equal(g.act(1, { t: 'aim', cells: open.slice(0, 3) }), true, 'full aim locks');
  assert.ok(!JSON.stringify(g.state).includes('"aim":'), 'aims stay private');
});

test('volley: hits score each shooter, a finished boat sinks for its shooters, misses mark the sea', () => {
  const g = setup(), two = boatsOf(g, 2), boat = two.find((c) => c.length === 2), own1 = boatsOf(g, 1).flat();
  const miss = [...Array(81).keys()].find((i) => !own1.includes(i) && !two.flat().includes(i));
  g.act(1, { t: 'aim', cells: [...boat, miss] });
  const p2open = [...Array(81).keys()].filter((i) => !two.flat().includes(i) && !own1.includes(i) && i !== miss);
  g.act(2, { t: 'aim', cells: p2open.slice(0, 3) });
  g.tick(0.1);
  assert.equal(g.state.ph, 'fire');
  assert.equal(seat(g, 1).score, 2 * HIT + SINK);
  for (const i of boat) assert.equal(g.state.sea[i], '#');
  assert.equal(g.state.sea[miss], 'o');
  assert.deepEqual(g.state.sunk[0], { of: 2, cells: boat });
  assert.equal(seat(g, 2).afloat, 2);
  assert.equal(seat(g, 2).left, 5);
  g.tick(3);
  assert.equal(g.state.ph, 'aim');
  assert.equal(seat(g, 2).shots, 2, 'one shot per boat afloat');
});

test('the clock fires random open shots for anyone not locked', () => {
  const g = setup();
  g.tick(10.1);
  assert.equal(g.state.ph, 'fire');
  assert.equal(g.state.volley.reduce((a, v) => a + v.by.length, 0), 6, 'three shots each');
  for (const v of g.state.volley) for (const id of v.by) assert.ok(!boatsOf(g, id).flat().includes(v.i), 'never at own boats');
});

test('last fleet afloat ends the match and gets the survivor bonus; sunk fleets keep a ghost shot', () => {
  assert.equal(shotsFor(0), 1);
  const g = setup(), target = boatsOf(g, 2).flat(), own1 = boatsOf(g, 1).flat();
  const filler = [...Array(81).keys()].filter((i) => !target.includes(i) && !own1.includes(i));
  let k = 0;
  while (g.state.ph !== 'final' && k < 200) {
    if (g.state.ph === 'aim') {
      const left = target.filter((i) => g.state.sea[i] === '.'), shots = seat(g, 1).shots;
      const cells = [...left.slice(0, shots)];
      for (const i of filler) if (cells.length < shots && g.state.sea[i] === '.') cells.push(i);
      g.act(1, { t: 'aim', cells });
      g.act(2, { t: 'aim', cells: filler.filter((i) => g.state.sea[i] === '.' && !cells.includes(i)).slice(-seat(g, 2).shots) });
    }
    g.tick(0.5); k++;
  }
  assert.equal(g.state.ph, 'final');
  assert.equal(seat(g, 2).afloat, 0);
  assert.equal(seat(g, 1).afloat, 3, 'untouched fleet');
  assert.equal(seat(g, 1).score, 7 * HIT + 3 * SINK + SURVIVOR);
});

test('a late joiner launches a fleet on open water; a leaver takes theirs away', () => {
  const g = setup();
  g.syncRoster([...humans, { id: 3, nick: 'c', color: '#00f' }]);
  const late = boatsOf(g, 3).flat();
  assert.equal(late.length, 7);
  assert.ok(!late.some((i) => [...boatsOf(g, 1).flat(), ...boatsOf(g, 2).flat()].includes(i)));
  g.syncRoster([humans[0], { id: 3, nick: 'c', color: '#00f' }]);
  assert.equal(seat(g, 2), undefined);
});

test('bots finish a match; heat favours cells next to a live hit', () => {
  const sea = '.'.repeat(40) + 'x' + '.'.repeat(40), heat = heatMap(sea, 9, new Set(), [3, 2, 2]);
  assert.ok(heat[39] > heat[0] && heat[31] > heat[0], 'neighbours of the hit run hot');
  let over = false;
  const g = createFleetGame({ onEnd: () => { over = true; } });
  g.startMatch({ seed: 3, humans: [], bots: 6, settings: { clock: 10 } });
  for (let t = 0; t < 20000 && !over; t++) g.tick(0.1);
  assert.ok(over, 'match ended');
});

test('a sharp bot beats sloppy ones well over a fair share', () => {
  const { share, fair } = skillTrial({ createGame: createFleetGame, seats: 4, matches: 80 });
  assert.ok(share >= 2 * fair, `star share ${share.toFixed(2)} vs fair ${fair}`);
});
