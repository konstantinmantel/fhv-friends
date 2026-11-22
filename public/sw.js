const CACHE = 'fhv-friends-v10';
const ASSETS = ['./icons/01_spirale.png','./icons/02_glocke.png','./icons/03_austausch_pfeile.png','./icons/04_plus_quadrat.png','./icons/05_kalender.png','./icons/06_profil.png','./','./index.html','./src/app.js','./src/core.js','./src/api.js','./src/data.js','./src/demo.js','./src/merge.js','./src/sync.js','./src/franzi.js','./src/icons.js','./src/dom.js','./src/gestures.js','./src/icon-sprite.js','./src/styles.css','./config.js','./ui-icons.svg','./icon.svg','./icon-192.png','./icon-512.png','./manifest.webmanifest'];
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))); self.clients.claim(); });
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (url.pathname.includes('/auth/') || url.pathname.includes('/rest/')) return;
  if(/\/(?:icons\/[^/]+\.png|ui-icons\.svg|icon(?:-192|-512)?\.(?:png|svg))$/.test(url.pathname)){
    event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy));}return response;})));return;
  }
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) { const copy = response.clone(); caches.open(CACHE).then(c => c.put(event.request, copy)); }
    return response;
  }).catch(() => caches.match(event.request).then(cached => cached || (event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))));
});
