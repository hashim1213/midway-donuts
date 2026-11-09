import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js';
import { getAuth, signInAnonymously, signInWithPopup, GoogleAuthProvider, OAuthProvider, linkWithPopup, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyC4_RI77BtqTITZv4PqFYDNP8vVj-sy3Lw",
  authDomain: "midway-donuts.firebaseapp.com",
  projectId: "midway-donuts",
  storageBucket: "midway-donuts.firebasestorage.app",
  messagingSenderId: "1034773548568",
  appId: "1:1034773548568:web:0ade7162c3a11ce7923d6d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUser = null;
let authReady = false;
const authCallbacks = [];

export function onReady(fn) {
  if (authReady) fn(currentUser);
  else authCallbacks.push(fn);
}

onAuthStateChanged(auth, user => {
  currentUser = user;
  authReady = true;
  for (const fn of authCallbacks) fn(user);
  authCallbacks.length = 0;
});

export async function ensureAuth() {
  if (currentUser) return currentUser;
  try {
    const cred = await signInAnonymously(auth);
    return cred.user;
  } catch (e) {
    console.warn('Anonymous auth failed:', e.message);
    return null;
  }
}

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    if (currentUser && currentUser.isAnonymous) {
      const result = await linkWithPopup(currentUser, provider);
      return result.user;
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e) {
    if (e.code === 'auth/credential-already-in-use') {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
    console.warn('Google sign-in failed:', e.message);
    return null;
  }
}

export async function signInWithApple() {
  const provider = new OAuthProvider('apple.com');
  provider.addScope('email');
  provider.addScope('name');
  try {
    if (currentUser && currentUser.isAnonymous) {
      const result = await linkWithPopup(currentUser, provider);
      return result.user;
    }
    const result = await signInWithPopup(auth, provider);
    return result.user;
  } catch (e) {
    if (e.code === 'auth/credential-already-in-use') {
      const result = await signInWithPopup(auth, provider);
      return result.user;
    }
    console.warn('Apple sign-in failed:', e.message);
    return null;
  }
}

export function getUser() { return currentUser; }

export function isSignedIn() { return !!currentUser && !currentUser.isAnonymous; }

function userDocRef() {
  if (!currentUser) return null;
  return doc(db, 'saves', currentUser.uid);
}

let saveTimeout = null;

export function cloudSave(data) {
  if (!currentUser) return;
  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveTimeout = null;
    const ref = userDocRef();
    if (!ref) return;
    setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true }).catch(e => {
      console.warn('Cloud save failed:', e.message);
    });
  }, 2000);
}

export async function cloudLoad() {
  if (!currentUser) return null;
  try {
    const ref = userDocRef();
    if (!ref) return null;
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
  } catch (e) {
    console.warn('Cloud load failed:', e.message);
    return null;
  }
}

export function flushSave() {
  if (!currentUser) return Promise.resolve();
  if (saveTimeout) { clearTimeout(saveTimeout); saveTimeout = null; }
  const ref = userDocRef();
  if (!ref) return Promise.resolve();
  return Promise.resolve();
}
