/**
 * FILE: tests/game-socket.test.ts
 * PURPOSE: contract tests for /ws doorway: msg in, ServerMsg shape out
 * UI: home, lobby-room (create/join flows)
 * USED BY: npm test, npm run test:api
 * KEY EXPORTS: none
 */
import test, { after, before } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { WebSocket } from 'ws';
import { attachWs } from '../backend/routes/game-socket.ts';
import type { Lobby } from '../backend/game-lobby.ts';
import type { ServerMsg } from '../backend/message-types.ts';

let http: Server;
let url: string;
const sockets: WebSocket[] = [];

// Run engine: ephemeral port, in-process server
before(async () => {
  http = createServer();
  attachWs(http, new Map<string, Lobby>());
  await new Promise<void>((done) => http.listen(0, '127.0.0.1', done));
  url = `ws://127.0.0.1:${(http.address() as AddressInfo).port}/ws`;
});

after(async () => {
  for (const ws of sockets) ws.terminate();
  await new Promise<void>((done) => http.close(() => done()));
});

// Run engine: open socket, resolve once connected
async function connect(): Promise<WebSocket> {
  const ws = new WebSocket(url);
  sockets.push(ws);
  await new Promise((done, fail) => { ws.once('open', done); ws.once('error', fail); });
  return ws;
}

// Run engine: send raw frame, wait for next server msg
function reply(ws: WebSocket, raw: string): Promise<ServerMsg> {
  return new Promise((done) => {
    ws.once('message', (data) => done(JSON.parse(String(data))));
    ws.send(raw);
  });
}

test('create returns lobby msg with 4-char code and host', async () => {
  const ws = await connect();
  const msg = await reply(ws, JSON.stringify({ t: 'create', nick: 'Ana', mode: 'race', difficulty: 'easy' }));
  assert.equal(msg.t, 'lobby');
  if (msg.t !== 'lobby') return;
  assert.match(msg.lobby.code, /^[A-HJ-NP-Z2-9]{4}$/);
  assert.equal(msg.lobby.players.length, 1);
  assert.equal(msg.lobby.players[0].isHost, true);
});

test('bad JSON returns error msg', async () => {
  const ws = await connect();
  const msg = await reply(ws, '{not json');
  assert.deepEqual(msg, { t: 'error', message: 'Bad message.' });
});

test('action before join returns error msg', async () => {
  const ws = await connect();
  const msg = await reply(ws, JSON.stringify({ t: 'start' }));
  assert.deepEqual(msg, { t: 'error', message: 'Join a lobby first.' });
});

test('join unknown code returns error msg', async () => {
  const ws = await connect();
  const msg = await reply(ws, JSON.stringify({ t: 'join', code: 'zzzz', nick: 'Bo' }));
  assert.deepEqual(msg, { t: 'error', message: 'No lobby with that code.' });
});
