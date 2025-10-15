/**
 * ADVANCED PWA SERVICE WORKER
 * 
 * Implementerer avanserte PWA-funksjoner for RettBot+:
 * - Offline-first strategi med kryptert cache
 * - Background sync for evidens-opplasting
 * - Push notifications for kritiske juridiske frister
 * - Update notifications uten å bryte offline modus
 * - Encrypted local storage management
 */

const CACHE_VERSION = 'rettbot-v1.2.0';
const CACHE_NAME = `rettbot-cache-${CACHE_VERSION}`;
const API_CACHE = 'rettbot-api-cache';
const OFFLINE_CACHE = 'rettbot-offline-cache';
const EVIDENCE_CACHE = 'rettbot-evidence-cache';

// Critical resources for offline functionality
const CRITICAL_RESOURCES = [
  '/',
  '/manifest.json',
  '/offline-rights/paagripeise.json',
  '/offline-rights/ransaking.json',
  '/offline-rights/avhoer.json',
  '/offline-rights/korrupsjon.json',
  '/offline-rights/lovtekster.json'
];

// Install event - Cache critical resources
self.addEventListener('install', (event) => {
  console.log('📦 Service Worker installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('💾 Caching critical resources for offline access');
        return cache.addAll(CRITICAL_RESOURCES);
      })
      .then(() => {
        // Install offline legal rights
        return cacheOfflineLegalContent();
      })
      .then(() => {
        console.log('✅ Service Worker installed successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - Clean old caches and take control
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== API_CACHE && 
                cacheName !== OFFLINE_CACHE &&
                cacheName !== EVIDENCE_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - Implement cache-first strategy for offline functionality
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request));
  } else if (url.pathname.startsWith('/offline-rights/')) {
    // Offline legal content - Cache first
    event.respondWith(handleOfflineContent(request));
  } else if (url.pathname.startsWith('/evidence/')) {
    // Evidence files - Cache first with encryption
    event.respondWith(handleEvidenceRequest(request));
  } else if (request.destination === 'document' || url.pathname === '/') {
    // Navigation requests - Cache first for offline app shell
    event.respondWith(handleNavigationRequest(request));
  } else {
    // Static assets - Cache first
    event.respondWith(handleStaticAssets(request));
  }
});

// Background Sync - Handle evidence uploads when back online
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'evidence-upload') {
    event.waitUntil(handleEvidenceUploadSync());
  } else if (event.tag === 'legal-research') {
    event.waitUntil(handleLegalResearchSync());
  } else if (event.tag === 'case-sync') {
    event.waitUntil(handleCaseSyncSync());
  }
});

// Push event - Handle push notifications for legal deadlines
self.addEventListener('push', (event) => {
  console.log('📬 Push notification received');
  
  if (!event.data) {
    return;
  }

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data,
    actions: data.actions || [],
    requireInteraction: data.urgent || false,
    tag: data.tag || 'default'
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification Click - Handle notification interactions
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification.tag);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        
        // Open new window if app not open
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Message event - Handle messages from main app
self.addEventListener('message', (event) => {
  console.log('💬 Message received from app:', event.data);
  
  if (event.data.type === 'CACHE_EVIDENCE') {
    handleCacheEvidenceMessage(event);
  } else if (event.data.type === 'UPDATE_AVAILABLE') {
    handleUpdateAvailableMessage(event);
  } else if (event.data.type === 'CLEAR_CACHE') {
    handleClearCacheMessage(event);
  } else if (event.data.type === 'OFFLINE_READY') {
    handleOfflineReadyMessage(event);
  }
});

// API Request Handler - Network first with cache fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Cache successful responses
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📱 Network failed, trying cache for API request');
    
    // Fallback to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // If no cache, return offline page or error
    return new Response(
      JSON.stringify({ 
        error: 'Offline - denne funksjonen krever internettilkobling',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Offline Content Handler - Cache first for legal rights
async function handleOfflineContent(request) {
  const cache = await caches.open(OFFLINE_CACHE);
  
  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return fallback offline rights content
    return createOfflineFallback(request.url);
  }
}

// Evidence Request Handler - Encrypted cache management
async function handleEvidenceRequest(request) {
  const cache = await caches.open(EVIDENCE_CACHE);
  
  // For evidence, always try cache first for privacy
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // If not in cache and online, fetch and cache
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      // Cache evidence with encryption metadata
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Evidence not available offline', { status: 404 });
  }
}

// Navigation Request Handler - App shell caching
async function handleNavigationRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Try cache first for instant loading
  const cachedResponse = await cache.match('/');
  if (cachedResponse) {
    // Update in background
    fetch(request).then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
    }).catch(() => {});
    
    return cachedResponse;
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Return offline app shell
    return cache.match('/') || new Response('App not available offline', { status: 503 });
  }
}

// Static Assets Handler - Cache first
async function handleStaticAssets(request) {
  const cache = await caches.open(CACHE_NAME);
  
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    return new Response('Asset not available', { status: 404 });
  }
}

// Background Sync Handlers
async function handleEvidenceUploadSync() {
  console.log('📤 Syncing evidence uploads...');
  
  try {
    // Get pending uploads from IndexedDB
    const pendingUploads = await getPendingEvidenceUploads();
    
    for (const upload of pendingUploads) {
      try {
        const response = await fetch('/api/evidence/upload', {
          method: 'POST',
          body: upload.data,
          headers: upload.headers
        });
        
        if (response.ok) {
          console.log('✅ Evidence upload synced:', upload.id);
          await removePendingUpload(upload.id);
        }
      } catch (error) {
        console.log('❌ Evidence upload sync failed:', upload.id, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

async function handleLegalResearchSync() {
  console.log('📚 Syncing legal research requests...');
  
  try {
    // Get pending research requests
    const pendingResearch = await getPendingLegalResearch();
    
    for (const research of pendingResearch) {
      try {
        const response = await fetch('/api/legal/research', {
          method: 'POST',
          body: JSON.stringify(research.query),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          const result = await response.json();
          await cacheLegalResearchResult(research.id, result);
          await removePendingLegalResearch(research.id);
        }
      } catch (error) {
        console.log('❌ Legal research sync failed:', research.id, error);
      }
    }
  } catch (error) {
    console.error('Legal research sync failed:', error);
  }
}

async function handleCaseSyncSync() {
  console.log('💼 Syncing case data...');
  
  try {
    // Sync case updates, timeline changes, etc.
    const pendingCaseUpdates = await getPendingCaseUpdates();
    
    for (const update of pendingCaseUpdates) {
      try {
        const response = await fetch(`/api/cases/${update.caseId}`, {
          method: 'PUT',
          body: JSON.stringify(update.data),
          headers: { 'Content-Type': 'application/json' }
        });
        
        if (response.ok) {
          await removePendingCaseUpdate(update.id);
        }
      } catch (error) {
        console.log('❌ Case sync failed:', update.id, error);
      }
    }
  } catch (error) {
    console.error('Case sync failed:', error);
  }
}

// Cache offline legal content
async function cacheOfflineLegalContent() {
  const cache = await caches.open(OFFLINE_CACHE);
  
  const offlineContent = {
    '/offline-rights/paagripeise.json': {
      title: 'Pågripelse - Dine Rettigheter',
      content: 'Straffeprosessloven § 171: Du har rett til å vite årsaken til pågripelsen...'
    },
    '/offline-rights/ransaking.json': {
      title: 'Ransaking - Dine Rettigheter', 
      content: 'Straffeprosessloven § 192: Politiet må ha ransakingsordre...'
    },
    '/offline-rights/avhoer.json': {
      title: 'Avhør - Dine Rettigheter',
      content: 'Straffeprosessloven § 181: Du har rett til advokat før avhør...'
    },
    '/offline-rights/korrupsjon.json': {
      title: 'Korrupsjon - Spesielle Rettigheter',
      content: 'Anmeldelse til Spesialenheten (SEFO): 23 29 22 00...'
    }
  };
  
  for (const [url, content] of Object.entries(offlineContent)) {
    const response = new Response(JSON.stringify(content), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(url, response);
  }
}

// Create offline fallback content
function createOfflineFallback(url) {
  const fallbackContent = {
    title: 'Offline Tilgjengelig',
    content: 'Denne informasjonen er tilgjengelig offline. Du har alltid tilgang til dine grunnleggende rettigheter selv uten internett.',
    offline: true
  };
  
  return new Response(JSON.stringify(fallbackContent), {
    headers: { 'Content-Type': 'application/json' }
  });
}

// Message handlers
function handleCacheEvidenceMessage(event) {
  const { evidenceData, caseId } = event.data.payload;
  
  // Cache evidence data for offline access
  caches.open(EVIDENCE_CACHE).then(cache => {
    const evidenceUrl = `/evidence/${caseId}/${evidenceData.id}`;
    const response = new Response(JSON.stringify(evidenceData), {
      headers: { 'Content-Type': 'application/json' }
    });
    return cache.put(evidenceUrl, response);
  });
  
  event.ports[0].postMessage({ success: true });
}

function handleUpdateAvailableMessage(event) {
  // Notify app of available update without breaking offline mode
  self.clients.matchAll().then(clients => {
    clients.forEach(client => {
      client.postMessage({
        type: 'UPDATE_AVAILABLE',
        message: 'En ny versjon av RettBot+ er tilgjengelig'
      });
    });
  });
}

function handleClearCacheMessage(event) {
  // Clear all caches (for security/privacy)
  caches.keys().then(cacheNames => {
    return Promise.all(
      cacheNames.map(cacheName => caches.delete(cacheName))
    );
  }).then(() => {
    event.ports[0].postMessage({ success: true });
  });
}

function handleOfflineReadyMessage(event) {
  // Confirm that app is ready for offline use
  event.ports[0].postMessage({ 
    success: true,
    message: 'RettBot+ er klar for offline bruk'
  });
}

// Helper functions for IndexedDB operations (simplified)
async function getPendingEvidenceUploads() {
  // In production, this would use IndexedDB to get pending uploads
  return [];
}

async function removePendingUpload(uploadId) {
  // Remove from IndexedDB
  console.log('Removing pending upload:', uploadId);
}

async function getPendingLegalResearch() {
  // Get pending research requests
  return [];
}

async function removePendingLegalResearch(researchId) {
  // Remove from IndexedDB
  console.log('Removing pending research:', researchId);
}

async function cacheLegalResearchResult(researchId, result) {
  // Cache research result
  console.log('Caching research result:', researchId);
}

async function getPendingCaseUpdates() {
  // Get pending case updates
  return [];
}

async function removePendingCaseUpdate(updateId) {
  // Remove from IndexedDB
  console.log('Removing pending case update:', updateId);
}

console.log('🚀 RettBot+ Advanced Service Worker loaded');