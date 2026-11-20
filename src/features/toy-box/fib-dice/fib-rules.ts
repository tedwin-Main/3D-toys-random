// Runs Fib Dice rules (hidden cups, rising bids with wild stars, "Fib!" challenges, lose a die, challenge cap, turn clock, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.ts';
import { shuffleInPlace } from '../common/seat-shuffle.ts';
import { reseatTurn } from '../common/turn-seats.ts';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.ts';
import { noSettings } from '../common/match-settings.ts';
import { isRaise, minRaise, countFace } from './fib-bids.ts';
import { botMove } from './fib-bots.ts';

const INTRO = 3, REVEAL_T = 5.5, FINAL_T = 12;
const ATTRACT_BOTS = 5, DEFAULT_CLOCK = 15, DEFAULT_CAP = 15;
const BOT_NAMES = ['Shaker', 'Snake Eyes', 'Bluffy', 'Pips', 'Lucky Lou', 'Rattles', 'Boxcar', 'Fibber', 'Cubey', 'Tumbler', 'Rolly', 'Stacks', 'Doubles', 'Wildstar'];
/** dice per cup by table size: 5 up to 6 seats, 4 up to 10, 3 beyond */
export const diceFor = (seats: number) => (seats <= 6 ? 5 : seats <= 10 ? 4 : 3);

/** seats still holding dice */
export const alive = (state) => state.P.filter((p) => p.score > 0);
export const diceOnTable = (state) => state.P.reduce((a, p) => a + p.score, 0);

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph: intro|bid|reveal|final, tt, clock, cap, ch (challenges so far), rd, turn, bid: { n, f, by } | null,
 *   res: { cups: { id: dice[] }, n, f, count, caller, bidder, loser } | null (reveal only), P: [{ id, nick, color, bot, score (dice left), skill }] }
 * viewFor(id): { id, rd, dice } for that seat only.
 */
export function createFibGame({ onEnd = () => {} } = {}) {
  // each seat's dice: stay here, published to everyone only at the reveal
  const cups = new Map();
  let rng = Math.random;
  let S = freshState('attract', [], DEFAULT_CLOCK, DEFAULT_CAP);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, skill: bot ? 0.35 + rng() * 0.55 : 0 });
  const player = (id) => S.P.find((p) => p.id === id);

  function freshState(mode, seats, clock, cap) {
    const start = diceFor(seats.length);
    for (const p of seats) p.score = start;
    cups.clear();
    return { mode, ph: 'intro', tt: INTRO, clock, cap, ch: 0, rd: 0, turn: 0, bid: null, res: null, P: seats };
  }

  const roll = (k) => Array.from({ length: k }, () => 1 + Math.floor(rng() * 6));

  // seat index after `from` that still holds dice (from itself when it is the only one)
  function nextAlive(from) {
    const n = S.P.length;
    for (let k = 1; k <= n; k++) { const i = (from + k) % n; if (S.P[i].score > 0) return i; }
    return from;
  }

  function startRound(opener) {
    cups.clear();
    for (const p of S.P) if (p.score > 0) cups.set(p.id, roll(p.score));
    Object.assign(S, { ph: 'bid', rd: S.rd + 1, turn: S.P[opener]?.score > 0 ? opener : nextAlive(opener), bid: null, res: null });
    startTurn();
  }

  function startTurn() {
    S.tt = S.clock;
    const p = S.P[S.turn];
    if (p) p.think = 1 + rng() * 1.6;
  }

  function placeBid(id, n, f) {
    const p = S.P[S.turn];
    if (S.ph !== 'bid' || !p || p.id !== id || !Number.isInteger(n) || !Number.isInteger(f) || f < 2 || f > 6 || n < 1 || n > diceOnTable(S)) return false;
    if (!isRaise({ n, f }, S.bid)) return false;
    S.bid = { n, f, by: id };
    S.turn = nextAlive(S.turn);
    startTurn();
    return true;
  }

  // "Fib!": every cup lifts; a true bid costs the caller a die, a false one the bidder
  function call(id) {
    const p = S.P[S.turn], bidder = S.bid && player(S.bid.by);
    if (S.ph !== 'bid' || !p || p.id !== id || !bidder || bidder === p) return false;
    const shown = Object.fromEntries([...cups].map(([who, dice]) => [who, [...dice]]));
    const count = countFace(shown, S.bid.f), loser = count >= S.bid.n ? p : bidder;
    loser.score--;
    S.ch++;
    S.res = { cups: shown, n: S.bid.n, f: S.bid.f, count, caller: p.id, bidder: bidder.id, loser: loser.id };
    Object.assign(S, { ph: 'reveal', tt: REVEAL_T });
    return true;
  }

  function act(id, action) {
    if (action.t === 'bid') return placeBid(id, action.n, action.f);
    if (action.t === 'call') return call(id);
    return false;
  }

  function tickBid(dt) {
    const p = S.P[S.turn];
    if (!p || p.score <= 0) { S.turn = nextAlive(S.turn); startTurn(); return; }
    if (p.bot) {
      p.think -= dt;
      if (p.think <= 0) act(p.id, botMove(cups.get(p.id) ?? [], diceOnTable(S), S.bid, p.skill, rng));
    }
    // turn clock ran out: the smallest raise, or "Fib!" when nothing is left to raise to
    else if (S.tt <= 0) {
      const r = minRaise(S.bid, diceOnTable(S));
      if (!(r && placeBid(p.id, r.n, r.f))) call(p.id);
    }
  }

  // the loser opens the next round (or the seat after them once they are out)
  function afterReveal() {
    const loserAt = S.P.findIndex((p) => p.id === S.res.loser);
    if (alive(S).length <= 1 || S.ch >= S.cap) {
      if (S.mode === 'attract') { startAttract(); return; }
      Object.assign(S, { ph: 'final', tt: FINAL_T, bid: null });
      return;
    }
    startRound(loserAt >= 0 ? loserAt : 0);
  }

  function startAttract() {
    rng = Math.random;
    S = freshState('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), DEFAULT_CLOCK, 8);
    S.tt = 1;
  }

  function advancePhase(dt) {
    if (S.ph === 'bid') tickBid(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(Math.floor(rng() * S.P.length));
    else if (S.ph === 'reveal') afterReveal();
    else onEnd();
  }

  // bot think time ticks down in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ think, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = noSettings() }) {
      rng = createSeededRng(seed);
      // shuffled seats: join order never decides who sits next to whom
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      S = freshState('match', seats, Number(settings.clock) || DEFAULT_CLOCK, Number(settings.rounds) || DEFAULT_CAP);
    },
    act,
    viewFor(id) {
      const p = player(id);
      return p ? { id, rd: S.rd, dice: cups.get(id) ?? [] } : null;
    },
    // a late joiner sits in with as few dice as the shortest cup still playing; a leaver's bid is withdrawn
    syncRoster(humans) {
      const before = S.P, fewest = Math.max(1, Math.min(...alive(S).map((p) => p.score), diceFor(S.P.length)));
      S.P = syncSeats(before, humans, {
        scoreOf: (p) => p.score,
        seatJoiner: (h) => {
          const seat = newPlayer(h.id, h.nick, h.color, false);
          seat.score = fewest;
          if (S.ph === 'bid' || S.ph === 'reveal') cups.set(h.id, roll(seat.score));
          return seat;
        },
      });
      const seated = new Set(S.P.map((p) => p.id));
      for (const id of [...cups.keys()]) if (!seated.has(id)) cups.delete(id);
      if (S.bid && !seated.has(S.bid.by)) S.bid = null;
      const seat = reseatTurn(before, S.turn, S.P);
      S.turn = seat.turn;
      if (seat.left && S.ph === 'bid') startTurn();
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
