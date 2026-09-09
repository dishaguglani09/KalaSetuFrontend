/**
 * KalaSetu Service Worker
 * Strategy:
 *   - Static assets (JS, CSS, fonts, icons): cache-first with background update
 *   - API calls (/api/): network-first, no caching (let the offline-db handle data)
 *   - Images (/uploads/, unsplash): stale-while-revalidate
 */

const CACHE_NAME = "kalasetu-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
];

// Install: pre-cache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and chrome-extension requests
  if (event.request.method !== "GET") return;
  if (url.protocol === "chrome-extension:") return;

  // API calls: network-first, no cache storage
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(fetch(event.request).catch(() => new Response(JSON.stringify({ error: "offline" }), { status: 503, headers: { "Content-Type": "application/json" } })));
    return;
  }

  // Uploaded images: stale-while-revalidate
  if (url.pathname.startsWith("/uploads/") || url.hostname.includes("unsplash")) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(event.request);
        const networkFetch = fetch(event.request).then((resp) => {
          if (resp.ok) cache.put(event.request, resp.clone());
          return resp;
        }).catch(() => cached);
        return cached || networkFetch;
      })
    );
    return;
  }

  // Everything else (JS bundles, CSS, fonts): cache-first, then update
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      if (cached) {
        // Background update
        fetch(event.request).then((resp) => {
          if (resp.ok) cache.put(event.request, resp.clone());
        }).catch(() => {});
        return cached;
      }
      const networkResp = await fetch(event.request);
      if (networkResp.ok) cache.put(event.request, networkResp.clone());
      return networkResp;
    })
  );
});
