/* global self, caches, fetch, Response */

const CACHE_NAME = "vovinam-static-v2";

const ASSET_PATHS = [
  "/",
  "/favicon.ico",
  "/manifest.webmanifest",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSET_PATHS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => (k === CACHE_NAME ? null : caches.delete(k)))))
      .then(() => self.clients.claim())
  );
});

async function cacheUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return;
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(
    urls.map(async (url) => {
      try {
        const normalized = new URL(url, self.location.origin);
        if (normalized.origin !== self.location.origin) return;

        const req = new Request(normalized.toString(), {
          method: "GET",
          credentials: "same-origin",
          cache: "reload",
          headers: {
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          },
        });

        const res = await fetch(req);
        if (res && res.ok) {
          await cache.put(req, res);
        }
      } catch {
        // Best effort.
      }
    })
  );
}

async function uncacheUrls(urls) {
  if (!Array.isArray(urls) || urls.length === 0) return;
  const cache = await caches.open(CACHE_NAME);

  await Promise.all(
    urls.map(async (url) => {
      try {
        const normalized = new URL(url, self.location.origin);
        if (normalized.origin !== self.location.origin) return;
        await cache.delete(normalized.toString());
      } catch {
        // Best effort.
      }
    })
  );
}

self.addEventListener("message", (event) => {
  const data = event.data || {};
  const type = data.type;
  const payload = data.payload || {};

  if (type === "CACHE_URLS") {
    event.waitUntil(cacheUrls(payload.urls));
  }

  if (type === "UNCACHE_URLS") {
    event.waitUntil(uncacheUrls(payload.urls));
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification?.close();
  const url = event.notification?.data?.url || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientsArr) => {
        for (const client of clientsArr) {
          if (client && typeof client.focus === "function") {
            client.navigate(url).catch(() => {
              // ignore
            });
            return client.focus();
          }
        }

        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }

        return null;
      })
  );
});

function isCacheableAsset(url) {
  const pathname = url.pathname;
  if (pathname.startsWith("/_next/static/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/manifest.webmanifest") return true;
  if (pathname.startsWith("/icons/")) return true;

  return (
    pathname.endsWith(".js") ||
    pathname.endsWith(".css") ||
    pathname.endsWith(".svg") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".jpeg") ||
    pathname.endsWith(".webp") ||
    pathname.endsWith(".ico")
  );
}

function isCacheablePage(url) {
  const pathname = url.pathname;
  if (pathname.startsWith("/admin")) return false;
  if (pathname.startsWith("/api")) return false;
  if (pathname.startsWith("/_next")) return false;
  return true;
}

async function handleNavigate(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const fresh = await fetch(request);
    if (fresh && fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    const cached = await cache.match(request, { ignoreVary: true });
    if (cached) return cached;

    const fallback = await cache.match("/", { ignoreVary: true });
    if (fallback) return fallback;

    return new Response("Offline", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === "navigate") {
    if (!isCacheablePage(url)) return;
    event.respondWith(handleNavigate(req));
    return;
  }

  if (!isCacheableAsset(url)) return;

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(req);
      if (cached) return cached;

      try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok) {
          cache.put(req, fresh.clone());
        }
        return fresh;
      } catch {
        return cached || new Response("", { status: 504 });
      }
    })
  );
});