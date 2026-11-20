// Runs Fog Fleet rules (hidden fleets on one shared sea, secret simultaneous salvos, hits and sinks revealed together, last fleet afloat or round cap ends it, bots) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.ts';
import { shuffleInPlace } from '../common/seat-shuffle.ts';
import { seatAttractBots, seatMatch, syncSeats, clockFreeKey } from '../common/turn-table.ts';
import { noSettings } from '../common/match-settings.ts';
import { sideFor, fleetFor, placeFleet, heatMap, openCells } from './fleet-sea.ts';

const INTRO = 3, FIRE_T = 2.6, FINAL_T = 12;
const ATTRACT_BOTS = 5, DEFAULT_CLOCK = 15, DEFAULT_ROUNDS = 30;
export const HIT = 1, SINK = 2, SURVIVOR = 5;
const BOT_NAMES = ['Barnacle', 'Anchor', 'Gull', 'Kelp', 'Squall', 'Pebble', 'Drift', 'Coral', 'Harbor', 'Skipper', 'Mist', 'Brine', 'Lantern', 'Tide'];

/** shots this round: one per boat afloat; a sunk fleet keeps one ghost shot so nobody sits out */
export const shotsFor = (afloat: number) => Math.max(1, afloat);

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, ph: intro|aim|fire|final, tt, clock, rd, cap, n, fleet (boat lengths), sea ('.' open, 'o' miss, 'x' hit, '#' sunk), of: { cell: owner id } for hit cells,
 *   sunk: [{ of, cells }], volley: [{ i, by: [ids], of }] (last round's shots), P: [{ id, nick, color, bot, score, lock, afloat, left (boat cells unhit), shots, skill }] }
 * viewFor(id): { id, rd, boats: [cells[]], aim: cells[] } for that seat only.
 */
export function createFleetGame({ onEnd = () => {} } = {}) {
  // boats and aims stay here: a seat sees only its own boats and its own aim until the volley
  const boats = new Map(), aims = new Map();
  let rng = Math.random;
  let S;
  freshState('attract', [], DEFAULT_CLOCK, DEFAULT_ROUNDS);

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, lock: false, afloat: 0, left: 0, shots: 1, skill: bot ? 0.35 + rng() * 0.55 : 0, at: 0 });
  const player = (id) => S.P.find((p) => p.id === id);
  const ownCells = (id) => new Set((boats.get(id) ?? []).flat());

  function freshState(mode, seats, clock, cap) {
    boats.clear(); aims.clear();
    const n = sideFor(seats.length), fleet = fleetFor(seats.length);
    S = { mode, ph: 'intro', tt: INTRO, clock, rd: 0, cap, n, fleet, sea: '.'.repeat(n * n), of: {}, sunk: [], volley: [], P: seats };
    const taken = new Set();
    for (const p of seats) launch(p, taken);
    return S;
  }

  // a fleet on free open water; afloat / left / shots follow from it
  function launch(p, taken) {
    boats.set(p.id, placeFleet(S.n, S.fleet, taken, rng).filter((cells) => cells.length));
    tally(p);
  }
  function tally(p) {
    const fleet = boats.get(p.id) ?? [];
    p.left = fleet.flat().filter((i) => S.sea[i] === '.').length;
    p.afloat = fleet.filter((cells) => cells.some((i) => S.sea[i] === '.')).length;
    p.shots = shotsFor(p.afloat);
  }

  function startRound() {
    aims.clear();
    Object.assign(S, { ph: 'aim', tt: S.clock, rd: S.rd + 1 });
    for (const p of S.P) { p.lock = false; p.at = 0.8 + rng() * 2.4; }
  }

  // a seat's whole aim for this round (up to its shot count, open cells, never its own); locked once every shot is set
  function aim(id, cells) {
    const p = player(id);
    if (S.ph !== 'aim' || !p || !Array.isArray(cells) || cells.length > p.shots || new Set(cells).size !== cells.length) return false;
    const own = ownCells(id);
    if (!cells.every((i) => Number.isInteger(i) && i >= 0 && i < S.sea.length && S.sea[i] === '.' && !own.has(i))) return false;
    aims.set(id, [...cells]);
    p.lock = cells.length === p.shots;
    return true;
  }

  // unset shots go to random open cells, so waiting never beats choosing
  function fillAim(p) {
    const cells = aims.get(p.id) ?? [], free = openCells(S.sea, ownCells(p.id)).filter((i) => !cells.includes(i));
    while (cells.length < p.shots && free.length) cells.push(free.splice(Math.floor(rng() * free.length), 1)[0]);
    return cells;
  }

  const ownerOf = (i) => { for (const [id, fleet] of boats) if (fleet.some((cells) => cells.includes(i))) return id; return null; };

  // every shot lands at once: a hit scores each shooter on that cell, the shot that finishes a boat sinks it for each of them
  function fire() {
    const byCell = new Map();
    for (const p of S.P) for (const i of fillAim(p)) byCell.set(i, [...(byCell.get(i) ?? []), p.id]);
    const sea = [...S.sea];
    S.volley = [];
    for (const [i, by] of byCell) {
      const of = ownerOf(i);
      sea[i] = of === null ? 'o' : 'x';
      if (of !== null) { S.of[i] = of; for (const id of by) player(id).score += HIT; }
      S.volley.push({ i, by, of });
    }
    S.sea = sea.join('');
    for (const [of, fleet] of boats) for (const cells of fleet) {
      if (!cells.every((i) => S.sea[i] === 'x')) continue;
      const sinkers = new Set(cells.flatMap((i) => byCell.get(i) ?? []));
      for (const id of sinkers) player(id).score += SINK;
      S.sea = [...S.sea].map((c, i) => (cells.includes(i) ? '#' : c)).join('');
      S.sunk.push({ of, cells });
    }
    for (const p of S.P) { tally(p); p.lock = true; }
    aims.clear();
    Object.assign(S, { ph: 'fire', tt: FIRE_T });
  }

  function afterFire() {
    const afloat = S.P.filter((p) => p.afloat > 0).length, open = S.sea.includes('.');
    if ((S.P.length > 1 && afloat <= 1) || S.rd >= S.cap || !open) finish();
    else startRound();
  }

  function finish() {
    if (S.mode === 'attract') { startAttract(); return; }
    for (const p of S.P) if (p.afloat > 0) p.score += SURVIVOR;
    Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  // bots: hottest cell of the hunt/target map as often as their skill allows, else any open cell
  function botAim(p) {
    const own = ownCells(p.id), heat = heatMap(S.sea, S.n, own, S.fleet), free = openCells(S.sea, own), cells = [];
    while (cells.length < p.shots && free.length) {
      let pick = free[Math.floor(rng() * free.length)];
      if (rng() < p.skill) { let best = -1; for (const i of free) { const h = heat[i] + rng() * 0.5; if (h > best) { best = h; pick = i; } } }
      cells.push(pick);
      free.splice(free.indexOf(pick), 1);
    }
    aim(p.id, cells);
  }

  function tickAim() {
    for (const p of S.P) if (p.bot && !p.lock && S.clock - S.tt >= p.at) botAim(p);
    if (S.tt <= 0 || S.P.every((p) => p.lock)) fire();
  }

  function startAttract() {
    rng = Math.random;
    freshState('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), 6, DEFAULT_ROUNDS);
    S.tt = 1;
  }

  function advancePhase() {
    if (S.ph === 'aim') tickAim();
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') startRound();
    else if (S.ph === 'fire') afterFire();
    else onEnd();
  }

  // bot aim delays sit in the state: not a change guests need
  const changeKey = () => clockFreeKey({ ...S, P: S.P.map(({ at, ...seat }) => seat) });

  return {
    get state() { return S; },
    startAttract,
    startMatch({ seed, humans, bots, settings = noSettings() }) {
      rng = createSeededRng(seed);
      // shuffled seats: join order never decides placement
      const seats = shuffleInPlace(seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), rng);
      freshState('match', seats, Number(settings.clock) || DEFAULT_CLOCK, Number(settings.rounds) || DEFAULT_ROUNDS);
    },
    // re-aiming before the volley only shows when the lock flips
    act(id, action) {
      const was = player(id)?.lock;
      return action.t === 'aim' && aim(id, action.cells) && player(id).lock !== was;
    },
    viewFor(id) {
      return player(id) ? { id, rd: S.rd, boats: (boats.get(id) ?? []).map((cells) => [...cells]), aim: [...(aims.get(id) ?? [])] } : null;
    },
    // a late joiner launches a fleet on open water nobody holds; a leaver's boats leave the sea with them
    syncRoster(humans) {
      S.P = syncSeats(S.P, humans, {
        scoreOf: (p) => p.score,
        seatJoiner: (h) => {
          const p = newPlayer(h.id, h.nick, h.color, false), taken = new Set([...boats.values()].flat(2));
          [...S.sea].forEach((c, i) => { if (c !== '.') taken.add(i); });
          launch(p, taken);
          p.lock = S.ph !== 'aim';
          return p;
        },
      });
      const seated = new Set(S.P.map((p) => p.id));
      for (const id of [...boats.keys()]) if (!seated.has(id)) { boats.delete(id); aims.delete(id); }
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
