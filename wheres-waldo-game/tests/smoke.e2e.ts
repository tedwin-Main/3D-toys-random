// Headless two-player smoke test: hide mode, hider places, seeker finds, scores land.
import WebSocket from 'ws';
import { generateScene } from '../backend/crowd-scene.ts';
import { validatePlacement } from '../backend/game-rules.ts';
import { WORLD_H, WORLD_W } from '../backend/scene-geometry.ts';

const URL = 'ws://localhost:8791/ws';
const log: string[] = [];
function open(name: string, onMsg: (m: any, ws: WebSocket) => void) {
  const ws = new WebSocket(URL);
  ws.on('message', (d) => { const m = JSON.parse(String(d)); log.push(`${name} <- ${m.t}`); onMsg(m, ws); });
  return ws;
}

let code = '';
let target: { x: number; y: number } | null = null;

const host = open('host', (m, ws) => {
  if (m.t === 'lobby' && !code) { code = m.lobby.code; b.send(JSON.stringify({ t: 'join', code, nick: 'bee' })); }
  if (m.t === 'lobby' && m.lobby.players.length === 2 && m.lobby.phase === 'lobby') {
    ws.send(JSON.stringify({ t: 'start' }));
  }
  if (m.t === 'placePrompt') {
    const scene = generateScene({ seed: m.seed, theme: m.theme, decoyRatio: m.decoyRatio, density: m.density }, false);
    const spot = scene.people.map((p) => ({ x: p.x + 40, y: p.y + 30 }))
      .find((c) => validatePlacement(scene, c.x, c.y, { w: WORLD_W, h: WORLD_H }).ok)!;
    console.log('hider places at', Math.round(spot.x), Math.round(spot.y));
    ws.send(JSON.stringify({ t: 'place', x: spot.x, y: spot.y }));
  }
  if (m.t === 'roundEnd') {
    console.log('roundEnd reason =', m.reason, 'target =', m.target);
    console.log('scores:', m.lobby.players.map((p: any) => `${p.nick}=${p.score}`).join(' '));
    setTimeout(() => { console.log(log.join('\n')); process.exit(0); }, 100);
  }
});

const b = open('bee', (m, ws) => {
  if (m.t === 'roundStart') {
    target = m.targetAt;
    // a deliberate miss first; the first two of a round are free by design
    ws.send(JSON.stringify({ t: 'click', x: 10, y: 10 }));
    setTimeout(() => ws.send(JSON.stringify({ t: 'click', x: target!.x, y: target!.y })), 2300);
  }
  if (m.t === 'wrong') console.log('miss -> cooldown', m.cooldownMs, 'ms,', m.freeLeft, 'free left');
  if (m.t === 'found') console.log('FOUND by', m.nick, '+' + m.score, `${m.foundCount}/${m.seekerCount}`);
});

host.on('open', () => host.send(JSON.stringify({ t: 'create', nick: 'ann', mode: 'hide', difficulty: 'normal' })));
setTimeout(() => { console.log('TIMEOUT\n' + log.join('\n')); process.exit(1); }, 20000);
