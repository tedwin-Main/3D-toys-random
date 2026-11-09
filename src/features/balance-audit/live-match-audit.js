// Plays real lobby matches (host + bots over the local relay) headless and checks each game's genre rule and seat fairness.

// Usage: node src/features/balance-audit/live-match-audit.js [--games a,b] [--secs 420] [--warp 16] [--bots 5] [--rooms 1] [--batch 7] [--star 0.95 --rest 0.45]
// Seat test: equal-skill bots, chi-square on match wins per seat (host seat left out), PASS at p ≥ 0.01 with ≥ 10 matches.
// Skill test (--star): one bot at skill 0.95, the rest 0.45; the star must win ≥ edge × fair share (2, or the rule's edge for luck-heavy genres), one-sided z ≥ 2.33.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { GAME_RULES } from './genre-rules.js';
import { chiSquareP } from './seat-stats.js';

const args = Object.fromEntries(process.argv.slice(2).join(' ').split('--').filter(Boolean).map((s) => s.trim().split(/\s+/)));
const PORT = +(process.env.PORT ?? 5055), BASE = `http://localhost:${PORT}/3d-toys`;
const STAR = args.star ? +args.star : null, REST = +(args.rest ?? 0.45);
const SECS = +(args.secs ?? 420), WARP = +(args.warp ?? 16), BOTS = +(args.bots ?? 5), ROOMS = +(args.rooms ?? 1), BATCH = +(args.batch ?? 7);
const GAMES = (args.games ?? Object.keys(GAME_RULES).filter((g) => !GAME_RULES[g].scoreless).join(',')).split(',');

// Time warp: each worker tick runs k sim steps on a shifted clock; rAF throttled to 5 fps so CPU goes to the sim
const warpScript = (k) => `(() => {
  let off = 0; const pn = performance.now.bind(performance), dn = Date.now;
  performance.now = () => pn() + off; Date.now = () => dn() + off;
  const W = window.Worker;
  window.Worker = function (u, o) {
    const w = new W(u, o); let last = pn();
    Object.defineProperty(w, 'onmessage', { set(f) { w.addEventListener('message', (e) => { const d = pn() - last; last = pn(); f(e); for (let i = 1; i < ${k}; i++) { off += Math.min(d, 50); f(e); } }); } });
    return w;
  };
  window.requestAnimationFrame = (f) => setTimeout(() => f(performance.now()), 200);
})();`;

// Peek: appended inside the page's module so it reads module-scope state; turn-based hosts get bot brains (host0)
const peekScript = (c) => `;window.__restart=()=>lobby.restart();window.__peek=()=>{const m=(v)=>v instanceof Map?[...v.values()]:v;let S_,W_;try{S_=typeof S!=='undefined'?S:null}catch{}try{W_=typeof world!=='undefined'?world:null}catch{}
try{${c.pre ?? ''}}catch{}
const w=W_||{};let P=[];try{P=${c.list ? `m(${c.list})` : '(S_&&S_.P)||m(w.players)||m(w.tanks)'}||[]}catch{}
for(const p of P)if(!p.bot){p.bot=true;p.host0=true;}
const nh=P.filter(q=>!q.host0),star=${STAR}!==null&&nh.length?Math.max(...nh.map(q=>q.id)):null;
for(const p of P)if('skill' in p||p.host0)p.skill=star===null?0.75:p.id===star?${STAR}:${REST};
let hp='';try{hp=typeof H!=='undefined'&&H&&H.phase||''}catch{}
const ph=(S_&&(S_.ph||S_.phase))||w.phase||hp;
const key=${c.score ? "'custom'" : "['score','pts','total','kills','pops','wins','tiles','goals'].find(k=>P.length&&typeof P[0][k]==='number')"};
const val=(p)=>${c.score ?? 'p[key]'};
let viol='';try{viol=${c.inv ?? "''"}}catch(e){viol='inv error '+e.message}
const nan=P.some(p=>['x','z','y','vx','vz'].some(k=>typeof p[k]==='number'&&!Number.isFinite(p[k])));
const lb=document.querySelector('.lb-wrap');
return {ph,viol,nan,inLobby:!!lb&&!lb.hidden,ids:P.map(p=>p.id),host:P.map(p=>!!p.host0),star:P.map(p=>p.id===star),knob:nh.some(p=>'skill' in p),sc:key?P.map(p=>+val(p)||0):[]};};`;

async function openGame(browser, game, rule) {
  const page = await browser.newPage({ viewport: { width: 400, height: 260 } });
  page.errors = [];
  page.on('pageerror', (e) => page.errors.push(String(e.message).slice(0, 160)));
  if (!rule.serverRun) await page.addInitScript(warpScript(WARP));
  await page.route(`**/3d-toys/${game}/**`, async (route) => {
    if (route.request().resourceType() !== 'document') return route.continue();
    const res = await route.fetch(), body = await res.text(), i = body.lastIndexOf('</script>');
    route.fulfill({ response: res, body: body.slice(0, i) + peekScript(rule) + body.slice(i) });
  });
  await page.goto(`${BASE}/${game}/`, { timeout: 120000 });
  await page.fill('.lb-nick', 'Audit');
  await page.click('.lb-create');
  return page;
}

async function startFromLobby(page) {
  const start = page.locator('.lb-start');
  await start.waitFor({ timeout: 15000 });
  await page.evaluate((n) => { const bi = document.querySelector('.lb-bot-in'); if (bi) { bi.value = String(Math.min(n, +bi.max)); bi.dispatchEvent(new Event('input')); } }, BOTS);
  await start.click();
}

// Samples state every 100 ms; a match ends when the lobby reappears or the rule's end phase shows
async function playMatches(page, rule) {
  const out = { matches: [], viols: new Map(), nan: false, samples: 0 };
  let last = null;
  await startFromLobby(page);
  for (const t0 = Date.now(); Date.now() - t0 < SECS * 1000;) {
    await page.waitForTimeout(100);
    const s = await page.evaluate(() => window.__peek?.()).catch(() => null);
    if (!s) continue;
    if (s.inLobby) { if (last) out.matches.push(last); last = null; await startFromLobby(page).catch(() => {}); continue; }
    out.samples++; out.nan ||= s.nan;
    if (s.viol) out.viols.set(s.viol, (out.viols.get(s.viol) ?? 0) + 1);
    if (s.sc.length) last = s;
    if (rule.end && s.ph === rule.end && last) { out.matches.push(last); last = null; await page.waitForTimeout(200); await page.evaluate(() => window.__restart()).catch(() => {}); }
  }
  return out;
}

// Match wins per key over non-host players; ties split the win
function winsBy(matches, keyOf) {
  const tally = new Map();
  for (const m of matches) {
    const rows = m.ids.map((id, i) => ({ id, i, s: m.sc[i] })).filter((r) => !m.host[r.i]);
    const top = Math.max(...rows.map((r) => r.s)), k = rows.filter((r) => r.s === top).length;
    for (const r of rows) tally.set(keyOf(r), (tally.get(keyOf(r)) ?? 0) + (r.s === top ? 1 / k : 0));
  }
  return [...tally.entries()].sort((a, b) => a[0] - b[0]).map((e) => e[1]);
}
const chiP = (wins, n) => chiSquareP(wins.reduce((a, o) => a + (o - n / wins.length) ** 2 / (n / wins.length), 0), wins.length - 1);
const fmt = (wins) => wins.map((x) => +x.toFixed(1)).join(' ');

// Seat fairness by player id (= join slot); turn position reported too (differs where seats are drawn by lot)
function seatFairness(matches) {
  const n = matches.length, join = winsBy(matches, (r) => r.id), turn = winsBy(matches, (r) => r.i), p = chiP(join, n);
  return { seatWins: fmt(join), seatP: +p.toFixed(3), fair: n < 10 ? 'few matches' : p >= 0.01 ? 'PASS' : 'FAIL', turnWins: fmt(turn), turnP: +chiP(turn, n).toFixed(3) };
}

// Skill edge: the 0.95 bot's share of match wins among non-host seats; ties split
function skillEdge(matches, bar = 2) {
  let wins = 0;
  for (const m of matches) {
    const seats = m.host.map((h, i) => (h ? -1 : i)).filter((i) => i >= 0), v = seats.map((i) => m.sc[i]), top = Math.max(...v);
    const k = v.filter((x) => x === top).length, s = seats.findIndex((i) => m.star[i]);
    if (s >= 0 && v[s] === top) wins += 1 / k;
  }
  const n = matches.length, p0 = 1 / matches[0].host.filter((h) => !h).length, z = (wins - n * p0) / Math.sqrt(n * p0 * (1 - p0));
  const skill = !matches[0].knob ? 'no skill knob' : n < 10 ? 'few matches' : wins / n >= bar * p0 && z >= 2.33 ? 'PASS' : 'FAIL';
  return { starShare: +(wins / n).toFixed(2), bar, fairShare: +p0.toFixed(2), starZ: +z.toFixed(2), skill };
}

async function auditGame(browser, game) {
  const rule = GAME_RULES[game];
  // rooms open one by one: a dozen parallel page loads time out on a busy CPU
  const pages = [];
  for (let i = 0; i < ROOMS; i++) pages.push(await openGame(browser, game, rule));
  const runs = await Promise.all(pages.map((p) => playMatches(p, rule)));
  const matches = runs.flatMap((r) => r.matches), viols = Object.assign({}, ...runs.map((r) => Object.fromEntries(r.viols)));
  const errors = [...new Set(pages.flatMap((p) => p.errors))].slice(0, 3);
  await Promise.all(pages.map((p) => p.close()));
  const res = { game, rule: rule.rule, ref: rule.ref, matches: matches.length, violations: viols, errors, nan: runs.some((r) => r.nan) };
  if (matches.length) Object.assign(res, STAR === null ? seatFairness(matches) : skillEdge(matches, rule.edge));
  res.ruleCheck = Object.keys(viols).length || errors.length || res.nan ? 'FAIL' : 'PASS';
  return res;
}

// Relay server: reuse one already on PORT, else start it for the run
async function ensureServer() {
  if (await fetch(`${BASE}/`).then((r) => r.ok, () => false)) return null;
  const entry = fileURLToPath(new URL('../multiplayer-rooms/start-server.js', import.meta.url));
  const proc = spawn(process.execPath, [entry], { env: { ...process.env, PORT: String(PORT) }, stdio: 'ignore' });
  for (let i = 0; i < 50 && !(await fetch(`${BASE}/`).then((r) => r.ok, () => false)); i++) await new Promise((r) => setTimeout(r, 200));
  return proc;
}

const server = await ensureServer();
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=LocalNetworkAccessChecks'] });
try {
  for (let i = 0; i < GAMES.length; i += BATCH) {
    for (const r of await Promise.all(GAMES.slice(i, i + BATCH).map((g) => auditGame(browser, g).catch((e) => ({ game: g, ruleCheck: 'FAIL', errors: [String(e.message).slice(0, 160)] }))))) console.log(JSON.stringify(r));
  }
} finally {
  await browser.close();
  server?.kill();
}
