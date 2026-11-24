/* Group study Challenges: tasks, verification, XP and daily/weekly/all-time rankings.
   Data lives inside the existing room: groupRooms/{room}/challenges, chSubs, xpLog.
   XP is never stored on a member; it is always the sum of xpLog entries, so it can't drift or double up. */
(function(){
const q=id=>document.getElementById(id);
let C=[],SUB={},XP=[],un=[],fl='act',bs='day',bo=0,sig='',tm=null;
const ref=()=>fdb.collection('groupRooms').doc(ST.room);
const role=()=>(mem[fuid]||{}).role,isM=()=>role()==='admin'||role()==='manager';
const sid=s=>String(s).replace(/[^\w-]/g,'');
const pad=n=>String(n).padStart(2,'0');
const lk=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const mon=d=>{const x=new Date(d.getFullYear(),d.getMonth(),d.getDate());x.setDate(x.getDate()-(x.getDay()+6)%7);return x};
const tsd=t=>t&&t.toDate?t.toDate():t&&t.seconds?new Date(t.seconds*1000):new Date();
const fd=(d,o)=>d.toLocaleString(undefined,o);

/* ---------- ranking maths (pure) ---------- */
function agg(E,scope,off,now){now=now||new Date();let key='';
 if(scope==='day')key=lk(new Date(now.getFullYear(),now.getMonth(),now.getDate()-off));
 if(scope==='week'){const m=mon(now);m.setDate(m.getDate()-7*off);key=lk(m)}
 const R={},days={};
 E.forEach(e=>{const d=tsd(e.at),u=e.uid,r=R[u]=R[u]||{xp:0,n:0,streak:0,tot:0};r.tot+=e.xp||0;
  if(e.kind!=='bonus')(days[u]=days[u]||new Set()).add(lk(d));
  const ok=scope==='all'||(scope==='day'&&lk(d)===key)||(scope==='week'&&lk(mon(d))===key);
  if(ok){r.xp+=e.xp||0;if(e.kind!=='bonus')r.n++}});
 Object.keys(R).forEach(u=>{const s=days[u]||new Set();let d=new Date(now.getFullYear(),now.getMonth(),now.getDate()),n=0;
  if(!s.has(lk(d)))d.setDate(d.getDate()-1);
  while(s.has(lk(d))){n++;d.setDate(d.getDate()-1)}R[u].streak=n});
 return {key,R}}
function table(members,E,scope,off,now){const {key,R}=agg(E,scope,off,now),rows=Object.entries(members).map(([id,m])=>({id,m,...(R[id]||{xp:0,n:0,streak:0,tot:0})}));
 rows.sort((a,b)=>b.xp-a.xp||b.n-a.n||String(a.m.name||'').localeCompare(String(b.m.name||'')));
 let r=0;rows.forEach((x,i)=>{if(!i||x.xp!==rows[i-1].xp||x.n!==rows[i-1].n)r=i+1;x.rank=r});return {key,rows}}

/* ---------- helpers ---------- */
const mine=c=>c.assign==='all'||(Array.isArray(c.assign)&&c.assign.includes(fuid));
const sub=(c,u)=>SUB[c.id+'_'+u];
const late=c=>c.deadlineMs&&Date.now()>c.deadlineMs;
function left(c){if(!c.deadlineMs)return 'No deadline';const ms=c.deadlineMs-Date.now(),a=Math.abs(ms),m=Math.floor(a/6e4),h=Math.floor(m/60),d=Math.floor(h/24),t=d?d+'d '+(h%24)+'h':h?h+'h '+(m%60)+'m':m+'m';return ms<0?'Ended '+t+' ago':t+' left'}
const who=c=>c.assign==='all'?'Everyone':(c.assign||[]).length+' member'+((c.assign||[]).length===1?'':'s');
const err=(e,w)=>snack(e&&e.code==='permission-denied'?'Firebase rules are blocking Challenges. Publish the Challenges rules once in the Firebase console.':'Could not '+w+' ('+(e&&e.code||'error')+')');
let warned=0;const lerr=e=>{if(!warned&&e&&e.code==='permission-denied'){warned=1;snack('Challenges need the Firebase rules update to load')}};
const nm=u=>esc((mem[u]||{}).name||'Member');

/* ---------- rendering ---------- */
function pending(){return C.flatMap(c=>Object.values(SUB).filter(s=>s.cid===c.id&&s.status==='pending'&&mem[s.uid]).map(s=>({c,s})))}
function item(c){const s=sub(c,fuid),m=isM(),st=s?s.status:'none';let act='';
 if(mine(c)){if(st==='approved')act='<span class="chs ok">Approved · +'+c.xp+' XP</span>';
  else if(st==='pending')act='<span class="chs pd">Waiting for review</span>';
  else if(late(c))act='<span class="chs no">Deadline passed</span>';
  else act=(st==='rejected'?'<span class="chs no">Rejected'+(s.reason?': '+esc(s.reason):'')+'</span>':'')+`<button class="btn p sm" onclick="SVCH.submit('${sid(c.id)}')">${st==='rejected'?'Resubmit':'Submit for review'}</button>`}
 let mg='';
 if(m){const ids=c.assign==='all'?Object.keys(mem):(c.assign||[]).filter(u=>mem[u]),ss=ids.map(u=>sub(c,u)),ap=ss.filter(x=>x&&x.status==='approved').length,pd=ss.filter(x=>x&&x.status==='pending').length;
  mg=`<div class="chm"><span>${ap} approved</span><span>${pd} pending</span><span>${ids.length-ap-pd} to go</span></div>`+
  Object.values(SUB).filter(x=>x.cid===c.id&&x.status==='pending'&&mem[x.uid]).map(x=>rev(c,x)).join('')+
  `<div class="cha"><button class="btn sm" style="color:#d4503e" onclick="SVCH.del('${sid(c.id)}')">Delete</button></div>`}
 return `<div class="chi"><div class="chh"><b>${esc(c.title)}</b><span class="tag">+${c.xp} XP</span></div>${c.desc?`<div class="mut" style="margin-top:4px;white-space:pre-wrap;overflow-wrap:anywhere">${esc(c.desc)}</div>`:''}
 <div class="chm"><span>${c.deadlineMs?fd(new Date(c.deadlineMs),{day:'numeric',month:'short',hour:'numeric',minute:'2-digit'})+' · ':''}${left(c)}</span><span>${who(c)}</span><span>by ${esc(c.byName||'Manager')}</span></div>${act?`<div class="cha">${act}</div>`:''}${mg}</div>`}
function rev(c,s){return `<div class="sbm">${gAv((mem[s.uid]||{}).icon,28)}<div style="min-width:0;flex:1"><b>${nm(s.uid)}</b>${s.note?`<div class="mut" style="overflow-wrap:anywhere">${esc(s.note)}</div>`:''}</div><div class="ab"><button class="btn p sm" onclick="SVCH.ok('${sid(c.id)}','${sid(s.uid)}')">Approve</button><button class="btn sm" onclick="SVCH.no('${sid(c.id)}','${sid(s.uid)}')">Reject</button></div></div>`}
function drawC(){const el=q('chList');if(!el)return;const m=isM(),P=pending(),
 vis=C.filter(c=>m||mine(c)),done=c=>mine(c)&&(sub(c,fuid)||{}).status==='approved',
 act=vis.filter(c=>!late(c)&&!done(c)),past=vis.filter(c=>late(c)||done(c));
 q('chNew').style.display=m?'':'none';
 q('chTabs').innerHTML=`<button class="${fl==='act'?'on':''}" onclick="SVCH.f('act')">Active ${act.length}</button>`+(m?`<button class="${fl==='rev'?'on':''}" onclick="SVCH.f('rev')">To review ${P.length}</button>`:'')+`<button class="${fl==='past'?'on':''}" onclick="SVCH.f('past')">Past ${past.length}</button>`;
 if(fl==='rev'&&!m)fl='act';
 const L=fl==='rev'?P.map(x=>`<div class="chi"><div class="chh"><b>${esc(x.c.title)}</b><span class="tag">+${x.c.xp} XP</span></div>${rev(x.c,x.s)}</div>`):(fl==='past'?past:act).map(item);
 el.innerHTML=L.length?L.join(''):`<div class="empty">${fl==='rev'?'Nothing waiting for review':fl==='past'?'No past challenges yet':m?'No active challenges. Create one to get the room moving.':'No active challenges for you right now.'}</div>`}
function drawL(){const el=q('chBoard');if(!el)return;const T=table(mem,XP,bs,bo),me=T.rows.find(x=>x.id===fuid);
 const now=new Date(),lab=bs==='all'?'All time':bs==='day'?(bo===0?'Today':bo===1?'Yesterday':fd(new Date(now.getFullYear(),now.getMonth(),now.getDate()-bo),{day:'numeric',month:'short'})):(bo===0?'This week':bo===1?'Last week':'Week of '+fd(new Date(T.key+'T00:00'),{day:'numeric',month:'short'}));
 q('chScope').innerHTML=['day:Daily','week:Weekly','all:All-time'].map(x=>{const [k,n]=x.split(':');return `<button class="${bs===k?'on':''}" onclick="SVCH.s('${k}')">${n}</button>`}).join('');
 q('chNav').innerHTML=bs==='all'?'<span class="mut">Total XP since the room started</span>':`<button class="btn sm" onclick="SVCH.o(1)">‹</button><b style="min-width:92px;text-align:center">${lab}</b><button class="btn sm" ${bo?'':'disabled style="opacity:.4"'} onclick="SVCH.o(-1)">›</button>`+(bs==='day'?'<span class="mut" style="margin-left:auto">Resets at midnight</span>':'<span class="mut" style="margin-left:auto">Resets Monday</span>');
 el.innerHTML=(me?`<div class="lbs"><div><span class="mut">Your rank</span><b>#${me.rank}</b></div><div><span class="mut">XP</span><b>${me.xp}</b></div><div><span class="mut">Tasks</span><b>${me.n}</b></div><div><span class="mut">Streak</span><b>${me.streak}d</b></div></div>`:'')+
 (T.rows.length?T.rows.map(x=>`<div class="rk ${x.id===fuid?'self':''}"><span class="rkn" style="flex:none">${x.rank}</span>${gAv(x.m.icon,34)}<span style="min-width:0"><b style="overflow-wrap:anywhere">${esc(x.m.name||'Member')}${x.id===fuid?' (you)':''}</b><div class="mut" style="font-size:11.5px">${x.n} task${x.n===1?'':'s'} · ${x.streak}d streak</div></span><b style="flex:none;color:var(--o)">${x.xp} XP</b>${isM()?`<button class="btn sm" style="flex:none;padding:4px 10px" title="Give or take XP" onclick="SVCH.bonus('${sid(x.id)}')">±</button>`:''}</div>`).join(''):'<div class="empty">No members yet</div>')}
function draw(){drawC();drawL()}

/* ---------- actions ---------- */
function modal(h){openM(h)}
const S={
 f:k=>{fl=k;drawC()},s:k=>{bs=k;bo=0;drawL()},o:d=>{bo=Math.max(0,bo+d);drawL()},
 newCh(){if(!isM())return;const ms=Object.entries(mem);
  modal(`<h3>New challenge</h3><div class="chf">
  <label><em>Title</em><input id="cht" maxlength="60" placeholder="e.g. Finish Physics chapter 4"></label>
  <label><em>Description <span>(optional)</span></em><textarea id="chd" maxlength="400" rows="3" placeholder="What should members do?"></textarea></label>
  <div class="chg2"><label><em>XP reward</em><input id="chx" type="number" inputmode="numeric" min="1" max="1000" value="50"></label><label><em>Deadline <span>(optional)</span></em><input id="chl" type="datetime-local"></label></div>
  <div><div class="chl2">Assign to</div><div class="chips"><button id="cha1" class="on" onclick="SVCH.pick(1)">Whole room</button><button id="cha0" onclick="SVCH.pick(0)">Pick members</button></div></div>
  <div id="chp" class="chpl" style="display:none">${ms.map(([id,m])=>`<label class="chp"><input type="checkbox" value="${sid(id)}">${gAv(m.icon,30)}<span>${esc(m.name||'Member')}</span></label>`).join('')}</div>
  <div class="cfa"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="SVCH.create()">Create challenge</button></div></div>`)},
 pick(a){q('cha1').classList.toggle('on',!!a);q('cha0').classList.toggle('on',!a);q('chp').style.display=a?'none':'block'},
 async create(){if(!isM())return;const t=q('cht').value.trim(),xp=Math.round(+q('chx').value),l=q('chl').value,all=q('cha1').classList.contains('on'),
  ids=[...document.querySelectorAll('#chp input:checked')].map(i=>i.value);
  if(!t){snack('Add a title');return}if(!(xp>=1&&xp<=1000)){snack('XP must be between 1 and 1000');return}if(!all&&!ids.length){snack('Pick at least one member');return}
  const dl=l?new Date(l).getTime():null;if(l&&!(dl>Date.now())){snack('Deadline must be in the future');return}
  try{await ref().collection('challenges').add({title:t,desc:q('chd').value.trim(),xp,deadlineMs:dl,assign:all?'all':ids,createdBy:fuid,byName:(mem[fuid]||{}).name||ST.name||'Manager',createdAt:ts()});closeM();snack('Challenge created')}catch(e){err(e,'create challenge')}},
 submit(cid){const c=C.find(x=>x.id===cid);if(!c||!mine(c)||late(c))return;const s=sub(c,fuid);if(s&&(s.status==='approved'||s.status==='pending'))return;
  modal(`<h3>Submit for review</h3><div class="chf"><div class="mut">${esc(c.title)} · +${c.xp} XP</div><label><em>Note for the reviewer <span>(optional)</span></em><textarea id="chn" maxlength="300" rows="3" placeholder="What did you finish?"></textarea></label><div class="cfa"><button class="btn" onclick="closeM()">Cancel</button><button class="btn p" onclick="SVCH.send('${sid(cid)}')">Submit</button></div></div>`)},
 async send(cid){const c=C.find(x=>x.id===cid);if(!c||!mine(c)||late(c))return;const m=mem[fuid]||{};
  try{await ref().collection('chSubs').doc(cid+'_'+fuid).set({cid,uid:fuid,name:m.name||ST.name||'Member',icon:m.icon||'leaf',status:'pending',note:(q('chn').value||'').trim(),reason:'',submittedAt:ts()});closeM();snack('Submitted for review')}catch(e){err(e,'submit')}},
 async ok(cid,u){if(!isM())return;const sr=ref().collection('chSubs').doc(cid+'_'+u),xr=ref().collection('xpLog').doc(cid+'_'+u),c=C.find(x=>x.id===cid);if(!c)return;
  try{const r=await fdb.runTransaction(async t=>{const [s,x]=await Promise.all([t.get(sr),t.get(xr)]);if(!s.exists||s.data().status!=='pending')return 'stale';
   const by={reviewedBy:fuid,reviewedAt:ts()};t.update(sr,{status:'approved',...by});
   if(x.exists)return 'dup';t.set(xr,{cid,uid:u,kind:'task',title:c.title,xp:c.xp,at:ts(),by:fuid,byName:(mem[fuid]||{}).name||'Manager'});return 'ok'});
   snack(r==='ok'?'Approved, +'+c.xp+' XP awarded':r==='dup'?'Already rewarded earlier. Marked approved.':'Already reviewed')}catch(e){err(e,'approve')}},
 async no(cid,u){if(!isM())return;const r=prompt('Reason for rejecting (optional)');if(r===null)return;
  try{await fdb.runTransaction(async t=>{const sr=ref().collection('chSubs').doc(cid+'_'+u),s=await t.get(sr);if(s.exists&&s.data().status==='pending')t.update(sr,{status:'rejected',reason:r.trim().slice(0,160),reviewedBy:fuid,reviewedAt:ts()})});snack('Rejected')}catch(e){err(e,'reject')}},
 async del(cid){if(!isM()||!confirm('Delete this challenge? XP already awarded stays in the rankings.'))return;
  try{const b=fdb.batch();Object.values(SUB).filter(s=>s.cid===cid).forEach(s=>b.delete(ref().collection('chSubs').doc(cid+'_'+s.uid)));b.delete(ref().collection('challenges').doc(cid));await b.commit();snack('Challenge deleted')}catch(e){err(e,'delete')}},
 async bonus(u){if(!isM()||!mem[u])return;const a=prompt('XP to give '+(mem[u].name||'member')+' (use a minus sign to deduct, -500 to 500)','10');if(a===null)return;const v=Math.round(+a);
  if(!v||v<-500||v>500){snack('Enter a number from -500 to 500');return}const why=(prompt('Reason (optional)')||'').trim().slice(0,80);
  try{await ref().collection('xpLog').doc('b'+Date.now().toString(36)+'_'+u).set({cid:'',uid:u,kind:'bonus',title:why||(v>0?'Bonus XP':'XP adjustment'),xp:v,at:ts(),by:fuid,byName:(mem[fuid]||{}).name||'Manager'});snack((v>0?'+':'')+v+' XP for '+(mem[u].name||'member'))}catch(e){snack('Could not update XP ('+(e.code||'error')+')')}}
};

/* ---------- wiring into the existing room ---------- */
function stop(){un.forEach(u=>u());un=[];clearInterval(tm);tm=null;C=[];SUB={};XP=[]}
function start(){if(!fdb||!ST.room||!q('chList'))return;stop();const r=ref();
 un.push(r.collection('challenges').orderBy('createdAt','desc').limit(60).onSnapshot(s=>{C=s.docs.map(d=>({id:d.id,...d.data()}));drawC()},lerr));
 un.push(r.collection('chSubs').limit(800).onSnapshot(s=>{SUB={};s.docs.forEach(d=>SUB[d.id]=d.data());drawC()},lerr));
 un.push(r.collection('xpLog').orderBy('at','desc').limit(1000).onSnapshot(s=>{XP=s.docs.map(d=>({id:d.id,...d.data()}));draw()},lerr));
 let day=lk(new Date());tm=setInterval(()=>{const k=lk(new Date());if(k!==day){day=k;bo=0}if(q('gRoom').style.display!=='none')draw()},30000);draw()}
const g=q('rank').closest('.g');
g.insertAdjacentHTML('beforebegin',`<div class="g g2" id="chSec" style="margin-bottom:18px"><div class="card"><div class="chtop"><h3>Challenges</h3><button class="btn p sm" id="chNew" style="display:none" onclick="SVCH.newCh()">New challenge</button></div><div class="chips" id="chTabs" style="margin-bottom:10px"></div><div id="chList"></div></div>
<div class="card"><div class="chtop"><h3>XP leaderboard</h3><div class="chips" id="chScope"></div></div><div id="chNav" style="display:flex;gap:8px;align-items:center;margin-bottom:10px;flex-wrap:wrap"></div><div id="chBoard"></div></div></div>`);
const st=document.createElement('style');
st.textContent='.chf{display:grid;gap:16px;margin-top:12px}.chf label{display:grid;gap:7px;font-size:12px;font-weight:700;color:var(--mute)}.chf label em{font-style:normal}.chf label span{font-weight:600;opacity:.75}.chf input,.chf textarea{width:100%;box-sizing:border-box;margin:0;min-width:0}.chf textarea{border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:14px;padding:10px 14px;font:inherit;resize:vertical}.chf input[type=number]{-moz-appearance:textfield}.chf input[type=number]::-webkit-inner-spin-button,.chf input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}.chg2{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.7fr);gap:12px}.chl2{font-size:12px;font-weight:700;color:var(--mute);margin-bottom:8px}.chpl{max-height:210px;overflow-y:auto;overflow-x:hidden;display:grid;gap:8px;scrollbar-width:thin}.chp{display:flex!important;align-items:center;gap:12px;padding:8px 12px;border-radius:14px;background:var(--soft);cursor:pointer;font-weight:700!important;font-size:14px!important;color:var(--ink)!important;border:1px solid transparent;transition:border-color .2s,background .2s}.chp:hover{border-color:var(--o)}.chp input{width:20px!important;height:20px;padding:0;flex:none;accent-color:var(--o);cursor:pointer}.chp .gav{flex:none}.chp span{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:700;opacity:1!important;color:var(--ink)}.chp:has(input:checked){border-color:var(--o);background:color-mix(in srgb,var(--o) 12%,var(--soft))}.cfa{display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap;margin-top:2px}@media(max-width:480px){.chg2{grid-template-columns:1fr}.cfa .btn{flex:1;justify-content:center}}.rk .gav,.sbm .gav{flex:none}.chtop{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:10px}.chtop h3{margin:0}.btn.sm{padding:6px 14px;font-size:12px}.chi{background:var(--soft);border:1px solid var(--line);border-radius:16px;padding:12px 14px;margin-bottom:10px}.chh{display:flex;justify-content:space-between;gap:8px;align-items:flex-start}.chh b{font-size:14px;overflow-wrap:anywhere}.chm{display:flex;gap:4px 12px;flex-wrap:wrap;font-size:11.5px;color:var(--mute);margin:6px 0}.cha{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:8px}.chs{font-size:11.5px;font-weight:800;padding:4px 11px;border-radius:99px;background:var(--card);border:1px solid var(--line)}.chs.ok{color:#2fb86b}.chs.no{color:#e5604d}.chs.pd{color:var(--o)}.sbm{display:flex;align-items:center;gap:10px;padding:8px 0;border-top:1px dashed var(--line);font-size:12.5px;flex-wrap:wrap}.sbm .ab{display:flex;gap:6px;margin-left:auto}.lbs{background:var(--soft);border-radius:14px;padding:10px 14px;margin-bottom:10px;display:flex;gap:6px 18px;flex-wrap:wrap}.lbs div{font-size:11.5px}.lbs b{display:block;font-size:17px}#chSec textarea{border:1px solid var(--line);background:var(--soft);color:var(--ink);border-radius:14px;padding:10px 12px;font:inherit;resize:vertical}';
document.head.appendChild(st);
window.SVCH=Object.assign(S,{agg,table,lk,start});
const _en=enter;enter=async function(id){await _en(id);if(ST.room===id&&rdata)start()};
const _gd=gDraw;gDraw=function(){_gd();const k=fuid+'|'+Object.entries(mem).map(([i,m])=>i+(m.role||'')+(m.name||'')+(m.icon||'')).join();if(k!==sig){sig=k;if(un.length)draw()}};
const _bl=backLobby;backLobby=function(){stop();_bl()};
})();
