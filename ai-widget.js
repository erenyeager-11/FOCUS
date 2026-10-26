/* Studyverse AI: floating robot + doubt-solver chat. Self-contained (Shadow DOM), black theme. */
(function () {
  if (window.__svAI) return; window.__svAI = 1;
  const CFG = Object.assign({ endpoint: '', pollinationsKey: '' }, window.SV_AI || {});
  const SYS = "You are Studyverse AI, a friendly study tutor inside a student's study app. Explain doubts clearly and step by step with short examples. Keep answers concise and well structured. Reply in the same language the student writes in (Hinglish is fine). For maths and science show the working. If you are unsure, say so instead of guessing.";
  const SIZE = 58, M = 10;
  const LS = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const LSset = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };

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

  root.innerHTML = `
<style>
:host{all:initial}
*{box-sizing:border-box;font-family:Inter,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}
button{font:inherit;cursor:pointer;border:0;background:none;color:inherit}
#bot{position:fixed;width:${SIZE}px;height:${SIZE}px;border-radius:50%;background:radial-gradient(circle at 30% 25%,#1d1d22,#050506);box-shadow:0 0 0 1px #2c2c33,0 12px 30px rgba(0,0,0,.55),0 0 24px rgba(255,180,84,.28);display:grid;place-items:center;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;transition:box-shadow .25s,transform .2s}
#bot:hover{box-shadow:0 0 0 1px #3a3a42,0 12px 30px rgba(0,0,0,.55),0 0 34px rgba(255,180,84,.5)}
#bot.drag{cursor:grabbing;transform:scale(1.08)}
#bot svg{width:40px;height:40px;animation:fl 3.2s ease-in-out infinite}
#bot .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translateX(-50%);white-space:nowrap;background:#0b0b0d;border:1px solid #2c2c33;color:#e8e8ea;font-size:12px;padding:6px 10px;border-radius:10px;opacity:0;pointer-events:none;transition:.2s}
#bot:hover .tip{opacity:1}#bot.drag .tip{opacity:0}
.eye{transform-box:fill-box;transform-origin:center;animation:blink 4.5s infinite}
.ant{animation:pulse 1.8s ease-in-out infinite}
@keyframes blink{0%,93%,100%{transform:scaleY(1)}96%{transform:scaleY(.08)}}
@keyframes pulse{50%{opacity:.25}}
@keyframes fl{50%{transform:translateY(-2px)}}
#panel{position:fixed;bottom:14px;width:min(410px,calc(100vw - 20px));height:min(640px,calc(100dvh - 28px));background:#08080a;border:1px solid #25252b;border-radius:22px;box-shadow:0 30px 80px rgba(0,0,0,.65),0 0 0 1px rgba(255,255,255,.03) inset;display:flex;flex-direction:column;overflow:hidden;pointer-events:auto;color:#ececee;opacity:0;transform:translateY(16px) scale(.97);visibility:hidden;transition:opacity .2s,transform .2s,visibility .2s}
#panel.open{opacity:1;transform:none;visibility:visible}
#panel.r{right:10px}#panel.l{left:10px}
header{display:flex;align-items:center;gap:10px;padding:14px 14px 12px;border-bottom:1px solid #1d1d22;background:linear-gradient(180deg,#0f0f12,#08080a)}
header .av{width:38px;height:38px;border-radius:12px;background:#050506;border:1px solid #2c2c33;display:grid;place-items:center;flex:none}
header .av svg{width:28px;height:28px}
header .t{flex:1;min-width:0}header b{display:block;font-size:15px;letter-spacing:.2px}
header small{color:#8b8b94;font-size:12px}header small i{display:inline-block;width:6px;height:6px;border-radius:50%;background:#46d68c;margin-right:5px;box-shadow:0 0 8px #46d68c}
header button{width:34px;height:34px;border-radius:10px;color:#a0a0aa;display:grid;place-items:center;font-size:17px}
header button:hover{background:#17171b;color:#fff}
#msgs{flex:1;overflow-y:auto;padding:16px 14px;display:flex;flex-direction:column;gap:14px;overscroll-behavior:contain;scrollbar-width:thin;scrollbar-color:#2a2a30 transparent}
.empty{margin:auto;text-align:center;color:#8b8b94;padding:10px 6px}
.empty svg{width:74px;height:74px;margin-bottom:6px}
.empty h3{color:#f2f2f4;font-size:18px;margin:4px 0 6px;font-weight:600}
.empty p{font-size:13px;line-height:1.5;margin:0 0 14px}
.chips{display:flex;flex-wrap:wrap;gap:8px;justify-content:center}
.chips button{background:#0f0f12;border:1px solid #25252b;color:#cfcfd6;font-size:12.5px;padding:8px 12px;border-radius:99px;transition:.18s}
.chips button:hover{border-color:#ffb454;color:#ffb454}
.m{max-width:92%;font-size:14px;line-height:1.55;word-wrap:break-word;overflow-wrap:anywhere}
.m.u{align-self:flex-end;background:#18181c;border:1px solid #2a2a30;padding:9px 13px;border-radius:16px 16px 4px 16px;white-space:pre-wrap}
.m.a{align-self:flex-start;border-left:2px solid #ffb454;padding:2px 0 2px 12px;color:#e6e6e9}
.m.a p{margin:0 0 8px}.m.a h4{margin:10px 0 6px;font-size:14px;color:#fff}
.m.a ul,.m.a ol{margin:4px 0 8px;padding-left:20px}.m.a li{margin:3px 0}
.m.a code{background:#17171b;border:1px solid #25252b;padding:1px 6px;border-radius:6px;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;color:#ffcf8f}
.m.a pre{background:#050506;border:1px solid #25252b;border-radius:12px;padding:10px 12px;overflow-x:auto;margin:6px 0 10px}
.m.a pre code{background:none;border:0;padding:0;color:#d9d9de}
.m.a b{color:#fff}
.m.err{align-self:stretch;border:1px solid #4a2222;background:#1a0d0d;color:#ffb3a8;padding:10px 12px;border-radius:14px;font-size:13px}
.m.err button{margin-top:8px;display:block;background:#2a1414;border:1px solid #5a2a2a;padding:6px 12px;border-radius:99px;color:#ffd0c8;font-size:12px}
.acts{display:flex;gap:6px;margin-top:2px}
.acts button{font-size:11.5px;color:#7d7d86;padding:3px 8px;border-radius:8px}.acts button:hover{background:#17171b;color:#fff}
.dots{display:inline-flex;gap:5px;padding:6px 0 6px 12px;border-left:2px solid #ffb454;align-self:flex-start}
.dots i{width:7px;height:7px;border-radius:50%;background:#ffb454;animation:dd 1.1s infinite}.dots i:nth-child(2){animation-delay:.15s}.dots i:nth-child(3){animation-delay:.3s}
@keyframes dd{0%,80%,100%{opacity:.25;transform:translateY(0)}40%{opacity:1;transform:translateY(-3px)}}
footer{padding:10px 12px 12px;border-top:1px solid #1d1d22;background:#08080a}
.box{display:flex;align-items:flex-end;gap:8px;background:#0f0f12;border:1px solid #25252b;border-radius:18px;padding:6px 6px 6px 14px;transition:border-color .2s}
.box:focus-within{border-color:#ffb454}
textarea{flex:1;background:none;border:0;outline:0;resize:none;color:#f0f0f2;font-size:14px;line-height:1.45;max-height:120px;padding:8px 0;font-family:inherit}
textarea::placeholder{color:#6d6d76}
#send{width:38px;height:38px;border-radius:13px;background:#ffb454;color:#1a1000;display:grid;place-items:center;font-size:16px;font-weight:700;flex:none;transition:.15s}
#send:hover{filter:brightness(1.1)}#send.stop{background:#26262c;color:#fff}
.foot{text-align:center;color:#55555d;font-size:11px;margin-top:8px}
@media(max-width:520px){#panel{width:calc(100vw - 16px);height:min(78dvh,640px);bottom:8px}#panel.r{right:8px}#panel.l{left:8px}}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}
</style>
<div id="bot" role="button" tabindex="0" aria-label="Open AI doubt solver">${ROBOT()}<span class="tip">Ask AI a doubt</span></div>
<section id="panel" class="r" role="dialog" aria-label="Studyverse AI">
  <header>
    <div class="av">${ROBOT()}</div>
    <div class="t"><b>Studyverse AI</b><small><i></i>Ask any doubt</small></div>
    <button id="new" title="New chat" aria-label="New chat">&#8635;</button>
    <button id="x" title="Close" aria-label="Close">&#10005;</button>
  </header>
  <div id="msgs"></div>
  <footer>
    <div class="box"><textarea id="in" rows="1" placeholder="Type your doubt..." maxlength="4000"></textarea><button id="send" aria-label="Send">&#10148;</button></div>
    <div class="foot">AI can make mistakes. Check important answers.</div>
  </footer>
</section>`;

  const $ = s => root.querySelector(s);
  const bot = $('#bot'), panel = $('#panel'), msgs = $('#msgs'), input = $('#in'), sendBtn = $('#send');

  /* ---------- robot position (draggable, snaps to the nearest edge) ---------- */
  let pos; try { pos = JSON.parse(LS('svaipos')); } catch (e) {}
  if (!pos || !/^[lr]$/.test(pos.side)) pos = { side: 'r', y: 0.62 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function place(anim) {
    const W = innerWidth, H = innerHeight;
    bot.style.transition = anim ? 'left .25s,top .25s,box-shadow .25s' : 'none';
    bot.style.right = bot.style.bottom = 'auto';
    bot.style.left = (pos.side === 'r' ? W - SIZE - M : M) + 'px';
    bot.style.top = clamp(pos.y * H, M + 6, H - SIZE - M) + 'px';
    panel.className = (panel.classList.contains('open') ? 'open ' : '') + pos.side;
  }
  place(false);
  addEventListener('resize', () => place(false));
  let drag = null;
  bot.addEventListener('pointerdown', e => {
    const r = bot.getBoundingClientRect();
    drag = { dx: e.clientX - r.left, dy: e.clientY - r.top, sx: e.clientX, sy: e.clientY, moved: false };
    try { bot.setPointerCapture(e.pointerId); } catch (_) {}
  });
  bot.addEventListener('pointermove', e => {
    if (!drag) return;
    if (!drag.moved && Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 6) return;
    drag.moved = true; bot.classList.add('drag'); bot.style.transition = 'none';
    drag.x = clamp(e.clientX - drag.dx, 4, innerWidth - SIZE - 4);
    drag.y = clamp(e.clientY - drag.dy, 4, innerHeight - SIZE - 4);
    bot.style.left = drag.x + 'px'; bot.style.top = drag.y + 'px';
  });
  const endDrag = e => {
    if (!drag) return; const d = drag; drag = null; bot.classList.remove('drag');
    if (!d.moved) { if (e.type === 'pointerup') openPanel(); return; }
    pos = { side: d.x + SIZE / 2 < innerWidth / 2 ? 'l' : 'r', y: d.y / innerHeight };
    LSset('svaipos', JSON.stringify(pos)); place(true);
  };
  bot.addEventListener('pointerup', endDrag); bot.addEventListener('pointercancel', endDrag);
  bot.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPanel(); } });

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

  const CHIPS = ["Explain Newton's laws simply", 'Solve: 2x\u00B2 \u2212 5x + 3 = 0', 'Mitosis vs meiosis', 'Tips to remember formulas'];
  function empty() {
    return `<div class="empty">${ROBOT()}<h3>Hi, ask me any doubt</h3><p>Maths, science, coding, English, anything you are stuck on. Ask as many questions as you like.</p><div class="chips">${CHIPS.map(c => `<button data-q="${E(c)}">${E(c)}</button>`).join('')}</div></div>`;
  }
  function bottom() { msgs.scrollTop = msgs.scrollHeight; }
  function addMsg(role, text) {
    const d = document.createElement('div'); d.className = 'm ' + (role === 'user' ? 'u' : 'a');
    if (role === 'user') d.textContent = text;
    else { d.innerHTML = md(text) + '<div class="acts"><button data-copy>Copy</button></div>'; d._t = text; }
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
  async function viaWorker(messages, sig) { const r = await post(CFG.endpoint, { messages }, sig); const j = await r.json(); if (!j.reply) throw new Error('empty'); return j.reply; }
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
    const chain = []; if (CFG.endpoint) chain.push(viaWorker); chain.push(viaPollGen, viaPollLegacy, viaPollGet);
    let last;
    for (const fn of chain) {
      if (outer && outer.aborted) throw new DOMException('stop', 'AbortError');
      const w = withTimeout(30000, outer);
      try { const t = await fn(messages, w.signal); w.done(); return t; }
      catch (e) { w.done(); if (outer && outer.aborted) throw e; last = e; }
    }
    throw last || new Error('failed');
  }

  async function send(text) {
    text = (text || '').trim(); if (!text || busy) return;
    busy = true; sendBtn.classList.add('stop'); sendBtn.innerHTML = '&#9632;'; sendBtn.setAttribute('aria-label', 'Stop');
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
      else { const d = document.createElement('div'); d.className = 'm err'; d.innerHTML = 'The free AI servers are busy right now. Please try again in a few seconds.<button data-retry>Try again</button>'; msgs.appendChild(d); bottom(); saveHist(); }
    }
    busy = false; ctrl = null; sendBtn.classList.remove('stop'); sendBtn.innerHTML = '&#10148;'; sendBtn.setAttribute('aria-label', 'Send');
  }

  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(120, input.scrollHeight) + 'px'; }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(input.value); } });
  sendBtn.addEventListener('click', () => { if (busy && ctrl) ctrl.abort(); else send(input.value); });
  $('#new').addEventListener('click', () => { if (ctrl) ctrl.abort(); hist = []; saveHist(); render(); });
  $('#x').addEventListener('click', closePanel);
  addEventListener('keydown', e => { if (e.key === 'Escape' && panel.classList.contains('open')) closePanel(); });

  function openPanel() { place(false); panel.classList.add('open'); bot.style.visibility = 'hidden'; render(); setTimeout(() => input.focus(), 150); }
  function closePanel() { panel.classList.remove('open'); bot.style.visibility = ''; }

  window.SVAI = { open: openPanel, close: closePanel, ask: send };
})();
