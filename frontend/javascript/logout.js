
document.addEventListener('DOMContentLoaded', () => {

    // =========================================================
    // 1. ELEMEN LOGOUT
    // =========================================================

    // Mengambil tombol Logout dan elemen modal dari HTML.
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutOverlay = document.getElementById('logoutModalOverlay');

    const logoutConfirmState = document.getElementById('logoutConfirmState');
    const logoutLoadingState = document.getElementById('logoutLoadingState');
    const logoutErrorState = document.getElementById('logoutErrorState');
    const logoutSuccessToast = document.getElementById('logoutSuccessToast');

    const cancelLogout = document.getElementById('btnCancelLogout');
    const confirmLogout = document.getElementById('btnConfirmLogout');
    const retryLogout = document.getElementById('btnRetryLogout');

    // Mencegah proses dijalankan pada halaman tanpa fitur Logout.
    if (!logoutBtn || !logoutOverlay) return;

    // Menandai apakah request Logout masih berlangsung.
    // Jika true, pengguna tidak dapat menjalankan logout berulang.
    let loggingOut = false;


    // =========================================================
    // 2. MENGATUR TAMPILAN MODAL
    // =========================================================

    // Mengatur modal berdasarkan kondisi:
    // confirm = konfirmasi, loading = proses, error = gagal.
    function showLogoutState(state) {
        logoutConfirmState.style.display =
            state === 'confirm' ? 'flex' : 'none';

        logoutLoadingState.style.display =
            state === 'loading' ? 'flex' : 'none';

        logoutErrorState.style.display =
            state === 'error' ? 'flex' : 'none';
    }


    // =========================================================
    // 3. MEMBUKA MODAL LOGOUT
    // =========================================================

    // Saat tombol Logout diklik, tampilkan modal konfirmasi.
    logoutBtn.addEventListener('click', (event) => {
        event.preventDefault();

        if (loggingOut) return;

        showLogoutState('confirm');
        logoutOverlay.classList.add('active');
    });


    // =========================================================
    // 4. MENUTUP MODAL
    // =========================================================

    // Modal hanya bisa ditutup saat tidak ada request berlangsung.
    function closeLogoutModal() {
        if (loggingOut) return;

        logoutOverlay.classList.remove('active');
    }

    if (cancelLogout) {
        cancelLogout.addEventListener('click', closeLogoutModal);
    }


    // =========================================================
    // 5. PROSES LOGOUT KE BACKEND
    // =========================================================

    async function performLogout() {

        // Mencegah request Logout dikirim berkali-kali.
        if (loggingOut) return;

        loggingOut = true;

        // Menampilkan modal Loading selama proses Logout.
        showLogoutState('loading');

        // Mencatat waktu mulai untuk mengatur durasi Loading.
        const loadingStartTime = Date.now();

        try {

            // Memanggil apiLogout() dari api.js.
            // Fungsi tersebut mengirim request POST ke logout.php.
            // Backend bertugas mengakhiri PHP Session pengguna.
            const result = await apiLogout();

            // Menghitung waktu yang sudah berlalu sejak Loading.
            const elapsedTime = Date.now() - loadingStartTime;

            // Loading ditampilkan minimal 1,5 detik,
            // meskipun respons backend diterima lebih cepat.
            if (elapsedTime < 1500) {
                await new Promise(resolve => {
                    setTimeout(resolve, 1500 - elapsedTime);
                });
            }

            // Memeriksa apakah backend berhasil memproses Logout.
            // Jika gagal, proses dialihkan ke catch.
            if (!result.ok) {
                throw new Error(result.message || 'Logout gagal');
            }

            // Menghapus data pengguna dari localStorage.
            // Penghapusan ini berbeda dengan PHP Session di backend.
            if (typeof clearUserSession === 'function') {
                clearUserSession();
            } else {
                localStorage.removeItem('user');
            }

            // Menyembunyikan modal sebelumnya.
            showLogoutState('');

            // Mengaktifkan tampilan notifikasi Logout berhasil.
            logoutOverlay.classList.add('active');
            logoutOverlay.classList.add('logout-success-active');

            logoutSuccessToast.style.display = 'flex';

            // Setelah 2 detik, arahkan pengguna ke halaman Login.
            setTimeout(() => {
                logoutSuccessToast.style.display = 'none';

                logoutOverlay.classList.remove('active');
                logoutOverlay.classList.remove('logout-success-active');

                window.location.replace('login.html');
            }, 2000);

        } catch (error) {

            // Jika request gagal atau backend menolak Logout,
            // tampilkan modal error agar pengguna dapat mencoba lagi.
            console.error('Logout error:', error);
            showLogoutState('error');

        } finally {

            // Mengembalikan status agar percobaan berikutnya
            // dapat dijalankan jika dibutuhkan.
            loggingOut = false;
        }
    }


    // =========================================================
    // 6. EVENT TOMBOL LOGOUT
    // =========================================================

    // Tombol konfirmasi menjalankan request Logout.
    if (confirmLogout) {
        confirmLogout.addEventListener('click', performLogout);
    }

    // Tombol Coba Lagi menjalankan ulang request jika gagal.
    if (retryLogout) {
        retryLogout.addEventListener('click', performLogout);
    }

});
