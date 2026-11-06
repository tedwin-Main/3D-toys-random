// Composes original seeded background loops per aero style and renders them to WAV in Chromium.

import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SAMPLE_RATE } from './reel-format.js';

export const BGM_SECS = 12;

const SCALES = {
  major: [0, 2, 4, 5, 7, 9, 11],
  lydian: [0, 2, 4, 6, 7, 9, 11],
  mixolydian: [0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  minor: [0, 2, 3, 5, 7, 8, 10],
};

// Mood per style: tempo divides 12 s into whole bars (80 bpm 4 bars, 100 bpm 5, 120 bpm 6)
const STYLE_MOODS = {
  core: { bpm: 100, root: 62, scale: 'lydian', chords: [0, 3, 5, 4], lead: 'bell', drums: 'soft', seed: 11 },
  eco: { bpm: 100, root: 65, scale: 'major', chords: [0, 4, 5, 3], lead: 'marimba', drums: 'soft', seed: 23 },
  dark: { bpm: 80, root: 57, scale: 'dorian', chords: [0, 6, 3, 4], lead: 'bell', drums: 'none', seed: 37 },
  aquatic: { bpm: 100, root: 64, scale: 'lydian', chords: [0, 1, 5, 4], lead: 'marimba', drums: 'shaker', seed: 41 },
  humanity: { bpm: 120, root: 67, scale: 'major', chords: [0, 5, 3, 4], lead: 'marimba', drums: 'pop', seed: 53 },
  technozen: { bpm: 80, root: 62, scale: 'major', chords: [0, 3, 0, 4], lead: 'bell', drums: 'none', seed: 67 },
  space: { bpm: 80, root: 60, scale: 'lydian', chords: [0, 1, 0, 6], lead: 'bell', drums: 'none', seed: 71 },
  metro: { bpm: 120, root: 64, scale: 'major', chords: [5, 3, 0, 4], lead: 'pluck', drums: 'pop', seed: 83 },
  console: { bpm: 100, root: 65, scale: 'lydian', chords: [0, 3, 1, 4], lead: 'marimba', drums: 'soft', seed: 97 },
  y2k: { bpm: 120, root: 62, scale: 'mixolydian', chords: [0, 6, 3, 4], lead: 'pluck', drums: 'pop', seed: 101 },
  mcbling: { bpm: 120, root: 66, scale: 'major', chords: [0, 5, 1, 4], lead: 'pluck', drums: 'pop', seed: 113 },
  vectorheart: { bpm: 120, root: 63, scale: 'major', chords: [3, 4, 2, 5], lead: 'bell', drums: 'pop', seed: 127 },
  skeuo: { bpm: 100, root: 60, scale: 'major', chords: [0, 3, 4, 0], lead: 'marimba', drums: 'shaker', seed: 131 },
  retro: { bpm: 120, root: 57, scale: 'minor', chords: [0, 5, 2, 6], lead: 'pluck', drums: 'pop', seed: 149 },
};

// Rhythms in eighth-note steps per bar: 1 = note onset
const RHYTHMS = [
  [1, 0, 1, 0, 1, 1, 0, 0], [1, 0, 0, 1, 0, 0, 1, 0], [1, 1, 0, 1, 0, 1, 0, 0],
  [1, 0, 1, 1, 0, 0, 1, 1], [0, 1, 1, 0, 1, 0, 1, 0], [1, 0, 0, 0, 1, 0, 1, 1],
];

const seededRandom = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const scaleNote = (mood, degree, octave = 0) => {
  const steps = SCALES[mood.scale];
  const d = ((degree % 7) + 7) % 7;
  return mood.root + steps[d] + 12 * (octave + Math.floor(degree / 7));
};

// Composer: pad + bass + lead melody + percussion as note events
export function composeLoop(mood) {
  const rand = seededRandom(mood.seed);
  const beat = 60 / mood.bpm, bar = beat * 4, bars = Math.round(BGM_SECS / bar);
  const motif = RHYTHMS[Math.floor(rand() * RHYTHMS.length)];
  const events = [];
  let degree = 2;
  for (let b = 0; b < bars; b++) {
    const chord = mood.chords[b % mood.chords.length], t0 = b * bar;
    for (const tone of [0, 2, 4]) events.push({ inst: 'pad', t: t0, dur: bar, midi: scaleNote(mood, chord + tone, -1), vel: 0.5 });
    events.push({ inst: 'bass', t: t0, dur: beat * 1.5, midi: scaleNote(mood, chord, -2), vel: 0.8 });
    events.push({ inst: 'bass', t: t0 + beat * 2, dur: beat * 1.5, midi: scaleNote(mood, chord + (rand() < 0.5 ? 4 : 0), -2), vel: 0.7 });
    const rhythm = b % 2 ? RHYTHMS[Math.floor(rand() * RHYTHMS.length)] : motif;
    rhythm.forEach((on, step) => {
      if (!on) return;
      const strong = step % 4 === 0;
      degree = strong ? chord + [0, 2, 4][Math.floor(rand() * 3)] : degree + [-2, -1, 1, 2][Math.floor(rand() * 4)];
      degree = Math.max(chord - 2, Math.min(chord + 9, degree));
      events.push({ inst: mood.lead, t: t0 + step * beat / 2, dur: beat * 0.9, midi: scaleNote(mood, degree, 1), vel: strong ? 0.9 : 0.65 });
    });
    if (b === bars - 1) for (let s = 0; s < 8; s++) events.push({ inst: 'sparkle', t: t0 + s * beat / 2, dur: beat / 2, midi: scaleNote(mood, chord + s, 2), vel: 0.35 });
    events.push(...percussion(mood.drums, t0, beat));
  }
  return events;
}

function percussion(kit, t0, beat) {
  if (kit === 'none') return [];
  const hits = [];
  for (let s = 0; s < 8; s++) {
    const t = t0 + s * beat / 2;
    if (kit !== 'shaker' && s % 4 === 0) hits.push({ inst: 'kick', t, vel: kit === 'pop' ? 0.9 : 0.6 });
    if (kit === 'pop' && s % 4 === 2) hits.push({ inst: 'clap', t, vel: 0.5 });
    hits.push({ inst: 'hat', t, vel: s % 2 ? 0.25 : 0.4 });
  }
  return hits;
}

// Page side: synthesize events with OfflineAudioContext, return interleaved stereo floats
async function synthesizeInPage({ events, secs, rate }) {
  const ctx = new OfflineAudioContext(2, secs * rate, rate);
  const master = ctx.createGain();
  master.gain.value = 0.55;
  const verb = ctx.createConvolver();
  const ir = ctx.createBuffer(2, rate * 2.2, rate);
  for (let c = 0; c < 2; c++) { const d = ir.getChannelData(c); for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3); }
  verb.buffer = ir;
  const wet = ctx.createGain(); wet.gain.value = 0.28;
  master.connect(ctx.destination); master.connect(verb); verb.connect(wet); wet.connect(ctx.destination);
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const noise = ctx.createBuffer(1, rate, rate);
  { const d = noise.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; }
  const env = (t, peak, attack, decay) => { const g = ctx.createGain(); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + attack); g.gain.exponentialRampToValueAtTime(0.0001, t + attack + decay); g.connect(master); return g; };
  const osc = (type, f, t, stop, out) => { const o = ctx.createOscillator(); o.type = type; o.frequency.value = f; o.connect(out); o.start(t); o.stop(stop); return o; };
  const VOICES = {
    bell: (e) => { const g = env(e.t, 0.16 * e.vel, 0.005, 1.6); osc('sine', hz(e.midi), e.t, e.t + 1.8, g); const g2 = env(e.t, 0.05 * e.vel, 0.002, 0.5); osc('sine', hz(e.midi) * 2.76, e.t, e.t + 0.6, g2); },
    marimba: (e) => { const g = env(e.t, 0.2 * e.vel, 0.003, 0.45); osc('sine', hz(e.midi), e.t, e.t + 0.6, g); const g2 = env(e.t, 0.06 * e.vel, 0.001, 0.08); osc('sine', hz(e.midi) * 4, e.t, e.t + 0.12, g2); },
    pluck: (e) => { const g = env(e.t, 0.12 * e.vel, 0.003, 0.35); const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.setValueAtTime(5000, e.t); f.frequency.exponentialRampToValueAtTime(600, e.t + 0.3); f.connect(g); osc('square', hz(e.midi), e.t, e.t + 0.4, f); },
    sparkle: (e) => { const g = env(e.t, 0.07 * e.vel, 0.002, 0.3); osc('triangle', hz(e.midi), e.t, e.t + 0.35, g); },
    pad: (e) => {
      const g = ctx.createGain(); g.gain.setValueAtTime(0, e.t); g.gain.linearRampToValueAtTime(0.035 * e.vel, e.t + 0.4); g.gain.setValueAtTime(0.035 * e.vel, e.t + e.dur - 0.3); g.gain.linearRampToValueAtTime(0, e.t + e.dur); g.connect(master);
      const f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400; f.connect(g);
      for (const cents of [-7, 7]) osc('sawtooth', hz(e.midi), e.t, e.t + e.dur, f).detune.value = cents;
    },
    bass: (e) => { const g = env(e.t, 0.22 * e.vel, 0.01, e.dur); osc('triangle', hz(e.midi), e.t, e.t + e.dur + 0.1, g); },
    kick: (e) => { const g = env(e.t, 0.5 * e.vel, 0.002, 0.25); const o = osc('sine', 120, e.t, e.t + 0.3, g); o.frequency.exponentialRampToValueAtTime(45, e.t + 0.2); },
    hat: (e) => { const g = env(e.t, 0.05 * e.vel, 0.001, 0.05); const f = ctx.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = 7000; f.connect(g); const s = ctx.createBufferSource(); s.buffer = noise; s.connect(f); s.start(e.t); s.stop(e.t + 0.08); },
    clap: (e) => { const g = env(e.t, 0.12 * e.vel, 0.002, 0.15); const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1500; f.connect(g); const s = ctx.createBufferSource(); s.buffer = noise; s.connect(f); s.start(e.t); s.stop(e.t + 0.2); },
  };
  for (const e of events) VOICES[e.inst](e);
  master.gain.setValueAtTime(0, 0); master.gain.linearRampToValueAtTime(0.55, 0.3);
  master.gain.setValueAtTime(0.55, secs - 0.8); master.gain.linearRampToValueAtTime(0, secs);
  const buf = await ctx.startRendering();
  const [l, r] = [buf.getChannelData(0), buf.getChannelData(1)];
  const out = new Float32Array(l.length * 2);
  for (let i = 0; i < l.length; i++) { out[2 * i] = l[i]; out[2 * i + 1] = r[i]; }
  return Array.from(out);
}

function encodeWav(interleaved, rate) {
  const data = Buffer.alloc(interleaved.length * 2);
  interleaved.forEach((v, i) => data.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(v * 32767))), i * 2));
  const head = Buffer.alloc(44);
  head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8); head.write('fmt ', 12);
  head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22); head.writeUInt32LE(rate, 24);
  head.writeUInt32LE(rate * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34); head.write('data', 36); head.writeUInt32LE(data.length, 40);
  return Buffer.concat([head, data]);
}

export const bgmFile = (dir, styleId) => join(dir, `bgm-${styleId}.wav`);

export async function renderStyleLoops(browser, outDir) {
  const page = await browser.newPage();
  for (const [styleId, mood] of Object.entries(STYLE_MOODS)) {
    const samples = await page.evaluate(synthesizeInPage, { events: composeLoop(mood), secs: BGM_SECS, rate: SAMPLE_RATE });
    await writeFile(bgmFile(outDir, styleId), encodeWav(samples, SAMPLE_RATE));
  }
  await page.close();
}
