// Picks the liveliest clip window in a raw demo take by scoring sound energy and on-screen motion.

import { existsSync } from 'node:fs';
import { ffmpeg } from './reel-format.js';

const BIN_SECS = 0.5;
const AUDIO_WEIGHT = 0.6, MOTION_WEIGHT = 0.4;

export function pickHighlightStart({ rawVideo, rawAudio, totalSecs, clipSecs, minStart = 1 }) {
  const bins = Math.floor(totalSecs / BIN_SECS);
  const motion = normalize(motionPerBin(rawVideo, bins));
  const audio = existsSync(rawAudio) ? normalize(loudnessPerBin(rawAudio, bins)) : null;
  const score = motion.map((m, i) => (audio ? AUDIO_WEIGHT * audio[i] + MOTION_WEIGHT * m : m));
  return bestWindowStart(score, clipSecs / BIN_SECS, minStart / BIN_SECS) * BIN_SECS;
}

function loudnessPerBin(file, bins) {
  const rate = 8000;
  const pcm = ffmpeg(['-i', file, '-ac', '1', '-ar', String(rate), '-f', 's16le', '-']);
  const samples = new Int16Array(pcm.buffer, pcm.byteOffset, pcm.length >> 1);
  const per = rate * BIN_SECS;
  return Array.from({ length: bins }, (_, b) => {
    let sum = 0;
    const end = Math.min(samples.length, (b + 1) * per);
    for (let i = b * per; i < end; i++) sum += samples[i] * samples[i];
    return Math.sqrt(sum / per);
  });
}

function motionPerBin(file, bins) {
  const fps = 4, fw = 36, fh = 64, size = fw * fh;
  const raw = ffmpeg(['-i', file, '-vf', `fps=${fps},scale=${fw}:${fh},format=gray`, '-f', 'rawvideo', '-']);
  const per = fps * BIN_SECS;
  const diffs = [];
  for (let f = size; f + size <= raw.length; f += size) {
    let d = 0;
    for (let i = 0; i < size; i++) d += Math.abs(raw[f + i] - raw[f - size + i]);
    diffs.push(d / size);
  }
  return Array.from({ length: bins }, (_, b) => diffs.slice(b * per, (b + 1) * per).reduce((a, v) => a + v, 0));
}

function normalize(values) {
  const max = Math.max(...values, 1e-9);
  return values.map((v) => v / max);
}

function bestWindowStart(score, windowBins, minBin) {
  let best = minBin, bestSum = -1;
  for (let s = minBin; s + windowBins <= score.length; s++) {
    const sum = score.slice(s, s + windowBins).reduce((a, v) => a + v, 0);
    if (sum > bestSum) { bestSum = sum; best = s; }
  }
  return best;
}
