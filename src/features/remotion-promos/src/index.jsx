// Registers the StudioPromo and aero motion reel compositions for Remotion.

import React from "react";
import { Composition, registerRoot } from "remotion";
import { StudioPromo } from "./studio-promo.jsx";
import { AeroReelCompositions } from "./aero-reels/aero-reel-compositions.jsx";

// Remotion > root: studio promo + aero reels, posters served from ../demo-gallery/demos via --public-dir
const Root = () => (
  <>
    <Composition id="StudioPromo" component={StudioPromo} durationInFrames={450} fps={30} width={1920} height={1080} />
    <AeroReelCompositions />
  </>
);

registerRoot(Root);
