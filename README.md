# 3D Toy Box + Render Studio

One repo, one server, two galleries.

```
src/features/toy-box/            Three.js toys + party games (gallery at /3d-toys/); common/ shared browser modules
src/features/multiplayer-rooms/  room relay websocket, toy-only server, load test
src/features/studio-server/      one-port server + gallery asset list (gallery at /)
src/features/demo-gallery/       one-prompt frontier-model demos
src/features/demo-capture/       Playwright posters, clips, Instagram reels
src/features/blender-scenes/     Blender scripts
src/features/remotion-promos/    Remotion promo video (own package)
src/features/texture-generator/  Python texture maker
src/features/instagram-posts/    Instagram reels + captions (gitignored)
src/media/                       rendered media served at /media/
```

## Run

```sh
npm run setup   # first time: installs deps
npm start       # http://localhost:5066/  studio, /3d-toys/ toys, /3d-toys/rooms multiplayer relay
npm run toys    # toy box alone on http://localhost:5055/3d-toys/
npm test        # toy engine tests
npm run room-test  # every multiplayer game with 14 real browser tabs over a lagged relay (Playwright, local only)
npm run capture # studio posters + QA (Playwright, local only)
```

Offline media tools (local only, outputs are committed to `src/media/`):

- Blender: `/Applications/Blender.app/Contents/MacOS/Blender -b -P src/features/blender-scenes/<script>.py`
- Remotion: `npm run render --prefix src/features/remotion-promos`
- Textures: `src/features/texture-generator/.venv/bin/python src/features/texture-generator/make-textures.py`

## Deploy

Render Blueprint from root `render.yaml`: one free web service serves both galleries plus the room relay. Details in [src/features/toy-box/README.md](src/features/toy-box/README.md).
