/**
 * FILE: backend/color-palette.ts
 * PURPOSE: sprite color palettes, clothing lists, Waldo outfits
 * UI: SceneView canvas, TargetCard preview
 * USED BY: backend/crowd-scene.ts, frontend/components/draw-sprites.ts, frontend/components/target-card.tsx
 * KEY EXPORTS: WALDO, WALDO_LOOKS, waldoLookFor, SKIN, HAIR, TORSO, LEGS, HATS, ACCESSORIES
 */

export const SKIN = ['#f0c8a0', '#d8a271', '#a9714b', '#7a4b2a', '#5a3620', '#f7dbbd'] as const;
export const HAIR = ['#2b1d16', '#6b3f22', '#c08a3e', '#e0d6c2', '#8d8d8d', '#1a1a1a'] as const;

/** Torso colours that are NOT Waldo's red/white stripe. */
export const TORSO = [
  '#2f6f9f', '#3c8f5a', '#8f5ea8', '#c9a227', '#444c56',
  '#1f8a8a', '#a8552f', '#6e7b8b', '#275a3a', '#b0485f'
] as const;

export const LEGS = ['#2a3550', '#4a4a4a', '#6b5436', '#1f3b2c', '#5c3550', '#30506b'] as const;

// 'tudung' (headscarf) and 'songkok' are the Malaysian additions -- they carry
// most of the local read of the crowd, so themes weight them heavily.
export type HatKind = 'none' | 'cap' | 'beanie' | 'bobble' | 'sunhat' | 'helmet' | 'tudung' | 'songkok';
export const HATS: readonly HatKind[] = ['none', 'cap', 'beanie', 'bobble', 'sunhat', 'helmet', 'tudung', 'songkok'];

export type AccessoryKind = 'none' | 'glasses' | 'bag' | 'balloon' | 'cane' | 'scarf';
export const ACCESSORIES: readonly AccessoryKind[] = ['none', 'glasses', 'bag', 'balloon', 'cane', 'scarf'];

/** Ink colour for the hand-drawn outline every shape gets. */
export const INK = '#2a211a';

/**
 * One round's Waldo. A decoy may copy the stripe OR the hat -- never both --
 * so every look has to be built the same way: a two-colour striped top, a
 * distinctive hat, and an accessory.
 */
export interface WaldoLook {
  /** Shown on the target card, so it has to describe the actual colours. */
  name: string;
  stripeA: string;
  stripeB: string;
  hat: HatKind;
  hatA: string;
  hatB: string;
  accessory: AccessoryKind;
}

/**
 * Waldo changes outfit every round. The first entry is the classic; the rest
 * keep the same silhouette so the hunt plays identically, they just stop the
 * eye from locking onto one colour pair for a whole game.
 */
export const WALDO_LOOKS: readonly WaldoLook[] = [
  { name: 'Red & white', stripeA: '#d6263c', stripeB: '#f7f3ea', hat: 'bobble', hatA: '#d6263c', hatB: '#f7f3ea', accessory: 'glasses' },
  { name: 'Blue & white', stripeA: '#1f5fa8', stripeB: '#f2f2ea', hat: 'bobble', hatA: '#1f5fa8', hatB: '#f2f2ea', accessory: 'glasses' },
  { name: 'Green & cream', stripeA: '#1f7a4a', stripeB: '#f0e8cf', hat: 'beanie', hatA: '#1f7a4a', hatB: '#f0e8cf', accessory: 'scarf' },
  { name: 'Yellow & black', stripeA: '#e8b526', stripeB: '#2b2b2b', hat: 'cap', hatA: '#e8b526', hatB: '#2b2b2b', accessory: 'bag' },
  { name: 'Purple & white', stripeA: '#7a3f9f', stripeB: '#f4f0e6', hat: 'bobble', hatA: '#7a3f9f', hatB: '#f4f0e6', accessory: 'glasses' },
  { name: 'Orange & navy', stripeA: '#e0631f', stripeB: '#1e2c48', hat: 'sunhat', hatA: '#e0631f', hatB: '#1e2c48', accessory: 'cane' },
  { name: 'Teal & cream', stripeA: '#17827d', stripeB: '#f2ead6', hat: 'bobble', hatA: '#17827d', hatB: '#f2ead6', accessory: 'bag' },
  { name: 'Pink & grey', stripeA: '#cf3f74', stripeB: '#dcd8cf', hat: 'beanie', hatA: '#cf3f74', hatB: '#dcd8cf', accessory: 'glasses' }
];

/** Deterministic per-round pick -- every client derives it from the seed alone. */
export function waldoLookFor(seed: number): WaldoLook {
  const i = Math.abs(Math.floor(seed)) % WALDO_LOOKS.length;
  return WALDO_LOOKS[i];
}

/**
 * The parts of Waldo that never change. Skin, hair and trousers are pinned
 * because the target card is drawn from the same data: when they were left to
 * the underlying person the card showed one Waldo while the crowd held another.
 */
export const WALDO = {
  ...WALDO_LOOKS[0],
  skin: '#f0c8a0',
  hair: '#6b3f22',
  legs: '#2a3550'
};

/** Hat colours for ordinary people, excluding the Waldo red. */
export const HAT_COLORS = ['#2f6f9f', '#3c8f5a', '#c9a227', '#444c56', '#8f5ea8', '#a8552f'] as const;
