// 90s Desktop kit: teal dithered desktop, starfield screensaver, drifting beveled windows and a 95-style window frame.

import React from "react";
import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";
import { REEL_W } from "../aero-glass.jsx";
import { useBeatPulse } from "../beat-pulse.jsx";
import { loopAngle, loopProgress } from "../motion-timing.js";

const RETRO_FONT = "'Tahoma','Verdana','Geneva',sans-serif";
const STAR_CENTER = { x: REEL_W / 2, y: 1000 };
const STARS = Array.from({ length: 110 }, (_, i) => ({ angle: random(`star-a-${i}`) * Math.PI * 2, cycles: 1 + Math.floor(random(`star-c-${i}`) * 3), offset: random(`star-o-${i}`) }));
const MINI_WINDOWS = [
  { title: "My Computer", x: 40, y: 120, width: 300, cycles: 1 },
  { title: "readme.txt", x: 720, y: 190, width: 300, cycles: 2 },
  { title: "Paint", x: 80, y: 1630, width: 280, cycles: 2 },
  { title: "Dial-Up", x: 700, y: 1680, width: 300, cycles: 1 },
];
const BEVEL_OUT = "inset -2px -2px 0 #000, inset 2px 2px 0 #fff, inset -4px -4px 0 #808080, inset 4px 4px 0 #dfdfdf";
const BEVEL_IN = "inset 2px 2px 0 #808080, inset -2px -2px 0 #fff";

const Backdrop = () => (
  <AbsoluteFill style={{ background: "#008080" }}>
    <AbsoluteFill style={{ background: "repeating-conic-gradient(rgba(0,0,0,.07) 0 25%, transparent 0 50%) 0 0 / 6px 6px" }} />
    <AbsoluteFill style={{ background: "repeating-linear-gradient(180deg, rgba(0,0,0,.08) 0 2px, transparent 2px 5px)" }} />
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 55%, rgba(0,0,0,.45) 100%)" }} />
  </AbsoluteFill>
);

const Motifs = () => (
  <AbsoluteFill>
    <Starfield />
    <MiniWindows />
  </AbsoluteFill>
);

// Classic flying-stars screensaver: each star wraps a whole number of times per reel
const Starfield = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pulse = useBeatPulse(6);
  return STARS.map((star, i) => {
    const depth = loopProgress(frame, durationInFrames, star.cycles, star.offset);
    const reach = depth * depth * 1300;
    const size = 2 + depth * 7 + pulse * 2;
    return (
      <div key={i} style={{ position: "absolute", left: STAR_CENTER.x + Math.cos(star.angle) * reach, top: STAR_CENTER.y + Math.sin(star.angle) * reach,
        width: size, height: size, background: "#fff", opacity: Math.min(1, depth * 6) }} />
    );
  });
};

const MiniWindows = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return MINI_WINDOWS.map((w, i) => (
    <div key={i} style={{ position: "absolute", left: w.x + Math.sin(loopAngle(frame, durationInFrames, w.cycles) + i) * 24, top: w.y, width: w.width }}>
      <Window title={w.title} titleSize={20}>
        <div style={{ height: 110, background: "#fff", boxShadow: BEVEL_IN }} />
      </Window>
    </div>
  ));
};

const TitleButton = ({ label }) => (
  <div style={{ width: 30, height: 26, background: "#c0c0c0", boxShadow: BEVEL_OUT, color: "#000", fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center" }}>{label}</div>
);

const Window = ({ title, titleSize, children }) => (
  <div style={{ background: "#c0c0c0", padding: 6, boxShadow: `${BEVEL_OUT}, 8px 10px 0 rgba(0,0,0,.35)` }}>
    <div style={{ height: titleSize * 1.75, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 4px 0 10px",
      background: "linear-gradient(90deg,#000080,#1084d0)", color: "#fff", fontFamily: RETRO_FONT, fontWeight: 700, fontSize: titleSize }}>
      <span>{title}</span>
      <div style={{ display: "flex", gap: 2 }}><TitleButton label="_" /><TitleButton label="□" /><TitleButton label="×" /></div>
    </div>
    <div style={{ marginTop: 6 }}>{children}</div>
  </div>
);

const Frame = ({ title, children }) => (
  <Window title={title} titleSize={26}>
    <div style={{ padding: 3, boxShadow: BEVEL_IN }}>{children}</div>
  </Window>
);

export const retroKit = { Backdrop, Motifs, Frame, accent: "#000080" };
