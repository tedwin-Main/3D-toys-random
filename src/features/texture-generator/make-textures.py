"""
FILE: src/features/texture-generator/make-textures.py
PURPOSE: procedural texture pack with numpy + Pillow (seamless marble, stained-glass voronoi, terrain heightmap + shaded relief, pixel spaceship sprite sheet); writes PNGs + notes.json
UI: Render Studio > Images tab
USED BY: run by hand: python-textures/.venv/bin/python python-textures/make-textures.py
KEY EXPORTS: none (script)
"""
import colorsys
import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

OUT = Path(__file__).resolve().parents[2] / "media" / "images"
rng = np.random.default_rng(8)


# Noise: tileable Perlin gradient noise, vectorised
def perlin(shape, res, seed):
    r = np.random.default_rng(seed)
    d = (shape[0] // res[0], shape[1] // res[1])
    grid = np.mgrid[0 : res[0] : res[0] / shape[0], 0 : res[1] : res[1] / shape[1]].transpose(1, 2, 0) % 1
    ang = 2 * np.pi * r.random((res[0] + 1, res[1] + 1))
    g = np.dstack((np.cos(ang), np.sin(ang)))
    # wrap last row/col onto first so the texture tiles
    g[-1, :] = g[0, :]
    g[:, -1] = g[:, 0]
    g = g.repeat(d[0], 0).repeat(d[1], 1)
    g00, g10, g01, g11 = g[:-d[0], :-d[1]], g[d[0]:, :-d[1]], g[:-d[0], d[1]:], g[d[0]:, d[1]:]
    n00 = np.sum(np.dstack((grid[:, :, 0], grid[:, :, 1])) * g00, 2)
    n10 = np.sum(np.dstack((grid[:, :, 0] - 1, grid[:, :, 1])) * g10, 2)
    n01 = np.sum(np.dstack((grid[:, :, 0], grid[:, :, 1] - 1)) * g01, 2)
    n11 = np.sum(np.dstack((grid[:, :, 0] - 1, grid[:, :, 1] - 1)) * g11, 2)
    t = 6 * grid**5 - 15 * grid**4 + 10 * grid**3
    n0 = n00 * (1 - t[:, :, 0]) + t[:, :, 0] * n10
    n1 = n01 * (1 - t[:, :, 0]) + t[:, :, 0] * n11
    return np.sqrt(2) * ((1 - t[:, :, 1]) * n0 + t[:, :, 1] * n1)


def fbm(size, base, octaves, seed, gain=0.5):
    out, amp, total = np.zeros((size, size)), 1.0, 0.0
    for o in range(octaves):
        res = base * 2**o
        if res > size // 2:
            break
        out += amp * perlin((size, size), (res, res), seed + o)
        total += amp
        amp *= gain
    return out / total


def ramp(v, stops):
    """Map v in [0,1] through colour stops [(t, (r,g,b)), ...]."""
    ts = np.array([s[0] for s in stops])
    cs = np.array([s[1] for s in stops], dtype=float)
    return np.stack([np.interp(v, ts, cs[:, c]) for c in range(3)], -1)


# Textures > Calacatta-style marble: domain-warped fBm into sharp sine veins
def marble(size=1024):
    y, x = np.mgrid[0:size, 0:size] / size
    # turbulence (sum of |noise|) gives the folded, marbled look; plain fBm reads as contour lines
    turb = sum(np.abs(perlin((size, size), (2 * 2**o, 2 * 2**o), 11 + o)) / 2**o for o in range(6))
    v = np.sin((x * 2 + y) * np.pi * 2 + turb * 3.2)
    a = 1 - np.abs(v)
    veins = a**16 + a**4 * 0.28
    fine = (1 - np.abs(np.sin((x - y * 2) * np.pi * 4 + turb * 6))) ** 70
    cloud = fbm(size, 4, 6, 41) * 0.5 + 0.5
    base = ramp(cloud, [(0, (230, 226, 218)), (0.5, (245, 242, 237)), (1, (224, 219, 210))])
    gold = np.array([181, 146, 96], float)
    grey = np.array([84, 84, 92], float)
    k = np.clip(veins, 0, 1)[..., None] * 0.9
    col = base * (1 - k) + grey * k
    col = col * (1 - fine[..., None] * 0.45) + gold * fine[..., None] * 0.45
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))


# Textures > stained-glass voronoi: F1 shading per cell, dark leading where F2-F1 is small (tileable)
def voronoi(size=1024, n=72):
    pts = rng.random((n, 2)) * size
    hues = rng.random(n)
    f1 = np.full((size, size), 1e9)
    f2 = np.full((size, size), 1e9)
    cid = np.zeros((size, size), int)
    y, x = np.mgrid[0:size, 0:size].astype(float)
    for i, (px, py) in enumerate(pts):
        for ox in (-size, 0, size):
            for oy in (-size, 0, size):
                d = np.hypot(x - px - ox, y - py - oy)
                closer = d < f1
                f2 = np.where(closer, f1, np.minimum(f2, d))
                cid = np.where(closer, i, cid)
                f1 = np.where(closer, d, f1)
    palette = np.array([colorsys.hsv_to_rgb(0.52 + (h - 0.5) * 0.55 if h < 0.85 else 0.08, 0.75, 0.85) for h in hues]) * 255
    col = palette[cid]
    glow = np.clip(1 - f1 / (size / np.sqrt(n) * 0.75), 0, 1) ** 1.4
    col = col * (0.45 + 0.75 * glow[..., None])
    grain = fbm(size, 16, 3, 5)[..., None] * 18
    edge = np.clip((f2 - f1) / 7, 0, 1) ** 0.8
    lead = np.array([24, 20, 28], float)
    col = (col + grain) * edge[..., None] + lead * (1 - edge[..., None])
    return Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))


# Textures > island terrain: ridged + rolling fBm, radial falloff; 16-bit heightmap + hillshaded relief
def terrain(size=1024):
    y, x = np.mgrid[0:size, 0:size] / size
    rolling = fbm(size, 2, 7, 101)  # base must divide size
    ridged = 1 - np.abs(fbm(size, 4, 6, 202))
    h = rolling * 0.6 + ridged**2 * 0.55
    d = np.hypot(x - 0.5, (y - 0.52) * 1.15) * 2
    # noisy radial mask: irregular coastline without turning the island into a dome
    coast = fbm(size, 4, 5, 303)
    t = np.clip((d + coast * 0.45 - 0.3) / 0.62, 0, 1)
    h = (h + 0.35) * (1 - t * t * (3 - 2 * t))
    h = (h - h.min()) / (h.max() - h.min())
    hm = Image.fromarray((h * 65535).astype(np.uint16))
    # hillshade from the north-west
    gy, gx = np.gradient(h * 220)
    slope = np.pi / 2 - np.arctan(np.hypot(gx, gy))
    aspect = np.arctan2(-gx, gy)
    az, alt = np.radians(315), np.radians(42)
    shade = np.clip(np.sin(alt) * np.sin(slope) + np.cos(alt) * np.cos(slope) * np.cos(az - aspect), 0, 1)
    sea = 0.42
    col = ramp(h, [(0, (14, 42, 78)), (sea - 0.08, (28, 86, 128)), (sea, (64, 150, 168)), (sea + 0.012, (214, 200, 150)), (sea + 0.05, (122, 150, 76)),
                   (0.62, (62, 108, 52)), (0.76, (104, 98, 78)), (0.9, (150, 142, 132)), (0.95, (240, 242, 246)), (1, (255, 255, 255))])
    land = (h > sea)[..., None]
    col = np.where(land, col * (0.45 + 0.75 * shade[..., None]), col * (0.85 + 0.15 * shade[..., None]))
    # contour lines every 0.04 of height on land
    contour = (np.abs(((h - sea) / 0.04) % 1 - 0.5) > 0.47) & land[..., 0]
    col[contour] *= 0.78
    return hm, Image.fromarray(np.clip(col, 0, 255).astype(np.uint8))


# Sprites > Bollinger-style pixel spaceships: mirrored mask, random body, auto outline, row-shaded hue
MASK = np.array([
    [0, 0, 0, 0, 0, 0], [0, 0, 0, 0, 1, 1], [0, 0, 0, 0, 1, -1], [0, 0, 0, 1, 1, -1], [0, 0, 0, 1, 1, -1], [0, 0, 1, 1, 1, -1],
    [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 2, 2], [0, 1, 1, 1, 1, -1], [0, 0, 0, 1, 1, 1], [0, 0, 0, 0, 0, 0],
])


def ship(r):
    half = np.zeros(MASK.shape, int)
    for (yy, xx), m in np.ndenumerate(MASK):
        if m == -1:
            half[yy, xx] = 2
        elif m == 1:
            half[yy, xx] = 1 if r.random() < 0.55 else 0
        elif m == 2:
            half[yy, xx] = 1 if r.random() < 0.5 else 3
    g = np.hstack([half, half[:, ::-1]])
    # border: empty cells touching body become outline
    out = g.copy()
    for (yy, xx), v in np.ndenumerate(g):
        if v == 0:
            nb = [g[a, b] for a, b in ((yy - 1, xx), (yy + 1, xx), (yy, xx - 1), (yy, xx + 1)) if 0 <= a < g.shape[0] and 0 <= b < g.shape[1]]
            if any(n in (1, 3) for n in nb):
                out[yy, xx] = 2
    hue, sat = r.random(), 0.45 + r.random() * 0.4
    img = np.zeros((*out.shape, 4), np.uint8)
    for (yy, xx), v in np.ndenumerate(out):
        if v == 1:
            light = 0.95 - (yy / out.shape[0]) * 0.45 + (0.08 if xx in (5, 6) else 0)
            img[yy, xx] = [*(np.array(colorsys.hsv_to_rgb(hue, sat, light)) * 255).astype(int), 255]
        elif v == 3:
            img[yy, xx] = [*(np.array(colorsys.hsv_to_rgb((hue + 0.5) % 1, 0.35, 1.0)) * 255).astype(int), 255]
        elif v == 2:
            img[yy, xx] = [18, 16, 30, 255]
    return Image.fromarray(img, "RGBA")


def sprite_sheet(cols=8, rows=5, scale=10, cell=128):
    r = np.random.default_rng(1977)
    sheet = Image.new("RGBA", (cols * cell, rows * cell), (10, 12, 26, 255))
    dr = ImageDraw.Draw(sheet)
    for _ in range(260):
        sx, sy = r.integers(0, cols * cell), r.integers(0, rows * cell)
        b = int(r.integers(60, 200))
        dr.point((int(sx), int(sy)), fill=(b, b, min(255, b + 30), 255))
    for i in range(cols * rows):
        s = ship(r).resize((12 * scale, 12 * scale), Image.NEAREST)
        cx, cy = (i % cols) * cell + (cell - s.width) // 2, (i // cols) * cell + (cell - s.height) // 2
        sheet.alpha_composite(s, (cx, cy))
    return sheet


# Output > PNGs + notes.json (merged so other generators' entries survive)
def main():
    OUT.mkdir(parents=True, exist_ok=True)
    jobs = {
        "marble-texture.png": (marble, "Seamless Marble", "Tileable Calacatta-style marble: domain-warped Perlin fBm folded through a sharp sine to make grey veins with fine gold threads. Pure numpy, no image inputs.",
                               "Write a Python script with numpy and Pillow that generates a seamless 1024px marble texture: tileable Perlin fBm, domain warping, sharp sine veins in grey plus thin gold veins on a warm white base."),
        "voronoi-cells.png": (voronoi, "Stained-Glass Voronoi", "72-cell tileable Voronoi diagram computed brute force with F1/F2 distances: each cell glows from its centre and dark leading appears where F2 minus F1 is small, like stained glass.",
                              "Using numpy and Pillow, render a tileable stained-glass Voronoi texture: random points wrapped across tile edges, F1 and F2 distance fields, jewel-tone cells brightened toward their centres and dark leading lines where F2-F1 is small."),
        "spaceship-sprite-sheet.png": (sprite_sheet, "Pixel Spaceship Sprites", "40 procedural pixel spaceships from a mirrored 12x12 mask (Bollinger style): random body cells, automatic outlines, row-shaded hulls and contrasting cockpits, packed into a game-ready sprite sheet.",
                                       "Generate a sprite sheet of 40 unique pixel-art spaceships in Python: use a half mask with always-empty, maybe-body and maybe-cockpit cells, mirror it, outline the body automatically, shade by row with a random hue, and lay them out on an 8x5 grid over a starfield."),
    }
    notes_path = OUT / "notes.json"
    notes = json.loads(notes_path.read_text()) if notes_path.exists() else {}
    for name, (fn, title, about, prompt) in jobs.items():
        fn().save(OUT / name, optimize=True)
        notes[name] = {"title": title, "about": about, "prompt": prompt}
        print("wrote", name)
    hm, relief = terrain()
    hm.save(OUT / "terrain-heightmap.png")
    relief.save(OUT / "terrain-relief.png", optimize=True)
    notes["terrain-heightmap.png"] = {"title": "Island Heightmap (16-bit)", "about": "16-bit greyscale heightmap of a procedural island: rolling plus ridged Perlin fBm with a radial falloff. Drop it into Blender displace, Unity or Unreal terrain.",
                                      "prompt": "With numpy, build a 1024px island heightmap from rolling fBm plus squared ridged noise and a radial falloff, normalise it and save a 16-bit greyscale PNG."}
    notes["terrain-relief.png"] = {"title": "Shaded Relief Map", "about": "The same island rendered as a cartographic relief map: hypsometric colour ramp from deep sea to snow, north-west hillshade from the height gradient, and contour lines on land.",
                                   "prompt": "Turn a heightmap into a shaded relief map in Python: hypsometric colour ramp (deep water, shallows, sand, grass, forest, rock, snow), a hillshade from slope and aspect lit from the north-west, and subtle contour lines."}
    print("wrote terrain-heightmap.png, terrain-relief.png")
    notes_path.write_text(json.dumps(notes, indent=2) + "\n")


if __name__ == "__main__":
    main()
