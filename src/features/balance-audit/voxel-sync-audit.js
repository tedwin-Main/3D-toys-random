// Checks Block Party logic across three live tabs: racing edits, builder credit, late join, removals and the block cap.

// Usage: node src/features/balance-audit/voxel-sync-audit.js  (needs the toys relay on PORT, default 5055)
import { chromium } from 'playwright';

const BASE = `http://localhost:${process.env.PORT ?? 5055}/3d-toys/voxel-build-together/`;
const HOOK = ';window.__vox={edit:(o)=>localEdit(o),cells:()=>[...cells].map(([k,c])=>k+":"+c).sort().join("|"),n:()=>cells.size,placed:()=>JSON.stringify(Object.fromEntries(state.placed)),cap:MAX_BLOCKS,me:()=>lobby.room.me,mine:()=>state.placed.get(lobby.room.me)??0};';
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--disable-features=LocalNetworkAccessChecks'] });
const ctx = await browser.newContext(), errors = [];

async function openTab(url) {
  const p = await ctx.newPage();
  p.on('pageerror', (e) => errors.push(e.message));
  await p.route('**/voxel-build-together/**', async (r) => {
    if (r.request().resourceType() !== 'document') return r.continue();
    const res = await r.fetch(), t = await res.text(), i = t.lastIndexOf('</script>');
    r.fulfill({ response: res, body: t.slice(0, i) + HOOK + t.slice(i) });
  });
  await p.goto(url);
  return p;
}
const edit = (tab, ops) => tab.evaluate((o) => window.__vox.edit(o), ops);
const settle = () => new Promise((r) => setTimeout(r, 2000));
const snapshot = (tabs) => Promise.all(tabs.map((t) => t.evaluate(() => [window.__vox.cells(), window.__vox.placed(), window.__vox.n()])));
const agree = (snap) => ({ sameCells: snap.every((s) => s[0] === snap[0][0]), sameCredit: snap.every((s) => s[1] === snap[0][1]), blocks: snap[0][2], credit: snap[0][1] });

const host = await openTab(BASE);
await host.fill('.lb-nick', 'Host'); await host.click('.lb-create'); await host.locator('.lb-start').waitFor();
const code = await host.evaluate(() => new URLSearchParams(location.search).get('room'));
const guest = await openTab(`${BASE}?room=${code}`);
await guest.fill('.lb-nick', 'Guest'); await guest.click('.lb-join'); await guest.locator('.lb-wait').waitFor();
await host.click('.lb-start'); await settle();

// 1. both build at once; every 10th step they race for the same cell
for (let i = 0; i < 150; i++) {
  await Promise.all([edit(host, [[i % 5, Math.floor(i / 25), Math.floor(i / 5) % 5, i % 8]]), edit(guest, [[20 + (i % 5), Math.floor(i / 25), Math.floor(i / 5) % 5, i % 8]]),
    i % 10 === 0 ? edit(guest, [[10, i / 10, 10, 3]]) : null, i % 10 === 0 ? edit(host, [[10, i / 10, 10, 5]]) : null]);
}
await settle();
const race = agree(await snapshot([host, guest]));

// 2. late joiner gets plate + credit; its builds and a guest removal reach everyone
const late = await openTab(`${BASE}?room=${code}`);
await late.fill('.lb-nick', 'Late'); await late.click('.lb-join'); await settle();
for (let i = 0; i < 20; i++) await edit(late, [[30 + (i % 5), 0, 30 + Math.floor(i / 5), 2]]);
await edit(guest, [[20, 0, 0, -1], [21, 0, 0, -1]]);
await settle();
const lateJoin = agree(await snapshot([host, guest, late]));

// 3. host fills to the block cap in 400-op bursts; extra guest blocks are refused everywhere and earn no credit
const cap = await host.evaluate(() => window.__vox.cap);
for (let c = 0; (await host.evaluate(() => window.__vox.n())) < cap; c += 400) {
  await edit(host, Array.from({ length: 400 }, (_, j) => { const i = c + j; return [i % 40, 1 + (Math.floor(i / 1600) % 29), Math.floor(i / 40) % 40, 1]; }));
}
await settle();
const guestBefore = await guest.evaluate(() => window.__vox.mine());
await edit(guest, [[39, 0, 39, 4], [38, 0, 39, 4]]);
await settle();
const capped = { ...agree(await snapshot([host, guest, late])), guestGain: (await guest.evaluate(() => window.__vox.mine())) - guestBefore };
const checks = [
  ['racing edits: same plate on host and guest', race.sameCells && race.sameCredit && race.blocks === 315, race],
  ['late join: plate and builder credit match on 3 tabs', lateJoin.sameCells && lateJoin.sameCredit && lateJoin.blocks === 333, lateJoin],
  [`block cap ${cap}: 3 tabs agree at cap, refused blocks earn no credit`, capped.sameCells && capped.sameCredit && capped.blocks === cap && capped.guestGain === 0, { blocks: capped.blocks, sameCells: capped.sameCells, guestGain: capped.guestGain }],
  ['no page errors', errors.length === 0, errors.slice(0, 3)],
];
for (const [name, ok, v] of checks) console.log(ok ? 'PASS' : 'FAIL', name, '=', JSON.stringify(v));
await browser.close();
process.exitCode = checks.every((c) => c[1]) ? 0 : 1;
