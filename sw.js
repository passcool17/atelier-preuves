/* Service worker versionné — change CACHE pour invalider l’ancien cache. */
const CACHE = 'atelier-v4'; // garder égal à js/version.js et aux ?v= de index.html

// Indispensable au premier affichage : mis en cache à l’installation.
const ASSETS = [
  './',
  './index.html',
  './style.css?v=atelier-v4',
  './js/main.js?v=atelier-v4',
  './js/logic.js',
  './js/methods.js',
  './js/data.js',
  './js/game.js',
  './js/save.js',
  './js/garden.js',
  './js/explain.js',
  './js/audio.js',
  './js/art.js',
  './js/icons.js',
  './js/version.js',
  './assets/art/garden/fond.webp',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './manifest.webmanifest',
];

// Illustrations et musique : mises en cache en arrière-plan après l’installation,
// pour que tout marche hors ligne après une visite, sans ralentir le premier affichage.
const LATER = [
  './assets/art/garden/bonus.webp',
  './assets/art/garden/fond-400.webp',
  './assets/art/garden/bonus-400.webp',
  './assets/art/plants/galets-seed.webp',
  './assets/art/plants/galets-sprout.webp',
  './assets/art/plants/galets-bloom.webp',
  './assets/art/plants/mousse-seed.webp',
  './assets/art/plants/mousse-sprout.webp',
  './assets/art/plants/mousse-bloom.webp',
  './assets/art/plants/bambou-seed.webp',
  './assets/art/plants/bambou-sprout.webp',
  './assets/art/plants/bambou-bloom.webp',
  './assets/art/plants/iris-seed.webp',
  './assets/art/plants/iris-sprout.webp',
  './assets/art/plants/iris-bloom.webp',
  './assets/art/plants/fougere-seed.webp',
  './assets/art/plants/fougere-sprout.webp',
  './assets/art/plants/fougere-bloom.webp',
  './assets/art/plants/lotus-seed.webp',
  './assets/art/plants/lotus-sprout.webp',
  './assets/art/plants/lotus-bloom.webp',
  './assets/art/plants/pierre-seed.webp',
  './assets/art/plants/pierre-sprout.webp',
  './assets/art/plants/pierre-bloom.webp',
  './assets/art/plants/lanterne-seed.webp',
  './assets/art/plants/lanterne-sprout.webp',
  './assets/art/plants/lanterne-bloom.webp',
  './assets/art/plants/erable-seed.webp',
  './assets/art/plants/erable-sprout.webp',
  './assets/art/plants/erable-bloom.webp',
  './assets/art/plants/pin-seed.webp',
  './assets/art/plants/pin-sprout.webp',
  './assets/art/plants/pin-bloom.webp',
  './assets/art/plants/cerisier-seed.webp',
  './assets/art/plants/cerisier-sprout.webp',
  './assets/art/plants/cerisier-bloom.webp',
  './assets/art/plants/bonsai-seed.webp',
  './assets/art/plants/bonsai-sprout.webp',
  './assets/art/plants/bonsai-bloom.webp',
  './assets/art/plants/tsukubai-seed.webp',
  './assets/art/plants/tsukubai-sprout.webp',
  './assets/art/plants/tsukubai-bloom.webp',
  './assets/art/plants/pont-seed.webp',
  './assets/art/plants/pont-sprout.webp',
  './assets/art/plants/pont-bloom.webp',
  './assets/art/plants/koi-seed.webp',
  './assets/art/plants/koi-sprout.webp',
  './assets/art/plants/koi-bloom.webp',
  './assets/art/intros/niveau-1.webp',
  './assets/art/intros/niveau-2.webp',
  './assets/art/intros/niveau-3.webp',
  './assets/art/intros/niveau-4.webp',
  './assets/audio/jardin.ogg',
  './assets/audio/jardin.mp3',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await Promise.all(ASSETS.map((url) => cache.add(url).catch(() => undefined)));
      await self.skipWaiting();
    })(),
  );
});

async function fillLater() {
  const cache = await caches.open(CACHE);
  for (const url of LATER) {
    if (await cache.match(url)) continue;
    await cache.add(url).catch(() => undefined); // un par un : léger pour le réseau du téléphone
  }
}

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
      .then(fillLater),
  );
});

// Réseau d’abord (toujours la dernière version en ligne), cache si hors ligne.
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: req.mode === 'navigate' }).then((r) => r || (req.mode === 'navigate' ? caches.match('./index.html') : undefined)) .then((r) => r || Response.error())),
  );
});
