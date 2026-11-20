// Runs Basket Draft rules (secret simultaneous picks from private hands, pass the rest, reveal together, 3 scored rounds, cheese majority, pick clock, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.ts';
import { shuffleInPlace } from '../common/seat-shuffle.ts';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.ts';
import { noSettings } from '../common/match-settings.ts';
import { handFor, mixedDeck, scoreTableau, cheeseBonus, cardValue } from './basket-cards.ts';

const INTRO = 3, REVEAL_T = 1.6, SCORE_T = 5, FINAL_T = 12;
const ATTRACT_BOTS = 5, DEFAULT_CLOCK = 15, ROUNDS = 3;
const BOT_NAMES = ['Muffin', 'Crumbs', 'Pickles', 'Honey', 'Biscuit', 'Jam', 'Waffles', 'Peaches', 'Nibbles', 'Toast', 'Sprout', 'Brie', 'Scone', 'Pretzel'];

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph: intro|pick|reveal|score|final, tt, clock, rd, rounds, hs (hand size), pk (pick 1..hs), dir (+1 left, -1 right), total (cards this round), deck (cards not in a hand or tableau),
 *   res: { id: round score parts } | null (score/final), bonus: { id: cheese points } | null (final), P: [{ id, nick, color, bot, score, lock, in, hand (count), tab: kinds[], pick (kind, reveal only), cheese, skill }] }
 * viewFor(id): { id, rd, pk, hand: kinds[], pick: index | null } for that seat only.
 */
export function createBasketGame({ onEnd = () => {} } = {}) {
  // hands and sealed picks stay here: a seat sees only its own hand, everyone sees picks at the reveal
  const hands = new Map(), picks = new Map();
  let rng = Math.random;
  let S = freshState('attract', [], DEFAULT_CLOCK);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, lock: false, in: false, hand: 0, tab: [], pick: null, cheese: 0, skill: bot ? 0.35 + rng() * 0.55 : 0, at: 0 });
  const player = (id) => S.P.find((p) => p.id === id);
  const inRound = () => S.P.filter((p) => p.in);

  function freshState(mode, seats, clock) {
    hands.clear(); picks.clear();
    return { mode, ph: 'intro', tt: INTRO, clock, rd: 0, rounds: ROUNDS, hs: handFor(seats.length), pk: 0, dir: 1, total: 0, deck: 0, res: null, bonus: null, P: seats };
  }

  // fresh mixed deck each round, every seated player dealt a full hand
  function startRound(rd) {
    hands.clear();
    const hs = handFor(S.P.length), deck = mixedDeck(S.P.length * hs, rng);
    S.P.forEach((p, i) => { hands.set(p.id, deck.slice(i * hs, (i + 1) * hs)); Object.assign(p, { in: true, tab: [], hand: hs }); });
    Object.assign(S, { rd, hs, pk: 0, dir: rd % 2 ? 1 : -1, total: deck.length, deck: 0, res: null });
    startPick();
  }

  function startPick() {
    picks.clear();
    Object.assign(S, { ph: 'pick', tt: S.clock, pk: S.pk + 1 });
    for (const p of S.P) { p.lock = !p.in; p.pick = null; p.at = 0.8 + rng() * 3; }
  }

  function choose(id, i) {
    const p = player(id), hand = hands.get(id);
    if (S.ph !== 'pick' || !p?.in || !hand || !Number.isInteger(i) || i < 0 || i >= hand.length) return false;
    picks.set(id, i);
    p.lock = true;
    return true;
  }

  // everyone keeps their pick at once; then hands pass one seat along (left in rounds 1 and 3, right in round 2)
  function reveal() {
    for (const p of inRound()) {
      const hand = hands.get(p.id);
      const i = picks.get(p.id) ?? Math.floor(rng() * hand.length);
      const [kind] = hand.splice(i, 1);
      p.tab.push(kind);
      p.pick = kind;
      p.hand = hand.length;
    }
    picks.clear();
    Object.assign(S, { ph: 'reveal', tt: REVEAL_T });
  }

  function passHands() {
    const ring = inRound(), moved = ring.map((p) => hands.get(p.id));
    ring.forEach((p, k) => hands.set(p.id, moved[(k - S.dir + ring.length) % ring.length]));
  }

  function scoreRound() {
    S.res = {};
    for (const p of inRound()) {
      const parts = scoreTableau(p.tab);
      p.score += parts.total;
      p.cheese += p.tab.filter((c) => c === 'cheese').length;
      S.res[p.id] = parts;
    }
    Object.assign(S, { ph: 'score', tt: SCORE_T });
    for (const p of S.P) p.pick = null;
  }

  function afterScore() {
    if (S.rd < S.rounds) { startRound(S.rd + 1); return; }
    if (S.mode === 'attract') { startAttract(); return; }
    S.bonus = cheeseBonus(S.P);
    for (const p of S.P) p.score += S.bonus[p.id];
    Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  // bots: greedy card value, a random card as often as their skill misses
  function botPick(p) {
    const hand = hands.get(p.id);
    if (rng() > p.skill) return Math.floor(rng() * hand.length);
    let best = 0, bestValue = -Infinity;
    hand.forEach((kind, i) => {
      const value = cardValue(kind, p.tab, hand.length) + rng() * 0.01;
      if (value > bestValue) { bestValue = value; best = i; }
    });
    return best;
  }

  function tickPick() {
    for (const p of inRound()) if (p.bot && !p.lock && S.clock - S.tt >= p.at) choose(p.id, botPick(p));
    if (S.tt <= 0 || inRound().every((p) => p.lock)) reveal();
  }

  function afterReveal() {
    passHands();
    if (inRound().some((p) => hands.get(p.id).length)) startPick();
    else scoreRound();
  }

  function startAttract() {
    rng = Math.random;
    S = freshState('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), DEFAULT_CLOCK);
    S.tt = 1;
  }

  function advancePhase() {
    if (S.ph === 'pick') tickPick();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(1);
    else if (S.ph === 'reveal') afterReveal();
    else if (S.ph === 'score') afterScore();
    else onEnd();
  }

  // bot pick delays sit in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ at, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = noSettings() }) {
      rng = createSeededRng(seed);
      // shuffled seats: join order never decides whose hand you are passed
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      S = freshState('match', seats, Number(settings.clock) || DEFAULT_CLOCK);
    },
    // a second pick before the reveal replaces the first: no public change then
    act(id, action) {
      const wasLocked = player(id)?.lock;
      return action.t === 'pick' && choose(id, action.i) && !wasLocked;
    },
    viewFor(id) {
      const p = player(id);
      return p ? { id, rd: S.rd, pk: S.pk, hand: [...(hands.get(id) ?? [])], pick: picks.get(id) ?? null } : null;
    },
    // late joiners wait for the next deal; a leaver's hand and tableau go back to the deck pile
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf: (p) => p.score, seatJoiner: (h) => ({ ...newPlayer(h.id, h.nick, h.color, false), lock: true }) });
      const seated = new Set(S.P.map((p) => p.id));
      for (const id of [...hands.keys()]) if (!seated.has(id)) { hands.delete(id); picks.delete(id); }
      // every card of the round is in a hand, on a tableau, or back on the deck pile
      S.deck = S.total - inRound().reduce((a, p) => a + p.hand + p.tab.length, 0);
      return true;
    },
    tick(dt) {
      const before = changeKey();
      S.tt -= dt;
      advancePhase();
      return changeKey() !== before;
    },
  };
}
