// Moonmood Service Worker — Offline-first caching (UI-04)
// The __SW_MANIFEST__ placeholder is replaced at build time by generate-sw-manifest.mjs

const BASE_PATH = "/Moonmood";
const CACHE_VERSION = "v1";
const PRECACHE_NAME = `moonmood-precache-${CACHE_VERSION}`;
const RUNTIME_NAME = `moonmood-runtime-${CACHE_VERSION}`;

// Populated by the post-build script; falls back to empty array during dev
const PRECACHE_URLS = self.__SW_MANIFEST__ || [];

// ---------------------------------------------------------------------------
// Install — precache the entire app shell
// ---------------------------------------------------------------------------
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(PRECACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
});

// ---------------------------------------------------------------------------
// Activate — delete old caches, claim all open clients
// ---------------------------------------------------------------------------
self.addEventListener("activate", (event) => {
  const currentCaches = new Set([PRECACHE_NAME, RUNTIME_NAME]);
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(
          names
            .filter((n) => n.startsWith("moonmood-") && !currentCaches.has(n))
            .map((n) => caches.delete(n))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ---------------------------------------------------------------------------
// Fetch — routing with three strategies
// ---------------------------------------------------------------------------

/** Cache-first: return cached response, or fetch → cache → return. */
function cacheFirst(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request).then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(RUNTIME_NAME).then((c) => c.put(request, clone));
      }
      return response;
    });
  });
}

/** Network-first: try network, fall back to cache (for future API calls). */
function networkFirst(request) {
  return fetch(request)
    .then((response) => {
      if (response.ok) {
        const clone = response.clone();
        caches.open(RUNTIME_NAME).then((c) => c.put(request, clone));
      }
      return response;
    })
    .catch(() => caches.match(request));
}

/** Navigation: cache-first with offline fallback to root page. */
function handleNavigate(request) {
  return caches.match(request).then((cached) => {
    if (cached) return cached;
    return fetch(request)
      .then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(RUNTIME_NAME).then((c) => c.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(BASE_PATH + "/"));
  });
}

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle same-origin GET requests under our base path
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith(BASE_PATH)) return;

  // Future API calls — network-first (ready for Phase 7)
  if (url.pathname.startsWith(BASE_PATH + "/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Navigation requests — cache-first with offline fallback
  if (request.mode === "navigate") {
    event.respondWith(handleNavigate(request));
    return;
  }

  // All other static assets — cache-first
  event.respondWith(cacheFirst(request));
});

// ---------------------------------------------------------------------------
// Message — allow client to trigger skipWaiting for seamless updates
// ---------------------------------------------------------------------------
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
