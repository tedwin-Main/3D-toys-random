// Builds Pattern Panic logic round: memorise symbols on a tile grid, stand on the called symbol before the rest drop.

import { box, createCourse, mulberry32 } from '../course-colliders.js';
import { CANDY, latestStarted } from '../course-kit.js';
import { steerTo, wander } from '../bean-bots.js';
import { INTRO } from '../round-sim.js';

const SIDE = 4, PITCH = 3.6, SIZE = 3.4, TILES = SIDE * SIDE;
export const SYMBOLS = ['star', 'moon', 'heart', 'drop', 'leaf', 'bolt'];
const TILE_Y = -0.3, DROP_G = 30;

export default {
  id: 'pattern-panic', title: 'Pattern Panic', emoji: '🧠', kind: 'logic', duration: 150,
  goal: 'Symbols flash on the tiles, then hide. When one is called, stand on it. Every other tile drops.',
  theme: { sky: [0xc39bff, 0xffe6a8], fog: 0xe6d8ff },
  build(seed) {
    const cycles = cycleSchedule(mulberry32(seed));
    const cols = [];
    for (let k = 0; k < TILES; k++) {
      const x = ((k % SIDE) - (SIDE - 1) / 2) * PITCH, z = (Math.floor(k / SIDE) - (SIDE - 1) / 2) * PITCH;
      cols.push(box({ x, y: TILE_Y, z, hx: SIZE / 2, hy: 0.3, hz: SIZE / 2, color: k % 2 ? CANDY.floor : CANDY.floorAlt, tile: k, cycles, move: tileMove }));
    }
    const half = (SIDE * PITCH) / 2;
    return createCourse({ cols, cycles, killY: -8, spawn: (i, n) => spawnOnGrid(i, n, half), view: { arena: half } });
  },
  // view + HUD: symbol per tile (-1 hidden), called symbol, phase and seconds left
  symbols(course, t) { return boardAt(course.cycles, t); },
  // Bots > memorise some tiles while shown; on the call go to a remembered match, else follow the crowd
  bot(sim, b) {
    const board = boardAt(sim.course.cycles, sim.clock), br = b.brain;
    if (board.phase === 'show') remember(sim, b, board);
    if (board.phase !== 'call' && board.phase !== 'drop') { br.goal = null; wander(sim, b, PITCH * 1.2); return true; }
    if (br.goal == null) br.goal = pickTile(sim, b, board);
    if (br.goal == null) { b.mx = b.mz = 0; return true; }
    const c = sim.course.cols[br.goal];
    br.off ??= [(sim.rng() - 0.5) * 1.6, (sim.rng() - 0.5) * 1.6];
    if (steerTo(b, c.base.x + br.off[0], c.base.z + br.off[1]) < 0.5) b.mx = b.mz = 0;
    return true;
  },
};

function spawnOnGrid(i, n, half) {
  const per = Math.ceil(Math.sqrt(n)), step = Math.min(1.6, (half * 1.8) / per);
  return { x: ((i % per) - (per - 1) / 2) * step, y: 0, z: (Math.floor(i / per) - (per - 1) / 2) * step, face: Math.PI };
}

// Schedules > show, hide, call, drop, back; shorter show + fewer safe tiles each cycle
function cycleSchedule(rng) {
  const out = [];
  let t = INTRO + 1;
  for (let i = 0; t < INTRO + 160; i++) {
    const show = Math.max(2.5, 5 - i * 0.4), hide = 1.5, call = Math.max(2.5, 4 - i * 0.25), drop = 2.5, back = 1.5;
    const called = Math.floor(rng() * SYMBOLS.length), safe = i < 1 ? 3 : i < 3 ? 2 : 1;
    const order = [...Array(TILES).keys()].sort(() => rng() - 0.5);
    const board = new Array(TILES);
    order.forEach((k, j) => (board[k] = j < safe ? called : (called + 1 + Math.floor(rng() * (SYMBOLS.length - 1))) % SYMBOLS.length));
    out.push({ start: t, i, called, board, marks: [show, show + hide, show + hide + call, show + hide + call + drop, show + hide + call + drop + back] });
    t += show + hide + call + drop + back;
  }
  return out;
}

const PHASES = ['show', 'hide', 'call', 'drop', 'back'];
function boardAt(cycles, t) {
  const c = latestStarted(cycles, t);
  if (!c) return { phase: 'wait', tiles: new Array(TILES).fill(-1), call: -1, left: cycles[0].start - t, cycle: null };
  const age = t - c.start, k = c.marks.findIndex((m) => age < m), phase = PHASES[k] ?? 'back';
  const visible = phase === 'show' || phase === 'drop';
  return { phase, cycle: c, call: phase === 'call' || phase === 'drop' ? c.called : -1, tiles: visible ? c.board : new Array(TILES).fill(-1), left: (c.marks[k] ?? age) - age };
}

// Motion > wrong tiles fall during drop, climb back during back
function tileMove(t, c) {
  const cyc = latestStarted(c.cycles, t);
  if (!cyc || cyc.board[c.tile] === cyc.called) return c.base;
  const [, , callEnd, dropEnd, backEnd] = cyc.marks, age = t - cyc.start;
  if (age < callEnd || age >= backEnd) return c.base;
  const sink = age < dropEnd ? Math.min(40, 0.5 * DROP_G * (age - callEnd) ** 2) : 12 * (1 - (age - dropEnd) / (backEnd - dropEnd));
  return { ...c.base, y: TILE_Y - sink };
}

// skill: chance to memorise each tile while symbols show (once per cycle)
function remember(sim, b, board) {
  const br = b.brain;
  if (br.seen === board.cycle) return;
  br.seen = board.cycle; br.memory = new Map();
  for (let k = 0; k < TILES; k++) if (sim.rng() < 0.1 + b.skill * 0.45) br.memory.set(k, board.tiles[k]);
}

// remembered match nearest; unsure: wait a beat, then half join the busiest tile not remembered as wrong, half guess
function pickTile(sim, b, board) {
  const br = b.brain, mem = br.memory ?? new Map(), cols = sim.course.cols;
  const near = (list) => list.sort((p, q) => Math.hypot(cols[p].base.x - b.x, cols[p].base.z - b.z) - Math.hypot(cols[q].base.x - b.x, cols[q].base.z - b.z))[0];
  const sure = [...mem].filter(([, s]) => s === board.call).map(([k]) => k);
  if (sure.length) return near(sure);
  if (board.phase === 'call' && board.left > 1.6) return null;
  const crowd = new Array(TILES).fill(0);
  for (const o of sim.active) if (o !== b && o.gnd >= 0 && cols[o.gnd]?.tile != null) crowd[cols[o.gnd].tile]++;
  const options = [...Array(TILES).keys()].filter((k) => !mem.has(k));
  if (!options.length) return near([...Array(TILES).keys()]);
  return sim.rng() < 0.5 ? options.sort((p, q) => crowd[q] - crowd[p])[0] : options[Math.floor(sim.rng() * options.length)];
}
