const CACHE_NAME = 'medicoes-pwa-v2';
const urlsToCache = [
  '/',
  '/logo.png',
  '/svg-icon-any.svg'
];

self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ Service Worker: Cache opened, adding resources...');
        return cache.addAll(urlsToCache)
          .catch(async (error) => {
            console.error('❌ Service Worker: addAll failed:', error);
            
            // Try caching files individually to identify which one is failing
            const results = [];
            for (const url of urlsToCache) {
              try {
                console.log('🔍 Service Worker: Trying to cache:', url);
                await cache.add(url);
                console.log('✅ Service Worker: Successfully cached:', url);
                results.push({ url, success: true });
              } catch (individualError) {
                console.error('❌ Service Worker: Failed to cache:', url, individualError);
                results.push({ url, success: false, error: individualError });
              }
            }
            
            console.log('📊 Service Worker: Cache results:', results);
            
            // Continue installation even if some resources fail
            const successCount = results.filter(r => r.success).length;
            console.log(`📈 Service Worker: Cached ${successCount}/${urlsToCache.length} resources`);
            
            // Re-throw error only if no resources were cached
            if (successCount === 0) {
              throw error;
            }
          });
      })
      .then(() => {
        console.log('✅ Service Worker: All resources cached');
        return self.skipWaiting(); // Force activation
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed completely:', error);
        throw error;
      })
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle same-origin requests
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(event.request)
            .then((response) => {
              // Don't cache non-successful responses
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }

              // Clone the response for caching
              const responseToCache = response.clone();
              
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });

              return response;
            });
        })
        .catch(() => {
          // Return a fallback for navigation requests when offline
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Service Worker: Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
    .then(() => {
      console.log('✅ Service Worker: Activated and ready');
      return self.clients.claim(); // Take control of all clients
    })
  );
});

// Handle background sync
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  console.log('Background sync triggered');
  // Trigger sync of pending measurements
  const clients = await self.clients.matchAll();
  clients.forEach((client) => {
    client.postMessage({
      type: 'BACKGROUND_SYNC',
      payload: 'sync-pending-data'
    });
  });
}

// Handle push notifications (future feature)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/pwa-192x192.png',
      badge: '/pwa-64x64.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.openWindow('/')
  );
});

// Handle skip waiting
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});