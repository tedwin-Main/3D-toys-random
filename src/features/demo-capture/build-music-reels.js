// Rebuilds reel, style and master audio from the curated plan without re-encoding video.

import { existsSync, readdirSync, renameSync, statSync } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { listDemos } from '../studio-server/list-assets.js';
import { addMusicToVideo } from './build-reel-video.js';
import { musicFileFor, styleMusicFile, masterMusicFile, missingMusic, missingCompilationMusic } from './aero-music.js';
import { writePostQueue } from './write-post-queue.js';

const SRC = join(import.meta.dirname, '..', '..');
const DEMOS = join(SRC, 'features', 'demo-gallery', 'demos');
const OUT = join(SRC, 'features', 'instagram-posts');
const DEMO_REELS = join(OUT, 'demos');
const TMP = join(import.meta.dirname, '.instagram-capture');
const args = process.argv.slice(2);
const only = new Set(args.filter((a) => !a.startsWith('--')).flatMap((a) => a.split(',')));

const styleOf = (file) => {
  if (file.includes('core-aero')) return 'core';
  if (file.includes('eco-aero')) return 'eco';
  if (file.includes('dark-aero')) return 'dark';
  if (file.includes('aquatic-aero')) return 'aquatic';
  if (file.includes('humanity-aero')) return 'humanity';
  if (file.includes('technozen')) return 'technozen';
  if (file.includes('space-aero')) return 'space';
  if (file.includes('frutiger-metro')) return 'metro';
  if (file.includes('glass-city')) return 'glasscity';
  if (file.includes('console-menus')) return 'console';
  if (file.includes('y2k-futurism')) return 'y2k';
  if (file.includes('mcbling')) return 'mcbling';
  if (file.includes('vectorheart')) return 'vectorheart';
  if (file.includes('skeuomorphism')) return 'skeuo';
  if (file.includes('90s-desktop-web')) return 'retro';
  return null;
};

// Demo-only reels are the clean video source; pick the newest copy per name
function demoVideo(name) {
  let best = null;
  for (const dir of readdirSync(DEMO_REELS, { withFileTypes: true })) {
    if (!dir.isDirectory()) continue;
    const file = join(DEMO_REELS, dir.name, `${name}.mp4`);
    if (!existsSync(file)) continue;
    const mtime = statSync(file).mtimeMs;
    if (!best || mtime > best.mtime) best = { file, mtime };
  }
  return best?.file ?? null;
}

const reels = (await listDemos(DEMOS)).filter((d) => d.category === 'aero' && (!only.size || only.has(d.name)));
const missing = missingMusic(reels.map((d) => d.name));
if (missing.length) throw new Error(`missing aero music (run npm run music): ${missing.join(', ')}`);
await mkdir(TMP, { recursive: true });

for (const d of reels) {
  const video = demoVideo(d.name);
  if (!video) throw new Error(`missing demo-only video for ${d.name}`);
  addMusicToVideo({ video, bgm: musicFileFor(d.name), out: join(OUT, 'reels', `${d.name}.mp4`), secs: 12 });
  console.log(`music ${d.name}`);
}

if (!only.size) {
  const missingComp = missingCompilationMusic();
  if (missingComp.length) throw new Error(`missing compilation music (run npm run music): ${missingComp.join(', ')}`);
  for (const file of readdirSync(join(OUT, 'styles')).filter((f) => f.endsWith('.mp4')).sort()) {
    const style = styleOf(file);
    if (!style) continue;
    const source = join(OUT, 'styles', file);
    const temp = join(TMP, `style-${style}-music.mp4`);
    addMusicToVideo({ video: source, bgm: styleMusicFile(style), out: temp, loopMusic: true });
    renameSync(temp, source);
    console.log(`music style/${file}`);
  }
  const master = join(OUT, 'master', 'frutiger-aero-all-styles.mp4');
  const masterTemp = join(TMP, 'master-music.mp4');
  addMusicToVideo({ video: master, bgm: masterMusicFile(), out: masterTemp, loopMusic: true });
  renameSync(masterTemp, master);
  console.log('music master/frutiger-aero-all-styles.mp4');
  await writePostQueue((await listDemos(DEMOS)).filter((d) => d.category === 'aero'), OUT);
}

console.log(`done: ${reels.length} reels${only.size ? '' : ', styles + master, queue'}`);
