/// <reference lib="webworker" />

// A simple service worker for caching static assets

const CACHE_NAME = 'pantry-pal-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Note: Add other static assets like JS bundles, CSS, and images here
  // In this dev environment, the main scripts are loaded via importmap,
  // which simplifies offline caching needs for this basic setup.
];

// FIX: Explicitly type `event` as `ExtendableEvent` to access `waitUntil`.
self.addEventListener('install', (event: ExtendableEvent) => {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// FIX: Explicitly type `event` as `FetchEvent` to access `respondWith` and `request`.
self.addEventListener('fetch', (event: FetchEvent) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});