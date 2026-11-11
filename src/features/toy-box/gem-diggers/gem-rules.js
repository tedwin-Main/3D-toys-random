// Runs Gem Diggers rules (hidden field, turns, gems, bombs, hint numbers, shot clock, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { shuffleInPlace } from '../common/seat-shuffle.js';
import { reseatTurn } from '../common/turn-seats.js';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.js';

export const GEM_PTS = 3, BOMB_PTS = -2;
const INTRO = 2.5, FINAL_T = 12, GEM_FRAC = 0.14, BOMB_FRAC = 0.12;
const ATTRACT_BOTS = 4, DEFAULT_CLOCK = 15;
const BOT_NAMES = ['Digby', 'Pickaxe Pat', 'Molely', 'Rocky', 'Gemma', 'Shovelina', 'Burrow', 'Nugget', 'Quartz', 'Spade', 'Tunnel Tim', 'Ore-lando', 'Pebbles', 'Drillbit'];
const sizeFor = (seats) => (seats <= 4 ? 8 : seats <= 8 ? 10 : 12);

// tells pages a fresh field from the one they drew last; says nothing about what is buried
const newFieldId = () => 1 + Math.floor(Math.random() * 2 ** 30);

function neighbors(i, n) {
  const x = i % n, y = Math.floor(i / n), out = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    if (!dx && !dy) continue;
    const nx = x + dx, ny = y + dy;
    if (nx >= 0 && ny >= 0 && nx < n && ny < n) out.push(ny * n + nx);
  }
  return out;
}

/** gems still buried, from the public state alone */
export const gemsLeft = (state) => state.gems - state.rev.filter((cell) => cell?.k === 'g').length;

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, clock, n, field (id of this field, new per match), gems (total buried), rev: [null | { k: 'g'|'b'|'e', nb, ng, by }], turn, last: { i, k, by, mv }, mv, P: [{ id, nick, color, bot, score, gems, skill }] }
 */
export function createGemGame({ onEnd = () => {} } = {}) {
  // what lies under each tile ('g' | 'b' | 'e'): stays here, a tile is published only once dug
  let buried = [];
  let rng = Math.random;
  let S = newField('attract', [], DEFAULT_CLOCK);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, gems: 0, skill: bot ? 0.35 + rng() * 0.55 : 0 });

  function buryField(n) {
    const tiles = n * n, order = shuffleInPlace([...Array(tiles).keys()], rng);
    const gems = Math.round(tiles * GEM_FRAC), bombs = Math.round(tiles * BOMB_FRAC);
    buried = new Array(tiles).fill('e');
    order.slice(0, gems).forEach((i) => (buried[i] = 'g'));
    order.slice(gems, gems + bombs).forEach((i) => (buried[i] = 'b'));
    return gems;
  }

  function newField(mode, seats, clock) {
    const n = sizeFor(seats.length), gems = buryField(n);
    return { mode, ph: 'intro', tt: INTRO, clock, n, field: newFieldId(), gems, rev: new Array(n * n).fill(null), turn: 0, last: null, mv: 0, P: seats };
  }

  function cellInfo(i) {
    const around = neighbors(i, S.n);
    return { k: buried[i], nb: around.filter((j) => buried[j] === 'b').length, ng: around.filter((j) => buried[j] === 'g').length };
  }

  function startTurn() {
    S.tt = S.clock;
    const p = S.P[S.turn];
    if (p) p.think = 0.9 + rng() * 1.3;
  }

  // open meadow: flood out to the next hint numbers (never uncovers gems or bombs)
  function floodOpen(from, by) {
    const stack = [from];
    while (stack.length) {
      for (const j of neighbors(stack.pop(), S.n)) {
        if (S.rev[j]) continue;
        const cell = cellInfo(j);
        if (cell.k !== 'e') continue;
        S.rev[j] = { ...cell, by };
        if (!cell.nb && !cell.ng) stack.push(j);
      }
    }
  }

  // one dig by the player whose turn it is; false when not allowed
  function dig(id, i) {
    const p = S.P[S.turn];
    if (S.ph !== 'play' || !p || p.id !== id || !Number.isInteger(i) || i < 0 || i >= S.rev.length || S.rev[i]) return false;
    const cell = cellInfo(i);
    S.rev[i] = { ...cell, by: id };
    S.mv++;
    S.last = { i, k: cell.k, by: id, mv: S.mv };
    if (cell.k === 'g') { p.score += GEM_PTS; p.gems++; }
    else if (cell.k === 'b') p.score += BOMB_PTS;
    else if (!cell.nb && !cell.ng) floodOpen(i, id);
    if (gemsLeft(S) === 0) { Object.assign(S, { ph: 'final', tt: FINAL_T }); return true; }
    // gem keeps the shovel; anything else passes it on
    if (cell.k !== 'g') S.turn = (S.turn + 1) % S.P.length;
    startTurn();
    return true;
  }

  const hiddenTiles = () => S.rev.map((cell, i) => (cell ? -1 : i)).filter((i) => i >= 0);

  // gem / bomb odds for hidden tile i from the hint numbers around it (bots read only what is dug, like a player)
  function tileOdds(i, fallback) {
    let sureEmpty = false, sureGem = false, hints = 0, bombSum = 0, gemSum = 0;
    for (const j of neighbors(i, S.n)) {
      const hint = S.rev[j];
      if (!hint || hint.k !== 'e') continue;
      const around = neighbors(j, S.n), hiddenAround = around.filter((q) => !S.rev[q]).length;
      const bombsOpen = hint.nb - around.filter((q) => S.rev[q]?.k === 'b').length, gemsOpen = hint.ng - around.filter((q) => S.rev[q]?.k === 'g').length;
      const bombOdds = bombsOpen / hiddenAround, gemOdds = gemsOpen / hiddenAround;
      if (bombsOpen === 0 && gemsOpen === 0) sureEmpty = true;
      if (bombOdds === 0 && gemOdds === 1) sureGem = true;
      bombSum += bombOdds; gemSum += gemOdds; hints++;
    }
    if (sureEmpty) return { bomb: 0, gem: 0 };
    if (sureGem) return { bomb: 0, gem: 1 };
    return hints ? { bomb: bombSum / hints, gem: gemSum / hints } : fallback;
  }

  // bots: dig the best expected value, blurred by low skill
  function botMove(p) {
    const hidden = hiddenTiles();
    const bombsLeft = Math.round(S.n * S.n * BOMB_FRAC) - S.rev.filter((cell) => cell?.k === 'b').length;
    const fallback = { bomb: Math.max(0, bombsLeft) / Math.max(1, hidden.length), gem: gemsLeft(S) / Math.max(1, hidden.length) };
    let best = null;
    for (const i of hidden) {
      const odds = tileOdds(i, fallback);
      const value = odds.gem * GEM_PTS + odds.bomb * BOMB_PTS - (1 - odds.gem - odds.bomb) * 0.4 + (rng() - 0.5) * (1.2 - p.skill) * 2;
      if (!best || value > best.value) best = { i, value };
    }
    return best?.i;
  }

  function tickPlay(dt) {
    const p = S.P[S.turn];
    if (!p) { S.turn = 0; startTurn(); }
    else if (p.bot) { p.think -= dt; if (p.think <= 0) dig(p.id, botMove(p)); }
    // shot clock ran out: a random hidden tile, so waiting never beats choosing
    else if (S.tt <= 0) { const hidden = hiddenTiles(); dig(p.id, hidden[Math.floor(rng() * hidden.length)]); }
  }

  function startAttract() {
    rng = Math.random;
    S = newField('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), DEFAULT_CLOCK);
    S.tt = 1;
  }

  function advancePhase(dt) {
    if (S.ph === 'play') tickPlay(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') { S.ph = 'play'; S.turn = 0; startTurn(); }
    else if (S.mode === 'attract') startAttract();
    else onEnd();
  }

  // bot think time ticks down in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ think, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      // shuffled seats: the lobby host doesn't always dig first (Minesweeper Flags picks the starter at random)
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      S = newField('match', seats, Number(settings.clock) || DEFAULT_CLOCK);
    },
    act: (id, action) => action.t === 'dig' && dig(id, action.i),
    // the shovel stays with whoever had it (or the next seat if they left)
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
