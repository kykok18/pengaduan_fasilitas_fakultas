
/*
 * FITK SIBER AHSAN — SERVICE WORKER
 * Offline support untuk halaman frontend
 */

const CACHE_VERSION = "fitk-static-v6-20261126";
const SCOPE = new URL(self.registration.scope);

// ==================================================
// FILE UTAMA
// ==================================================

const CORE_FILES = [
    "dashboard.html",
    "buat-pengaduan.html",
    "detail-pengaduan.html",
    "riwayat-pengaduan.html",

    "css/dashboard.css",
    "css/buat-pengaduan.css",
    "css/detail-pengaduan.css",
    "css/riwayat-pengaduan.css",
    "css/skeleton.css",

    "javascript/api.js",
    "javascript/dashboard.js",
    "javascript/buat-pengaduan.js",

    "javascript/detail-pengaduan-vote.js",
    "javascript/detail-pengaduan-komentar.js",
    "javascript/detail-pengaduan.js",

    "javascript/riwayat-pengaduan.js",
    "javascript/logout.js",
    "javascript/offline-support.js",

    "img/logo-fitk.png"
];

// ==================================================
// FILE TAMBAHAN
// ==================================================

const OPTIONAL_FILES = [
    "index.html",
    "login.html",
    "register.html",

    "css/login.css",
    "css/register.css",
    "css/style.css",

    "javascript/login.js",
    "javascript/register.js",
    "javascript/app.js"
];

const ALL_FILES = [
    ...CORE_FILES,
    ...OPTIONAL_FILES
];

const allowedPaths = new Set(
    ALL_FILES.map(
        (path) => new URL(path, SCOPE).pathname
    )
);

// ==================================================
// BATASI REQUEST YANG BOLEH DI-CACHE
// ==================================================

function isAllowed(request) {
    const url = new URL(request.url);

    return (
        request.method === "GET" &&
        url.origin === SCOPE.origin &&
        allowedPaths.has(url.pathname)
    );
}

// Hilangkan query string dari key cache
function getCacheKey(url) {
    const parsed = new URL(url);

    return parsed.origin + parsed.pathname;
}

// ==================================================
// VALIDASI RESPONS ASET
// ==================================================

function isValidAsset(path, response) {
    if (
        !response ||
        !response.ok ||
        response.type === "opaque"
    ) {
        return false;
    }

    const type = (
        response.headers.get("content-type") || ""
    ).toLowerCase();

    if (path.endsWith(".html")) {
        return type.includes("text/html");
    }

    if (path.endsWith(".js")) {
        return /javascript|ecmascript|text\/plain/.test(type);
    }

    if (path.endsWith(".css")) {
        return type.includes("text/css");
    }

    if (path.endsWith(".png")) {
        return type.includes("image/");
    }

    return false;
}

// ==================================================
// SIMPAN FILE KE CACHE
// ==================================================

async function cacheFile(cache, path) {
    const url = new URL(path, SCOPE);

    const response = await fetch(url.href, {
        credentials: "same-origin",
        cache: "reload"
    });

    if (!isValidAsset(path, response)) {
        throw new Error(
            `Gagal menyimpan ${path} (HTTP ${response.status})`
        );
    }

    await cache.put(
        getCacheKey(url.href),
        response
    );
}

// ==================================================
// INSTALL
// ==================================================

self.addEventListener("install", (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_VERSION);

        // File inti harus tersedia
        await Promise.all(
            CORE_FILES.map(
                (path) => cacheFile(cache, path)
            )
        );

        // File tambahan boleh tidak tersedia
        await Promise.allSettled(
            OPTIONAL_FILES.map(
                (path) => cacheFile(cache, path)
            )
        );

        await self.skipWaiting();
    })());
});

// ==================================================
// ACTIVATE
// ==================================================

self.addEventListener("activate", (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();

        await Promise.all(
            keys
                .filter(
                    (key) =>
                        key.startsWith("fitk-static-") &&
                        key !== CACHE_VERSION
                )
                .map(
                    (key) => caches.delete(key)
                )
        );

        await self.clients.claim();
    })());
});

// ==================================================
// FETCH — NETWORK FIRST, CACHE FALLBACK
// ==================================================

self.addEventListener("fetch", (event) => {
    const request = event.request;

    if (!isAllowed(request)) {
        return;
    }

    event.respondWith((async () => {
        const cache = await caches.open(CACHE_VERSION);
        const key = getCacheKey(request.url);

        try {
            const response = await fetch(request);
            const path = new URL(request.url).pathname;

            if (isValidAsset(path, response)) {
                event.waitUntil(
                    cache.put(
                        key,
                        response.clone()
                    )
                );
            }

            return response;

        } catch (error) {
            const cached = await cache.match(key);

            if (cached) {
                return cached;
            }

            return Response.error();
        }
    })());
});
