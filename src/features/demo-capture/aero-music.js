// Reads the curated aero music manifest and resolves reel, style and master track slices.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { STYLE_MUSIC } from './aero-music-plan.js';

const MANIFEST = join(import.meta.dirname, 'aero-music.json');
const MUSIC_DIR = join(import.meta.dirname, '.instagram-capture', 'music');

const manifest = (() => {
  try {
    const parsed = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    return { reels: parsed.reels ?? {}, styles: parsed.styles ?? {}, master: parsed.master ?? null };
  } catch {
    return { reels: {}, styles: {}, master: null };
  }
})();

export const musicTrackFor = (name) => manifest.reels[name] ?? null;
export const styleMusicTrackFor = (styleId) => manifest.styles[styleId] ?? null;
export const masterMusicTrackFor = () => manifest.master;
export const musicFileFor = (name) => {
  const track = musicTrackFor(name);
  return track ? join(MUSIC_DIR, track.file) : null;
};
export const styleMusicFile = (styleId) => {
  const track = styleMusicTrackFor(styleId);
  return track ? join(MUSIC_DIR, track.file) : null;
};
export const masterMusicFile = () => {
  const track = masterMusicTrackFor();
  return track ? join(MUSIC_DIR, track.file) : null;
};
export const audioNameFor = (name) => {
  const track = musicTrackFor(name);
  return track ? `${track.artist} — ${track.title}` : 'Frutiger Aero mix';
};
export const missingMusic = (names) => names.filter((name) => {
  const file = musicFileFor(name);
  return !file || !existsSync(file);
});
export const missingCompilationMusic = () => {
  const missing = [];
  for (const style of Object.keys(STYLE_MUSIC)) {
    const track = manifest.styles[style];
    if (!track || !existsSync(join(MUSIC_DIR, track.file))) missing.push(`style:${style}`);
  }
  if (!manifest.master || !existsSync(join(MUSIC_DIR, manifest.master.file))) missing.push('master');
  return missing;
};
