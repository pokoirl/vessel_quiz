// offline: keep the app's files on the phone; when online, refresh them in the background
const C = "vesselquiz-v3", FILES = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(C).then(c => c.addAll(FILES.map(f => new Request(f, {cache: "reload"})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const nav = e.request.mode === "navigate";
  e.respondWith((async () => {
    const c = await caches.open(C);
    // any page opening of the app (whatever exact address the icon uses) gets the saved app
    const hit = (await c.match(e.request, {ignoreSearch: true})) || (nav ? await c.match("./index.html") : undefined);
    const net = fetch(e.request).then(r => {
      if (r.ok && !r.redirected && new URL(e.request.url).origin === location.origin) c.put(nav ? "./index.html" : e.request, r.clone());
      return r;
    }).catch(() => hit || Response.error());
    if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
    return net;
  })());
});
