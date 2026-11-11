// Composes one aero demo reel: hook, poster in its style-kit frame, kinetic line and title bar, moving on the music beats.

import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { HookBubble, TitleBar } from "./aero-glass.jsx";
import { BeatProvider, useBeatPulse } from "./beat-pulse.jsx";
import { KineticLine } from "./kinetic-line.jsx";
import { toFrames } from "./motion-timing.js";
import { PosterStage } from "./poster-stage.jsx";
import { styleKit } from "./style-kits/index.js";

const HOOK_SECS = 1.3, LINE_GAP_SECS = 0.25, LINE_END_SECS = 0.8;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" };

// cover: the still used as the reel cover, hook and title both showing
export const DemoReel = ({ title, styleId, styleLabel, hook, line, poster, beats, cover = false }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const kit = styleKit(styleId);
  return (
    <BeatProvider frames={toFrames(beats, fps)}>
      <AbsoluteFill style={{ overflow: "hidden", background: "#000" }}>
        <kit.Backdrop />
        <kit.Motifs />
        <PosterStage kit={kit} poster={poster} title={title} />
        {!cover && <KineticLine line={line} accent={kit.accent} from={Math.round((HOOK_SECS + LINE_GAP_SECS) * fps)} to={durationInFrames - Math.round(LINE_END_SECS * fps)} />}
        <Hook text={hook} cover={cover} />
        <Title title={title} styleLabel={styleLabel} cover={cover} />
      </AbsoluteFill>
    </BeatProvider>
  );
};

// Full strength from frame 0 (Instagram's first frame), gone by HOOK_SECS
const Hook = ({ text, cover }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pulse = useBeatPulse(6);
  const opacity = cover ? 1 : interpolate(frame, [(HOOK_SECS - 0.3) * fps, HOOK_SECS * fps], [1, 0], clamp);
  if (!opacity) return null;
  return <HookBubble text={text} opacity={opacity} scale={1 + 0.02 * pulse} />;
};

const Title = ({ title, styleLabel, cover }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const progress = cover ? 1 : interpolate(frame, [(HOOK_SECS - 0.2) * fps, (HOOK_SECS + 0.1) * fps], [0, 1], clamp);
  return <TitleBar title={title} styleLabel={styleLabel} opacity={progress} slide={(1 - progress) * -60} />;
};
