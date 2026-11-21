// ABM SukiCard service worker: lets the website open with no internet.
// The page and its icons are saved on the phone the first time it is opened online.
// The member's card data is saved separately by the page (localStorage), so the card shows offline too.
const CACHE = "sukicard-v2";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icons/apple-touch-icon.png"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => Promise.all(SHELL.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);
  // Only our own pages and files. Server calls (/api/...) always go to the network, never cached.
  if (req.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (req.mode === "navigate") {
    // Page: use the network when it answers within 4 seconds, otherwise the saved copy.
    const net = fetch(req).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put("index.html", copy));
      }
      return res;
    });
    const slow = new Promise((_, no) => setTimeout(no, 4000));
    e.respondWith(
      Promise.race([net, slow]).catch(() =>
        caches.match("index.html").then((hit) => hit || caches.match("./")).then((hit) => hit || net)
      )
    );
    return;
  }

  // Icons, manifest and other files: show the saved copy at once, refresh it in the background.
  e.respondWith(
    caches.match(req).then((hit) => {
      const fresh = fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || fresh;
    })
  );
});
