# 3D Toy Box

Interactive Three.js toys (CDN import map, no build, all procedural) plus online multiplayer party games for up to 12 players. One Node server hosts everything: static toys, the websocket room relay, and the Where's Waldo app.

## Run locally

```sh
npm run setup   # first time: installs ws + builds the Waldo bundle
npm start       # http://localhost:5055/3d-toys/  (PORT env to change)
```

`backend/start-server.js` serves every toy under `/3d-toys/`, the room relay socket at `/3d-toys/rooms`, Waldo (bundle + its own lobby socket) at `/3d-toys/wheres-waldo-game/`, and `/health` for uptime checks. Friends on the same network can join via `http://<your-ip>:5055/3d-toys/`. Needs Node >= 22.18 (Waldo's server code runs as TypeScript via native type stripping).

## Deploy on Render

1. Render Dashboard > New > Blueprint > pick this repo. `render.yaml` defines one free web service.
2. Build: `npm ci && npm run build:waldo`. Start: `npm start`. Render injects `PORT`; health check hits `/health`.
3. Open `https://<service>.onrender.com/3d-toys/`. Invite links in the lobby use that public URL.

Notes:

- Keep it at one instance: rooms and Waldo lobbies live in server memory.
- Free tier sleeps after 15 min idle; the first visit wakes it (~30-60 s).
- Toys load three.js from `cdn.jsdelivr.net`; networks that block that CDN will show blank toys.

## 3D toys

- ``: one project. `index.html` = gallery (All / Single player / Multiplayer filter) + full-screen viewer with prev/next/dropdown nav (`#toy-name` deep links, `[` / `]` keys). Toy metadata in `components/toy-list.js`. Each toy folder below lives inside it and still opens standalone.
- `pelican-on-bicycle/`: pelican rides a bike over hills; WASD, bell, fish pickups.
- `horse-race-track/`: 2-lap horse derby with betting, cheering, multi-camera.
- `tiny-planet-world/`: walkable mini planet with day/night, villages, boats, tree planting.
- `voxel-sandbox/`: Minecraft-style builder with TNT chain explosions, undo, save/load, night bloom.
- `galaxy-generator/`: GPU spiral galaxy with sliders, mouse gravity warp, Big Bang replay, black hole disk.
- `rubiks-cube/`: playable 2×2 to 5×5 twisty cube: drag turns, notation keys, timer, undo, rewind solve.
- `lawn-mower-stripes/`: ride-on mower cutting 175k-blade shader grass, real lawn stripes via cut/lean data texture.
- `aquarium-boids/`: fish tank with boid schools, caustics floor, feeding, glass tapping, inflating pufferfish.
- `domino-chain/`: draw domino paths, custom hinge physics topple chains with clack audio, presets incl. growing dominoes.
- `solar-system-orrery/`: real present-day planet positions, procedural textures, comet, belt, click-to-fly, time scrubbing.
- `infinite-terrain-flyover/`: endless chunked low-poly terrain, arcade flight, rings, contrails, crash + time-of-day skies.
- `cozy-room-diorama/`: isometric bedroom, lo-fi radio, rain window via stencil portal, day/night, wandering cat that naps and purrs.
- `marble-run/`: Rapier physics marble machine: screw lift, banked helix, vortex funnel, xylophone steps with notes, ride-along cam.
- `snow-globe/`: shakeable transmissive globe, inertial settling snow, tiny village, glitter + blizzard modes, music box.
- `stormy-sea-sailboat/`: Gerstner ocean shader, buoyant sailboat, calm-to-storm slider, rain, lightning + thunder, lighthouse, gulls.
- `fireworks-show/`: click-to-launch fireworks, 10 shell types, afterimage trails, bloom, lake reflection, distance-delayed booms.
- `desk-toys-newton-cradle/`: Newton's cradle (drag balls, pull 1/2/3, both sides) + pendulum wave machine with speed slider and top view.
- `lava-lamp/`: raymarched metaball wax in a lathe bottle, heat/buoyancy blob sim, 5 color sets, tap glass, cold-start warm-up.
- `cloth-flag/`: verlet cloth flag with per-triangle wind, grab/tear/paint modes, 6 designs, half-mast, cut rope, wind-swayed instanced grass.
- `roller-coaster/`: editable spline coaster: transported + banked frames, energy speed profile, G-force stats, POV/chase cams, 3 presets, drag-to-edit orbs, riders with arms up.
- `harbor-town-builder/`: Townscaper-like click-to-stack harbor houses: auto windows/doors/flower boxes/gable roofs, merged column meshes, foam-ring water shader from occupancy texture, generate island, day/golden/night.
- `drift-kart-racing/`: arcade kart racer: procedural star-shaped circuit, grip/handbrake drift model, AI with curvature speed limits, laps + positions, skid ring buffer, smoke, boost pads, minimap, 3 cams, touch buttons.
- `black-hole-lensing/`: full-screen geodesic raymarch (rs=1), thin turbulent Keplerian disk with Doppler + gravitational shift, photon ring, procedural stars/nebula, bloom, film vs realistic, lensing toggle.
- `jelly-playground/`: verlet soft bodies (edge + radial springs, volume pressure), OBB/peg colliders, spatial-hash body contacts, grab-to-stretch, transmissive jelly material, blinking eyes, boing audio.
- `synthwave-night-drive/`: endless synthwave drive with traffic near-miss scoring, procedural music, bloom + CRT pass

## Multiplayer

Rooms via `backend/room-relay.js` (4-letter code, share `?room=CODE`, host-authoritative). Open two tabs to test.

- `wheres-waldo-game/`: multiplayer Where's Waldo (React + ws, history in tedwin-Main/wheres-waldo-game). Race / hide & seek, seeded crowds, server-validated clicks; mounted by backend/start-server.js at /3d-toys/wheres-waldo-game/
- `bumper-sumo-arena/`: online bumper-car sumo on a shrinking ring: host-authoritative 60 Hz sim, 20 Hz snapshots + events, guest extrapolation, host migration, bots, touch stick
- `tank-battle-maze/`: online 12-tank deathmatch: seeded maze (backtracker + loops, merged wall boxes, occupancy LOS grid), ricochet shells, crates, BFS bots that lead + dodge, kill feed, minimap, twin touch sticks
- `paint-territory/`: online turf painting: 48x48 owner grid as premultiplied DataTexture + wobbly-edge floor shader, delta + 1 s keyframe sync, paint bombs, terrain-dependent speed, mirrored seeded pillars, bots seeking unclaimed/enemy turf
- `kart-race-online/`: Online 12-kart race: drift physics, item boxes (boost, banana, homing shell), seeded circuits, 3 laps, live positions.
- `mini-golf-party/`: Simultaneous online mini golf for up to 12: drag-back putting, ball-to-ball collisions, 6 holes (bumpers, windmills, slopes, water, sand), simulation-planning bots, scorecard.
- `hex-drop-survival/`: Online last-one-standing for up to 12: three hex floors where touched tiles drop, jump gaps, bots that hunt solid ground, 3 rounds of points.
- `voxel-build-together/`: Co-op voxel builder for up to 12: live cursors with names, host-ordered edits, 16-color palette, undo, save/load in browser, auto-building attract mode.
- `light-cycle-arena/`: Online light-cycle battle for up to 12: grid-exact trails, boost energy, flood-fill bots, bloom neon, minimap, 5 rounds.
- `bomb-tag-arena/`: Online hot-potato tag for up to 12: bombs pass on contact with no tag-backs, dash, blast knockback, chase/flee bots, waves until one survives.
- `rocket-ball-soccer/`: Online car soccer, Blue vs Orange up to 6v6 with bots; boost, ball cam, goal confetti, sudden death.
- `snowball-fight-arena/`: Online FFA snowball fight up to 12 with bots; lob over forts that crumble and regrow, freeze rivals, 2-minute match.
- `musical-chairs-party/`: Online musical chairs up to 12 with bots; procedural disco loop, beat-synced floor, random chair pop-ups, shove dash, ghosts spectate.
- `lava-rise-climb/`: Online lava-climb race up to 12 with bots; seeded spiral tower, moving platforms, double jump, head stomps, height meter.
