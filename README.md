# 3D Toy Box + Render Studio

One repo, one server, two galleries.

```
src/features/toy-box/            Three.js toys + party games (gallery at /3d-toys/); common/ shared browser modules
src/features/multiplayer-rooms/  room relay websocket, toy-only server, load + capacity tests
src/features/studio-server/      one-port server + gallery asset list (gallery at /)
src/features/demo-gallery/       one-prompt frontier-model demos
src/features/poster-capture/     Playwright gallery posters + headless QA
src/features/texture-generator/  Python texture maker
src/media/                       posters, stills, models served at /media/
```

## Run

```sh
npm run setup   # first time: installs deps
npm start       # http://localhost:5066/  studio, /3d-toys/ toys, /3d-toys/rooms multiplayer relay
npm run toys    # toy box alone on http://localhost:5055/3d-toys/
npm test        # toy engine, party royale and relay tests
npm run capacity-test  # relay CPU (incl. server-run rounds) / bandwidth / confirm time at 14-32 humans; add `-- 10 1,14,32 fill` for bot-filled rooms
npm run capture # studio posters + QA (Playwright, local only)
```

Offline tools (local only):

- Textures: `src/features/texture-generator/.venv/bin/python src/features/texture-generator/make-textures.py`
- Video, Instagram reels, Remotion promos, Blender turntables: moved to [Instagram_Reels/3d-toys-reels](../Instagram_Reels/3d-toys-reels)

## Deploy

Render Blueprint from root `render.yaml`: one free web service serves both galleries plus the room relay. Details in [src/features/toy-box/README.md](src/features/toy-box/README.md).
