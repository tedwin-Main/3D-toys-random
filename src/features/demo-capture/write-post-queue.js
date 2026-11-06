// Writes post-queue.json: one reel per day in REEL_SCRIPTS order with caption; keeps URLs from a prior upload.

import { readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { REEL_SCRIPTS, buildCaption } from './reel-scripts.js';

async function readPreviousQueue(file) {
  try { return JSON.parse(await readFile(file, 'utf8')); } catch { return { entries: [] }; }
}

export async function writePostQueue(demos, outDir) {
  const file = join(outDir, 'post-queue.json');
  const previous = await readPreviousQueue(file);
  const entries = REEL_SCRIPTS.map((script, i) => {
    const d = demos.find((x) => x.name === script.name);
    const { videoUrl, coverUrl } = previous.entries.find((e) => e.name === d.name) ?? {};
    return { day: i + 1, name: d.name, title: d.title, style: d.style, video: `reels/${d.name}.mp4`, cover: `covers/${d.name}.jpg`, caption: buildCaption(script, d.style, i), videoUrl, coverUrl };
  });
  const { startDate, timezone } = previous;
  await writeFile(file, `${JSON.stringify({ entries, startDate, timezone }, null, 2)}\n`);
  await rm(join(outDir, 'captions.md'), { force: true });
}
