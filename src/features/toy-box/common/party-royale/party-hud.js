// Renders party royale HUD: round card, status line, timer, banners, symbol call, results, room bar.

const CSS = `
:root { --pr-card: rgba(24, 14, 44, 0.62); }
html, body { margin: 0; height: 100%; overflow: hidden; background: #8fd3ff; font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif; color: #fff; touch-action: none; }
canvas { display: block; }
.pr-card { position: fixed; background: var(--pr-card); backdrop-filter: blur(8px); border: 1px solid rgba(255,255,255,0.14); border-radius: 14px; user-select: none; }
#pr-status { top: 14px; left: 14px; padding: 9px 13px; font-size: 14px; max-width: min(60vw, 340px); }
#pr-status b { font-size: 22px; color: #ffd23f; }
#pr-timer { top: 14px; left: 50%; transform: translateX(-50%); padding: 6px 14px; font-size: 22px; font-weight: 900; font-variant-numeric: tabular-nums; display: none; }
#pr-call { top: 64px; left: 50%; transform: translateX(-50%); padding: 6px 18px; font-size: 54px; display: none; }
#pr-big { position: fixed; top: 30%; left: 50%; transform: translate(-50%, -50%); font-size: clamp(30px, 8vw, 78px); font-weight: 900; text-shadow: 0 4px 0 rgba(0,0,0,0.3); pointer-events: none; text-align: center; white-space: nowrap; }
#pr-big small { display: block; font-size: 0.32em; font-weight: 700; }
#pr-intro { left: 50%; bottom: 18%; transform: translateX(-50%); padding: 14px 18px; width: min(460px, calc(100vw - 32px)); text-align: center; display: none; }
#pr-intro h2 { margin: 0 0 4px; font-size: 28px; }
#pr-intro p { margin: 4px 0 0; font-size: 15px; line-height: 1.45; opacity: 0.92; }
#pr-intro .k { display: inline-block; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; padding: 2px 9px; border-radius: 999px; background: #ffd23f; color: #2a1450; }
#pr-results { top: 50%; left: 50%; transform: translate(-50%, -50%); padding: 14px 16px; width: min(420px, calc(100vw - 32px)); max-height: 70vh; overflow: auto; display: none; }
#pr-results h3 { margin: 0 0 8px; font-size: 20px; }
#pr-results .row { display: flex; gap: 8px; align-items: center; font-size: 14px; padding: 2px 0; }
#pr-results .row i { width: 10px; height: 10px; border-radius: 50%; flex: none; }
#pr-results .row.out { opacity: 0.5; text-decoration: line-through; }
#pr-results .row.me { color: #ffd23f; font-weight: 800; }
#pr-hint { bottom: 14px; left: 14px; padding: 8px 12px; font-size: 12.5px; opacity: 0.88; }
#pr-top { top: 14px; right: 14px; padding: 6px; display: none; gap: 6px; align-items: center; font-size: 13px; }
#pr-top b { padding: 0 6px; letter-spacing: 0.15em; color: #ffd23f; }
#pr-top button { font: inherit; font-weight: 700; color: inherit; background: rgba(255,255,255,0.12); border: 0; padding: 6px 10px; border-radius: 9px; cursor: pointer; }
@media (pointer: coarse) { #pr-hint { display: none; } }
`;

const KIND_LABEL = { race: 'Race', survival: 'Survival', logic: 'Logic', hunt: 'Hunt', team: 'Team', final: 'Final' };
export const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function createPartyHud({ onLobby }) {
  const st = document.createElement('style');
  st.textContent = CSS;
  document.head.append(st);
  document.body.insertAdjacentHTML('beforeend', `
    <div id="pr-status" class="pr-card"></div>
    <div id="pr-timer" class="pr-card"></div>
    <div id="pr-call" class="pr-card"></div>
    <div id="pr-big"></div>
    <div id="pr-intro" class="pr-card"></div>
    <div id="pr-results" class="pr-card"></div>
    <div id="pr-hint" class="pr-card"><b>WASD</b> run · <b>Space</b> jump · <b>Shift</b> dive · hold <b>E</b> / click grab · <b>Q R</b> turn camera</div>
    <div id="pr-top" class="pr-card"><span>Room</span><b id="pr-code"></b><button id="pr-lobby">Lobby</button></div>`);
  const $ = (id) => document.getElementById(id);
  $('pr-lobby').onclick = onLobby;
  const cache = {};
  const set = (id, html) => { if (cache[id] !== html) { cache[id] = html; $(id).innerHTML = html; } };
  const show = (id, on) => ($(id).style.display = on ? (id === 'pr-top' ? 'flex' : 'block') : 'none');
  let bigT = 0;

  return {
    room(code, isHost) { set('pr-code', esc(code)); show('pr-top', true); $('pr-lobby').style.display = isHost ? '' : 'none'; },
    leaveRoom() { show('pr-top', false); },
    status(html) { set('pr-status', html); },
    timer(sec) { show('pr-timer', sec != null); if (sec != null) set('pr-timer', `${Math.max(0, Math.ceil(sec))}`); },
    call(emoji) { show('pr-call', !!emoji); if (emoji) set('pr-call', emoji); },
    intro(round, line) {
      show('pr-intro', !!round);
      if (round) set('pr-intro', `<span class="k">${KIND_LABEL[round.kind]}</span><h2>${round.emoji} ${esc(round.title)}</h2><p>${esc(round.goal)}</p>${line ? `<p><b>${esc(line)}</b></p>` : ''}`);
    },
    // centre banner; held for sec seconds unless a newer one replaces it
    big(html, sec = 1.6) { set('pr-big', html); bigT = sec; },
    results(title, rows) {
      show('pr-results', !!title);
      if (title) set('pr-results', `<h3>${title}</h3>${rows.map((r) => `<div class="row ${r.out ? 'out' : ''} ${r.me ? 'me' : ''}"><i style="background:${r.color}"></i><span>${esc(r.nick)}</span></div>`).join('')}`);
    },
    tick(dt) { if (bigT > 0 && (bigT -= dt) <= 0) set('pr-big', ''); },
  };
}
