// PWA Service Worker for Universal HRMS
const CACHE_NAME = 'hrms-app-shell-v3'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('SW: Pre-cache asset warning:', err)
      })
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    })
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return
  if (!event.request.url.startsWith('http')) return

  try {
    const url = new URL(event.request.url)

    // Bypass Vite development, HMR, and extension requests
    if (
      url.pathname.startsWith('/@') ||
      url.pathname.includes('hot-update') ||
      url.pathname.startsWith('/node_modules/') ||
      url.protocol === 'chrome-extension:' ||
      url.protocol === 'ws:' ||
      url.protocol === 'wss:'
    ) {
      return
    }
  } catch {
    return
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).catch(async () => {
        // If navigation request (page reload or direct route load), return cached index.html
        if (event.request.mode === 'navigate') {
          const indexCache = await caches.match('/index.html')
          if (indexCache) return indexCache
        }

        // Return a graceful fallback response instead of a rejected Promise.
        // This eliminates the browser console "Uncaught (in promise) TypeError: Failed to fetch".
        return new Response('Network unavailable (offline)', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' }),
        })
      })
    })
  )
})
