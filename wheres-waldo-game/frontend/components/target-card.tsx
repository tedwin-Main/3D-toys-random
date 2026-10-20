/**
 * FILE: frontend/components/target-card.tsx
 * PURPOSE: side card showing target avatar and clue text
 * UI: Game > Side > TargetCard
 * USED BY: app.tsx
 * KEY EXPORTS: TargetCard
 */

import { useEffect, useRef } from 'react';
import { makeRng } from '../../backend/seeded-random.ts';
import { makeTargetLook, type Person } from '../../backend/crowd-scene.ts';
import { WALDO, type WaldoLook } from '../../backend/color-palette.ts';
import { drawPerson } from './draw-sprites.ts';

/** Plain-English names for the sprite parts, for the card's one-line description. */
const HAT_WORDS: Record<string, string> = {
  bobble: 'bobble hat', beanie: 'beanie', cap: 'cap', sunhat: 'sun hat',
  helmet: 'helmet', tudung: 'tudung', songkok: 'songkok', none: 'no hat'
};
const ACC_WORDS: Record<string, string> = {
  glasses: 'glasses', bag: 'shoulder bag', scarf: 'scarf', cane: 'walking cane',
  balloon: 'balloon', none: 'no extras'
};

// Game > Side > TargetCard: render target avatar and description
export function TargetCard({ look = WALDO }: { look?: WaldoLook }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = 70 * dpr;
    canvas.height = 110 * dpr;
    const rng = makeRng(7);
    const base: Person = {
      x: 35, y: 55, skin: WALDO.skin, hair: WALDO.hair,
      torsoA: '#000', torsoB: '#000', legs: WALDO.legs,
      hat: 'none', hatA: '#000', hatB: '#000', accessory: 'none',
      flip: false, isTarget: false
    };
    ctx.setTransform(dpr * 1.7, 0, 0, dpr * 1.7, 0, 8 * dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    void rng;
    drawPerson(ctx, makeTargetLook(base, look), 21, 28);
  }, [look]);

  return (
    <div className="targetCard">
      <canvas ref={ref} style={{ width: 70, height: 110 }} />
      <div>
        <strong>Waldo</strong>
        {/* description follows the round's outfit, or the card lies about the hunt */}
        <p>{look.name} stripes, matching {HAT_WORDS[look.hat] ?? 'hat'}, {ACC_WORDS[look.accessory] ?? 'no extras'}. Lookalikes copy one — never both.</p>
      </div>
    </div>
  );
}
