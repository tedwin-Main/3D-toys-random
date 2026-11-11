// Runs Fence Fields rules (dots-and-boxes field, turns, pens, shot clock, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { reseatTurn } from '../common/turn-seats.js';
import { seatAttractBots, seatMatch, syncSeats } from '../common/turn-table.js';

const INTRO = 2.2, FINAL_T = 12, BOT_THINK = [0.7, 1.4];
const ATTRACT_BOTS = 4, ATTRACT_SIZE = 5, ATTRACT_CLOCK = 10, ATTRACT_SLOP = 0.15, DEFAULT_CLOCK = 15;
const BOT_NAMES = ['Shep', 'Woolly', 'Farmer Fi', 'Bo Peep', 'Rambo', 'Fluff', 'Hay Day', 'Barley', 'Clover', 'Mutton', 'Fenceworth', 'Posty', 'Gate Kate', 'Pip'];

/** field topology for C x R pens: edge ids (horizontal first), box (c, r) > its four edges, edge > the 1 or 2 boxes it borders */
export function fieldGrid(C, R) {
  const nh = C * (R + 1), nv = (C + 1) * R;
  const ends = (e) => (e < nh ? [[e % C, Math.floor(e / C)], [e % C + 1, Math.floor(e / C)]] : [[(e - nh) % (C + 1), Math.floor((e - nh) / (C + 1))], [(e - nh) % (C + 1), Math.floor((e - nh) / (C + 1)) + 1]]);
  const boxEdges = (c, r) => [r * C + c, (r + 1) * C + c, nh + r * (C + 1) + c, nh + r * (C + 1) + c + 1];
  const edgeBoxes = (e) => {
    const out = [];
    if (e < nh) { const c = e % C, r = Math.floor(e / C); if (r > 0) out.push((r - 1) * C + c); if (r < R) out.push(r * C + c); }
    else { const k = e - nh, c = k % (C + 1), r = Math.floor(k / (C + 1)); if (c > 0) out.push(r * C + c - 1); if (c < C) out.push(r * C + c); }
    return out;
  };
  return { C, R, nh, ne: nh + nv, nb: C * R, ends, boxEdges, edgeBoxes };
}

// field grows with the table unless the lobby host fixed a size
function sizeFor(seats, pick) {
  if (pick && pick !== 'auto') return +pick;
  return seats <= 2 ? 4 : seats <= 4 ? 5 : seats <= 7 ? 6 : seats <= 10 ? 7 : 8;
}

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, C, R, clock, E: '0'/'1' per edge, F: who built each edge, O: owner id per box (null = open), P: seats in turn order, turn, last, got, mv }
 */
export function createFenceGame({ onEnd = () => {} } = {}) {
  let rng = Math.random;
  let grid = fieldGrid(ATTRACT_SIZE, ATTRACT_SIZE);
  let S = newState('attract', [], ATTRACT_SIZE, ATTRACT_CLOCK);

  function newState(mode, seats, size, clock) {
    grid = fieldGrid(size, size);
    return { mode, ph: 'intro', tt: INTRO, C: size, R: size, clock, E: '0'.repeat(grid.ne), F: new Array(grid.ne).fill(null), O: new Array(grid.nb).fill(null), P: seats, turn: 0, last: -1, got: 0, mv: 0 };
  }
  // slop: how often a bot plays a careless fence
  const seatWith = (botSlop) => (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, ...(bot && { slop: botSlop() }) });
  const newPlayer = seatWith(() => 0.06 + rng() * 0.14);
  const placed = (e) => S.E[e] === '1';
  const boxSides = (b) => grid.boxEdges(b % grid.C, Math.floor(b / grid.C));
  const sides = (b) => boxSides(b).reduce((n, e) => n + placed(e), 0);
  const freeEdges = () => [...Array(grid.ne).keys()].filter((e) => !placed(e));
  const pickFrom = (list) => list[Math.floor(rng() * list.length)];

  function startTurn() {
    S.tt = S.clock;
    const p = S.P[S.turn];
    if (p) p.think = BOT_THINK[0] + rng() * (BOT_THINK[1] - BOT_THINK[0]);
  }

  function claimPens(id, e) {
    let got = 0;
    for (const b of grid.edgeBoxes(e)) if (sides(b) === 4 && S.O[b] == null) { S.O[b] = id; got++; }
    return got;
  }

  // one fence; closing pens scores them and keeps the turn; false when the move is not allowed
  function build(id, e) {
    if (S.ph !== 'play' || S.P[S.turn]?.id !== id || !Number.isInteger(e) || e < 0 || e >= grid.ne || placed(e)) return false;
    S.E = S.E.slice(0, e) + '1' + S.E.slice(e + 1);
    S.F[e] = id; S.last = e; S.mv++;
    S.got = claimPens(id, e);
    S.P[S.turn].score += S.got;
    if (!S.E.includes('0')) { S.ph = 'final'; S.tt = FINAL_T; return true; }
    if (!S.got) S.turn = (S.turn + 1) % S.P.length;
    startTurn();
    return true;
  }

  // pens the next player could sweep after edge e
  function chainIfGiven(e) {
    const E = S.E.split('');
    E[e] = '1';
    const sideCount = (b) => boxSides(b).reduce((n, x) => n + (E[x] === '1'), 0);
    let pens = 0, again = true;
    while (again) {
      again = false;
      for (let b = 0; b < grid.nb; b++) if (sideCount(b) === 3) { E[boxSides(b).find((x) => E[x] !== '1')] = '1'; pens++; again = true; }
    }
    return pens;
  }

  // bots: take any pen; else a fence that doesn't hand over a 3rd side; else the move that gives away the smallest chain
  function botMove(p) {
    const free = freeEdges(), sloppy = rng() < (p.slop ?? 0.1);
    const closing = free.filter((e) => grid.edgeBoxes(e).some((b) => sides(b) === 3));
    if (closing.length && !(sloppy && rng() < 0.4)) return pickFrom(closing);
    const safe = free.filter((e) => grid.edgeBoxes(e).every((b) => sides(b) < 2));
    if (safe.length && !sloppy) return pickFrom(safe);
    if (sloppy) return pickFrom(free);
    let best = null, fewest = Infinity;
    for (const e of free) { const pens = chainIfGiven(e) + rng() * 0.1; if (pens < fewest) { fewest = pens; best = e; } }
    return best;
  }

  function tickPlay(dt) {
    const p = S.P[S.turn];
    if (!p) { S.turn = 0; startTurn(); }
    else if (p.bot) { p.think -= dt; if (p.think <= 0) build(p.id, botMove(p)); }
    // timeout: a random fence for the idle player; no planning, so waiting out the clock never beats playing
    else if (S.tt <= 0) build(p.id, pickFrom(freeEdges()));
  }

  function startAttract() {
    rng = Math.random;
    S = newState('attract', [], ATTRACT_SIZE, ATTRACT_CLOCK);
    S.P = seatAttractBots(ATTRACT_BOTS, BOT_NAMES, seatWith(() => ATTRACT_SLOP));
    S.tt = 1;
  }

  function advancePhase(dt) {
    if (S.ph === 'play') tickPlay(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') { S.ph = 'play'; S.turn = 0; startTurn(); }
    else if (S.mode === 'attract') startAttract();
    else onEnd();
  }

  const changeKey = () => `${S.ph}|${S.mv}|${S.turn}|${S.P.length}`;

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      // shuffled seats: the lobby host doesn't always start
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      S = newState('match', seats, sizeFor(seats.length, settings.size), Number(settings.clock) || DEFAULT_CLOCK);
    },
    act: (id, action) => action.t === 'edge' && build(id, action.e),
    // the turn stays with whoever had it; if they left, the next seat plays
    syncRoster(humans) {
      const before = S.P;
      S.P = syncSeats(before, humans, { scoreOf: (p) => p.score, seatJoiner: (h) => newPlayer(h.id, h.nick, h.color, false) });
      const seat = reseatTurn(before, S.turn, S.P);
      S.turn = seat.turn;
      if (seat.left) startTurn();
      return true;
    },
    tick(dt) {
      const before = changeKey();
      S.tt -= dt;
      advancePhase(dt);
      return changeKey() !== before;
    },
  };
}
