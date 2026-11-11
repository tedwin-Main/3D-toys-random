// Holds Putt Party hole maps and ball physics (slopes, sand, walls, bumpers, windmill blades, cup, water) with no rendering.

// Holes > map data (par set from bot play: avg strokes 2.2-2.4, 2.1-2.4, 2.3-2.5, 1.5-1.8, 5.0, 3.2-3.3): '#' wall, '.' felt, 'S' tee, 'H' cup, 'O' bumper, 'X' windmill, '~' water, ':' sand, '^v<>' slope
export const HOLES = [
  { name: 'First Putt', par: 2, map: [
    '##########',
    '#SSS.....#',
    '#SSS.....#',
    '######...#',
    '     #...#',
    '     #...#',
    '     #.H.#',
    '     #####',
  ] },
  { name: 'Pinball', par: 3, map: [
    '#############',
    '#SSS........#',
    '#SSS..O..O..#',
    '#...........#',
    '#..O..O..O..#',
    '#...........#',
    '#.....O..O..#',
    '#...........#',
    '#.........H.#',
    '#############',
  ] },
  { name: 'Windmill Gap', par: 3, map: [
    '###############',
    '#SS.....#.....#',
    '#SS.....#.....#',
    '#SS...........#',
    '#SS.....X.....#',
    '#SS...........#',
    '#SS.....#.....#',
    '#SS.....#...H.#',
    '###############',
  ] },
  { name: 'Slip n Slide', par: 2, map: [
    '##############',
    '#SSS.........#',
    '#SSS.........#',
    '#######..vv###',
    '      #~.vv~#',
    '      #~..>>#',
    '      #~~..H#',
    '      #######',
  ] },
  { name: 'Sand Snake', par: 5, map: [
    '###########',
    '#SSS......#',
    '#SSS......#',
    '#######...#',
    '#...:::...#',
    '#.........#',
    '#...#######',
    '#...O.....#',
    '#.......H.#',
    '###########',
  ] },
  { name: 'Grand Finale', par: 4, map: [
    '################',
    '#SSS...~~~.....#',
    '#SSS...~~~..O..#',
    '#......~~~.....#',
    '#.....>>>>.....#',
    '####.......#####',
    '   #...X...#',
    '   #.......#',
    '####.......#####',
    '#....:::.....H.#',
    '################',
  ] },
];
// tile size, ball radius, physics substep
export const T = 2, R = 0.2, SUB = 1 / 120;
export const SLOPE = { '^': [0, -1], v: [0, 1], '>': [1, 0], '<': [-1, 0] };
export const solid = (ch) => ch === '#' || ch === ' ';
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const millAngle = (t) => t * 1.3;
export const tileAt = (hole, c, r) => (r < 0 || r >= hole.rows || c < 0 || c >= hole.cols ? ' ' : hole.grid[r][c]);
export const tileUnder = (hole, b) => tileAt(hole, Math.floor(b.x / T), Math.floor(b.z / T));

// bot distance field: tile steps to cup, water and walls impassable (-1)
function cupDistanceField(grid, cols, cup) {
  const field = new Array(cols * grid.length).fill(-1);
  const cc = Math.floor(cup.x / T), cr = Math.floor(cup.z / T), queue = [[cc, cr]];
  field[cr * cols + cc] = 0;
  while (queue.length) {
    const [c, r] = queue.shift(), steps = field[r * cols + c];
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr;
      if (nc < 0 || nr < 0 || nc >= cols || nr >= grid.length) continue;
      const ch = grid[nr][nc];
      if (solid(ch) || ch === '~' || field[nr * cols + nc] >= 0) continue;
      field[nr * cols + nc] = steps + 1;
      queue.push([nc, nr]);
    }
  }
  return field;
}

export function parseHole(i) {
  const src = HOLES[i], cols = Math.max(...src.map.map((r) => r.length));
  const grid = src.map.map((r) => r.padEnd(cols, ' '));
  const hole = { i, name: src.name, par: src.par, cols, rows: grid.length, grid, starts: [], bumpers: [], mills: [], cup: null };
  grid.forEach((row, r) => [...row].forEach((ch, c) => {
    const p = { x: c * T + T / 2, z: r * T + T / 2 };
    if (ch === 'S') hole.starts.push(p);
    else if (ch === 'H') hole.cup = p;
    else if (ch === 'O') hole.bumpers.push(p);
    else if (ch === 'X') hole.mills.push(p);
  }));
  hole.field = cupDistanceField(grid, cols, hole.cup);
  return hole;
}

// Run engine > one ball physics step (match sim + bot planner). Returns 's' splash, 'c' cupped, '' still in play; b._wall / b._bump report hits.
export function physStep(hole, b, dt, t) {
  const ch = tileAt(hole, Math.floor(b.x / T), Math.floor(b.z / T)), sl = SLOPE[ch];
  if (sl) { b.vx += sl[0] * 7 * dt; b.vz += sl[1] * 7 * dt; }
  let dxC = hole.cup.x - b.x, dzC = hole.cup.z - b.z, dC = Math.hypot(dxC, dzC);
  // small gimme funnel around the cup
  if (dC < 0.36 && dC > 1e-3) { b.vx += (dxC / dC) * 1.6 * dt; b.vz += (dzC / dC) * 1.6 * dt; }
  const sand = ch === ':';
  let sp = Math.hypot(b.vx, b.vz);
  if (sp > 0) { const ns = Math.max(0, sp * Math.exp(-(sand ? 2.6 : 0.55) * dt) - (sand ? 4.5 : 0.8) * dt); b.vx *= ns / sp; b.vz *= ns / sp; sp = ns; }
  b.x += b.vx * dt; b.z += b.vz * dt;
  b._wall = 0; b._bump = -1;
  const c0 = Math.floor(b.x / T), r0 = Math.floor(b.z / T);
  for (let r = r0 - 1; r <= r0 + 1; r++) for (let c = c0 - 1; c <= c0 + 1; c++) {
    if (!solid(tileAt(hole, c, r))) continue;
    const x0 = c * T, z0 = r * T, px = clamp(b.x, x0, x0 + T), pz = clamp(b.z, z0, z0 + T);
    let nx = b.x - px, nz = b.z - pz, d = Math.hypot(nx, nz), push;
    if (d >= R) continue;
    if (d < 1e-6) {
      // center tunneled inside the block: leave through nearest face
      const o = [[b.x - x0, -1, 0], [x0 + T - b.x, 1, 0], [b.z - z0, 0, -1], [z0 + T - b.z, 0, 1]].sort((a, q) => a[0] - q[0])[0];
      nx = o[1]; nz = o[2]; push = o[0] + R;
    } else { nx /= d; nz /= d; push = R - d; }
    b.x += nx * push; b.z += nz * push;
    const vn = b.vx * nx + b.vz * nz;
    if (vn < 0) { b.vx -= 1.72 * vn * nx; b.vz -= 1.72 * vn * nz; b._wall = Math.max(b._wall, -vn); }
  }
  hole.bumpers.forEach((o, k) => {
    const dx = b.x - o.x, dz = b.z - o.z, d = Math.hypot(dx, dz), rr = R + 0.45;
    if (d >= rr || d < 1e-6) return;
    const nx = dx / d, nz = dz / d;
    b.x = o.x + nx * rr; b.z = o.z + nz * rr;
    const vn = b.vx * nx + b.vz * nz;
    // bumpers add energy so they feel springy
    if (vn < 0) { b.vx -= 2 * vn * nx; b.vz -= 2 * vn * nz; b.vx += nx * 2.5; b.vz += nz * 2.5; b._bump = k; }
  });
  for (const m of hole.mills) for (const off of [0, Math.PI / 2]) {
    const a = millAngle(t) + off, ux = Math.sin(a), uz = Math.cos(a);
    const s = clamp((b.x - m.x) * ux + (b.z - m.z) * uz, -2.5, 2.5), px = m.x + ux * s, pz = m.z + uz * s;
    const dx = b.x - px, dz = b.z - pz, d = Math.hypot(dx, dz), rr = R + 0.14;
    if (d >= rr || d < 1e-6) continue;
    const nx = dx / d, nz = dz / d;
    b.x = px + nx * rr; b.z = pz + nz * rr;
    // blade surface velocity at contact point
    const bvx = s * 1.3 * Math.cos(a), bvz = -s * 1.3 * Math.sin(a);
    const vn = (b.vx - bvx) * nx + (b.vz - bvz) * nz;
    if (vn < 0) { b.vx -= 1.6 * vn * nx; b.vz -= 1.6 * vn * nz; b._wall = Math.max(b._wall, -vn); }
  }
  if (tileAt(hole, Math.floor(b.x / T), Math.floor(b.z / T)) === '~') return 's';
  dC = Math.hypot(hole.cup.x - b.x, hole.cup.z - b.z);
  sp = Math.hypot(b.vx, b.vz);
  if (dC < 0.26 && sp < 5.5) return 'c';
  if (sp < 0.07 && !SLOPE[tileAt(hole, Math.floor(b.x / T), Math.floor(b.z / T))] && dC > 0.36) { b.vx = 0; b.vz = 0; }
  return '';
}
