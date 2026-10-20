// Thin websocket wrapper. The server is the single source of truth; the client
// only ever asks and renders what comes back.

import type { ClientMsg, ServerMsg } from '../../backend/message-types.ts';

export type Handler = (msg: ServerMsg) => void;

export class Net {
  private ws: WebSocket | null = null;
  private queue: ClientMsg[] = [];
  private handlers = new Set<Handler>();

  connect(): void {
    if (this.ws) return;
    // Relative to the page so it works at / (standalone) and under /3d-toys/wheres-waldo-game/
    const url = new URL('ws', location.href);
    url.protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(url);
    this.ws = ws;
    ws.onopen = () => {
      for (const m of this.queue.splice(0)) ws.send(JSON.stringify(m));
    };
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data) as ServerMsg;
      for (const h of this.handlers) h(msg);
    };
    ws.onclose = () => {
      this.ws = null;
    };
  }

  send(msg: ClientMsg): void {
    this.connect();
    if (this.ws && this.ws.readyState === WebSocket.OPEN) this.ws.send(JSON.stringify(msg));
    else this.queue.push(msg);
  }

  on(h: Handler): () => void {
    this.handlers.add(h);
    return () => this.handlers.delete(h);
  }
}

export const net = new Net();
