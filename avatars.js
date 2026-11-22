/* Studyverse avatars: 32 hand-built flat avatars for group study. Picked avatar is stored as "av0".."av31" in the same icon field. */
(function(){
const SKN=['#f6d3b8','#efbf94','#d9a070','#b57a4f','#8a5736','#5e3a22'],
HC={k:'#231a14',br:'#5a3825',rd:'#c8452b',bl:'#e8c872',gy:'#cfd3d8',nv:'#27324a',pu:'#8d7be0',tl:'#2fae92',pk:'#ee7f9d'},
BG=['#9fd8c7','#ffc979','#a79bd8','#c9cf5d','#f4a6a0','#8fb8f0','#e6dcc4','#ffb98a'],
CL=['#f2c14e','#3f8f6b','#5b6ee1','#e5604d','#2aa3e0','#9a5fc7','#2f3b52','#f08aa0','#e9ecef','#ff8f3d'];
/* [bg, skin, hair, style, cloth, collar(0 none,1 shirt,2 v-neck,3 round), glasses, beard, backpack] */
const S=[[0,0,'br','long',1,1,0,0,0],[1,1,'k','short',3,0,0,0,1],[2,2,'rd','bob',5,3,0,0,0],[3,3,'k','curly',0,2,1,0,0],[4,0,'bl','bun',7,3,0,0,1],[5,4,'k','buzz',4,1,0,1,0],[6,1,'nv','pony',2,3,0,0,0],[7,2,'br','sweep',9,0,0,0,1],
[0,5,'k','afro',3,3,0,0,0],[1,3,'tl','hijab',5,3,0,0,0],[2,0,'pu','long',6,3,1,0,0],[3,2,'rd','cap',0,1,0,0,1],[4,1,'gy','bob',7,1,1,0,0],[5,0,'rd','spike',4,3,0,0,1],[6,4,'k','twin',8,1,0,0,0],[7,3,'nv','short',2,2,1,1,0],
[0,1,'tl','pony',3,3,0,0,0],[1,2,'bl','sweep',5,0,0,0,0],[2,5,'k','curly',9,3,0,0,1],[3,0,'pk','bun',0,2,0,0,0],[4,4,'br','buzz',6,0,1,1,0],[5,1,'k','long',7,1,0,0,0],[6,0,'br','sweep',3,3,1,0,1],[7,2,'k','bob',2,3,0,0,0],
[0,3,'k','hijab',5,3,0,0,0],[1,5,'k','short',4,1,0,0,0],[2,1,'rd','curly',8,3,1,0,0],[3,4,'k','bald',1,0,0,1,0],[4,0,'k','pony',9,3,0,0,1],[5,2,'nv','cap',3,0,0,0,0],[6,3,'pu','twin',0,3,0,0,0],[7,0,'k','spike',6,1,1,0,0]];
const HS={
short:c=>({f:`<path d="M30 44C27 20 73 18 70 44C66 34 58 30 50 30C42 30 34 34 30 44Z" fill="${c}"/>`}),
sweep:c=>({f:`<path d="M30 46C26 18 74 14 71 44C62 36 48 34 38 28C36 36 33 42 30 46Z" fill="${c}"/>`}),
buzz:c=>({f:`<path d="M31 41C32 24 68 24 69 41C62 33 38 33 31 41Z" fill="${c}"/>`}),
long:c=>({b:`<path d="M27 46C24 14 76 14 73 46L79 86L21 86Z" fill="${c}"/>`,f:`<path d="M30 43C31 22 69 22 70 43C62 34 54 30 50 30C44 30 36 34 30 43Z" fill="${c}"/>`}),
bob:c=>({b:`<path d="M26 52C21 14 79 14 74 52L73 66L27 66Z" fill="${c}"/>`,f:`<path d="M29 45C29 23 71 23 71 45C63 39 55 36 50 33C45 37 37 39 29 45Z" fill="${c}"/>`}),
bun:c=>({b:`<circle cx="50" cy="15" r="9" fill="${c}"/>`,f:`<path d="M30 44C28 22 72 22 70 44C62 34 38 34 30 44Z" fill="${c}"/>`}),
pony:c=>({b:`<path d="M64 26C88 22 90 56 80 74C80 58 74 46 66 38Z" fill="${c}"/>`,f:`<path d="M30 44C27 20 73 18 70 44C66 34 58 30 50 30C42 30 34 34 30 44Z" fill="${c}"/>`}),
curly:c=>({b:[[32,34,10],[68,34,10],[50,22,14],[38,24,11],[62,24,11],[27,48,7],[73,48,7]].map(a=>`<circle cx="${a[0]}" cy="${a[1]}" r="${a[2]}" fill="${c}"/>`).join(''),f:`<path d="M33 41C36 30 64 30 67 41C60 35 40 35 33 41Z" fill="${c}"/>`}),
afro:c=>({b:`<circle cx="50" cy="33" r="28" fill="${c}"/>`,f:`<path d="M31 41C34 28 66 28 69 41C60 34 40 34 31 41Z" fill="${c}"/>`}),
hijab:c=>({m:`<path d="M50 13C75 13 81 36 79 52C78 66 84 78 92 92L8 92C16 78 22 66 21 52C19 36 25 13 50 13Z" fill="${c}"/>`,f:`<path d="M30 41C32 29 68 29 70 41C66 35 34 35 30 41Z" fill="${c}"/>`}),
cap:c=>({f:`<path d="M29 41C28 17 72 17 71 41Z" fill="${c}"/><path d="M27 40H77L82 45H27Z" fill="${c}"/><path d="M27 40H77L78 42H27Z" fill="#000" opacity=".15"/>`}),
spike:c=>({f:`<path d="M30 43L31 22L40 30L45 15L53 29L62 17L67 30L72 22L70 43C62 35 38 35 30 43Z" fill="${c}"/>`}),
twin:c=>({b:`<circle cx="21" cy="40" r="9" fill="${c}"/><circle cx="79" cy="40" r="9" fill="${c}"/>`,f:`<path d="M29 45C29 23 71 23 71 45C63 39 55 36 50 33C45 37 37 39 29 45Z" fill="${c}"/>`}),
bald:c=>({})};
const cache={};
function art(n){if(cache[n])return cache[n];const [bg,sk,hk,st,cl,co,gl,bd,bp]=S[n],skin=SKN[sk],hair=HC[hk],cloth=CL[cl],h=HS[st](st==='hijab'?hair:hair);
 const body=`<path d="M10 102C10 80 28 72 50 72C72 72 90 80 90 102Z" fill="${cloth}"/>`;
 const col=[``,`<path d="M40 73L50 87L60 73L56 71L50 79L44 71Z" fill="#fff"/>`,`<path d="M41 72C46 84 54 84 59 72Z" fill="${skin}"/>`,`<path d="M41 72C46 79 54 79 59 72C56 75 44 75 41 72Z" fill="#000" opacity=".16"/>`][co];
 const strap=bp?`<path d="M24 96C26 84 32 77 37 74M76 96C74 84 68 77 63 74" stroke="#a4623a" stroke-width="5" fill="none" stroke-linecap="round"/>`:'';
 const neck=`<path d="M43 56H57V74C54 78 46 78 43 74Z" fill="${skin}"/><path d="M43 56H57V66C52 70 48 70 43 66Z" fill="#000" opacity=".13"/>`;
 const ears=`<circle cx="31" cy="47" r="4.2" fill="${skin}"/><circle cx="69" cy="47" r="4.2" fill="${skin}"/>`;
 const head=`<ellipse cx="50" cy="45" rx="19" ry="21" fill="${skin}"/>`;
 const beard=bd?`<path d="M31 49C31 71 69 71 69 49C66 61 34 61 31 49Z" fill="${hair}"/>`:'';
 const face=`<circle cx="37" cy="53" r="4.4" fill="#ff6b6b" opacity=".22"/><circle cx="63" cy="53" r="4.4" fill="#ff6b6b" opacity=".22"/><circle cx="42" cy="47" r="2.1" fill="#2a1d18"/><circle cx="58" cy="47" r="2.1" fill="#2a1d18"/><circle cx="42.7" cy="46.3" r=".7" fill="#fff"/><circle cx="58.7" cy="46.3" r=".7" fill="#fff"/><path d="M37 41Q42 38.5 46 41M54 41Q58 38.5 63 41" stroke="${st==='hijab'||st==='cap'||st==='bald'?'#3a2a20':hair}" stroke-width="1.8" fill="none" stroke-linecap="round"/><path d="M50 48V53H52" stroke="#000" stroke-opacity=".22" stroke-width="1.4" fill="none" stroke-linecap="round"/><path d="M44.5 58Q50 62.5 55.5 58" stroke="${bd?'#fff':'#8a3b2e'}" stroke-width="1.9" fill="none" stroke-linecap="round"/>`;
 const gls=gl?`<g stroke="#2b2b34" stroke-width="1.6" fill="none"><circle cx="42" cy="47" r="6"/><circle cx="58" cy="47" r="6"/><path d="M48 47H52"/></g>`:'';
 const svg=`<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${h.b||''}${body}${col}${strap}${neck}${h.m||''}${ears}${head}${beard}${face}${h.f||''}${gls}</svg>`;
 return cache[n]={bg:BG[bg],svg}}
window.SV_AV_COUNT=S.length;
window.svAv=function(id,s){let n=+String(id).slice(2);if(!(n>=0&&n<S.length))n=0;const a=art(n);return `<span class="gav av" style="width:${s}px;height:${s}px;background:${a.bg}">${a.svg}</span>`};
const st=document.createElement('style');
st.textContent='.gav.av{overflow:hidden}.gav.av svg{width:100%;height:100%;display:block}.mt{position:relative}.avb{position:absolute;left:8px;top:8px;width:24px;height:24px;border-radius:50%;background:var(--card);border:1px solid var(--line);display:grid;place-items:center;color:var(--mute);opacity:.8;z-index:4;transition:transform .2s,color .2s,opacity .2s}.avb:hover{opacity:1;color:var(--o);transform:scale(1.12)}.avb:active{transform:scale(.92)}.avb svg{width:13px;height:13px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}.avg{display:grid;grid-template-columns:repeat(auto-fill,minmax(58px,1fr));gap:10px;max-height:52vh;overflow:auto;padding:4px}.avg button{border-radius:50%;padding:3px;border:2px solid transparent;display:grid;place-items:center;transition:transform .15s,border-color .15s}.avg button:hover{transform:scale(1.08)}.avg button:active{transform:scale(.95)}.avg .sel{border-color:var(--o);box-shadow:0 0 0 3px color-mix(in srgb,var(--o) 22%,transparent)}';
document.head.appendChild(st);
const _pi=window.pickIcon;
window.svAvPick=function(){const cur=ST.gicon||'leaf';
 openM(`<h3>Choose your avatar</h3><div class="avg">${S.map((_,i)=>`<button class="${cur==='av'+i?'sel':''}" title="Avatar ${i+1}" onclick="setIcon('av${i}')">${svAv('av'+i,52)}</button>`).join('')}</div><div style="display:flex;justify-content:space-between;gap:10px;margin-top:14px"><button class="btn" onclick="svOldIcons()">Classic icons</button><button class="btn" onclick="closeM()">Close</button></div>`)};
window.svOldIcons=()=>_pi();
pickIcon=function(){svAvPick()};
const _gd=gDraw;
gDraw=function(){_gd();document.querySelectorAll('#mem .mt').forEach(c=>{const b=c.querySelector('b');if(b&&/\(you\)\s*$/.test(b.textContent)&&!c.querySelector('.avb'))c.insertAdjacentHTML('afterbegin','<button class="avb" title="Choose avatar" onclick="svAvPick()"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.4 3.6-7 8-7s8 2.6 8 7"/></svg></button>')})};
})();
