// Converts music beats to frames and shapes loop-safe motion: beat lookups, periodic angles, push-and-return.

export const LOOP_TAIL_SECS = 0.6;

export const toFrames = (seconds, fps) => seconds.map((t) => Math.round(t * fps));

// Index of the last beat at or before frame; -1 before the first beat
export function beatIndexAt(frame, beatFrames) {
  let index = -1;
  for (const beat of beatFrames) {
    if (beat > frame) break;
    index++;
  }
  return index;
}

// The beat closest to frame when one lies within maxShift frames, else frame itself
export function snapToBeat(frame, beatFrames, maxShift) {
  let best = frame;
  for (const beat of beatFrames) if (Math.abs(beat - frame) <= maxShift && Math.abs(beat - frame) < Math.abs(best - frame)) best = beat;
  return best;
}

// Angle that completes whole cycles over the reel, so the last frame flows into frame 0
export const loopAngle = (frame, duration, cycles = 1) => (frame / duration) * cycles * Math.PI * 2;

// Position in [0, 1) that wraps a whole number of times over the reel
export const loopProgress = (frame, duration, cycles = 1, offset = 0) => (((frame / duration) * cycles + offset) % 1 + 1) % 1;

const smooth = (t) => t * t * (3 - 2 * t);

// 0 at frame 0, eases to 1 by the loop tail, eases back to 0 by the last frame
export function pushAndReturn(frame, duration, tailFrames) {
  const peak = duration - tailFrames;
  return frame <= peak ? smooth(frame / peak) : smooth(1 - (frame - peak) / tailFrames);
}
