// Encodes and parses room relay data frames: short text header, JSON payload passed through the relay unparsed.
// Shared by browser room client and Node relay, so no Buffer here.

// client > relay: ">" + to + "|" + sticky + "|" + json   (to = "" for everyone else, "7" or "3,7,9" for listed peers)
// relay > client: "<" + from + "|" + json
export const SEND_MARK = '>';
export const DELIVER_MARK = '<';
const TO_LIST = /^(?:\d{1,9}(?:,\d{1,9})*)?$/;

/** client: wrap a JSON string for the relay; to = peer id, id list, or null for everyone else */
export function encodeSend(json, { to = null, sticky = false } = {}) {
  const ids = to == null ? '' : [].concat(to).join(',');
  return `${SEND_MARK}${ids}|${sticky ? 1 : 0}|${json}`;
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

/** client: any relay frame > message; data frames become { t: 'data', from, data }. Throws on bad JSON. */
export function decodeFrame(frame) {
  if (frame[0] !== DELIVER_MARK) return JSON.parse(frame);
  const bar = frame.indexOf('|');
  return { t: 'data', from: Number(frame.slice(1, bar)), data: JSON.parse(frame.slice(bar + 1)) };
}
