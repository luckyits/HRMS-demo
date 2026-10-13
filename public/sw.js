// PWA Service Worker for Universal HRMS
const CACHE_NAME = 'hrms-app-shell-v2'
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE)
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

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse
      }

      return fetch(event.request).catch((err) => {
        // IMPORTANT: Only return index.html fallback for top-level page navigations.
        // Returning HTML for failed JS/CSS asset requests causes "Unexpected token '<'" white screen on mobile.
        if (event.request.mode === 'navigate') {
          return caches.match('/index.html')
        }
        return Promise.reject(err)
      })
    })
  )
})
