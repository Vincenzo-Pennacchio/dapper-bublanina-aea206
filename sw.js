const CACHE = "luna-letters-v10";
const ASSETS = ["./", "./index.html"];

self.addEventListener("install", e =>
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()))
);
self.addEventListener("activate", e =>
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  )
);
self.addEventListener("fetch", e => {
  // Only GET requests can be cached; let POST etc. (e.g. the chat API) hit the network directly.
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(res => {
      const clone = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, clone));
      return res;
    }))
  );
});
self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil(clients.matchAll({type:"window"}).then(cs => {
    if(cs.length) return cs[0].focus();
    return clients.openWindow("./");
  }));
});
