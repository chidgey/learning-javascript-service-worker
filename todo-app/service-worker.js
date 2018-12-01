/// <reference path="./types/service-worker.d.ts" />

const CacheName = "assets-v1";
const Assets = [
    "/assets/index.css", 
    "/src/app.js",
    "/src/controller.js",
    "/src/helpers.js",
    "/src/store-remote.js",
    "/src/template.js",
    "/src/view.js",
    "/src/item.js",
] ;

self.addEventListener('install', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Installed');

    // Don't wait for old server worker to shutdown. Instantly take over responsibility for serving requests
    skipWaiting();

    // Open the cache
    const cache = await caches.open(CacheName);

    // Add essential files like our app's assets to the cache
    console.log('[ServiceWorker] Caching cacheFiles');

    await cache.addAll(Assets);

})()));

self.addEventListener('activate', (e) => e.waitUntil((async () => {

    console.log('[ServiceWorker] Activated');

    // Immediately grab clients and start handling fetches
    await clients.claim();

})()));

self.addEventListener('fetch', (e) => e.respondWith((async () => {



    
    // Check in cache for the request being made
    var response = await caches.match(e.request);

    // If the request is in the cache
    if (response) {
        // Return the cached version
        console.log('[ServiceWorker] Found in Cache:', e.request.url);

        return response;
    }


    try {
        const response = await fetch(e.request);

        console.log('[ServiceWorker] Sending new response:', e.request.url);
        return response;

    } catch (err) {
        if (e.request.method === 'GET' && e.request.url.endsWith('/todos')) {
            const date = new Date();

            const data = {
                items: [{ id: -1, title: 'Check your internet connection???', complete: false, synced: true }],
                counts: { total: 1, active: 1, completed: 0 },
            };

            const json = JSON.stringify(data);

            return new Response(json, {
                headers: new Headers({
                    'content-type': 'application/json',
                    'date': date.toUTCString(),
                }),
            });
        }

        throw err;
    }
    
})()));