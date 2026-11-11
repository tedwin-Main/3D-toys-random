// Shares the music beat frames with every reel layer and turns them into decaying pulses.

import React, { createContext, useContext } from "react";
import { useCurrentFrame } from "remotion";
import { beatIndexAt } from "./motion-timing.js";

const BeatContext = createContext([]);

export const BeatProvider = ({ frames, children }) => <BeatContext.Provider value={frames}>{children}</BeatContext.Provider>;

export const useBeatFrames = () => useContext(BeatContext);

// 1 on a beat, decaying toward 0 over about `decay` frames
export function useBeatPulse(decay = 7) {
  const frame = useCurrentFrame();
  const beats = useContext(BeatContext);
  const index = beatIndexAt(frame, beats);
  return index < 0 ? 0 : Math.exp(-(frame - beats[index]) / decay);
}

// Frames since the last bar downbeat (every `beatsPerBar` beats); Infinity before the first
export function useFramesSinceDownbeat(beatsPerBar = 4) {
  const frame = useCurrentFrame();
  const beats = useContext(BeatContext);
  const index = beatIndexAt(frame, beats);
  if (index < 0) return Infinity;
  return frame - beats[index - (index % beatsPerBar)];
}
