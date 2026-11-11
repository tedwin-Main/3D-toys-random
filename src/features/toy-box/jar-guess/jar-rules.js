// Runs Jar Guess rules (jar per round, secret guesses, closeness scoring, bots, round clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey, dropUnseatedPicks } from '../common/turn-table.js';

const INTRO = 2.5, LOOK_T = 2.6, GUESS_T = 20, REVEAL_T = 6, FINAL_T = 12;
const ATTRACT_BOTS = 5, ATTRACT_ROUNDS = 4, DEFAULT_ROUNDS = 6, MAX_GUESS = 9999;
// candy count range per round: jars get fuller
const RANGES = [[15, 40], [30, 70], [50, 110], [80, 160], [120, 220], [160, 300], [200, 380], [260, 450]];
const RANK_PTS = [5, 3, 2];
const JAR_SHAPES = ['cyl', 'tall', 'bowl', 'box'];
const CANDY_KINDS = ['ball', 'bean', 'cube'];
const BOT_NAMES = ['Gumdrop', 'Counter', 'Sprinkles', 'Jellybean', 'Eyeball', 'Sugarplum', 'Lolly', 'Toffee', 'Nougat', 'Bonbon', 'Caramel', 'Fudge', 'Truffle', 'Mochi'];

/** guesses {id: guess}, answer > {id: pts}: points by closeness rank (ties share), within 10% = 1, exact +3 */
export function scoreGuesses(guesses, answer) {
  const ids = Object.keys(guesses).filter((id) => guesses[id] != null);
  const miss = (id) => Math.abs(guesses[id] - answer);
  const pts = {};
  for (const id of ids) {
    // competition rank (1, 2, 2, 4): ties share a place and push the next guess down
    const rank = ids.filter((other) => miss(other) < miss(id)).length;
    pts[id] = (RANK_PTS[rank] ?? (miss(id) <= answer * 0.1 ? 1 : 0)) + (miss(id) === 0 ? 3 : 0);
  }
  return pts;
}

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph, tt, rd, rounds, jar: { shape, candy, n, seed }, res: { g: {id: guess}, pts: {id: pts} } (reveal only), P: [{ id, nick, color, bot, score, lock, skill, at }] }
 */
export function createJarGame({ onEnd = () => {} } = {}) {
  // guesses stay here until the reveal: never part of the published state
  const sealedGuesses = new Map();
  let rng = Math.random;
  let S = freshState('attract', ATTRACT_ROUNDS, 1);

  function freshState(mode, rounds, introTime) {
    return { mode, ph: 'intro', tt: introTime, rd: 1, rounds, jar: null, res: null, P: [] };
  }
  const player = (id) => S.P.find((p) => p.id === id);
  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, lock: false, skill: 0.3 + rng() * 0.6, at: 0 });
  const pickFrom = (list) => list[Math.floor(rng() * list.length)];

  function startRound(rd) {
    sealedGuesses.clear();
    for (const p of S.P) p.lock = false;
    const [lo, hi] = RANGES[Math.min(rd - 1, RANGES.length - 1)];
    const jar = { shape: pickFrom(JAR_SHAPES), candy: pickFrom(CANDY_KINDS), n: lo + Math.floor(rng() * (hi - lo + 1)), seed: 1 + Math.floor(rng() * 2 ** 30) };
    Object.assign(S, { rd, ph: 'look', tt: LOOK_T, jar, res: null });
  }

  function openGuessing() {
    Object.assign(S, { ph: 'guess', tt: GUESS_T });
    for (const p of S.P) p.at = 3 + rng() * 12;
  }

  function placeGuess(id, guess) {
    const p = player(id);
    if (!p || S.ph !== 'guess' || !Number.isInteger(guess) || guess < 1 || guess > MAX_GUESS) return false;
    sealedGuesses.set(id, guess); p.lock = true;
    return true;
  }

  function reveal() {
    const guesses = {};
    for (const p of S.P) guesses[p.id] = sealedGuesses.get(p.id) ?? null;
    const pts = scoreGuesses(guesses, S.jar.n);
    for (const p of S.P) p.score += pts[p.id] ?? 0;
    Object.assign(S, { ph: 'reveal', tt: REVEAL_T, res: { g: guesses, pts } });
  }

  // bots: lognormal error around the true count, sharper with skill
  function botGuess(p) {
    const z = (rng() + rng() + rng() - 1.5) * 1.4;
    return Math.max(1, Math.round(S.jar.n * Math.exp(z * (0.38 - p.skill * 0.28))));
  }

  function tickGuess() {
    for (const p of S.P) if (p.bot && !p.lock && GUESS_T - S.tt >= p.at) placeGuess(p.id, botGuess(p));
    if (S.tt <= 0 || S.P.every((p) => p.lock)) reveal();
  }

  function afterReveal() {
    if (S.rd < S.rounds) startRound(S.rd + 1);
    else if (S.mode === 'attract') { for (const p of S.P) p.score = 0; startRound(1); }
    else Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  function advancePhase() {
    if (S.ph === 'guess') tickGuess();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound(1);
    else if (S.ph === 'look') openGuessing();
    else if (S.ph === 'reveal') afterReveal();
    else if (S.ph === 'final') onEnd();
  }

  return {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      sealedGuesses.clear();
      S = freshState('attract', ATTRACT_ROUNDS, 1);
      S.P = seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer);
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      sealedGuesses.clear();
      S = freshState('match', Number(settings.rounds) || DEFAULT_ROUNDS, INTRO);
      S.P = seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer });
    },
    // a changed guess before the reveal replaces the first: no public change then
    act(id, action) {
      const wasLocked = player(id)?.lock;
      return action.t === 'guess' && placeGuess(id, action.v) && !wasLocked;
    },
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, { scoreOf: (p) => p.score, seatJoiner: (h) => newPlayer(h.id, h.nick, h.color, false) });
      dropUnseatedPicks(sealedGuesses, S.P);
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
