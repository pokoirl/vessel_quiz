// offline: keep the app's files on the phone; when online, refresh them in the background
const C = "vesselquiz-v2", FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(FILES))); self.skipWaiting() });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k))))); self.clients.claim() });
self.addEventListener("fetch", e => {
  e.respondWith(caches.match(e.request, {ignoreSearch: true}).then(hit => {
    const net = fetch(e.request).then(r => { if (r.ok) caches.open(C).then(c => c.put(e.request, r.clone())); return r }).catch(() => hit);
    return hit || net;
  }));
});
