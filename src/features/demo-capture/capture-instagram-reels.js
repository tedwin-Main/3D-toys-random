// Records Frutiger Aero demos in 9:16 portrait and builds Instagram reels.

import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdir, readdir, rm, writeFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { listDemos, CATEGORIES } from '../studio-server/list-assets.js';

const ROOT = join(import.meta.dirname, '..', '..');
const DEMOS = join(ROOT, 'features', 'demo-gallery', 'demos');
const TMP = join(import.meta.dirname, '.instagram-capture');
const OUT = join(ROOT, 'features', 'instagram-posts');
const BASE = 'http://localhost:5066';
const W = 1080, H = 1920, FPS = 30;
const RAW_MS = 9000;
const args = process.argv.slice(2);
const flags = new Set(args.filter((a) => a.startsWith('--')));
const only = args.filter((a) => !a.startsWith('--'));

const ENC = ['-c:v', 'libx264', '-profile:v', 'high', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS), '-movflags', '+faststart', '-an'];
const ff = (a) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...a]);
const slug = (t) => t.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);
const exists = (p) => access(p).then(() => true, () => false);

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

// Motion: S-curve mouse sweep, hover pauses, scroll down then back up (css px, 540x960 viewport)
async function scriptedMotion(page) {
  const path = [[270, 300], [120, 420], [420, 560], [140, 700], [400, 820], [270, 500]];
  await page.mouse.move(270, 200);
  for (const [x, y] of path) {
    await page.mouse.move(x, y, { steps: 28 });
    await page.waitForTimeout(450);
  }
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, 90); await page.waitForTimeout(140); }
  await page.waitForTimeout(500);
  for (let i = 0; i < 6; i++) { await page.mouse.wheel(0, -90); await page.waitForTimeout(140); }
}

// Recorder: CDP screencast to jpgs, ffmpeg concat with real frame durations
async function recordRaw(ctx, page, name) {
  const dir = join(TMP, name);
  await mkdir(dir, { recursive: true });
  const cdp = await ctx.newCDPSession(page);
  const frames = [];
  const writes = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = `f-${String(frames.length).padStart(4, '0')}.jpg`;
    frames.push({ file, t: metadata.timestamp });
    writes.push(writeFile(join(dir, file), Buffer.from(data, 'base64')));
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W, maxHeight: H });
  const t0 = Date.now() / 1000;
  await Promise.all([scriptedMotion(page).catch(() => {}), page.waitForTimeout(RAW_MS)]);
  const tEnd = Date.now() / 1000;
  await cdp.send('Page.stopScreencast');
  await new Promise((r) => setTimeout(r, 200));
  await Promise.all(writes);
  if (frames.length < 2) return false;
  // static page sends few frames: last frame held until stop
  const end = frames[0].t + (tEnd - t0);
  const list = frames.map((f, i) => `file '${f.file}'\nduration ${Math.max(0.001, (frames[i + 1]?.t ?? end) - f.t).toFixed(4)}`).join('\n');
  await writeFile(join(dir, 'list.txt'), `${list}\nfile '${frames.at(-1).file}'\n`);
  ff(['-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:exact=1,scale=out_range=tv,format=yuv420p,fps=${FPS}`, '-t', String(RAW_MS / 1000), ...ENC, join(TMP, `${name}-raw.mp4`)]);
  await rm(dir, { recursive: true, force: true });
  return true;
}

// Overlays: aero glass look, shared css
const AERO_CSS = `
  *{box-sizing:border-box;margin:0}
  body{background:transparent;font-family:'Avenir Next','Segoe UI','Helvetica Neue',sans-serif;color:#fff}
  .sky{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#e9fbff 0%,#7fd6ff 35%,#1f8fe0 70%,#0a4f9e 100%)}
  .hill{position:absolute;left:-20%;right:-20%;bottom:-38%;height:62%;border-radius:50% 50% 0 0;background:radial-gradient(80% 60% at 50% 10%,#d9ff8a 0%,#7ed321 35%,#2f9a1c 75%,#196b10 100%);box-shadow:inset 0 30px 60px rgba(255,255,255,.55)}
  .orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.95) 0 8%,rgba(255,255,255,.35) 22%,rgba(140,220,255,.18) 55%,rgba(255,255,255,.45) 100%);box-shadow:inset -10px -16px 40px rgba(0,90,180,.25),0 10px 40px rgba(0,60,140,.15)}
  .glass{position:absolute;left:90px;right:90px;top:620px;padding:70px 60px;border-radius:56px;text-align:center;background:linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.28) 48%,rgba(255,255,255,.16) 52%,rgba(255,255,255,.34) 100%);border:2px solid rgba(255,255,255,.85);box-shadow:0 30px 80px rgba(0,50,120,.35),inset 0 2px 0 #fff}
  .kicker{font-weight:700;font-size:34px;letter-spacing:10px;text-transform:uppercase;color:#0b5fae;text-shadow:0 1px 0 rgba(255,255,255,.9)}
  .big{margin-top:24px;font-weight:800;font-size:108px;line-height:1.02;color:#fff;text-shadow:0 4px 0 rgba(0,70,150,.35),0 10px 30px rgba(0,60,140,.45)}
  .sub{margin-top:30px;font-weight:600;font-size:38px;color:#08467f}
`;
const ORBS = `<div class="orb" style="left:70px;top:260px;width:180px;height:180px"></div><div class="orb" style="right:90px;top:380px;width:120px;height:120px"></div>
  <div class="orb" style="right:150px;top:1300px;width:220px;height:220px"></div><div class="orb" style="left:130px;top:1420px;width:90px;height:90px"></div><div class="hill"></div>`;

async function renderCard(page, file, { kicker, big, sub }) {
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(`<style>${AERO_CSS}</style><div class="sky">${ORBS}<div class="glass"><div class="kicker">${esc(kicker)}</div><div class="big">${esc(big)}</div><div class="sub">${esc(sub)}</div></div></div>`);
  await page.screenshot({ path: file });
}

// Overlay bar: glossy pill, demo title + style tag; sits above IG caption safe zone
const BAR_H = 230, BAR_Y = 1360;
async function renderBar(page, file, title, style) {
  await page.setViewportSize({ width: W, height: BAR_H });
  await page.setContent(`<style>${AERO_CSS}
    .bar{margin:20px 60px;height:190px;border-radius:95px;display:flex;flex-direction:column;justify-content:center;padding:0 64px;
      background:linear-gradient(180deg,rgba(130,215,255,.95) 0%,rgba(40,150,235,.92) 50%,rgba(10,105,205,.94) 52%,rgba(40,160,240,.95) 100%);
      border:2px solid rgba(255,255,255,.9);box-shadow:0 14px 40px rgba(0,40,100,.45),inset 0 3px 0 rgba(255,255,255,.8)}
    .t{font-weight:800;font-size:62px;line-height:1.05;text-shadow:0 2px 6px rgba(0,40,110,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .s{margin-top:10px;font-weight:700;font-size:26px;letter-spacing:5px;text-transform:uppercase;color:#e8fbff}</style>
    <div class="bar"><div class="t" style="font-size:${title.length > 18 ? 50 : 62}px">${esc(title)}</div><div class="s">Frutiger Aero · ${esc(style)}</div></div>`);
  await page.screenshot({ path: file, omitBackground: true });
}

// Builder: one normalized segment (card still or raw clip slice + bar), same encode so concat/xfade line up
function cardSegment(png, secs, out) {
  ff(['-loop', '1', '-t', String(secs), '-i', png, '-vf', `scale=${W}:${H},fps=${FPS},format=yuv420p`, ...ENC, out]);
}
function clipSegment(raw, bar, start, secs, out, fade = 0) {
  const f = fade ? `,fade=t=in:st=0:d=${fade},fade=t=out:st=${(secs - fade).toFixed(2)}:d=${fade}` : '';
  ff(['-ss', String(start), '-t', String(secs), '-i', raw, '-i', bar, '-filter_complex', `[0:v][1:v]overlay=0:${BAR_Y},fps=${FPS},format=yuv420p${f}`, '-t', String(secs), ...ENC, out]);
}
function xfadeChain(parts, out, fade) {
  const inputs = parts.flatMap((p) => ['-i', p.file]);
  let chain = `[0:v]settb=AVTB[a0];`, last = '[a0]', offset = 0;
  for (let i = 1; i < parts.length; i++) {
    offset += parts[i - 1].secs - fade;
    chain += `[${i}:v]settb=AVTB[b${i}];${last}[b${i}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}[a${i}];`;
    last = `[a${i}]`;
  }
  ff([...inputs, '-filter_complex', chain.slice(0, -1), '-map', last, ...ENC, out]);
}
function concatHard(files, out) {
  const inputs = files.flatMap((f) => ['-i', f]);
  const graph = `${files.map((_, i) => `[${i}:v]`).join('')}concat=n=${files.length}:v=1:a=0[v]`;
  ff([...inputs, '-filter_complex', graph, '-map', '[v]', ...ENC, out]);
}

// ---- run ----
const styleSubs = CATEGORIES.find((c) => c.id === 'aero').subs;
const all = (await listDemos(DEMOS)).filter((d) => d.category === 'aero');
const styles = styleSubs.map((s) => ({ ...s, demos: all.filter((d) => d.style === s.id) })).filter((s) => s.demos.length)
  .map((s, i) => ({ ...s, file: `${String(i + 1).padStart(2, '0')}-${slug(s.label)}` }));
await mkdir(TMP, { recursive: true });
const report = [];

const server = await ensureServer();
const browser = await chromium.launch({ channel: 'chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] });

if (!flags.has('--build-only')) {
  for (const d of all.filter((x) => !only.length || only.includes(x.name))) {
    const errors = [];
    const ctx = await browser.newContext({ viewport: { width: W / 2, height: H / 2 }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text().slice(0, 160)); });
    page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
    await page.goto(`${BASE}/${d.url}?capture=1`, { waitUntil: 'load' }).catch((e) => errors.push(String(e)));
    await page.waitForTimeout(1500);
    const ok = await recordRaw(ctx, page, d.name);
    await ctx.close();
    report.push({ name: d.name, ok, errors });
    console.log(`${ok && !errors.length ? 'ok  ' : 'WARN'} ${d.name}${errors.length ? `  ${errors[0]}` : ''}${ok ? '' : '  no frames'}`);
  }
}

// Overlays + cards
const ov = await browser.newPage();
for (const d of all) {
  const s = styles.find((x) => x.id === d.style);
  await renderBar(ov, join(TMP, `${d.name}-bar.png`), d.title, s.label);
}
await renderCard(ov, join(TMP, 'card-intro.png'), { kicker: 'Nostalgia Series', big: 'Frutiger Aero', sub: `${styles.length} styles · ${all.length} live demos` });
await renderCard(ov, join(TMP, 'card-outro.png'), { kicker: 'Which era was yours?', big: 'Render Studio', sub: 'All demos run live in the browser' });
for (const s of styles) await renderCard(ov, join(TMP, `card-${s.id}.png`), { kicker: 'Frutiger Aero', big: s.label, sub: `${s.demos.length} live demo${s.demos.length > 1 ? 's' : ''}` });
await browser.close();
if (server) server.kill();

// Build: per-demo reels
const have = async (d) => exists(join(TMP, `${d.name}-raw.mp4`));
for (const s of styles) {
  await mkdir(join(OUT, 'demos', s.file), { recursive: true });
  for (const d of s.demos) {
    if (!(await have(d))) continue;
    clipSegment(join(TMP, `${d.name}-raw.mp4`), join(TMP, `${d.name}-bar.png`), 0, 8, join(OUT, 'demos', s.file, `${d.name}.mp4`), 0.3);
  }
}
console.log('built per-demo reels');

// Build: per-style reels, card + 4.5 s per demo, crossfaded
await mkdir(join(OUT, 'styles'), { recursive: true });
for (const s of styles) {
  const parts = [{ file: join(TMP, `seg-card-${s.id}.mp4`), secs: 1.5 }];
  cardSegment(join(TMP, `card-${s.id}.png`), 1.5, parts[0].file);
  for (const d of s.demos) {
    if (!(await have(d))) continue;
    const file = join(TMP, `seg-style-${d.name}.mp4`);
    clipSegment(join(TMP, `${d.name}-raw.mp4`), join(TMP, `${d.name}-bar.png`), 1, 4.5, file);
    parts.push({ file, secs: 4.5 });
  }
  xfadeChain(parts, join(OUT, 'styles', `${s.file}.mp4`), 0.4);
}
console.log('built per-style reels');

// Build: master reel, intro + (style card 0.8 s + 1.65 s per demo) + outro, hard cuts
const seq = [join(TMP, 'seg-intro.mp4')];
cardSegment(join(TMP, 'card-intro.png'), 1.5, seq[0]);
for (const s of styles) {
  const c = join(TMP, `seg-mcard-${s.id}.mp4`);
  cardSegment(join(TMP, `card-${s.id}.png`), 0.8, c);
  seq.push(c);
  for (const d of s.demos) {
    if (!(await have(d))) continue;
    const file = join(TMP, `seg-master-${d.name}.mp4`);
    clipSegment(join(TMP, `${d.name}-raw.mp4`), join(TMP, `${d.name}-bar.png`), 2, 1.65, file);
    seq.push(file);
  }
}
seq.push(join(TMP, 'seg-outro.mp4'));
cardSegment(join(TMP, 'card-outro.png'), 1.5, seq.at(-1));
await mkdir(join(OUT, 'master'), { recursive: true });
concatHard(seq, join(OUT, 'master', 'frutiger-aero-all-styles.mp4'));
console.log('built master reel');

// Captions: one ready-to-paste caption per reel
const TAGS = '#frutigeraero #y2kaesthetic #nostalgia #webdesign #uidesign #frontend #creativecoding #aesthetic #2000s #skeuomorphism';
let md = `# Instagram captions\n\n## master/frutiger-aero-all-styles.mp4\n\nEvery flavor of Frutiger Aero in one reel: ${styles.map((s) => s.label).join(', ')}. ${all.length} live demos, all running in the browser. Which one takes you back?\n\n${TAGS}\n`;
for (const s of styles) {
  md += `\n## styles/${s.file}.mp4\n\n${s.label}: ${s.demos.map((d) => d.title).join(', ')}. Glossy, bubbly and fully live in the browser.\n\n${TAGS} #${slug(s.label).replace(/-/g, '')}\n`;
  for (const d of s.demos) md += `\n### demos/${s.file}/${d.name}.mp4\n\n${d.title}, a ${s.label} throwback built as a live web demo.${d.desc ? ` ${d.desc}` : ''}\n\n${TAGS}\n`;
}
await writeFile(join(OUT, 'captions.md'), md);

// keep *-raw.mp4 (gitignored) so --build-only can rebuild; drop segments + overlays
for (const f of await readdir(TMP)) if (!f.endsWith('-raw.mp4')) await rm(join(TMP, f), { recursive: true, force: true });
const bad = report.filter((r) => !r.ok || r.errors.length);
console.log(`done: ${OUT}${bad.length ? `\nwarnings: ${bad.map((r) => r.name).join(', ')}` : ''}`);
