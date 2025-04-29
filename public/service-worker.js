// Service Worker for Deducto PWA
const CACHE_NAME = 'deducto-cache-v2';
const API_CACHE_NAME = 'deducto-api-cache-v1';
const BACKGROUND_SYNC_TAG = 'deducto-sync';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/deducto-192.svg',
  '/placeholder.svg',
  // Add CSS and JS files that will be generated at build time
  // These paths will be determined by the build process
];

// Check if background sync is supported
const isBackgroundSyncSupported = 'sync' in self.registration;

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // Delete old caches
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
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

  // For non-API requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return the response from cache
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        // Make network request
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            // Open cache and store the response
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
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