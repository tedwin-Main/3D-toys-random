# Break Builder

No-code portfolio builder. Each project becomes a body in a physics break (pool, marbles, dominoes). Scroll plays the break; the settled scene is the site nav. Export a static zip. A toy in the 3D Toy Box gallery (`#physics-portfolio-builder`). No build: plain ES modules, CDN import map (three, React, htm, gsap, Lenis), physics bakes in a module Web Worker.

## Run

```sh
cd ..            # 3d-toys/
npm start        # http://localhost:5055/3d-toys/#physics-portfolio-builder
npm test         # engine, recording, bundle, camera, template-list tests
```

Any static server works too; open `index.html` over http (not file://, modules + worker need it).

## Map

- `index.html`: builder shell (import map, Google Fonts, styles, mount). `viewer.html`: published site shell, also the export template entry.
- ``: physics bakes (rolling-ball engine for pool/marbles, Rapier for dominoes), recording format, site schema, zip bundle. Runs in the browser worker and in node tests.
- ``: `builder-page.js`, `viewer-page.js`.
- ``: panels, scene renderer, bake worker + client, draft store, export, `html.js` (htm binding), `builder-icons.js` (inline Phosphor).

Backend files run in the browser too: worker imports them by relative path (import maps do not reach workers), Rapier loads from jsdelivr in the browser, from npm in node.

## How it works

- **Bake, not live sim:** builder bakes 3 seeded variants in a Web Worker. Recordings: 60 fps, Int16-quantized, base64 JSON.
- **Viewer:** samples recording by scroll position (GSAP ScrollTrigger + Lenis). Ships zero physics code. Random variant per visit.
- **Labels:** project label flashes when its body is first hit; settled scene shows all labels (8 or fewer projects) or on hover/focus.
- **Drafts:** site JSON in localStorage, images + recordings in IndexedDB.

## Export

Export zip = viewer source files listed in `site-template-files.js` (`viewer.html` becomes `index.html`) + `site.json` + baked breaks + images. Exported site loads its libraries from CDN, so it needs no build either. Adding a viewer import? Add the file to that list; `npm test` fails until you do.

No Vercel deploy button: on a public server a deploy token would let any visitor deploy to your account.
