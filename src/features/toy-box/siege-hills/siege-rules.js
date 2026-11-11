// Runs Siege Hills rules (rounds, turn order, shots, blast damage, rising tide, bots, shot clock) with no rendering, for page attract mode and the relay server host.

import { createSeededRng } from '../common/seeded-rng.js';
import { reseatTurn } from '../common/turn-seats.js';
import { seatAttractBots, seatMatch, MAX_SEATS } from '../common/turn-table.js';
import { BLAST, heightAt, genTerrain, crater, launchPoint, velocity, simulate } from './siege-ballistics.js';

const INTRO = 2.5, ROUND_SHOW = 4, BLAST_SHOW = 1.4, FINAL_T = 12;
const TIDE_AFTER = 3, TIDE_STEP = 0.7, SINK_MARGIN = 0.3;
const BLAST_DAMAGE = 55, DIRECT_BONUS = 25, FALL_DAMAGE = 10, FALL_HEIGHT = 2.2;
const ROUND_WIN_PTS = 3, MIN_POWER = 0.15;
const ATTRACT_BOTS = 4, ATTRACT_CLOCK = 10, DEFAULT_ROUNDS = 3, DEFAULT_CLOCK = 20;
const BOT_NAMES = ['Trebuchet Tom', 'Rocky', 'Slinger', 'Big Bertha', 'Lobster', 'Hurl', 'Castle Cass', 'Pebbles', 'Boulder Bo', 'Fling', 'Mortimer', 'Duke', 'Ballista', 'Rampart'];
const round2 = (v) => Math.round(v * 100) / 100;

/**
 * onEnd(): final scores ran out (match over).
 * state: { mode, P: [{ id, nick, color, bot, score, skill, x, y, hp, alive }], rounds, clock, rd, ph, tt, W, H: [heights], water, wind, shots, turn, lap, winner,
 *          shot: { n, by, x0, y0, vx, vy, w, ft, ix, iy, off, hits: [[id, dmg]], kills: [ids] } (pages replay the arc from it) }
 */
export function createSiegeGame({ onEnd = () => {} } = {}) {
  let rng = Math.random;
  let S = null;

  const newPlayer = (id, nick, color, bot) => ({ id, nick, color, bot, score: 0, ...(bot && { skill: 0.35 + rng() * 0.55 }) });
  const alive = () => S.P.filter((p) => p.alive);
  const sinks = (cat) => cat.y < S.water + SINK_MARGIN;
  function newWind() { S.wind = Math.round((rng() * 2 - 1) * (4 + S.rd) * 10) / 10; }
  function botThinks(extra) { const p = S.P[S.turn]; if (p?.bot) p.think = 1 + rng() * extra; }

  function newRound(rd) {
    const n = S.P.length, W = 44 + n * 11;
    // spread catapults with jitter, shuffled seats
    const spots = S.P.map((_, i) => (W / n) * (i + 0.5) + (rng() - 0.5) * (W / n) * 0.35).sort(() => rng() - 0.5);
    S.W = W;
    S.H = genTerrain(W, spots, rng);
    S.P.forEach((p, i) => Object.assign(p, { x: round2(spots[i]), hp: 100, alive: true }));
    for (const p of S.P) p.y = heightAt(S.H, p.x);
    // round 1 opens on a random seat; later rounds carry on the rotation so the last shooter never goes twice
    const turn = rd === 1 ? Math.floor(rng() * n) : (S.turn + 1) % n;
    Object.assign(S, { rd, ph: 'intro', tt: INTRO, water: 0, shots: 0, shot: null, turn, lap: 0 });
    newWind();
  }

  function newTable(mode, seats, rounds, clock) {
    S = { mode, P: seats, rounds, clock, rd: 1, ph: 'intro', tt: INTRO, W: 60, H: [], water: 0, wind: 0, shots: 0, shot: null, turn: 0, lap: 0 };
    newRound(1);
  }

  // late in the round the tide rises a step each lap
  function riseTide() {
    S.water = round2(S.water + TIDE_STEP);
    for (const p of alive()) if (sinks(p)) { p.hp = 0; p.alive = false; }
  }

  function nextTurn() {
    const n = S.P.length;
    for (let k = 1; k <= n; k++) {
      const j = (S.turn + k) % n;
      if (!S.P[j].alive) continue;
      if (j <= S.turn) S.lap++;
      S.turn = j;
      break;
    }
    if (S.lap >= TIDE_AFTER && S.turn === S.P.findIndex((p) => p.alive)) riseTide();
    newWind();
    Object.assign(S, { ph: 'aim', tt: S.clock });
    botThinks(1.2);
  }

  // blast damage falls off with distance; a direct hit adds a bonus
  function blastDamage(impact) {
    const hits = [];
    for (const cat of alive()) {
      const distance = Math.hypot(cat.x - impact.ix, cat.y + 0.5 - impact.iy);
      const damage = (distance < BLAST ? Math.round(BLAST_DAMAGE * (1 - distance / BLAST) ** 0.7) : 0) + (impact.direct === cat.id ? DIRECT_BONUS : 0);
      if (!damage) continue;
      cat.hp = Math.max(0, cat.hp - damage);
      hits.push([cat.id, damage]);
    }
    return hits;
  }

  // settle on the new ground, fall damage for long drops, sink below the tide; shooter scores each knockout but their own
  function settleAndCountKills(shooter) {
    const kills = [];
    for (const cat of alive()) {
      const ground = heightAt(S.H, cat.x);
      if (cat.y - ground > FALL_HEIGHT) cat.hp = Math.max(0, cat.hp - FALL_DAMAGE);
      cat.y = round2(ground);
      if (sinks(cat)) cat.hp = 0;
      if (cat.hp > 0) continue;
      cat.alive = false;
      kills.push(cat.id);
      if (cat.id !== shooter.id) shooter.score += 1;
    }
    return kills;
  }

  // the whole shot resolves now; pages replay the arc from S.shot
  function fire(id, angle, power) {
    const p = S.P[S.turn];
    if (S.ph !== 'aim' || !p || p.id !== id || !p.alive || !Number.isFinite(angle) || !Number.isFinite(power)) return false;
    const from = launchPoint(p), v = velocity(angle, Math.max(MIN_POWER, Math.min(1, power)));
    const impact = simulate({ x0: from.x, y0: from.y, vx: v.vx, vy: v.vy, wind: S.wind, shooter: p.id }, { H: S.H, W: S.W, cats: S.P });
    let hits = [], kills = [];
    if (!impact.off) {
      S.H = crater(S.H, impact.ix, impact.iy, BLAST * 0.85);
      hits = blastDamage(impact);
      kills = settleAndCountKills(p);
    }
    S.shots++;
    S.shot = { n: S.shots, by: p.id, x0: from.x, y0: from.y, vx: v.vx, vy: v.vy, w: S.wind, ft: Math.round(impact.ft * 1000) / 1000, ix: impact.ix, iy: impact.iy, off: !!impact.off, hits, kills };
    Object.assign(S, { ph: 'fly', tt: impact.ft + BLAST_SHOW });
    return true;
  }

  // bots: search angle x power against a chosen rival, wind included; skill blurs the pick
  function botAim(p) {
    const foes = alive().filter((cat) => cat.id !== p.id);
    if (!foes.length) return { a: Math.PI / 4, p: 0.5 };
    const target = foes.sort((a, b) => Math.abs(a.x - p.x) * (0.6 + rng() * 0.8) - Math.abs(b.x - p.x) * (0.6 + rng() * 0.8))[0];
    const from = launchPoint(p), field = { H: S.H, W: S.W, cats: S.P };
    let best = null;
    for (let deg = 20; deg <= 78; deg += 3) for (let power = 0.3; power <= 1.001; power += 0.035) {
      const angle = target.x > p.x ? (deg * Math.PI) / 180 : Math.PI - (deg * Math.PI) / 180, v = velocity(angle, power);
      const impact = simulate({ x0: from.x, y0: from.y, vx: v.vx, vy: v.vy, wind: S.wind, shooter: p.id }, field);
      if (impact.direct === p.id) continue;
      const tooClose = Math.hypot(impact.ix - p.x, impact.iy - p.y) < BLAST * 1.2;
      const miss = impact.direct === target.id ? 0 : Math.hypot(impact.ix - target.x, impact.iy - target.y) + (tooClose ? 50 : 0);
      if (!best || miss < best.miss) best = { a: angle, p: power, miss };
    }
    const blur = 0.14 * (1.2 - (p.skill ?? 0.5));
    return { a: best.a + (rng() - 0.5) * blur, p: best.p * (1 + (rng() - 0.5) * blur) };
  }

  function endRound() {
    const winner = alive()[0];
    if (winner) winner.score += ROUND_WIN_PTS;
    Object.assign(S, { ph: 'round', tt: ROUND_SHOW, winner: winner?.id ?? null });
  }

  function tickAim(dt) {
    const p = S.P[S.turn];
    // the tide can finish a round between shots
    if (alive().length <= 1) endRound();
    else if (!p || !p.alive) nextTurn();
    else if (p.bot) { p.think -= dt; if (p.think <= 0) { const aim = botAim(p); fire(p.id, aim.a, aim.p); } }
    else if (S.tt <= 0) nextTurn();
  }

  function afterRound() {
    if (S.mode === 'attract') newRound(1);
    else if (S.rd < S.rounds) newRound(S.rd + 1);
    else Object.assign(S, { ph: 'final', tt: FINAL_T });
  }

  function advancePhase(dt) {
    if (S.ph === 'aim') tickAim(dt);
    else if (S.tt > 0) return;
    else if (S.ph === 'intro') { Object.assign(S, { ph: 'aim', tt: S.clock }); botThinks(1); }
    else if (S.ph === 'fly') { if (alive().length <= 1) endRound(); else nextTurn(); }
    else if (S.ph === 'round') afterRound();
    else if (S.ph === 'final') onEnd();
  }

  // late joiner waits out this round as a wreck, plays from the next one; in a full room a knocked-out (else lowest-scoring) bot gives up its seat
  function seatLateJoiner(human) {
    if (S.P.length >= MAX_SEATS) {
      const bot = S.P.filter((p) => p.bot).sort((a, b) => a.alive - b.alive || a.score - b.score)[0];
      if (bot) S.P.splice(S.P.indexOf(bot), 1);
    }
    S.P.push({ ...newPlayer(human.id, human.nick, human.color, false), x: -50, y: -50, hp: 0, alive: false });
  }

  function keepTurnAfterReseat(before) {
    const seat = reseatTurn(before, S.turn, S.P), midTurn = seat.left && (S.ph === 'aim' || S.ph === 'fly');
    // shooter left mid-turn: park on the seat before the next one so nextTurn lands on it (not past it)
    S.turn = midTurn ? (seat.turn - 1 + S.P.length) % Math.max(1, S.P.length) : seat.turn;
    if (midTurn && S.ph === 'aim') nextTurn();
  }

  const changeKey = () => `${S.ph}|${S.turn}|${S.shots}|${S.P.length}|${S.rd}`;

  const game = {
    get state() { return S; },
    startAttract() {
      rng = Math.random;
      newTable('attract', seatAttractBots(ATTRACT_BOTS, BOT_NAMES, newPlayer), 1, ATTRACT_CLOCK);
      S.tt = 1;
    },
    startMatch({ seed, humans, bots, settings = {} }) {
      rng = createSeededRng(seed);
      newTable('match', seatMatch({ humans, bots, botNames: BOT_NAMES, newSeat: newPlayer }), Number(settings.rounds) || DEFAULT_ROUNDS, Number(settings.clock) || DEFAULT_CLOCK);
    },
    act: (id, action) => action.t === 'fire' && fire(id, action.a, action.p),
    syncRoster(humans) {
      const here = new Set(humans.map((h) => h.id)), before = S.P;
      S.P = S.P.filter((p) => p.bot || here.has(p.id));
      for (const h of humans) if (!S.P.some((p) => p.id === h.id)) seatLateJoiner(h);
      keepTurnAfterReseat(before);
      return true;
    },
    tick(dt) {
      const before = changeKey();
      S.tt -= dt;
      advancePhase(dt);
      return changeKey() !== before;
    },
  };
  game.startAttract();
  return game;
}
