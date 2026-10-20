# Waldo Hunt

## Map
- `frontend/`: React game client (lobby, scene, HUD). Status: active
- `backend/`: server, lobby state, game rules + scene gen shared with client; `routes/` websocket doorway. Status: active
- `deployment/`: Dockerfile for Render. Status: active
- `tests/`: websocket contract, smoke flow. Status: active
- `docs/`: handoff notes, map art. Status: active

Multiplayer Where's Waldo. Two modes, one codebase.

- **Race** — best of 5. Everyone gets the identical crowd and hunts the same Waldo.
  Finding scores on a decaying curve (1000 at 0s down to a 100 floor at 90s), so a
  mid-pack player stays in the game instead of the fastest person winning every round.
- **Hide & seek** — each player hides Waldo exactly once, so the player count sets the
  round count. The hider scores the average time it took to find them, capped at a 25s
  par, and **zero if nobody finds them** — which is what kills corner-stuffing.

No accounts. Nickname plus a 4-letter lobby code; nothing is persisted past the last
player leaving. Rejoining with the same nickname reclaims your seat and score.

## Run it

```bash
npm install
npm run dev          # Vite on :5173, game server on :8787 (Vite proxies /ws)
```

Production: `npm run build && npm start` — the server hosts `dist/` and the websocket
on one port, so it deploys as a single container.

```bash
npm test             # 16 unit tests over the generator and the scoring rules
npm run test:e2e     # headless two-player round against a running server
```

## How it works

**Scenes are a function of a seed.** `backend/crowd-scene.ts` builds the whole crowd from one
integer with a seeded PRNG (`backend/seeded-random.ts`) — no `Math.random` anywhere in generation,
or clients would desync. A round is therefore a ~40-byte payload, not an image, and
scenes are unlimited.

The answer ends up client-side as a result. That was deliberate: this is a party game,
so a devtools peek is a social problem, not an exploitable one. **The server still
generates the scene itself and validates every click** against its own target
coordinate, so nothing is trusted from the client.

**Sprites are drawn in code** (`components/draw-sprites.ts`) as layered parts — legs, torso,
arms, head, hair, hat, accessory — each palette-swapped, built from rounded capsules,
arcs and clipped gradients (flat 2D vector, not pixel art) over a repeating paper-grain
ground tile. There are no image assets. That
is what makes the difficulty dial possible: a *decoy* is a person who copies Waldo's
red/white stripe **or** his bobble hat, never both. Decoy share ramps 5% → 40% across a
game, and difficulty picks where that ramp starts. Raw crowd size alone just makes a
round tedious; near-misses make it hard.

**The world is pannable but fair.** The world is ~3.5 screenfuls, and the *visible world
area* is fixed and letterboxed into the window — a 32" monitor sees exactly as much crowd
as a 13" laptop. Panning is the skill; screen size is not an advantage. Drag, WASD or the
arrow keys; the minimap shows where you are and never shows the target.

**Wrong clicks cost 2 seconds of cooldown, not points.** Without that, the optimal
strategy is to spam-click the screen. A cooldown punishes spam without taxing an honest
guess.

**Hide mode placement is validated** (`validatePlacement`): screen edges, empty ground,
behind-scenery and buried-under-three-people spots are all rejected. The hider's skill is
picking a *clever* spot, not an unfindable one.

## Hosting

It needs a host that runs a **persistent Node process**. Vercel, Netlify and GitHub
Pages will not work: the websocket server holds every lobby in memory, so there is no
serverless or static deployment of this.

For the same reason it runs as **exactly one instance**. Two replicas behind a load
balancer means two players can land on different machines and never see each other --
no amount of sticky sessions fixes a lobby that only exists in one process's heap.
Scaling past one box needs Redis or similar behind the lobby map first.

Easiest path (Railway / Render / Fly.io / any VPS):

```
build:  npm ci && npm run build
start:  npm start
port:   $PORT (the server reads it; defaults to 8787)
```

`deployment/cloud/Dockerfile` does exactly that (`docker build -f deployment/cloud/Dockerfile .`), so any container host works too.
`/health` returns 200 for health checks. Node **22.18 or newer** is required -- the
server runs TypeScript directly through native type stripping, with no build step.

Nothing is persisted, so there is no database to provision and a restart simply drops
every in-flight lobby.

## Layout

| path | what |
| --- | --- |
| `backend/seeded-random.ts`, `crowd-scene.ts`, `game-rules.ts`, `message-types.ts` | seeded RNG, scene generator, scoring rules, wire protocol — imported by **both** server and client |
| `backend/game-lobby.ts` | authoritative lobby state machine: rounds, clock, click validation, host migration |
| `backend/routes/game-socket.ts` | websocket doorway at `/ws`: parses client messages, drives lobbies |
| `backend/start-server.ts` | boots http server, static hosting of `dist/`, attaches `/ws` |
| `frontend/pages/` | home, lobby room |
| `frontend/components/` | canvas playfield, round clock, target card, websocket client, procedural sprites, sound |

## Known edges

- Mid-game joiners play from the current round; they are not held until the next one.
- A hider who disconnects mid-round voids that round (no scores, fresh seed) rather than
  letting an unfindable round run out the clock.
- Phone play works but is untuned — a phone sees far less crowd per glance, so mixing
  phones and laptops in one lobby is unbalanced. Desktop-first by design.
