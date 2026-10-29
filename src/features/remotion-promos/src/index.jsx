/**
 * FILE: render-studio/remotion-promos/src/index.jsx
 * PURPOSE: Remotion entry: registers the StudioPromo composition (1920x1080, 30 fps, 15 s)
 * UI: Render Studio > Remotion Videos tab (rendered output)
 * USED BY: remotion-promos/package.json scripts (studio, render)
 * KEY EXPORTS: none (registerRoot side effect)
 */
import React from "react";
import { Composition, registerRoot } from "remotion";
import { StudioPromo } from "./studio-promo.jsx";

// Remotion > root: one composition, posters served from ../frontend/demos via --public-dir
const Root = () => (
  <Composition id="StudioPromo" component={StudioPromo} durationInFrames={450} fps={30} width={1920} height={1080} />
);

registerRoot(Root);
