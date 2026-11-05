// Builds Ghost Tiles race: identical tiles over the void, only a hidden path holds; fakes vanish when stepped on.

import { box, createCourse, mulberry32, DT } from '../course-colliders.js';
import { CANDY, startPad, finishPad, crossedFinish, spawnGrid } from '../course-kit.js';
import { steerTo } from '../bean-bots.js';
import { ACTIVE } from '../round-sim.js';

const COLS = 6, ROWS = 14, SIZE = 3, PITCH = 3.4, GAP = PITCH - SIZE;
const rowZ = (r) => -GAP - SIZE / 2 - r * PITCH; // tile centre; 0.5 gap after the start pad
const FINISH_Z = rowZ(ROWS - 1) - SIZE / 2 - GAP;
const SHAKE = 0.35; // seconds a fake tile wobbles before it drops
const HIDDEN = 0, SHAKING = 1, GONE = 2, PROVEN = 3;

export default {
  id: 'ghost-tiles', title: 'Ghost Tiles', emoji: '👻', kind: 'race', duration: 150,
  goal: 'Only one hidden path of tiles holds. Fakes vanish under you. Watch who falls, then follow the safe steps.',
  theme: { sky: [0x6d6bd6, 0xffc8e8], fog: 0xb8b0ff },
  build(seed) {
    const rng = mulberry32(seed);
    const real = hiddenPath(rng);
    const cols = [...startPad({ z0: 0, width: COLS * PITCH })];
    const tiles = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      tiles.push(cols.length);
      cols.push(box({ x: (c - (COLS - 1) / 2) * PITCH, y: -0.3, z: rowZ(r), hx: SIZE / 2, hy: 0.3, hz: SIZE / 2, color: (r + c) % 2 ? CANDY.floor : CANDY.floorAlt, real: real.has(r * COLS + c), tile: r * COLS + c, state: HIDDEN, t: 0 }));
    }
    cols.push(...finishPad({ z0: FINISH_Z, width: COLS * PITCH }));
    return createCourse({
      cols, tiles, killY: -10, finishZ: FINISH_Z - 1, finished: crossedFinish(FINISH_Z, 0),
      spawn: spawnGrid({ zFront: 0, width: COLS * PITCH - 2 }),
      checkpoints: [{ x: 0, y: 0, z: 5, w: 12 }],
    });
  },
  tick(sim) { crumble(sim.course, sim.active, (i) => sim.emit('tile', i)); },
  predict(course, b) { crumble(course, [b]); },
  // view: shaking fakes flash white and wobble, proven tiles turn green
  look(c) {
    if (c.tile == null) return null;
    return c.state === SHAKING ? { color: 0xffffff, shake: 0.06 } : c.state === PROVEN ? { color: 0x9ef0a8 } : {};
  },
  pack: (sim) => sim.course.tiles.map((i) => sim.course.cols[i].state).join(''),
  unpack(sim, s) {
    sim.course.tiles.forEach((i, k) => { const c = sim.course.cols[i], st = +s[k]; if (st !== c.state) { c.state = st; c.off = st === GONE; } });
  },
  // Bots > wait for braver beans, line up on the pad edge, then step tile to tile (proven ones first)
  bot(sim, b) {
    const { course } = sim, br = b.brain;
    br.wait ??= sim.rng() * 6 * b.skill;
    if (sim.playTime < br.wait && b.z > 0.5) { b.mx = b.mz = 0; return true; }
    const on = course.cols[b.gnd]?.tile;
    const row = on == null ? -1 : Math.floor(on / COLS), col = on == null ? Math.round(b.x / PITCH + (COLS - 1) / 2) : on % COLS;
    if (row === ROWS - 1 || b.z < FINISH_Z + 1) { steerTo(b, b.z < FINISH_Z - 1 ? 0 : b.x, FINISH_Z - 4); return true; } // straight off the last tile
    if (b.gnd < 0) return true; // airborne: keep heading
    if (br.target == null || course.cols[br.target].state === GONE || br.fromRow !== row) { br.target = nextTile(sim, row + 1, col); br.fromRow = row; }
    const t = course.cols[br.target];
    if (row < 0 && Math.abs(t.base.x - b.x) > 0.4) { steerTo(b, t.base.x, 0.6); return true; }
    // diagonal step: walk to own tile's front corner first so the crossing skips the side neighbour (maybe gone)
    const cur = course.cols[b.gnd];
    if (row >= 0 && Math.abs(t.base.x - cur.base.x) > 1) {
      const cx = cur.base.x + Math.sign(t.base.x - cur.base.x) * (SIZE / 2 - 0.3), cz = cur.base.z - (SIZE / 2 - 0.3);
      if (b.z > cz + 0.25 && steerTo(b, cx, cz, 0.75) > 0.35) return true; // past the corner line: never turn back
    }
    steerTo(b, t.base.x, t.base.z, 0.75); // careful steps: gaps are walkable, jumps overshoot
    return true;
  },
};

// one connected path from row 0 to the last row (sideways steps allowed); a spare beside it in some rows so 32 beans are not single file
function hiddenPath(rng) {
  const real = new Set(), clampCol = (c) => Math.max(0, Math.min(COLS - 1, c));
  let c = Math.floor(rng() * COLS);
  for (let r = 0; r < ROWS; r++) {
    real.add(r * COLS + c);
    if (rng() < 0.45) { c = clampCol(c + (rng() < 0.5 ? -1 : 1)); real.add(r * COLS + c); }
    else if (rng() < 0.5) real.add(r * COLS + clampCol(c + (rng() < 0.5 ? -1 : 1)));
  }
  return real;
}

// Rules > fake tiles shake then drop once stepped; real ones become proven (bots trust them)
function crumble(course, beans, onDrop = () => {}) {
  for (const b of beans) {
    const c = course.cols[b.gnd];
    if (b.status !== ACTIVE || c?.tile == null || c.state !== HIDDEN) continue;
    c.state = c.real ? PROVEN : SHAKING; c.t = SHAKE;
  }
  for (const i of course.tiles) {
    const c = course.cols[i];
    if (c.state !== SHAKING) continue;
    c.t -= DT;
    if (c.t <= 0) { c.state = GONE; c.off = true; onDrop(i); }
  }
}

// from the pad any column of row 0 is reachable; on a tile only the 3 ahead; proven first, else untried, never gone
function nextTile(sim, row, col) {
  const { course } = sim;
  const reach = row === 0 ? [...Array(COLS).keys()] : [col - 1, col, col + 1].filter((c) => c >= 0 && c < COLS);
  const opts = reach.map((c) => course.tiles[row * COLS + c]).filter((i) => course.cols[i].state !== GONE);
  const proven = opts.filter((i) => course.cols[i].state === PROVEN);
  const near = (list) => list.sort((a, b) => Math.abs(course.cols[a].tile % COLS - col) - Math.abs(course.cols[b].tile % COLS - col) || sim.rng() - 0.5)[0];
  if (proven.length) return near(proven);
  if (!opts.length) return course.tiles[row * COLS + col];
  return row === 0 ? near(opts.filter((i) => Math.abs(course.cols[i].tile % COLS - col) <= 1).concat(opts).slice(0, 3).sort(() => sim.rng() - 0.5)) : opts[Math.floor(sim.rng() * opts.length)];
}
