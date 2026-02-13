// Espacio Desafíos - Service Worker
const CACHE_NAME = 'espacio-desafios-v1';
const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';

const urlsToCache = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline'
];

const staticAssets = [
  '/styles/main.css',
  '/scripts/app.js'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll([...urlsToCache, ...staticAssets]).catch((error) => {
          console.warn('[Service Worker] Some assets failed to cache:', error);
        });
      }),
      caches.open(DYNAMIC_CACHE)
    ])
  );
  
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - cache-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const { url, method } = request;
  
  // Skip non-GET requests and API calls
  if (method !== 'GET' || url.includes('/api/')) {
    return;
  }
  
  // Skip external requests
  if (!url.startsWith(self.location.origin)) {
    return;
  }
  
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      
      return fetch(request)
        .then((networkResponse) => {
          // Don't cache non-successful responses
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          
          const responseToCache = networkResponse.clone();
          
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseToCache);
          });
          
          return networkResponse;
        })
        .catch((error) => {
          console.error('[Service Worker] Fetch failed:', error);
          
          // Return offline page for navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          
          return new Response('Network error', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: { 'Content-Type': 'text/plain' }
          });
        });
    })
  );
});

// Push event - show notification
self.addEventListener('push', (event) => {
  console.log('[Service Worker] Push received:', event);
  
  let data = {};
  
  try {
    data = event.data.json();
  } catch (error) {
    console.warn('[Service Worker] Push data not JSON:', error);
    data = {
      title: 'Espacio Desafíos',
      body: event.data.text() || 'Tienes una nueva notificación',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      tag: 'notification'
    };
  }
  
  const title = data.title || 'Espacio Desafíos';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icons/icon-192x192.png',
    badge: data.badge || '/icons/icon-192x192.png',
    tag: data.tag || 'notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [
      {
        action: 'open',
        title: 'Abrir'
      },
      {
        action: 'dismiss',
        title: 'Descartar'
      }
    ],
    data: data.data || {}
  };
  
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[Service Worker] Notification click:', event);
  
  event.notification.close();
  
  const notificationData = event.notification.data;
  const action = event.action;
  
  if (action === 'dismiss') {
    return;
  }
  
  let urlToOpen = '/';
  
  if (notificationData && notificationData.url) {
    urlToOpen = notificationData.url;
  }
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if there's already a window open
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      // Open new window if none exists
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Sync event for background sync
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Sync event:', event);
  
  if (event.tag === 'sync-sessions') {
    event.waitUntil(syncPendingSessions());
  }
});

// Background fetch
async function syncPendingSessions() {
  try {
    const db = await openDB('espacio-desafios', 1);
    const tx = db.transaction('pendingSessions', 'readonly');
    const store = tx.objectStore('pendingSessions');
    const sessions = await store.getAll();
    
    for (const session of sessions) {
      try {
        const response = await fetch('/api/sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        
        if (response.ok) {
          const deleteTx = db.transaction('pendingSessions', 'readwrite');
          const deleteStore = deleteTx.objectStore('pendingSessions');
          await deleteStore.delete(session.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync session:', error);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Sync failed:', error);
  }
}

// Message event from client
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
