// ════════════════════════════════════════════
// ClaimTak Service Worker
// PWA ला offline काम करण्यासाठी आणि app सारखं
// install होण्यासाठी हे file गरजेचं आहे.
// ════════════════════════════════════════════

const CACHE_NAME = 'claimtak-cache-v1';

// या file ची list वाढवायची गरज नाही — फक्त मुख्य पेज cache होतोय.
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  'https://claimtak.in/my-favicon.png'
];

// Step 1: Service worker install होताना मुख्य files cache मध्ये save करणे
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Step 2: जुना cache साफ करणे (नवीन version आल्यावर)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Step 3: Network आधी try करणे, नाही मिळालं तर cache मधून दाखवणे
// (यामुळे तुमची site नेहमी latest राहते, पण इंटरनेट नसेल तरी उघडते)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // नवीन copy cache मध्ये update करणे
        return caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
      .catch(() => {
        // इंटरनेट नसेल तर cache मधून जुना page दाखवणे
        return caches.match(event.request);
      })
  );
});
