// Runs Bank or Bust rules (shared pot, dice, busts, bots, round clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { seatAttractBots, seatMatch, syncSeats } from '../common/turn-table.js';

export const TUMBLE = 1.3; // dice in the air: roll phase length, page animation uses the same
export const BANK_GRACE = 0.35; // a bank sent just before the dice left still counts
const WAIT = 3.2, BUST_SHOW = 2.6, ROUND_SHOW = 3.5, INTRO = 2.5, FINAL_SHOW = 12, MAX_ROLLS = 40;
const ATTRACT_BOTS = 6, DEFAULT_ROUNDS = 5;
const BOT_NAMES = ['Lucky Lou', 'Dicey', 'Snake Eyes', 'High Roller', 'Penny', 'Cashout', 'Boxcars', 'Rattles', 'Gambit', 'Jackpot', 'Lady Luck', 'Odds', 'Ace', 'Chip'];

/**
 * onEnd(): final scores ran out (match over).
 * state.P: [{ id, nick, color, bot, total, bank: round winnings once banked (null = still in), bust, nerve }]
 */
export function createBankGame({ onEnd = () => {} } = {}) {
  let rng = Math.random;
  let S = freshState('attract', DEFAULT_ROUNDS, 1);

  function freshState(mode, rounds, introTime) {
    return { mode, ph: 'intro', tt: introTime, rd: 1, rounds, pot: 0, dice: [3, 4], roll: 0, rollAge: 9, last: '', P: [] };
  }
  const player = (id) => S.P.find((p) => p.id === id);
  const standing = () => S.P.filter((p) => p.bank == null && !p.bust);
  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, total: 0, bank: null, bust: false, nerve: 10 + Math.floor(rng() * 26) });
  const rollDie = () => 1 + Math.floor(rng() * 6);

  // Game > rules: shared pot for everyone still in; one 1 = round bust, two 1s = total wiped; first roll of a round is safe
  function startRound(rd) {
    // first roll comes quickly: nothing to bank yet
    Object.assign(S, { rd, ph: 'wait', tt: 1.4, pot: 0, roll: 0, last: '' });
    for (const p of S.P) { p.bank = null; p.bust = false; }
  }

  function doBank(id) {
    const p = player(id);
    if (!p || p.bank != null || p.bust || S.roll === 0) return false;
    if (S.ph !== 'wait' && !(S.ph === 'roll' && S.rollAge < BANK_GRACE)) return false;
    p.bank = S.pot; p.total += S.pot;
    S.last = `b:${id}`;
    return true;
  }

  function roll() {
    let a = rollDie(), b = rollDie();
    if (S.roll === 0) while (a === 1 || b === 1) { a = rollDie(); b = rollDie(); }
    Object.assign(S, { ph: 'roll', tt: TUMBLE, dice: [a, b], roll: S.roll + 1, rollAge: 0, last: '' });
  }

  function resolveRoll() {
    const [a, b] = S.dice, ones = (a === 1) + (b === 1);
    if (ones) {
      for (const p of standing()) { p.bust = true; if (ones === 2) p.total = 0; }
      Object.assign(S, { ph: 'bust', tt: BUST_SHOW, last: ones === 2 ? 'snake' : 'bust' });
      return;
    }
    // doubles count twice
    S.pot += a === b ? (a + b) * 2 : a + b;
    Object.assign(S, { ph: 'wait', tt: WAIT, last: a === b ? 'dbl' : 'add' });
    if (!standing().length || S.roll >= MAX_ROLLS) endRound();
  }

  function endRound() {
    // anyone still in when the round is cut off (roll cap) keeps the pot
    for (const p of standing()) { p.bank = S.pot; p.total += S.pot; }
    Object.assign(S, { ph: 'round', tt: ROUND_SHOW });
  }

  // bots: bank once the pot reaches their nerve; push harder when behind late in the game
  function botsThink() {
    const lead = Math.max(...S.P.map((p) => p.total));
    for (const p of standing()) {
      if (!p.bot) continue;
      const behind = lead - p.total, late = S.rd >= S.rounds - 1;
      let want = p.nerve + (late && behind > 0 ? Math.min(behind, 40) : 0);
      if (late && S.rd === S.rounds && p.total + S.pot > lead + 2 && p.total < lead) want = 0;
      if (S.pot >= want && rng() < 0.8) doBank(p.id);
    }
  }

  function tickWait() {
    if (!standing().length) return endRound();
    if (S.roll > 0 && S.tt < WAIT - 0.9 - rng() * 0.6) botsThink();
    if (S.tt <= 0) roll();
  }

  function afterRound() {
    if (S.rd < S.rounds) startRound(S.rd + 1);
    else if (S.mode === 'attract') { for (const p of S.P) p.total = 0; startRound(1); }
    else Object.assign(S, { ph: 'final', tt: FINAL_SHOW });
  }

  function advancePhase() {
    if (S.ph === 'wait') tickWait();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(1);
    else if (S.ph === 'roll') resolveRoll();
    else if (S.ph === 'bust') endRound();
    else if (S.ph === 'round') afterRound();
    else if (S.ph === 'final') onEnd();
  }

  // what guests must hear about at once; the clocks between changes run on each page
  const changeKey = () => `${S.ph}|${S.roll}|${S.last}|${S.P.map((p) => `${p.bank}${p.bust}`).join()}`;

  // late joiner: sits out this round, starts level with last place
  function seatJoiner(human, seats) {
    const joiner = newPlayer(human.id, human.nick, human.color, false);
    joiner.total = seats.length ? Math.min(...seats.map((p) => p.total)) : 0;
    if (S.ph !== 'intro') joiner.bank = 0;
    return joiner;
  }

  return {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      S = freshState('attract', DEFAULT_ROUNDS, 1);
      S.P = seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer);
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      S = freshState('match', Number(settings.rounds) || DEFAULT_ROUNDS, INTRO);
      S.P = seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer });
    },
    act: (id, action) => action.t === 'bank' && doBank(id),
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf: (p) => p.total, seatJoiner });
      return true;
    },
    tick(dt) {
      const before = changeKey();
      S.tt -= dt; S.rollAge += dt;
      advancePhase();
      return changeKey() !== before;
    },
  };
}
