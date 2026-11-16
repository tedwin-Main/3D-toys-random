// Exposes window.__GAME_DEBUG__ on ?debug pages: room, phase, player positions and confirm times as plain JSON for Playwright checks.

const DEBUG_FLAG = /[?&]debug\b/;
const SCORE_KEYS = ['score', 'pts', 'total', 'kills', 'pops', 'wins', 'tiles', 'goals'];
const NAME_KEYS = ['nick', 'name'];

// 3 decimals keeps snapshots readable; NaN / Infinity stay visible as strings so tests catch them
function round3(v) {
  if (typeof v !== 'number') return v;
  return Number.isFinite(v) ? Math.round(v * 1000) / 1000 : String(v);
}

function asList(v) {
  if (!v) return [];
  if (v instanceof Map) return [...v.values()];
  if (Array.isArray(v)) return v;
  return typeof v === 'object' ? Object.values(v) : [];
}

function firstKey(p, keys) {
  return keys.find((k) => p[k] !== undefined);
}

function aliveOf(p) {
  if (typeof p.alive === 'boolean') return p.alive;
  if (typeof p.out === 'boolean') return !p.out;
  if (typeof p.dead === 'boolean') return !p.dead;
  return true;
}

export function normalizePlayer(p) {
  const nameKey = firstKey(p, NAME_KEYS), scoreKey = SCORE_KEYS.find((k) => typeof p[k] === 'number');
  return {
    id: p.id,
    name: nameKey ? p[nameKey] : undefined,
    bot: !!p.bot,
    x: round3(p.x), y: round3(p.y), z: round3(p.z),
    alive: aliveOf(p),
    score: scoreKey ? round3(p[scoreKey]) : undefined,
  };
}

// Deep copy to JSON-safe data: Maps > arrays, numbers rounded, depth capped against cycles (three.js objects)
export function toPlain(v, depth = 4) {
  if (typeof v === 'number') return round3(v);
  if (v === null || typeof v !== 'object') return v;
  if (depth <= 0) return '[deep]';
  if (v instanceof Map || v instanceof Set || Array.isArray(v)) return [...(v instanceof Map ? v.values() : v)].map((x) => toPlain(x, depth - 1));
  if (ArrayBuffer.isView(v)) return `[${v.constructor.name} ${v.length}]`;
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, toPlain(x, depth - 1)]));
}

function roomInfo(room) {
  if (!room) return null;
  return { code: room.code, isHost: !!room.isHost, me: room.me, peers: asList(room.players).map((p) => p?.id ?? p) };
}

export function readGameDebug({ lobby, read, confirmMs }) {
  const snap = read() ?? {};
  return {
    room: roomInfo(lobby?.room),
    running: !!lobby?.running,
    phase: snap.phase ?? null,
    players: asList(snap.players).map(normalizePlayer),
    confirmMs: (confirmMs?.() ?? []).slice(-200).map(round3),
    extra: toPlain(snap.extra ?? {}),
  };
}

// read() returns { phase, players, extra }; confirmMs() returns the page's press-to-ack samples
export function exposeGameDebug({ lobby, read, confirmMs }, { search = globalThis.location?.search ?? '', target = globalThis } = {}) {
  if (!DEBUG_FLAG.test(search)) return false;
  target.__GAME_DEBUG__ = () => readGameDebug({ lobby, read, confirmMs });
  return true;
}
