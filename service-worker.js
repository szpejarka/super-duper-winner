const CACHE_NAME = 'super-duper-winner-v1';
const URLS = ['/', '/index.html', '/manifest.json'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(URLS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(names =>
      Promise.all(names.map(name => name !== CACHE_NAME && caches.delete(name)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      if (response) return response;
      return fetch(event.request).then(response => {
        if (response.status === 200) {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
        }
        return response;
      }).catch(() => new Response('Offline', { status: 503 }));
    })
  );
});