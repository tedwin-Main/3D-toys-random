// Draws the aero glass pieces every reel shares: sky, hill, orbs, hook bubble, phrase card and title bar.

import React from "react";
import { AbsoluteFill } from "remotion";

export const REEL_W = 1080, REEL_H = 1920;
export const BAR_Y = 1360;
export const FONT = "'Avenir Next','Segoe UI','Helvetica Neue',sans-serif";

const GLOSS_PANEL = {
  background: "linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(225,246,255,.86) 48%,rgba(190,232,255,.82) 52%,rgba(235,250,255,.9) 100%)",
  border: "3px solid #fff",
  boxShadow: "0 24px 70px rgba(0,40,110,.5),inset 0 3px 0 #fff",
};

export const AeroSky = () => (
  <AbsoluteFill style={{ background: "radial-gradient(120% 70% at 50% 0%,#e9fbff 0%,#7fd6ff 35%,#1f8fe0 70%,#0a4f9e 100%)" }} />
);

export const AeroHill = ({ lift = 0 }) => (
  <div style={{ position: "absolute", left: "-20%", right: "-20%", bottom: "-38%", height: "62%", borderRadius: "50% 50% 0 0", transform: `translateY(${-lift}px)`,
    background: "radial-gradient(80% 60% at 50% 10%,#d9ff8a 0%,#7ed321 35%,#2f9a1c 75%,#196b10 100%)", boxShadow: "inset 0 30px 60px rgba(255,255,255,.55)" }} />
);

export const GlassOrb = ({ x, y, size, scale = 1, opacity = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: "50%", transform: `scale(${scale})`, opacity,
    background: "radial-gradient(circle at 32% 28%,rgba(255,255,255,.95) 0 8%,rgba(255,255,255,.35) 22%,rgba(140,220,255,.18) 55%,rgba(255,255,255,.45) 100%)",
    boxShadow: "inset -10px -16px 40px rgba(0,90,180,.25),0 10px 40px rgba(0,60,140,.15)" }} />
);

// Opening hook: bold glossy bubble below the Instagram top bar
export const HookBubble = ({ text, opacity, scale }) => (
  <div style={{ position: "absolute", left: 70, right: 70, top: 300, padding: "48px 56px", borderRadius: 64, textAlign: "center", opacity, transform: `scale(${scale})`, ...GLOSS_PANEL }}>
    <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: text.length > 30 ? 74 : 88, lineHeight: 1.08, color: "#0a4f9e", textShadow: "0 2px 0 rgba(255,255,255,.9)" }}>{text}</div>
  </div>
);

// Phrase card: same glass as the hook, smaller type, sits in the hook's slot once the hook is gone.
// Long phrases drop to smaller type so four lines still clear the poster.
export const PhraseCard = ({ children, length, opacity, lift, accent }) => (
  <div style={{ position: "absolute", left: 90, right: 90, top: 330, padding: "36px 48px", borderRadius: 52, textAlign: "center", opacity, transform: `translateY(${lift}px)`, ...GLOSS_PANEL }}>
    <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: length > 90 ? 42 : 50, lineHeight: 1.16, color: accent }}>{children}</div>
  </div>
);

// Title bar: glossy pill with demo title and style tag, above the Instagram caption zone
export const TitleBar = ({ title, styleLabel, opacity, slide }) => (
  <div style={{ position: "absolute", left: 60, right: 60, top: BAR_Y + 20, height: 190, borderRadius: 95, display: "flex", flexDirection: "column", justifyContent: "center",
    padding: "0 64px", opacity, transform: `translateX(${slide}px)`, fontFamily: FONT, color: "#fff",
    background: "linear-gradient(180deg,rgba(130,215,255,.95) 0%,rgba(40,150,235,.92) 50%,rgba(10,105,205,.94) 52%,rgba(40,160,240,.95) 100%)",
    border: "2px solid rgba(255,255,255,.9)", boxShadow: "0 14px 40px rgba(0,40,100,.45),inset 0 3px 0 rgba(255,255,255,.8)" }}>
    <div style={{ fontWeight: 800, fontSize: title.length > 18 ? 50 : 62, lineHeight: 1.05, textShadow: "0 2px 6px rgba(0,40,110,.5)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{title}</div>
    <div style={{ marginTop: 10, fontWeight: 700, fontSize: 26, letterSpacing: 5, textTransform: "uppercase", color: "#e8fbff" }}>Frutiger Aero · {styleLabel}</div>
  </div>
);
