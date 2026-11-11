// Registers the aero motion reel compositions, sized from their props, with sample props for Remotion Studio.

import React from "react";
import { Composition } from "remotion";
import { REEL_H, REEL_W } from "./aero-glass.jsx";
import { DemoReel } from "./demo-reel.jsx";

const SAMPLE_DEMO_REEL = {
  name: "aero-glass-desktop",
  title: "Aero Glass Desktop",
  styleId: "core",
  styleLabel: "Core Aero",
  hook: "Your 2007 desktop just woke up",
  line: "Frosted glass windows, glowing captions and a tray balloon chime. Pure Frutiger Aero, rebuilt live with zero images.",
  poster: "aero-glass-desktop.png",
  secs: 12,
  fps: 30,
  beats: Array.from({ length: 24 }, (_, i) => i * 0.5),
};

const sizeFromProps = ({ props }) => ({ fps: props.fps, durationInFrames: Math.round(props.secs * props.fps) });

export const AeroReelCompositions = () => (
  <Composition id="AeroDemoReel" component={DemoReel} width={REEL_W} height={REEL_H} fps={SAMPLE_DEMO_REEL.fps}
    durationInFrames={SAMPLE_DEMO_REEL.secs * SAMPLE_DEMO_REEL.fps} defaultProps={SAMPLE_DEMO_REEL} calculateMetadata={sizeFromProps} />
);
