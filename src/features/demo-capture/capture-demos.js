/**
 * FILE: src/features/demo-capture/capture-demos.js
 * PURPOSE: headless QA + poster capture for live demos: console errors, fps, poster png, optional mobile shot + video clips + ffmpeg demo reel
 * UI: Render Studio home grid posters, Videos tab (demo reel), Images tab (reel gif)
 * USED BY: npm run capture [-- names... --mobile --clips --reel --toys]
 * KEY EXPORTS: none (cli script)
 */
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
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

// Recorder: CDP screencast frames to jpgs, ffmpeg concat with real frame durations (no Playwright ffmpeg download)
async function recordClip(ctx, page, d, ms) {
  const name = d.name;
  const dir = join(TMP, name);
  await mkdir(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = `f-${String(frames.length).padStart(4, '0')}.jpg`;
    frames.push({ file, t: metadata.timestamp });
    await writeFile(join(dir, file), Buffer.from(data, 'base64'));
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 88, maxWidth: 1280, maxHeight: 800 });
  await page.waitForTimeout(ms);
  await cdp.send('Page.stopScreencast');
  await new Promise((r) => setTimeout(r, 200));
  if (frames.length < 2) return;
  const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.max(0.001, (frames[i + 1]?.t ?? f.t + 1 / 30) - f.t).toFixed(4)}`).join('\n');
  // concat demuxer ignores the last duration unless the final file is repeated
  await writeFile(join(dir, 'list.txt'), `${list}\nfile '${frames.at(-1).file}'\n`);
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', 'fps=30,scale=1280:800', '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', join(TMP, `${name}-raw.mp4`)]);
  await rm(dir, { recursive: true, force: true });
  // title bar as transparent png: Homebrew ffmpeg ships without drawtext
  const bar = await ctx.newPage();
  await bar.setViewportSize({ width: 1280, height: 110 });
  const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
  await bar.setContent(`<body style="margin:0;background:transparent"><div id="b" style="width:1280px;height:110px;display:flex;align-items:flex-end;gap:16px;padding:0 40px 26px;box-sizing:border-box;background:linear-gradient(0deg,rgba(0,0,0,.78),rgba(0,0,0,0));font:800 36px -apple-system,Helvetica,sans-serif;color:#fff"><span>${esc(d.title)}</span><span style="font:700 15px -apple-system,Helvetica,sans-serif;letter-spacing:2px;text-transform:uppercase;background:#ffcf3f;color:#14110a;padding:6px 12px;border-radius:99px;margin-bottom:6px">${esc(d.category)}</span></div></body>`);
  await bar.locator('#b').screenshot({ path: join(TMP, `${name}-title.png`), omitBackground: true });
  await bar.close();
}

// Toys: multiplayer pages open on a lobby card, so host a room with max bots and press Start for a real poster
async function startLobbyMatch(page) {
  const create = page.locator('.lb-create');
  if (!(await create.isVisible({ timeout: 1500 }).catch(() => false))) return;
  await page.locator('.lb-nick').fill('Studio').catch(() => {});
  await create.click().catch(() => {});
  await page.locator('.lb-start').waitFor({ timeout: 3000 }).catch(() => {});
  await page.evaluate(() => { const r = document.querySelector('.lb-bot-in'); if (r) { r.value = r.max; r.dispatchEvent(new Event('input', { bubbles: true })); r.dispatchEvent(new Event('change', { bubbles: true })); } });
  await page.locator('.lb-start').click().catch(() => {});
}

const server = await ensureServer();
await mkdir(TMP, { recursive: true });
// real GPU (Metal) so shaders + fps match a laptop, not SwiftShader
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
// --toys swaps the demo list for 3d-toys pages (games + sims); posters land in media/toy-posters/<dir>.png
const TOY_POSTERS = join(ROOT, 'media', 'toy-posters');
const demos = flags.has('--toys')
  ? [...TOYS, ...SIMS].filter((t) => !only.length || only.includes(t.dir)).map((t) => ({ name: t.dir, url: `3d-toys/${t.dir}/`, capture: 4500, toy: true }))
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
  await page.goto(`${BASE}/${d.url}?capture=1`, { waitUntil: 'load' }).catch((e) => errors.push(String(e)));
  if (d.toy) await startLobbyMatch(page);
  // demo can pick poster moment via <meta name="capture" content="ms">
  await page.waitForTimeout(flags.has('--clips') ? 1500 : d.capture || 3500);
  if (flags.has('--clips')) await recordClip(ctx, page, d, 5500);
  // clip runs wait longer than the tuned poster moment, so keep existing posters
  if (!flags.has('--clips')) await page.screenshot({ path: join(d.toy ? TOY_POSTERS : DEMOS, `${d.name}.png`) });
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

// Recorder: merge one entry into media/<folder>/notes.json (explanation + prompt per file)
async function writeNotes(folder, file, entry) {
  const path = join(ROOT, 'media', folder, 'notes.json');
  const notes = JSON.parse(await readFile(path, 'utf8').catch(() => '{}'));
  notes[file] = entry;
  await writeFile(path, JSON.stringify(notes, null, 2) + '\n');
}

// Recorder: ffmpeg demo reel, 5 s from each clip with title, crossfaded
if (flags.has('--reel')) {
  const clips = (await readdir(TMP)).filter((f) => f.endsWith('-raw.mp4')).sort();
  const titled = [];
  for (const f of clips) {
    const d = demos.find((x) => `${x.name}-raw.mp4` === f);
    if (!d) continue;
    const out = join(TMP, `${d.name}.mp4`);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-t', '5', '-i', join(TMP, f), '-i', join(TMP, `${d.name}-title.png`), '-filter_complex',
      '[0:v]scale=1280:800,fps=30[v];[v][1:v]overlay=0:H-h', '-t', '5',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-an', out]);
    titled.push(out);
  }
  if (titled.length > 1) {
    const inputs = titled.flatMap((f) => ['-i', f]);
    let chain = '', last = '[0:v]';
    for (let i = 1; i < titled.length; i++) {
      const tag = i === titled.length - 1 ? '[v]' : `[x${i}]`;
      chain += `${last}[${i}:v]xfade=transition=fade:duration=0.6:offset=${(i * 4.4).toFixed(1)}${tag};`;
      last = tag;
    }
    const reel = join(ROOT, 'media', 'videos', 'demo-reel.mp4');
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', chain.slice(0, -1), '-map', '[v]', '-c:v', 'libx264', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', reel]);
    execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', reel, '-vf', 'setpts=PTS/3,fps=10,scale=480:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=96[p];[b][p]paletteuse=dither=bayer', join(ROOT, 'media', 'images', 'demo-reel.gif')]);
    console.log(`reel: ${reel}`);
    await writeNotes('videos', 'demo-reel.mp4', { title: 'Live Demo Reel', about: `Every live demo recorded headless by Playwright on the real GPU, trimmed to 5 s, titled and crossfaded with one ffmpeg filter graph (${titled.length} clips).`,
      prompt: 'Write a Playwright script that opens each demo page, records a few seconds of video, then use ffmpeg to trim each clip, burn in its title and chain xfade transitions into one MP4 reel.' });
    await writeNotes('images', 'demo-reel.gif', { title: 'Demo Reel GIF', about: 'The demo reel at 3x speed as a palette-optimised GIF (palettegen + paletteuse) for READMEs and chat embeds.',
      prompt: 'Convert the demo reel MP4 into a small looping GIF with ffmpeg: speed it up 3x, 10 fps, 480 px wide, generated palette with Bayer dithering.' });
  }
}

if (server) server.kill();
if (!flags.has('--mobile') && !flags.has('--clips')) await rm(TMP, { recursive: true, force: true });
console.log(`${report.filter((r) => !r.errors).length}/${report.length} clean`);
