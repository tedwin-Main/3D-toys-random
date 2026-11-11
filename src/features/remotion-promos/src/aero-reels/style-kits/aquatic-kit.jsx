// Aquatic Aero kit: turquoise depths, swaying sun shafts, drifting caustics and rising bubbles around a porthole-glass frame.

import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { GlassOrb, REEL_H, REEL_W } from "../aero-glass.jsx";
import { useBeatPulse } from "../beat-pulse.jsx";
import { loopAngle, loopProgress } from "../motion-timing.js";

const SHAFTS = [{ x: 120, tilt: -14 }, { x: 330, tilt: -6 }, { x: 560, tilt: 2 }, { x: 760, tilt: 9 }, { x: 960, tilt: 16 }];
const CAUSTICS = Array.from({ length: 7 }, (_, i) => ({ x: random(`caustic-x-${i}`) * REEL_W, y: random(`caustic-y-${i}`) * REEL_H, size: 260 + random(`caustic-s-${i}`) * 260 }));
const BUBBLES = Array.from({ length: 30 }, (_, i) => ({
  x: random(`bubble-x-${i}`) * REEL_W,
  size: 18 + random(`bubble-s-${i}`) ** 2 * 90,
  cycles: 1 + Math.floor(random(`bubble-c-${i}`) * 3),
  offset: random(`bubble-o-${i}`),
}));

const Backdrop = () => (
  <AbsoluteFill style={{ background: "linear-gradient(180deg,#c9f6ff 0%,#5fd3f0 22%,#1ea4d8 50%,#0b62ad 78%,#04336e 100%)" }}>
    <SunShafts />
    <Caustics />
  </AbsoluteFill>
);

const SunShafts = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return SHAFTS.map((shaft, i) => (
    <div key={i} style={{ position: "absolute", left: shaft.x - 80, top: -120, width: 160, height: 1900, transformOrigin: "50% 0",
      transform: `rotate(${shaft.tilt + Math.sin(loopAngle(frame, durationInFrames, 1) + i) * 3}deg)`,
      background: "linear-gradient(180deg,rgba(255,255,255,.42) 0%,rgba(255,255,255,.12) 45%,rgba(255,255,255,0) 80%)", filter: "blur(6px)" }} />
  ));
};

// Soft light patches on Lissajous loops, a whole number of turns per reel
const Caustics = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return CAUSTICS.map((c, i) => {
    const a = loopAngle(frame, durationInFrames, 1);
    return (
      <div key={i} style={{ position: "absolute", left: c.x + Math.sin(a + i) * 60, top: c.y + Math.cos(2 * a + i) * 40, width: c.size, height: c.size * 0.55, borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(220,255,255,.32) 0%, rgba(220,255,255,0) 70%)", mixBlendMode: "screen" }} />
    );
  });
};

const Motifs = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pulse = useBeatPulse(8);
  return BUBBLES.map((b, i) => {
    const rise = loopProgress(frame, durationInFrames, b.cycles, b.offset);
    const wobble = Math.sin(loopAngle(frame, durationInFrames, b.cycles * 3) + i) * 16;
    return <GlassOrb key={i} x={b.x + wobble} y={REEL_H + 100 - rise * (REEL_H + 300)} size={b.size} scale={1 + 0.08 * pulse} opacity={0.85} />;
  });
};

// Porthole glass: thick rounded aqua rim with a waterline highlight over the top of the poster
const Frame = ({ children }) => (
  <div style={{ padding: 16, borderRadius: 58, border: "2px solid rgba(255,255,255,.95)",
    background: "linear-gradient(180deg,rgba(255,255,255,.78) 0%,rgba(170,240,255,.5) 50%,rgba(60,190,230,.55) 100%)",
    boxShadow: "0 30px 90px rgba(0,30,80,.5), inset 0 2px 0 #fff" }}>
    <div style={{ position: "relative", borderRadius: 44, overflow: "hidden" }}>
      {children}
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: "34%", borderRadius: "0 0 50% 50% / 0 0 26% 26%",
        background: "linear-gradient(180deg,rgba(255,255,255,.34) 0%,rgba(255,255,255,.08) 100%)" }} />
    </div>
  </div>
);

export const aquaticKit = { Backdrop, Motifs, Frame, accent: "#05507a" };
