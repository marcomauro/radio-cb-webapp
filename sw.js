const CACHE_NAME = 'radio-cb-v4';
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

    // Navigation: network-first so a new version published on GitHub Pages
    // shows up immediately; fall back to the cached page when offline.
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(resp => {
                    if (resp && resp.ok) {
                        const copy = resp.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put('./index.html', copy));
                    }
                    return resp;
                })
                .catch(() => caches.match('./index.html'))
        );
        return;
    }

    // Cache-first for app shell assets
    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request))
    );
});
