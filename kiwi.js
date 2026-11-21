/* Kiwi theme dashboard: week calendar, growth points, notebook, score, gauge and co-pilot. Real app data only. */
(function(){
const R=document.documentElement,q=id=>document.getElementById(id);
let W=0;
const mint='#3df5a0',org='#ff7a1a';
/* top bar pieces + logo */
const top=document.querySelector('.top');
top.insertAdjacentHTML('afterbegin','<div class="kpill"><button id="kmD" title="Dark" onclick="kMode(1)">'+ic('moon',18)+'</button><button id="kmL" title="Light" onclick="kMode(0)">'+ic('sun',18)+'</button></div><form class="ksearch" onsubmit="return kSearch(this)"><svg class="i" style="width:18px"><use href="#ksrch"/></svg><input id="kq" placeholder="Enter your search request" autocomplete="off"></form>');
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute"><symbol id="ksrch" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></symbol></svg>');
document.querySelector('.logo').insertAdjacentHTML('afterbegin','<svg class="kpine" viewBox="0 0 48 48"><path d="M24 3l9 11h-5l8 10h-6l9 11H9l9-11h-6l8-10h-5z" fill="currentColor"/><path d="M22 36h4v9h-4z" fill="currentColor"/></svg>');
window.kMode=d=>{if((R.dataset.theme==='dark')!==!!d)tgTheme();kPill()};
const kPill=()=>{const d=R.dataset.theme==='dark';q('kmD').classList.toggle('on',d);q('kmL').classList.toggle('on',!d)};
window.kSearch=f=>{const v=q('kq').value.trim();if(v){go('nb');q('nbq').value=v;rNb()}return false};
const _tg=tgTheme;tgTheme=function(){_tg();kPill()};kPill();

/* dashboard shell */
document.querySelector('#p-ov .g.ov').insertAdjacentHTML('beforebegin','<div class="kdash" id="kdash"></div>');
const hr12=h=>{const H=Math.floor(h)%24;return (H%12||12)+(H<12?':00 am':':00 pm')};
const sub=(a,n)=>a.slice(0,n);
const dots=a=>'<span class="kdots">'+a.map(v=>`<i class="d${v}"></i>`).join('')+'</span>';
const wkDays=()=>{const t=sd();t.setHours(0,0,0,0);t.setDate(t.getDate()-(t.getDay()+6)%7+7*W);return[...Array(7)].map((_,i)=>{const d=new Date(t);d.setDate(t.getDate()+i);return d})};
function cal(){const D=wkDays(),keys=D.map(d=>dk(d)),tk=dk(),ev=[];
 ST.tasks.forEach(t=>{const m=/^(\d{1,2}):(\d{2})/.exec(t.tm||'');const i=keys.indexOf(tk);if(m&&i>=0)ev.push({i,h:+m[1]+m[2]/60,t:t.t,s:t.c,k:'t',d:t.d})});
 ST.sessions.forEach(x=>{const i=keys.indexOf(x.d);if(i<0||!x.t)return;const st=new Date(x.t-x.s*1000);ev.push({i,h:st.getHours()+st.getMinutes()/60,t:x.sub||'Focus',s:Math.max(1,Math.round(x.s/60))+' min focus',k:'s'})});
 ev.sort((a,b)=>a.h-b.h);const E=ev.slice(-40);let lo=9,hi=13;
 if(E.length){lo=Math.min(9,Math.floor(E[0].h));hi=Math.max(lo+4,Math.ceil(E[E.length-1].h)+1);if(hi-lo>8)lo=hi-8}
 const rows=hi-lo,mon=D[0].toLocaleDateString(undefined,{month:'long',day:'numeric'});
 const wk=D[0].getMonth()===D[6].getMonth()?D[0].toLocaleDateString(undefined,{month:'long'})+' '+D[0].getDate()+' – '+D[6].getDate():D[0].toLocaleDateString(undefined,{month:'short',day:'numeric'})+' – '+D[6].toLocaleDateString(undefined,{month:'short',day:'numeric'});
 return `<div class="card kcal"><div class="kch"><button class="kbtn" onclick="kdW(-1)">Last Week</button><b>${wk}</b><button class="kbtn" onclick="kdW(1)">Next Week</button></div>
 <div class="kwk"><div class="kdh">${D.map((d,i)=>`<div class="${keys[i]===tk?'tdy':''}"><span>${d.toLocaleDateString(undefined,{weekday:'short'})}</span><b>${d.getDate()}</b></div>`).join('')}</div>
 <div class="kplot" style="--r:${rows};min-height:${Math.max(rows*52,(E.length?Math.max(...Object.values((()=>{const c={};E.forEach(e=>{let t=(e.h-lo)*52+4;t=Math.max(t,c[e.i]||0);c[e.i]=t+44});return c})()))+8:0))}px">${[...Array(rows)].map((_,i)=>`<span class="kt" style="top:${i*52}px">${hr12(lo+i)}</span>`).join('')}<div class="kev-w">
 ${(()=>{const cb={};return E.map(e=>{let top=(e.h-lo)*52+4;top=Math.max(top,cb[e.i]||0);cb[e.i]=top+44;return `<div class="kev ${e.k} ${e.i>4?'rt':''} ${e.d?'dn':''}" style="top:${top}px;left:calc(${e.i}/7*100%)"><b>${esc(e.t)}</b><small>${esc(e.s)}</small></div>`}).join('')})()}</div>
 ${E.length?'':'<div class="kem">Add a task with a time or start a focus session and it shows up here.</div>'}</div></div>
 <button class="knx" title="Next week" onclick="kdW(1)">›</button></div>`}
const kiwiArt=()=>{let st='',sd2='';for(let i=0;i<40;i++){const a=i/40*Math.PI*2,c=Math.cos(a),n=Math.sin(a);st+=`<line x1="${(c*24).toFixed(1)}" y1="${(n*24).toFixed(1)}" x2="${(c*(66+(i%2)*4)).toFixed(1)}" y2="${(n*(66+(i%2)*4)).toFixed(1)}" stroke="#eaffb8" stroke-opacity="${i%2?.16:.3}" stroke-width="${i%2?1.2:1.8}" stroke-linecap="round"/>`}
 [[34,20],[43,26]].forEach(([r,k],q)=>{for(let i=0;i<k;i++){const a=(i/k+q*.5/k)*Math.PI*2,d=a*180/Math.PI;sd2+=`<ellipse cx="${(Math.cos(a)*r).toFixed(1)}" cy="${(Math.sin(a)*r).toFixed(1)}" rx="1.7" ry="3.6" transform="rotate(${(d+90).toFixed(0)} ${(Math.cos(a)*r).toFixed(1)} ${(Math.sin(a)*r).toFixed(1)})" fill="#10261a"/>`}});
 const slice=`<circle r="80" fill="#6d4c25"/><circle r="76" fill="#8a6434"/><circle r="72" fill="url(#kf)"/>${st}<circle r="26" fill="url(#kc)"/>${sd2}`;
 return `<svg class="ksil" viewBox="0 0 240 150" preserveAspectRatio="xMidYMax slice"><defs><radialGradient id="kf" cx=".5" cy=".5" r=".5"><stop offset=".3" stop-color="#c8f56e"/><stop offset=".7" stop-color="#6fd44a"/><stop offset="1" stop-color="#2f9e3c"/></radialGradient><radialGradient id="kc" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#fffbe0"/><stop offset=".7" stop-color="#eaf7b4"/><stop offset="1" stop-color="#bfe88a"/></radialGradient><linearGradient id="klf" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2fbf78"/><stop offset="1" stop-color="#0a5a3a"/></linearGradient></defs>
 <circle cx="130" cy="124" r="100" fill="#04361f" opacity=".28"/>
 <path d="M178 30c30-8 50 6 56 32-30 10-52-4-56-32z" fill="url(#klf)"/><path d="M178 30c20 8 38 20 56 32" stroke="#b9ffd9" stroke-opacity=".5" fill="none"/>
 <g transform="translate(130 128) scale(1.08) rotate(-14)">${slice}</g>
 <g transform="translate(34 70) rotate(20) scale(.4)"><circle r="80" fill="#6d4c25"/><circle r="76" fill="#8a6434"/><circle r="72" fill="url(#kf)"/><circle r="26" fill="url(#kc)"/></g>
 <path d="M70 26l3 9 9 3-9 3-3 9-3-9-9-3 9-3z" fill="#fff" opacity=".85"/><path d="M206 100l2 6 6 2-6 2-2 6-2-6-6-2 6-2z" fill="#fff" opacity=".7"/></svg>`};
const sil=kiwiArt();
const robot='<svg class="krob" viewBox="0 0 220 230"><defs><radialGradient id="kh" cx=".38" cy=".3" r=".85"><stop offset="0" stop-color="#fff"/><stop offset=".6" stop-color="#dfe7e3"/><stop offset="1" stop-color="#8a9a93"/></radialGradient><linearGradient id="kv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#1b2a25"/><stop offset=".55" stop-color="#050807"/><stop offset="1" stop-color="#0c2a1f"/></linearGradient><linearGradient id="kb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1f2a26"/><stop offset="1" stop-color="#050a08"/></linearGradient></defs><path d="M10 230C14 178 56 160 110 160s98 18 100 70z" fill="url(#kb)"/><path d="M62 168c18 10 78 10 96 0l6 14c-24 14-84 14-108 0z" fill="#cfd8d4" opacity=".85"/><ellipse cx="110" cy="92" rx="78" ry="74" fill="url(#kh)"/><ellipse cx="34" cy="96" rx="12" ry="26" fill="#aeb9b4"/><ellipse cx="186" cy="96" rx="12" ry="26" fill="#aeb9b4"/><circle cx="34" cy="96" r="4" fill="'+mint+'"/><circle cx="186" cy="96" r="4" fill="'+mint+'"/><ellipse cx="112" cy="96" rx="56" ry="46" fill="url(#kv)"/><path d="M72 76c10-14 34-20 52-16" stroke="#6dffc3" stroke-opacity=".55" stroke-width="5" fill="none" stroke-linecap="round"/><ellipse cx="90" cy="108" rx="4.5" ry="6" fill="'+mint+'"/><ellipse cx="132" cy="108" rx="4.5" ry="6" fill="'+mint+'"/></svg>';
const leaf='<svg class="klf" viewBox="0 0 120 90"><defs><linearGradient id="kl" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#7dffc6"/><stop offset="1" stop-color="#17a96c"/></linearGradient></defs><ellipse cx="78" cy="30" rx="46" ry="26" transform="rotate(25 78 30)" fill="url(#kl)" opacity=".85"/><ellipse cx="96" cy="46" rx="30" ry="14" transform="rotate(-30 96 46)" fill="#eafff4" opacity=".35"/></svg>';
function kd(){const el=q('kdash');if(!el||R.dataset.skin!=='kiwi')return;
 const g=ST.goal/60,wkS=[...Array(7)].map((_,i)=>{const d=sd();d.setDate(d.getDate()-i);return secOn(dk(d))}),wkH=wkS.reduce((a,b)=>a+b,0)/3600,studied=wkS.filter(x=>x>0).length,
 chs=ST.subs.flatMap(s=>s.ch),rv=chs.length?Math.round(chs.filter(c=>c.r.length).length/chs.length*100):0,
 fc=Math.min(100,Math.round(wkH/(g*7)*100)),cn=Math.round(studied/7*100),score=Math.round(totalSec()/60),
 d15=[...Array(15)].map((_,i)=>{const d=sd();d.setDate(d.getDate()-(14-i));const s=secOn(dk(d));return s>=ST.goal*60?2:s>0?1:0}),
 td=Math.round(secOn(dk())/60),p=Math.min(1,td/ST.goal),C=2*Math.PI*64,open=ST.tasks.filter(t=>!t.d),
 lbl=td>=ST.goal?'Excellent':td>=ST.goal/2?'Good pace':td>0?'Warming up':'Ready when you are',
 notes=(ST.notes||[]).slice().sort((a,b)=>b.u-a.u).slice(0,4),
 gl=[...open,...ST.tasks.filter(t=>t.d)].slice(0,3),
 c9=a=>[...Array(9)].map((_,i)=>a[i]||0),
 dA=c9(wkS.concat(Array(2).fill(0)).slice(0,9).map(x=>x>=ST.goal*60?2:x>0?1:0)),
 dB=c9(ST.tasks.slice(0,9).map(t=>t.d?2:1)),
 dC=c9(ST.habs.slice(0,9).map(h=>h.c&&h.c[dk()]?2:1));
 el.innerHTML=cal()+
 `<div class="card kgrow">${sil}<div class="kgp"><h2>Growth points</h2><button class="kpl" onclick="go('focus')">Focus <small>${fc}%</small></button><button class="kpl o2" onclick="go('hab')">Consistency <small>${cn}%</small></button><button class="kpl o3" onclick="go('syl')">Revision <small>${rv}%</small></button></div></div>
 <div class="card kteam"><div class="kth"><h3>Notebook</h3><button class="kbtn" onclick="go('nb')">More</button></div>
  <div class="kdoc"><div class="kdh2"><b>Documents</b></div><div class="kpap">${(notes.length?notes:[{t:'New note',x:'Tap to write formulas, steps and key points.'},{},{}]).map(n=>`<div class="kp" onclick="${n.id?`go('nb');editNote(${n.id})`:`go('nb');editNote()`}"><b>${esc(n.t||'Blank page')}</b>${[...Array(7)].map((_,i)=>`<i style="width:${n.x?[92,100,78,96,64,88,50][i]:[100,86,94,70,90,60,80][i]}%"></i>`).join('')}</div>`).join('')}</div></div>
  <div class="kgoal"><div class="kth"><b>Goal</b><button class="kic" title="Edit goal" onclick="go('set')">${ic('link',14)}</button></div><p>I am aiming for <b>${g%1?g.toFixed(1):g}h of focus every day</b> and a <b>${Math.max(7,streak()+1)}-day streak</b>. My focus lies in revising <b>${chs.length?chs.length+' chapters':'my syllabus'}</b> and keeping <b>${open.length} open task${open.length===1?'':'s'}</b> moving. I ensure that steady study, one session at a time, grows into mastery.</p></div></div>
 <div class="kmid"><div class="card kscore"><div class="klb">Focus score</div><div class="knum">${score}<span>min</span>${dots(d15)}</div>${leaf}</div>
  <div class="card kmain"><h3>Main task</h3><div class="kgau"><svg viewBox="0 0 160 160"><defs><linearGradient id="kgo" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9a3c"/><stop offset="1" stop-color="#ff6a00"/></linearGradient></defs><circle cx="80" cy="80" r="64" fill="none" stroke="var(--kgt)" stroke-width="13" stroke-linecap="round" stroke-dasharray="${.75*C} ${C}" transform="rotate(135 80 80)"/><circle id="kga" cx="80" cy="80" r="64" fill="none" stroke="url(#kgo)" stroke-width="13" stroke-linecap="round" stroke-dasharray="${Math.max(.001,.75*C*p)} ${C}" transform="rotate(135 80 80)" style="transition:stroke-dasharray .9s;opacity:${td?1:0}"/></svg><div class="kgt"><b>${td}</b><small>${lbl}</small></div></div><button class="kbig" onclick="go('ana')">Details</button></div></div>
 <div class="card kai"><div class="kth"><h3>Asth</h3><button class="kic" title="Ask Asth" onclick="window.SVAI&&SVAI.open()">${ic('send',14)}</button></div><p class="kmu">Your study companion. Tap the helmet to ask Asth any doubt.</p>
  <div class="kact"><b>Active goals</b><span class="ktg">${open.length} ↗</span></div><div class="kpc"><b>${Math.min(100,Math.round(wkH/(g*7)*100))}<small>%</small></b><span>this week</span></div><div class="kcl">${dots(dA)}${dots(dB)}${dots(dC)}</div>
  <button class="krb" title="Ask Asth" onclick="window.SVAI&&SVAI.open()">${robot}</button>
  <div class="kgl">${[0,1,2].map(i=>{const t=gl[i];return `<div class="kgr"><span>${i?'Goal '+(i+1):'Primary goal'}</span><em>${t?esc(t.t):'Add a task to set a goal'}</em>${t?`<i class="${t.d?'ok':'ip'}">${t.d?'done':'in progress'}</i>`:''}</div>`}).join('')}</div></div>`}
window.kdW=n=>{W+=n;kd()};
const _ro=rOv;rOv=function(){_ro();kd()};
const _ss=window.svSkin;window.svSkin=function(id){_ss(id);kd()};
kd();
})();
