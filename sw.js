/* ItaMall PWA service worker — 网络优先、缓存兜底。
   在线永远拿最新（不会重现缓存坑），离线时用最后一次缓存的壳。 */
const CACHE = 'itamall-v1';

self.addEventListener('install', e => self.skipWaiting());

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok && e.request.url.startsWith(self.location.origin)) {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
      }
      return res;
    }).catch(() =>
      caches.match(e.request).then(m => m || (e.request.mode === 'navigate' ? caches.match('./shop.html') : Response.error()))
    )
  );
});
