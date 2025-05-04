const cacheName = 'roulib-cache-v1';
const filesToCache = [
  '/',
  '/index.html',
  '/carte.html',
  '/profile.html',
  '/style.css',
  '/profile.css',
  '/profile.js',
  '/carte.js',
  '/data.json',
  '/manifest.json',
  '/roulib-icon.png',
  '/images/default.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(cacheName).then(cache => {
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
