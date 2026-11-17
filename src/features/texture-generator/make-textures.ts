// Generates the procedural texture pack (marble, voronoi glass, island terrain, pixel ships) as PNGs.
// Run (from 3d-toys/): node src/features/texture-generator/make-textures.ts [outDir]
import fs from 'node:fs';
import path from 'node:path';
import { PNG } from 'pngjs';

const OUT = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '..', '..', 'media', 'images'));

type Rgb = [number, number, number];
type Stop = [number, Rgb];

// Seeded mulberry32: same seed, same pack
function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, v));
const byte = (v: number) => clamp(Math.floor(v), 0, 255);
const rgbOf = (channel: (c: number) => number): Rgb => [channel(0), channel(1), channel(2)];

function hsvToRgb(h: number, s: number, v: number): Rgb {
  const i = Math.floor(h * 6) % 6, f = h * 6 - Math.floor(h * 6);
  const p = v * (1 - s), q = v * (1 - s * f), t = v * (1 - s * (1 - f));
  const table: Rgb[] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]];
  return table[i];
}

// Noise: tileable Perlin gradient noise on a size x size grid with res x res cells
function perlin(size: number, res: number, seed: number) {
  const rnd = seeded(seed), cell = size / res, n = res + 1;
  const angles = Array.from({ length: n * n }, () => 2 * Math.PI * rnd());
  // wrap last row/col onto first so the texture tiles
  for (let k = 0; k < n; k++) { angles[res * n + k] = angles[k]; angles[k * n + res] = angles[k * n]; }
  const gx = angles.map(Math.cos), gy = angles.map(Math.sin);
  const out = new Float64Array(size * size);
  const fade = (t: number) => t * t * t * (t * (t * 6 - 15) + 10);
  for (let i = 0; i < size; i++) {
    const ci = Math.floor(i / cell), fi = (i / cell) % 1, ti = fade(fi);
    for (let j = 0; j < size; j++) {
      const cj = Math.floor(j / cell), fj = (j / cell) % 1, tj = fade(fj);
      const a = ci * n + cj, b = (ci + 1) * n + cj, c = ci * n + cj + 1, d = (ci + 1) * n + cj + 1;
      const n00 = fi * gx[a] + fj * gy[a];
      const n10 = (fi - 1) * gx[b] + fj * gy[b];
      const n01 = fi * gx[c] + (fj - 1) * gy[c];
      const n11 = (fi - 1) * gx[d] + (fj - 1) * gy[d];
      const n0 = n00 * (1 - ti) + ti * n10, n1 = n01 * (1 - ti) + ti * n11;
      out[i * size + j] = Math.SQRT2 * ((1 - tj) * n0 + tj * n1);
    }
  }
  return out;
}

function fbm(size: number, base: number, octaves: number, seed: number, gain = 0.5) {
  const out = new Float64Array(size * size);
  let amp = 1, total = 0;
  for (let o = 0; o < octaves; o++) {
    const res = base * 2 ** o;
    if (res > size / 2) break;
    const layer = perlin(size, res, seed + o);
    for (let k = 0; k < out.length; k++) out[k] += amp * layer[k];
    total += amp;
    amp *= gain;
  }
  return out.map((v) => v / total);
}

/** Maps v in [0,1] through colour stops, like np.interp per channel (clamped at the ends). */
function ramp(v: number, stops: Stop[]): Rgb {
  if (v <= stops[0][0]) return stops[0][1];
  const k = stops.findIndex(([t]) => t >= v);
  if (k < 0) return stops[stops.length - 1][1];
  const [t0, c0] = stops[k - 1], [t1, c1] = stops[k];
  const f = (v - t0) / (t1 - t0);
  return [c0[0] + (c1[0] - c0[0]) * f, c0[1] + (c1[1] - c0[1]) * f, c0[2] + (c1[2] - c0[2]) * f];
}

// RGB float buffer to 8-bit PNG
function rgbPng(size: number, colorAt: (k: number) => Rgb) {
  const png = new PNG({ width: size, height: size, colorType: 2, inputColorType: 2, inputHasAlpha: false });
  const data = Buffer.alloc(size * size * 3);
  for (let k = 0; k < size * size; k++) {
    const [r, g, b] = colorAt(k);
    data[k * 3] = byte(r); data[k * 3 + 1] = byte(g); data[k * 3 + 2] = byte(b);
  }
  png.data = data;
  return PNG.sync.write(png, { colorType: 2, inputColorType: 2, inputHasAlpha: false });
}

// Textures > Calacatta-style marble: turbulence folded through sharp sine veins
function marble(size = 1024) {
  // turbulence (sum of |noise|) gives the folded, marbled look; plain fBm reads as contour lines
  const turb = new Float64Array(size * size);
  for (let o = 0; o < 6; o++) {
    const layer = perlin(size, 2 * 2 ** o, 11 + o);
    for (let k = 0; k < turb.length; k++) turb[k] += Math.abs(layer[k]) / 2 ** o;
  }
  const cloud = fbm(size, 4, 6, 41);
  const gold: Rgb = [181, 146, 96], grey: Rgb = [84, 84, 92];
  const stops: Stop[] = [[0, [230, 226, 218]], [0.5, [245, 242, 237]], [1, [224, 219, 210]]];
  return rgbPng(size, (k) => {
    const y = Math.floor(k / size) / size, x = (k % size) / size;
    const a = 1 - Math.abs(Math.sin((x * 2 + y) * Math.PI * 2 + turb[k] * 3.2));
    const veins = clamp(a ** 16 + a ** 4 * 0.28) * 0.9;
    const fine = (1 - Math.abs(Math.sin((x - y * 2) * Math.PI * 4 + turb[k] * 6))) ** 70 * 0.45;
    const base = ramp(cloud[k] * 0.5 + 0.5, stops);
    return rgbOf((c) => (base[c] * (1 - veins) + grey[c] * veins) * (1 - fine) + gold[c] * fine);
  });
}

// Textures > stained-glass voronoi: F1 shading per cell, dark leading where F2-F1 is small (tileable)
function voronoi(size = 1024, n = 72) {
  const rnd = seeded(8);
  const pts = Array.from({ length: n }, () => [rnd() * size, rnd() * size]);
  const palette = Array.from({ length: n }, () => {
    const h = rnd();
    return hsvToRgb(h < 0.85 ? 0.52 + (h - 0.5) * 0.55 : 0.08, 0.75, 0.85).map((v) => v * 255);
  });
  const f1 = new Float64Array(size * size).fill(1e9), f2 = new Float64Array(size * size).fill(1e9);
  const cid = new Int32Array(size * size);
  for (let i = 0; i < n; i++) {
    const [px, py] = pts[i];
    for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
      for (let k = 0; k < f1.length; k++) {
        const d = Math.hypot((k % size) - px - ox, Math.floor(k / size) - py - oy);
        if (d < f1[k]) { f2[k] = f1[k]; cid[k] = i; f1[k] = d; }
        else if (d < f2[k]) f2[k] = d;
      }
    }
  }
  const grain = fbm(size, 16, 3, 5);
  const reach = (size / Math.sqrt(n)) * 0.75;
  const lead: Rgb = [24, 20, 28];
  return rgbPng(size, (k) => {
    const glow = clamp(1 - f1[k] / reach) ** 1.4;
    const edge = clamp((f2[k] - f1[k]) / 7) ** 0.8;
    const col = palette[cid[k]];
    return rgbOf((c) => (col[c] * (0.45 + 0.75 * glow) + grain[k] * 18) * edge + lead[c] * (1 - edge));
  });
}

// Textures > island terrain: ridged + rolling fBm, radial falloff; 16-bit heightmap + hillshaded relief
function terrain(size = 1024) {
  const rolling = fbm(size, 2, 7, 101), ridged = fbm(size, 4, 6, 202), coast = fbm(size, 4, 5, 303);
  const h = new Float64Array(size * size);
  for (let k = 0; k < h.length; k++) {
    const y = Math.floor(k / size) / size, x = (k % size) / size;
    const raw = rolling[k] * 0.6 + (1 - Math.abs(ridged[k])) ** 2 * 0.55;
    const d = Math.hypot(x - 0.5, (y - 0.52) * 1.15) * 2;
    // noisy radial mask: irregular coastline without turning the island into a dome
    const t = clamp((d + coast[k] * 0.45 - 0.3) / 0.62);
    h[k] = (raw + 0.35) * (1 - t * t * (3 - 2 * t));
  }
  let lo = Infinity, hi = -Infinity;
  for (const v of h) { lo = Math.min(lo, v); hi = Math.max(hi, v); }
  for (let k = 0; k < h.length; k++) h[k] = (h[k] - lo) / (hi - lo);

  const levels = new Uint16Array(size * size).map((_, k) => Math.floor(h[k] * 65535));
  const heightPng = new PNG({ width: size, height: size, bitDepth: 16, colorType: 0, inputColorType: 0, inputHasAlpha: false });
  heightPng.data = Buffer.from(levels.buffer);
  const heightmap = PNG.sync.write(heightPng, { bitDepth: 16, colorType: 0, inputColorType: 0, inputHasAlpha: false });

  // hillshade from the north-west; np.gradient: central inside, one-sided at edges
  const at = (row: number, col: number) => h[row * size + col] * 220;
  const grad = (a: number, b: number, i: number) => (i === 0 || i === size - 1 ? b - a : (b - a) / 2);
  const az = (315 * Math.PI) / 180, alt = (42 * Math.PI) / 180;
  const sea = 0.42;
  const stops: Stop[] = [[0, [14, 42, 78]], [sea - 0.08, [28, 86, 128]], [sea, [64, 150, 168]], [sea + 0.012, [214, 200, 150]], [sea + 0.05, [122, 150, 76]],
    [0.62, [62, 108, 52]], [0.76, [104, 98, 78]], [0.9, [150, 142, 132]], [0.95, [240, 242, 246]], [1, [255, 255, 255]]];
  const relief = rgbPng(size, (k) => {
    const row = Math.floor(k / size), col = k % size;
    const gy = grad(at(Math.max(row - 1, 0), col), at(Math.min(row + 1, size - 1), col), row);
    const gx = grad(at(row, Math.max(col - 1, 0)), at(row, Math.min(col + 1, size - 1)), col);
    const slope = Math.PI / 2 - Math.atan(Math.hypot(gx, gy));
    const aspect = Math.atan2(-gx, gy);
    const shade = clamp(Math.sin(alt) * Math.sin(slope) + Math.cos(alt) * Math.cos(slope) * Math.cos(az - aspect));
    const land = h[k] > sea;
    // contour lines every 0.04 of height on land
    const contour = land && Math.abs((((h[k] - sea) / 0.04) % 1 + 1) % 1 - 0.5) > 0.47;
    const light = (land ? 0.45 + 0.75 * shade : 0.85 + 0.15 * shade) * (contour ? 0.78 : 1);
    const base = ramp(h[k], stops);
    return rgbOf((c) => base[c] * light);
  });
  return { heightmap, relief };
}

// Sprites > Bollinger-style pixel spaceships: mirrored mask, random body, auto outline, row-shaded hue
const MASK = [
  [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 1, -1], [0, 0, 0, 1, 1, -1], [0, 0, 0, 1, 1, -1], [0, 0, 1, 1, 1, -1],
  [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 1, -1], [0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0],
];

/** One 12x12 ship as RGBA rows; null = transparent. Cells: 0 empty, 1 body, 2 outline, 3 cockpit. */
function ship(rnd: () => number) {
  const half = MASK.map((row) => row.map((m) => (m === -1 ? 2 : m === 1 ? (rnd() < 0.55 ? 1 : 0) : m === 2 ? (rnd() < 0.5 ? 1 : 3) : 0)));
  const g = half.map((row) => [...row, ...[...row].reverse()]);
  const filled = (a: number, b: number) => a >= 0 && a < g.length && b >= 0 && b < g[0].length && (g[a][b] === 1 || g[a][b] === 3);
  // border: empty cells touching body become outline
  const out = g.map((row, y) => row.map((v, x) => (v === 0 && (filled(y - 1, x) || filled(y + 1, x) || filled(y, x - 1) || filled(y, x + 1)) ? 2 : v)));
  const hue = rnd(), sat = 0.45 + rnd() * 0.4;
  const cockpit = hsvToRgb((hue + 0.5) % 1, 0.35, 1);
  const outline: Rgb = [18, 16, 30];
  return out.map((row, y) => row.map((v, x) => {
    if (v === 1) return hsvToRgb(hue, sat, Math.min(1, 0.95 - (y / out.length) * 0.45 + (x === 5 || x === 6 ? 0.08 : 0))).map((c) => c * 255);
    if (v === 3) return cockpit.map((c) => c * 255);
    if (v === 2) return outline;
    return null;
  }));
}

function spriteSheet(cols = 8, rows = 5, scale = 10, cell = 128) {
  const rnd = seeded(1977);
  const width = cols * cell, height = rows * cell;
  const data = Buffer.alloc(width * height * 4);
  const paint = (x: number, y: number, [r, g, b]: number[]) => {
    const o = (y * width + x) * 4;
    data[o] = byte(r); data[o + 1] = byte(g); data[o + 2] = byte(b); data[o + 3] = 255;
  };
  for (let k = 0; k < width * height; k++) paint(k % width, Math.floor(k / width), [10, 12, 26]);
  for (let s = 0; s < 260; s++) {
    const sx = Math.floor(rnd() * width), sy = Math.floor(rnd() * height), b = 60 + Math.floor(rnd() * 140);
    paint(sx, sy, [b, b, Math.min(255, b + 30)]);
  }
  const span = 12 * scale;
  for (let i = 0; i < cols * rows; i++) {
    const pixels = ship(rnd);
    const cx = (i % cols) * cell + Math.floor((cell - span) / 2), cy = Math.floor(i / cols) * cell + Math.floor((cell - span) / 2);
    // nearest-neighbour upscale; ship pixels are opaque so compositing is a plain overwrite
    for (let y = 0; y < span; y++) for (let x = 0; x < span; x++) {
      const px = pixels[Math.floor(y / scale)][Math.floor(x / scale)];
      if (px) paint(cx + x, cy + y, px);
    }
  }
  const png = new PNG({ width, height });
  png.data = data;
  return PNG.sync.write(png);
}

type Note = { title: string; about: string; prompt: string };
const readNotes = (raw: string): Record<string, Note> => JSON.parse(raw);

// Output > PNGs + notes.json (merged so other generators' entries survive)
function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const jobs: Record<string, Note & { make: () => Buffer }> = {
    'marble-texture.png': { make: () => marble(), title: 'Seamless Marble', about: 'Tileable Calacatta-style marble: domain-warped Perlin fBm folded through a sharp sine to make grey veins with fine gold threads. Pure numpy, no image inputs.',
      prompt: 'Write a Python script with numpy and Pillow that generates a seamless 1024px marble texture: tileable Perlin fBm, domain warping, sharp sine veins in grey plus thin gold veins on a warm white base.' },
    'voronoi-cells.png': { make: () => voronoi(), title: 'Stained-Glass Voronoi', about: '72-cell tileable Voronoi diagram computed brute force with F1/F2 distances: each cell glows from its centre and dark leading appears where F2 minus F1 is small, like stained glass.',
      prompt: 'Using numpy and Pillow, render a tileable stained-glass Voronoi texture: random points wrapped across tile edges, F1 and F2 distance fields, jewel-tone cells brightened toward their centres and dark leading lines where F2-F1 is small.' },
    'spaceship-sprite-sheet.png': { make: () => spriteSheet(), title: 'Pixel Spaceship Sprites', about: '40 procedural pixel spaceships from a mirrored 12x12 mask (Bollinger style): random body cells, automatic outlines, row-shaded hulls and contrasting cockpits, packed into a game-ready sprite sheet.',
      prompt: 'Generate a sprite sheet of 40 unique pixel-art spaceships in Python: use a half mask with always-empty, maybe-body and maybe-cockpit cells, mirror it, outline the body automatically, shade by row with a random hue, and lay them out on an 8x5 grid over a starfield.' },
  };
  const notesPath = path.join(OUT, 'notes.json');
  const notes = fs.existsSync(notesPath) ? readNotes(fs.readFileSync(notesPath, 'utf8')) : {};
  for (const [name, { make, ...note }] of Object.entries(jobs)) {
    fs.writeFileSync(path.join(OUT, name), make());
    notes[name] = note;
    console.log('wrote', name);
  }
  const { heightmap, relief } = terrain();
  fs.writeFileSync(path.join(OUT, 'terrain-heightmap.png'), heightmap);
  fs.writeFileSync(path.join(OUT, 'terrain-relief.png'), relief);
  notes['terrain-heightmap.png'] = { title: 'Island Heightmap (16-bit)', about: '16-bit greyscale heightmap of a procedural island: rolling plus ridged Perlin fBm with a radial falloff. Drop it into Blender displace, Unity or Unreal terrain.',
    prompt: 'With numpy, build a 1024px island heightmap from rolling fBm plus squared ridged noise and a radial falloff, normalise it and save a 16-bit greyscale PNG.' };
  notes['terrain-relief.png'] = { title: 'Shaded Relief Map', about: 'The same island rendered as a cartographic relief map: hypsometric colour ramp from deep sea to snow, north-west hillshade from the height gradient, and contour lines on land.',
    prompt: 'Turn a heightmap into a shaded relief map in Python: hypsometric colour ramp (deep water, shallows, sand, grass, forest, rock, snow), a hillshade from slope and aspect lit from the north-west, and subtle contour lines.' };
  console.log('wrote terrain-heightmap.png, terrain-relief.png');
  fs.writeFileSync(notesPath, `${JSON.stringify(notes, null, 2)}\n`);
}

main();
