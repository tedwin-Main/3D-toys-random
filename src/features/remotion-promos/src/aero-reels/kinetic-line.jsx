// Pops the reel's description line on screen phrase by phrase, each phrase landing on a music beat.

import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { PhraseCard } from "./aero-glass.jsx";
import { useBeatFrames } from "./beat-pulse.jsx";
import { snapToBeat } from "./motion-timing.js";

const MAX_PHRASES = 3, FADE = 6, WORD_STAGGER = 2, SNAP_FRAMES = 8;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

export const splitPhrases = (line) => line.split(/(?<=[.!?])\s+/).map((s) => s.trim()).filter(Boolean).slice(0, MAX_PHRASES);

// Even share of [from, to) per phrase, each start pulled onto the nearest beat
function phraseWindows(count, from, to, beats) {
  const share = (to - from) / count;
  const starts = Array.from({ length: count }, (_, i) => snapToBeat(Math.round(from + i * share), beats, SNAP_FRAMES));
  return starts.map((start, i) => ({ start, end: starts[i + 1] ?? to }));
}

export const KineticLine = ({ line, accent, from, to }) => {
  const frame = useCurrentFrame();
  const phrases = splitPhrases(line);
  const windows = phraseWindows(phrases.length, from, to, useBeatFrames());
  const current = windows.findIndex((w) => frame >= w.start && frame < w.end);
  if (current < 0) return null;
  const { start, end } = windows[current];
  const opacity = interpolate(frame, [start, start + FADE, end - FADE, end], [0, 1, 1, 0], clamp);
  const lift = interpolate(frame, [start, start + FADE * 2], [30, 0], clamp);
  return (
    <PhraseCard length={phrases[current].length} opacity={opacity} lift={lift} accent={accent}>
      <PoppingWords text={phrases[current]} from={start} />
    </PhraseCard>
  );
};

const PoppingWords = ({ text, from }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return text.split(" ").map((word, i) => {
    const pop = spring({ frame: frame - from - i * WORD_STAGGER, fps, config: { damping: 13, mass: 0.6 } });
    return (
      <span key={i} style={{ display: "inline-block", marginRight: "0.28em", opacity: pop, transform: `translateY(${(1 - pop) * 24}px) scale(${0.8 + 0.2 * pop})` }}>{word}</span>
    );
  });
};
