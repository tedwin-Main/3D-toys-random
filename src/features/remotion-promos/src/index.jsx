// Registers StudioPromo composition for Remotion.

import React from "react";
import { Composition, registerRoot } from "remotion";
import { StudioPromo } from "./studio-promo.jsx";

// Remotion > root: one composition, posters served from ../demo-gallery/demos via --public-dir
const Root = () => (
  <Composition id="StudioPromo" component={StudioPromo} durationInFrames={450} fps={30} width={1920} height={1080} />
);

registerRoot(Root);
