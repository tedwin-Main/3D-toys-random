// Runs Picnic Dash rules (meadow layout, secret steps, simultaneous resolve, fruit, bots, turn clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey, dropUnseatedPicks } from '../common/turn-table.js';

const INTRO = 2.5, PLAN_T = 7, MOVE_T = 1.5, FINAL_T = 12;
const ATTRACT_BOTS = 5, ATTRACT_TURNS = 14, DEFAULT_TURNS = 20;
const TREE_ODDS = 0.08, LAYOUT_TRIES = 40, BIG_FRUIT_ODDS = 0.2;
// up, right, down, left, stay
export const DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0], [0, 0]];
const STAY = 4;
const BOT_NAMES = ['Hopper', 'Clover', 'Nibbles', 'Thumper', 'Biscuit', 'Muffin', 'Sprout', 'Pip', 'Waffles', 'Cocoa', 'Peanut', 'Tofu', 'Maple', 'Bun Bun'];
const sizeFor = (seats) => (seats <= 6 ? 9 : 11);
const allCells = (n) => [...Array(n * n).keys()];

/** cell reached from cell i by direction d on an n x n meadow; blocked by the edge or a tree = stays */
export function step(i, d, n, trees) {
  const [dx, dz] = DIRS[d], x = (i % n) + dx, z = Math.floor(i / n) + dz;
  if (x < 0 || z < 0 || x >= n || z >= n) return i;
  const j = z * n + x;
  return trees.includes(j) ? i : j;
}

/** at {id: cell}, dirs {id: d} > {id: cell}: same target or a swap bounces both back, into a stander bounces */
export function resolveMoves(at, dirs, n, trees) {
  const ids = Object.keys(at), to = {};
  for (const id of ids) to[id] = step(at[id], dirs[id] ?? STAY, n, trees);
  for (let changed = true; changed;) {
    changed = false;
    const claim = new Map();
    for (const id of ids) claim.set(to[id], [...(claim.get(to[id]) ?? []), id]);
    for (const id of ids) {
      if (to[id] === at[id]) continue;
      const crowd = claim.get(to[id]).length > 1;
      // swap: both want each other's square
      const swap = ids.some((other) => other !== id && to[other] === at[id] && at[other] === to[id]);
      if (crowd || swap) { to[id] = at[id]; changed = true; }
    }
  }
  return to;
}

function connected(n, trees) {
  const block = new Set(trees), start = allCells(n).find((i) => !block.has(i)), seen = new Set([start]), queue = [start];
  while (queue.length) {
    const i = queue.shift();
    for (let d = 0; d < STAY; d++) { const j = step(i, d, n, trees); if (!seen.has(j)) { seen.add(j); queue.push(j); } }
  }
  return seen.size === n * n - block.size;
}

// cells round the meadow edge, clockwise from the top-left corner
function edgeRing(n) {
  const ring = [];
  for (let k = 0; k < n - 1; k++) ring.push(k);
  for (let k = 0; k < n - 1; k++) ring.push(n - 1 + k * n);
  for (let k = 0; k < n - 1; k++) ring.push(n * n - 1 - k);
  for (let k = 0; k < n - 1; k++) ring.push((n - 1 - k) * n);
  return ring;
}

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, turn, turns, n, trees: [i], fruit: [{ i, v, id }], fid, P: [{ id, nick, color, bot, score, at, lock, from, want (revealed step), bounced, ate, think, skill }] }
 */
export function createPicnicGame({ onEnd = () => {} } = {}) {
  // planned steps stay here until everyone hops: never part of the published state
  const sealedSteps = new Map();
  let rng = Math.random;
  let S = { mode: 'attract', ph: 'intro', tt: 1, turn: 0, turns: ATTRACT_TURNS, n: sizeFor(0), trees: [], fruit: [], fid: 0, P: [] };

  const player = (id) => S.P.find((p) => p.id === id);
  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, skill: bot ? 0.4 + rng() * 0.5 : 0, at: 0, lock: false, from: null, bounced: false, think: 0 });
  function freeCells() {
    const busy = new Set([...S.trees, ...S.P.map((p) => p.at), ...S.fruit.map((f) => f.i)]);
    return allCells(S.n).filter((i) => !busy.has(i));
  }

  function spawnFruit() {
    const want = Math.max(4, Math.ceil(S.P.length * 0.8)), free = freeCells();
    while (S.fruit.length < want && free.length) {
      const i = free.splice(Math.floor(rng() * free.length), 1)[0];
      S.fruit.push({ i, v: rng() < BIG_FRUIT_ODDS ? 3 : 1, id: ++S.fid });
    }
  }

  // spawns evenly spaced round the edge from a random start; seats drawn by lot so join order never decides who starts in a corner
  function placeOnEdge(P, n) {
    const ring = edgeRing(n), offset = Math.floor(rng() * ring.length), seats = shuffleInPlace([...P.keys()], rng);
    P.forEach((p, k) => Object.assign(p, { at: ring[(offset + Math.floor((seats[k] * ring.length) / P.length)) % ring.length], lock: false, from: null, bounced: false }));
  }

  // trees scattered but never cutting the meadow apart
  function scatterTrees(P, n) {
    const spawns = new Set(P.map((p) => p.at));
    let trees = [];
    for (let tries = 0; tries < LAYOUT_TRIES; tries++) {
      trees = allCells(n).filter((i) => !spawns.has(i) && rng() < TREE_ODDS);
      if (connected(n, trees)) break;
    }
    return trees;
  }

  function layOutMeadow(mode, P, turns, introTime) {
    const n = sizeFor(P.length);
    placeOnEdge(P, n);
    S = { mode, ph: 'intro', tt: introTime, turn: 0, turns, n, trees: scatterTrees(P, n), fruit: [], fid: 0, P };
    spawnFruit();
  }

  function plan(id, d) {
    const p = player(id);
    if (!p || S.ph !== 'plan' || !Number.isInteger(d) || d < 0 || d > STAY) return false;
    sealedSteps.set(id, d); p.lock = true;
    return true;
  }

  function startPlan() {
    sealedSteps.clear();
    // think: seconds into the plan phase when a bot commits
    for (const p of S.P) { p.lock = false; p.think = 0.8 + rng() * 3.5; }
    Object.assign(S, { ph: 'plan', tt: PLAN_T, turn: S.turn + 1 });
  }

  function eatFruitAt(p) {
    const k = S.fruit.findIndex((f) => f.i === p.at);
    if (k < 0) { p.ate = 0; return; }
    p.score += S.fruit[k].v; p.ate = S.fruit[k].id;
    S.fruit.splice(k, 1);
  }

  function resolveTurn() {
    const at = {}, dirs = {};
    for (const p of S.P) { at[p.id] = p.at; dirs[p.id] = sealedSteps.get(p.id) ?? STAY; }
    const to = resolveMoves(at, dirs, S.n, S.trees);
    for (const p of S.P) {
      const wanted = step(p.at, dirs[p.id], S.n, S.trees);
      Object.assign(p, { from: p.at, at: to[p.id], want: dirs[p.id], bounced: wanted !== p.at && to[p.id] === p.at });
      eatFruitAt(p);
    }
    spawnFruit();
    Object.assign(S, { ph: 'move', tt: MOVE_T });
  }

  // bots: walk the shortest path to the best nearby fruit they can reach first, a little randomness on top
  function pathsFrom(from) {
    const dist = new Map([[from, 0]]), first = new Map(), queue = [from];
    while (queue.length) {
      const i = queue.shift();
      for (let d = 0; d < STAY; d++) {
        const j = step(i, d, S.n, S.trees);
        if (dist.has(j)) continue;
        dist.set(j, dist.get(i) + 1); first.set(j, i === from ? d : first.get(i)); queue.push(j);
      }
    }
    return { dist, first };
  }

  function botDir(p) {
    // skill = focus: weak bots often hop at random
    if (rng() > 0.2 + p.skill * 0.8) return Math.floor(rng() * DIRS.length);
    const mine = pathsFrom(p.at), others = S.P.filter((q) => q !== p).map((q) => pathsFrom(q.at).dist);
    let best = null;
    for (const f of S.fruit) {
      const d = mine.dist.get(f.i);
      if (d == null) continue;
      const rival = Math.min(99, ...others.map((o) => o.get(f.i) ?? 99));
      const score = f.v / (d + 0.5) * (rival < d ? 0.35 : rival === d ? 0.7 : 1);
      if (!best || score > best.score) best = { f, score };
    }
    return best ? mine.first.get(best.f.i) ?? STAY : STAY;
  }

  function tickPlan() {
    for (const p of S.P) if (p.bot && !p.lock && PLAN_T - S.tt >= p.think) plan(p.id, botDir(p));
    if (S.tt <= 0 || S.P.every((p) => p.lock)) resolveTurn();
  }

  function afterMove() {
    if (S.turn < S.turns) startPlan();
    else if (S.mode === 'attract') layOutMeadow('attract', S.P.map((p) => ({ ...p, score: 0 })), S.turns, 1);
    else Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  function advancePhase() {
    if (S.ph === 'plan') tickPlan();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startPlan();
    else if (S.ph === 'move') afterMove();
    else if (S.ph === 'final') onEnd();
  }

  // late joiner pops up on a free square
  function seatJoiner(human) {
    const free = freeCells();
    return { ...newPlayer(human.id, human.nick, human.color, false), at: free[Math.floor(rng() * free.length)] };
  }

  return {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      sealedSteps.clear();
      layOutMeadow('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), ATTRACT_TURNS, 1);
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      sealedSteps.clear();
      layOutMeadow('match', seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), Number(settings.turns) || DEFAULT_TURNS, INTRO);
    },
    // a changed step before the hop replaces the first: no public change then
    act(id, action) {
      const wasLocked = player(id)?.lock;
      return action.t === 'step' && plan(id, action.d) && !wasLocked;
    },
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf: (p) => p.score, seatJoiner });
      dropUnseatedPicks(sealedSteps, S.P);
      return true;
    },
    tick(dt) {
      const before = clockFreeKey(S);
      S.tt -= dt;
      advancePhase();
      return clockFreeKey(S) !== before;
    },
  };
}
