// Renders aero glass overlay PNGs for reels: title cards, demo title bar and opening hook.

import { W, H } from './reel-format.js';

export const BAR_H = 230, BAR_Y = 1360;

const esc = (t) => String(t).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c]);

const AERO_CSS = `
  *{box-sizing:border-box;margin:0}
  body{background:transparent;font-family:'Avenir Next','Segoe UI','Helvetica Neue',sans-serif;color:#fff}
  .sky{position:relative;width:${W}px;height:${H}px;overflow:hidden;background:radial-gradient(120% 70% at 50% 0%,#e9fbff 0%,#7fd6ff 35%,#1f8fe0 70%,#0a4f9e 100%)}
  .hill{position:absolute;left:-20%;right:-20%;bottom:-38%;height:62%;border-radius:50% 50% 0 0;background:radial-gradient(80% 60% at 50% 10%,#d9ff8a 0%,#7ed321 35%,#2f9a1c 75%,#196b10 100%);box-shadow:inset 0 30px 60px rgba(255,255,255,.55)}
  .orb{position:absolute;border-radius:50%;background:radial-gradient(circle at 32% 28%,rgba(255,255,255,.95) 0 8%,rgba(255,255,255,.35) 22%,rgba(140,220,255,.18) 55%,rgba(255,255,255,.45) 100%);box-shadow:inset -10px -16px 40px rgba(0,90,180,.25),0 10px 40px rgba(0,60,140,.15)}
  .glass{position:absolute;left:90px;right:90px;top:620px;padding:70px 60px;border-radius:56px;text-align:center;background:linear-gradient(180deg,rgba(255,255,255,.62) 0%,rgba(255,255,255,.28) 48%,rgba(255,255,255,.16) 52%,rgba(255,255,255,.34) 100%);border:2px solid rgba(255,255,255,.85);box-shadow:0 30px 80px rgba(0,50,120,.35),inset 0 2px 0 #fff}
  .kicker{font-weight:700;font-size:34px;letter-spacing:10px;text-transform:uppercase;color:#0b5fae;text-shadow:0 1px 0 rgba(255,255,255,.9)}
  .big{margin-top:24px;font-weight:800;font-size:108px;line-height:1.02;color:#fff;text-shadow:0 4px 0 rgba(0,70,150,.35),0 10px 30px rgba(0,60,140,.45)}
  .sub{margin-top:30px;font-weight:600;font-size:38px;color:#08467f}
`;
const ORBS = `<div class="orb" style="left:70px;top:260px;width:180px;height:180px"></div><div class="orb" style="right:90px;top:380px;width:120px;height:120px"></div>
  <div class="orb" style="right:150px;top:1300px;width:220px;height:220px"></div><div class="orb" style="left:130px;top:1420px;width:90px;height:90px"></div><div class="hill"></div>`;

export async function renderCard(page, file, { kicker, big, sub }) {
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(`<style>${AERO_CSS}</style><div class="sky">${ORBS}<div class="glass"><div class="kicker">${esc(kicker)}</div><div class="big">${esc(big)}</div><div class="sub">${esc(sub)}</div></div></div>`);
  await page.screenshot({ path: file });
}

// Title bar: glossy pill, demo title + style tag; sits above IG caption safe zone
export async function renderBar(page, file, title, style) {
  await page.setViewportSize({ width: W, height: BAR_H });
  await page.setContent(`<style>${AERO_CSS}
    .bar{margin:20px 60px;height:190px;border-radius:95px;display:flex;flex-direction:column;justify-content:center;padding:0 64px;
      background:linear-gradient(180deg,rgba(130,215,255,.95) 0%,rgba(40,150,235,.92) 50%,rgba(10,105,205,.94) 52%,rgba(40,160,240,.95) 100%);
      border:2px solid rgba(255,255,255,.9);box-shadow:0 14px 40px rgba(0,40,100,.45),inset 0 3px 0 rgba(255,255,255,.8)}
    .t{font-weight:800;font-size:62px;line-height:1.05;text-shadow:0 2px 6px rgba(0,40,110,.5);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .s{margin-top:10px;font-weight:700;font-size:26px;letter-spacing:5px;text-transform:uppercase;color:#e8fbff}</style>
    <div class="bar"><div class="t" style="font-size:${title.length > 18 ? 50 : 62}px">${esc(title)}</div><div class="s">Frutiger Aero · ${esc(style)}</div></div>`);
  await page.screenshot({ path: file, omitBackground: true });
}

// Hook: full-frame transparent PNG, bold glossy bubble below IG top bar, shown for first ~1.3 s
export async function renderHook(page, file, hook) {
  await page.setViewportSize({ width: W, height: H });
  await page.setContent(`<style>${AERO_CSS}
    .hook{position:absolute;left:70px;right:70px;top:300px;padding:48px 56px;border-radius:64px;text-align:center;
      background:linear-gradient(180deg,rgba(255,255,255,.92) 0%,rgba(225,246,255,.86) 48%,rgba(190,232,255,.82) 52%,rgba(235,250,255,.9) 100%);
      border:3px solid #fff;box-shadow:0 24px 70px rgba(0,40,110,.5),inset 0 3px 0 #fff}
    .h{font-weight:900;font-size:${hook.length > 30 ? 74 : 88}px;line-height:1.08;color:#0a4f9e;text-shadow:0 2px 0 rgba(255,255,255,.9)}</style>
    <div class="hook"><div class="h">${esc(hook)}</div></div>`);
  await page.screenshot({ path: file, omitBackground: true });
}
