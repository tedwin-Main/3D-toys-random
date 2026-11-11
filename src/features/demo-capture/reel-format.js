// Defines Instagram reel size, encode flags and ffmpeg runner shared by capture modules.

import { execFileSync } from 'node:child_process';

export const W = 1080, H = 1920, FPS = 30;
export const REEL_SECS = 12;
export const SAMPLE_RATE = 48000;
export const VIDEO_ENC = ['-c:v', 'libx264', '-profile:v', 'high', '-crf', '20', '-pix_fmt', 'yuv420p', '-r', String(FPS)];
export const AUDIO_ENC = ['-c:a', 'aac', '-b:a', '192k', '-ar', String(SAMPLE_RATE), '-ac', '2'];
export const MP4_FLAGS = ['-movflags', '+faststart'];

export const ffmpeg = (args) => execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { maxBuffer: 1 << 28 });

// Decodes any audio file to mono 16-bit PCM samples at the given rate
export function decodePcm(file, rate) {
  const pcm = ffmpeg(['-i', file, '-ac', '1', '-ar', String(rate), '-f', 's16le', '-']);
  return new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
}
