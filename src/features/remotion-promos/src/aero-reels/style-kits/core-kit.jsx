// Core Aero kit: bright sky, turning sun rays, glass ribbons and bobbing orbs around a Vista-style glass window.

import React from "react";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { AeroHill, AeroSky, FONT, GlassOrb, REEL_W } from "../aero-glass.jsx";
import { useBeatPulse } from "../beat-pulse.jsx";
import { loopAngle } from "../motion-timing.js";

const RAY_STEP_DEG = 18;
const ORBS = [
  { x: 40, y: 140, size: 170, cycles: 1, phase: 0 },
  { x: 880, y: 250, size: 120, cycles: 2, phase: 1.3 },
  { x: 70, y: 1180, size: 110, cycles: 2, phase: 2.4 },
  { x: 850, y: 1170, size: 190, cycles: 1, phase: 3.1 },
  { x: 120, y: 1650, size: 90, cycles: 3, phase: 0.7 },
  { x: 760, y: 1700, size: 140, cycles: 1, phase: 4.2 },
];

const Backdrop = () => (
  <AbsoluteFill>
    <AeroSky />
    <SunRays />
    <GlassRibbon baseY={600} amplitude={46} cycles={1} />
    <GlassRibbon baseY={1660} amplitude={60} cycles={2} />
    <AeroHill />
  </AbsoluteFill>
);

// Ray pattern turns exactly one stripe over the reel, so the loop is seamless
const SunRays = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: REEL_W / 2 - 1600, top: -1700, width: 3200, height: 3200, opacity: 0.28,
      transform: `rotate(${(frame / durationInFrames) * RAY_STEP_DEG}deg)`,
      background: `repeating-conic-gradient(from 0deg, rgba(255,255,255,.9) 0deg 6deg, rgba(255,255,255,0) 6deg ${RAY_STEP_DEG}deg)`,
      WebkitMaskImage: "radial-gradient(circle, #000 0%, transparent 62%)" }} />
  );
};

const GlassRibbon = ({ baseY, amplitude, cycles }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const phase = loopAngle(frame, durationInFrames, cycles);
  const points = Array.from({ length: 29 }, (_, i) => {
    const x = i * 40 - 20;
    return `${x},${baseY + Math.sin(x / 170 + phase) * amplitude}`;
  });
  return (
    <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
      <defs>
        <linearGradient id={`ribbon-${baseY}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.5" stopColor="#fff" stopOpacity="0.75" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points.join(" ")} fill="none" stroke={`url(#ribbon-${baseY})`} strokeWidth="26" strokeLinecap="round" />
      <polyline points={points.join(" ")} fill="none" stroke="#bff4ff" strokeOpacity="0.5" strokeWidth="6" transform="translate(0 30)" />
    </svg>
  );
};

const Motifs = () => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const pulse = useBeatPulse(8);
  return ORBS.map((orb, i) => (
    <GlassOrb key={i} x={orb.x} y={orb.y + Math.sin(loopAngle(frame, durationInFrames, orb.cycles) + orb.phase) * 22} size={orb.size} scale={1 + 0.06 * pulse} />
  ));
};

const CaptionButton = ({ label, close }) => (
  <div style={{ width: close ? 64 : 42, height: 30, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 700, color: "#fff",
    border: "1px solid rgba(0,30,70,.55)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.8)",
    background: close ? "linear-gradient(180deg,#f3a08c 0%,#d9442b 50%,#b8270f 52%,#e0644a 100%)" : "linear-gradient(180deg,#e9f6ff 0%,#a9d4f2 50%,#7fb7e4 52%,#bfe2fb 100%)" }}>{label}</div>
);

// Vista-style glass window: translucent frame, title, glossy caption buttons
const Frame = ({ title, children }) => (
  <div style={{ padding: "0 14px 14px", borderRadius: 16, border: "1.5px solid rgba(255,255,255,.9)",
    background: "linear-gradient(180deg,rgba(195,235,255,.88) 0%,rgba(110,185,240,.72) 40%,rgba(45,125,205,.68) 100%)",
    boxShadow: "0 30px 80px rgba(0,40,110,.45), inset 0 1px 0 #fff" }}>
    <div style={{ height: 54, display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: FONT, fontSize: 26, fontWeight: 600, color: "#06315e", textShadow: "0 1px 0 rgba(255,255,255,.8)" }}>
      <span style={{ paddingLeft: 6 }}>{title}</span>
      <div style={{ display: "flex", gap: 3 }}><CaptionButton label="–" /><CaptionButton label="□" /><CaptionButton label="×" close /></div>
    </div>
    <div style={{ borderRadius: 4, overflow: "hidden", border: "1px solid rgba(0,40,90,.5)" }}>{children}</div>
  </div>
);

export const coreKit = { Backdrop, Motifs, Frame, accent: "#0a4f9e" };
