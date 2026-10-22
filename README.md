# 3D Toy Box + Render Studio

One repo, one server, two galleries.

```
3d-toys/          Three.js toys + online multiplayer party games (toy gallery at /3d-toys/)
render-studio/    one-prompt frontier-model demos + Blender / Remotion / Python media (gallery at /)
```

## Run

```sh
npm run setup   # first time: installs both folders (npm workspaces)
npm start       # http://localhost:5066/  studio, /3d-toys/ toys, /3d-toys/rooms multiplayer relay
npm run toys    # toy box alone on http://localhost:5055/3d-toys/
npm test        # toy engine tests
npm run capture # render-studio posters + QA (Playwright, local only)
```

Offline media tools (local only, outputs are committed to `render-studio/media/`):

- Blender: `/Applications/Blender.app/Contents/MacOS/Blender -b -P render-studio/blender-scenes/<script>.py`
- Remotion: `npm run render --prefix render-studio/remotion-promos`
- Textures: `render-studio/python-textures/.venv/bin/python render-studio/python-textures/make-textures.py`

## Deploy

Render Blueprint from root `render.yaml`: one free web service serves both folders plus the room relay. Details in [3d-toys/README.md](3d-toys/README.md).
