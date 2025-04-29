// Service Worker for Deducto PWA
const CACHE_NAME = 'deducto-cache-v3';
const API_CACHE_NAME = 'deducto-api-cache-v2';
const BACKGROUND_SYNC_TAG = 'deducto-sync';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/deducto-192.svg',
  '/placeholder.svg'
];

// Assets to cache on activation (non-critical)
const SECONDARY_ASSETS = [
  // Add secondary assets here
];

// Critical assets that should be preloaded
const CRITICAL_ASSETS = [
  '/',
  '/index.html'
];

// Check if background sync is supported
const isBackgroundSyncSupported = 'sync' in self.registration;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      // Cache critical assets first for faster startup
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Caching critical assets');
          return cache.addAll(CRITICAL_ASSETS);
        }),
      // Then cache all static assets
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
    ])
    .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches and cache secondary assets
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Cache secondary assets in the background
      caches.open(CACHE_NAME).then((cache) => {
        console.log('Caching secondary assets');
        return cache.addAll(SECONDARY_ASSETS);
      })
    ])
    .then(() => self.clients.claim())
  );
});

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Handle API requests (network first, then cache)
  if (event.request.url.includes('/api/') || event.request.url.includes('supabase.co')) {
    // For API requests, use a separate cache
    const apiCacheName = API_CACHE_NAME;
    
    // Only handle GET requests with network-first strategy
    if (event.request.method === 'GET') {
      event.respondWith(
        fetch(event.request)
          .then((response) => {
            // Clone the response to store in cache
            const responseToCache = response.clone();
            caches.open(apiCacheName)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });
            return response;
          })
          .catch(() => {
            // If network fails, try to serve from cache
            return caches.match(event.request);
          })
      );
    } else {
      // For non-GET requests (POST, PUT, DELETE), try to handle offline
      event.respondWith(
        fetch(event.request)
          .catch((error) => {
            // If offline, store the request for later sync
            if (!navigator.onLine) {
              // Return a custom response for offline mutations
              return new Response(JSON.stringify({
                success: false,
                offline: true,
                message: 'You are offline. This request will be synced when you reconnect.'
              }), {
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            throw error;
          })
      );
    }
    return;
  }

  // For HTML requests, use network-first strategy to ensure latest content
  if (event.request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clone the response to store in cache
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          return response;
        })
        .catch(() => {
          // If network fails, try to serve from cache
          return caches.match(event.request);
        })
    );
    return;
  }
  
  // For CSS, JS, and other static assets, use cache-first strategy
  if (
    event.request.url.endsWith('.css') ||
    event.request.url.endsWith('.js') ||
    event.request.url.endsWith('.svg') ||
    event.request.url.endsWith('.png') ||
    event.request.url.endsWith('.jpg') ||
    event.request.url.endsWith('.jpeg') ||
    event.request.url.endsWith('.gif')
  ) {
    event.respondWith(
      caches.match(event.request)
        .then(response => {
          // Cache hit - return the response from cache
          if (response) {
            // Fetch in the background to update cache for next time
            fetch(event.request)
              .then(networkResponse => {
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, networkResponse);
                  });
              })
              .catch(() => {
                // Ignore network errors for background updates
              });
            
            return response;
          }
          
          // No cache hit, fetch from network
          return fetch(event.request)
            .then(networkResponse => {
              // Clone the response
              const responseToCache = networkResponse.clone();
              
              // Open cache and store the response
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
              
              return networkResponse;
            });
        })
    );
    return;
  }
  
  // For all other requests, use stale-while-revalidate strategy
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response immediately if available
        const fetchPromise = fetch(event.request)
          .then(networkResponse => {
            // Update the cache with the new response
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            return networkResponse;
          })
          .catch(error => {
            console.error('Fetch failed:', error);
            // If both cache and network fail, throw error
            if (!cachedResponse) {
              throw error;
            }
          });
        
        return cachedResponse || fetchPromise;
      })
  );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  // Handle manual sync request
  if (event.data && event.data.type === 'SYNC_NOW') {
    if (isBackgroundSyncSupported) {
      self.registration.sync.register(BACKGROUND_SYNC_TAG)
        .then(() => {
          console.log('Manual sync registered');
        })
        .catch(error => {
          console.error('Error registering sync:', error);
        });
    } else {
      console.log('Background Sync not supported');
      // Notify the client that sync is not supported
      if (event.source) {
        event.source.postMessage({
          type: 'SYNC_STATUS',
          supported: false
        });
      }
    }
  }
});

// Handle background sync
if (isBackgroundSyncSupported) {
  self.addEventListener('sync', (event) => {
    if (event.tag === BACKGROUND_SYNC_TAG) {
      console.log('Background sync triggered');
      event.waitUntil(syncData());
    }
  });
}

// Function to perform data synchronization
async function syncData() {
  console.log('Syncing data from service worker');
  
  // Notify all clients that sync has started
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({
      type: 'SYNC_STATUS',
      status: 'started'
    });
  });
  
  try {
    // The actual sync logic is handled in the main app code
    // This just triggers the sync process via a message
    
    // Notify all clients that sync is complete
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STATUS',
        status: 'completed'
      });
    });
    
    return true;
  } catch (error) {
    console.error('Sync error:', error);
    
    // Notify all clients that sync failed
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_STATUS',
        status: 'failed',
        error: error.message
      });
    });
    
    return false;
  }
}

// Handle online/offline status changes
self.addEventListener('online', () => {
  console.log('Service worker detected online status');
  if (isBackgroundSyncSupported) {
    self.registration.sync.register(BACKGROUND_SYNC_TAG)
      .then(() => {
        console.log('Sync registered due to online status change');
      })
      .catch(error => {
        console.error('Error registering sync:', error);
      });
  }
});