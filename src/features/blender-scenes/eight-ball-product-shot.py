# Renders procedural 8-ball scene and exports still, turntable, and GLB assets.

import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
RENDERS, MODELS = ROOT / "media" / "blender-renders", ROOT / "media" / "models"
QUICK = "--quick" in sys.argv  # low samples + 24 frames for iteration


# Scene > reset to an empty file
def reset():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    return bpy.context.scene


def principled(name, **inputs):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes["Principled BSDF"]
    for k, v in inputs.items():
        if k in p.inputs:
            p.inputs[k].default_value = v
    return m, p


# Texture > equirect decal: white disc + "8" drawn as two stroked rings, anti-aliased
def ball_texture(w=2048, h=1024, base=(0.012, 0.012, 0.014), number=True, stripe=None):
    u = (np.arange(w) + 0.5) / w
    v = (np.arange(h) + 0.5) / h
    lon, lat = np.meshgrid((u - 0.5) * 2 * np.pi, (v - 0.5) * np.pi)
    d = np.stack([np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat)], -1)
    D = np.array([0.0, -math.cos(math.radians(14)), math.sin(math.radians(14))])
    T1 = np.cross([0, 0, 1], D)
    T1 /= np.linalg.norm(T1)
    T2 = np.cross(T1, D)
    if T2[2] < 0:
        T2 = -T2
    facing = d @ D
    px, py = d @ T1, d @ T2
    aa = 2.5 / w * 2 * np.pi
    def fill(dist):  # 1 inside, smooth edge
        return np.clip(0.5 - dist / aa, 0, 1)
    col = np.ones((h, w, 3)) * np.array(base)
    if stripe is not None:
        band = fill(np.abs(lat) - 0.42)
        col = col * (1 - band[..., None]) + np.array(stripe) * band[..., None]
    disc = fill(np.hypot(px, py) - 0.39) * (facing > 0)
    col = col * (1 - disc[..., None]) + np.array([0.92, 0.9, 0.86]) * disc[..., None]
    if number:
        ring = lambda cx, cy, r, t: fill(np.abs(np.hypot(px - cx, py - cy) - r) - t)
        ink = np.maximum(ring(0, 0.088, 0.072, 0.026), ring(0, -0.092, 0.088, 0.028)) * (facing > 0)
        col = col * (1 - ink[..., None]) + np.array([0.01, 0.01, 0.012]) * ink[..., None]
    rgba = np.concatenate([col, np.ones((h, w, 1))], -1).astype(np.float32)
    img = bpy.data.images.new("ball-decal", w, h, alpha=False)
    img.pixels.foreach_set(rgba.ravel())
    img.pack()
    return img


# Geometry > smooth sphere with our own equirect UVs (matches ball_texture mapping exactly)
def ball(name, loc, img, roughness=0.06):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=160, ring_count=80, radius=1, location=loc)
    ob = bpy.context.active_object
    ob.name = name
    bpy.ops.object.shade_smooth()
    me = ob.data
    uv = me.uv_layers.active.data
    for poly in me.polygons:
        us = []
        for li in poly.loop_indices:
            co = me.vertices[me.loops[li].vertex_index].co.normalized()
            us.append([math.atan2(co.y, co.x) / (2 * math.pi) + 0.5, math.asin(max(-1, min(1, co.z))) / math.pi + 0.5])
        # keep a face from wrapping across the u seam
        if max(x[0] for x in us) - min(x[0] for x in us) > 0.5:
            us = [[x[0] + 1 if x[0] < 0.5 else x[0], x[1]] for x in us]
        for li, val in zip(poly.loop_indices, us):
            uv[li].uv = val
    m, p = principled(name + "-mat", Roughness=roughness, **{"Coat Weight": 1.0, "Coat Roughness": 0.03, "Specular IOR Level": 0.6})
    tex = m.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image = img
    m.node_tree.links.new(tex.outputs["Color"], p.inputs["Base Color"])
    ob.data.materials.append(m)
    return ob


def build_scene(scene):
    eight = ball("eight-ball", (0, 0, 0), ball_texture())
    eight.rotation_euler.z = math.radians(-8)
    ball("cue-ball", (-2.7, 3.6, 0), ball_texture(base=(0.9, 0.88, 0.84), number=False), 0.08)
    ball("eleven-ball", (2.4, 5.8, 0), ball_texture(base=(0.9, 0.88, 0.84), number=False, stripe=(0.55, 0.05, 0.03)), 0.08)
    # Felt > green cloth with sheen + fine noise bump
    bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 0, -1))
    felt = bpy.context.active_object
    m, p = principled("felt", **{"Base Color": (0.01, 0.13, 0.05, 1), "Roughness": 0.95, "Sheen Weight": 0.25, "Sheen Roughness": 0.5})
    nt = m.node_tree
    noise = nt.nodes.new("ShaderNodeTexNoise")
    noise.inputs["Scale"].default_value = 900
    bump = nt.nodes.new("ShaderNodeBump")
    bump.inputs["Strength"].default_value = 0.12
    nt.links.new(noise.outputs["Fac"], bump.inputs["Height"])
    nt.links.new(bump.outputs["Normal"], p.inputs["Normal"])
    felt.data.materials.append(m)
    # Rail > cushion + walnut rail far behind for depth
    bpy.ops.mesh.primitive_cube_add(location=(0, 11, -0.4), scale=(30, 0.9, 0.6))
    rail = bpy.context.active_object
    bev = rail.modifiers.new("bevel", "BEVEL")
    bev.width, bev.segments = 0.25, 4
    wm, wp = principled("walnut", Roughness=0.35, **{"Coat Weight": 0.6})
    wave = wm.node_tree.nodes.new("ShaderNodeTexWave")
    wave.inputs["Scale"].default_value = 1.2
    wave.inputs["Distortion"].default_value = 9
    ramp = wm.node_tree.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.05, 0.02, 0.008, 1)
    ramp.color_ramp.elements[1].color = (0.2, 0.08, 0.03, 1)
    wm.node_tree.links.new(wave.outputs["Fac"], ramp.inputs["Fac"])
    wm.node_tree.links.new(ramp.outputs["Color"], wp.inputs["Base Color"])
    rail.data.materials.append(wm)
    # Lights > big warm table lamp, cool rim, faint fill
    bpy.ops.object.light_add(type="AREA", location=(0.5, -1.0, 9))
    lamp = bpy.context.active_object
    lamp.data.size, lamp.data.energy, lamp.data.color = 7, 2600, (1.0, 0.86, 0.68)
    bpy.ops.object.light_add(type="AREA", location=(-5, 7, 2.5), rotation=(math.radians(70), 0, math.radians(215)))
    rim = bpy.context.active_object
    rim.data.size, rim.data.energy, rim.data.color = 3, 900, (0.6, 0.75, 1.0)
    bpy.ops.object.light_add(type="AREA", location=(4, -6, 1.5), rotation=(math.radians(80), 0, math.radians(35)))
    fill = bpy.context.active_object
    fill.data.size, fill.data.energy = 4, 140
    world = bpy.data.worlds.new("world")
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.004, 0.004, 0.006, 1)
    scene.world = world
    # Camera > low 85 mm hero angle, shallow focus on the 8
    bpy.ops.object.camera_add(location=(1.4, -7.6, 1.15))
    cam = bpy.context.active_object
    cam.data.lens = 85
    cam.data.dof.use_dof = True
    cam.data.dof.focus_object = eight
    cam.data.dof.aperture_fstop = 1.2
    target = Vector((0.15, 0, 0.05))
    cam.rotation_euler = (target - cam.location).to_track_quat("-Z", "Y").to_euler()
    scene.camera = cam
    return eight, cam


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


def main():
    RENDERS.mkdir(parents=True, exist_ok=True)
    MODELS.mkdir(parents=True, exist_ok=True)
    scene = reset()
    eight, cam = build_scene(scene)
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - Punchy" if "AgX - Punchy" in [i.identifier for i in scene.view_settings.bl_rna.properties["look"].enum_items] else "None"

    # Render > Cycles hero still
    scene.render.engine = "CYCLES"
    use_gpu(scene)
    scene.cycles.samples = 48 if QUICK else 256
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = (960, 540) if QUICK else (1920, 1080)
    scene.render.image_settings.file_format = "PNG"
    scene.render.filepath = str(RENDERS / "eight-ball-product-shot.png")
    bpy.ops.render.render(write_still=True)
    print("wrote eight-ball-product-shot.png")

    # Render > EEVEE turntable: camera orbits on an empty, frames to PNG then ffmpeg
    frames = 24 if QUICK else 120
    bpy.ops.object.empty_add(location=(0, 0, 0))
    pivot = bpy.context.active_object
    cam.parent = pivot
    # linear keys for a seamless loop (fcurve API moved in Blender 5, preference works everywhere)
    bpy.context.preferences.edit.keyframe_new_interpolation_type = "LINEAR"
    pivot.rotation_euler.z = 0
    pivot.keyframe_insert("rotation_euler", index=2, frame=1)
    pivot.rotation_euler.z = math.radians(360)
    pivot.keyframe_insert("rotation_euler", index=2, frame=frames + 1)
    cam.data.dof.aperture_fstop = 2.4
    scene.render.engine = eevee_id()
    scene.frame_start, scene.frame_end = 1, frames
    scene.render.fps = 30
    scene.render.resolution_x, scene.render.resolution_y = (640, 360) if QUICK else (1280, 720)
    tmp = Path(tempfile.mkdtemp(prefix="turntable-"))
    scene.render.filepath = str(tmp / "f-")
    bpy.ops.render.render(animation=True)
    mp4 = RENDERS / "eight-ball-turntable.mp4"
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-framerate", "30", "-i", str(tmp / "f-%04d.png"), "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-movflags", "+faststart", str(mp4)], check=True)
    shutil.rmtree(tmp, ignore_errors=True)
    print("wrote eight-ball-turntable.mp4")

    # Export > GLB of the 8-ball alone (decal texture embedded)
    bpy.ops.object.select_all(action="DESELECT")
    eight.select_set(True)
    bpy.context.view_layer.objects.active = eight
    eight.location = (0, 0, 0)
    bpy.ops.export_scene.gltf(filepath=str(MODELS / "eight-ball.glb"), export_format="GLB", use_selection=True)
    print("wrote eight-ball.glb")

    write_notes(RENDERS, {
        "eight-ball-product-shot.png": {"title": "8-Ball Product Shot", "about": "Cycles hero still built entirely by a headless Python script: procedural equirect decal for the 8, clear-coated resin, felt with sheen and micro bump, walnut rail, area-light studio and 85 mm shallow depth of field.",
                                        "prompt": "Write a Blender Python script that builds a pool-table product shot of an 8-ball from scratch: generate the white disc and 8 as a texture with numpy, clear-coat resin material, green felt with sheen, two out-of-focus balls behind, warm overhead area light, 85 mm camera with shallow DOF, and render with Cycles."},
        "eight-ball-turntable.mp4": {"title": "8-Ball Turntable", "about": "The same scene as a 4-second EEVEE turntable: the camera orbits on a keyframed empty, frames render headless and ffmpeg stitches them into H.264.",
                                     "prompt": "Extend the Blender script with a 120-frame EEVEE turntable: parent the camera to an empty, keyframe a linear 360 degree spin, render PNG frames headless and encode them to MP4 with ffmpeg."},
    })
    write_notes(MODELS, {"eight-ball.glb": {"title": "8-Ball (GLB)", "about": "glTF binary exported from the Blender script: 160-segment sphere with custom equirect UVs and the generated decal texture embedded. Orbit it in the viewer.",
                                            "prompt": "Export the procedurally textured 8-ball from Blender as a single GLB with its texture embedded, ready for three.js or model-viewer."}})


main()
