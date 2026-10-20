# Handoff — Where's Waldo multiplayer game

## What this is
Multiplayer Where's Waldo web game, two modes sharing one scene/scoring core:
- **Race**: everyone hunts the same procedural Waldo, decaying time-based score.
- **Hide & seek**: players take turns hiding Waldo in a procedural crowd, hider scores on how long they evade seekers.

Built end-to-end (server, client, tests), visually verified via Playwright screenshots, pushed to GitHub, mid-deploy to Render.

## Where things stand
- **Repo**: `/Users/sloth/ALL PROJECTS/Wheres_Waldo_Game`, git history up to commit `8731385 "chore: add Render blueprint"`. Pushed to GitHub (private repo, created via `gh repo create`).
- **Uncommitted right now** (not committed per standing rule — never commit without being told): an indie-studio pass adding idle crowd animation and procedural sound. Files touched: `app.tsx`, `components/scene-view.tsx`, `components/draw-sprites.ts`, `pages/home.tsx`, `game-styles.css`, new `components/play-sound.ts`. All typecheck (`tsc --noEmit` clean), build (`npm run build`) and unit tests (`npm test`, 16/16) pass as of this pass.
- **Deploy**: `render.yaml` Blueprint committed. User was mid-walkthrough of Render's dashboard (manual Web Service config, since Blueprint wasn't a selectable card on the screen they were on) — build command `npm ci && npm run build`, start `npm start`, health check `/health`, env var `NODE_VERSION=24` required (server runs TypeScript natively, needs Node ≥22.18). **Live URL not yet known** — next session should ask for it and smoke-test (lobby create/join, a race round, websocket reconnect).

## Architecture (for full detail, read the code — this is a map, not a copy)
- `backend/` (shared files) — platform-agnostic core, used by both client and server: `seeded-random.ts` (seeded mulberry32, deterministic scene gen), `color-palette.ts`, `scene-geometry.ts` (world/view/sprite constants), `crowd-scene.ts` (crowd generator + decoy logic), `game-rules.ts` (scoring, difficulty, validation), `message-types.ts` (ws message types).
- `backend/` — `game-lobby.ts` (round state machine), `start-server.ts` (static hosting), `routes/game-socket.ts` (ws). In-memory only, single-instance (no Redis/DB).
- `frontend/` — React client. `app.tsx` (screen router + HUD), `components/scene-view.tsx` (pannable canvas), `components/draw-sprites.ts` (all art, drawn in code, no image assets), `pages/` (Home, LobbyRoom), `components/` (TargetCard, RoundClock), `components/play-sound.ts` (new — procedural Web Audio sfx + ambient loop, no audio files).
- Tests: `backend/*.test.ts` (unit, 16 passing), `tests/smoke.e2e.ts` (two-player websocket e2e, caught a real hider-scoring balance bug).

## Key decisions already made (don't re-litigate)
- Both modes, one scoring/scene core — settled via `/grillme` interview, then user cut the interview short and said "proceed with your recommended decisions."
- Visual style: smooth flat 2D vector art (capsules/curves/gradients), explicitly **not** pixel art — user rejected an earlier blocky-rectangle version.
- Hosting: Render free tier over Railway, for a ≤10-person use case — verified via live pricing search, not assumed. Single cold start (~50s) judged acceptable.
- `HIDER_PAR_MS = 25_000` in `backend/game-rules.ts` is a deliberately tuned constant fixing a real scoring imbalance found via e2e test — don't "simplify" it away without re-running `tests/smoke.e2e.ts`.

## Known rough edges / open items
- Render deploy not yet confirmed live — see Deploy section above.
- Hider-vs-seeker scoring balance was fixed but user hasn't explicitly signed off as "done" — worth a sanity check if scoring feels off in real play.
- GitHub repo is currently private; flipping to public not yet requested.
- The new animation/sound pass is uncommitted — review and commit (or ask to) before it's lost to any reset.

## Suggested skills
- None required to continue — this is a straightforward React/Node TS project. If doing another design pass with the user, `grillme` is the established pattern they like for scoping ambiguous feature requests.
- If asked to review the uncommitted diff, standard `code-review` built-in skill applies.
