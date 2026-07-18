/**
 * Minha Church — service worker leve (shell offline).
 *
 * Regras de estabilidade:
 * - Nunca cacheia /api/v1/* (auth, dados vivos).
 * - Navegações: network-first → fallback /offline.
 * - Assets hashed /_next/static/: cache-first.
 * - Precache mínimo (ícones + offline + manifest).
 *
 * Bump CACHE_VERSION em cada mudança relevante do SW.
 */
const CACHE_VERSION = "mc-shell-v1";
const SHELL_CACHE = `mc-shell-${CACHE_VERSION}`;
const STATIC_CACHE = `mc-static-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/offline",
  "/manifest.webmanifest",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      await cache.addAll(PRECACHE_URLS);
      // Não chama skipWaiting automaticamente — o cliente decide (evita reload surpresa).
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith("mc-shell-") || key.startsWith("mc-static-"),
          )
          .filter((key) => key !== SHELL_CACHE && key !== STATIC_CACHE)
          .map((key) => caches.delete(key)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isNextStatic(url) {
  return url.pathname.startsWith("/_next/static/");
}

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (!isSameOrigin(url) || isApiRequest(url)) {
    return;
  }

  // Navegação de documento: sempre tenta rede; offline → página estática.
  if (request.mode === "navigate") {
    event.respondWith(networkFirstNavigation(request));
    return;
  }

  if (isNextStatic(url)) {
    event.respondWith(cacheFirstStatic(request));
    return;
  }

  // Ícones / manifest / assets públicos pequenos: stale-while-revalidate leve.
  if (
    url.pathname.startsWith("/icons/") ||
    url.pathname === "/manifest.webmanifest" ||
    url.pathname === "/offline"
  ) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
  }
});

async function networkFirstNavigation(request) {
  try {
    const fresh = await fetch(request);
    return fresh;
  } catch {
    const cached = await caches.match("/offline");
    if (cached) {
      return cached;
    }
    return new Response("Você está offline.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function cacheFirstStatic(request) {
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(STATIC_CACHE);
      void cache.put(request, fresh.clone());
    }
    return fresh;
  } catch {
    return new Response("", { status: 504 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);

  const networkPromise = fetch(request)
    .then((fresh) => {
      if (fresh.ok) {
        void cache.put(request, fresh.clone());
      }
      return fresh;
    })
    .catch(() => cached);

  return cached ?? networkPromise;
}
