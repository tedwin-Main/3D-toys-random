// Tests seeded start-slot shuffle: join order never fixes the front row, and egg haul beans spawn at their own nest.

import test from 'node:test';
import assert from 'node:assert/strict';
import { createRoundSim, spawnOrder } from './round-sim.js';
import { ROUNDS } from './show-director.js';

const roster = (n) => Array.from({ length: n }, (_, i) => ({ id: i + 1, nick: `p${i + 1}`, color: '#fff', bot: i > 0 }));

test('spawn order: seeded permutation, same on every tab', () => {
  const a = spawnOrder(7, 32);
  assert.deepEqual([...a].sort((x, y) => x - y), [...Array(32).keys()]);
  assert.deepEqual(spawnOrder(7, 32), a, 'same seed, same slots (host and guests agree)');
});

test('spawn order: first joiner is not always on the front row', () => {
  const frontRow = (seed) => spawnOrder(seed, 32)[0] < 8;
  const fronts = Array.from({ length: 200 }, (_, s) => frontRow(s + 1)).filter(Boolean).length;
  assert.ok(fronts > 20 && fronts < 90, `front row share ${fronts}/200 near 1/4`);
});

test('egg haul: every bean starts closer to its own nest than to any rival nest', () => {
  for (const seed of [1, 2, 3]) {
    const sim = createRoundSim({ round: ROUNDS['egg-haul'], seed, roster: roster(14), keep: 9 });
    const { nests } = sim.course;
    for (const b of sim.list) {
      const d = nests.map((n) => Math.hypot(n.x - b.x, n.z - b.z));
      assert.equal(d.indexOf(Math.min(...d)), b.team, `seed ${seed}: bean ${b.id} spawned away from team ${b.team}`);
    }
  }
});
