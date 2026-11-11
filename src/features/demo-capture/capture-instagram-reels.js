// Records the 64 aero demos with sound and builds Instagram reels, covers, compilations and the daily post queue.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { recordDemoTake, rawVideoFile, rawAudioFile, RAW_SECS } from './record-demo-session.js';
import { pickHighlightStart } from './pick-highlight.js';
import { musicFileFor, missingMusic, styleMusicFile, masterMusicFile, missingCompilationMusic } from './aero-music.js';
import { renderBar, renderCard, renderHook } from './reel-overlays.js';
import { buildDemoReel, buildCover, addMusicToVideo, cardSegment, clipSegment, xfadeChain, concatHard } from './build-reel-video.js';
import { REEL_SCRIPTS } from './reel-scripts.js';
import { writePostQueue } from './write-post-queue.js';
import { loadAeroStyles } from './aero-reel-catalog.js';
import { REEL_SECS } from './reel-format.js';

const SRC = join(import.meta.dirname, '..', '..');
const TMP = join(import.meta.dirname, '.instagram-capture');
const OUT = join(SRC, 'features', 'instagram-posts');
const BASE = 'http://localhost:5066';

const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const only = args.filter((a) => !a.startsWith('--'));
const tmp = (file) => join(TMP, file);

// Run engine: reuse running server, else boot one for this run
async function ensureServer() {
  const healthy = () => fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false);
  if (await healthy()) return null;
  const child = spawn(process.execPath, [join(SRC, 'features', 'studio-server', 'start-server.js')], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 150));
    if (await healthy()) return child;
  }
  throw new Error('server did not start');
}

async function recordTakes(browser, demos) {
  const report = [];
  for (const d of demos) {
    const take = await recordDemoTake(browser, `${BASE}/${d.url}`, d.name, TMP);
    report.push({ name: d.name, ...take });
    const status = take.ok && !take.errors.length ? 'ok  ' : 'WARN';
    console.log(`${status} ${d.name}${take.hasAudio ? ' +audio' : ''}${take.errors.length ? `  ${take.errors[0]}` : ''}${take.ok ? '' : '  no frames'}`);
  }
  return report;
}

async function renderOverlays(browser, all, styles) {
  const page = await browser.newPage();
  for (const d of all) {
    const style = styles.find((s) => s.id === d.style);
    await renderBar(page, tmp(`${d.name}-bar.png`), d.title, style.label);
    await renderHook(page, tmp(`${d.name}-hook.png`), REEL_SCRIPTS.find((s) => s.name === d.name).hook);
  }
  await renderCard(page, tmp('card-intro.png'), { kicker: 'Nostalgia Series', big: 'Frutiger Aero', sub: `${styles.length} styles · ${all.length} live demos` });
  await renderCard(page, tmp('card-outro.png'), { kicker: 'Which era was yours?', big: 'Render Studio', sub: 'All demos run live in the browser' });
  for (const s of styles) await renderCard(page, tmp(`card-${s.id}.png`), { kicker: 'Frutiger Aero', big: s.label, sub: `${s.demos.length} live demo${s.demos.length > 1 ? 's' : ''}` });
  await page.close();
}

const takeOf = (d) => ({ rawVideo: rawVideoFile(TMP, d.name), rawAudio: rawAudioFile(TMP, d.name) });
const hasTake = (d) => existsSync(rawVideoFile(TMP, d.name));

// Per-demo: demo-sound-only reel, posting reel with aero music, cover
async function buildDemoOutputs(demos, styles) {
  const highlights = new Map();
  for (const sub of ['reels', 'covers']) await mkdir(join(OUT, sub), { recursive: true });
  for (const d of demos.filter(hasTake)) {
    const style = styles.find((s) => s.id === d.style);
    const start = pickHighlightStart({ ...takeOf(d), totalSecs: RAW_SECS, clipSecs: REEL_SECS });
    highlights.set(d.name, start);
    const shared = { ...takeOf(d), start, secs: REEL_SECS, hookPng: tmp(`${d.name}-hook.png`), barPng: tmp(`${d.name}-bar.png`) };
    await mkdir(join(OUT, 'demos', style.file), { recursive: true });
    buildDemoReel({ ...shared, out: join(OUT, 'demos', style.file, `${d.name}.mp4`) });
    buildDemoReel({ ...shared, bgm: musicFileFor(d.name), out: join(OUT, 'reels', `${d.name}.mp4`) });
    buildCover({ rawVideo: shared.rawVideo, at: start + 3, hookPng: shared.hookPng, barPng: shared.barPng, out: join(OUT, 'covers', `${d.name}.jpg`) });
    console.log(`built ${d.name} (highlight ${start.toFixed(1)} s)`);
  }
  return highlights;
}

// Per-style reels: card + 4.5 s per demo, crossfaded, one music bed
async function buildStyleReels(styles, highlights) {
  await mkdir(join(OUT, 'styles'), { recursive: true });
  for (const s of styles) {
    const parts = [{ file: tmp(`seg-card-${s.id}.mp4`), secs: 1.5 }];
    cardSegment(tmp(`card-${s.id}.png`), 1.5, parts[0].file);
    for (const d of s.demos.filter(hasTake)) {
      const file = tmp(`seg-style-${d.name}.mp4`);
      clipSegment({ ...takeOf(d), barPng: tmp(`${d.name}-bar.png`), start: highlights.get(d.name) + 0.5, secs: 4.5, out: file });
      parts.push({ file, secs: 4.5 });
    }
    xfadeChain(parts, tmp(`style-${s.id}-video.mp4`), 0.4);
    addMusicToVideo({ video: tmp(`style-${s.id}-video.mp4`), bgm: styleMusicFile(s.id), out: join(OUT, 'styles', `${s.file}.mp4`), loopMusic: true });
  }
  console.log('built per-style reels');
}

// Master reel: intro + (style card 0.8 s + 1.65 s per demo) + outro, hard cuts, one music bed
async function buildMasterReel(styles, highlights) {
  const seq = [tmp('seg-intro.mp4')];
  cardSegment(tmp('card-intro.png'), 1.5, seq[0]);
  for (const s of styles) {
    const card = tmp(`seg-mcard-${s.id}.mp4`);
    cardSegment(tmp(`card-${s.id}.png`), 0.8, card);
    seq.push(card);
    for (const d of s.demos.filter(hasTake)) {
      const file = tmp(`seg-master-${d.name}.mp4`);
      clipSegment({ ...takeOf(d), barPng: tmp(`${d.name}-bar.png`), start: highlights.get(d.name) + 1, secs: 1.65, out: file });
      seq.push(file);
    }
  }
  seq.push(tmp('seg-outro.mp4'));
  cardSegment(tmp('card-outro.png'), 1.5, seq.at(-1));
  await mkdir(join(OUT, 'master'), { recursive: true });
  concatHard(seq, tmp('master-video.mp4'));
  addMusicToVideo({ video: tmp('master-video.mp4'), bgm: masterMusicFile(), out: join(OUT, 'master', 'frutiger-aero-all-styles.mp4'), loopMusic: true });
  console.log('built master reel');
}

// keep raw takes and downloaded music (gitignored) so --build-only can rebuild; drop segments + overlays
async function cleanWorkDir() {
  for (const f of await readdir(TMP)) if (f !== 'music' && !/-raw\.(mp4|m4a)$/.test(f)) await rm(tmp(f), { recursive: true, force: true });
}

// ---- run ----
const { all, styles } = await loadAeroStyles();
// --queue-only: rewrite post-queue.json captions from reel-scripts.js; no recording or rendering
if (flags.has('--queue-only')) {
  await writePostQueue(all, OUT);
  console.log(`queue rewritten: ${join(OUT, 'post-queue.json')}`);
  process.exit(0);
}
const picked = all.filter((d) => !only.length || only.includes(d.name));
await mkdir(TMP, { recursive: true });
const missing = missingMusic(picked.map((d) => d.name));
if (missing.length) throw new Error(`missing aero music for ${missing.length} reels (run npm run music): ${missing.join(', ')}`);
const missingComp = only.length ? [] : missingCompilationMusic();
if (missingComp.length) throw new Error(`missing aero compilation music (run npm run music): ${missingComp.join(', ')}`);
const server = await ensureServer();
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });
const report = flags.has('--build-only') ? [] : await recordTakes(browser, picked);
await renderOverlays(browser, all, styles);
await browser.close();
if (server) server.kill();

const highlights = await buildDemoOutputs(picked, styles);
if (!only.length) {
  await buildStyleReels(styles, highlights);
  await buildMasterReel(styles, highlights);
  await writePostQueue(all, OUT);
}
await cleanWorkDir();
const bad = report.filter((r) => !r.ok || r.errors.length);
const silent = report.filter((r) => r.ok && !r.hasAudio).map((r) => r.name);
console.log(`done: ${OUT}${bad.length ? `\nwarnings: ${bad.map((r) => r.name).join(', ')}` : ''}${silent.length ? `\nno demo audio: ${silent.join(', ')}` : ''}`);
