// const CACHE_NAME = 'dhikr-pwa-v3';
// const toCache = [
//   '/',
//   '/index.html'
// ];

// self.addEventListener('install', event => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then(cache => {
//       // Cache HTML and root; other assets cached on demand
//       return cache.addAll(toCache).catch(() => {
//         console.log('Cache installation partial - some assets may not be available offline');
//       });
//     })
//   );
//   self.skipWaiting();
// });

// self.addEventListener('fetch', event => {
//   // Network-first for API calls, cache-first for assets
//   const { request } = event;
  
//   if (request.url.includes('/api/')) {
//     // API requests: network first
//     event.respondWith(
//       fetch(request)
//         .then(res => {
//           if (res.ok) return res;
//           throw new Error('API returned error');
//         })
//         .catch(() => {
//           // Try to return cached response, otherwise return offline error
//           return caches.match(request).then(cached => {
//             if (cached) return cached;
//             return new Response(JSON.stringify({ error: 'Offline' }), {
//               status: 503,
//               statusText: 'Service Unavailable',
//               headers: new Headers({ 'Content-Type': 'application/json' })
//             });
//           });
//         })
//     );
//   } else {
//     // Assets: cache first
//     event.respondWith(
//       caches.match(request)
//         .then(cached => {
//           if (cached) return cached;
//           return fetch(request)
//             .then(res => {
//               if (!res || res.status !== 200 || res.type === 'error') {
//                 return res;
//               }
//               // Clone and cache the response
//               const resClone = res.clone();
//               caches.open(CACHE_NAME).then(cache => {
//                 cache.put(request, resClone);
//               });
//               return res;
//             })
//             .catch(() => {
//               // Return offline error page for assets
//               return new Response('Offline - asset not cached', {
//                 status: 503,
//                 statusText: 'Service Unavailable'
//               });
//             });
//         })
//     );
//   }
// });

// self.addEventListener('activate', event => {
//   event.waitUntil(
//     caches.keys().then(keys =>
//       Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
//     )
//   );
//   self.clients.claim();
// });
