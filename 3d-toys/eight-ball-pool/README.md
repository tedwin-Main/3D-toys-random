# Back Room 8-Ball

Real-physics 8-ball pool. Practice solo or play an Easy / Pro bot. A toy in the 3D Toy Box gallery (`#eight-ball-pool`). No build: plain ES modules, CDN import map (three, React, htm), shot sims in a module Web Worker.

## Run

```sh
cd ..            # 3d-toys/
npm start        # http://localhost:5055/3d-toys/#eight-ball-pool
node --test eight-ball-pool/backend/   # engine, rules, bot tests (no install)
```

Any static server works too; open `eight-ball-pool/index.html` over http (not file://, modules + worker need it).

## Map

- `index.html`: import map, fonts, styles, mount.
- `backend/pool-table-physics.js`: table engine: 6 pockets + jaws, swept ball/cushion contacts, cloth friction, spin, 240 Hz.
- `backend/pool-game-physics.js`: rack, strike, record shot frames (60 fps), aim ray, cue-ball placement, re-spot.
- `backend/pool-game-rules.js`: 8-ball rules: break, open table, groups, fouls, ball in hand, 8 win/loss, practice.
- `backend/pool-bot.js`: bot: ghost-ball candidates, simulates the best few, scores with real rules, aim/power noise per level.
- `frontend/pages/play-page.js`: turn flow, menu, HUD, replay, game over.
- `frontend/components/pool-table-scene.js`: three.js table, balls, cue, aim lines, shot playback, HUD-aware camera.
- `frontend/components/pool-aim-input.js`: mouse / touch / keys.
- `frontend/components/pool-controls.js`: power bar, spin pad, player cards.
- `frontend/components/pool-shot-worker.js` + `pool-shot-client.js`: shot sims and bot thinking off the main thread.
- `frontend/components/html.js`, `game-icons.js`, `ball-textures.js`, `camera-path.js`: htm binding, inline icons, canvas textures, camera fit/blend.

Backend files run in the browser too (worker imports them by relative path; import maps do not reach workers, so keep those imports relative).

## Controls

Mouse aims; press, pull back, release to shoot. Touch: tap or drag to aim, pull the power bar. Arrows fine-aim (Shift coarse), Up/Down power, Space shoots, C swaps camera. Ball in hand: drag the cue ball.
