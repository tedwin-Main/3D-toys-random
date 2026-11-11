// Plans each aero motion reel: Remotion props (text, poster, style kit, music beats) and its audio mix.

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { DEMOS_DIR } from './aero-reel-catalog.js';
import { musicFileFor } from './aero-music.js';
import { detectBeats } from './music-beats.js';
import { pickHighlightStart } from './pick-highlight.js';
import { rawVideoFile, rawAudioFile, RAW_SECS } from './record-demo-session.js';
import { REEL_SCRIPTS } from './reel-scripts.js';
import { FPS, REEL_SECS } from './reel-format.js';

const COVER_SECS = 2.5;

export function planDemoReel(demo, style, { captureDir, renderDir, outDir }) {
  const script = REEL_SCRIPTS.find((s) => s.name === demo.name);
  const poster = `${demo.name}.png`;
  if (!existsSync(join(DEMOS_DIR, poster))) throw new Error(`missing poster: ${poster}`);
  const bgm = musicFileFor(demo.name);
  const video = join(renderDir, `${demo.name}.mp4`);
  return {
    render: {
      composition: 'AeroDemoReel',
      props: {
        name: demo.name, title: demo.title, styleId: style.id, styleLabel: style.label, hook: script.hook, line: script.line,
        poster, secs: REEL_SECS, fps: FPS, beats: detectBeats(bgm, REEL_SECS),
      },
      video,
      cover: { file: join(outDir, 'covers', `${demo.name}.jpg`), frame: Math.round(COVER_SECS * FPS) },
    },
    mix: { video, bgm, secs: REEL_SECS, demoAudio: demoSoundWindow(demo.name, captureDir), out: join(outDir, 'reels', `${demo.name}.mp4`) },
  };
}

// Same window the screencast reels used: the liveliest stretch of the raw take
function demoSoundWindow(name, captureDir) {
  const rawVideo = rawVideoFile(captureDir, name), rawAudio = rawAudioFile(captureDir, name);
  const start = existsSync(rawVideo) ? pickHighlightStart({ rawVideo, rawAudio, totalSecs: RAW_SECS, clipSecs: REEL_SECS }) : 0;
  return { rawAudio, start };
}
