// Plays every multiplayer toy with 14 real browser tabs over a lagged relay and reports join, start, errors and latency.

// Usage: node src/features/multiplayer-rooms/room-browser-test.js [--games=a,b] [--players=14] [--seconds=40] [--lag=40] [--jitter=15] [--url=http://host/3d-toys/] [--out=report.json] [--profile]
// --guest-fps: frames per second each guest tab draws (default 0.2); --profile[=tab]: CPU profile of one tab during play (default 0 = host), prints the functions with the most self time
// --lag / --jitter: one-way delay in ms added to every websocket message in each tab (both ways), order kept, like a phone on Render Singapore
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { TOYS } from '../toy-box/common/toy-list.js';

const arg = (k, d) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split('=').slice(1).join('=') ?? d;
const PROFILE = process.argv.some((a) => a.startsWith('--profile')), PROFILE_TAB = +arg('profile', 0) || 0, GUEST_FPS = +arg('guest-fps', 0.2);
const PLAYERS = +arg('players', 14), SECONDS = +arg('seconds', 40), LAG = +arg('lag', 40), JITTER = +arg('jitter', 15);
const GAMES = arg('games', '') ? arg('games').split(',') : TOYS.filter((t) => t.players === 'multi').map((t) => t.dir);
const ROOT = join(import.meta.dirname, '..', '..', '..');
const CACHE = join(ROOT, 'node_modules', '.cache', 'cdn');

// Run > server: reuse --url, else start the toy server on a spare port
let base = arg('url', ''), server = null;
if (!base) {
  const port = 5600 + Math.floor(Math.random() * 300);
  server = spawn(process.execPath, [join(import.meta.dirname, 'start-server.js')], { env: { ...process.env, PORT: String(port) }, stdio: 'ignore' });
  base = `http://localhost:${port}/3d-toys/`;
  for (let i = 0; i < 50; i++) { try { if ((await fetch(base.replace('/3d-toys/', '/health'))).ok) break; } catch { /* booting */ } await new Promise((r) => setTimeout(r, 100)); }
}

// Browser > every tab: lagged websocket, probe replies, data timing, frame counter
const INIT = (tab) => `(() => {
  const LAG = ${LAG}, JIT = ${JITTER}, FPS = ${tab === 0 ? 0.2 : GUEST_FPS};
  const rt = window.__rt = { me: null, host: null, hostData: [], bytesIn: 0, rtts: [], frames: 0, started: 0, sent: 0, lag: [] };
  // event-loop lag: how late a 100 ms timer fires (machine load, not network)
  let lt = performance.now();
  setInterval(() => { const n = performance.now(); if (rt.started && n - rt.started > 8000) rt.lag.push(n - lt - 100); lt = n; }, 100);
  const delay = () => LAG + Math.random() * JIT;
  const N = window.WebSocket;
  window.WebSocket = class extends N {
    constructor(u, p) {
      super(u, p);
      this.__h = null;
      let tIn = 0, tOut = 0;
      this.__tOut = () => (tOut = Math.max(performance.now() + delay(), tOut));
      super.addEventListener('message', (e) => {
        const at = (tIn = Math.max(performance.now() + delay(), tIn));
        setTimeout(() => {
          rt.bytesIn += e.data.length;
          let m = null; try { m = JSON.parse(e.data); } catch {}
          if (m?.t === 'joined') { rt.me = m.id; rt.host = m.host; window.__ws = this; }
          if (m?.t === 'roster') rt.host = m.host;
          if (m?.t === 'data') {
            const d = m.data;
            if (d?._lobby === 'probe' && rt.me !== rt.host) this.send(JSON.stringify({ t: 'send', to: m.from, data: { _lobby: 'pack', ts: d.ts } }));
            else if (d?._lobby === 'pack' && rt.me === rt.host) rt.rtts.push([performance.now() - d.ts, d.ts - rt.started]);
            else if (d?._lobby === 'start') rt.started = performance.now();
            else if (!d?._lobby && m.from === rt.host && rt.started) rt.hostData.push(performance.now());
          }
          this.__h?.call(this, e);
        }, at - performance.now());
      });
    }
    set onmessage(f) { this.__h = f; }
    get onmessage() { return this.__h; }
    send(d) {
      const at = this.__tOut();
      if (!rt.started && String(d).includes('"_lobby":"start"')) rt.started = performance.now();
      setTimeout(() => { if (this.readyState === 1) { rt.sent++; N.prototype.send.call(this, d); } }, at - performance.now());
    }
  };
  setInterval(() => { if (window.__ws && rt.me && rt.me === rt.host && rt.started) window.__ws.send(JSON.stringify({ t: 'send', data: { _lobby: 'probe', ts: performance.now() } })); }, 500);
  // 14 software-rendered tabs share one CPU-emulated GPU: draw small (half-res, no MSAA) and few frames (one per 5 s) so the GPU queue never stalls game ticks and sockets
  Object.defineProperty(window, 'devicePixelRatio', { get: () => 0.5 });
  // guest tabs keep their audio graph suspended (one shared CPU would mix 13 synth bands); the host tab plays sound like a real device
  if (${tab} > 0 && window.AudioContext) { const A = window.AudioContext; window.AudioContext = class extends A { constructor(...a) { super(...a); super.suspend(); } resume() { return Promise.resolve(); } }; }
  const gc = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, opts) { return gc.call(this, type, /webgl/.test(type) ? { ...opts, antialias: false } : opts); };
  const raf = window.requestAnimationFrame.bind(window);
  window.requestAnimationFrame = (cb) => { const at = performance.now(); return raf(function w(t) { if (performance.now() - at < 1000 / FPS - 4) return raf(w); cb(t); }); };
  const f = () => { rt.frames++; requestAnimationFrame(f); }; requestAnimationFrame(f);
  // before the match, game tickers (>= 10 Hz worker) only drive the attract demo behind the lobby: deliver 1 tick in 8 so 14 tabs can join without
  // each simulating a full bot match; the room heartbeat ticker (0.2 Hz) and everything after the start run untouched
  const NB = window.Blob, cou = URL.createObjectURL.bind(URL), tickMs = new Map();
  window.Blob = class extends NB { constructor(parts, o) { super(parts, o); try { const m = /postMessage\\(0\\), ([\\d.]+)\\)/.exec((parts || []).join('')); if (m) this.__ms = +m[1]; } catch {} } };
  URL.createObjectURL = (b) => { const u = cou(b); if (b && b.__ms) tickMs.set(u, b.__ms); return u; };
  const NWk = window.Worker;
  window.Worker = class extends NWk {
    constructor(u, o) {
      super(u, o);
      const ms = tickMs.get(String(u));
      if (!ms || ms >= 100) return;
      let h = null, n = 0;
      Object.defineProperty(this, 'onmessage', { get: () => h, set: (fn) => { h = fn; } });
      super.addEventListener('message', (e) => { if (rt.started || ++n % 8 === 0) h?.call(this, e); });
    }
  };
})();`;

// Browser > chaos player: clicks game buttons, taps the canvas, types guesses, presses and holds keys
const KEYS = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 'a', 's', 'd', ' ', 'Shift', 'e', 'q', 'f', 'Enter', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'j', 'k'];
async function chaos(page, until) {
  const vp = page.viewportSize();
  while (Date.now() < until) {
    try {
      const r = Math.random();
      if (r < 0.45) {
        await page.evaluate(() => {
          const ok = (el) => el.offsetParent !== null && !el.disabled && !el.closest('.lb-wrap, #top') && el.id !== 'lobbyBtn';
          const inputs = [...document.querySelectorAll('input[type=text], input:not([type]), input[type=number]')].filter(ok);
          if (inputs.length && Math.random() < 0.4) {
            const el = inputs[Math.floor(Math.random() * inputs.length)];
            el.focus();
            el.value = el.type === 'number' || /\d/.test(el.placeholder) ? String(1 + Math.floor(Math.random() * 60)) : ['star', 'house', 'tone', 'rates', 'cat', 'stone', 'later'][Math.floor(Math.random() * 7)];
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            return;
          }
          const bs = [...document.querySelectorAll('button, [data-pick], .pick')].filter(ok);
          if (bs.length) bs[Math.floor(Math.random() * bs.length)].click();
        });
      } else if (r < 0.7) {
        const x = vp.width * (0.15 + Math.random() * 0.7), y = vp.height * (0.2 + Math.random() * 0.6);
        await page.mouse.move(x, y);
        await page.mouse.down();
        await page.mouse.move(x + (Math.random() - 0.5) * 80, y + Math.random() * 60, { steps: 3 });
        await page.mouse.up();
      } else {
        const k = KEYS[Math.floor(Math.random() * KEYS.length)];
        await page.keyboard.down(k);
        await page.waitForTimeout(80 + Math.random() * 500);
        await page.keyboard.up(k);
      }
    } catch { /* page busy or closed */ }
    await page.waitForTimeout(250 + Math.random() * 700);
  }
}

const WARMUP_MS = 8000;
const pct = (a, q) => { if (!a.length) return NaN; const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * q))]; };
const med = (a) => pct(a, 0.5);
const r1 = (v) => (Number.isFinite(v) ? Math.round(v) : null);

// Run > one game: host creates, guests join by code, host starts, everyone plays for SECONDS
async function runGame(browser, dir) {
  const ctxs = [], pages = [], errors = [];
  const out = { game: dir, players: PLAYERS };
  try {
    for (let i = 0; i < PLAYERS; i++) {
      const ctx = await browser.newContext({ viewport: { width: 420, height: 300 }, deviceScaleFactor: 1 });
      await ctx.route('https://cdn.jsdelivr.net/**', async (route) => {
        const url = route.request().url(), file = join(CACHE, createHash('sha1').update(url).digest('hex'));
        if (!existsSync(file)) { try { execFileSync('curl', ['-sSfL', url, '-o', file], { stdio: 'ignore' }); } catch { return route.abort(); } }
        route.fulfill({ body: readFileSync(file), contentType: url.endsWith('.wasm') ? 'application/wasm' : 'text/javascript', headers: { 'access-control-allow-origin': '*' } });
      });
      await ctx.addInitScript(INIT(i));
      const page = await ctx.newPage();
      page.on('pageerror', (e) => errors.push(`tab${i}: ${String(e.message).slice(0, 200)}`));
      page.on('console', (m) => { if (m.type() === 'error' && !/favicon|WebGL|GPU stall|AudioContext/i.test(m.text())) errors.push(`tab${i} console: ${m.text().slice(0, 200)}`); });
      ctxs.push(ctx); pages.push(page);
    }
    const joinRoom = async (page, i, code) => {
      await page.goto(`${base}${dir}/${code ? `?room=${code}` : ''}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForSelector('.lb-nick', { timeout: 30000 });
      await page.fill('.lb-nick', `P${i + 1}`);
      await page.click(code ? '.lb-join' : '.lb-create');
      await page.waitForSelector('.lb-code', { timeout: 20000 });
    };
    await joinRoom(pages[0], 0, "");
    const code = (await pages[0].textContent('.lb-code')).trim();
    out.room = code;
    for (let i = 1; i < PLAYERS; i += 4) await Promise.all(pages.slice(i, i + 4).map((p, k) => joinRoom(p, i + k, code)));
    await pages[0].waitForFunction((n) => document.querySelectorAll('.lb-players .lb-chip').length >= n, PLAYERS, { timeout: 20000, polling: 250 });
    out.joined = await pages[0].evaluate(() => document.querySelectorAll('.lb-players .lb-chip').length);
    await pages[0].click('.lb-start');
    const t0 = Date.now();
    const startedFlags = await Promise.all(pages.map((p) => p.waitForFunction(() => document.querySelector('.lb-wrap')?.hidden === true, null, { timeout: 15000, polling: 250 }).then(() => true, () => false)));
    out.started = startedFlags.filter(Boolean).length;
    out.startMs = Date.now() - t0;
    const until = Date.now() + SECONDS * 1000;
    const cdp = PROFILE ? await ctxs[PROFILE_TAB].newCDPSession(pages[PROFILE_TAB]) : null;
    if (cdp) { await cdp.send('Profiler.enable'); await cdp.send('Profiler.start'); }
    await Promise.all(pages.map((p) => chaos(p, until)));
    if (cdp) {
      const { profile } = await cdp.send('Profiler.stop');
      const self = new Map(), dts = profile.timeDeltas, byId = new Map(profile.nodes.map((n) => [n.id, n]));
      profile.samples.forEach((id, i) => { const f = byId.get(id).callFrame, k = `${f.functionName || '(anon)'} ${f.url.split('/').slice(-2).join('/')}:${f.lineNumber + 1}`; self.set(k, (self.get(k) ?? 0) + (dts[i] ?? 0)); });
      const total = [...self.values()].reduce((a, b) => a + b, 0);
      out.profile = [...self].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([k, us]) => `${(us / total * 100).toFixed(1)}% ${k}`);
    }
    const stats = await Promise.all(pages.map((p) => p.evaluate(() => ({ ...window.__rt, now: performance.now(), lobbyHidden: document.querySelector('.lb-wrap')?.hidden === true }))));
    const host = stats[0], guests = stats.slice(1);
    const gaps = [], rates = [], fps = [], quiet = [];
    for (const g of guests) {
      const d = g.hostData;
      for (let i = 1; i < d.length; i++) gaps.push(d[i] - d[i - 1]);
      const span = (g.now - g.started) / 1000;
      rates.push(d.length / span);
      if (!d.length) quiet.push(g.me);
    }
    for (const s of stats) fps.push(s.frames / (s.now / 1000));
    const lags = stats.flatMap((s) => s.lag);
    Object.assign(out, {
      stillInMatch: stats.filter((s) => s.lobbyHidden).length,
      guestsWithoutHostData: quiet.length,
      hostMsgsPerSec: +med(rates).toFixed(1),
      hostGapMs: { p50: r1(pct(gaps, 0.5)), p95: r1(pct(gaps, 0.95)), max: r1(gaps.length ? Math.max(...gaps) : NaN) },
      // steady state = probes sent 8 s or more after the start (the first frames compile every shader, seconds on a software GPU)
      rttMs: (() => { const all = host.rtts.map(([v]) => v), st = host.rtts.filter(([, t]) => t >= WARMUP_MS).map(([v]) => v), warm = host.rtts.filter(([, t]) => t < WARMUP_MS).map(([v]) => v);
        return { n: st.length, p50: r1(pct(st, 0.5)), p95: r1(pct(st, 0.95)), max: r1(st.length ? Math.max(...st) : NaN), warmupMax: r1(warm.length ? Math.max(...warm) : NaN), allP95: r1(pct(all, 0.95)) }; })(),
      kbInPerGuest: +(med(guests.map((g) => g.bytesIn)) / 1024 / SECONDS).toFixed(1),
      fpsMedian: +med(fps).toFixed(1),
      loopLagMs: { p95: r1(pct(lags, 0.95)), max: r1(lags.length ? Math.max(...lags) : NaN), host95: r1(pct(host.lag, 0.95)) },
    });
  } catch (e) {
    out.fatal = String(e.message).split('\n')[0];
  }
  out.errors = [...new Set(errors)].slice(0, 8);
  out.errorCount = errors.length;
  // a short match may finish inside the window (everyone back in the lobby together): fine, as long as all tabs agree
  out.matchEnded = out.stillInMatch === 0;
  // floor = two lagged hops each way; stable = the tail stays close to the median
  const floor = 4 * LAG + 2 * JITTER;
  out.pass = !out.fatal && out.joined === PLAYERS && out.started === PLAYERS && (out.stillInMatch === PLAYERS || out.stillInMatch === 0) && out.guestsWithoutHostData === 0 && out.errorCount === 0 && out.rttMs?.n > 20 && out.rttMs.p95 < floor + 250;
  for (const c of ctxs) await c.close().catch(() => {});
  return out;
}

mkdirSync(CACHE, { recursive: true });
// CHROMIUM_PATH: a preinstalled Chromium when the pinned Playwright browser is not downloaded
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, headless: true, args: ['--headless=new', '--no-sandbox', '--autoplay-policy=no-user-gesture-required', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows'] });
console.log(`${GAMES.length} games · ${PLAYERS} tabs each · ${SECONDS}s play · lag ${LAG}±${JITTER} ms one-way · ${base}`);
const results = [];
for (const dir of GAMES) {
  const r = await runGame(browser, dir);
  results.push(r);
  const rtt = r.rttMs ? `rtt p50 ${r.rttMs.p50} p95 ${r.rttMs.p95} max ${r.rttMs.max} (warm-up max ${r.rttMs.warmupMax})` : '';
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${dir.padEnd(24)} joined ${r.joined ?? '-'}/${PLAYERS} started ${r.started ?? '-'} in-match ${r.stillInMatch ?? '-'}${r.matchEnded ? ' (match over, all back in lobby)' : ''}  ${rtt}  host ${r.hostMsgsPerSec ?? '-'}/s gap p95 ${r.hostGapMs?.p95 ?? '-'}  ${r.kbInPerGuest ?? '-'} KB/s  fps ${r.fpsMedian ?? '-'}  loop-lag p95 ${r.loopLagMs?.p95 ?? '-'} max ${r.loopLagMs?.max ?? '-'} (host p95 ${r.loopLagMs?.host95 ?? '-'})  errors ${r.errorCount}${r.fatal ? `  FATAL ${r.fatal}` : ''}`);
  for (const e of r.errors) console.log(`      ${e}`);
  for (const l of r.profile ?? []) console.log(`      profile ${l}`);
}
await browser.close();
server?.kill();
const outFile = arg('out', '');
if (outFile) writeFileSync(outFile, JSON.stringify({ players: PLAYERS, seconds: SECONDS, lag: LAG, jitter: JITTER, results }, null, 2));
console.log(`${results.filter((r) => r.pass).length}/${results.length} passed`);
process.exit(results.every((r) => r.pass) ? 0 : 1);
