// Runs Waldo Hunt rounds (race / hide & seek, round clock, clicks + miss cooldown, hider placement, bots, scoring, late joiners) with no drawing, for the relay server host.

import { WORLD_W, WORLD_H, SPRITE_W, SPRITE_H, HIT_RADIUS, THEME_IDS, generateScene, stampTarget, targetPosition } from './waldo-scene.js';

// Core > game-rules: round clock, decoy ramp, scoring, hide-spot checks
export const ROUND_MS = 90_000;
export const WRONG_COOLDOWN_MS = 2_000;
export const WRONG_GRACE = 2;
export const RACE_ROUNDS = 5;
export const DECOY_START = { easy: 0.05, normal: 0.15, hard: 0.25 };
export const DECOY_STEP = 0.0375;
export const DECOY_MAX = 0.4;
export const DENSITY_START = { easy: 340, normal: 480, hard: 640 };
export const DENSITY_STEP = 60;
export function decoyRatioFor(difficulty, roundIndex) {
  return Math.min(DECOY_MAX, DECOY_START[difficulty] + roundIndex * DECOY_STEP);
}
export function densityFor(difficulty, roundIndex) {
  return DENSITY_START[difficulty] + roundIndex * DENSITY_STEP;
}
export function seekerScore(elapsedMs) {
  const t = Math.max(0, Math.min(ROUND_MS, elapsedMs));
  return Math.max(100, Math.round(1000 * (1 - t / ROUND_MS)));
}
export const HIDER_PAR_MS = 25_000;
export function hiderScore(findTimesMs, seekerCount) {
  if (findTimesMs.length === 0 || seekerCount === 0) return 0;
  const avg = findTimesMs.reduce((a, b) => a + b, 0) / findTimesMs.length;
  const foundShare = findTimesMs.length / seekerCount;
  return Math.round(1000 * Math.min(1, avg / HIDER_PAR_MS) * foundShare);
}
export function isHit(target, click) {
  return Math.hypot(target.x - click.x, target.y - click.y) <= HIT_RADIUS;
}
export const EDGE_MARGIN = 60;
export const CROWD_RADIUS = 110;
export const MIN_NEIGHBOURS = 3;
export const MAX_OVERLAP = 2;
export function occludedByProp(props, x, y) {
  return props.some(
    (pr) =>
      x > pr.x - 4 && x < pr.x + pr.w + 4 &&
      y > pr.y + 8 && y < pr.y + pr.h + SPRITE_H * 0.4
  );
}
export function validatePlacement(scene, x, y, world) {
  if (x < EDGE_MARGIN || y < EDGE_MARGIN || x > world.w - EDGE_MARGIN || y > world.h - EDGE_MARGIN) {
    return { ok: false, reason: 'Too close to the edge of the scene.' };
  }
  if (occludedByProp(scene.props, x, y)) {
    return { ok: false, reason: 'That spot is hidden behind scenery.' };
  }
  let neighbours = 0;
  let overlaps = 0;
  for (const p of scene.people) {
    const d = Math.hypot(p.x - x, p.y - y);
    if (d <= CROWD_RADIUS) neighbours++;
    if (Math.abs(p.x - x) < SPRITE_W * 0.6 && Math.abs(p.y - y) < SPRITE_H * 0.5) overlaps++;
  }
  if (neighbours < MIN_NEIGHBOURS) {
    return { ok: false, reason: 'Too exposed -- stand in a crowd.' };
  }
  if (overlaps > MAX_OVERLAP) {
    return { ok: false, reason: 'Too buried under other people.' };
  }
  return { ok: true };
}

// Game > round machine
export const PLACE_MS = 45000;
export const NEXT_MS = 15000;
export const MAX_SEATS = 14;
const MIN_ROUNDS_WITH_BOTS = 5;
const BOT_NAMES = ['Ali', 'Mei Ling', 'Raju', 'Siti', 'Ah Kow', 'Nurul', 'Devi', 'Hafiz', 'Jun Wei', 'Aisyah', 'Kumar', 'Farid', 'Priya'];
const BOT_MISS = { easy: 0.1, normal: 0.18, hard: 0.28 };
const BOT_FIND_MS = { easy: 9000, normal: 15000, hard: 22000 };
const WORLD = { w: WORLD_W, h: WORLD_H };

/**
 * send(to, msg): to = seat id, or null for every human. Messages: view, placePrompt, waiting, roundStart, found, wrong, roundEnd, gameEnd, error.
 * now(): ms clock; rng(): [0, 1) for seeds, maps, bots.
 */
export function createWaldoRounds({ send, now = Date.now, rng = Math.random }) {
  const H = {
    mode: 'race', difficulty: 'normal', themeChoice: 'random', panning: true, phase: 'lobby', roundIndex: 0,
    seed: 0, theme: 'kl', decoy: 0, density: 0, scene: null, targetAt: null,
    startedAt: 0, endsAt: 0, placeBy: 0, nextAt: 0, hiderOrder: [], hiderId: null, themeOffset: -1, players: new Map(),
  };

  function addSeat(id, nick, bot) {
    H.players.set(id, { id, nick, bot, score: 0, connected: true, joinedAt: H.players.size, cooldownUntil: 0, misses: 0, foundAt: null, botAt: Infinity });
  }
  const totalRounds = () => (H.mode === 'race' ? RACE_ROUNDS : Math.max(1, H.hiderOrder.length));
  const seekers = () => [...H.players.values()].filter((p) => p.connected && p.id !== H.hiderId);
  const connectedSeats = () => [...H.players.values()].filter((p) => p.connected);

  // tour from a random start so a game never rolls the same map twice in a row
  function themeForRound() {
    if (H.themeChoice !== 'random') return H.themeChoice;
    if (H.themeOffset < 0) H.themeOffset = Math.floor(rng() * THEME_IDS.length);
    return THEME_IDS[(H.themeOffset + H.roundIndex) % THEME_IDS.length];
  }

  function viewOf() {
    return {
      mode: H.mode, difficulty: H.difficulty, themeChoice: H.themeChoice, panning: H.panning, phase: H.phase,
      round: H.roundIndex + 1, totalRounds: totalRounds(), nextIn: H.phase === 'roundEnd' ? Math.max(0, H.nextAt - now()) : 0,
      players: [...H.players.values()].sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt)
        .map((p) => ({ id: p.id, nick: p.nick, score: p.score, connected: p.connected, bot: p.bot, found: p.foundAt !== null, hiding: p.id === H.hiderId })),
    };
  }

  // Net out: to one seat (bots hear nothing), or every human
  function toSeat(id, m) { if (!H.players.get(id)?.bot) send(id, m); }
  const toAll = (m) => send(null, m);
  const pushView = () => toAll({ t: 'view', v: viewOf() });

  // race builds the crowd with Waldo in it; hide waits for the hider's spot
  function beginRound() {
    const seed = 1 + Math.floor(rng() * (2 ** 31 - 2));
    const theme = themeForRound();
    const decoy = decoyRatioFor(H.difficulty, H.roundIndex), density = densityFor(H.difficulty, H.roundIndex);
    Object.assign(H, { seed, theme, decoy, density });
    for (const p of H.players.values()) Object.assign(p, { foundAt: null, cooldownUntil: 0, misses: 0, botAt: Infinity });
    const params = { seed, theme, decoyRatio: decoy, density };
    if (H.mode === 'race') {
      H.scene = generateScene(params, true);
      H.targetAt = targetPosition(H.scene);
      H.hiderId = null;
      return goLive();
    }
    H.scene = generateScene(params, false);
    H.targetAt = null;
    H.hiderId = H.hiderOrder[H.roundIndex % H.hiderOrder.length] ?? null;
    H.phase = 'placing';
    const hider = H.players.get(H.hiderId);
    // bot or absent hider: auto-place after a short "thinking" pause
    H.placeBy = now() + (hider && !hider.bot && hider.connected ? PLACE_MS : 2500 + rng() * 3000);
    for (const p of connectedSeats()) toSeat(p.id, p.id === H.hiderId ? { t: 'placePrompt', seed, theme, decoy, density } : { t: 'waiting', nick: hider?.nick ?? 'someone' });
    pushView();
  }

  function hideAt(x, y) {
    H.scene = stampTarget(H.scene, x, y);
    H.targetAt = { x, y };
    goLive();
  }

  function autoPlace() {
    for (let i = 0; i < 400; i++) {
      const x = 80 + Math.floor(rng() * (WORLD_W - 160)), y = 80 + Math.floor(rng() * (WORLD_H - 160));
      if (validatePlacement(H.scene, x, y, WORLD).ok) return hideAt(x, y);
    }
    endRound('voided');
  }

  // returns an error text for the hider, or null when Waldo is hidden
  function place(id, x, y) {
    if (H.phase !== 'placing') return 'Not placing right now.';
    if (id !== H.hiderId) return 'You are not the hider.';
    const check = validatePlacement(H.scene, x, y, WORLD);
    if (!check.ok) return check.reason ?? 'Invalid spot.';
    hideAt(x, y);
    return null;
  }

  // bots: find time scales with difficulty + decoys; some rounds they never spot him
  function botFindMs() {
    if (rng() < BOT_MISS[H.difficulty] + H.decoy * 0.5) return Infinity;
    return BOT_FIND_MS[H.difficulty] + rng() * ROUND_MS * 0.6;
  }

  function goLive() {
    H.phase = 'playing';
    H.startedAt = now();
    H.endsAt = H.startedAt + ROUND_MS;
    for (const p of H.players.values()) if (p.bot) p.botAt = H.startedAt + botFindMs();
    toAll(roundStartMsg());
    pushView();
  }

  // race tabs derive Waldo from the seed; hide tabs need the hider's spot
  const roundStartMsg = () => ({ t: 'roundStart', seed: H.seed, theme: H.theme, decoy: H.decoy, density: H.density, targetAt: H.mode === 'hide' ? H.targetAt : null, endsIn: Math.max(0, H.endsAt - now()), round: H.roundIndex + 1 });

  // clicks: 2 free misses, then 2 s cooldown per miss; a hit scores by speed
  function click(id, x, y) {
    const p = H.players.get(id);
    if (!p || H.phase !== 'playing' || !H.targetAt || id === H.hiderId || p.foundAt !== null) return;
    const at = now();
    if (at < p.cooldownUntil) return toSeat(id, { t: 'wrong', cooldownMs: p.cooldownUntil - at, freeLeft: 0 });
    if (!isHit(H.targetAt, { x, y })) {
      p.misses++;
      const penalised = p.misses > WRONG_GRACE;
      if (penalised) p.cooldownUntil = at + WRONG_COOLDOWN_MS;
      return toSeat(id, { t: 'wrong', cooldownMs: penalised ? WRONG_COOLDOWN_MS : 0, freeLeft: Math.max(0, WRONG_GRACE - p.misses) });
    }
    p.foundAt = at - H.startedAt;
    const gained = seekerScore(p.foundAt);
    p.score += gained;
    const all = seekers();
    toAll({ t: 'found', id, nick: p.nick, n: all.filter((s) => s.foundAt !== null).length, of: all.length, score: gained });
    pushView();
    maybeFinish();
  }

  function maybeFinish() {
    if (H.phase !== 'playing') return;
    const all = seekers();
    if (!all.length) return endRound('voided');
    if (all.every((s) => s.foundAt !== null)) endRound('allFound');
  }

  function endRound(reason) {
    if (H.phase !== 'playing' && H.phase !== 'placing') return;
    if (reason !== 'voided' && H.mode === 'hide' && H.hiderId !== null) {
      const hider = H.players.get(H.hiderId), all = seekers();
      if (hider) hider.score += hiderScore(all.filter((s) => s.foundAt !== null).map((s) => s.foundAt), all.length);
    }
    H.phase = 'roundEnd';
    H.nextAt = now() + NEXT_MS;
    toAll({ t: 'roundEnd', target: reason === 'voided' ? null : H.targetAt, reason });
    pushView();
  }

  function next() {
    if (H.phase !== 'roundEnd') return;
    H.roundIndex++;
    if (H.roundIndex < totalRounds()) return beginRound();
    H.phase = 'gameEnd';
    pushView();
    toAll({ t: 'gameEnd' });
  }

  function botsFind(at) {
    for (const p of H.players.values()) {
      if (H.phase !== 'playing') return;
      if (p.bot && p.connected && p.id !== H.hiderId && p.foundAt === null && at >= p.botAt) click(p.id, H.targetAt.x, H.targetAt.y);
    }
  }

  // hider leaving mid-round makes it unwinnable: void, never silently score
  function drop(id) {
    const p = H.players.get(id);
    if (!p) return;
    p.connected = false;
    if (H.hiderId === id && (H.phase === 'placing' || H.phase === 'playing')) endRound('voided');
    maybeFinish();
  }

  // keep 14 seats: a late human bumps a bot that is not hiding
  function seatLate(h) {
    if (connectedSeats().length >= MAX_SEATS) {
      const bot = [...H.players.values()].find((q) => q.bot && q.connected && q.id !== H.hiderId);
      if (bot) bot.connected = false;
    }
    addSeat(h.id, h.nick, false);
  }

  return {
    get phase() { return H.phase; },
    // humans: [{ id, nick }]; hide needs a second seat, so a lone human gets one bot
    start({ settings = {}, humans, bots }) {
      Object.assign(H, {
        mode: settings.mode === 'hide' ? 'hide' : 'race',
        difficulty: BOT_MISS[settings.difficulty] != null ? settings.difficulty : 'normal',
        themeChoice: THEME_IDS.includes(settings.map) ? settings.map : 'random',
        panning: settings.panning !== 'off',
      });
      for (const h of humans.slice(0, MAX_SEATS)) addSeat(h.id, h.nick, false);
      const want = H.mode === 'hide' ? Math.max(bots, 2 - H.players.size) : bots;
      const botCount = Math.min(want, BOT_NAMES.length, MAX_SEATS - H.players.size);
      for (let i = 0; i < botCount; i++) addSeat(-1 - i, `${BOT_NAMES[i]} 🤖`, true);
      // every human hides once; bots top up to 5 rounds so a big bot table stays short
      const seats = [...H.players.values()];
      const botIds = seats.filter((p) => p.bot).map((p) => p.id).sort(() => rng() - 0.5);
      H.hiderOrder = [...seats.filter((p) => !p.bot).map((p) => p.id), ...botIds.slice(0, Math.max(0, MIN_ROUNDS_WITH_BOTS - humans.length))];
      beginRound();
    },
    act(id, { t, x, y }) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return;
      if (t === 'click') click(id, x, y);
      else if (t === 'place') { const err = place(id, x, y); if (err) toSeat(id, { t: 'error', text: err }); }
    },
    next,
    // late joiner or reload: replay the current round state to one seat
    catchUp(id) {
      if (H.phase === 'placing') toSeat(id, id === H.hiderId ? { t: 'placePrompt', seed: H.seed, theme: H.theme, decoy: H.decoy, density: H.density } : { t: 'waiting', nick: H.players.get(H.hiderId)?.nick ?? 'someone' });
      if (H.phase === 'playing' || H.phase === 'roundEnd') toSeat(id, roundStartMsg());
      if (H.phase === 'roundEnd') toSeat(id, { t: 'roundEnd', target: H.targetAt, reason: 'timeout' });
      if (H.phase === 'gameEnd') toSeat(id, { t: 'gameEnd' });
      toSeat(id, { t: 'view', v: viewOf() });
    },
    syncRoster(humans) {
      const here = new Set(humans.map((h) => h.id));
      for (const p of [...H.players.values()]) if (!p.bot && p.connected && !here.has(p.id)) drop(p.id);
      for (const h of humans) if (!H.players.has(h.id)) seatLate(h);
      pushView();
    },
    // deadlines + bot finds
    tick() {
      const at = now();
      if (H.phase === 'placing' && at >= H.placeBy) autoPlace();
      if (H.phase === 'playing') {
        botsFind(at);
        if (H.phase === 'playing' && at >= H.endsAt + 250) endRound('timeout');
      }
      if (H.phase === 'roundEnd' && at >= H.nextAt) next();
    },
  };
}
