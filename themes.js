/* Studyverse themes + analytics layer. Loads after the main script; default look is untouched. */
(function(){
const R=document.documentElement,q=id=>document.getElementById(id);
const SK=[
['equa','Equa','Violet pill bars',['#ececf1','#fff','#7b61ff']],
['mono','Mono','Black and white',['#fff','#000','#000']],
['nocturne','Nocturne','Graphite dark',['#0b0b0d','#18181b','#fafafa']],
['maryn','Maryn','Navy and cream',['#f2ece1','#232b3a','#b8863b']],
['clearspace','Clearspace','Coral focus',['#f6e4de','#fff','#ea5a3c']],
['papp','P-App','Dark blue',['#09090b','#18181c','#4c8dff']],
['lifepath','LifePath','Warm beige',['#f3ecdd','#fbf7ee','#2b2a26']],
['geo','Geo Studio','Soft lavender',['#ececf3','#f2f1f8','#2a2a30']],
['idraft','iDraft','Glass grayscale',['#e4e4e7','#fff','#17171a']],
['kiwi','Kiwi','by Tanishka',['linear-gradient(135deg,#04100b,#14724a)','rgba(10,36,26,.9)','#3df5a0']]];
const cur=()=>R.dataset.skin||'';
let RNG=7,DEMO=false;

/* icons, nav button, page, stat row (all hidden in the default theme) */
document.body.insertAdjacentHTML('beforeend','<svg width="0" height="0" style="position:absolute"><symbol id="chart" viewBox="0 0 24 24"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></symbol></svg>');
PG.push(['ana','chart','Analytics']);
const sp=document.querySelector('nav .sp');
sp.insertAdjacentHTML('beforebegin','<button id="n-ana" title="Analytics" onclick="go(\'ana\')">'+ic('chart')+'</button>');
document.querySelectorAll('nav button').forEach(b=>b.insertAdjacentHTML('beforeend','<span class="lb">'+b.title+'</span>'));
document.querySelector('.logo').insertAdjacentHTML('beforeend','<b class="lbrand">Studyverse</b>');
document.querySelector('main').insertAdjacentHTML('beforeend','<section class="pg" id="p-ana"><div class="anah"><div class="chips" id="arng"></div><span class="sp2"></span><span class="demo" id="adm" style="display:none">Sample data</span><button class="btn" id="ademo" onclick="svDemo()">Preview with sample data</button></div><div class="statrow" id="astat" style="margin-bottom:16px"></div><div class="ag" id="agrid"></div></section>');
document.querySelector('.top .me').insertAdjacentHTML('beforebegin','<button class="rb2 kmode" title="Light / dark" onclick="tgTheme()"><span class="km">'+ic('moon')+'</span><span class="ks">'+ic('sun')+'</span></button>');
const hero=document.querySelector('#p-ov .hero');
hero.insertAdjacentHTML('afterend','<div class="skin-only statrow" id="ostat"></div>');

/* data helpers */
const rnd=i=>{const x=Math.sin(i*12.9898)*43758.5453;return x-Math.floor(x)};
const dOff=n=>{const d=sd();d.setDate(d.getDate()-n);return d};
const sec=n=>DEMO?Math.round(rnd(n+3)>.14?(.5+rnd(n+9)*3.6)*3600*(dOff(n).getDay()%6===0?.55:1):0):secOn(dk(dOff(n)));
const DS=['Physics','Maths','Chemistry','English'],DW=[.36,.3,.2,.14];
function bySub(a,b){const m={};if(DEMO){for(let n=a;n<=b;n++)DS.forEach((s,i)=>m[s]=(m[s]||0)+sec(n)*DW[i]);return m}
 const lo=dk(dOff(b)),hi=dk(dOff(a));ST.sessions.forEach(x=>{if(x.d>=lo&&x.d<=hi)m[x.sub]=(m[x.sub]||0)+x.s});return m}
function hours24(){const h=Array(24).fill(0);if(DEMO){for(let i=0;i<24;i++)h[i]=Math.max(0,Math.sin((i-6)/24*Math.PI*1.7)*3+rnd(i)*1.5)*(i<5?.3:1);return h}
 ST.sessions.forEach(x=>{if(!x.t)return;const st=x.t-x.s*1000;for(let t=st;t<x.t;t+=6e4)h[new Date(t).getHours()]+=1/60});return h}
const sum=a=>a.reduce((x,y)=>x+y,0),hm=s=>{const m=Math.round(s/60);return m<60?m+'m':Math.floor(m/60)+'h '+String(m%60).padStart(2,'0')+'m'};
const series=n=>[...Array(n)].map((_,i)=>sec(n-1-i)/3600);
const lab=n=>{const d=dOff(n);return d.toLocaleDateString(undefined,{day:'numeric',month:'short'})};
const PAL=['var(--c1)','var(--c3)','var(--c4)','var(--c2)','#8b7be8','#2aa3e0'];
const sess=()=>DEMO?Math.round(sum(series(RNG))*1.4):ST.sessions.filter(x=>x.d>=dk(dOff(RNG-1))).length;
const taskDone=()=>{const t=ST.tasks;return t.length?t.filter(x=>x.d).length/t.length:0};
const habToday=()=>{const t=dk(),h=ST.habs;return h.length?h.filter(x=>x.c&&x.c[t]).length/h.length:0};

/* charts */
function tip(el,html,x,y){let t=el.querySelector('.tip');if(!t){t=document.createElement('div');t.className='tip';el.appendChild(t)}
 if(html===null){t.classList.remove('on');return}t.innerHTML=html;t.style.left=x+'px';t.style.top=y+'px';t.classList.add('on')}
function area(el,v,L,goal){const W=Math.max(260,el.clientWidth||520),H=210,pl=30,pr=8,pt=14,pb=24,w=W-pl-pr,h=H-pt-pb,mx=Math.max(4,Math.ceil(Math.max(goal,...v)*1.05/4)*4),n=v.length;
 const X=i=>pl+(n>1?i/(n-1):.5)*w,Y=x=>pt+h-x/mx*h,P=v.map((x,i)=>[X(i),Y(x)]);
 let d='M'+P[0];for(let i=1;i<n;i++){const a=P[i-1],b=P[i],c=(a[0]+b[0])/2;d+=`C${c},${a[1]} ${c},${b[1]} ${b}`}
 let g='';for(let k=0;k<=4;k++){const y=pt+h-k/4*h;g+=`<line x1="${pl}" x2="${W-pr}" y1="${y}" y2="${y}" stroke="var(--line)"/><text x="${pl-6}" y="${y+3}" text-anchor="end">${+(mx*k/4).toFixed(1)}h</text>`}
 const st=Math.max(1,Math.ceil(n/6));let xl='';for(let i=0;i<n;i+=st)xl+=`<text x="${X(i)}" y="${H-6}" text-anchor="middle">${L[i]}</text>`;
 el.innerHTML=`<svg viewBox="0 0 ${W} ${H}"><defs><linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--c1);stop-opacity:.35"/><stop offset="1" style="stop-color:var(--c1);stop-opacity:0"/></linearGradient></defs>${g}${xl}
 <line x1="${pl}" x2="${W-pr}" y1="${Y(goal)}" y2="${Y(goal)}" stroke="var(--c3)" stroke-dasharray="5 4" opacity=".8"/>
 <path d="${d}L${X(n-1)},${pt+h}L${X(0)},${pt+h}Z" fill="url(#ag1)"/><path class="ln" d="${d}" fill="none" stroke="var(--c1)" stroke-width="2.6" stroke-linecap="round" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" style="transition:stroke-dashoffset 1s ease"/>
 <line id="ahl" y1="${pt}" y2="${pt+h}" stroke="var(--c1)" opacity="0" stroke-dasharray="3 3"/><circle id="adot" r="5" fill="var(--card)" stroke="var(--c1)" stroke-width="2.5" opacity="0"/></svg>`;
 requestAnimationFrame(()=>{const l=el.querySelector('.ln');if(l)l.style.strokeDashoffset=0});
 const s=el.querySelector('svg'),hl=s.querySelector('#ahl'),dt=s.querySelector('#adot');
 const mv=e=>{const r=s.getBoundingClientRect(),k=W/r.width,x=(e.clientX-r.left)*k,i=Math.max(0,Math.min(n-1,Math.round((x-pl)/w*(n-1))));hl.setAttribute('x1',X(i));hl.setAttribute('x2',X(i));hl.setAttribute('opacity',.5);dt.setAttribute('cx',X(i));dt.setAttribute('cy',Y(v[i]));dt.setAttribute('opacity',1);tip(el,L[i]+' · '+hm(v[i]*3600),X(i)/k,Y(v[i])/k)};
 const lv=()=>{hl.setAttribute('opacity',0);dt.setAttribute('opacity',0);tip(el,null)};
 s.addEventListener('pointermove',mv);s.addEventListener('pointerdown',mv);s.addEventListener('pointerleave',lv)}
function donut(el,m){const e=Object.entries(m).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]),T=sum(e.map(x=>x[1])),r=54,C=2*Math.PI*r;
 if(!T){el.innerHTML='<div class="empty">No focus time in this range yet</div>';return}
 let o=0,s='';e.forEach((x,i)=>{const f=x[1]/T;s+=`<circle cx="75" cy="75" r="${r}" fill="none" stroke="${PAL[i%6]}" stroke-width="18" stroke-dasharray="${Math.max(0,f*C-2)} ${C}" stroke-dashoffset="${-o*C}" transform="rotate(-90 75 75)"><title>${esc(x[0])} ${hm(x[1])}</title></circle>`;o+=f});
 el.innerHTML=`<div class="dn2"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="${r}" fill="none" stroke="var(--soft)" stroke-width="18"/>${s}<text class="ctr" x="75" y="77">${hm(T)}</text><text class="cts" x="75" y="92">total</text></svg><div class="lgd">${e.slice(0,6).map((x,i)=>`<div><i style="background:${PAL[i%6]}"></i><span>${esc(x[0])}</span><small>${Math.round(x[1]/T*100)}%</small></div>`).join('')}</div></div>`}
function ring(p,label){const r=34,C=2*Math.PI*r;return `<div><svg viewBox="0 0 90 90"><circle cx="45" cy="45" r="${r}" fill="none" stroke="var(--soft)" stroke-width="9"/><circle cx="45" cy="45" r="${r}" fill="none" stroke="var(--c1)" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.min(1,p))}" transform="rotate(-90 45 45)" style="transition:stroke-dashoffset .9s"/><text class="rv" x="45" y="50">${Math.round(p*100)}%</text></svg><small>${label}</small></div>`}

/* stat cards */
function stats(){const v=series(RNG),pv=[...Array(RNG)].map((_,i)=>sec(RNG*2-1-i)/3600),t=sum(v),pt=sum(pv),best=Math.max(...v),dl=pt?Math.round((t-pt)/pt*100):0,gh=ST.goal/60,td=sec(0)/3600;
 const S=[['timer','Focus today',hm(td*3600),Math.round(td/gh*100)+'% of goal',td>=gh?'up':''],['flame','Streak',(DEMO?9:streak())+' days','keep it going',''],['book','Total focus',(DEMO?Math.round(t*4):(totalSec()/3600)).toFixed(0)+' h','all time',''],['bolt','Daily average',hm(t/RNG*3600),(dl>=0?'+':'')+dl+'% vs last '+RNG+'d',dl>=0?'up':'dn'],['trophy','Best day',hm(best*3600),'in last '+RNG+' days',''],['hab','Sessions',sess(),'last '+RNG+' days','']];
 const card=s=>`<div class="card stat"><div class="si">${ic(s[0],18)}</div><div class="sl">${s[1]}</div><b>${s[2]}</b><em class="${s[4]}">${s[3]}</em></div>`;
 q('astat').innerHTML=S.map(card).join('');return S}
function ovStats(){const g=ST.goal/60,td=secOn(dk())/3600,wk=sum(series(7)),open=ST.tasks.filter(t=>!t.d).length,done=ST.tasks.length-open;
 const S=[['timer','Focus today',hm(td*3600),Math.round(Math.min(1,td/g)*100)+'% of goal',td>=g?'up':''],['flame','Streak',streak()+' days','daily rhythm',''],['bolt','This week',hm(wk*3600),'last 7 days',''],['ck','Tasks done',done+'/'+ST.tasks.length,open+' open','']];
 q('ostat').innerHTML=S.map(s=>`<div class="card stat"><div class="si">${ic(s[0],18)}</div><div class="sl">${s[1]}</div><b>${s[2]}</b><em class="${s[4]}">${s[3]}</em></div>`).join('')}

/* analytics page */
function drawAna(){if(!cur())return go('ov');
 q('arng').innerHTML=[7,30,90].map(n=>`<button class="${n===RNG?'on':''}" onclick="svRng(${n})">${n} days</button>`).join('');
 q('adm').style.display=DEMO?'':'none';q('ademo').textContent=DEMO?'Use my real data':'Preview with sample data';
 stats();const v=series(RNG),L=v.map((_,i)=>lab(RNG-1-i)),w=series(7),gh=ST.goal/60,sub=bySub(0,RNG-1),psub=bySub(RNG,RNG*2-1),T=sum(Object.values(sub));
 const wd=[...Array(7)].map((_,i)=>dOff(6-i).toLocaleDateString(undefined,{weekday:'short'}).slice(0,1));
 const hmx=[...Array(105)].map((_,i)=>sec(104-i)/3600),mxh=Math.max(.01,...hmx);
 const h24=hours24(),hx=Math.max(.01,...h24);
 const rows=Object.entries(sub).sort((a,b)=>b[1]-a[1]);
 q('agrid').innerHTML=`
 <div class="card c8"><div class="ct"><div><h3>Focus trend</h3><small>Hours per day · dashed line is your goal</small></div></div><div class="ch2" id="aTrend"></div></div>
 <div class="card c4"><div class="ct"><div><h3>Subjects</h3><small>Where your time went</small></div></div><div id="aDon"></div></div>
 <div class="card c6"><div class="ct"><div><h3>This week</h3><small>Tap a bar for the exact time</small></div></div><div class="pl">${w.map((x,i)=>`<div tabindex="0" class="${i===6?'td':''}" data-v="${hm(x*3600)}"><span class="tk"><i style="height:4%"></i></span>${wd[i]}</div>`).join('')}</div></div>
 <div class="card c6"><div class="ct"><div><h3>Consistency</h3><small>Last 15 weeks</small></div></div><div class="hm">${hmx.map((x,i)=>`<i data-l="${x<=0?0:Math.min(4,1+Math.floor(x/mxh*3.99))}" title="${lab(104-i)} · ${hm(x*3600)}"></i>`).join('')}</div></div>
 <div class="card c6"><div class="ct"><div><h3>Best hours</h3><small>When you focus the most</small></div></div><div class="hr">${h24.map((x,i)=>`<i style="height:4%" data-h="${Math.max(4,x/hx*100)}" title="${i}:00 · ${hm(x*3600)}"></i>`).join('')}</div><div class="hrl"><span>12 AM</span><span>6 AM</span><span>12 PM</span><span>6 PM</span><span>11 PM</span></div></div>
 <div class="card c6"><div class="ct"><div><h3>Performance</h3><small>Today at a glance</small></div></div><div class="rg3">${ring(Math.min(1,sec(0)/3600/gh),'Daily goal')}${ring(taskDone(),'Tasks')}${ring(habToday(),'Habits')}</div></div>
 <div class="card c12"><div class="ct"><div><h3>Time breakdown</h3><small>Compared with the previous ${RNG} days</small></div></div><div style="overflow-x:auto">${rows.length?`<table class="tb"><thead><tr><th>Subject</th><th>Time</th><th>Share</th><th>Change</th></tr></thead><tbody>${rows.map((r,i)=>{const p=psub[r[0]]||0,c=p?Math.round((r[1]-p)/p*100):null;return `<tr><td>${esc(r[0])}</td><td>${hm(r[1])}</td><td><div class="mb"><i style="width:${Math.round(r[1]/T*100)}%;background:${PAL[i%6]}"></i></div></td><td class="${c===null?'':c>=0?'up':'dn'}">${c===null?'new':(c>=0?'▲ ':'▼ ')+Math.abs(c)+'%'}</td></tr>`}).join('')}</tbody></table>`:'<div class="empty">Start a focus session and your subjects will show up here.</div>'}</div></div>`;
 area(q('aTrend'),v,L,gh);donut(q('aDon'),sub);
 requestAnimationFrame(()=>{const mx=Math.max(1,gh,...w);document.querySelectorAll('.pl .tk i').forEach((e,i)=>e.style.height=Math.max(5,w[i]/mx*100)+'%');document.querySelectorAll('.hr i').forEach(e=>e.style.height=e.dataset.h+'%')})}
window.svRng=n=>{RNG=n;drawAna()};
window.svDemo=()=>{DEMO=!DEMO;drawAna();ovStats()};

/* theme picker in settings */
function pickDraw(){const el=q('thcard');if(!el)return;
 const tile=(id,n,d,c)=>`<button class="thc ${id==='kiwi'?'kw ':''}${cur()===id?'on':''}" onclick="svSkin('${id}')"><div class="thp" style="background:${c[0]}"><i style="background:${c[1]}"></i><div><b style="background:${c[1]}"></b><b style="background:${c[2]}"></b></div></div><strong>${n}</strong><small>${d}</small></button>`;
 el.innerHTML=`<h3>Themes <span class="mut">pick a look, switch anytime</span></h3><div class="thg">${tile('','Classic','Original Studyverse',['#ffd7a3','#fff','#ff9a5c'])}${SK.map(s=>tile(s[0],s[1],s[2],s[3])).join('')}</div>`}
window.svSkin=id=>{if(id==='kiwi'&&R.dataset.theme!=='dark')tgTheme();if(id)R.dataset.skin=id;else R.removeAttribute('data-skin');try{localStorage.setItem('svskin',id)}catch(e){}
 const on=document.querySelector('.pg.on');if(on&&on.id==='p-ana'&&!id)go('ov');else if(on&&on.id==='p-ana')drawAna();
 pickDraw();ovStats();const m=document.querySelector('meta[name=theme-color]');snack(id?SK.find(s=>s[0]===id)[1]+' theme applied':'Classic theme restored')};
document.querySelector('#p-set .g').insertAdjacentHTML('beforeend','<div class="card" id="thcard" style="grid-column:1/-1"></div>');

/* hook into existing render functions */
const _rp=renderPage;renderPage=function(id){_rp(id);if(id==='ana')drawAna();if(id==='set')pickDraw()};
const _ro=rOv;rOv=function(){_ro();ovStats()};
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{const p=document.querySelector('.pg.on');if(p&&p.id==='p-ana')drawAna()},200)});
pickDraw();ovStats();
})();
