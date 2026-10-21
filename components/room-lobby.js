/**
 * FILE: 3d-toys/components/room-lobby.js
 * PURPOSE: drop-in lobby overlay for multiplayer toys: nickname, create/join by code, invite links (local + LAN), roster, host bots + settings + Start, back-to-lobby after a match
 * UI: lobby overlay on every multiplayer toy
 * USED BY: multiplayer toy pages (e.g. bumper-sumo-arena/index.html)
 * KEY EXPORTS: createLobby
 */
import { connectRoom } from './room-client.js';

const CSS = `
.lb-wrap { position: fixed; inset: 0; display: grid; place-items: center; z-index: 50; background: rgba(8, 10, 18, 0.55); backdrop-filter: blur(6px); font-family: ui-rounded, "SF Pro Rounded", system-ui, sans-serif; color: #f2f4fa; padding: 16px; }
.lb-wrap[hidden] { display: none; }
.lb-card { width: min(440px, 100%); max-height: calc(100vh - 32px); overflow: auto; background: rgba(22, 25, 36, 0.94); border: 1px solid rgba(255,255,255,0.09); border-radius: 20px; padding: 22px; box-shadow: 0 20px 60px rgba(0,0,0,0.45); }
.lb-card h1 { margin: 0; font-size: 26px; letter-spacing: -0.02em; display: flex; gap: 10px; align-items: center; }
.lb-card .lb-blurb { color: #9aa3b8; font-size: 14px; line-height: 1.5; margin: 6px 0 16px; }
.lb-card label { display: block; font-size: 12px; font-weight: 700; color: #9aa3b8; text-transform: uppercase; letter-spacing: 0.06em; margin: 12px 0 6px; }
.lb-card input { width: 100%; font: inherit; font-size: 16px; padding: 11px 12px; border-radius: 11px; border: 1px solid #2c3142; background: #0f121a; color: inherit; outline: none; }
.lb-card input:focus { border-color: var(--lb-accent); }
.lb-row { display: flex; gap: 8px; }
.lb-btn { font: inherit; font-weight: 700; font-size: 15px; padding: 11px 16px; border-radius: 11px; border: 0; cursor: pointer; background: #2a2f40; color: inherit; white-space: nowrap; }
.lb-btn:hover { filter: brightness(1.15); }
.lb-btn.main { background: var(--lb-accent); color: #14100a; }
.lb-btn:disabled { opacity: 0.45; cursor: default; filter: none; }
.lb-or { text-align: center; color: #5d667c; font-size: 12px; margin: 14px 0 2px; }
.lb-code { font-size: 40px; font-weight: 800; letter-spacing: 0.25em; color: var(--lb-accent); }
.lb-err { color: #ff7b7b; font-size: 13px; min-height: 18px; margin-top: 10px; }
.lb-links { display: grid; grid-template-columns: minmax(0, 1fr); gap: 6px; margin-top: 8px; }
.lb-link { display: flex; gap: 6px; align-items: center; font-size: 12.5px; background: #0f121a; border: 1px solid #2c3142; border-radius: 10px; padding: 6px 6px 6px 10px; }
.lb-link span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: #c6cde0; }
.lb-link button { font: inherit; font-size: 12px; font-weight: 700; border: 0; border-radius: 7px; padding: 5px 9px; cursor: pointer; background: #2a2f40; color: inherit; }
.lb-players { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
.lb-chip { display: flex; align-items: center; gap: 6px; padding: 5px 10px 5px 6px; border-radius: 999px; background: #232838; font-size: 14px; font-weight: 600; }
.lb-chip i { width: 14px; height: 14px; border-radius: 50%; display: inline-block; }
.lb-chip small { color: #8a93a8; font-weight: 500; }
.lb-bots { display: flex; align-items: center; gap: 10px; margin-top: 4px; font-size: 14px; }
.lb-bots input { width: auto; flex: 1; padding: 0; accent-color: var(--lb-accent); }
.lb-wait { color: #9aa3b8; font-size: 14px; text-align: center; padding: 10px; }
.lb-foot { margin-top: 16px; display: flex; gap: 8px; }
.lb-foot .lb-btn.main { flex: 1; }
.lb-set { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; align-items: center; margin-top: 6px; font-size: 14px; }
.lb-set select { font: inherit; font-size: 14px; padding: 7px 9px; border-radius: 9px; border: 1px solid #2c3142; background: #0f121a; color: inherit; }
.lb-set b { color: #f2f4fa; }
.lb-set span { color: #9aa3b8; }
.lb-note { color: #6f7890; font-size: 12px; margin-top: 10px; line-height: 1.5; }
`;

const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

/**
 * opts: { game, title, emoji, blurb, accent, maxBots, defaultBots, minPlayers, note,
 *         maxTotal (seat cap, default 14), settings ([{ key, label, options: [[value, label]], value }], host picks),
 *         onJoin(room), onStart({ seed, bots, isHost, late, settings }), onLobby() }
 * Lobby control messages carry `_lobby`; games must ignore data with that key.
 */
export function createLobby(opts) {
  const { game, title, emoji = '🎮', blurb = '', accent = '#ffbf2f', maxBots = 0, defaultBots = 0, minPlayers = 1, maxTotal = 14, note = '', settings = [] } = opts;
  if (!document.getElementById('lb-style')) {
    const st = document.createElement('style');
    st.id = 'lb-style';
    st.textContent = CSS;
    document.head.append(st);
  }
  const wrap = document.createElement('div');
  wrap.className = 'lb-wrap';
  wrap.style.setProperty('--lb-accent', accent);
  document.body.append(wrap);
  const urlRoom = new URLSearchParams(location.search).get('room') ?? '';
  const state = { room: null, running: false, seed: 0, bots: defaultBots, lan: null, settings: Object.fromEntries(settings.map((s) => [s.key, s.value])) };
  fetch('/3d-toys/lan.json').then((r) => r.json()).then((j) => { state.lan = j; if (state.room) renderRoom(); }).catch(() => {});

  // Lobby > Join panel: nickname + create or join by code
  function renderJoin(err = '') {
    wrap.innerHTML = `<div class="lb-card">
      <h1><span>${emoji}</span><span class="lb-t"></span></h1>
      <div class="lb-blurb"></div>
      <label>Nickname</label>
      <input class="lb-nick" maxlength="16" placeholder="Your name" autocomplete="off" />
      ${urlRoom ? '' : '<div class="lb-row" style="margin-top:12px"><button class="lb-btn main lb-create" style="flex:1">Create room</button></div><div class="lb-or">or join a friend</div>'}
      <label>Room code</label>
      <div class="lb-row"><input class="lb-code-in" maxlength="4" placeholder="ABCD" autocomplete="off" style="text-transform:uppercase;letter-spacing:0.2em;font-weight:700" /><button class="lb-btn ${urlRoom ? 'main' : ''} lb-join">Join</button></div>
      <div class="lb-err"></div>
      ${note ? `<div class="lb-note">${note}</div>` : ''}
    </div>`;
    wrap.querySelector('.lb-t').textContent = title;
    wrap.querySelector('.lb-blurb').textContent = blurb;
    wrap.querySelector('.lb-err').textContent = err;
    const nick = wrap.querySelector('.lb-nick'), code = wrap.querySelector('.lb-code-in');
    nick.value = store.get('toybox-nick') ?? '';
    code.value = urlRoom;
    const go = async (roomCode) => {
      const n = nick.value.trim() || `Player${Math.floor(Math.random() * 90 + 10)}`;
      store.set('toybox-nick', n);
      wrap.querySelectorAll('button').forEach((b) => (b.disabled = true));
      try { await join(n, roomCode); } catch (e) { renderJoin(e.message); }
    };
    wrap.querySelector('.lb-create')?.addEventListener('click', () => go(''));
    wrap.querySelector('.lb-join').addEventListener('click', () => { if (code.value.trim().length === 4) go(code.value.trim()); else wrap.querySelector('.lb-err').textContent = 'Enter a 4-letter code.'; });
    [nick, code].forEach((el) => el.addEventListener('keydown', (e) => {
      e.stopPropagation();
      if (e.key === 'Enter') (urlRoom || code.value.trim() ? wrap.querySelector('.lb-join') : wrap.querySelector('.lb-create'))?.click();
    }));
    (nick.value ? (urlRoom ? wrap.querySelector('.lb-join') : wrap.querySelector('.lb-create')) : nick).focus();
  }

  function inviteLinks() {
    const dir = location.pathname.split('/').filter(Boolean).pop();
    const mk = (host) => `${location.protocol}//${host}/3d-toys/#${dir}?room=${state.room.code}`;
    const local = ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname);
    const links = [[local ? 'This computer' : 'Invite link', mk(location.host)]];
    if (local && state.lan?.ip) links.push(['Same Wi-Fi', mk(`${state.lan.ip}:${location.port || state.lan.port}`)]);
    return links;
  }

  // Lobby > Room panel: code, invite links, roster, host bots + Start
  function renderRoom() {
    const r = state.room;
    if (!r || state.running) return;
    const humans = r.players.length;
    // humans + bots never exceed the 14-seat room cap
    const botMax = Math.max(0, Math.min(maxBots, maxTotal - humans));
    state.bots = Math.min(state.bots, botMax);
    wrap.innerHTML = `<div class="lb-card">
      <h1><span>${emoji}</span><span class="lb-t"></span></h1>
      <label>Room code</label>
      <div class="lb-code">${r.code}</div>
      <div class="lb-links"></div>
      <label>Players (${humans})</label>
      <div class="lb-players"></div>
      ${r.isHost && botMax ? `<label>Bots</label><div class="lb-bots"><input type="range" min="0" max="${botMax}" step="1" value="${state.bots}" class="lb-bot-in" /><b class="lb-bot-n">${state.bots}</b></div>` : ''}
      ${settings.length ? '<label>Settings</label><div class="lb-set"></div>' : ''}
      ${r.isHost ? `<div class="lb-foot"><button class="lb-btn lb-leave">Leave</button><button class="lb-btn main lb-start">Start</button></div>` : `<div class="lb-wait">Waiting for host to start…</div><div class="lb-foot"><button class="lb-btn lb-leave">Leave</button></div>`}
      ${note ? `<div class="lb-note">${note}</div>` : ''}
    </div>`;
    wrap.querySelector('.lb-t').textContent = title;
    for (const [label, link] of inviteLinks()) {
      const row = document.createElement('div');
      row.className = 'lb-link';
      row.innerHTML = `<b style="font-size:11px;color:#8a93a8;white-space:nowrap">${label}</b><span></span><button>Copy</button>`;
      row.querySelector('span').textContent = link;
      row.querySelector('button').onclick = (e) => {
        navigator.clipboard?.writeText(link).then(() => (e.target.textContent = 'Copied!'), () => (e.target.textContent = 'Select + copy'));
      };
      wrap.querySelector('.lb-links').append(row);
    }
    for (const p of r.players) {
      const c = document.createElement('div');
      c.className = 'lb-chip';
      c.innerHTML = `<i style="background:${p.color}"></i><span></span>${p.id === r.host ? '<small>host</small>' : ''}${p.id === r.me ? '<small>you</small>' : ''}`;
      c.querySelector('span').textContent = p.nick;
      wrap.querySelector('.lb-players').append(c);
    }
    // Lobby > Room panel > Settings: host selects, guests read-only
    for (const s of settings) {
      const set = wrap.querySelector('.lb-set');
      const lab = document.createElement('span');
      lab.textContent = s.label;
      set.append(lab);
      if (r.isHost) {
        const sel = document.createElement('select');
        for (const [v, l] of s.options) sel.append(new Option(l, v, false, String(v) === String(state.settings[s.key])));
        sel.onchange = () => { state.settings[s.key] = s.options.find(([v]) => String(v) === sel.value)[0]; r.send({ _lobby: 'settings', values: state.settings }); };
        set.append(sel);
      } else {
        const b = document.createElement('b');
        b.textContent = s.options.find(([v]) => String(v) === String(state.settings[s.key]))?.[1] ?? '';
        set.append(b);
      }
    }
    const bi = wrap.querySelector('.lb-bot-in');
    if (bi) bi.oninput = () => { state.bots = +bi.value; wrap.querySelector('.lb-bot-n').textContent = bi.value; syncStart(); };
    const start = wrap.querySelector('.lb-start');
    function syncStart() { if (start) start.disabled = humans + state.bots < minPlayers; }
    syncStart();
    if (start) start.onclick = () => startMatch();
    wrap.querySelector('.lb-leave').onclick = () => { r.leave(); state.room = null; renderJoin(); };
  }

  async function join(nick, code) {
    const r = await connectRoom({ game, nick, room: code });
    state.room = r;
    api.room = r;
    // keep ?room= in the toy URL so a refresh rejoins the same room
    try { history.replaceState(null, '', `${location.pathname}?room=${r.code}`); } catch { /* sandboxed */ }
    const seen = new Set(r.players.map((p) => p.id));
    r.on('roster', (players) => {
      // late joiner while a match runs: host sends them the start packet directly
      if (r.isHost && state.running) for (const p of players) if (!seen.has(p.id) && p.id !== r.me) r.send({ _lobby: 'start', seed: state.seed, bots: state.bots, settings: state.settings, late: true }, { to: p.id });
      // newcomers in the room panel need current host settings
      if (r.isHost && !state.running && settings.length) r.send({ _lobby: 'settings', values: state.settings });
      players.forEach((p) => seen.add(p.id));
      renderRoom();
    });
    r.on('host', () => renderRoom());
    r.on('data', (d) => {
      if (!d || !d._lobby) return;
      if (d._lobby === 'settings') { Object.assign(state.settings, d.values); renderRoom(); }
      if (d._lobby === 'start') { state.running = true; state.seed = d.seed; state.bots = d.bots; Object.assign(state.settings, d.settings); wrap.hidden = true; opts.onStart?.({ seed: d.seed, bots: d.bots, isHost: r.isHost, late: !!d.late, settings: { ...state.settings } }); }
      if (d._lobby === 'lobby') { state.running = false; wrap.hidden = false; renderRoom(); opts.onLobby?.(); }
    });
    r.on('close', () => { state.running = false; state.room = null; wrap.hidden = false; renderJoin('Disconnected from room.'); opts.onLobby?.(); });
    opts.onJoin?.(r);
    renderRoom();
  }

  function startMatch() {
    const r = state.room;
    state.seed = Math.floor(Math.random() * 2 ** 31);
    state.running = true;
    r.send({ _lobby: 'start', seed: state.seed, bots: state.bots, settings: state.settings });
    wrap.hidden = true;
    opts.onStart?.({ seed: state.seed, bots: state.bots, isHost: true, late: false, settings: { ...state.settings } });
  }

  const api = {
    room: null,
    get running() { return state.running; },
    get bots() { return state.bots; },
    get settings() { return { ...state.settings }; },
    // host only: end match, everyone back to the room panel
    backToLobby() {
      if (!state.room?.isHost) return;
      state.room.send({ _lobby: 'lobby' });
      state.running = false;
      wrap.hidden = false;
      renderRoom();
      opts.onLobby?.();
    },
    restart() { if (state.room?.isHost) startMatch(); },
  };
  renderJoin();
  return api;
}
