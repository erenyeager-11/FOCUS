/* Floating focus timer. Reuses the existing timer state (tool, end, fcStart, swStart, cdEnd ...) and the existing
   Picture-in-Picture button. Only the look and the controls of the floating window are replaced here.
   - Desktop Chrome/Edge: real always-on-top Document PiP window with pause/resume and return buttons.
   - Android Chrome: system Picture-in-Picture window drawn from a canvas, with system play/pause + expand buttons
     (wired through Media Session), and automatic floating when you leave the app while a timer is running. */
(function(){
const PARTS=[['M14 27L10 5L27 17Z','#1b1426'],['M50 27L54 5L37 17Z','#1b1426'],['M11 52C11 28 21 19 32 19C43 19 53 28 53 52Z','#1b1426'],['M32 21.500l1.800 3.800 3.800 1.800-3.800 1.800L32 32.700l-1.800-3.800-3.800-1.800 3.800-1.800z','#ff6fae'],['M32 52C24.500 52 20 47 20 41.500 20 36 25 32 32 32s12 4 12 9.500C44 47 39.500 52 32 52z','#f7e8f6']];
const mascotSvg=()=>'<svg viewBox="0 0 64 64" width="100%" height="100%"><rect width="64" height="64" rx="16" fill="#b79ddb"/>'+PARTS.map(p=>`<path d="${p[0]}" fill="${p[1]}"/>`).join('')+'<circle cx="27" cy="43" r="1.6" fill="#1b1426"/><circle cx="37" cy="43" r="1.6" fill="#1b1426"/><path d="M29.500 47q2.500 2 5 0" stroke="#1b1426" stroke-width="1.300" fill="none" stroke-linecap="round"/><circle cx="23.500" cy="46.500" r="2" fill="#ff9ec7" opacity=".6"/><circle cx="40.500" cy="46.500" r="2" fill="#ff9ec7" opacity=".6"/></svg>';
const rr=(x,a,b,w,h,r)=>{x.beginPath();x.moveTo(a+r,b);x.arcTo(a+w,b,a+w,b+h,r);x.arcTo(a+w,b+h,a,b+h,r);x.arcTo(a,b+h,a,b,r);x.arcTo(a,b,a+w,b,r);x.closePath()};
const label=()=>(tool==='pomo'&&mode==='focus')?'Focus Mode':lbl();
const PLAY='<svg viewBox="0 0 24 24" width="20" height="20"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>',PAUSE='<svg viewBox="0 0 24 24" width="20" height="20"><circle cx="12" cy="12" r="8.500" fill="none" stroke="currentColor" stroke-width="2.200"/><path d="M10 9v6M14 9v6" stroke="currentColor" stroke-width="2.200" stroke-linecap="round"/></svg>',OUT='<svg viewBox="0 0 24 24" width="20" height="20"><path d="M7 17L17 7M9 7h8v8" fill="none" stroke="currentColor" stroke-width="2.200" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const toggle=()=>({pomo:toggleT,fc:fcToggle,sw:swToggle,cd:cdToggle}[tool])();
const back=()=>{try{window.focus()}catch(e){}if(typeof go==='function')go('focus');if(pipW)pipW.close()};

/* canvas frame for system PiP (Android and other browsers) */
function paint(c){const x=c.getContext('2d'),W=c.width,H=c.height,g=x.createLinearGradient(0,0,W,H);g.addColorStop(0,'#2a1f45');g.addColorStop(1,'#140f22');x.fillStyle=g;x.fillRect(0,0,W,H);
 const s=Math.round(H*.34),ax=Math.round(W*.07),ay=Math.round(H*.12);x.save();x.translate(ax,ay);x.scale(s/64,s/64);x.fillStyle='#b79ddb';rr(x,0,0,64,64,16);x.fill();
 PARTS.forEach(p=>{x.fillStyle=p[1];x.fill(new Path2D(p[0]))});x.fillStyle='#1b1426';[27,37].forEach(e=>{x.beginPath();x.arc(e,43,1.6,0,7);x.fill()});x.restore();
 x.textAlign='left';x.fillStyle='#dcc8ff';x.font='700 '+Math.round(H*.12)+'px Nunito,system-ui,sans-serif';x.fillText(label(),ax+s+Math.round(W*.05),ay+Math.round(H*.12)+Math.round(s*.34));
 x.fillStyle='#fff';x.font='800 '+Math.round(H*.3)+'px Nunito,system-ui,sans-serif';x.textAlign='center';x.fillText(tmTxt(),W/2,Math.round(H*.80));
 const on=runN();x.fillStyle=on?'#8d7be0':'#4a3a6e';rr(x,W-Math.round(W*.3),Math.round(H*.1),Math.round(W*.23),Math.round(H*.13),Math.round(H*.065));x.fill();
 x.fillStyle='#fff';x.font='800 '+Math.round(H*.075)+'px Nunito,system-ui,sans-serif';x.fillText(on?'RUNNING':'PAUSED',W-Math.round(W*.185),Math.round(H*.1)+Math.round(H*.092))}

/* Document PiP (desktop) */
const CSS='*{box-sizing:border-box}body{margin:0;height:100vh;display:flex;align-items:center;gap:12px;padding:10px 14px;background:#1d1730;color:#fff;font-family:Nunito,"Segoe UI",system-ui,sans-serif;overflow:hidden;user-select:none}#av{width:54px;height:54px;flex:none;border-radius:16px;overflow:hidden}#tx{flex:1;min-width:0}#ps{font-weight:700;font-size:15px;color:#dcc8ff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#pt{font-size:32px;font-weight:800;line-height:1.1;font-variant-numeric:tabular-nums;letter-spacing:-.5px}button{width:42px;height:42px;flex:none;border-radius:14px;border:0;background:#4a3a6e;color:#dcc8ff;display:grid;place-items:center;cursor:pointer;transition:transform .15s,background .2s}button:hover{background:#5d4a88}button:active{transform:scale(.92)}';
function pipUpd(){if(pipW){const d=pipW.document,t=d.getElementById('pt');if(t){t.textContent=tmTxt();d.getElementById('pb').innerHTML=runN()?PAUSE:PLAY;d.getElementById('pb').title=runN()?'Pause':'Resume';d.getElementById('ps').textContent=label();d.title=tmTxt()+' · '+label()}}
 if(pipV&&pipV.__c)paint(pipV.__c);meta();arm()}
function meta(){if(!('mediaSession' in navigator)||!pipV)return;try{navigator.mediaSession.metadata=new MediaMetadata({title:tmTxt(),artist:label(),album:'Studyverse'});navigator.mediaSession.playbackState=runN()?'playing':'paused'}catch(e){}}
function actions(){if(!('mediaSession' in navigator))return;const t=()=>{toggle();setTimeout(pipUpd,60)};
 [['play',t],['pause',t],['stop',t],['enterpictureinpicture',()=>openVideo().catch(()=>{})]].forEach(([a,f])=>{try{navigator.mediaSession.setActionHandler(a,f)}catch(e){}})}

/* video PiP (system window; this is what floats over other Android apps) */
async function openVideo(){if(pipV&&document.pictureInPictureElement===pipV)return;
 if(!pipV)makeVideo();await pipV.play();await pipV.requestPictureInPicture()}
function makeVideo(){const c=document.createElement('canvas');c.width=360;c.height=180;paint(c);const v=document.createElement('video');v.muted=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('autopictureinpicture','');v.style.cssText='position:fixed;width:2px;height:2px;opacity:.01;pointer-events:none;left:0;bottom:0';v.srcObject=c.captureStream(2);v.__c=c;document.body.appendChild(v);pipV=v;actions();
 pipI=setInterval(()=>{pipUpd()},1000);
 v.addEventListener('leavepictureinpicture',()=>{if(!(runN()&&auto())){killVideo()}else{try{navigator.mediaSession.setActionHandler('enterpictureinpicture',()=>openVideo().catch(()=>{}))}catch(e){}}})}
function killVideo(){clearInterval(pipI);pipI=null;if(pipV){pipV.pause();pipV.srcObject=null;pipV.remove();pipV=null}}
const auto=()=>{try{return localStorage.getItem('svpipauto')==='1'}catch(e){return false}};
function arm(){if(!auto()||window.documentPictureInPicture&&!/Android/i.test(navigator.userAgent))return;if(runN()&&!pipV){try{makeVideo();pipV.play().catch(()=>{})}catch(e){}}else if(!runN()&&pipV&&document.pictureInPictureElement!==pipV)killVideo()}
document.addEventListener('visibilitychange',()=>{if(document.hidden&&runN()&&auto()&&pipV&&document.pictureInPictureElement!==pipV&&!pipW)pipV.requestPictureInPicture().catch(()=>{})});

pipDraw=c=>paint(c);
window.pipUpd=pipUpd;
togglePip=async function(){
 if(pipW){pipW.close();return}
 if(document.pictureInPictureElement){await document.exitPictureInPicture();return}
 try{
  if(window.documentPictureInPicture&&!/Android/i.test(navigator.userAgent)){
   pipW=await documentPictureInPicture.requestWindow({width:360,height:104});const d=pipW.document;
   d.head.innerHTML='<meta charset="utf-8"><title>Focus</title><style>'+CSS+'</style>';
   d.body.innerHTML='<div id="av">'+mascotSvg()+'</div><div id="tx"><div id="ps"></div><div id="pt"></div></div><button id="pb"></button><button id="po" title="Back to session">'+OUT+'</button>';
   d.getElementById('pb').onclick=()=>{toggle();pipUpd()};d.getElementById('po').onclick=back;
   pipW.addEventListener('pagehide',()=>{pipW=null});pipUpd()
  }else if(document.pictureInPictureEnabled){
   await openVideo();try{localStorage.setItem('svpipauto','1')}catch(e){}
   if(/Android/i.test(navigator.userAgent))snack('Floating timer on. It also pops out when you leave the app while a timer runs.')
  }else snack('Picture in picture is not supported in this browser')
 }catch(e){snack(e&&e.name==='NotAllowedError'?'Allow Picture in picture for this browser in your phone settings, then try again':'Could not open the floating timer')}};
})();
