const CACHE_NAME = 'experimento-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll([
      '/',
      '/offline.html',
      '/favicon.ico',
    ])).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k))))
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return

  // Navigation requests → network first, fallback offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req).catch(() => caches.match('/offline.html'))
    )
    return
  }

  // Skip Next.js assets to avoid chunk cache issues during updates
  const url = new URL(req.url)
  if (url.pathname.startsWith('/_next/')) {
    event.respondWith(fetch(req))
    return
  }

  // Static assets → cache first, then network
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetchPromise = fetch(req).then((res) => {
        const copy = res.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy))
        return res
      }).catch(() => cached)
      return cached || fetchPromise
    })
  )
})
