const CACHE = "fjb-app-v3";
const PRECACHE = ["/icon-192.png", "/icon-512.png", "/apple-icon.png", "/images/logo.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api")) return;

  const isAsset = /\.(png|jpg|jpeg|webp|svg|ico|woff2?)$/i.test(url.pathname);
  if (!isAsset) {
    event.respondWith(fetch(request).catch(() => caches.match(request)));
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      const networked = fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(() => cached);
      return cached || networked;
    })
  );
});

self.addEventListener("push", (event) => {
  let data = {
    title: "Fine Jewellery Buyers",
    body: "You have a new booking, enquiry or message.",
    url: "/admin",
    tag: "fjb-admin",
  };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch {
    try {
      if (event.data) data.body = event.data.text();
    } catch {
      /* empty payload */
    }
  }

  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || "Fine Jewellery Buyers", {
        body: data.body || "New admin alert",
        icon: "/icon-192.png",
        badge: "/favicon-48.png",
        tag: data.tag || "fjb-admin",
        renotify: true,
        silent: false,
        vibrate: [160, 70, 160, 70, 220],
        data: { url: data.url || "/admin" },
      }),
      self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: "FJB_PUSH_ALERT", title: data.title }));
      }),
    ])
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/admin";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          if ("navigate" in client) client.navigate(url);
          return client.focus();
        }
      }
      return self.clients.openWindow(url);
    })
  );
});
