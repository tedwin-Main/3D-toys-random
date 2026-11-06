// Builds reel MP4s and covers from raw takes: hook + title overlays, loop-back ending, demo audio, optional ducked BGM.

import { existsSync } from 'node:fs';
import { FPS, SAMPLE_RATE, VIDEO_ENC, AUDIO_ENC, MP4_FLAGS, ffmpeg } from './reel-format.js';
import { BAR_Y } from './reel-overlays.js';

const HOOK_SECS = 1.3, LOOP_FADE = 0.6, BGM_LEVEL = 0.4;
const STEREO = `aresample=${SAMPLE_RATE},aformat=channel_layouts=stereo`;

const audioInput = (rawAudio, start, secs) => (existsSync(rawAudio)
  ? ['-ss', String(start), '-t', String(secs), '-i', rawAudio]
  : ['-f', 'lavfi', '-t', String(secs), '-i', `anullsrc=r=${SAMPLE_RATE}:cl=stereo`]);
const stillInput = (png, secs) => ['-loop', '1', '-t', String(secs), '-i', png];

// Single demo reel: demo sound only, or demo sound + BGM ducked under it and loudness-normalized
export function buildDemoReel({ rawVideo, rawAudio, start, secs, hookPng, barPng, bgmWav, out }) {
  const inputs = ['-ss', String(start), '-t', String(secs), '-i', rawVideo, ...stillInput(hookPng, secs), ...stillInput(barPng, secs), ...audioInput(rawAudio, start, secs), ...(bgmWav ? ['-i', bgmWav] : [])];
  const graph = [...loopedVideoWithOverlays(secs), ...(bgmWav ? demoWithBgmAudio(secs) : demoOnlyAudio(secs))].join(';');
  ffmpeg([...inputs, '-filter_complex', graph, '-map', '[v]', '-map', '[a]', '-t', String(secs), ...VIDEO_ENC, ...AUDIO_ENC, ...MP4_FLAGS, out]);
}

function loopedVideoWithOverlays(secs) {
  return [
    `[0:v]fps=${FPS},format=yuv420p,settb=AVTB,split[main][head]`,
    `[head]trim=end_frame=1,loop=loop=-1:size=1,fps=${FPS},trim=duration=${LOOP_FADE},setpts=PTS-STARTPTS,settb=AVTB[still]`,
    `[main][still]xfade=transition=fade:duration=${LOOP_FADE}:offset=${(secs - LOOP_FADE).toFixed(2)}[looped]`,
    `[1:v]format=rgba,fade=t=out:st=${HOOK_SECS - 0.3}:d=0.3:alpha=1[hook]`,
    `[2:v]format=rgba,fade=t=in:st=${HOOK_SECS - 0.2}:d=0.3:alpha=1[bar]`,
    `[looped][hook]overlay=0:0:shortest=1[withHook]`,
    `[withHook][bar]overlay=0:${BAR_Y}:shortest=1,format=yuv420p[v]`,
  ];
}

function demoOnlyAudio(secs) {
  return [`[3:a]${STEREO},apad,atrim=0:${secs},afade=t=in:d=0.1,afade=t=out:st=${secs - 0.5}:d=0.5[a]`];
}

function demoWithBgmAudio(secs) {
  return [
    `[3:a]${STEREO},apad,atrim=0:${secs},asplit[demo][key]`,
    `[4:a]${STEREO},apad,atrim=0:${secs},volume=${BGM_LEVEL}[bgm]`,
    `[bgm][key]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=350[ducked]`,
    `[demo][ducked]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,${STEREO},afade=t=in:d=0.1,afade=t=out:st=${secs - 0.5}:d=0.5[a]`,
  ];
}

// Cover: one raw frame with hook and title baked in
export function buildCover({ rawVideo, at, hookPng, barPng, out }) {
  ffmpeg(['-ss', String(at), '-i', rawVideo, '-i', hookPng, '-i', barPng, '-filter_complex', `[0:v][1:v]overlay=0:0[h];[h][2:v]overlay=0:${BAR_Y}`, '-frames:v', '1', '-q:v', '2', out]);
}

// Compilation segments: same encode + audio layout so concat/xfade line up
export function cardSegment(png, secs, out) {
  ffmpeg([...stillInput(png, secs), '-f', 'lavfi', '-t', String(secs), '-i', `anullsrc=r=${SAMPLE_RATE}:cl=stereo`,
    '-vf', `fps=${FPS},format=yuv420p`, '-t', String(secs), ...VIDEO_ENC, ...AUDIO_ENC, out]);
}

export function clipSegment({ rawVideo, rawAudio, barPng, start, secs, out, fade = 0 }) {
  const vFade = fade ? `,fade=t=in:st=0:d=${fade},fade=t=out:st=${(secs - fade).toFixed(2)}:d=${fade}` : '';
  const graph = `[0:v][1:v]overlay=0:${BAR_Y},fps=${FPS},format=yuv420p${vFade}[v];[2:a]${STEREO},apad,atrim=0:${secs},afade=t=in:d=0.08,afade=t=out:st=${secs - 0.15}:d=0.15[a]`;
  ffmpeg(['-ss', String(start), '-t', String(secs), '-i', rawVideo, '-i', barPng, ...audioInput(rawAudio, start, secs),
    '-filter_complex', graph, '-map', '[v]', '-map', '[a]', '-t', String(secs), ...VIDEO_ENC, ...AUDIO_ENC, out]);
}

export function xfadeChain(parts, out, fade) {
  const inputs = parts.flatMap((p) => ['-i', p.file]);
  const chain = [`[0:v]settb=AVTB[v0]`, `[0:a]anull[a0]`];
  let offset = 0;
  for (let i = 1; i < parts.length; i++) {
    offset += parts[i - 1].secs - fade;
    chain.push(`[${i}:v]settb=AVTB[vin${i}]`, `[v${i - 1}][vin${i}]xfade=transition=fade:duration=${fade}:offset=${offset.toFixed(2)}[v${i}]`);
    chain.push(`[a${i - 1}][${i}:a]acrossfade=d=${fade}[a${i}]`);
  }
  const last = parts.length - 1;
  ffmpeg([...inputs, '-filter_complex', chain.join(';'), '-map', `[v${last}]`, '-map', `[a${last}]`, ...VIDEO_ENC, ...AUDIO_ENC, ...MP4_FLAGS, out]);
}

export function concatHard(files, out) {
  const inputs = files.flatMap((f) => ['-i', f]);
  const graph = `${files.map((_, i) => `[${i}:v][${i}:a]`).join('')}concat=n=${files.length}:v=1:a=1[v][a]`;
  ffmpeg([...inputs, '-filter_complex', graph, '-map', '[v]', '-map', '[a]', ...VIDEO_ENC, ...AUDIO_ENC, ...MP4_FLAGS, out]);
}
