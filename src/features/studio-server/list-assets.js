/**
 * FILE: src/features/studio-server/list-assets.js
 * PURPOSE: build gallery list: live html demos, rendered media files, 3d-toys simulations (games stay on /3d-toys/)
 * UI: Render Studio home grid, category tabs, viewer
 * USED BY: backend/start-server.js (GET /api/assets), backend/capture-demos.js
 * KEY EXPORTS: CATEGORIES, TABS, STACKS, listAssets, listDemos
 */
import { readdir, readFile, stat } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';
import { SIMS } from '../toy-box/common/toy-list.js';

const MODEL = ['.glb', '.gltf'];
const VIDEO = ['.mp4', '.webm', '.mov'];
const IMAGE = ['.png', '.jpg', '.jpeg', '.webp', '.svg', '.gif'];

// Studio > Tabs: order = tab order; group splits tab rows (live / rendered)
export const CATEGORIES = [
  { id: 'shaders', label: 'Shaders', group: 'live' },
  { id: 'scenes', label: '3D Scenes', group: 'live' },
  { id: 'physics', label: 'Physics', group: 'live' },
  { id: 'generative', label: '2D & Generative', group: 'live' },
  { id: 'motion', label: 'Motion', group: 'live' },
  { id: 'audio', label: 'Audio', group: 'live' },
  { id: 'generators', label: 'Generators', group: 'live' },
  { id: 'apps', label: 'Apps & UI', group: 'live' },
  { id: 'algorithms', label: 'Algorithms', group: 'live' },
  { id: 'aero', label: 'Frutiger Aero', group: 'live', subs: [
    { id: 'core', label: 'Core Aero' }, { id: 'eco', label: 'Eco Aero' }, { id: 'dark', label: 'Dark Aero' }, { id: 'aquatic', label: 'Aquatic Aero' },
    { id: 'humanity', label: 'Humanity Aero' }, { id: 'technozen', label: 'Technozen' }, { id: 'space', label: 'Space Aero' }, { id: 'metro', label: 'Frutiger Metro' },
    { id: 'console', label: 'Console Menus' }, { id: 'y2k', label: 'Y2K Futurism' }, { id: 'mcbling', label: 'McBling' }, { id: 'vectorheart', label: 'Web 2.0 & Vectorheart' },
    { id: 'skeuo', label: 'Skeuomorphism' }, { id: 'retro', label: '90s Desktop & Web' },
  ] },
  { id: 'models', label: '3D Models', group: 'rendered', exts: MODEL },
  { id: 'blender-renders', label: 'Blender', group: 'rendered', exts: [...VIDEO, ...IMAGE] },
  { id: 'remotion-videos', label: 'Remotion', group: 'rendered', exts: VIDEO },
  { id: 'videos', label: 'Videos', group: 'rendered', exts: VIDEO },
  { id: 'images', label: 'Images', group: 'rendered', exts: IMAGE },
];

// Studio > Tab bar: parent tabs over categories; chips = cats, or aero eras then styles
export const TABS = [
  { id: '3d', label: '3D & Physics', cats: ['scenes', 'physics'] },
  { id: 'shaders', label: 'Shaders', cats: ['shaders'] },
  { id: 'creative', label: 'Creative Code', cats: ['generative', 'motion', 'audio', 'generators'] },
  { id: 'apps', label: 'Apps & Algorithms', cats: ['apps', 'algorithms'] },
  { id: 'aero', label: 'Retro Aesthetics', cats: ['aero'], families: [
    { id: 'frutiger', label: 'Frutiger Aero', styles: ['core', 'eco', 'dark', 'aquatic', 'humanity', 'technozen', 'space', 'metro'] },
    { id: '2000s', label: '2000s', styles: ['y2k', 'mcbling', 'vectorheart', 'skeuo', 'console'] },
    { id: '90s', label: '90s', styles: ['retro'] },
  ] },
  { id: 'rendered', label: 'Rendered', cats: ['models', 'blender-renders', 'remotion-videos', 'videos', 'images'] },
];

// Studio > Tech dropdown: detected from source (meta tags stripped so prose never counts); css = nothing else matched
export const STACKS = [
  { id: 'three', label: 'Three.js', group: 'Libraries', re: /from\s*['"]three['"]|three@\d|three(\.module)?(\.min)?\.js/ },
  { id: 'rapier', label: 'Rapier', group: 'Libraries', re: /@dimforge\/rapier|rapier[23]d/i },
  { id: 'cannon', label: 'cannon-es', group: 'Libraries', re: /cannon-es|cannon(\.min)?\.js/i },
  { id: 'd3', label: 'D3.js', group: 'Libraries', re: /d3@\d|from\s*['"]d3['"]|\/d3(\.v\d)?(\.min)?\.js/ },
  { id: 'gsap', label: 'GSAP', group: 'Libraries', re: /gsap@\d|from\s*['"]gsap|gsap(\.min)?\.js/ },
  { id: 'p5', label: 'p5.js', group: 'Libraries', re: /p5@\d|p5(\.min)?\.js/ },
  { id: 'tone', label: 'Tone.js', group: 'Libraries', re: /tone@\d|Tone(\.min)?\.js|from\s*['"]tone['"]/ },
  { id: 'lottie', label: 'Lottie', group: 'Libraries', re: /lottie-web|lottie(\.min)?\.js|lottie-player|dotlottie/i },
  { id: 'react', label: 'React', group: 'Libraries', re: /react@\d|from\s*['"]react['"]|react-dom/ },
  { id: 'next', label: 'Next.js', group: 'Libraries', re: /from\s*['"]next\/|next@\d/ },
  { id: 'webgl', label: 'Raw WebGL / GLSL', group: 'Web APIs', re: /getContext\(\s*['"](webgl2?|experimental-webgl)['"]/ },
  { id: 'canvas', label: 'Canvas 2D', group: 'Web APIs', re: /getContext\(\s*['"]2d['"]/ },
  { id: 'webaudio', label: 'Web Audio', group: 'Web APIs', re: /AudioContext/ },
  { id: 'svg', label: 'SVG', group: 'Web APIs', re: /<svg[\s>]|createElementNS/ },
  { id: 'css', label: 'HTML + CSS only', group: 'Web APIs' },
  { id: 'blender', label: 'Blender', group: 'Pipelines' },
  { id: 'remotion', label: 'Remotion', group: 'Pipelines' },
  { id: 'gltf', label: 'glTF model', group: 'Pipelines' },
];
const MEDIA_STACK = { 'blender-renders': ['blender'], 'remotion-videos': ['remotion', 'react'], models: ['gltf'] };
export function stackOf(src) {
  const text = src.replace(/<meta[^>]*>/gi, '');
  const hit = STACKS.filter((s) => s.re?.test(text)).map((s) => s.id);
  return hit.length ? hit : ['css'];
}
// sim folder: every html/js file, nested folders included
async function readTree(dir) {
  let out = '';
  for (const e of await readdir(dir, { withFileTypes: true }).catch(() => [])) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out += await readTree(p);
    else if (/\.(html|js|mjs)$/.test(e.name)) out += await readFile(p, 'utf8');
  }
  return out;
}

// Studio > Sim cards: prompts for sims that started as frontier-model tests; others show description only
const SIM_PROMPTS = {
  'black-hole-lensing': 'Write a full-screen WebGL shader that raymarches light around a Schwarzschild black hole: bent rays, thin turbulent accretion disk with Doppler beaming, photon ring, starfield, bloom.',
  'lava-lamp': 'Make a lava lamp in one HTML file: raymarched metaball wax inside a glass bottle, blobs heat at the bulb, rise, cool and sink. Five color presets and tap-the-glass interaction.',
  'solar-system-orrery': 'Build a Three.js solar system orrery that places planets at their real positions for today\'s date, with procedural textures, Saturn\'s rings, a comet, click-to-fly camera and a time scrubber.',
  'aquarium-boids': 'Create a desk aquarium in Three.js: schools of fish using boids, caustics on the sand, sprinkle food to feed them, tap the glass to scare them, and a pufferfish that inflates when poked.',
  'marble-run': 'Build a perpetual marble run with Rapier physics in one HTML file: screw lift, banked helix, vortex funnel, and a xylophone staircase that plays notes as marbles hit it. Add a ride-along camera.',
};

const kindOf = (ext) => (MODEL.includes(ext) ? 'model' : VIDEO.includes(ext) ? 'video' : 'image');
// my-chair_v2.glb becomes "My Chair V2"
const titleOf = (file) => basename(file, extname(file)).replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
const meta = (html, name) => html.match(new RegExp(`<meta name="${name}" content="([^"]*)"`, 'i'))?.[1] ?? '';

// Studio > Live tabs: demo-gallery/demos/*.html, metadata from head tags
export async function listDemos(demosRoot) {
  const files = await readdir(demosRoot).catch(() => []);
  const names = new Set(files);
  const out = [];
  for (const f of files.filter((x) => x.endsWith('.html'))) {
    // whole file: library imports sit far below the head
    const html = await readFile(join(demosRoot, f), 'utf8');
    const st = await stat(join(demosRoot, f));
    const base = basename(f, '.html');
    out.push({
      id: `demos/${f}`,
      name: base,
      category: meta(html, 'category') || 'generative',
      kind: 'page',
      ext: 'html',
      url: `demos/${f}`,
      poster: names.has(`${base}.png`) ? `demos/${base}.png?v=${Math.round(st.mtimeMs)}` : null,
      title: html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? titleOf(f),
      desc: meta(html, 'description'),
      prompt: meta(html, 'prompt'),
      style: meta(html, 'style'),
      tags: meta(html, 'tags').split(',').map((t) => t.trim()).filter(Boolean),
      stack: stackOf(html),
      order: Number(meta(html, 'order')) || 99,
      capture: Number(meta(html, 'capture')) || 0,
      mtime: st.mtimeMs,
    });
  }
  return out.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
}

// Studio > Rendered tabs: every file in media/<category>, newest first
async function listMedia(mediaRoot) {
  const out = [];
  for (const cat of CATEGORIES.filter((c) => c.exts)) {
    const dir = join(mediaRoot, cat.id);
    const files = (await readdir(dir).catch(() => [])).filter((f) => !f.startsWith('.') && f !== 'notes.json');
    const names = new Set(files);
    // Studio > Card + viewer info: notes.json maps filename to { about, prompt }
    const notes = JSON.parse(await readFile(join(dir, 'notes.json'), 'utf8').catch(() => '{}'));
    // same-basename image next to model or video = its poster, not its own card
    const posterFor = (f) => ['.png', '.jpg', '.jpeg', '.webp'].map((e) => basename(f, extname(f)) + e).find((p) => names.has(p) && p !== f);
    const posters = new Set(files.filter((f) => !IMAGE.includes(extname(f).toLowerCase())).map(posterFor).filter(Boolean));
    for (const f of files) {
      const ext = extname(f).toLowerCase();
      if (!cat.exts.includes(ext) || posters.has(f)) continue;
      const st = await stat(join(dir, f)).catch(() => null);
      if (!st?.isFile()) continue;
      const poster = kindOf(ext) === 'image' ? null : posterFor(f);
      out.push({
        id: `${cat.id}/${f}`,
        category: cat.id,
        kind: kindOf(ext),
        ext: ext.slice(1),
        url: `media/${cat.id}/${encodeURIComponent(f)}`,
        poster: poster ? `media/${cat.id}/${encodeURIComponent(poster)}` : null,
        title: notes[f]?.title ?? titleOf(f),
        desc: notes[f]?.about ?? '',
        prompt: notes[f]?.prompt ?? '',
        stack: MEDIA_STACK[cat.id] ?? [],
        size: st.size,
        mtime: st.mtimeMs,
      });
    }
  }
  return out.sort((a, b) => b.mtime - a.mtime);
}

// Studio > screen load: live demos, then 3d-toys sims (served under /3d-toys/), then rendered media
export async function listAssets(root) {
  // sim posters come from `npm run capture -- --toys`; missing ones fall back to the emoji
  const shots = new Set(await readdir(join(root, 'media', 'toy-posters')).catch(() => []));
  const sims = await Promise.all(SIMS.map(async (t) => ({ id: `sims/${t.dir}`, category: t.studio, kind: 'page', ext: '3d', url: `3d-toys/${t.dir}/`, title: t.title, emoji: t.emoji,
    desc: t.desc, prompt: SIM_PROMPTS[t.dir] ?? '', tags: t.tags ?? [], stack: stackOf(await readTree(join(root, 'features', 'toy-box', t.dir))),
    poster: shots.has(`${t.dir}.png`) ? `media/toy-posters/${t.dir}.png` : null })));
  return [...(await listDemos(join(root, 'features', 'demo-gallery', 'demos'))), ...sims, ...(await listMedia(join(root, 'media')))];
}
