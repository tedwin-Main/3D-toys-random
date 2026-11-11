// Finds the beat grid of a music slice: energy-flux onsets, autocorrelation tempo, best-fit phase.

import { decodePcm } from './reel-format.js';

export const BEAT_SAMPLE_RATE = 8000;
const HOP = 80; // 100 envelope frames per second
const WINDOW = HOP * 2;
const ENVELOPE_RATE = BEAT_SAMPLE_RATE / HOP;
const MIN_BPM = 70, MAX_BPM = 160, PREFERRED_BPM = 120;
const MIN_PERIODICITY = 0.05;
const FALLBACK_SECS = 0.5;

export function detectBeats(file, secs) {
  return beatTimes(decodePcm(file, BEAT_SAMPLE_RATE), secs);
}

// Beat times in seconds within [0, secs); a steady 0.5 s grid when the slice has no clear pulse
export function beatTimes(samples, secs) {
  const envelope = onsetEnvelope(samples);
  const tempo = beatPeriod(envelope);
  if (!tempo || tempo.periodicity < MIN_PERIODICITY) return fixedGrid(secs);
  const phase = beatPhase(envelope, tempo.period);
  const times = [];
  for (let t = phase; t < secs * ENVELOPE_RATE; t += tempo.period) times.push(Math.round((t / ENVELOPE_RATE) * 1000) / 1000);
  return times;
}

function fixedGrid(secs) {
  return Array.from({ length: Math.ceil(secs / FALLBACK_SECS) }, (_, i) => i * FALLBACK_SECS);
}

// Rise in log energy per frame, minus its local mean so steady loudness does not count as onsets
function onsetEnvelope(samples) {
  const frames = Math.floor(samples.length / HOP);
  const energy = new Float64Array(frames);
  for (let f = 0; f < frames; f++) {
    const from = Math.max(0, f * HOP - WINDOW / 2), to = Math.min(samples.length, f * HOP + WINDOW / 2);
    let sum = 0;
    for (let i = from; i < to; i++) sum += samples[i] * samples[i];
    energy[f] = Math.log1p(sum / WINDOW);
  }
  const flux = energy.map((e, f) => (f ? Math.max(0, e - energy[f - 1]) : 0));
  return subtractLocalMean(flux, 25);
}

function subtractLocalMean(values, radius) {
  return values.map((v, i) => {
    const from = Math.max(0, i - radius), to = Math.min(values.length, i + radius + 1);
    let sum = 0;
    for (let j = from; j < to; j++) sum += values[j];
    return Math.max(0, v - sum / (to - from));
  });
}

// Beat period in envelope frames (fractional), favouring tempos near 120 BPM
function beatPeriod(envelope) {
  const minLag = Math.floor((60 * ENVELOPE_RATE) / MAX_BPM), maxLag = Math.ceil((60 * ENVELOPE_RATE) / MIN_BPM);
  if (envelope.length < maxLag * 3) return null;
  const zeroLag = autocorrelation(envelope, 0);
  if (!zeroLag) return null;
  const preferredLag = (60 * ENVELOPE_RATE) / PREFERRED_BPM;
  const scores = [];
  for (let lag = minLag - 1; lag <= maxLag + 1; lag++) scores[lag] = autocorrelation(envelope, lag);
  let best = minLag;
  const weighted = (lag) => scores[lag] * Math.exp(-0.5 * (Math.log2(lag / preferredLag) / 0.9) ** 2);
  for (let lag = minLag; lag <= maxLag; lag++) if (weighted(lag) > weighted(best)) best = lag;
  return { period: best + parabolicOffset(scores[best - 1], scores[best], scores[best + 1]), periodicity: scores[best] / zeroLag };
}

function autocorrelation(values, lag) {
  let sum = 0;
  for (let i = 0; i + lag < values.length; i++) sum += values[i] * values[i + lag];
  return sum / (values.length - lag);
}

function parabolicOffset(left, mid, right) {
  const curve = left - 2 * mid + right;
  return curve < 0 ? Math.max(-0.5, Math.min(0.5, (0.5 * (left - right)) / curve)) : 0;
}

// Grid offset whose beats land on the most onset energy
function beatPhase(envelope, period) {
  const near = (t) => Math.max(envelope[Math.round(t) - 1] ?? 0, envelope[Math.round(t)] ?? 0, envelope[Math.round(t) + 1] ?? 0);
  let best = 0, bestScore = -1;
  for (let offset = 0; offset < period; offset += 0.5) {
    let score = 0;
    for (let t = offset; t < envelope.length; t += period) score += near(t);
    if (score > bestScore) { bestScore = score; best = offset; }
  }
  return best;
}
