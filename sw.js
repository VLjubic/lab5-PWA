const filesToCache = [
  "/",
  "manifest.json",
  "index.html",
  "offline.html",
  "404.html",
  "/assets/icons/offline.png",
  "upload.html",
  "images.html",
  "style.css",
  "favicon.ico",
];

const staticCacheName = "static-cache";

self.addEventListener("install", (event) => {
  console.log("Instaliram i cashiram assete");
  event.waitUntil(
    caches.open(staticCacheName).then((cache) => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Aktiviram SW");
  const cacheWhitelist = [staticCacheName];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("fetch", (event) => {
  if (
    event.request.url.startsWith("chrome-extension") ||
    event.request.url.includes("extension")
  )
    return;

  if (event.request.destination === "image") {
    event.respondWith(
      caches
        .open(staticCacheName)
        .then((cache) => {
          return cache.match(event.request).then((cachedResponse) => {
            const fetchedResponse = fetch(event.request)
              .then((networkResponse) => {
                cache.put(event.request, networkResponse.clone());

                return networkResponse;
              })
              .catch(() => {
                return caches.match("offline.png");
              });
            if (fetchedResponse.status === 404) {
              return caches.match("404.html");
            }

            return cachedResponse || fetchedResponse;
          });
        })
        .catch(() => {
          return caches.match("offline.html");
        })
    );
  } else {
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(event.request).then((response) => {
            if (response.status === 404) {
              return caches.match("404.html");
            }
            return caches.open(staticCacheName).then((cache) => {
              cache.put(event.request.url, response.clone());
              return response;
            });
          });
        })
        .catch(() => {
          return caches.match("offline.html");
        })
    );
  }
});
