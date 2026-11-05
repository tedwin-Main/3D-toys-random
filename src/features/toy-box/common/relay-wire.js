// Encodes and parses room relay data frames: short text header, JSON payload passed through the relay unparsed.
// Shared by browser room client and Node relay, so no Buffer here.

// client > relay: ">" + to + "|" + sticky + "|" + json   (to = "" for everyone else, "7" or "3,7,9" for listed peers)
// relay > client: "<" + from + "|" + json
// binary frames carry the same ASCII header before raw payload bytes (party royale snapshots)
export const SEND_MARK = '>';
// peer id of a host the relay itself runs (party royale rounds); seated players get ids from 1
export const SERVER_PEER = 0;
export const DELIVER_MARK = '<';
const TO_LIST = /^(?:\d{1,9}(?:,\d{1,9})*)?$/;
const BAR = '|'.charCodeAt(0);
const ascii = new TextEncoder(), text = new TextDecoder();

/** client: wrap a JSON string for the relay; to = peer id, id list, or null for everyone else */
export function encodeSend(json, { to = null, sticky = false } = {}) {
  const ids = to == null ? '' : [].concat(to).join(',');
  return `${SEND_MARK}${ids}|${sticky ? 1 : 0}|${json}`;
}

/** client: same as encodeSend for a byte payload; returns header + bytes */
export function encodeSendBytes(bytes, opts) {
  const head = ascii.encode(encodeSend('', opts));
  const out = new Uint8Array(head.length + bytes.length);
  out.set(head);
  out.set(bytes, head.length);
  return out;
}

/** relay: header between the mark and the payload ("to|sticky"); null when malformed */
export function parseSendHeader(head) {
  const bar = head.indexOf('|');
  const ids = head.slice(0, bar), sticky = head.slice(bar + 1);
  if (bar < 0 || !TO_LIST.test(ids) || (sticky !== '0' && sticky !== '1')) return null;
  return { to: ids ? ids.split(',').map(Number) : null, sticky: sticky === '1' };
}

/** relay: prefix put before the untouched payload; from comes from the relay, never from the sender */
export const deliverPrefix = (from) => `${DELIVER_MARK}${from}|`;

/** client: any relay frame > message; data frames become { t: 'data', from, data } (data = Uint8Array for binary frames). Throws on bad JSON. */
export function decodeFrame(frame) {
  if (frame instanceof ArrayBuffer) return decodeBinary(new Uint8Array(frame));
  if (frame[0] !== DELIVER_MARK) return JSON.parse(frame);
  const bar = frame.indexOf('|');
  return { t: 'data', from: Number(frame.slice(1, bar)), data: JSON.parse(frame.slice(bar + 1)) };
}

function decodeBinary(bytes) {
  const bar = bytes.indexOf(BAR);
  return { t: 'data', from: Number(text.decode(bytes.subarray(1, bar))), data: bytes.subarray(bar + 1) };
}
