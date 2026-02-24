const CACHE_NAME = 'radio-cb-v2';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './icons/icon-192.png',
    './icons/icon-512.png',
    './icons/icon-maskable-192.png',
    './icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);

    // Never cache the audio stream or metadata API
    if (url.pathname.includes('/stream') || url.pathname.includes('/status-json')) {
        return;
    }

    // For navigation requests, serve index.html from cache
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('./index.html').then(cached => cached || fetch(event.request))
        );
        return;
    }

    // Cache-first for app shell assets
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
