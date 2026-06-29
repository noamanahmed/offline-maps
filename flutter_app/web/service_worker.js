const CACHE = 'offline-maps-v1';
const ASSETS = self.__WB_MANIFEST || [];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll([
      '/',
      '/index.html',
      '/map.html',
      '/leaflet/leaflet.css',
      '/leaflet/leaflet.js',
      '/leaflet/tiny-osmpbf.js',
      '/manifest.json',
    ]))
  );
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached =>
      cached || fetch(e.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return response;
      })
    )
  );
});
