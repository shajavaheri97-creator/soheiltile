/* Minimal service worker: offline-friendly catalog without caching the admin panel. */
const V = "v1";
const STATIC = `static-${V}`, PAGES = `pages-${V}`, IMAGES = `images-${V}`;
const MAX_IMAGES = 150;

self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(caches.open(PAGES).then((c) => c.addAll(["/fa", "/en"])).catch(() => {}));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((ks) => Promise.all(ks.filter((k) => ![STATIC, PAGES, IMAGES].includes(k)).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(cache, max) {
  const keys = await cache.keys();
  if (keys.length > max) await Promise.all(keys.slice(0, keys.length - max).map((k) => cache.delete(k)));
}
async function cacheFirst(req, name, max) {
  const cache = await caches.open(name);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) { cache.put(req, res.clone()); if (max) trim(cache, max); }
  return res;
}

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin || url.pathname.startsWith("/admin")) return;

  if (url.pathname.startsWith("/_next/static/") || url.pathname.startsWith("/icons/")) {
    e.respondWith(cacheFirst(req, STATIC));
  } else if (url.pathname.startsWith("/uploads/")) {
    e.respondWith(cacheFirst(req, IMAGES, MAX_IMAGES));
  } else if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((res) => { if (res.ok) { const copy = res.clone(); caches.open(PAGES).then((c) => c.put(req, copy)); } return res; })
        .catch(async () => (await caches.match(req)) || (await caches.match("/fa")) || new Response("Offline", { status: 503 })),
    );
  }
});
