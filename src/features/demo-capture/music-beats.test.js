// Tests the beat grid finder on synthetic click tracks and silence.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { beatTimes, BEAT_SAMPLE_RATE } from './music-beats.js';

const FRAME_SECS = 1 / 30;

// Decaying 1 kHz clicks over light noise, one every periodSecs starting at firstSecs
function clickTrack({ secs, periodSecs, firstSecs }) {
  const samples = new Int16Array(secs * BEAT_SAMPLE_RATE);
  let seed = 7;
  const noise = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5) * 200;
  for (let i = 0; i < samples.length; i++) samples[i] = noise();
  for (let t = firstSecs; t < secs; t += periodSecs) {
    const at = Math.round(t * BEAT_SAMPLE_RATE);
    for (let i = 0; i < 400 && at + i < samples.length; i++) {
      samples[at + i] += Math.round(20000 * Math.exp(-i / 80) * Math.sin((2 * Math.PI * 1000 * i) / BEAT_SAMPLE_RATE));
    }
  }
  return samples;
}

function assertGrid(beats, { secs, periodSecs, firstSecs }) {
  const expected = [];
  for (let t = firstSecs; t < secs; t += periodSecs) expected.push(t);
  assert.equal(beats.length, expected.length);
  beats.forEach((b, i) => assert.ok(Math.abs(b - expected[i]) <= FRAME_SECS, `beat ${i}: ${b} vs ${expected[i]}`));
}

test('120 BPM click track gives a 0.5 s grid within one frame', () => {
  const track = { secs: 12, periodSecs: 0.5, firstSecs: 0.25 };
  assertGrid(beatTimes(clickTrack(track), 12), track);
});

test('100 BPM click track keeps its own tempo', () => {
  const track = { secs: 12, periodSecs: 0.6, firstSecs: 0.1 };
  assertGrid(beatTimes(clickTrack(track), 12), track);
});

test('silence falls back to a steady 0.5 s grid', () => {
  const beats = beatTimes(new Int16Array(12 * BEAT_SAMPLE_RATE), 12);
  assert.deepEqual(beats, Array.from({ length: 24 }, (_, i) => i * 0.5));
});
