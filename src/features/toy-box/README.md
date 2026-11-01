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

- `src/features/toy-box/`: one project. `index.html` = gallery (All / Single player / Multiplayer filter; Multiplayer adds genre chips: popular, turn-based, last one standing, bluff & bid, battle, racing & sports, party, deduction, co-op, rhythm, creative, from each toy's `genre` in `common/toy-list.js`; Popular is a hand-picked ranking in `POPULAR` there, shown in rank order with a one-line reason per pick, and prev / next in the viewer follows it) + full-screen viewer with prev/next/dropdown nav (`#toy-name` deep links, `[` / `]` keys). Toy metadata in `common/toy-list.js`. Each toy folder below lives inside it and still opens standalone.
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

Table games below run on `common/table-game.js` (lobby, turn-sync, host tick from a worker, roster joins and leaves, bots, attract mode) and `common/table-stage.js` (stage, pawns, name tags, drawn status marks, HUD cards). Keys starting with `_` in the state stay on the host (roles, hidden codes, packs, secret orders); private views (your role, your pack, a word-check reply) go to one player with `tell`; ink strokes stream peer to peer with `stream`. A promoted host asks everyone again for what left with the old host. In-game text uses words and drawn marks (tick = locked in, dot = thinking, ring = out) instead of emojis.

- `masquerade-manor/`: Masquerade Manor, social deduction for 4-14 with bots; 1-3 secret Phantoms (by room size), a Butler who inspects one person a night, a Maid who protects one (never the same twice); night picks, dawn reveal, day talk with quick claims (suspect / trust / Phantom! / Butler claims) and free chat, secret vote with skip, ties save everyone; bots keep suspicion maps, Phantom bots bluff fake Butler claims and pile onto suspected guests; roles are private views, a promoted host re-collects them.
- `lighthouse-keepers/`: Lighthouse Keepers, co-op for 1-14; four walls, flood and lamp oil on 0-12 tracks, a storm deck forecast two cards ahead, everyone picks a job at once (patch a wall, pump, fuel, scavenge supplies), cracked walls leak, the lamp burns every turn; cards keep their strength (times difficulty) and bigger crews face more of them (half a card a turn solo, about one per 3.5 keepers, fractions carry over so the forecast is exact); bots cover the most urgent need nobody else has taken.
- `beat-drop/`: Beat Drop, rhythm race for 1-14; seeded four-lane charts and a synth band per song, each device judges its own timing (Perfect 50 ms / Great 95 / Good 140) on its audio clock and only reports scores twice a second, music scheduled 1.5 s ahead; host batches score publishes (4 Hz); bots simulate hit rates.
- `vault-breakers/`: Vault Breakers, code-breaking for 1-14; hidden 4-gem code (6 colors, repeats), turns rotate, every guess and its gold / white clue pegs shown to all, cracking sooner scores more; bots guess codes consistent with all (or recent) clues; a promoted host picks a new code that fits every clue so far.
- `letter-lanterns/`: Letter Lanterns, word game for 1-14; nine seeded-weighted letters (rerolled until a 6+ letter word exists), secret words in 30-60 s checked against `words.txt` (20.8k popular English words, 3-9 letters, from dolph/dictionary popular.txt), only words nobody else wrote score their length, +2 longest lonely word, +5 for all nine.
- `doodle-relay/`: Doodle Relay, drawing and guessing for 2-14; the artist picks one of three words, draws on the easel (raycast onto a canvas texture, uploaded once per frame), strokes stream to every tab in 80 ms batches; guesses typed, near misses get a private "so close", first correct guesses score most and the artist scores for each; bot artists trace stroke recipes.
- `potion-market/`: Potion Market, card draft for 2-14; packs of six ingredients pass left then right, everyone picks in secret and picks reveal together, baskets brew into three posted recipes (brute-force best brew, wild Phoenix feather), a recipe pays one less for every other brew of it that round.
- `sushi-belt-memory/`: Sushi Belt Memory, memory for 1-14; dishes ride the conveyor (each tab plays the belt locally), then everyone rebuilds the order in secret, 1 point per right spot, +3 for a perfect plate, belt grows to 11.
- `island-lords/`: Island Lords, territory strategy for 2-14; seeded hex island (radius 3-5 by room size, water never cuts a start off, gold mines), one secret order per turn (march all but one troop to a neighbor, or muster +3), all orders resolve at once, biggest army wins and keeps the difference, income per 3 tiles + mines; score = tiles + 2 per mine + 3 for your castle.
- `spice-bazaar/`: Spice Bazaar, trading for 1-14; secret buy / sell orders for three spices each round, the crowd's net demand, momentum and a hidden value move the price, everyone fills at the midpoint, headlines (mostly true) shift values, prices far above value can crash; richest net worth wins; momentum, value and contrarian bots.

## Testing multiplayer at 14 players

`npm run room-test` (from the repo root) starts the toy server, opens 14 Chromium tabs per multiplayer game (one host creates the room, 13 join by code), starts the match and plays for 40 s with chaos input (buttons, taps, drags, keys, typed guesses). Every websocket message in every tab is delayed 40±15 ms each way (order kept), about a phone on Render Singapore. It reports per game: joined / started / still in match, page errors, whether every guest got host state, host message rate and gaps, KB/s per guest, and host-to-guest-to-host round trips (p50 / p95 / max) from a probe every 500 ms. Each probe carries its real send moment (all tabs share the machine clock), so the report splits the raw round trip from the network round trip: raw minus the time the probe sat waiting on a busy main thread in either tab (a software-rendered frame can take a second here; on a phone it takes milliseconds). Latency is steady state (probes from 8 s after the start; the first frames compile every shader, so the warm-up worst case is listed on its own). Floor is about 190 ms (four lagged hops); a game passes when steady network p95 stays under floor + 250 ms, and the raw figures plus event-loop lag stay in the report. Options: `--games=a,b --players=14 --seconds=40 --lag=40 --jitter=15 --guest-fps=0.2 --url=... --out=report.json --profile[=tab]` (`--profile` prints a tab's hottest functions, host by default); `CHROMIUM_PATH` points at a preinstalled Chromium.

The test machine has no GPU: all 14 tabs share one CPU-emulated GPU process, which is far slower than one phone's GPU and would turn render time into fake network lag. So test tabs draw small (half resolution, no MSAA) and rarely (one frame per 5 s, still running every game's render code), guest tabs keep audio suspended, and before the start the 60 Hz attract demo behind the lobby gets 1 tick in 8. Game ticks, sockets and the relay run at full speed. Host profiles show the game JavaScript itself (sim, bots, snapshots) under 1% of the host tab's time with 14 players; an event-loop lag column flags any run where the machine, not the network, was the bottleneck.

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
