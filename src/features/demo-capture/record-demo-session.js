// Records one demo page as a raw take: 24 s CDP screencast video plus its tapped Web Audio, synced.

import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { W, H, FPS, VIDEO_ENC, ffmpeg } from './reel-format.js';
import { tapPageAudio, unlockPageAudio, collectPageAudio, mixPageAudio } from './record-page-audio.js';

export const RAW_SECS = 24;
const WARMUP_MS = 1500;

export const rawVideoFile = (dir, name) => join(dir, `${name}-raw.mp4`);
export const rawAudioFile = (dir, name) => join(dir, `${name}-raw.m4a`);

export async function recordDemoTake(browser, url, name, workDir) {
  const ctx = await browser.newContext({ viewport: { width: W / 2, height: H / 2 }, deviceScaleFactor: 2 });
  await tapPageAudio(ctx);
  const page = await ctx.newPage();
  const errors = watchPageErrors(page);
  await page.goto(url, { waitUntil: 'load' }).catch((e) => errors.push(String(e)));
  await page.waitForTimeout(WARMUP_MS);
  await unlockPageAudio(page);
  const frameDir = join(workDir, name);
  await mkdir(frameDir, { recursive: true });
  const frames = await screencast(ctx, page, frameDir);
  const takes = await collectPageAudio(page);
  await ctx.close();
  const ok = frames.list.length >= 2;
  if (ok) await encodeFrames(frames, frameDir, rawVideoFile(workDir, name));
  await rm(rawAudioFile(workDir, name), { force: true });
  const hasAudio = ok && await mixPageAudio(takes, frames.list[0].t * 1000, RAW_SECS, frameDir, rawAudioFile(workDir, name));
  await rm(frameDir, { recursive: true, force: true });
  return { ok, hasAudio, errors };
}

function watchPageErrors(page) {
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error' && !m.text().startsWith('Failed to load resource')) errors.push(m.text().slice(0, 160)); });
  page.on('pageerror', (e) => errors.push(String(e).slice(0, 160)));
  return errors;
}

async function screencast(ctx, page, dir) {
  const cdp = await ctx.newCDPSession(page);
  const list = [], writes = [];
  cdp.on('Page.screencastFrame', ({ data, metadata, sessionId }) => {
    const file = `f-${String(list.length).padStart(4, '0')}.jpg`;
    list.push({ file, t: metadata.timestamp });
    writes.push(writeFile(join(dir, file), Buffer.from(data, 'base64')));
    cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: W, maxHeight: H });
  const t0 = Date.now() / 1000;
  await page.waitForTimeout(RAW_SECS * 1000);
  const elapsed = Date.now() / 1000 - t0;
  await cdp.send('Page.stopScreencast');
  await new Promise((r) => setTimeout(r, 200));
  await Promise.all(writes);
  return { list, elapsed };
}

// Static pages send few frames: each frame held until the next, last one until stop
async function encodeFrames({ list, elapsed }, dir, out) {
  const end = list[0].t + elapsed;
  const concat = list.map((f, i) => `file '${f.file}'\nduration ${Math.max(0.001, (list[i + 1]?.t ?? end) - f.t).toFixed(4)}`).join('\n');
  await writeFile(join(dir, 'list.txt'), `${concat}\nfile '${list.at(-1).file}'\n`);
  ffmpeg(['-f', 'concat', '-safe', '0', '-i', join(dir, 'list.txt'), '-vf', `scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}:exact=1,scale=out_range=tv,format=yuv420p,fps=${FPS}`,
    '-t', String(RAW_SECS), ...VIDEO_ENC, '-an', out]);
}
