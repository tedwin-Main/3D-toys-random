// Taps every Web Audio context in a page and mixes the takes into one track synced to the video.

import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Page side: wrap AudioContext, route destination through a tap that also feeds a MediaRecorder
function installAudioTap() {
  const Native = window.AudioContext || window.webkitAudioContext;
  if (!Native || window.__audioTakes) return;
  const takes = [];
  window.__audioTakes = takes;
  const realDestination = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, 'destination').get;
  class TappedAudioContext extends Native {
    constructor(...args) {
      super(...args);
      const tap = this.createGain();
      const sink = this.createMediaStreamDestination();
      tap.connect(realDestination.call(this));
      tap.connect(sink);
      const recorder = new MediaRecorder(sink.stream, { mimeType: 'audio/webm;codecs=opus', audioBitsPerSecond: 192000 });
      const take = { recorder, chunks: [], startEpochMs: performance.timeOrigin + performance.now() };
      recorder.ondataavailable = (e) => { if (e.data.size) take.chunks.push(e.data); };
      recorder.start(250);
      takes.push(take);
      Object.defineProperty(this, 'destination', { get: () => tap });
    }
  }
  window.AudioContext = TappedAudioContext;
  window.webkitAudioContext = TappedAudioContext;

  // Remember gesture listeners whose code starts audio, so unlock can call only those
  const AUDIO_HINT = /AudioContext|audio\(|initAudio|unlock/;
  const unlockers = [];
  window.__audioUnlockers = unlockers;
  const nativeAdd = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function (type, listener, options) {
    const source = typeof listener === 'function' ? Function.prototype.toString.call(listener) : '';
    if ((type === 'pointerdown' || type === 'keydown') && AUDIO_HINT.test(source)) unlockers.push({ target: this, type, listener });
    return nativeAdd.call(this, type, listener, options);
  };
}

// Page side: call audio-starting listeners directly; other listeners (attract-stop flags) never see an event
function callAudioUnlockers() {
  const seen = new Set();
  for (const { target, type, listener } of window.__audioUnlockers || []) {
    if (seen.has(listener)) continue;
    seen.add(listener);
    const event = type === 'keydown' ? new KeyboardEvent('keydown', { key: 'Shift' }) : new PointerEvent('pointerdown', { clientX: innerWidth / 2, clientY: innerHeight / 2 });
    try { listener.call(target, event); } catch {}
  }
}

export async function unlockPageAudio(page) {
  await page.evaluate(callAudioUnlockers).catch(() => {});
}

// Page side: stop recorders, hand back base64 webm per take
async function drainAudioTakes() {
  const toBase64 = (blob) => new Promise((done) => {
    const reader = new FileReader();
    reader.onload = () => done(String(reader.result).split(',')[1]);
    reader.readAsDataURL(blob);
  });
  const stopped = (take) => new Promise((done) => {
    if (take.recorder.state === 'inactive') return done();
    take.recorder.onstop = done;
    take.recorder.stop();
  });
  const takes = window.__audioTakes || [];
  await Promise.all(takes.map(stopped));
  return Promise.all(takes.map(async (t) => ({ startEpochMs: t.startEpochMs, webm: await toBase64(new Blob(t.chunks, { type: 'audio/webm' })) })));
}

export async function tapPageAudio(ctx) {
  await ctx.addInitScript(installAudioTap);
}

export async function collectPageAudio(page) {
  return page.evaluate(drainAudioTakes).catch(() => []);
}

// Mix takes into one m4a; each take shifted by its start vs first video frame. False when page made no sound.
export async function mixPageAudio(takes, videoStartEpochMs, seconds, workDir, outFile) {
  const files = [];
  for (const [i, take] of takes.entries()) {
    if (!take.webm) continue;
    const file = join(workDir, `take-${i}.webm`);
    await writeFile(file, Buffer.from(take.webm, 'base64'));
    files.push({ file, offsetMs: take.startEpochMs - videoStartEpochMs });
  }
  if (!files.length) return false;
  const align = files.map(({ offsetMs }, i) => {
    const shift = offsetMs >= 0 ? `adelay=${Math.round(offsetMs)}:all=1` : `atrim=start=${(-offsetMs / 1000).toFixed(3)},asetpts=PTS-STARTPTS`;
    return `[${i}:a]aresample=48000,${shift}[a${i}]`;
  });
  const mix = `${files.map((_, i) => `[a${i}]`).join('')}amix=inputs=${files.length}:normalize=0,apad,atrim=0:${seconds}[mix]`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...files.flatMap((f) => ['-i', f.file]), '-filter_complex', [...align, mix].join(';'),
    '-map', '[mix]', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-ac', '2', outFile]);
  return true;
}
