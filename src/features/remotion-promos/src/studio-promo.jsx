// Renders 15-second Render Studio promo video composition.

import React from "react";
import { AbsoluteFill, Easing, Img, Sequence, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";

const FONT = '"SF Pro Display", -apple-system, "Helvetica Neue", Arial, sans-serif';
const ACCENT = "#ffcf3f";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

const MONTAGE = [
  ["mandelbulb-fractal", "Raymarched Mandelbulb", "Shaders"],
  ["path-tracer-cornell", "Path-Traced Cornell Box", "Shaders"],
  ["procedural-city-night", "Procedural City", "3D Scenes"],
  ["chess-ai", "Chess vs Alpha-Beta", "Games"],
  ["rope-bridge", "Rope Bridge", "Physics"],
  ["desktop-os", "Studio OS", "Apps & UI"],
  ["flight-globe", "Flight Globe", "Algorithms"],
  ["svg-drawing-tests", "SVG Drawing Tests", "2D & Generative"],
];
const WALL = ["sdf-temple-sunset", "liquid-chrome-blobs", "watch-product-viewer", "eight-ball-hero", "ragdoll-stairs", "flow-field-art", "animated-svg-landscape",
  "css-glass-hero", "fourier-epicycles", "gsap-scroll-story", "lottie-loaders", "d3-bar-chart-race", "parametric-vase-stl", "heptagon-bouncing-balls", "neon-tetris",
  "pinball-table", "dungeon-generator", "synth-visualizer", "lsystem-tree-gltf", "volumetric-clouds", "aurora-sky", "fire-shader", "mandelbrot-zoom", "reaction-diffusion",
  "life-3d", "fluid-sim", "pac-man", "raycaster-fps", "spreadsheet-app", "drum-machine", "streaming-landing", "sorting-visualizer", "maze-astar", "neural-net-xor",
  "force-graph", ...MONTAGE.map((m) => m[0])];
const CARD = 27;

// Intro + Outro > 8-ball: glossy sphere, number disc slides across the face to fake rolling
const EightBall = ({ size, roll = 0 }) => {
  const a = roll % (Math.PI * 2);
  const front = Math.cos(a);
  const discX = Math.sin(a) * size * 0.34;
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", position: "relative", overflow: "hidden",
      background: "radial-gradient(circle at 34% 28%, #4a4f5c 0%, #15171c 30%, #050506 62%, #000 100%)",
      boxShadow: `0 ${size * 0.12}px ${size * 0.25}px rgba(0,0,0,.65), inset 0 -${size * 0.06}px ${size * 0.12}px rgba(80,140,110,.18)` }}>
      {front > 0 && (
        <div style={{ position: "absolute", left: "50%", top: "50%", width: size * 0.46, height: size * 0.46, borderRadius: "50%",
          transform: `translate(-50%,-50%) translateX(${discX}px) scaleX(${0.25 + 0.75 * front})`, background: "radial-gradient(circle at 40% 35%, #fffdf6, #e6e1d4)",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontWeight: 800, fontSize: size * 0.3, color: "#0b0b0c" }}>8</div>
      )}
      <div style={{ position: "absolute", left: "18%", top: "10%", width: "38%", height: "22%", borderRadius: "50%",
        background: "radial-gradient(ellipse, rgba(255,255,255,.75), rgba(255,255,255,0) 70%)", transform: "rotate(-28deg)" }} />
    </div>
  );
};

const Backdrop = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse at 30% 60%, #0f3a2a 0%, #0a1612 38%, #07080b 75%)" }} />
);

// Intro > ball rolls in, RENDER STUDIO letters spring up, tagline fades
const Intro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 16, mass: 0.9 } });
  const x = interpolate(s, [0, 1], [-700, 0]);
  const words = ["RENDER", "STUDIO"];
  const out = interpolate(frame, [84, 96], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: out }}>
      <Backdrop />
      <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 90 }}>
        <div style={{ transform: `translateX(${x}px)` }}><EightBall size={360} roll={x / 180 + Math.PI * 4} /></div>
        <div style={{ fontFamily: FONT, color: "#f5f3ee" }}>
          {words.map((w, wi) => (
            <div key={w} style={{ display: "flex", fontSize: 168, fontWeight: 850, letterSpacing: -6, lineHeight: 0.92 }}>
              {w.split("").map((ch, i) => {
                const p = spring({ frame: frame - 14 - wi * 8 - i * 2, fps, config: { damping: 12 } });
                return <span key={i} style={{ display: "inline-block", transform: `translateY(${(1 - p) * 120}px) rotate(${(1 - p) * 12}deg)`, opacity: p,
                  color: wi === 1 && i === 0 ? ACCENT : undefined }}>{ch}</span>;
              })}
            </div>
          ))}
          <div style={{ marginTop: 34, fontSize: 38, fontWeight: 500, color: "#b9c4bd", opacity: interpolate(frame, [44, 62], [0, 1], clamp),
            transform: `translateY(${interpolate(frame, [44, 62], [24, 0], { ...clamp, easing: Easing.out(Easing.cubic) })}px)` }}>
            One prompt. One file. Rendered live.
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Montage > one poster: slides in over the previous, slow push-in, label springs from the left
const MontageCard = ({ name, title, category, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const slide = interpolate(frame, [0, 9], [100, 0], { ...clamp, easing: Easing.out(Easing.cubic) });
  const zoom = interpolate(frame, [0, CARD + 8], [1.14, 1.02]);
  const lab = spring({ frame: frame - 5, fps, config: { damping: 14 } });
  return (
    <AbsoluteFill style={{ transform: `translateX(${slide}%)`, overflow: "hidden", background: "#000", boxShadow: "-30px 0 60px rgba(0,0,0,.6)" }}>
      <Img src={staticFile(`${name}.png`)} style={{ width: "100%", height: "100%", objectFit: "cover", transform: `scale(${zoom})` }} />
      <AbsoluteFill style={{ background: "linear-gradient(90deg, rgba(0,0,0,.75) 0%, rgba(0,0,0,.25) 45%, rgba(0,0,0,0) 70%), linear-gradient(0deg, rgba(0,0,0,.85) 0%, rgba(0,0,0,0) 45%)" }} />
      <div style={{ position: "absolute", left: 110, bottom: 120, fontFamily: FONT, transform: `translateX(${(1 - lab) * -160}px)`, opacity: lab }}>
        <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 999, background: ACCENT, color: "#14110a", fontSize: 26, fontWeight: 700,
          letterSpacing: 2, textTransform: "uppercase" }}>{category}</div>
        <div style={{ marginTop: 18, fontSize: 104, fontWeight: 850, letterSpacing: -3, color: "#fff", textShadow: "0 6px 30px rgba(0,0,0,.6)" }}>{title}</div>
      </div>
      <div style={{ position: "absolute", right: 90, top: 70, fontFamily: FONT, fontSize: 30, fontWeight: 600, color: "rgba(255,255,255,.75)", letterSpacing: 3 }}>
        {String(index + 1).padStart(2, "0")} / {String(MONTAGE.length).padStart(2, "0")}
      </div>
    </AbsoluteFill>
  );
};

// Wall > tilted grid of every demo poster drifting, tool names pop over it
const Wall = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // 4 rows of 9 distinct posters (43 in WALL, so every row is full)
  const rows = [0, 1, 2, 3].map((r) => WALL.slice(r * 9, r * 9 + 9));
  const tools = ["Three.js", "WebGL", "Blender", "Remotion", "Python"];
  const inOp = interpolate(frame, [0, 10], [0, 1], clamp);
  const outOp = interpolate(frame, [86, 96], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ background: "#07080b", opacity: inOp * outOp, overflow: "hidden" }}>
      <AbsoluteFill style={{ perspective: 1600 }}>
        <div style={{ position: "absolute", left: -500, top: -260, transform: "rotateX(28deg) rotateZ(-14deg)", transformOrigin: "center" }}>
          {rows.map((row, r) => (
            <div key={r} style={{ display: "flex", gap: 28, marginBottom: 28, transform: `translateX(${(r % 2 ? -1 : 1) * frame * 5 - (r % 2 ? 300 : 0)}px)` }}>
              {row.map((n, i) => (
                <Img key={i} src={staticFile(`${n}.png`)} style={{ width: 520, height: 325, objectFit: "cover", borderRadius: 18, boxShadow: "0 20px 50px rgba(0,0,0,.6)" }} />
              ))}
            </div>
          ))}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at center, rgba(7,8,11,.9) 0%, rgba(7,8,11,.55) 45%, rgba(7,8,11,.1) 80%)" }} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ display: "flex", gap: 30, fontSize: 76, fontWeight: 850, letterSpacing: -2 }}>
          {tools.map((t, i) => {
            const p = spring({ frame: frame - 6 - i * 9, fps, config: { damping: 11 } });
            return <span key={t} style={{ transform: `scale(${0.4 + 0.6 * p})`, opacity: p, color: i % 2 ? ACCENT : "#fff" }}>{t}</span>;
          })}
        </div>
        <div style={{ marginTop: 26, fontSize: 36, fontWeight: 500, color: "#c9d1cc", opacity: interpolate(frame, [52, 66], [0, 1], clamp) }}>
          64 live demos, 47 toys and offline renders, each with the prompt that made it
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Outro > ball drops in, studio name, fade to black
const Outro = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame, fps, config: { damping: 10, mass: 0.8 } });
  const t = spring({ frame: frame - 10, fps, config: { damping: 15 } });
  const fade = interpolate(frame, [0, 8, 48, 60], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: fade }}>
      <Backdrop />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", fontFamily: FONT }}>
        <div style={{ transform: `translateY(${(1 - p) * -500}px)` }}><EightBall size={250} roll={Math.PI * 2} /></div>
        <div style={{ marginTop: 50, fontSize: 112, fontWeight: 850, letterSpacing: -4, color: "#f5f3ee", opacity: t, transform: `translateY(${(1 - t) * 40}px)` }}>
          8BALL <span style={{ color: ACCENT }}>STUDIO</span>
        </div>
        <div style={{ marginTop: 12, fontSize: 34, color: "#9fb0a7", letterSpacing: 6, opacity: t }}>RENDER STUDIO · LOCALHOST:5066</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const StudioPromo = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {MONTAGE.map(([name, title, category], i) => (
      <Sequence key={name} from={90 + i * CARD} durationInFrames={i === MONTAGE.length - 1 ? CARD + 6 : CARD + 9}>
        <MontageCard name={name} title={title} category={category} index={i} />
      </Sequence>
    ))}
    <Sequence from={300} durationInFrames={96}><Wall /></Sequence>
    <Sequence from={0} durationInFrames={96}><Intro /></Sequence>
    <Sequence from={390} durationInFrames={60}><Outro /></Sequence>
  </AbsoluteFill>
);
