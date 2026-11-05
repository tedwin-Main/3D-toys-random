// Opens direct WebRTC data channels between room host and guests for latency-critical messages; relay carries signaling and fallback.

const ICE_SERVERS = [{ urls: ['stun:stun.cloudflare.com:3478', 'stun:stun.l.google.com:19302'] }];
const MAX_LINKS = 16; // host uploads one copy per linked guest; the rest stay on the relay
const BUFFER_LIMIT = 64 * 1024; // channel backed up (slow uplink): this message goes by relay instead
// unordered + no retransmits: a late packet is never waited for; senders repeat what must not be lost
const CHANNEL = { negotiated: true, id: 0, ordered: false, maxRetransmits: 0 };

/**
 * room: relay handle ({ me, host, isHost, players, send(data, { to }) }); deliver(data, from): hand direct messages to the game.
 * Guests offer to the host, host answers up to MAX_LINKS. Signals ride the relay as { _rtc } data.
 */
export function createFastLinks(room, deliver) {
  const links = new Map(); // peer id > { pc, ch, early ICE candidates }
  const gaveUp = new Set(); // hosts that refused or failed: stay on relay until the host changes

  const signal = (peer, rtc) => room.send({ _rtc: rtc }, { to: peer });

  function open(peer) {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
    const link = { pc, ch: pc.createDataChannel('fast', CHANNEL), early: [] };
    link.ch.binaryType = 'arraybuffer';
    links.set(peer, link);
    pc.onicecandidate = (e) => { if (e.candidate) signal(peer, { ice: e.candidate.toJSON() }); };
    pc.onconnectionstatechange = () => { if (pc.connectionState === 'failed') fail(peer); };
    // binary messages arrive as Uint8Array, text as parsed JSON
    link.ch.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) return deliver(new Uint8Array(e.data), peer);
      let data;
      try { data = JSON.parse(e.data); } catch { return; }
      deliver(data, peer);
    };
    return link;
  }

  function close(peer) {
    const link = links.get(peer);
    if (!link) return;
    links.delete(peer);
    link.pc.close();
  }

  function fail(peer) { gaveUp.add(peer); close(peer); }

  async function remote(link, desc) {
    await link.pc.setRemoteDescription(desc);
    for (const c of link.early.splice(0)) link.pc.addIceCandidate(c).catch(() => {});
  }

  // guest side: offer a link to the host
  async function offer(host) {
    const link = open(host);
    await link.pc.setLocalDescription(await link.pc.createOffer());
    signal(host, { offer: link.pc.localDescription.sdp });
  }

  // host side: answer while there is room, refuse otherwise
  async function answer(peer, sdp) {
    if (!room.isHost || links.size >= MAX_LINKS) return signal(peer, { busy: true });
    close(peer);
    const link = open(peer);
    await remote(link, { type: 'offer', sdp });
    await link.pc.setLocalDescription(await link.pc.createAnswer());
    signal(peer, { answer: link.pc.localDescription.sdp });
  }

  async function onSignal(peer, rtc) {
    const link = links.get(peer);
    if (rtc.offer) return answer(peer, rtc.offer);
    if (rtc.busy) return fail(peer);
    if (!link) return;
    if (rtc.answer) return remote(link, { type: 'answer', sdp: rtc.answer });
    if (!rtc.ice) return;
    if (link.pc.remoteDescription) await link.pc.addIceCandidate(rtc.ice);
    else link.early.push(rtc.ice);
  }

  return {
    signal(peer, rtc) { onSignal(peer, rtc).catch(() => fail(peer)); },
    // roster changed: drop links to departed peers (or to the old host); a guest links to the current host
    sync() {
      const seated = new Set(room.players.map((p) => p.id));
      for (const peer of [...links.keys()]) if (!seated.has(peer) || (!room.isHost && peer !== room.host)) close(peer);
      const host = room.host;
      if (room.isHost || host == null || links.has(host) || gaveUp.has(host)) return;
      offer(host).catch(() => fail(host));
    },
    isOpen: (peer) => links.get(peer)?.ch.readyState === 'open',
    /** payload: JSON string or Uint8Array; true when sent directly, false = caller sends it by relay */
    trySend(peer, payload) {
      const ch = links.get(peer)?.ch;
      if (ch?.readyState !== 'open' || ch.bufferedAmount > BUFFER_LIMIT) return false;
      try { ch.send(payload); return true; } catch { return false; }
    },
    get openCount() { return [...links.keys()].filter((p) => links.get(p).ch.readyState === 'open').length; },
    closeAll() { for (const peer of [...links.keys()]) close(peer); },
  };
}
