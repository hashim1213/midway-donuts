const CACHE = 'midway-v2';
const SHELL = [
  '/',
  '/index.html',
  '/manifest.json',
  '/js/main.js',
  '/js/config.js',
  '/js/helpers.js',
  '/js/state.js',
  '/js/sprites.js',
  '/js/game.js',
  '/js/draw.js',
  '/js/ui.js',
  '/js/firebase.js',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/player-sprite.png',
  '/chef-sprite.png',
  '/employee-manager-sprites.png',
  '/Girl-boy-sprite.png',
  '/girl-boy-2-sprite.png',
  '/Grandma-grandpa-sprite.png',
  '/villagers-2-sprite.png',
  '/villagers-3-sprite.png',
  '/sitting-sprite.png',
  '/sitting-2-sprite.png',
  '/sitting-3-sprite.png',
  '/sitting-4-sprite.png',
  '/sitting-sprite-4.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.hostname.includes('firebaseio') || url.hostname.includes('googleapis') || url.hostname.includes('firestore')) return;
  if (url.origin !== location.origin) {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res.ok) { const clone = res.clone(); caches.open(CACHE).then(c => c.put(e.request, clone)); }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
