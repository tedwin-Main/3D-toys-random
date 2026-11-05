# 3D Toy Box

Interactive Three.js toys (CDN import map, no build, all procedural) plus online multiplayer party games for up to 14 players (party royale rounds: up to 32). One Node server hosts everything: static toys, and the websocket room relay.

## Run locally

From the repo root (one server for Render Studio + toys + rooms):

```sh
npm run setup   # first time: installs both folders
npm start       # http://localhost:5066/ (studio) and http://localhost:5066/3d-toys/ (toys)
npm test        # pool, Break Builder, party royale and relay tests (node --test)
npm run capacity-test  # relay load at 14 / 24 / 32 / 40 / 50 players
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

- `src/features/toy-box/`: one project. `index.html` = gallery (All / Single player / Multiplayer filter; Multiplayer adds genre chips: turn-based, party royale, last one standing, bluff & bid, battle, racing & sports, party, creative, from each toy's `genre` in `common/toy-list.js`) + full-screen viewer with prev/next/dropdown nav (`#toy-name` deep links, `[` / `]` keys). Toy metadata in `common/toy-list.js`. Each toy folder below lives inside it and still opens standalone.
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

Rooms via `src/features/multiplayer-rooms/room-relay.js` (4-letter code, share `?room=CODE`, host-authoritative). Open two tabs to test. Game data rides short text frames (`common/relay-wire.js`: `>to|sticky|json` up, `<from|json` down): the relay reads only the header and forwards the payload bytes untouched, one shared buffer per fan-out, so a peer cannot spoof `from`. Party royale rounds run on the relay itself (`multiplayer-rooms/hosted-games.js` > `party-royale/party-server-host.js`): the relay is peer `SERVER_PEER` (0), so every player is one hop from the host.

- `wheres-waldo-game/`: Waldo Hunt, online Where's Waldo for 2-14 with bots: race (best of 5) or hide & seek in seeded Malaysian crowds, decoys ramp each round; host-validated clicks over the room relay. Single 2D-canvas page (old React app history in tedwin-Main/wheres-waldo-game).
- `bumper-sumo-arena/`: online bumper-car sumo on a shrinking ring: host-authoritative 60 Hz sim, 20 Hz snapshots + events, guest extrapolation, host migration, bots, touch stick
- `tank-battle-maze/`: online 14-tank deathmatch: seeded maze (backtracker + loops, merged wall boxes, occupancy LOS grid), ricochet shells, crates, BFS bots that lead + dodge, kill feed, minimap, twin touch sticks
- `paint-territory/`: online turf painting: 48x48 owner grid as premultiplied DataTexture + wobbly-edge floor shader, delta + 1 s keyframe sync, paint bombs, terrain-dependent speed, mirrored seeded pillars, bots seeking unclaimed/enemy turf
- `kart-race-online/`: Online 14-kart race: drift physics, item boxes (boost, banana, homing shell), seeded circuits, 3 laps, live positions.
- `mini-golf-party/`: Turn-based online mini golf for up to 14: tee off in honor order, then farthest-from-cup putts next, shot clock (host setting, timeout = +1 stroke and a weak putt is played for you), resting balls can be knocked (only the putter pays water penalties), drag-back putting, 6 holes (bumpers, windmills, slopes, water, sand), simulation-planning bots, scorecard.
- `hex-drop-survival/`: Online last-one-standing for up to 14: three hex floors where touched tiles drop, jump gaps, bots that hunt solid ground, 3 rounds of points.
- `voxel-build-together/`: Co-op voxel builder for up to 14: live cursors with names, host-ordered edits, 16-color palette, undo, save/load in browser, auto-building attract mode.
- `light-cycle-arena/`: Online light-cycle battle for up to 14: grid-exact trails, boost energy, flood-fill bots, bloom neon, minimap, 5 rounds.
- `bomb-tag-arena/`: Online hot-potato tag for up to 14: bombs pass on contact with no tag-backs, dash, blast knockback, chase/flee bots, waves until one survives.
- `rocket-ball-soccer/`: Online car soccer, Blue vs Orange up to 7v7 with bots; boost, ball cam, goal confetti, sudden death.
- `snowball-fight-arena/`: Online FFA snowball fight up to 14 with bots; lob over forts that crumble and regrow, freeze rivals, 2-minute match.
- `musical-chairs-party/`: Online musical chairs up to 14 with bots; procedural disco loop, beat-synced floor, random chair pop-ups, shove dash, ghosts spectate.
- `lava-rise-climb/`: Online lava-climb race up to 14 with bots; seeded spiral tower, moving platforms, double jump, head stomps (bounce you up, daze the victim), height meter.
- `king-of-the-hill/`: Crown Keep, online king of the hill up to 14 with bots; crown ring hops between 7 hilltops with a ghost-ring warning, everyone inside shares 1 pt/s, shove-dash knockback + stun, fall off the island and respawn at the edge.
- `pirate-cannon-clash/`: Cannon Cove, online pirate ship battle up to 14 with bots; sails + helm on a rolling wave sea, port/starboard 3-ball broadsides with arcing shot, 9 palm islands for cover, repair barrels, sink feed + minimap, first to 8 sinks.
- `penguin-curling/`: Penguin Curling, turn-based online curling up to 14 with bots; one throw each per round in order (leader first, last place holds the hammer), 10 s shot clock, stopped penguins stay as stones to guard or take out, hog line, ping-pong charge meter, belly-slide with sweep (less friction) + lean (curl), elastic penguin knocks, lake past the back line, house moves each round, rings 5/3/2/1 + closest-to-fish bonus, 8 rounds (3 in a full room).
- `sheepdog-rush/`: Sheepdog Rush, online herding up to 14 with bots; boids flock (flee dogs, separation, cohesion, graze-wander), one pen per dog with gates cut in the ring fence, bark impulse ring, golden sheep worth 3, bots circle behind a sheep and walk it in, first to 30.
- `balloon-battle/`: Balloon Battle, online balloon pop up to 14 with bots; stick sets heading with capped turn rate, lance-tip vs tail hit test, dash, 3 balloons + floating spare bundles (max 5), ghost respawn, confetti pops + pop feed, carousel + pillars, first to 20 pops.

Turn-based and secret-pick games below sync through `common/turn-sync.js` (secret picks, bids, guesses and steps stay on the host until the reveal; a promoted host asks for them again): the host sends the whole game state only when it changes (versioned, sticky so late joiners get it), guests send numbered actions, and a promoted guest resumes from the last state it saw. Nothing moves between updates, so lag only delays a turn instead of making it jitter.

- `bank-or-bust/`: Bank or Bust, push-your-luck dice up to 14 with bots; one shared 2-dice roll per beat, pot grows for everyone still in, bank (button / Space) to keep it; a single 1 busts the round, snake eyes wipe the total, doubles count twice, first roll of a round is safe, bank grace for lag; tumbling 3D dice, pawns sit when banked and tip when bust, coin stacks.
- `fence-fields/`: Fence Fields, dots and boxes up to 14 with bots on a 3D meadow; board size scales with player count (or host pick), one fence per turn, closing a pen claims it (owner-colored tile + grazing sheep) and keeps the turn, turn clock (timeout builds a random fence), bots take free pens, avoid third sides, then give away the shortest chain.
- `treasure-auction/`: Treasure Auction, sealed-bid auction up to 14 with bots; every lot everyone bids in secret, treasure goes to the highest bid nobody matched (ties cancel), a cursed idol makes everyone pay their bid and sticks the lowest bidder with it; 40 coins each, score = coins + loot, 6/8/10 lots.
- `jar-guess/`: Jar Guess, candy-jar estimation up to 14 with bots; seeded jar / tube / fishbowl / box packed bottom-up (every tab builds the same jar), drag to turn it, secret guesses, closest 5 / 3 / 2, within 10% = 1, exact +3, jars fill up each round.
- `gem-diggers/`: Gem Diggers, turn-based digging up to 14 with bots on a seeded 8-12 square meadow; gem +3 and dig again, bomb −2, empty tiles show adjacent bomb and gem counts and flood open, turn clock (timeout digs a random tile), bots read the numbers.
- `lucky-low/`: Lucky Low, bluffing numbers up to 14 with bots; secret picks from 1 to players+3 (6-16), the lowest number nobody else picked wins and scores its own value, tokens drop on numbered pillars in order on the reveal.
- `picnic-dash/`: Picnic Dash, simultaneous-turn grid race up to 14 with bots; each turn everyone picks a step in secret and all critters hop at once, same square or swapping = both bounce, walking into a stander bounces, apples 1 / watermelons 3, trees never cut the meadow apart, 15/20/30 turns.
- `siege-hills/`: Siege Hills, turn-based catapult artillery up to 14 with bots; side-on heightmap strip, drag-back slingshot aim with arc preview (no wind) or arrow keys, random wind per turn, host simulates each shot and guests replay its arc, craters carve the ground, blast falloff + direct-hit bonus + fall damage, tide rises each lap late in a round, survive +3 / knockout +1 over 1-5 rounds.

## Party royale

Obstacle-show genre (gallery chip 🫘 Party royale): bean races, survival, logic, hunt and team rounds with eliminations, up to 32 beans per room. Original rounds and art; only the generic mechanics (fake doors, sweeping bars, memory tiles, tail tag) follow the genre.

- `bean-royale-show/`: full show. `common/party-royale/show-director.js` opens with a race (70% go through), then survival / logic / hunt / team rounds (55%), then a final once 6 or fewer remain (or at round 5). A final with several survivors replays a final until one bean is crowned.
- Rounds, each also its own page: `gate-gamble/` (doors), `spinner-gauntlet/` (sweepers, hammers, discs, rams), `ghost-tiles/` (hidden safe path), `tilt-bridges/` (crowd-weighted seesaws), `boulder-hill/` (boulders + rising goo), `sweep-bar/` (jump the low bar, dive the high one), `wall-rush/` (sliding walls with gaps), `cannon-rain/` (rim cannons), `pattern-panic/` (memorise symbols), `tail-snatch/` (steal tails), `egg-haul/` (2-4 teams, nests), `crown-summit/` (final, grab the crown). `hex-drop-survival/` sits in the same chip.
- Engine (`common/party-royale/`, pure JS, node-testable): `course-colliders.js` (boxes with yaw + tilt, cylinders, balls; obstacles move as pure functions of the round clock), `bean-physics.js` (run, jump with coyote + buffer, dive under high bars, stumble, platform carry, slopes, knock tags), `round-sim.js` (60 Hz rounds, qualify / eliminate, grabs, checkpoints), `bean-bots.js` + per-round bot hooks, `rounds/*.js`.
- Netcode: the relay runs every party round (`party-server-host.js`, same match flow and 60 Hz fixed-step sim as the old browser host); every browser, lobby host included, is a predicted guest one hop away. The lobby host sends `run` / `stop`; a late joiner gets the sticky round frame; a player who leaves is knocked out and the match keeps running. Guests send tick-numbered inputs (every tick up to 14 guests, every 2 ticks above); the server plays them through a jitter queue (drains standing lag after bursts) and acks the last one in each snapshot. Guests rebuild their own bean from the server copy and replay unacked inputs against obstacles at the matching ticks, so a jump timed on screen lands on the server too. Round state that is not a pure function of time (gates, tiles, plank tilt, tails, eggs, crown) rides in the snapshot.
- Snapshots: binary codec v3 (`round-snapshot.js`), same rounding as the JSON rows. Rows follow the shared roster order (ids implied), ack rides as 16 bits, ground index / mode timer / slow / round extra take one byte each (22 B per bean worst case), and a column at its base value in every row is skipped for that snapshot. Rate: fastest of 60 / 30 / 20 / 15 Hz inside two free-tier budgets (`snapEvery`): relay egress 400 KB/s, relay frames 960/s.
- Latency, live on Render SG from KL (`?debug` exposes `__party.game.guest.stats.confirmMs`; confirm loop = press > server applies > ack back):
  - Browser host over the relay (before 2026-11-06): p50 97-107 ms, two hops.
  - Server-run rounds (2026-11-06, ping 26-28 ms): p50 56-64 / p95 76-93 ms at 14 and 32 beans; relay echo 34-38 ms.
  - Same build on a noisier link (ping avg 36-44 ms): echo 43-52, confirm p50 65-90 ms. Confirm tracks echo + 22-30 ms.
- Verified: `round-rules.test.js` runs every round at 14 and 32 bots (ends, quotas, single final winner, no NaN) plus whole shows to one winner; `hosted-games.test.js` drives server-run matches through the relay core (lobby-host control, late join, acks, drops, full show); `netplay-latency.test.js` asserts the confirm loop stays within 2 ticks of the one-hop round trip, and with 5 guests at 125 ms one-way + 40 ms jitter, lag costs ~0.9 of 14 Sweep Bar places (no prediction: ~3.7) and own-bean corrections stay p50 < 0.01 units.

Latency floor, per stage (press on a guest > server applies it > ack back):

| stage | floor | live, 14-32 beans (2026-11-06) |
|---|---|---|
| network | 1 hop × (ping + Render edge-to-instance proxy) | relay echo 34-38 ms (ping 26-28 ms) |
| relay processing | 0 | handler 5-6 ms/s, handler max ≤ 0.42 ms |
| guest input send | every tick (every 2 ticks above 14 guests) | every tick up to 14 humans: confirm p50 64 > 51 ms, p95 117 > 74 ms live at 14 humans |
| server jitter queue | 1 tick of arrival phase; extra depth only from jitter | depth p10 1 / p50 2 / mean 1.9-2.2, starved 1.3-1.9% of ticks |
| server tick phase | avg 8 ms (60 Hz fixed step, same clock as guests) | same |
| sum | 36 + 8 + 8-17 ≈ 52-61 ms | confirm loop p50 56-64 ms |

- **Floor:** the network term is now one Render hop; the rest is the 60 Hz tick and one tick of queue. A shorter path needs a server nearer the players, not code.
- **Jitter queue:** its wait is the cost of exact prediction (one input per tick). Skipping same-movement inputs (tried 2026-11-05) cut no confirm time and raised corrections p95 0.16 > 0.26, so it was reverted.
- **2 > 32 player rise:** the server host sends one snapshot per human; the per-room cost on the relay is CPU, measured below.

Seat cap: 32 (`MAX_SEATS` in `multiplayer-rooms/room-relay-core.js`; classic games keep 14). `npm run capacity-test -- 20 14,24,32` (humans only) and `-- 20 1,14,32 fill` (bots fill to 32), server-run rounds, relay on a laptop core. `room-relay.js` corks each socket for one event-loop turn (a burst leaves in one write).

| humans | beans | snapshot | relay CPU incl. sim | relay egress | per guest in | inputs in |
|---|---|---|---|---|---|---|
| 14 | 14 | 328 B @ 60 Hz | 70 ms/s | 271 KB/s | 19 KB/s | 418/s |
| 24 | 24 | 524 B @ 30 Hz | 45 ms/s | 371 KB/s | 15 KB/s | 713/s |
| 32 | 32 | 682 B @ 15 Hz | 48 ms/s | 331 KB/s | 10 KB/s | 942/s |
| 1 | 32 | 712 B @ 60 Hz | 56 ms/s | 39 KB/s | 39 KB/s | 58/s |
| 14 | 32 | 715 B @ 30 Hz | 28-73 ms/s | 296 KB/s | 21 KB/s | 407/s |

- **Egress:** every row fits the 400 KB/s budget (about 69 h of play a month on the 100 GB quota); worst round (Egg Haul, 32 humans) 771 B, 370 KB/s.
- **CPU:** live on Render (`/3d-toys/relay-stats`, free limit 150 ms/s): 3 humans + 29 bots 49 ms/s (rounds `hostedMsPerS` 14, the rest is socket I/O); 14 humans + 18 bots, every-tick input 72-83 ms/s. Socket frames dominate, not the sim or codec (snapshot encode 4 µs, input handler 1.5 µs), so one full 14-player room per free instance, or two of ~7.
- **15 Hz floor:** below it, the snapshot wait would cost more latency than the egress saves.

Raise `MAX_SEATS` or run more rooms only on a paid instance.

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
