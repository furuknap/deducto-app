// Minimal service worker for PWA

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Add caching logic here later
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  // Clean up old caches here later
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker fetching:', event.request.url);
  // Add fetch handling logic here later
  event.respondWith(fetch(event.request));
});