/**
 * FILE: src/features/multiplayer-rooms/cloudflare-relay/worker.js
 * PURPOSE: Cloudflare Worker + Durable Object transport for room relay: every websocket goes to one global APAC Durable Object running relay core
 * UI: every multiplayer toy (when room-client points at this relay)
 * USED BY: wrangler deploy (npm run relay:deploy)
 * KEY EXPORTS: default fetch handler, RoomRelayDO
 */
import { DurableObject } from 'cloudflare:workers';
import { createRelayCore } from '../room-relay-core.js';

const SWEEP_MS = 5000;

export default {
  async fetch(req, env) {
    const path = new URL(req.url).pathname;
    if (path === '/health') return new Response('ok');
    if (req.headers.get('Upgrade') !== 'websocket') return new Response('websocket only', { status: 426 });
    // one relay instance, like the single Render server; apac hint keeps it near Malaysia/Singapore players
    const stub = env.ROOMS.get(env.ROOMS.idFromName('global'), { locationHint: 'apac' });
    return stub.fetch(req);
  },
};

// Cloud Sync > Durable Object: holds all rooms in memory while any socket is open
export class RoomRelayDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.core = createRelayCore();
    this.sweepTimer = null;
  }

  async fetch() {
    const [client, server] = Object.values(new WebSocketPair());
    server.accept();
    const conn = this.core.connect({ send: (str) => server.send(str), close: () => server.close(1001, 'silent'), isOpen: () => server.readyState === WebSocket.OPEN });
    server.addEventListener('message', (e) => this.core.message(conn, e.data));
    const drop = () => { this.core.close(conn); this.stopSweepWhenEmpty(); };
    server.addEventListener('close', drop);
    server.addEventListener('error', drop);
    this.sweepTimer ??= setInterval(() => this.core.sweep(), SWEEP_MS);
    return new Response(null, { status: 101, webSocket: client });
  }

  // no sockets: stop timer so the object can be evicted
  stopSweepWhenEmpty() {
    if (this.core.size || !this.sweepTimer) return;
    clearInterval(this.sweepTimer);
    this.sweepTimer = null;
  }
}
