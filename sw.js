// Service worker for the home-screen app and offline labs. The app shell and every lab page are precached; other
// same-origin files (the data JSON the viewer fetches, per language) are cached as they are used, network-first, so
// a fresh deploy always wins online and the last copy is served offline (data/layout.json, the map's positions, too).
// Fonts are cache-first. Paths are relative to the worker: the site lives under a subpath (…/skill-graph/). Nothing in data/ is precached.
const CACHE = 'sg-v2'; // bump only when the precache list changes; correctness does not depend on it
const SHELL = ['./', 'index.html', 'graph2d.js', 'tour.js', 'manifest.webmanifest', 'favicon.svg', 'favicon-32.png', 'apple-touch-icon.png',
  'icon-192.png', 'icon-512.png', 'labs/', 'curricula/', 'labs/lab.js', 'labs/lab.css', 'labs/switcher.js', 'labs/viewer.js',
  'labs/registry.json', 'labs/catalog.json', 'labs/fraction-ops/check.js'];
const CDN = ['fonts.googleapis.com', 'fonts.gstatic.com']; // cache-first
const rel = (p) => new URL(p, self.registration.scope).href;

self.addEventListener('install', (ev) => {
  self.skipWaiting();
  ev.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(SHELL.map(rel));
    try {
      const reg = await (await fetch(rel('labs/registry.json'))).json();
      await Promise.all(reg.labs.map((l) => cache.add(rel(l.path)).catch(() => {}))); // one missing lab never breaks the install
    } catch { /* the labs get cached as they are opened */ }
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request, url = new URL(req.url);
  if (req.method !== 'GET' || req.headers.has('range') || !/^https?:$/.test(url.protocol)) return;
  if (url.origin === self.location.origin) {
    ev.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok && res.type === 'basic') { const c = res.clone(); caches.open(CACHE).then((cache) => cache.put(req, c)); }
        return res;
      } catch (err) {
        // pages are opened with ?lang=…&topic=…, so a navigation falls back to the copy without its query
        const hit = await caches.match(req, req.mode === 'navigate' ? { ignoreSearch: true } : undefined);
        if (hit) return hit;
        throw err;
      }
    })());
  } else if (CDN.includes(url.hostname)) {
    ev.respondWith((async () => {
      const hit = await caches.match(req);
      if (hit) return hit;
      const res = await fetch(req);
      if (res.ok || res.type === 'opaque') { const c = res.clone(); caches.open(CACHE).then((cache) => cache.put(req, c)); }
      return res;
    })());
  }
});
