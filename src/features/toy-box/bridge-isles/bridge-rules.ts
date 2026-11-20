// Runs Bridge Isles rules (two teams on a hex sea, stepping stones, pie-rule swap, teammates rotate, best-of rounds, turn clock, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.ts';
import { shuffleInPlace } from '../common/seat-shuffle.ts';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.ts';
import { noSettings } from '../common/match-settings.ts';
import { chainFor, mirrorCell } from './bridge-board.ts';
import { pickStone, wantsSwap } from './bridge-bots.ts';

const INTRO = 3, ROUND_T = 4.5, FINAL_T = 12;
const ATTRACT_BOTS = 4, DEFAULT_CLOCK = 15, DEFAULT_ROUNDS = 3;
const BOT_NAMES = ['Pebble', 'Driftwood', 'Shelly', 'Barnacle', 'Kelp', 'Sandy', 'Coralie', 'Marlin', 'Pearl', 'Tide', 'Skipper', 'Gull', 'Anchor', 'Cove'];
export const TEAM_NAMES = ['Coral', 'Lagoon'];
/** board side grows with the table: 7, 9 or 11 */
export const sizeFor = (seats: number) => (seats <= 4 ? 7 : seats <= 9 ? 9 : 11);

/** seat whose stone it is: teammates take the team's moves in rotation */
export function moverOf(state) {
  const team = state.P.filter((p) => p.team === state.team);
  return team.length ? team[state.ptr[state.team] % team.length] : null;
}

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph: intro|play|round|final, tt, clock, rd, rounds, n, B (n*n of '0' | '1' Coral | '2' Lagoon), team (to move), first (opened this round), ptr: [k0, k1],
 *   mv, swapOk, last: { i, by, mv, swap } | null, win: { team, path } | null, wins: [w0, w1], P: [{ id, nick, color, bot, team, score, skill }] }
 * score = rounds the seat's team has won.
 */
export function createBridgeGame({ onEnd = () => {} } = {}) {
  let rng = Math.random;
  let S = freshState('attract', [], DEFAULT_CLOCK, DEFAULT_ROUNDS);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, team: 0, score: 0, skill: bot ? 0.35 + rng() * 0.55 : 0 });

  function freshState(mode, seats, clock, rounds) {
    const n = sizeFor(seats.length);
    return { mode, ph: 'intro', tt: INTRO, clock, rd: 1, rounds, n, B: '0'.repeat(n * n), team: 0, first: 0, ptr: [0, 0], mv: 0, swapOk: false, last: null, win: null, wins: [0, 0], P: seats };
  }

  const members = (team) => S.P.filter((p) => p.team === team);
  const mover = () => moverOf(S);

  // teams by lot: shuffled seats alternate Coral / Lagoon, so sizes differ by at most one
  function dealTeams(seats) {
    shuffleInPlace(seats, rng).forEach((p, i) => (p.team = i % 2));
    return seats;
  }

  function startRound(rd, first) {
    Object.assign(S, { ph: 'play', rd, B: '0'.repeat(S.n * S.n), team: first, first, mv: 0, swapOk: false, last: null, win: null });
    startTurn();
  }

  function startTurn() {
    S.tt = S.clock;
    const p = mover();
    if (p) p.think = 0.8 + rng() * 1.2;
  }

  // the team that moved hands the turn over; its next teammate is up on its following move
  function passTurn() {
    S.ptr[S.team]++;
    S.team = 1 - S.team;
    startTurn();
  }

  function endRound(team, path) {
    S.wins[team]++;
    for (const p of S.P) p.score = S.wins[p.team];
    Object.assign(S, { ph: 'round', tt: ROUND_T, win: { team, path } });
  }

  function setCell(i, mark) { S.B = S.B.slice(0, i) + mark + S.B.slice(i + 1); }

  function place(id, i) {
    const p = mover();
    if (S.ph !== 'play' || !p || p.id !== id || !Number.isInteger(i) || i < 0 || i >= S.B.length || S.B[i] !== '0') return false;
    setCell(i, String(S.team + 1));
    S.mv++;
    S.swapOk = S.mv === 1;
    S.last = { i, by: id, mv: S.mv, swap: false };
    const path = chainFor(S.B, S.n, S.team);
    if (path) endRound(S.team, path);
    else passTurn();
    return true;
  }

  // pie rule: right after the opening stone, the other team may take it over (mirrored onto its own banks) instead of placing
  function swap(id) {
    const p = mover();
    if (S.ph !== 'play' || !p || p.id !== id || !S.swapOk) return false;
    const was = S.B.search(/[12]/), at = mirrorCell(was, S.n);
    setCell(was, '0');
    setCell(at, String(S.team + 1));
    S.mv++;
    S.swapOk = false;
    S.last = { i: at, by: id, mv: S.mv, swap: true };
    passTurn();
    return true;
  }

  const freeCells = () => [...S.B].map((cell, i) => (cell === '0' ? i : -1)).filter((i) => i >= 0);

  function tickPlay(dt) {
    const p = mover();
    // a team with nobody left forfeits the round
    if (!p) { endRound(1 - S.team, null); return; }
    if (p.bot) {
      p.think -= dt;
      if (p.think > 0) return;
      if (S.swapOk && wantsSwap(S, p.skill, rng)) swap(p.id);
      else place(p.id, pickStone(S, S.team, p.skill, rng));
    }
    // turn clock ran out: a random free cell, so waiting never beats choosing
    else if (S.tt <= 0) { const free = freeCells(); place(p.id, free[Math.floor(rng() * free.length)]); }
  }

  function afterRound() {
    const need = Math.floor(S.rounds / 2) + 1;
    if (S.wins.some((w) => w >= need) || S.rd >= S.rounds) {
      if (S.mode === 'attract') { startAttract(); return; }
      Object.assign(S, { ph: 'final', tt: FINAL_T });
    } else startRound(S.rd + 1, 1 - S.first);
  }

  function startAttract() {
    rng = Math.random;
    S = freshState('attract', dealTeams(seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer)), DEFAULT_CLOCK, DEFAULT_ROUNDS);
    S.tt = 1;
  }

  function advancePhase(dt) {
    if (S.ph === 'play') tickPlay(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(1, S.first);
    else if (S.ph === 'round') afterRound();
    else onEnd();
  }

  // bot think time ticks down in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ think, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = noSettings() }) {
      rng = createSeededRng(seed);
      const seats = dealTeams(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }));
      S = freshState('match', seats, Number(settings.clock) || DEFAULT_CLOCK, Number(settings.rounds) || DEFAULT_ROUNDS);
      // random opening team
      S.first = rng() < 0.5 ? 0 : 1;
    },
    act(id, action) {
      if (action.t === 'stone') return place(id, action.i);
      if (action.t === 'swap') return swap(id);
      return false;
    },
    // a late joiner goes to the smaller team; a mover who left hands the turn to the next teammate
    syncRoster(humans) {
      const before = mover();
      S.P = syncSeats(S.P, humans, {
        scoreOf: (p) => p.score,
        seatJoiner: (h, kept) => {
          const seat = newPlayer(h.id, h.nick, h.color, false), sizes = [0, 1].map((t) => kept.filter((p) => p.team === t).length);
          seat.team = sizes[0] === sizes[1] ? (rng() < 0.5 ? 0 : 1) : sizes[0] < sizes[1] ? 0 : 1;
          seat.score = S.wins[seat.team];
          return seat;
        },
      });
      if (S.ph === 'play' && before && mover() !== before) {
        const m = members(S.team), k = m.indexOf(before);
        if (k >= 0) S.ptr[S.team] = k; else startTurn();
      }
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
