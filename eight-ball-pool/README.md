# Back Room 8-Ball

Real-physics 8-ball pool. Practice solo or play an Easy / Pro bot. Lives in the 3D Toy Box gallery as `#eight-ball-pool`; served from `dist/` by `../backend/start-server.js` at `/3d-toys/eight-ball-pool/`.

## Run

```sh
npm install
npm run dev     # standalone: http://localhost:5183/
npm test        # engine, rules, bot (node --test)
npm run build   # dist/ for the toy box (or `npm run build:pool` from 3d-toys/)
```

## Map

- `backend/pool-table-physics.js`: table engine: 6 pockets + jaws, swept ball/cushion contacts, cloth friction, spin, 240 Hz.
- `backend/pool-game-physics.js`: rack, strike, record shot frames (60 fps), aim ray, cue-ball placement, re-spot.
- `backend/pool-game-rules.js`: 8-ball rules: break, open table, groups, fouls, ball in hand, 8 win/loss, practice.
- `backend/pool-bot.js`: bot: ghost-ball candidates, simulates the best few, scores with real rules, adds aim/power noise per level.
- `frontend/pages/play-page.jsx`: turn flow, menu, HUD, replay, game over.
- `frontend/components/pool-table-scene.js`: three.js table, balls, cue, aim lines, shot playback, HUD-aware camera.
- `frontend/components/pool-aim-input.js`: mouse / touch / keys.
- `frontend/components/pool-controls.jsx`: power bar, spin pad, player cards.
- `frontend/components/pool-shot-worker.js` + `pool-shot-client.js`: shot sims and bot thinking off the main thread.

## Controls

Mouse aims; press, pull back, release to shoot. Touch: tap or drag to aim, pull the power bar. Arrows fine-aim (Shift coarse), Up/Down power, Space shoots, C swaps camera. Ball in hand: drag the cue ball.
