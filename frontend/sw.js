/* FITK SIBER AHSAN — offline shell, tanpa cache data API/private.
 * Simpan file ini di frontend/sw.js.
 * Jika mengubah HTML/CSS/JS dan versi lama masih muncul, naikkan CACHE_VERSION.
 */
const CACHE_VERSION = 'fitk-static-v2-20261109';
const SCOPE = new URL(self.registration.scope);

// Hanya tampilan statis. Tidak ada endpoint backend di daftar ini.
const STATIC_FILES = [
  'index.html',
  'dashboard.html',
  'detail-pengaduan.html',
  'buat-pengaduan.html',
  'riwayat-pengaduan.html',
  'login.html',
  'register.html',
  'css/style.css',
  'css/skeleton.css',
  'css/dashboard.css',
  'css/detail-pengaduan.css',
  'css/buat-pengaduan.css',
  'css/riwayat-pengaduan.css',
  'css/login.css',
  'css/register.css',
  'javascript/api.js',
  'javascript/dashboard.js',
  'javascript/detail-pengaduan.js',
  'javascript/buat-pengaduan.js',
  'javascript/riwayat-pengaduan.js',
  'javascript/logout.js',
  'javascript/login.js',
  'javascript/register.js',
  'javascript/app.js',
  'javascript/offline-support.js',
  'img/logo-fitk.png'
];

const assetURLs = new Set(STATIC_FILES.map(path => new URL(path, SCOPE).pathname));

function isAllowed(request) {
  const url = new URL(request.url);
  return request.method === 'GET' &&
    url.origin === SCOPE.origin &&
    assetURLs.has(url.pathname);
}

function cacheKeyFor(request) {
  // Semua URL detail-pengaduan.html?id_pengaduan=N menggunakan shell HTML sama.
  const url = new URL(request.url);
  return new Request(new URL(url.pathname, url.origin).href, { method: 'GET' });
}

function isSafeResponse(request, response) {
  if (!response || !response.ok || response.type === 'opaque') return false;
  const path = new URL(request.url).pathname;
  const type = (response.headers.get('content-type') || '').toLowerCase();
  if (path.endsWith('.html')) return type.includes('text/html');
  if (path.endsWith('.js')) return /javascript|ecmascript|text\/plain/.test(type);
  if (path.endsWith('.css')) return type.includes('text/css');
  if (path.endsWith('.png')) return type.includes('image/');
  return false;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    // Kegagalan satu file tidak membatalkan cache file lain.
    await Promise.allSettled(STATIC_FILES.map(async path => {
      const request = new Request(new URL(path, SCOPE).href, {
        credentials: 'same-origin',
        cache: 'reload'
      });
      const response = await fetch(request);
      if (isSafeResponse(request, response)) {
        await cache.put(cacheKeyFor(request), response);
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys
      .filter(key => key.startsWith('fitk-static-') && key !== CACHE_VERSION)
      .map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (!isAllowed(request)) return; // API, POST, dan external CDN TIDAK di-cache.

  event.respondWith((async () => {
    const key = cacheKeyFor(request);
    const cache = await caches.open(CACHE_VERSION);
    try {
      // Network-first: Vercel yang terbaru dipakai ketika online.
      const response = await fetch(request);
      if (isSafeResponse(request, response)) {
        // Caching dilakukan di background tanpa menunda respons pengguna.
        event.waitUntil(cache.put(key, response.clone()));
      }
      return response;
    } catch (error) {
      const cached = await cache.match(key);
      if (cached) return cached;
      // Saat aset belum pernah berhasil tersimpan, tidak bisa menampilkan UI Figma.
      return Response.error();
    }
  })());
});
