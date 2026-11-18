// Keeps a copy of the page on the phone so it opens without internet.
const CACHE = 'clock-v1';
const FILES = ['./', './index.html', './manifest.json'];
const EXTRAS = ['./icon-192.png', './icon-512.png'];   // optional: fine if they are missing

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) =>
    c.addAll(FILES).then(() => Promise.all(EXTRAS.map((f) => c.add(f).catch(() => {}))))
  ));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

// try the internet first (to get updates), use the saved copy when offline
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }))
  );
});
