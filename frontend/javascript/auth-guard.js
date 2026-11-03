
/* ============================================================
   AUTH GUARD — PROTEKSI HALAMAN
   ============================================================ */

(async function () {
    try {
        const response = await apiGetProfile();

        // Jika belum login atau session tidak valid
        if (response.httpStatus === 401) {
            clearUserSession();
            window.location.replace("login.html");
            return;
        }

        // Jika berhasil diverifikasi
        if (response.ok) {
            document.documentElement.style.visibility = "visible";
            return;
        }

        // Jika terjadi error server, jangan anggap sudah login
        console.error("Gagal memverifikasi sesi:", response.message);
        window.location.replace("login.html");

    } catch (error) {
        console.error("Kesalahan pemeriksaan login:", error);
        window.location.replace("login.html");
    }
})();
