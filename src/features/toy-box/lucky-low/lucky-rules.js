// Runs Lucky Low rules (secret picks, lowest unique number, bots, round clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey, dropUnseatedPicks } from '../common/turn-table.js';

const INTRO = 2.5, PICK_T = 12, REVEAL_T = 6.5, FINAL_T = 12;
const ATTRACT_BOTS = 6, ATTRACT_ROUNDS = 6, DEFAULT_ROUNDS = 10;
const BOT_NAMES = ['Lucky', 'Seven', 'Odds', 'Clover', 'Dicey', 'Fortuna', 'Penny', 'Wishbone', 'Horseshoe', 'Ladybug', 'Jinx', 'Charm', 'Ace', 'Rabbit'];
const rangeFor = (seats) => Math.max(6, Math.min(16, seats + 3));

/** picks {id: v} > { win: id|null, v }: the lowest number only one player picked */
export function lowestUnique(picks) {
  const count = new Map();
  for (const v of Object.values(picks)) if (v != null) count.set(v, (count.get(v) ?? 0) + 1);
  const lone = [...count].filter(([, n]) => n === 1).map(([v]) => v).sort((a, b) => a - b)[0];
  if (lone == null) return { win: null, v: null };
  return { win: Object.keys(picks).find((id) => picks[id] === lone), v: lone };
}

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, rd, rounds, K, res: { picks: {id: v}, win: id|null, v } (reveal only), P: [{ id, nick, color, bot, score, lock, at, bias }] }
 */
export function createLuckyGame({ onEnd = () => {} } = {}) {
  // picks stay here until the reveal: never part of the published state
  const sealedPicks = new Map();
  let rng = Math.random;
  let S = freshState('attract', ATTRACT_ROUNDS, 1);

  function freshState(mode, rounds, introTime) {
    return { mode, ph: 'intro', tt: introTime, rd: 1, rounds, K: 8, res: null, P: [] };
  }
  const player = (id) => S.P.find((p) => p.id === id);
  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, lock: false, at: 0, bias: 0.6 + rng() * 1.4 });

  // Game > rules: secret picks 1..K; lowest pick nobody shares wins and scores its value
  function startRound(rd) {
    sealedPicks.clear();
    Object.assign(S, { rd, ph: 'pick', tt: PICK_T, K: rangeFor(S.P.length), res: null });
    for (const p of S.P) { p.lock = false; p.at = 1 + rng() * 8; }
  }

  function pick(id, v) {
    const p = player(id);
    if (!p || S.ph !== 'pick' || !Number.isInteger(v) || v < 1 || v > S.K) return false;
    sealedPicks.set(id, v); p.lock = true;
    return true;
  }

  function reveal() {
    const picks = {};
    for (const p of S.P) picks[p.id] = sealedPicks.get(p.id) ?? null;
    const lowest = lowestUnique(picks);
    const winner = lowest.win != null ? player(+lowest.win) : null;
    if (winner) winner.score += lowest.v;
    Object.assign(S, { ph: 'reveal', tt: REVEAL_T, res: { picks, win: winner?.id ?? null, v: lowest.v } });
  }

  // bots: lean low but scatter; each bot has its own taste for bigger numbers
  function botPick(p) {
    const hi = Math.min(S.K, Math.max(3, Math.round(S.P.length * 0.9)));
    return Math.min(S.K, 1 + Math.floor(hi * rng() ** p.bias));
  }

  function tickPick() {
    for (const p of S.P) if (p.bot && !p.lock && PICK_T - S.tt >= p.at) pick(p.id, botPick(p));
    if (S.tt <= 0 || S.P.every((p) => p.lock)) reveal();
  }

  function afterReveal() {
    if (S.rd < S.rounds) startRound(S.rd + 1);
    else if (S.mode === 'attract') { for (const p of S.P) p.score = 0; startRound(1); }
    else Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  function advancePhase() {
    if (S.ph === 'pick') tickPick();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(1);
    else if (S.ph === 'reveal') afterReveal();
    else if (S.ph === 'final') onEnd();
  }

  return {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      sealedPicks.clear();
      S = freshState('attract', ATTRACT_ROUNDS, 1);
      S.P = seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer);
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      sealedPicks.clear();
      S = freshState('match', Number(settings.rounds) || DEFAULT_ROUNDS, INTRO);
      S.P = seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer });
      S.K = rangeFor(S.P.length);
    },
    // a second pick before the reveal replaces the first: no public change then
    act(id, action) {
      const wasLocked = player(id)?.lock;
      return action.t === 'pick' && pick(id, action.v) && !wasLocked;
    },
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf: (p) => p.score, seatJoiner: (h) => newPlayer(h.id, h.nick, h.color, false) });
      dropUnseatedPicks(sealedPicks, S.P);
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
