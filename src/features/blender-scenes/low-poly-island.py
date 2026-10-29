"""
FILE: render-studio/blender-scenes/low-poly-island.py
PURPOSE: headless Blender scene: procedural low-poly island (noise terrain, height colours, trees, rocks, lighthouse, clouds, faceted water); Cycles still, EEVEE turntable mp4, GLB export; writes notes.json entries
UI: Render Studio > Blender Renders + 3D Models tabs
USED BY: run by hand: /Applications/Blender.app/Contents/MacOS/Blender -b -P blender-scenes/low-poly-island.py [-- --quick | --glb-only]
KEY EXPORTS: none (script)
"""
import json
import math
import random
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import bmesh
import bpy
from mathutils import Matrix, Vector, noise

ROOT = Path(__file__).resolve().parent.parent
RENDERS, MODELS = ROOT / "media" / "blender-renders", ROOT / "media" / "models"
QUICK = "--quick" in sys.argv  # low samples + 24 frames for iteration
GLB_ONLY = "--glb-only" in sys.argv  # re-export model without re-rendering
RNG = random.Random(7)
GRID, SIZE, WATER = 84, 26.0, 0.0


def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def lin(c):  # sRGB to linear for Principled inputs
    return tuple(((x + 0.055) / 1.055) ** 2.4 if x > 0.04045 else x / 12.92 for x in c)


def material(name, srgb, roughness=0.8, emit=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = (*lin(srgb), 1)
    p.inputs["Roughness"].default_value = roughness
    if emit:
        p.inputs["Emission Color"].default_value = (*lin(srgb), 1)
        p.inputs["Emission Strength"].default_value = emit
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
    return m


def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0)))
    return t * t * (3 - 2 * t)


def fbm(x, y, octaves=5, off=0.0):
    s, a, f, norm = 0.0, 1.0, 1.0, 0.0
    for i in range(octaves):
        s += a * noise.noise(Vector((x * f + off, y * f + off * 1.7, 0.37 * i)))
        norm += a
        a *= 0.5
        f *= 2
    return s / norm


# Terrain > height: noisy coast mask, rolling hills, one off-centre peak
def height(x, y):
    r = math.hypot(x, y) / 9.0
    d = r + 0.32 * fbm(x * 0.09, y * 0.09, 3, 11.7)
    m = smooth(1.05, 0.3, d)
    n = fbm(x * 0.17, y * 0.17, 5, 3.1)
    peak = math.exp(-((x + 1.6) ** 2 + (y - 1.8) ** 2) / 7.5)
    return -1.5 + m * (1.95 + 1.5 * n) + m * m * peak * 3.9


# Terrain > face colour by height + slope, small jitter so flat faces read as facets
def terrain_colour(h, nz):
    if h < -0.22:
        # fade sand into seabed teal with depth so the grid edge vanishes
        t = smooth(-0.22, -1.3, h)
        c = tuple(a + (b - a) * t for a, b in zip((0.86, 0.78, 0.55), (0.16, 0.36, 0.42)))
    elif h < 0.28:
        c = (0.95, 0.84, 0.58)
    elif nz < 0.6 and h > 0.9:
        c = (0.52, 0.48, 0.45)
    elif h < 1.5:
        c = (0.44, 0.7, 0.27)
    elif h < 2.8:
        c = (0.27, 0.53, 0.22)
    elif h < 3.7:
        c = (0.5, 0.47, 0.44)
    else:
        c = (0.96, 0.97, 0.99)
    j = RNG.uniform(-0.035, 0.035)
    return tuple(max(0, min(1, v + j)) for v in c)


def build_terrain():
    step = SIZE / GRID
    verts, idx = [], {}
    for j in range(GRID + 1):
        for i in range(GRID + 1):
            x, y = -SIZE / 2 + i * step, -SIZE / 2 + j * step
            # jitter interior verts so the triangle grid doesn't read as a grid
            if 0 < i < GRID and 0 < j < GRID:
                x += RNG.uniform(-0.32, 0.32) * step
                y += RNG.uniform(-0.32, 0.32) * step
            idx[i, j] = len(verts)
            verts.append((x, y, height(x, y)))
    faces = []
    for j in range(GRID):
        for i in range(GRID):
            a, b, c, d = idx[i, j], idx[i + 1, j], idx[i + 1, j + 1], idx[i, j + 1]
            faces += [(a, b, c), (a, c, d)] if (i + j) % 2 else [(a, b, d), (b, c, d)]
    me = bpy.data.meshes.new("island")
    me.from_pydata(verts, [], faces)
    me.update()
    col = me.color_attributes.new("Col", "BYTE_COLOR", "CORNER")
    for poly in me.polygons:
        h = sum(me.vertices[v].co.z for v in poly.vertices) / 3
        c = terrain_colour(h, poly.normal.z)
        for li in poly.loop_indices:
            col.data[li].color_srgb = (*c, 1)
    m = bpy.data.materials.new("terrain")
    m.use_nodes = True
    nt = m.node_tree
    attr = nt.nodes.new("ShaderNodeVertexColor")
    attr.layer_name = "Col"
    p = nt.nodes["Principled BSDF"]
    p.inputs["Roughness"].default_value = 0.9
    nt.links.new(attr.outputs["Color"], p.inputs["Base Color"])
    me.materials.append(m)
    ob = bpy.data.objects.new("island", me)
    bpy.context.collection.objects.link(ob)
    return ob, me


# Water > subdivided plane, noise-displaced verts, flat facets catch sun glints
def build_water():
    me = bpy.data.meshes.new("water")
    bm = bmesh.new()
    bmesh.ops.create_grid(bm, x_segments=150, y_segments=150, size=60)
    for v in bm.verts:
        v.co.x += RNG.uniform(-0.25, 0.25)
        v.co.y += RNG.uniform(-0.25, 0.25)
        v.co.z = WATER + 0.07 * noise.noise(Vector((v.co.x * 0.6, v.co.y * 0.6, 4.2)))
    bmesh.ops.triangulate(bm, faces=bm.faces[:])
    bm.to_mesh(me)
    bm.free()
    m = material("water", (0.1, 0.55, 0.72), roughness=0.12, alpha=0.62)
    if hasattr(m, "surface_render_method"):
        m.surface_render_method = "BLENDED"
    me.materials.append(m)
    ob = bpy.data.objects.new("water", me)
    bpy.context.collection.objects.link(ob)
    # Seabed > big plane so deep water beyond the grid isn't a void
    bpy.ops.mesh.primitive_plane_add(size=400, location=(0, 0, -1.5))
    bpy.context.active_object.data.materials.append(material("seabed", (0.16, 0.36, 0.42), 1.0))
    return ob


PROP_MATS = [("trunk", (0.4, 0.25, 0.14), 0.9, 0), ("pine", (0.13, 0.4, 0.24), 0.8, 0), ("pine-light", (0.2, 0.5, 0.26), 0.8, 0),
             ("leafy", (0.45, 0.68, 0.22), 0.8, 0), ("rock", (0.55, 0.53, 0.5), 0.85, 0), ("paint-white", (0.93, 0.92, 0.88), 0.5, 0),
             ("paint-red", (0.78, 0.14, 0.11), 0.5, 0), ("lamp", (1.0, 0.85, 0.45), 0.3, 8), ("cloud", (1.0, 1.0, 1.0), 1.0, 0)]
MAT = {name: i for i, (name, *_rest) in enumerate(PROP_MATS)}


def tag(bm, verts, mat):
    for f in {f for v in verts for f in v.link_faces}:
        f.material_index = MAT[mat]


def cone(bm, base, r1, r2, depth, mat, segs=6, rot=0.0):
    mx = Matrix.Translation(base + Vector((0, 0, depth / 2))) @ Matrix.Rotation(rot, 4, "Z")
    res = bmesh.ops.create_cone(bm, cap_ends=True, segments=segs, radius1=r1, radius2=r2, depth=depth, matrix=mx)
    tag(bm, res["verts"], mat)


def blob(bm, centre, radius, scale, mat, jitter=0.0):
    res = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=radius, matrix=Matrix.Translation(centre))
    for v in res["verts"]:
        off = v.co - centre
        off = Vector((off.x * scale[0], off.y * scale[1], off.z * scale[2]))
        v.co = centre + off * (1 + RNG.uniform(-jitter, jitter))
    tag(bm, res["verts"], mat)


# Props > lighthouse, trees, rocks, clouds in one mesh (one draw, one GLB node)
def build_props(terrain_me):
    centres = [(sum((terrain_me.vertices[v].co for v in p.vertices), Vector()) / 3, p.normal.z) for p in terrain_me.polygons]
    bm = bmesh.new()
    # lighthouse on the coastal face nearest the camera (+x, -y)
    coast = [c for c, nz in centres if 0.35 < c.z < 0.9 and nz > 0.9]
    lh = max(coast, key=lambda c: (c.x - c.y) - 0.6 * abs(c.x + c.y))
    base, r = lh - Vector((0, 0, 0.1)), 0.34
    for k in range(5):
        cone(bm, base + Vector((0, 0, k * 0.42)), r - k * 0.025, r - (k + 1) * 0.025, 0.42, "paint-red" if k % 2 else "paint-white", segs=10)
    top = base + Vector((0, 0, 2.1))
    cone(bm, top, 0.2, 0.2, 0.28, "lamp", segs=10)
    cone(bm, top + Vector((0, 0, 0.28)), 0.3, 0.0, 0.34, "paint-red", segs=10)
    cone(bm, top - Vector((0, 0, 0.04)), 0.36, 0.36, 0.06, "paint-white", segs=10)
    # trees: pines up high, round trees low, never on steep faces or next to the lighthouse
    spots = [c for c, nz in centres if 0.35 < c.z < 2.9 and nz > 0.8 and (c - lh).length > 1.4]
    RNG.shuffle(spots)
    placed = []
    for c in spots:
        if len(placed) >= 95:
            break
        if any((c - p).length < 0.75 for p in placed):
            continue
        placed.append(c)
        s = RNG.uniform(0.7, 1.25)
        g = c - Vector((0, 0, 0.05))
        rot = RNG.uniform(0, math.tau)
        if c.z > 1.3 or RNG.random() < 0.35:
            cone(bm, g, 0.08 * s, 0.06 * s, 0.35 * s, "trunk", 5, rot)
            leaf = "pine" if RNG.random() < 0.6 else "pine-light"
            cone(bm, g + Vector((0, 0, 0.25 * s)), 0.46 * s, 0.0, 0.85 * s, leaf, 6, rot)
            cone(bm, g + Vector((0, 0, 0.62 * s)), 0.33 * s, 0.0, 0.65 * s, leaf, 6, rot)
        else:
            cone(bm, g, 0.08 * s, 0.06 * s, 0.5 * s, "trunk", 5, rot)
            blob(bm, g + Vector((0, 0, 0.78 * s)), 0.42 * s, (1, 1, 0.85), "leafy", 0.12)
    # rocks: shoreline, slopes, a few poking out of the shallows
    rocks = [c for c, nz in centres if -0.6 < c.z < 3.2 and (c - lh).length > 1.0 and all((c - p).length > 0.6 for p in placed)]
    for c in RNG.sample(rocks, 34):
        s = RNG.uniform(0.18, 0.5)
        blob(bm, c + Vector((0, 0, s * 0.1)), s, (RNG.uniform(0.8, 1.3), RNG.uniform(0.8, 1.3), 0.6), "rock", 0.2)
    # clouds: ring around the island, kept out of the camera's line of sight
    for k in range(7):
        a = math.radians(-45 + 75 + k * 40)
        rad = RNG.uniform(7, 11)
        cpos = Vector((math.cos(a) * rad, math.sin(a) * rad, RNG.uniform(6.5, 8.5)))
        for _ in range(RNG.randint(3, 5)):
            blob(bm, cpos + Vector((RNG.uniform(-1.2, 1.2), RNG.uniform(-0.5, 0.5), RNG.uniform(-0.15, 0.2))), RNG.uniform(0.6, 1.05), (1.2, 1, 0.62), "cloud", 0.1)
    me = bpy.data.meshes.new("props")
    bm.to_mesh(me)
    bm.free()
    for name, c, rough, emit in PROP_MATS:
        me.materials.append(material(name, c, rough, emit))
    ob = bpy.data.objects.new("props", me)
    bpy.context.collection.objects.link(ob)
    return ob


def build_scene(scene):
    island, me = build_terrain()
    water = build_water()
    props = build_props(me)
    # Lights > warm low sun from camera-left, sky dome fill
    bpy.ops.object.light_add(type="SUN")
    sun = bpy.context.active_object
    sun.rotation_euler = (-Vector((-1.0, -0.25, 0.85))).to_track_quat("-Z", "Y").to_euler()
    sun.data.energy, sun.data.angle, sun.data.color = 3.6, math.radians(2.5), (1.0, 0.93, 0.82)
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (*lin((0.62, 0.8, 0.98)), 1)
    world.node_tree.nodes["Background"].inputs["Strength"].default_value = 1.0
    scene.world = world
    # Camera > high three-quarter diorama view
    bpy.ops.object.camera_add(location=(14.2, -14.2, 12.0))
    cam = bpy.context.active_object
    cam.data.lens = 44
    cam.rotation_euler = (Vector((0, 0.9, 0.5)) - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    return [island, water, props], cam


def use_gpu(scene):
    scene.cycles.device = "GPU"
    try:
        prefs = bpy.context.preferences.addons["cycles"].preferences
        prefs.compute_device_type = "METAL"
        prefs.get_devices()
        for d in prefs.devices:
            d.use = True
    except Exception as e:  # CPU fallback still renders, just slower
        print("GPU setup failed, using CPU:", e)
        scene.cycles.device = "CPU"


def eevee_id():
    ids = [e.identifier for e in bpy.types.RenderSettings.bl_rna.properties["engine"].enum_items]
    return "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in ids else "BLENDER_EEVEE"


def write_notes(folder, entries):
    path = folder / "notes.json"
    notes = json.loads(path.read_text()) if path.exists() else {}
    notes.update(entries)
    path.write_text(json.dumps(notes, indent=2) + "\n")


# Render > Cycles still, then EEVEE turntable: camera orbits on an empty, frames to PNG then ffmpeg
def render(scene, cam):
    scene.render.engine = "CYCLES"
    use_gpu(scene)
    scene.cycles.samples = 32 if QUICK else 192
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = (960, 540) if QUICK else (1920, 1080)
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(RENDERS / "low-poly-island.png")
    bpy.ops.render.render(write_still=True)
    print("wrote low-poly-island.png")

    frames = 24 if QUICK else 180
    bpy.ops.object.empty_add(location=(0, 0, 0))
    pivot = bpy.context.active_object
    cam.parent = pivot
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
    pivot.rotation_euler.z = 0
    pivot.keyframe_insert("rotation_euler", index=2, frame=1)
    pivot.rotation_euler.z = math.radians(360)
    pivot.keyframe_insert("rotation_euler", index=2, frame=frames + 1)
    scene.render.engine = eevee_id()
    scene.frame_start, scene.frame_end = 1, frames
    scene.render.fps = 30
    scene.render.resolution_x, scene.render.resolution_y = (640, 360) if QUICK else (1280, 720)
    tmp = Path(tempfile.mkdtemp(prefix="island-"))
    scene.render.filepath = str(tmp / "f-")
    bpy.ops.render.render(animation=True)
    mp4 = RENDERS / "low-poly-island-turntable.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", str(tmp / "f-%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", str(mp4)], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print("wrote low-poly-island-turntable.mp4")



def main():
    RENDERS.mkdir(parents=True, exist_ok=True)
    MODELS.mkdir(parents=True, exist_ok=True)
    scene = reset()
    objects, cam = build_scene(scene)
    scene.view_settings.view_transform = "AgX"

    if not GLB_ONLY:
        render(scene, cam)

    # Export > GLB: island, props, water shrunk to a tile matching the terrain so viewers frame the island
    # uniform scale keeps wave slopes gentle, else facets glint as white speckle
    objects[1].scale = (0.24, 0.24, 0.24)
    bpy.ops.object.select_all(action="DESELECT")
    for ob in objects:
        ob.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.export_scene.gltf(filepath=str(MODELS / "low-poly-island.glb"), export_format="GLB", use_selection=True)
    print("wrote low-poly-island.glb")

    write_notes(RENDERS, {
        "low-poly-island.png": {"title": "Low-Poly Island", "about": "Procedural diorama from one headless Blender script: fBm terrain with a noisy coast mask, per-face colours by height and slope, faceted translucent water, trees, rocks, a lighthouse and clouds, rendered in Cycles.",
                                "prompt": "Write a Blender Python script that generates a low-poly island from noise: jittered triangle grid, falloff mask for the coast, flat-shaded faces coloured by height and slope (sand, grass, forest, rock, snow), faceted see-through water, scattered low-poly trees and rocks, a striped lighthouse and puffy clouds. Render a three-quarter view in Cycles."},
        "low-poly-island-turntable.mp4": {"title": "Island Turntable", "about": "Six-second EEVEE orbit of the same island: camera on a keyframed empty, frames rendered headless and stitched with ffmpeg.",
                                          "prompt": "Add a 180-frame EEVEE turntable of the island to the script and encode it to MP4 with ffmpeg."},
    })
    write_notes(MODELS, {"low-poly-island.glb": {"title": "Low-Poly Island (GLB)", "about": "The generated island as glTF binary: terrain with vertex colours, props mesh with flat materials and a translucent water tile. Orbit it in the viewer.",
                                                 "prompt": "Export the procedural low-poly island from Blender as one GLB with vertex colours and materials, ready for three.js."}})


main()
