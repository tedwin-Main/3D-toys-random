// Runs Pair Pond rules (hidden lily-pad faces, flip two, a match keeps the pair and goes again, turn clock, bots with memory) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.ts';
import { shuffleInPlace } from '../common/seat-shuffle.ts';
import { reseatTurn } from '../common/turn-seats.ts';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.ts';
import { noSettings } from '../common/match-settings.ts';
import { createPondMemory } from './pond-bots.ts';

const INTRO = 2.5, SHOW_HIT = 0.9, SHOW_MISS = 1.6, FINAL_T = 12;
const ATTRACT_BOTS = 4, DEFAULT_CLOCK = 10, MAX_PAIRS = 20;
const BOT_NAMES = ['Ribbit', 'Lily', 'Croaky', 'Puddle', 'Splash', 'Tadpole', 'Reed', 'Mossy', 'Bubbles', 'Hopper', 'Fern', 'Newt', 'Dewdrop', 'Cattail'];
/** pairs on the pond: 6 + seats (8 for two players, 20 for fourteen) */
export const pairsFor = (seats: number) => Math.min(MAX_PAIRS, 6 + Math.max(2, seats));

// tells pages a fresh pond from the one they drew last; says nothing about the faces
const newPondId = () => 1 + Math.floor(Math.random() * 2 ** 30);

/** pairs still on the water, from the public state alone */
export const pairsLeft = (state) => state.claim.filter((c) => !c).length / 2;

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph: intro|play|show|final, tt, clock, pond, N, claim: [null | { f, by }], up: [{ i, f }], turn, last: { hit, by, mv } | null, mv, P: [{ id, nick, color, bot, score, skill }] }
 */
export function createPondGame({ onEnd = () => {} } = {}) {
  // face under each pad: stays here, a pad's face is published only while it is up or once claimed
  let faces = [];
  let rng = Math.random;
  let memory = createPondMemory(() => rng());
  let S = newPond('attract', [], DEFAULT_CLOCK);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, skill: bot ? 0.35 + rng() * 0.55 : 0 });

  function newPond(mode, seats, clock) {
    const pairs = pairsFor(seats.length);
    faces = shuffleInPlace([...Array(pairs).keys()].flatMap((f) => [f, f]), rng);
    memory.reset();
    return { mode, ph: 'intro', tt: INTRO, clock, pond: newPondId(), N: faces.length, claim: new Array(faces.length).fill(null), up: [], turn: 0, last: null, mv: 0, P: seats };
  }

  const freePads = () => S.claim.map((c, i) => (c || S.up.some((u) => u.i === i) ? -1 : i)).filter((i) => i >= 0);

  function startTurn() {
    S.tt = S.clock;
    const p = S.P[S.turn];
    if (p) p.think = 0.7 + rng() * 0.9;
  }

  // one flip by the player whose turn it is; false when not allowed
  function flip(id, i) {
    const p = S.P[S.turn];
    if (S.ph !== 'play' || !p || p.id !== id || !Number.isInteger(i) || i < 0 || i >= S.N || S.claim[i] || S.up.some((u) => u.i === i)) return false;
    const f = faces[i];
    S.up.push({ i, f });
    S.mv++;
    memory.see(S.P, i, f);
    if (S.up.length < 2) { startTurn(); return true; }
    const hit = S.up[0].f === S.up[1].f;
    S.last = { hit, by: id, mv: S.mv };
    Object.assign(S, { ph: 'show', tt: hit ? SHOW_HIT : SHOW_MISS });
    return true;
  }

  // after the show: a match is kept and the same player goes again, a miss flips back and passes the turn
  function resolveShow() {
    const p = S.P[S.turn], keeper = p && p.id === S.last.by && S.last.hit;
    if (keeper) {
      for (const u of S.up) { S.claim[u.i] = { f: u.f, by: p.id }; memory.forget(u.i); }
      p.score++;
    }
    S.up = [];
    if (!S.claim.includes(null)) { Object.assign(S, { ph: 'final', tt: FINAL_T }); return; }
    if (!keeper && S.P.length) S.turn = (S.turn + 1) % S.P.length;
    S.ph = 'play';
    startTurn();
  }

  function tickPlay(dt) {
    const p = S.P[S.turn];
    if (!p) { S.turn = 0; startTurn(); return; }
    if (p.bot) { p.think -= dt; if (p.think <= 0) flip(p.id, memory.choose(p, freePads(), S.up)); }
    // turn clock ran out: a random free pad, so waiting never beats choosing
    else if (S.tt <= 0) { const free = freePads(); flip(p.id, free[Math.floor(rng() * free.length)]); }
  }

  function startAttract() {
    rng = Math.random;
    S = newPond('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), DEFAULT_CLOCK);
    S.tt = 1;
  }

  function advancePhase(dt) {
    if (S.ph === 'play') tickPlay(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') { S.ph = 'play'; S.turn = 0; startTurn(); }
    else if (S.ph === 'show') resolveShow();
    else if (S.mode === 'attract') startAttract();
    else onEnd();
  }

  // bot think time ticks down in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ think, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = noSettings() }) {
      rng = createSeededRng(seed);
      // shuffled seats: random first flipper, join order never decides it
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      S = newPond('match', seats, Number(settings.clock) || DEFAULT_CLOCK);
    },
    act: (id, action) => action.t === 'flip' && flip(id, action.i),
    // the turn stays with whoever had it; if they left mid-turn their face-up pad flips back
    syncRoster(humans) {
      const before = S.P;
      S.P = syncSeats(before, humans, { scoreOf: (p) => p.score, seatJoiner: (h) => newPlayer(h.id, h.nick, h.color, false) });
      memory.dropMissing(S.P);
      const seat = reseatTurn(before, S.turn, S.P);
      S.turn = seat.turn;
      if (seat.left && S.ph === 'play') { S.up = []; startTurn(); }
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
