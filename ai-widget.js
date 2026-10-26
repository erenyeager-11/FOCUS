/* Asth: floating robot + doubt-solver chat. Self-contained (Shadow DOM), black theme. */
(function () {
  if (window.__svAI) return; window.__svAI = 1;
  const CFG = Object.assign({ endpoint: '', pollinationsKey: '' }, window.SV_AI || {});
  const SYS = "You are Asth, a friendly study tutor inside a student's study app. Your name is Asth. Explain doubts clearly and step by step with short examples. Keep answers concise and well structured. Reply in the same language the student writes in (Hinglish is fine). For maths and science show the working. If you are unsure, say so instead of guessing.";
  const SIZE = 58, M = 10;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const LSset = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

  try {
    if (!document.getElementById('sv-ai-font')) {
      const l = document.createElement('link'); l.id = 'sv-ai-font'; l.rel = 'stylesheet';
      l.href = 'https://fonts.googleapis.com/css2?family=Pinyon+Script&family=Great+Vibes&display=swap';
      document.head.appendChild(l);
    }
  } catch (e) {}
  const host = document.createElement('div');
  host.id = 'sv-ai-host';
  host.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:80';
  document.body.appendChild(host);
  const root = host.attachShadow({ mode: 'open' });

  const ROBOT = (cls) => `<svg class="${cls || ''}" viewBox="0 0 64 64" aria-hidden="true">
    <line x1="32" y1="7" x2="32" y2="15" stroke="#4a4a52" stroke-width="2" stroke-linecap="round"/>
    <circle class="ant" cx="32" cy="5" r="3.2" fill="#ffb454"/>
    <rect x="4" y="27" width="6" height="11" rx="3" fill="#1b1b20" stroke="#34343b"/>
    <rect x="54" y="27" width="6" height="11" rx="3" fill="#1b1b20" stroke="#34343b"/>
    <rect x="10" y="15" width="44" height="35" rx="13" fill="#0d0d10" stroke="#3a3a42" stroke-width="2"/>
    <rect x="15" y="21" width="34" height="23" rx="9" fill="#050506"/>
    <ellipse class="eye" cx="25" cy="31.5" rx="4" ry="5" fill="#ffb454"/>
    <ellipse class="eye" cx="39" cy="31.5" rx="4" ry="5" fill="#ffb454"/>
    <path d="M26 40 q6 4 12 0" stroke="#ffb454" stroke-width="2" fill="none" stroke-linecap="round" opacity=".85"/>
    <rect x="21" y="51" width="22" height="7" rx="3.5" fill="#0d0d10" stroke="#3a3a42" stroke-width="1.5"/>
  </svg>`;

  const ICON = {
    full: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    small: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>',
    plus: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
    x: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
    send: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    stop: '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="2.5"/></svg>'
  };
  const SWASH = '<svg class="swash" viewBox="0 0 120 12" preserveAspectRatio="none" aria-hidden="true"><defs><linearGradient id="sg" x1="0" x2="1"><stop offset="0" stop-color="#ffb454" stop-opacity="0"/><stop offset=".5" stop-color="#ffcf8f"/><stop offset="1" stop-color="#ffb454" stop-opacity="0"/></linearGradient></defs><path d="M2 8 C 25 2, 55 2, 118 7 C 80 5, 40 8, 14 10" fill="none" stroke="url(#sg)" stroke-width="1.6" stroke-linecap="round"/></svg>';

  root.innerHTML = `
<style>
:host{all:initial}
*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}
.wm{font-family:"Pinyon Script","Great Vibes","Snell Roundhand","Brush Script MT","Segoe Script",cursive;font-weight:400;background:linear-gradient(120deg,#fff3dc 10%,#ffc46b 55%,#ff9d3f);-webkit-background-clip:text;background-clip:text;color:transparent;-webkit-text-fill-color:transparent;line-height:1;letter-spacing:.5px}
#bot{position:fixed;width:${SIZE}px;height:${SIZE}px;border-radius:50%;background:radial-gradient(circle at 30% 22%,#222228,#050506 70%);box-shadow:0 0 0 1px #34343c,0 14px 34px rgba(0,0,0,.6),0 0 26px rgba(255,180,84,.3);display:grid;place-items:center;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;transition:box-shadow .25s,transform .2s}
#bot::before{content:"";position:absolute;inset:-5px;border-radius:50%;border:1px solid rgba(255,180,84,.35);animation:ring 2.8s ease-out infinite}
#bot:hover{box-shadow:0 0 0 1px #4a4a54,0 14px 34px rgba(0,0,0,.6),0 0 38px rgba(255,180,84,.55)}
#bot.drag{cursor:grabbing;transform:scale(1.1)}#bot.drag::before{animation:none;opacity:0}
#bot svg{width:40px;height:40px;animation:fl 3.2s ease-in-out infinite;pointer-events:none}
#bot .tip{position:absolute;bottom:calc(100% + 10px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#0b0b0d;border:1px solid #2c2c33;color:#f0f0f2;font-size:14px;padding:5px 12px 3px;border-radius:12px;opacity:0;pointer-events:none;transition:.2s}
#bot .tip .wm{font-size:22px}
#bot:hover .tip{opacity:1}#bot.drag .tip{opacity:0}
.eye{transform-box:fill-box;transform-origin:center;animation:blink 4.5s infinite}
.ant{animation:pulse 1.8s ease-in-out infinite}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
@keyframes pulse{50%{opacity:.25}}
@keyframes fl{50%{transform:translateY(-2px)}}
@keyframes ring{0%{transform:scale(.92);opacity:.9}100%{transform:scale(1.35);opacity:0}}
@keyframes rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}

#panel{position:fixed;bottom:14px;width:min(420px,calc(100vw - 20px));height:min(660px,calc(100dvh - 28px));background:radial-gradient(120% 60% at 50% 0%,#17120a 0%,#09090b 55%) ,#08080a;border:1px solid #26262d;border-radius:26px;box-shadow:0 34px 90px rgba(0,0,0,.7),0 0 0 1px rgba(255,255,255,.03) inset;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;color:#ececee;opacity:0;transform:translateY(18px) scale(.97);visibility:hidden;transition:opacity .22s,transform .22s,visibility .22s,width .25s,height .25s,border-radius .25s}
#panel.open{opacity:1;transform:none;visibility:visible}
#panel.r{right:10px}#panel.l{left:10px}
#panel.full{inset:0;width:100vw;height:100dvh;border-radius:0;border:0}
header{display:flex;align-items:center;gap:12px;padding:14px 14px 12px;border-bottom:1px solid #1b1b20;background:linear-gradient(180deg,rgba(255,255,255,.035),transparent)}
header .av{width:44px;height:44px;border-radius:15px;background:radial-gradient(circle at 30% 25%,#202026,#050506);border:1px solid #30303a;display:grid;place-items:center;flex:none;box-shadow:0 0 18px rgba(255,180,84,.18)}
header .av svg{width:32px;height:32px}
header .t{flex:1;min-width:0;position:relative}
header .t .wm{font-size:34px;display:block;padding-top:2px}
header .t .swash{position:absolute;left:0;top:34px;width:92px;height:8px}
header small{display:block;color:#8b8b94;font-size:11.5px;margin-top:5px}
header small i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#46d68c;margin-right:6px;box-shadow:0 0 8px #46d68c}
header button{width:36px;height:36px;border-radius:12px;color:#9c9ca6;display:grid;place-items:center;transition:.15s}
header button:hover{background:#18181d;color:#fff}
#msgs{flex:1;overflow-y:auto;padding:18px 16px;display:flex;flex-direction:column;gap:16px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#2a2a30 transparent}
#panel.full #msgs{padding-inline:max(16px,calc((100% - 840px)/2))}
#panel.full footer{padding-inline:max(14px,calc((100% - 840px)/2))}
.empty{margin:auto;text-align:center;color:#8b8b94;padding:6px;width:100%;animation:rise .5s}
.empty .hero{width:92px;height:92px;margin:0 auto 4px;border-radius:50%;display:grid;place-items:center;background:radial-gradient(circle,rgba(255,180,84,.18),transparent 68%)}
.empty .hero svg{width:66px;height:66px}
.empty .wm{font-size:58px;display:block;margin-top:2px}
.empty .swash{width:130px;height:10px;margin:-2px auto 8px;display:block}
.empty p{font-size:13.5px;line-height:1.55;margin:0 auto 18px;max-width:300px}
.chips{display:grid;grid-template-columns:1fr 1fr;gap:9px;max-width:420px;margin:0 auto}
.chips button{text-align:left;background:linear-gradient(180deg,#121216,#0c0c0f);border:1px solid #24242b;color:#d4d4da;font-size:12.5px;line-height:1.35;padding:11px 12px;border-radius:15px;transition:.18s;display:flex;gap:9px;align-items:flex-start}
.chips button span{font-size:17px;line-height:1}
.chips button:hover{border-color:#ffb454;color:#fff;transform:translateY(-2px);box-shadow:0 8px 20px rgba(255,180,84,.08)}
.m{max-width:92%;font-size:14.2px;line-height:1.6;word-wrap:break-word;overflow-wrap:anywhere;animation:rise .25s}
.m.u{align-self:flex-end;background:linear-gradient(135deg,#ffc46b,#ff9d3f);color:#1a0f00;padding:10px 14px;border-radius:18px 18px 4px 18px;white-space:pre-wrap;font-weight:500;box-shadow:0 6px 18px rgba(255,157,63,.15)}
.m.a{align-self:flex-start;background:#0e0e11;border:1px solid #1f1f25;padding:10px 14px 6px;border-radius:18px 18px 18px 4px;color:#e8e8eb}
.m.a .who{margin:-2px 0 4px}.m.a .who .wm{font-size:22px}
.m.a p{margin:0 0 9px}.m.a h4{margin:12px 0 6px;font-size:14.5px;color:#fff}
.m.a ul,.m.a ol{margin:4px 0 9px;padding-left:20px}.m.a li{margin:3px 0}
.m.a code{background:#17171c;border:1px solid #26262d;padding:1px 6px;border-radius:6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.6px;color:#ffcf8f}
.m.a pre{background:#050506;border:1px solid #23232a;border-radius:12px;padding:11px 13px;overflow-x:auto;margin:6px 0 10px}
.m.a pre code{background:none;border:0;padding:0;color:#dcdce1}
.m.a b{color:#fff}
.m.err{align-self:stretch;max-width:100%;border:1px solid #4a2222;background:#1a0d0d;color:#ffb3a8;padding:11px 13px;border-radius:14px;font-size:13px}
.m.err .why{margin-top:8px;padding:8px 10px;background:#120808;border:1px solid #3a1c1c;border-radius:10px;font:11.5px/1.5 ui-monospace,Menlo,Consolas,monospace;color:#e8a89e;word-break:break-word}
.m.err button{margin-top:9px;display:block;background:#2a1414;border:1px solid #5a2a2a;padding:6px 13px;border-radius:99px;color:#ffd0c8;font-size:12px}
.acts{display:flex;gap:6px;margin:2px -6px 0}
.acts button{font-size:11.5px;color:#74747d;padding:3px 8px;border-radius:8px}.acts button:hover{background:#18181d;color:#fff}
.dots{display:inline-flex;gap:5px;padding:12px 15px;background:#0e0e11;border:1px solid #1f1f25;border-radius:18px 18px 18px 4px;align-self:flex-start}
.dots i{width:7px;height:7px;border-radius:50%;background:#ffb454;animation:dd 1.1s infinite}.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
@keyframes dd{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
footer{padding:10px 14px 12px;background:linear-gradient(0deg,#08080a 70%,transparent)}
.box{display:flex;align-items:flex-end;gap:8px;background:#101013;border:1px solid #26262d;border-radius:22px;padding:6px 6px 6px 16px;transition:border-color .2s,box-shadow .2s}
.box:focus-within{border-color:#ffb454;box-shadow:0 0 0 4px rgba(255,180,84,.09)}
textarea{flex:1;background:none;border:0;outline:0;resize:none;color:#f2f2f4;font-size:14.5px;line-height:1.45;max-height:130px;padding:9px 0;font-family:inherit}
textarea::placeholder{color:#6a6a73}
#send{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ffc46b,#ff9d3f);color:#1a0f00;display:grid;place-items:center;flex:none;transition:.15s}
#send:hover{filter:brightness(1.08);transform:scale(1.05)}#send.stop{background:#26262c;color:#fff}
.foot{text-align:center;color:#4e4e56;font-size:11px;margin-top:8px}
@media(max-width:520px){#panel{width:calc(100vw - 16px);height:min(80dvh,680px);bottom:8px}#panel.r{right:8px}#panel.l{left:8px}#panel.full{inset:0;width:100vw;height:100dvh}.chips{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div id="bot" role="button" tabindex="0" aria-label="Open Asth, your AI doubt solver">${ROBOT()}<span class="tip"><span class="wm">Asth</span></span></div>
<section id="panel" class="r" role="dialog" aria-label="Asth AI">
  <header>
    <div class="av">${ROBOT()}</div>
    <div class="t"><span class="wm">Asth</span>${SWASH}<small><i></i>Your study companion</small></div>
    <button id="fs" title="Full screen" aria-label="Full screen">${ICON.full}</button>
    <button id="new" title="New chat" aria-label="New chat">${ICON.plus}</button>
    <button id="x" title="Close" aria-label="Close">${ICON.x}</button>
  </header>
  <div id="msgs"></div>
  <footer>
    <div class="box"><textarea id="in" rows="1" placeholder="Ask Asth any doubt..." maxlength="4000"></textarea><button id="send" aria-label="Send">${ICON.send}</button></div>
    <div class="foot">Enter to send &middot; Shift+Enter for a new line &middot; AI can make mistakes</div>
  </footer>
</section>`;

  const $ = s => root.querySelector(s);
  const bot = $('#bot'), panel = $('#panel'), msgs = $('#msgs'), input = $('#in'), sendBtn = $('#send');

  /* ---------- robot position: drag it anywhere, it stays exactly where you drop it ---------- */
  let pos; try { pos = JSON.parse(LS('svaipos2')); } catch (e) {}
  if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') pos = { x: 0.92, y: 0.6 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let side = 'r';
  function place() {
    const W = innerWidth, H = innerHeight;
    const x = clamp(pos.x * (W - SIZE), 0, Math.max(0, W - SIZE)), y = clamp(pos.y * (H - SIZE), 0, Math.max(0, H - SIZE));
    bot.style.transition = 'none'; bot.style.right = bot.style.bottom = 'auto';
    bot.style.left = x + 'px'; bot.style.top = y + 'px';
    side = x + SIZE / 2 < W / 2 ? 'l' : 'r';
    panel.classList.toggle('l', side === 'l'); panel.classList.toggle('r', side === 'r');
  }
  place();
  addEventListener('resize', place);
  let drag = null;
  bot.addEventListener('pointerdown', e => {
    const r = bot.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
    try { bot.setPointerCapture(e.pointerId); } catch (_) {}
  });
  bot.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
    drag.moved = true; bot.classList.add('drag');
    drag.x = clamp(e.clientX - drag.dx, 0, innerWidth - SIZE);
    drag.y = clamp(e.clientY - drag.dy, 0, innerHeight - SIZE);
    bot.style.left = drag.x + 'px'; bot.style.top = drag.y + 'px';
  });
  const endDrag = e => {
    if (!drag) return; const d = drag; drag = null; bot.classList.remove('drag');
    if (!d.moved) { if (e.type === 'pointerup') openPanel(); return; }
    pos = { x: d.x / Math.max(1, innerWidth - SIZE), y: d.y / Math.max(1, innerHeight - SIZE) };
    LSset('svaipos2', JSON.stringify(pos)); place();
  };
  bot.addEventListener('pointerup', endDrag); bot.addEventListener('pointercancel', endDrag);
  bot.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); return; }
    const st = 0.04, k = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
    if (k) { e.preventDefault(); pos = { x: clamp(pos.x + k[0], 0, 1), y: clamp(pos.y + k[1], 0, 1) }; LSset('svaipos2', JSON.stringify(pos)); place(); }
  });

  /* ---------- chat state ---------- */
  let hist = []; try { hist = JSON.parse(LS('svai') || '[]').filter(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'); } catch (e) {}
  const saveHist = () => LSset('svai', JSON.stringify(hist.slice(-30)));
  let busy = false, ctrl = null;

  const E = s => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  function md(src) {
    const code = []; src = src.replace(/```[\w-]*\n?([\s\S]*?)```/g, (_, c) => { code.push(c.replace(/\n$/, '')); return '\n@@C' + (code.length - 1) + '@@\n'; });
    const h = E(src).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g, '<b>$1</b>');
    const out = []; let list = null; const close = () => { if (list) { out.push('</' + list + '>'); list = null; } };
    h.split('\n').forEach(line => {
      let m;
      if ((m = line.match(/^@@C(\d+)@@$/))) { close(); out.push('<pre><code>' + E(code[m[1]] || '') + '</code></pre>'); return; }
      if ((m = line.match(/^\s*(?:[-*\u2022]|\d+[.)])\s+(.*)/))) { const t = /^\s*\d/.test(line) ? 'ol' : 'ul'; if (list !== t) { close(); out.push('<' + t + '>'); list = t; } out.push('<li>' + m[1] + '</li>'); return; }
      close();
      if ((m = line.match(/^#{1,6}\s+(.*)/))) { out.push('<h4>' + m[1] + '</h4>'); return; }
      if (!line.trim()) return;
      out.push('<p>' + line + '</p>');
    });
    close(); return out.join('');
  }

  const CHIPS = [['\uD83C\uDF4E', "Explain Newton's laws simply"], ['\uD83E\uDDEE', 'Solve: 2x\u00B2 \u2212 5x + 3 = 0'], ['\uD83E\uDDEC', 'Mitosis vs meiosis'], ['\uD83D\uDCA1', 'Tips to remember formulas']];
  function empty() {
    return `<div class="empty"><div class="hero">${ROBOT()}</div><span class="wm">Asth</span>${SWASH}<p>Stuck on something? Ask me any doubt in maths, science, coding or English. Ask as many as you like.</p><div class="chips">${CHIPS.map(c => `<button data-q="${E(c[1])}"><span>${c[0]}</span>${E(c[1])}</button>`).join('')}</div></div>`;
  }
  function bottom() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(role, text) {
    const d = document.createElement('div'); d.className = 'm ' + (role === 'user' ? 'u' : 'a');
    if (role === 'user') d.textContent = text;
    else { d.innerHTML = '<div class="who"><span class="wm">Asth</span></div>' + md(text) + '<div class="acts"><button data-copy>Copy</button></div>'; d._t = text; }
    msgs.appendChild(d); bottom(); return d;
  }
  function render() {
    msgs.innerHTML = '';
    if (!hist.length) { msgs.innerHTML = empty(); return; }
    hist.forEach(m => addMsg(m.role, m.content));
  }
  msgs.addEventListener('click', e => {
    const q = e.target.closest('[data-q]'); if (q) { send(q.getAttribute('data-q')); return; }
    const c = e.target.closest('[data-copy]');
    if (c) { const t = c.closest('.m')._t || ''; (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject()).then(() => { c.textContent = 'Copied'; setTimeout(() => c.textContent = 'Copy', 1200); }).catch(() => {}); return; }
    if (e.target.closest('[data-retry]')) { const last = [...hist].reverse().find(m => m.role === 'user'); root.querySelectorAll('.m.err').forEach(n => n.remove()); if (last) { hist.pop(); send(last.content); } }
  });

  /* ---------- AI request chain: your Worker first (7 providers), then keyless Pollinations ---------- */
  const withTimeout = (ms, outer) => { const c = new AbortController(); const t = setTimeout(() => c.abort(), ms); if (outer) outer.addEventListener('abort', () => c.abort()); return { signal: c.signal, done: () => clearTimeout(t) }; };
  async function post(url, body, signal, headers) {
    const r = await fetch(url, { method: 'POST', headers: Object.assign({ 'Content-Type': 'application/json' }, headers || {}), body: JSON.stringify(body), signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return r;
  }
  const chatParse = j => { const t = j && j.choices && j.choices[0] && j.choices[0].message && j.choices[0].message.content; if (!t) throw new Error('empty'); return String(t).trim(); };
  async function viaWorker(messages, sig) {
    let r;
    try { r = await fetch(CFG.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages }), signal: sig }); }
    catch (e) { if (e && e.name === 'AbortError') throw e; throw new Error('Worker: cannot connect (wrong Worker URL, or ALLOWED_ORIGINS does not match this site: ' + location.origin + ')'); }
    let j = null; try { j = await r.json(); } catch (e) {}
    if (!r.ok || !j || !j.reply) {
      const why = j && j.details && j.details.length ? j.details.join(' | ') : (j && j.error) || ('HTTP ' + r.status);
      throw new Error('Worker (' + r.status + '): ' + why);
    }
    return j.reply;
  }
  async function viaPollGen(messages, sig) {
    const h = CFG.pollinationsKey ? { Authorization: 'Bearer ' + CFG.pollinationsKey } : {};
    const r = await post('https://gen.pollinations.ai/v1/chat/completions', { model: 'openai', messages: [{ role: 'system', content: SYS }, ...messages] }, sig, h); return chatParse(await r.json());
  }
  async function viaPollLegacy(messages, sig) {
    const r = await post('https://text.pollinations.ai/openai', { model: 'openai', messages: [{ role: 'system', content: SYS }, ...messages] }, sig); return chatParse(await r.json());
  }
  async function viaPollGet(messages, sig) {
    const ctx = messages.slice(-4).map(m => (m.role === 'user' ? 'Student: ' : 'Tutor: ') + m.content.slice(0, 500)).join('\n');
    const r = await fetch('https://gen.pollinations.ai/text/' + encodeURIComponent(ctx).slice(0, 1800) + '?system=' + encodeURIComponent(SYS), { signal: sig });
    if (!r.ok) throw new Error('HTTP ' + r.status); const t = (await r.text()).trim(); if (!t) throw new Error('empty'); return t;
  }
  async function ask(messages, outer) {
    const chain = []; if (CFG.endpoint) chain.push(viaWorker); if (CFG.pollinationsKey) chain.push(viaPollGen);
    if (!chain.length) { const e = new Error('not connected'); e.diag = ['Asth is not connected yet: paste your Worker URL into window.SV_AI in index.html']; throw e; }
    let last; const diag = [];
    for (const fn of chain) {
      if (outer && outer.aborted) throw new DOMException('stop', 'AbortError');
      const w = withTimeout(30000, outer);
      try { const t = await fn(messages, w.signal); w.done(); return t; }
      catch (e) { w.done(); if (outer && outer.aborted) throw e; last = e; diag.push((fn === viaWorker ? '' : fn.name.replace('via', '') + ': ') + (e && e.message || e)); }
    }
    const err = last || new Error('failed'); err.diag = diag; throw err;
  }

  async function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    busy = true; sendBtn.classList.add('stop'); sendBtn.innerHTML = ICON.stop; sendBtn.setAttribute('aria-label', 'Stop');
    if (!hist.length) msgs.innerHTML = '';
    hist.push({ role: 'user', content: text }); addMsg('user', text); input.value = ''; autosize();
    const dots = document.createElement('div'); dots.className = 'dots'; dots.innerHTML = '<i></i><i></i><i></i>'; msgs.appendChild(dots); bottom();
    ctrl = new AbortController();
    const ctx = hist.slice(-12).map(m => ({ role: m.role, content: m.content.slice(0, 4000) }));
    try {
      const reply = await ask(ctx, ctrl.signal);
      dots.remove(); hist.push({ role: 'assistant', content: reply }); addMsg('assistant', reply); saveHist();
    } catch (e) {
      dots.remove();
      if (e && e.name === 'AbortError') { hist.pop(); saveHist(); }
      else { const d = document.createElement('div'); d.className = 'm err'; d.innerHTML = 'Asth is a little busy right now. Please try again in a few seconds.' + ((e && e.diag) ? '<div class="why">' + e.diag.map(x => E(String(x))).join('<br>') + '</div>' : '') + '<button data-retry>Try again</button>'; msgs.appendChild(d); bottom(); saveHist(); }
    }
    busy = false; ctrl = null; sendBtn.classList.remove('stop'); sendBtn.innerHTML = ICON.send; sendBtn.setAttribute('aria-label', 'Send');
  }

  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); } });
  sendBtn.addEventListener('click', () => { if (busy && ctrl) ctrl.abort(); else send(input.value); });
  $('#new').addEventListener('click', () => { if (ctrl) ctrl.abort(); hist = []; saveHist(); render(); });
  $('#x').addEventListener('click', closePanel);
  const fsBtn = $('#fs');
  function setFull(on) { panel.classList.toggle('full', on); fsBtn.innerHTML = on ? ICON.small : ICON.full; fsBtn.title = on ? 'Exit full screen' : 'Full screen'; setTimeout(bottom, 260); }
  fsBtn.addEventListener('click', () => setFull(!panel.classList.contains('full')));
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) { if (panel.classList.contains('full')) setFull(false); else closePanel(); } });

  function openPanel() { place(); panel.classList.add('open'); bot.style.visibility = 'hidden'; render(); setTimeout(() => input.focus(), 150); }
  function closePanel() { panel.classList.remove('open'); bot.style.visibility = ''; }

  window.SVAI = { open: openPanel, close: closePanel, ask: send };
})();
