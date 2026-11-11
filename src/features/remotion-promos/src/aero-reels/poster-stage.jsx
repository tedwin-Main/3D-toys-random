// Places the demo poster inside its style kit's device frame with a slow push, beat bumps and a gloss sweep.

import React from "react";
import { Img, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { useBeatPulse, useFramesSinceDownbeat } from "./beat-pulse.jsx";
import { LOOP_TAIL_SECS, loopAngle, pushAndReturn } from "./motion-timing.js";

export const POSTER_W = 900, POSTER_H = 562;
const STAGE_TOP = 690;
const SWEEP_FRAMES = 16;

export const PosterStage = ({ kit, poster, title }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const push = pushAndReturn(frame, durationInFrames, Math.round(LOOP_TAIL_SECS * fps));
  const bump = 1 + 0.012 * useBeatPulse(6);
  const float = Math.sin(loopAngle(frame, durationInFrames, 2)) * 8;
  const { Frame } = kit;
  return (
    <div style={{ position: "absolute", left: "50%", top: STAGE_TOP, transform: `translate(-50%, ${float}px) scale(${bump})` }}>
      <Frame title={title}>
        <div style={{ position: "relative", width: POSTER_W, height: POSTER_H, overflow: "hidden" }}>
          <Img src={staticFile(poster)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${1 + 0.08 * push}) translateX(${-14 * push}px)` }} />
          <GlossSweep />
        </div>
      </Frame>
    </div>
  );
};

// A diagonal glint crosses the poster on every bar downbeat
const GlossSweep = () => {
  const since = useFramesSinceDownbeat();
  if (since >= SWEEP_FRAMES) return null;
  const x = -60 + (since / SWEEP_FRAMES) * 220;
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none",
      background: `linear-gradient(115deg, transparent ${x}%, rgba(255,255,255,.38) ${x + 8}%, transparent ${x + 18}%)` }} />
  );
};
