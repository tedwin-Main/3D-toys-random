// Renders silent aero motion reels and their cover stills with Remotion from a jobs file written by demo-capture.

import { readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { join } from 'node:path';
import { bundle } from '@remotion/bundler';
import { openBrowser, renderMedia, renderStill, selectComposition } from '@remotion/renderer';

const HERE = import.meta.dirname;
const CRF = 18, COVER_QUALITY = 92;
const concurrency = Math.max(1, Math.floor(availableParallelism() / 2));

const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const serveUrl = await bundle({ entryPoint: join(HERE, 'src', 'index.jsx'), publicDir: join(HERE, '..', 'demo-gallery', 'demos') });
const browser = await openBrowser('chrome');
try {
  for (const job of jobs) await renderJob(job);
} finally {
  await browser.close({ silent: true });
}

async function renderJob({ composition: id, props, video, cover }) {
  await renderMedia({ ...await selectWithProps(id, props), codec: 'h264', crf: CRF, muted: true, outputLocation: video, concurrency });
  if (cover) {
    const still = await selectWithProps(id, { ...props, cover: true });
    await renderStill({ ...still, frame: cover.frame, output: cover.file, imageFormat: 'jpeg', jpegQuality: COVER_QUALITY });
  }
  console.log(`rendered ${props.name}`);
}

// Remotion renders the props resolved at selection time, so each prop set needs its own selection
async function selectWithProps(id, inputProps) {
  const shared = { serveUrl, inputProps, puppeteerInstance: browser };
  return { ...shared, composition: await selectComposition({ ...shared, id }) };
}
