# 3D Toy Box

Interactive Three.js toys (CDN import map, no build, all procedural) plus online multiplayer party games for up to 14 players. One Node server hosts everything: static toys, and the websocket room relay.

## Run locally

From the repo root (one server for Render Studio + toys + rooms):

```sh
npm run setup   # first time: installs both folders
npm start       # http://localhost:5066/ (studio) and http://localhost:5066/3d-toys/ (toys)
npm test        # pool + Break Builder engine tests (node --test)
```

Toys alone: `npm run toys` from the root serves only the toy box on http://localhost:5055/3d-toys/.

Both servers serve every toy under `/3d-toys/`, the room relay socket at `/3d-toys/rooms`, and `/health` for uptime checks. Friends on the same network can join via `http://<your-ip>:<port>/3d-toys/`. Needs Node >= 22.

## Deploy on Render

1. Render Dashboard > New > Blueprint > pick this repo. Root `render.yaml` defines one free web service.
2. Build: `npm ci` (npm workspaces install both folders). Start: `npm start`. Render injects `PORT`; health check hits `/health`.
3. Open `https://<service>.onrender.com/3d-toys/` for toys, `/` for Render Studio. Invite links in the lobby use that public URL.

Notes:

- Keep it at one instance: rooms live in server memory.
- Free tier sleeps after 15 min idle; the first visit wakes it (~30-60 s).
- Toys load three.js from `cdn.jsdelivr.net`; networks that block that CDN will show blank toys.

## 3D toys

- `src/features/toy-box/`: one project. `index.html` = gallery (All / Single player / Multiplayer filter) + full-screen viewer with prev/next/dropdown nav (`#toy-name` deep links, `[` / `]` keys). Toy metadata in `common/toy-list.js`. Each toy folder below lives inside it and still opens standalone.
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
- `bonsai-garden/`: Bonsai Bench: procedural bonsai (maple / cherry / pine), click-to-prune with tumbling cut branches, season scrub with falling leaves, petals and snow, wind sway.
- `eight-ball-pool/`: Back Room 8-Ball: real-physics pool (pockets + jaws, spin, 240 Hz), full 8-ball rules, practice or Easy / Pro bot that simulates its shots; ES modules + module worker, tests via `node --test eight-ball-pool/`.
- `physics-portfolio-builder/`: Break Builder: no-code portfolio where each project is a ball, marble or domino in a baked physics break (custom rolling-ball engine + Rapier in a module worker); scroll plays the break, settled scene is the nav; Export zip = static no-build site. Old Vite history in tedwin-Main/physics-portfolio-builder.

## Multiplayer

Rooms via `src/features/multiplayer-rooms/room-relay.js` (4-letter code, share `?room=CODE`, host-authoritative). Open two tabs to test.

- `wheres-waldo-game/`: Waldo Hunt, online Where's Waldo for 2-14 with bots: race (best of 5) or hide & seek in seeded Malaysian crowds, decoys ramp each round; host-validated clicks over the room relay. Single 2D-canvas page (old React app history in tedwin-Main/wheres-waldo-game).
- `bumper-sumo-arena/`: online bumper-car sumo on a shrinking ring: host-authoritative 60 Hz sim, 20 Hz snapshots + events, guest extrapolation, host migration, bots, touch stick
- `tank-battle-maze/`: online 14-tank deathmatch: seeded maze (backtracker + loops, merged wall boxes, occupancy LOS grid), ricochet shells, crates, BFS bots that lead + dodge, kill feed, minimap, twin touch sticks
- `paint-territory/`: online turf painting: 48x48 owner grid as premultiplied DataTexture + wobbly-edge floor shader, delta + 1 s keyframe sync, paint bombs, terrain-dependent speed, mirrored seeded pillars, bots seeking unclaimed/enemy turf
- `kart-race-online/`: Online 14-kart race: drift physics, item boxes (boost, banana, homing shell), seeded circuits, 3 laps, live positions.
- `mini-golf-party/`: Turn-based online mini golf for up to 14: tee off in honor order, then farthest-from-cup putts next, shot clock (host setting, timeout = +1 stroke), resting balls can be knocked (only the putter pays water penalties), drag-back putting, 6 holes (bumpers, windmills, slopes, water, sand), simulation-planning bots, scorecard.
- `hex-drop-survival/`: Online last-one-standing for up to 14: three hex floors where touched tiles drop, jump gaps, bots that hunt solid ground, 3 rounds of points.
- `voxel-build-together/`: Co-op voxel builder for up to 14: live cursors with names, host-ordered edits, 16-color palette, undo, save/load in browser, auto-building attract mode.
- `light-cycle-arena/`: Online light-cycle battle for up to 14: grid-exact trails, boost energy, flood-fill bots, bloom neon, minimap, 5 rounds.
- `bomb-tag-arena/`: Online hot-potato tag for up to 14: bombs pass on contact with no tag-backs, dash, blast knockback, chase/flee bots, waves until one survives.
- `rocket-ball-soccer/`: Online car soccer, Blue vs Orange up to 7v7 with bots; boost, ball cam, goal confetti, sudden death.
- `snowball-fight-arena/`: Online FFA snowball fight up to 14 with bots; lob over forts that crumble and regrow, freeze rivals, 2-minute match.
- `musical-chairs-party/`: Online musical chairs up to 14 with bots; procedural disco loop, beat-synced floor, random chair pop-ups, shove dash, ghosts spectate.
- `lava-rise-climb/`: Online lava-climb race up to 14 with bots; seeded spiral tower, moving platforms, double jump, head stomps, height meter.
- `king-of-the-hill/`: Crown Keep, online king of the hill up to 14 with bots; crown ring hops between 7 hilltops with a ghost-ring warning, everyone inside shares 1 pt/s, shove-dash knockback + stun, fall off the island and respawn at the edge.
- `pirate-cannon-clash/`: Cannon Cove, online pirate ship battle up to 14 with bots; sails + helm on a rolling wave sea, port/starboard 3-ball broadsides with arcing shot, 9 palm islands for cover, repair barrels, sink feed + minimap, first to 8 sinks.
- `penguin-curling/`: Penguin Curling, turn-based online curling up to 14 with bots; one throw each per round in order (leader first, last place holds the hammer), 10 s shot clock, stopped penguins stay as stones to guard or take out, hog line, ping-pong charge meter, belly-slide with sweep (less friction) + lean (curl), elastic penguin knocks, lake past the back line, house moves each round, rings 5/3/2/1 + closest-to-fish bonus, 8 rounds (3 in a full room).
- `sheepdog-rush/`: Sheepdog Rush, online herding up to 14 with bots; boids flock (flee dogs, separation, cohesion, graze-wander), one pen per dog with gates cut in the ring fence, bark impulse ring, golden sheep worth 3, bots circle behind a sheep and walk it in, first to 30.
- `balloon-battle/`: Balloon Battle, online balloon pop up to 14 with bots; stick sets heading with capped turn rate, lance-tip vs tail hit test, dash, 3 balloons + floating spare bundles (max 5), ghost respawn, confetti pops + pop feed, carousel + pillars, first to 20 pops.

Turn-based games below sync through `common/turn-sync.js`: the host sends the whole game state only when it changes (versioned, sticky so late joiners get it), guests send numbered actions, and a promoted guest resumes from the last state it saw. Nothing moves between updates, so lag only delays a turn instead of making it jitter.

- `bank-or-bust/`: Bank or Bust, push-your-luck dice up to 14 with bots; one shared 2-dice roll per beat, pot grows for everyone still in, bank (button / Space) to keep it; a single 1 busts the round, snake eyes wipe the total, doubles count twice, first roll of a round is safe, bank grace for lag; tumbling 3D dice, pawns sit when banked and tip when bust, coin stacks.
- `fence-fields/`: Fence Fields, dots and boxes up to 14 with bots on a 3D meadow; board size scales with player count (or host pick), one fence per turn, closing a pen claims it (owner-colored tile + grazing sheep) and keeps the turn, turn clock with auto-move, bots take free pens, avoid third sides, then give away the shortest chain.
- `siege-hills/`: Siege Hills, turn-based catapult artillery up to 14 with bots; side-on heightmap strip, drag-back slingshot aim with arc preview (no wind) or arrow keys, random wind per turn, host simulates each shot and guests replay its arc, craters carve the ground, blast falloff + direct-hit bonus + fall damage, tide rises each lap late in a round, survive +3 / knockout +1 over 1-5 rounds.

## How these were made

Every toy was picked and built by Claude Code in a `/goal /loop` session from the two prompts below (verbatim, typos kept). No per-toy prompt exists.

### Prompt 1: single-player toys

```
/goal /loop create various fancy interactive 3d projects that i usually see in reddit (e.g mini 3d world, horse running around in track, pelican on bicycle) in RANDOM_dump folder. Create till weekly usage runs out
```

### Prompt 2: multiplayer games

```
in the main menu of the 3d toys e.g http://localhost:5055/3d-toys/# > add nav to filter between single or multiplayer > move /Users/sloth/ALL PROJECTS/Wheres_Waldo_Game / into this 3D toys folder and combine with these 3d toys games as well. After the implementation is done for the original planned single player 3D toy games > create on the multiplayer aspect /
/goal use the same concept as the 3d-toys created but just for multiplayer and keep creating until weekly usage runs out
```
