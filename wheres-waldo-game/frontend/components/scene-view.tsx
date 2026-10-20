// The playfield: a pannable canvas over a world larger than the screen.
//
// Two modes, set by the host. By default panning is on: the visible WORLD AREA
// is fixed (VIEW_W x VIEW_H) and letterboxed into whatever window you have, so
// a huge monitor shows no extra crowd -- panning is the skill, screen size is
// not an advantage. With panning off the whole world is fitted to the window
// instead: no panning, no zooming, everyone looking at the same picture.

import { useCallback, useEffect, useRef, useState } from 'react';
import { VIEW_H, VIEW_W, WORLD_H, WORLD_W, clampCamera } from '../../backend/scene-geometry.ts';
import { makeTargetLook, type Scene } from '../../backend/crowd-scene.ts';
import { getTheme } from '../../backend/map-themes.ts';
import { drawNightWash, drawPerson, drawProp, drawRoad, getGroundPattern, lampOf } from './draw-sprites.ts';

/** A press that moves more than this many pixels is a pan, not a click. */
const DRAG_SLOP = 5;
const KEY_PAN_SPEED = 900; // world units per second

interface Props {
  scene: Scene;
  /** Hide the target sprite from the draw pass (used while the hider is choosing). */
  hideTarget?: boolean;
  /** Ring drawn around the answer once the round is over. */
  revealAt?: { x: number; y: number } | null;
  /** Ghost sprite following the cursor while placing. */
  placing?: boolean;
  /**
   * Host setting. Off (the default) fits the whole world on screen -- no
   * panning, no zooming, everyone sees exactly the same picture. On restores
   * the fixed viewport you pan around.
   */
  panning?: boolean;
  /** Hard mode only: put people at the windows and behind the counters. */
  occupants?: boolean;
  /** Timestamp the misclick cooldown ends; the countdown rides the cursor. */
  cooldownUntil?: number;
  /** Shared clock tick from App, so the countdown here needs no timer of its own. */
  now?: number;
  disabled?: boolean;
  onPick?: (x: number, y: number) => void;
}

export function SceneView({ scene, hideTarget, revealAt, placing, panning = false, occupants = false, cooldownUntil = 0, now = 0, disabled, onPick }: Props) {
  // With panning off the "viewport" is the whole world, so one fit-to-screen
  // transform replaces the camera entirely.
  const viewW = panning ? VIEW_W : WORLD_W;
  const viewH = panning ? VIEW_H : WORLD_H;
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const camera = useRef({ x: (WORLD_W - VIEW_W) / 2, y: (WORLD_H - VIEW_H) / 2 });
  const keys = useRef(new Set<string>());
  const drag = useRef<{ active: boolean; moved: number; lastX: number; lastY: number }>({
    active: false, moved: 0, lastX: 0, lastY: 0
  });
  const cursor = useRef<{ x: number; y: number } | null>(null);
  // Cursor position in CSS pixels, only tracked while a cooldown is running --
  // the countdown is pinned to the pointer rather than buried in the top bar,
  // where nobody looks mid-hunt.
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);
  const cooling = cooldownUntil > now;
  const miniRef = useRef<HTMLCanvasElement | null>(null);
  const [, forceCamTick] = useState(0);

  /** Canvas pixels -> world units, accounting for the letterbox and scale. */
  const toWorld = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / viewW, rect.height / viewH);
    const offX = (rect.width - viewW * scale) / 2;
    const offY = (rect.height - viewH * scale) / 2;
    const vx = (clientX - rect.left - offX) / scale;
    const vy = (clientY - rect.top - offY) / scale;
    if (vx < 0 || vy < 0 || vx > viewW || vy > viewH) return null;
    const cam = panning ? camera.current : { x: 0, y: 0 };
    return { x: cam.x + vx, y: cam.y + vy, scale };
  }, [panning, viewW, viewH]);

  // Minimap is painted once per scene: a dot per person plus prop blocks, so
  // panning a world bigger than the screen never feels lost. Never shows the target.
  useEffect(() => {
    const mini = miniRef.current;
    const ctx = mini?.getContext('2d');
    if (!mini || !ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    mini.width = 140 * dpr;
    mini.height = 100 * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#1a1d25';
    ctx.fillRect(0, 0, 140, 100);
    const sx = 140 / WORLD_W;
    const sy = 100 / WORLD_H;
    ctx.fillStyle = 'rgba(120,130,150,0.45)';
    for (const pr of scene.props) ctx.fillRect(pr.x * sx, pr.y * sy, Math.max(1, pr.w * sx), Math.max(1, pr.h * sy));
    ctx.fillStyle = 'rgba(232,230,224,0.75)';
    for (const p of scene.people) {
      if (p.isTarget) continue;          // the minimap must never give the answer away
      ctx.fillRect(p.x * sx, p.y * sy, 1.2, 1.2);
    }
  }, [scene]);

  // --- draw loop ------------------------------------------------------------
  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.floor(wrap.clientWidth * dpr);
      canvas.height = Math.floor(wrap.clientHeight * dpr);
      canvas.style.width = `${wrap.clientWidth}px`;
      canvas.style.height = `${wrap.clientHeight}px`;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const frame = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;

      // keyboard panning (disabled when the whole world is already on screen)
      if (!panning) camera.current = { x: 0, y: 0 };
      let dx = 0;
      let dy = 0;
      if (keys.current.has('ArrowLeft') || keys.current.has('a')) dx -= 1;
      if (keys.current.has('ArrowRight') || keys.current.has('d')) dx += 1;
      if (keys.current.has('ArrowUp') || keys.current.has('w')) dy -= 1;
      if (keys.current.has('ArrowDown') || keys.current.has('s')) dy += 1;
      if (panning && (dx || dy)) {
        camera.current = clampCamera(
          camera.current.x + dx * KEY_PAN_SPEED * dt,
          camera.current.y + dy * KEY_PAN_SPEED * dt
        );
      }

      const dpr = canvas.width / Math.max(1, parseFloat(canvas.style.width));
      const cssW = canvas.width / dpr;
      const cssH = canvas.height / dpr;
      const scale = Math.min(cssW / viewW, cssH / viewH);
      const offX = (cssW - viewW * scale) / 2;
      const offY = (cssH - viewH * scale) / 2;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = '#0d0f14';
      ctx.fillRect(0, 0, cssW, cssH);

      ctx.save();
      ctx.translate(offX, offY);
      ctx.beginPath();
      ctx.rect(0, 0, viewW * scale, viewH * scale);
      ctx.clip();
      ctx.scale(scale, scale);
      ctx.translate(-camera.current.x, -camera.current.y);

      // ground: the theme's repeating tile, built once per theme
      const theme = getTheme(scene.theme);
      ctx.fillStyle = theme.ground.base;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      const pattern = getGroundPattern(ctx, scene.theme);
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, WORLD_W, WORLD_H);
      }
      // gentle vignette so the world has a centre and edges feel like edges
      const vg = ctx.createRadialGradient(
        WORLD_W / 2, WORLD_H / 2, Math.min(WORLD_W, WORLD_H) * 0.25,
        WORLD_W / 2, WORLD_H / 2, Math.max(WORLD_W, WORLD_H) * 0.72
      );
      vg.addColorStop(0, 'rgba(0,0,0,0)');
      vg.addColorStop(1, theme.night ? 'rgba(10,8,20,0.3)' : 'rgba(60,46,28,0.16)');
      ctx.fillStyle = vg;
      ctx.fillRect(0, 0, WORLD_W, WORLD_H);

      // cull to the visible slice plus a sprite's worth of margin
      const vx0 = camera.current.x - 80;
      const vx1 = camera.current.x + viewW + 80;
      const vy0 = camera.current.y - 120;
      const vy1 = camera.current.y + viewH + 120;

      // streets first -- the layer everything else is arranged along
      for (const r of scene.roads) {
        if (r.x + r.w < vx0 || r.x > vx1 || r.y + r.h < vy0 || r.y > vy1) continue;
        drawRoad(ctx, r, scene.theme);
      }

      for (const pr of scene.props) {
        if (pr.x + pr.w < vx0 || pr.x > vx1 || pr.y + pr.h < vy0 || pr.y > vy1) continue;
        drawProp(ctx, pr, occupants);
      }
      for (const p of scene.people) {
        if (p.x < vx0 || p.x > vx1 || p.y < vy0 || p.y > vy1) continue;
        if (hideTarget && p.isTarget) continue;
        drawPerson(ctx, p, p.x, p.y);
      }

      // ghost sprite while placing
      if (placing && cursor.current) {
        ctx.globalAlpha = 0.75;
        const ghost = scene.people[0];
        if (ghost) {
          drawPerson(
            ctx,
            // built through makeTargetLook so the ghost, the target card and
            // the Waldo that ends up in the crowd are the exact same sprite
            makeTargetLook(ghost, scene.look),
            cursor.current.x,
            cursor.current.y
          );
        }
        ctx.globalAlpha = 1;
      }

      // Night map: darken everything, then punch warm pools under the stall
      // bulbs. Drawn after the crowd so it tints people and props together.
      if (theme.night) {
        const lamps = scene.props.map(lampOf).filter((l): l is { x: number; y: number; r: number } => l !== null);
        drawNightWash(ctx, lamps, camera.current.x, camera.current.y, viewW, viewH);
      }

      // reveal ring
      if (revealAt) {
        ctx.strokeStyle = '#ffd34d';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(revealAt.x, revealAt.y, 36, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [scene, hideTarget, revealAt, placing, occupants, panning, viewW, viewH]);

  // --- input ----------------------------------------------------------------
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault();
      keys.current.add(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    };
    const up = (e: KeyboardEvent) => keys.current.delete(e.key.length === 1 ? e.key.toLowerCase() : e.key);
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { active: true, moved: 0, lastX: e.clientX, lastY: e.clientY };
    (e.target as Element).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const w = toWorld(e.clientX, e.clientY);
    cursor.current = w ? { x: w.x, y: w.y } : null;
    if (cooling) {
      const box = wrapRef.current?.getBoundingClientRect();
      if (box) setPointer({ x: e.clientX - box.left, y: e.clientY - box.top });
    }
    if (!panning || !drag.current.active) return;
    const dx = e.clientX - drag.current.lastX;
    const dy = e.clientY - drag.current.lastY;
    drag.current.moved += Math.abs(dx) + Math.abs(dy);
    drag.current.lastX = e.clientX;
    drag.current.lastY = e.clientY;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(rect.width / viewW, rect.height / viewH);
    camera.current = clampCamera(camera.current.x - dx / scale, camera.current.y - dy / scale);
    forceCamTick((n) => n + 1);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const wasDrag = drag.current.moved > DRAG_SLOP;
    drag.current.active = false;
    if (wasDrag || disabled || !onPick) return;
    const w = toWorld(e.clientX, e.clientY);
    if (w) onPick(Math.round(w.x), Math.round(w.y));
  };

  const cam = camera.current;
  return (
    <div className="sceneWrap" ref={wrapRef}>
      <canvas
        ref={canvasRef}
        className={disabled ? 'scene disabled' : 'scene'}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      />
      {cooling && pointer && (
        <div className="cursorCooldown" style={{ left: pointer.x, top: pointer.y }}>
          {((cooldownUntil - now) / 1000).toFixed(1)}s
        </div>
      )}
      {/* minimap: only earns its space when part of the world is off-screen */}
      {panning && <div className="minimap" aria-hidden>
        <canvas ref={miniRef} style={{ width: 140, height: 100, display: 'block', borderRadius: 5 }} />
        <div
          className="minimapView"
          style={{
            left: `${(cam.x / WORLD_W) * 100}%`,
            top: `${(cam.y / WORLD_H) * 100}%`,
            width: `${(VIEW_W / WORLD_W) * 100}%`,
            height: `${(VIEW_H / WORLD_H) * 100}%`
          }}
        />
      </div>}
    </div>
  );
}
