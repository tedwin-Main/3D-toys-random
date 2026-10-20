// World and camera constants.
//
// The world is larger than any screen (the scene is pannable), but the VISIBLE
// AREA is fixed in world units and letterboxed into the window. A 32" monitor
// therefore sees exactly as much crowd as a 13" laptop -- panning stays a skill,
// screen size is not an advantage.

// ~3.5 screenfuls of world. Bigger than this and clustering leaves dead plains
// you pan across for nothing; smaller and the scene fits on screen, which kills
// the point of panning.
export const WORLD_W = 2200;
export const WORLD_H = 1500;

export const VIEW_W = 1200;
export const VIEW_H = 760;

/**
 * Sprite footprint, used for hit-testing and for occlusion checks. Big enough
 * that the layered detail (stripes, hat bands, glasses) actually resolves at
 * the fixed view scale -- at 26px wide the shapes mushed together.
 */
export const SPRITE_W = 32;
export const SPRITE_H = 66;

/** How close a click must land to the target's centre to count. */
export const HIT_RADIUS = 26;

export function clampCamera(x: number, y: number): { x: number; y: number } {
  return {
    x: Math.max(0, Math.min(WORLD_W - VIEW_W, x)),
    y: Math.max(0, Math.min(WORLD_H - VIEW_H, y))
  };
}
