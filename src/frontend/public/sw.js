const CACHE_NAME = 'shanju-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/assets/generated/shanju-logo.dim_192x192.png',
  '/assets/generated/shanju-logo.dim_512x512.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests (SPA routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // If network fetch succeeds, cache and return it
          if (response && response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
            return response;
          }
          return response;
        })
        .catch(() => {
          // If network fails, serve cached app shell for same-origin navigation
          if (url.origin === location.origin) {
            return caches.match('/index.html').then((cachedResponse) => {
              return cachedResponse || caches.match('/');
            });
          }
          // For cross-origin navigation failures, let browser handle it
          return new Response('Network error', { status: 408 });
        })
    );
    return;
  }

  // Handle all other requests (assets, API calls, etc.)
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache);
        });
        return response;
      });
    })
  );
});
