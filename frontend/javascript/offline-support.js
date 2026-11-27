
/*
 * FITK SIBER AHSAN
 * Registrasi Service Worker dan sinyal offline
 */

(() => {
    "use strict";

    // ==================================================
    // REGISTER SERVICE WORKER
    // ==================================================

    if ("serviceWorker" in navigator && window.isSecureContext) {
        window.addEventListener("load", () => {
            const swURL = new URL("./sw.js", document.baseURI);

            navigator.serviceWorker.register(swURL.href, {
                scope: new URL("./", document.baseURI).pathname
            }).catch((error) => {
                console.warn(
                    "Service Worker tidak terpasang:",
                    error
                );
            });
        });
    }

    // ==================================================
    // SAAT KONEKSI OFFLINE
    // ==================================================

    function onOffline() {
        document.documentElement.dataset.network = "offline";

        // Dashboard
        const dashboardRetry =
            document.getElementById("btnRetry");

        if (
            dashboardRetry &&
            document.getElementById("errorState")
        ) {
            dashboardRetry.click();
            return;
        }

        // Detail Pengaduan
        const detailRetry =
            document.getElementById("detailRetryBtn");

        if (
            detailRetry &&
            document.getElementById("detailState")
        ) {
            detailRetry.click();
            return;
        }

        // Riwayat Pengaduan
        if (
            document.getElementById("riwayatList") &&
            document.getElementById("riwayatError")
        ) {
            window.dispatchEvent(
                new CustomEvent("fitk:offline")
            );
            return;
        }

        // Halaman lainnya
        window.dispatchEvent(
            new CustomEvent("fitk:offline")
        );
    }

    // ==================================================
    // SAAT KONEKSI ONLINE
    // ==================================================

    function onOnline() {
        document.documentElement.dataset.network = "online";

        // Tidak otomatis mengirim ulang POST voting atau komentar.
        window.dispatchEvent(
            new CustomEvent("fitk:online")
        );
    }

    window.addEventListener("offline", onOffline);
    window.addEventListener("online", onOnline);

    // Periksa keadaan awal saat halaman dibuka
    if (!navigator.onLine) {
        if (document.readyState === "loading") {
            document.addEventListener(
                "DOMContentLoaded",
                onOffline,
                { once: true }
            );
        } else {
            onOffline();
        }
    }
})();
