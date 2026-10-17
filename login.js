/* Studyverse login: lamp animation + Firebase Google / Guest auth */
const FB = {apiKey:"AIzaSyA2yHdXCpNJeSpy6-NEjVlQDLz1W4zI5Qo",authDomain:"focus-lab-cf401.firebaseapp.com",projectId:"focus-lab-cf401",storageBucket:"focus-lab-cf401.firebasestorage.app",messagingSenderId:"1073970407517",appId:"1:1073970407517:web:b65a08e7cba21b760185b4"};
const HOME = 'index.html';

/* ---------- lamp ---------- */
const room = document.getElementById('room'), handle = document.getElementById('stringHandle'),
      path = document.getElementById('stringPath'), fireflies = document.getElementById('fireflies');
let isOn = false, dragging = false, startX = 0, startY = 0, dragX = 0, dragY = 0, moved = false;

function setLamp(on) { isOn = on; room.classList.toggle('on', on); if (on) createFireflies(); else fireflies.innerHTML = ''; }
function updateString(x, y) { path.setAttribute('d', `M 0 0 L ${x} ${80 + y}`); }
function resetHandle() { handle.style.transform = 'translate(0px, 0px)'; updateString(0, 0); }
function pointerDown(e) { dragging = true; moved = false; handle.classList.add('dragging'); startX = e.clientX; startY = e.clientY; dragX = dragY = 0; handle.setPointerCapture?.(e.pointerId); }
function pointerMove(e) {
  if (!dragging) return;
  dragX = Math.max(-35, Math.min(35, (e.clientX - startX) * 0.3));
  dragY = Math.min(180, Math.max(0, e.clientY - startY) * 0.6);
  if (dragY > 4) moved = true;
  handle.style.transform = `translate(${dragX}px, ${dragY}px)`; updateString(dragX, dragY);
}
function pointerUp() {
  if (!dragging) return; dragging = false; handle.classList.remove('dragging');
  const pulled = dragY > 30 || !moved; /* a plain tap works too (easier on phones) */
  resetHandle(); if (pulled) setLamp(!isOn);
}
handle.addEventListener('pointerdown', pointerDown);
handle.addEventListener('pointermove', pointerMove);
handle.addEventListener('pointerup', pointerUp);
handle.addEventListener('pointercancel', pointerUp);
document.getElementById('lampHead').addEventListener('click', () => setLamp(!isOn));

const rnd = (a, b) => Math.random() * (b - a) + a;
function createFireflies() {
  fireflies.innerHTML = '';
  for (let i = 0; i < 18; i++) {
    const d = document.createElement('span'); d.className = 'firefly';
    const s = rnd(3, 7); d.style.width = d.style.height = s + 'px';
    d.style.setProperty('--duration', rnd(35, 65) + 's'); d.style.setProperty('--delay', rnd(0, 3) + 's');
    for (let n = 1; n <= 5; n++) { d.style.setProperty('--x' + n, rnd(0, 100) + 'vw'); d.style.setProperty('--y' + n, rnd(0, 100) + 'vh'); }
    fireflies.appendChild(d);
  }
}
setLamp(false);

/* ---------- auth ---------- */
const $ = id => document.getElementById(id), err = m => { $('err').textContent = m || ''; };
const busy = b => { $('btnGoogle').disabled = b; $('btnGuest').disabled = b; };
let auth = null;
const go = () => location.replace(HOME);

function msgFor(e) {
  const c = e && e.code || '';
  if (c === 'auth/popup-closed-by-user' || c === 'auth/cancelled-popup-request') return '';
  if (c === 'auth/unauthorized-domain') return 'This website address is not authorised in Firebase. Add it under Authentication > Settings > Authorized domains.';
  if (c === 'auth/operation-not-allowed') return 'Google sign-in is not turned on in the Firebase console yet.';
  if (c === 'auth/network-request-failed') return 'No internet connection. Try again when you are online.';
  return 'Sign-in failed (' + (c || 'unknown error') + '). Please try again.';
}

try {
  firebase.initializeApp(FB); auth = firebase.auth();
} catch (e) { err('Could not load Firebase. Check your internet connection.'); }

if (auth) {
  /* came back from a redirect sign-in */
  auth.getRedirectResult().then(r => { if (r && r.user) { localStorage.removeItem('svguest'); go(); } }).catch(e => err(msgFor(e)));
  /* already signed in with Google, or already chose guest earlier: skip this page */
  auth.onAuthStateChanged(u => {
    if (u && !u.isAnonymous) { localStorage.removeItem('svguest'); go(); }
    else if (u && localStorage.getItem('svguest') === '1' && !/[?&]upgrade=1/.test(location.search)) go();
  });
}

async function googleLogin() {
  if (!auth) return err('Firebase is not available right now.');
  err(''); busy(true);
  const provider = new firebase.auth.GoogleAuthProvider(); provider.setCustomParameters({ prompt: 'select_account' });
  try {
    const cur = auth.currentUser;
    if (cur && cur.isAnonymous) {
      /* upgrade guest -> Google, keeping the same uid (group study identity stays) */
      try { await cur.linkWithPopup(provider); }
      catch (e) {
        if (e.code === 'auth/credential-already-in-use' && e.credential) await auth.signInWithCredential(e.credential); /* account already exists (other device) */
        else throw e;
      }
    } else await auth.signInWithPopup(provider);
    localStorage.removeItem('svguest'); go();
  } catch (e) {
    if (e.code === 'auth/popup-blocked' || e.code === 'auth/operation-not-supported-in-this-environment') {
      try { await auth.signInWithRedirect(provider); return; } catch (e2) { e = e2; }
    }
    busy(false); err(msgFor(e));
  }
}

async function guestLogin() {
  if (!auth) { localStorage.setItem('svguest', '1'); return go(); }
  err(''); busy(true);
  localStorage.setItem('svguest', '1');
  try { if (!auth.currentUser) await auth.signInAnonymously(); } catch (e) { /* guest still works locally */ }
  go();
}

$('btnGoogle').addEventListener('click', googleLogin);
$('btnGuest').addEventListener('click', guestLogin);
