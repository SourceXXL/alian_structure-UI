const CACHE_VERSION = 'v1.2.0';
const STATIC_CACHE = `stellaiverse-static-${CACHE_VERSION}`;
const API_CACHE = `stellaiverse-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `stellaiverse-images-${CACHE_VERSION}`;
const FONT_CACHE = `stellaiverse-fonts-${CACHE_VERSION}`;
const RUNTIME_CACHE = `stellaiverse-runtime-${CACHE_VERSION}`;

// Critical assets to cache immediately on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/_next/static/css/app/globals.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
];

// Assets to pre-cache for better performance
const PRECACHE_ASSETS = [
  // Add common JS bundles and static resources
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/framework.js',
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
];

// Cache configuration
const CACHE_CONFIG = {
  static: {
    maxEntries: 200,
    maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    strategy: 'staleWhileRevalidate'
  },
  api: {
    maxEntries: 100,
    maxAgeSeconds: 24 * 60 * 60, // 24 hours
    strategy: 'networkFirst'
  },
  images: {
    maxEntries: 500,
    maxAgeSeconds: 90 * 24 * 60 * 60, // 90 days
    strategy: 'cacheFirst'
  },
  fonts: {
    maxEntries: 50,
    maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
    strategy: 'cacheFirst'
  },
  runtime: {
    maxEntries: 100,
    maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
    strategy: 'staleWhileRevalidate'
  }
};

// Install event - cache static assets and precache critical resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('[SW] Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        })
        .catch(error => {
          console.error('[SW] Failed to cache static assets:', error);
          // Continue with installation even if static assets fail
        }),
      
      // Pre-cache additional assets
      caches.open(RUNTIME_CACHE)
        .then((cache) => {
          console.log('[SW] Pre-caching runtime assets');
          return cache.addAll(PRECACHE_ASSETS.map(asset => 
            new Request(asset, { cache: 'no-store' })
          ));
        })
        .catch(error => {
          console.warn('[SW] Failed to pre-cache runtime assets:', error);
          // Continue with installation
        })
    ])
    .then(() => {
      console.log('[SW] Installation completed successfully');
      return self.skipWaiting();
    })
    .catch(error => {
      console.error('[SW] Installation failed:', error);
    })
  );
});

// Activate event - clean up old caches and claim clients
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys()
        .then((cacheNames) => {
          const oldCaches = cacheNames.filter((cacheName) => {
            return cacheName.startsWith('stellaiverse-') && 
                   !cacheName.includes(CACHE_VERSION);
          });
          
          console.log(`[SW] Found ${oldCaches.length} old caches to clean up`);
          
          return Promise.all(
            oldCaches.map((cacheName) => {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            })
          );
        }),
      
      // Claim all clients to take control immediately
      self.clients.claim()
    ])
    .then(() => {
      console.log('[SW] Service worker activated and claimed clients');
      
      // Notify all clients about the update
      return self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({ type: 'SW_UPDATED' });
        });
      });
    })
    .catch(error => {
      console.error('[SW] Activation failed:', error);
    })
  );
});

// Fetch event - implement aggressive caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests except for navigation requests
  if (request.method !== 'GET' && request.mode !== 'navigate') {
    return;
  }

  // Handle navigation requests differently
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }

  // Skip external requests except for specific domains
  if (!url.origin.includes(self.location.origin) && 
      !url.hostname.includes('fonts.googleapis.com') && 
      !url.hostname.includes('fonts.gstatic.com') &&
      !url.hostname.includes('localhost')) {
    return;
  }

  event.respondWith(handleRequest(request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  try {
    // API calls - Network First with cache fallback
    if (url.pathname.includes('/api/')) {
      return await handleNetworkFirst(request, API_CACHE, CACHE_CONFIG.api.maxAgeSeconds);
    }
    
    // Static assets (JS, CSS, HTML) - Stale While Revalidate
    if (/\.(js|css|html|json)$/.test(url.pathname)) {
      return await handleStaleWhileRevalidate(request, STATIC_CACHE, CACHE_CONFIG.static.maxAgeSeconds);
    }
    
    // Images - Cache First
    if (/\.(png|jpg|jpeg|svg|gif|webp|ico|avif)$/.test(url.pathname)) {
      return await handleCacheFirst(request, IMAGE_CACHE, CACHE_CONFIG.images.maxAgeSeconds);
    }
    
    // Fonts - Cache First
    if (/\.(woff|woff2|ttf|eot)$/.test(url.pathname) || 
        url.hostname.includes('fonts.googleapis.com') || 
        url.hostname.includes('fonts.gstatic.com')) {
      return await handleCacheFirst(request, FONT_CACHE, CACHE_CONFIG.fonts.maxAgeSeconds);
    }
    
    // Next.js specific assets - Stale While Revalidate
    if (url.pathname.includes('/_next/')) {
      return await handleStaleWhileRevalidate(request, RUNTIME_CACHE, CACHE_CONFIG.runtime.maxAgeSeconds);
    }
    
    // Default - Network First with offline fallback
    return await handleNetworkFirst(request, STATIC_CACHE, CACHE_CONFIG.static.maxAgeSeconds);
    
  } catch (error) {
    console.error('[SW] Error handling request:', error);
    return await getOfflineFallback();
  }
}

// Handle navigation requests with offline fallback
async function handleNavigationRequest(request) {
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful navigation responses
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Navigation request failed, trying cache');
    
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page as last resort
    return await getOfflineFallback();
  }
}

// Get offline fallback response
async function getOfflineFallback() {
  const offlineResponse = await caches.match('/offline.html');
  if (offlineResponse) {
    return offlineResponse;
  }
  
  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Offline - stellAIverse</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
                 margin: 0; padding: 20px; background: #0f0f23; color: white; 
                 display: flex; align-items: center; justify-content: center; min-height: 100vh; }
          .container { text-align: center; max-width: 400px; }
          .icon { font-size: 4rem; margin-bottom: 1rem; }
          h1 { margin: 0 0 1rem 0; font-size: 1.5rem; }
          p { margin: 0 0 2rem 0; opacity: 0.8; }
          .btn { background: #1a1a2e; color: white; border: none; padding: 12px 24px; 
                 border-radius: 8px; cursor: pointer; text-decoration: none; display: inline-block; }
          .btn:hover { background: #2a2a3e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="icon">🌌</div>
          <h1>You're Offline</h1>
          <p>Please check your internet connection and try again.</p>
          <button class="btn" onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
    </html>`,
    {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'text/html' }
    }
  );
}

// Network First strategy with enhanced error handling
async function handleNetworkFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  try {
    const networkResponse = await fetch(request, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      }
    });
    
    if (networkResponse.ok) {
      // Cache the successful response with timestamp
      const responseClone = networkResponse.clone();
      const headers = new Headers(responseClone.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(responseClone.body, {
        status: responseClone.status,
        statusText: responseClone.statusText,
        headers: headers,
      });
      
      await cache.put(request, modifiedResponse);
      
      // Clean up cache if it exceeds max entries
      await cleanupCache(cacheName, CACHE_CONFIG[getCacheType(cacheName)]?.maxEntries || 100);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, checking cache');
    
    // Network failed, return cached version if available and not too old
    if (cachedResponse) {
      const cachedAt = cachedResponse.headers.get('sw-cached-at');
      if (cachedAt) {
        const cacheAge = (Date.now() - parseInt(cachedAt)) / 1000;
        if (cacheAge < maxAgeSeconds) {
          console.log('[SW] Returning cached response');
          return cachedResponse;
        } else {
          console.log('[SW] Cache expired, removing entry');
          await cache.delete(request);
        }
      } else {
        return cachedResponse;
      }
    }
    
    // No valid cache available, return offline fallback
    return await getOfflineFallback();
  }
}

// Stale While Revalidate strategy with enhanced error handling
async function handleStaleWhileRevalidate(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Check if cached response is still valid
  if (cachedResponse) {
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    if (cachedAt) {
      const cacheAge = (Date.now() - parseInt(cachedAt)) / 1000;
      if (cacheAge < maxAgeSeconds) {
        // Always try to update the cache in the background
        const fetchPromise = fetch(request, { cache: 'no-store' })
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const headers = new Headers(networkResponse.headers);
              headers.set('sw-cached-at', Date.now().toString());
              
              const modifiedResponse = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: headers,
              });
              
              cache.put(request, modifiedResponse);
              console.log('[SW] Cache updated in background');
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('[SW] Background fetch failed:', error);
          });
        
        console.log('[SW] Serving from cache');
        return cachedResponse;
      } else {
        // Cache is expired, remove it
        await cache.delete(request);
        console.log('[SW] Expired cache entry removed');
      }
    }
  }
  
  // No valid cache, fetch from network
  try {
    const networkResponse = await fetch(request, { cache: 'no-store' });
    
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers,
      });
      
      await cache.put(request, modifiedResponse);
      
      // Clean up cache if it exceeds max entries
      await cleanupCache(cacheName, CACHE_CONFIG[getCacheType(cacheName)]?.maxEntries || 100);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    return await getOfflineFallback();
  }
}

// Cache First strategy with enhanced validation and error handling
async function handleCacheFirst(request, cacheName, maxAgeSeconds) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Check if cache is still valid using our timestamp
    const cachedAt = cachedResponse.headers.get('sw-cached-at');
    if (cachedAt) {
      const cacheAge = (Date.now() - parseInt(cachedAt)) / 1000;
      
      if (cacheAge < maxAgeSeconds) {
        console.log('[SW] Serving from cache (Cache First)');
        
        // Try to update in background for next time
        fetch(request, { cache: 'no-store' })
          .then((networkResponse) => {
            if (networkResponse.ok) {
              const headers = new Headers(networkResponse.headers);
              headers.set('sw-cached-at', Date.now().toString());
              
              const modifiedResponse = new Response(networkResponse.body, {
                status: networkResponse.status,
                statusText: networkResponse.statusText,
                headers: headers,
              });
              
              cache.put(request, modifiedResponse);
            }
          })
          .catch(() => {
            // Silently fail background update
          });
        
        return cachedResponse;
      } else {
        console.log('[SW] Cache expired, removing entry');
        await cache.delete(request);
      }
    } else {
      // Old cache entry without timestamp, still serve it
      return cachedResponse;
    }
  }
  
  try {
    const networkResponse = await fetch(request, { cache: 'no-store' });
    
    if (networkResponse.ok) {
      const headers = new Headers(networkResponse.headers);
      headers.set('sw-cached-at', Date.now().toString());
      
      const modifiedResponse = new Response(networkResponse.body, {
        status: networkResponse.status,
        statusText: networkResponse.statusText,
        headers: headers,
      });
      
      await cache.put(request, modifiedResponse);
      
      // Clean up cache if it exceeds max entries
      await cleanupCache(cacheName, CACHE_CONFIG[getCacheType(cacheName)]?.maxEntries || 100);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('[SW] Network request failed:', error);
    
    // Network failed, return stale cache if available
    if (cachedResponse) {
      console.log('[SW] Network failed, returning stale cache');
      return cachedResponse;
    }
    
    return await getOfflineFallback();
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  } else if (event.tag === 'cache-warm') {
    event.waitUntil(warmupCache());
  }
});

async function doBackgroundSync() {
  console.log('[SW] Performing background sync');
  
  try {
    // Sync any pending API requests stored in IndexedDB
    const pendingRequests = await getPendingRequests();
    
    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, request.options);
        if (response.ok) {
          await removePendingRequest(request.id);
          console.log('[SW] Synced request:', request.url);
        }
      } catch (error) {
        console.error('[SW] Failed to sync request:', request.url, error);
      }
    }
    
    // Preload critical assets
    await warmupCache();
    
    console.log('[SW] Background sync completed');
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Cache warming for better performance
async function warmupCache() {
  console.log('[SW] Warming up cache');
  
  const criticalAssets = [
    '/',
    '/manifest.json',
    '/_next/static/css/app/globals.css',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
  ];
  
  const cache = await caches.open(STATIC_CACHE);
  
  for (const asset of criticalAssets) {
    try {
      const response = await fetch(asset, { cache: 'no-store' });
      if (response.ok) {
        const headers = new Headers(response.headers);
        headers.set('sw-cached-at', Date.now().toString());
        
        const modifiedResponse = new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: headers,
        });
        
        await cache.put(asset, modifiedResponse);
        console.log('[SW] Warmed cache for:', asset);
      }
    } catch (error) {
      console.warn('[SW] Failed to warm cache for:', asset, error);
    }
  }
}

// Utility functions for cache management
function getCacheType(cacheName) {
  if (cacheName.includes('static')) return 'static';
  if (cacheName.includes('api')) return 'api';
  if (cacheName.includes('images')) return 'images';
  if (cacheName.includes('fonts')) return 'fonts';
  if (cacheName.includes('runtime')) return 'runtime';
  return 'static';
}

async function cleanupCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  
  if (keys.length <= maxEntries) {
    return;
  }
  
  // Get entries with timestamps
  const entries = [];
  for (const request of keys) {
    const response = await cache.match(request);
    if (response) {
      const cachedAt = response.headers.get('sw-cached-at');
      entries.push({
        request,
        timestamp: cachedAt ? parseInt(cachedAt) : 0,
        response
      });
    }
  }
  
  // Sort by timestamp (oldest first)
  entries.sort((a, b) => a.timestamp - b.timestamp);
  
  // Remove oldest entries
  const entriesToRemove = entries.slice(0, entries.length - maxEntries);
  for (const entry of entriesToRemove) {
    await cache.delete(entry.request);
  }
  
  console.log(`[SW] Cleaned up ${entriesToRemove.length} old entries from ${cacheName}`);
}

// IndexedDB utilities for pending requests
async function getPendingRequests() {
  // This would typically use IndexedDB to store pending requests
  // For now, return empty array
  return [];
}

async function removePendingRequest(id) {
  // Remove request from IndexedDB
  console.log('[SW] Removed pending request:', id);
}

// Push notifications with enhanced functionality
self.addEventListener('push', (event) => {
  if (event.data) {
    let notificationData;
    
    try {
      notificationData = event.data.json();
    } catch (e) {
      // Fallback to text if JSON parsing fails
      notificationData = {
        title: 'stellAIverse',
        body: event.data.text(),
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'general',
        requireInteraction: false,
        silent: false
      };
    }
    
    const options = {
      body: notificationData.body || 'New notification from stellAIverse',
      icon: notificationData.icon || '/icons/icon-192x192.png',
      badge: notificationData.badge || '/icons/icon-192x192.png',
      tag: notificationData.tag || 'general',
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: notificationData.primaryKey || 1,
        url: notificationData.url || '/',
        ...notificationData.data
      },
      actions: notificationData.actions || []
    };
    
    event.waitUntil(
      self.registration.showNotification(
        notificationData.title || 'stellAIverse',
        options
      )
    );
  }
});

// Notification click handler with enhanced functionality
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click received:', event.notification);
  
  const notification = event.notification;
  const data = notification.data || {};
  let url = data.url || '/';
  
  notification.close();
  
  // Handle notification actions
  if (event.action) {
    console.log('[SW] Notification action clicked:', event.action);
    
    switch (event.action) {
      case 'view-transaction':
        if (data.transactionHash) {
          url = `/portfolio?transaction=${data.transactionHash}`;
        }
        break;
      case 'view-portfolio':
        url = '/portfolio';
        break;
      case 'retry-transaction':
        // Send message to client to retry transaction
        sendMessageToClient({
          type: 'RETRY_TRANSACTION',
          data: {
            transactionHash: data.transactionHash,
            agentName: data.agentName,
            error: data.error
          }
        });
        return;
      default:
        console.log('[SW] Unknown action:', event.action);
    }
  }
  
  // Focus existing window or open new one
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Focus existing window if available
      for (const client of clientList) {
        if (client.url.includes(url.split('?')[0]) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Helper function to send messages to clients
function sendMessageToClient(message) {
  return clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  }).then(clientList => {
    clientList.forEach(client => {
      client.postMessage(message);
    });
  });
}

// Message handling for client communication
self.addEventListener('message', (event) => {
  if (event.data && event.data.type) {
    switch (event.data.type) {
      case 'SKIP_WAITING':
        self.skipWaiting();
        break;
      
      case 'GET_CACHE_STATS':
        event.ports[0].postMessage(getCacheStats());
        break;
      
      case 'CLEAR_CACHE':
        clearAllCaches().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
      
      case 'PRELOAD_ASSETS':
        warmupCache().then(() => {
          event.ports[0].postMessage({ success: true });
        });
        break;
      
      case 'CHECK_UPDATE':
        checkForUpdates().then(hasUpdate => {
          event.ports[0].postMessage({ hasUpdate });
        });
        break;
      
      default:
        console.log('[SW] Unknown message type:', event.data.type);
    }
  }
});

// Get cache statistics
async function getCacheStats() {
  const stats = {};
  const cacheNames = await caches.keys();
  
  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('stellaiverse-')) {
      const cache = await caches.open(cacheName);
      const keys = await cache.keys();
      
      let totalSize = 0;
      let oldestEntry = Date.now();
      let newestEntry = 0;
      
      for (const request of keys) {
        const response = await cache.match(request);
        if (response) {
          const cachedAt = response.headers.get('sw-cached-at');
          if (cachedAt) {
            const timestamp = parseInt(cachedAt);
            oldestEntry = Math.min(oldestEntry, timestamp);
            newestEntry = Math.max(newestEntry, timestamp);
          }
          
          // Estimate size (rough calculation)
          const responseClone = response.clone();
          const text = await responseClone.text();
          totalSize += text.length;
        }
      }
      
      stats[cacheName] = {
        entries: keys.length,
        estimatedSize: totalSize,
        oldestEntry: oldestEntry === Date.now() ? null : new Date(oldestEntry),
        newestEntry: newestEntry === 0 ? null : new Date(newestEntry),
      };
    }
  }
  
  return stats;
}

// Clear all caches
async function clearAllCaches() {
  const cacheNames = await caches.keys();
  const stellAIverseCaches = cacheNames.filter(name => name.startsWith('stellaiverse-'));
  
  await Promise.all(stellAIverseCaches.map(name => caches.delete(name)));
  console.log('[SW] All caches cleared');
}

// Check for updates
async function checkForUpdates() {
  try {
    const registration = await self.registration.update();
    return !!registration;
  } catch (error) {
    console.error('[SW] Update check failed:', error);
    return false;
  }
}
