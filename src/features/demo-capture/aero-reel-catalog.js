// Lists the aero demos that have a reel script and groups them into numbered style folders.

import { join } from 'node:path';
import { listDemos, CATEGORIES } from '../studio-server/list-assets.js';
import { REEL_SCRIPTS } from './reel-scripts.js';

export const DEMOS_DIR = join(import.meta.dirname, '..', 'demo-gallery', 'demos');

const slug = (t) => t.toLowerCase().replace(/&/g, ' ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function loadAeroStyles() {
  const all = (await listDemos(DEMOS_DIR)).filter((d) => d.category === 'aero');
  const scripted = new Set(REEL_SCRIPTS.map((s) => s.name));
  const unscripted = all.filter((d) => !scripted.has(d.name)).map((d) => d.name);
  if (unscripted.length) throw new Error(`no reel script for: ${unscripted.join(', ')}`);
  const styles = CATEGORIES.find((c) => c.id === 'aero').subs
    .map((s) => ({ ...s, demos: all.filter((d) => d.style === s.id) })).filter((s) => s.demos.length)
    .map((s, i) => ({ ...s, file: `${String(i + 1).padStart(2, '0')}-${slug(s.label)}` }));
  return { all, styles };
}
