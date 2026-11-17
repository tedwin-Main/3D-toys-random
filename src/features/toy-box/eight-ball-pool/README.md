# Back Room 8-Ball

Real-physics 8-ball pool. Practice solo or play an Easy / Pro bot. A toy in the 3D Toy Box gallery (`#eight-ball-pool`). No build: plain ES modules, CDN import map (three, React, htm), shot sims in a module Web Worker.

## Run

```sh
cd ..            # 3d-toys/
npm start        # http://localhost:5055/3d-toys/#eight-ball-pool
node --test eight-ball-pool/   # engine, rules, bot tests (no install)
```

Any static server works too; open `eight-ball-pool/index.html` over http (not file://, modules + worker need it).

## Map

- `index.html`: import map, fonts, styles, mount.
- `pool-table-physics.ts`: table engine: 6 pockets + jaws, swept ball/cushion contacts, cloth friction, spin, 240 Hz.
- `pool-game-physics.ts`: rack, strike, record shot frames (60 fps), aim ray, cue-ball placement, re-spot.
- `pool-game-rules.ts`: 8-ball rules: break, open table, groups, fouls, ball in hand, 8 win/loss, practice.
- `pool-bot.ts`: bot: ghost-ball candidates, simulates the best few, scores with real rules, aim/power noise per level.
- `play-page.ts`: turn flow, menu, HUD, replay, game over.
- `pool-table-scene.ts`: three.js table, balls, cue, aim lines, shot playback, HUD-aware camera.
- `pool-aim-input.ts`: mouse / touch / keys.
- `pool-controls.ts`: power bar, spin pad, player cards.
- `pool-shot-worker.ts` + `pool-shot-client.ts`: shot sims and bot thinking off the main thread.
- `html.ts`, `game-icons.ts`, `ball-textures.ts`, `camera-path.ts`: htm binding, inline icons, canvas textures, camera fit/blend.

Backend files run in the browser too (worker imports them by relative path; import maps do not reach workers, so keep those imports relative).

## Controls

Mouse aims; press, pull back, release to shoot. Touch: tap or drag to aim, pull the power bar. Arrows fine-aim (Shift coarse), Up/Down power, Space shoots, C swaps camera. Ball in hand: drag the cue ball.
