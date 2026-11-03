
/* ============================================================
   AUTH GUARD — Proteksi Halaman Pengguna
   ============================================================ */

(async function () {
    try {
        const response = await apiGetProfile();

        if (!response.ok) {
            if (response.httpStatus === 401) {
                clearUserSession();
            }

            window.location.replace("login.html");
            return;
        }

        // Login valid, tampilkan halaman
        document.body.style.visibility = "visible";

    } catch (error) {
        console.error("Gagal memverifikasi sesi:", error);

        window.location.replace("login.html");
    }
})();
