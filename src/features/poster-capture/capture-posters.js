// Runs headless QA and poster capture for live demos and toys.

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { listDemos } from '../studio-server/list-assets.js';
import { TOYS, SIMS } from '../toy-box/common/toy-list.js';

const ROOT = join(import.meta.dirname, '..', '..');
const DEMOS = join(ROOT, 'features', 'demo-gallery', 'demos');
const TMP = join(import.meta.dirname, '.capture');
const BASE = 'http://localhost:5066';
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const only = args.filter((a) => !a.startsWith('--'));

// Run engine: reuse running server, else boot one for this run
async function ensureServer() {
  const up = await fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false);
  if (up) return null;
  const child = spawn(process.execPath, [join(ROOT, 'features', 'studio-server', 'start-server.js')], { stdio: 'ignore' });
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 150));
    if (await fetch(`${BASE}/health`).then((r) => r.ok).catch(() => false)) return child;
  }
  throw new Error('server did not start');
}

// Run engine: count rAF frames for 1.5 s inside page
const measureFps = (page) => page.evaluate(() => new Promise((res) => {
  let n = 0;
  const t0 = performance.now();
  const tick = () => { n++; if (performance.now() - t0 < 1500) requestAnimationFrame(tick); else res(Math.round((n * 1000) / (performance.now() - t0))); };
  requestAnimationFrame(tick);
}));

// Toys: multiplayer posters = hover preview frame; ?preview hides the lobby and warms attract bots to mid-game
const previewReady = (page) => page.waitForFunction(() => globalThis.__previewReady, null, { timeout: 40000 });
const PREVIEW_SETTLE_MS = 1000;

const server = await ensureServer();
await mkdir(TMP, { recursive: true });
// real GPU (Metal) so shaders + fps match a laptop, not SwiftShader
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
// --toys swaps the demo list for 3d-toys pages (games + sims); posters land in media/toy-posters/<dir>.png
const TOY_POSTERS = join(ROOT, 'media', 'toy-posters');
const toyCapture = (t) => ({ name: t.dir, url: `3d-toys/${t.dir}/`, capture: 4500, toy: true, multi: t.players === 'multi', previewAt: t.previewAt });
const pageQuery = (d) => (d.multi ? `?capture=1&preview${d.previewAt ? `=${d.previewAt}` : ''}&debug` : '?capture=1');
const demos = flags.has('--toys')
  ? [...TOYS, ...SIMS].filter((t) => !only.length || only.includes(t.dir)).map(toyCapture)
  : (await listDemos(DEMOS)).filter((d) => !only.length || only.includes(d.name));
if (flags.has('--toys')) await mkdir(TOY_POSTERS, { recursive: true });
const report = [];

for (const d of demos) {
  const errors = [];
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text().slice(0, 200)); });
  page.on('response', (r) => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 200)));
  await page.goto(`${BASE}/${d.url}${pageQuery(d)}`, { waitUntil: 'load' }).catch((e) => errors.push(String(e)));
  // demo can pick poster moment via <meta name="capture" content="ms">
  if (d.multi) {
    await previewReady(page).catch(() => errors.push('preview never signalled ready'));
    await page.waitForTimeout(PREVIEW_SETTLE_MS);
  } else await page.waitForTimeout(d.capture || 3500);
  await page.screenshot({ path: join(d.toy ? TOY_POSTERS : DEMOS, `${d.name}.png`) });
  const fps = await measureFps(page).catch(() => 0);
  await ctx.close();
  if (flags.has('--mobile')) {
    const m = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
    const mp = await m.newPage();
    mp.on('pageerror', (e) => errors.push(`[mobile] ${String(e).slice(0, 200)}`));
    await mp.goto(`${BASE}/${d.url}?capture=1`, { waitUntil: 'load' }).catch(() => {});
    await mp.waitForTimeout(d.capture || 3000);
    await mp.screenshot({ path: join(TMP, `${d.name}-mobile.png`) });
    await m.close();
  }
  report.push({ name: d.name, fps, errors: errors.length, first: errors[0] ?? '' });
  console.log(`${errors.length ? 'FAIL' : 'ok  '} ${String(fps).padStart(3)} fps  ${d.name}${errors.length ? `  ${errors[0]}` : ''}`);
}
await browser.close();

if (server) server.kill();
if (!flags.has('--mobile')) await rm(TMP, { recursive: true, force: true });
console.log(`${report.filter((r) => !r.errors).length}/${report.length} clean`);
