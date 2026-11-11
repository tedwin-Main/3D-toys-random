// Downloads curated Frutiger Aero slices for every reel, style compilation and master reel.

import { execFile, execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { REEL_MUSIC, STYLE_MUSIC, MASTER_MUSIC } from './aero-music-plan.js';

const run = promisify(execFile);
const DIR = join(import.meta.dirname, '.instagram-capture', 'music');
const MANIFEST = join(import.meta.dirname, 'aero-music.json');
const CONCURRENCY = 3;
const force = process.argv.includes('--force');

const clock = (secs) => [Math.floor(secs / 3600), Math.floor((secs % 3600) / 60), secs % 60].map((n) => String(n).padStart(2, '0')).join(':');

const tasks = [
  ...REEL_MUSIC.map((track) => ({ key: track.name, file: `${track.name}.m4a`, secs: 20, ...track })),
  ...Object.entries(STYLE_MUSIC).map(([style, track]) => ({ key: `style:${style}`, style, file: `style-${style}.m4a`, ...track })),
  { key: 'master', file: 'master.m4a', ...MASTER_MUSIC },
];

async function readManifest() {
  try { return JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { return { reels: {}, styles: {}, master: null }; }
}

function durationOf(file) {
  const out = execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  return Number(out.trim());
}

async function fetchSlice(task) {
  const path = join(DIR, task.file);
  await rm(path, { force: true });
  const args = [
    '-x', '--audio-format', 'm4a', '--audio-quality', '0',
    '--download-sections', `*${clock(task.start)}-${clock(task.start + task.secs)}`,
    '--force-keyframes-at-cuts', '--no-playlist', '--no-warnings', '--newline', '--no-part',
    '-o', join(DIR, `${task.file.replace(/\.m4a$/, '')}.%(ext)s`), `https://www.youtube.com/watch?v=${task.id}`,
  ];
  if (force) args.push('--force-overwrites');
  await run('yt-dlp', args, { maxBuffer: 1 << 26, timeout: 5 * 60e3 });
  if (!existsSync(path)) throw new Error(`no audio written for ${task.key}`);
  const secs = durationOf(path);
  if (secs < 8) throw new Error(`slice too short for ${task.key}: ${secs.toFixed(1)} s`);
  return secs;
}

async function downloadTask(task, previous, done) {
  const prior = task.style ? previous.styles?.[task.style] : task.key === 'master' ? previous.master : previous.reels?.[task.key];
  if (!force && prior?.id === task.id && prior?.start === task.start && prior?.file === task.file && existsSync(join(DIR, task.file))) {
    done.set(task.key, prior);
    console.log(`keep  ${task.key}  ${task.title}`);
    return true;
  }
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const secs = await fetchSlice(task);
      const entry = { file: task.file, id: task.id, title: task.title, artist: task.artist, start: task.start, secs, url: `https://www.youtube.com/watch?v=${task.id}`, why: task.why };
      done.set(task.key, entry);
      console.log(`get   ${task.key}  ${task.artist} — ${task.title}`);
      return true;
    } catch (error) {
      const detail = String(error.stderr || error.message).trim().split('\n').at(-1);
      console.log(`retry ${task.key}  ${task.title}: ${detail}`);
    }
  }
  return false;
}

await mkdir(DIR, { recursive: true });
const previous = await readManifest();
const done = new Map();
let cursor = 0;
const failed = [];
async function worker() {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    if (!await downloadTask(task, previous, done)) failed.push(task.key);
  }
}
await Promise.all(Array.from({ length: CONCURRENCY }, worker));

const reels = Object.fromEntries(REEL_MUSIC.filter((t) => done.has(t.name)).map((t) => [t.name, done.get(t.name)]));
const styles = Object.fromEntries(Object.keys(STYLE_MUSIC).filter((s) => done.has(`style:${s}`)).map((s) => [s, done.get(`style:${s}`)]));
const master = done.get('master') ?? null;
await writeFile(MANIFEST, `${JSON.stringify({ curated: true, updatedAt: new Date().toISOString(), reels, styles, master }, null, 2)}\n`);
console.log(`music: ${Object.keys(reels).length}/${REEL_MUSIC.length} reels, ${Object.keys(styles).length}/${Object.keys(STYLE_MUSIC).length} styles, master ${master ? 'ok' : 'missing'} -> ${DIR}`);
if (failed.length) throw new Error(`could not download music for: ${failed.join(', ')}`);
