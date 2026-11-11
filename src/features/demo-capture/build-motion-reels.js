// Builds aero Instagram reels from Remotion motion graphics, the curated aero music and the demos' recorded sound.

import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { loadAeroStyles } from './aero-reel-catalog.js';
import { missingMusic } from './aero-music.js';
import { addMusicToVideo } from './build-reel-video.js';
import { planDemoReel } from './motion-reel-plan.js';

const CAPTURE_DIR = join(import.meta.dirname, '.instagram-capture');
const RENDER_DIR = join(CAPTURE_DIR, 'motion');
const POSTS_DIR = join(import.meta.dirname, '..', 'instagram-posts');
const REMOTION_DIR = join(import.meta.dirname, '..', 'remotion-promos');

// --promote writes over the posting folders; default is a side-by-side pilot in instagram-posts/motion
const args = process.argv.slice(2);
const outDir = args.includes('--promote') ? POSTS_DIR : join(POSTS_DIR, 'motion');
const only = new Set(args.filter((a) => !a.startsWith('--')));

const { all, styles } = await loadAeroStyles();
const unknown = [...only].filter((name) => !all.some((d) => d.name === name));
if (unknown.length) throw new Error(`not an aero demo: ${unknown.join(', ')}`);
const picked = all.filter((d) => !only.size || only.has(d.name));
const missing = missingMusic(picked.map((d) => d.name));
if (missing.length) throw new Error(`missing aero music for ${missing.length} reels (run npm run music): ${missing.join(', ')}`);

for (const dir of [RENDER_DIR, join(outDir, 'reels'), join(outDir, 'covers')]) await mkdir(dir, { recursive: true });
const jobs = picked.map((d) => planDemoReel(d, styles.find((s) => s.id === d.style), { captureDir: CAPTURE_DIR, renderDir: RENDER_DIR, outDir }));
const jobsFile = join(RENDER_DIR, 'jobs.json');
await writeFile(jobsFile, `${JSON.stringify(jobs.map((j) => j.render), null, 2)}\n`);
execFileSync(process.execPath, [join(REMOTION_DIR, 'render-aero-reels.js'), jobsFile], { cwd: REMOTION_DIR, stdio: 'inherit' });
for (const { render, mix } of jobs) {
  addMusicToVideo(mix);
  console.log(`mixed ${render.props.name}${existsSync(mix.demoAudio.rawAudio) ? ` (demo sound from ${mix.demoAudio.start} s)` : ''}`);
}
const silent = jobs.filter(({ mix }) => !existsSync(mix.demoAudio.rawAudio)).map(({ render }) => render.props.name);
console.log(`done: ${jobs.length} motion reels -> ${outDir}${silent.length ? `\nno demo sound (music only): ${silent.join(', ')}` : ''}`);
