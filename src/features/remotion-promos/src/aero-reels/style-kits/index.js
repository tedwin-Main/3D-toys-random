// Maps each aero style id to its motion-graphics kit: backdrop, motifs, poster frame and accent colour.

import { aquaticKit } from "./aquatic-kit.jsx";
import { coreKit } from "./core-kit.jsx";
import { retroKit } from "./retro-kit.jsx";

const KITS = { core: coreKit, aquatic: aquaticKit, retro: retroKit };

export function styleKit(styleId) {
  const kit = KITS[styleId];
  if (!kit) throw new Error(`no style kit for aero style "${styleId}"`);
  return kit;
}
