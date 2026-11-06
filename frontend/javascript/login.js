
document.addEventListener('DOMContentLoaded', () => {

    // =========================
    // SKELETON
    // =========================

    // Menyiapkan tampilan sementara sebelum konten login ditampilkan.
    const loginSkeleton = document.getElementById('loginSkeleton');
    const loginContent = document.getElementById('loginContent');

    function showContent() {
        loginSkeleton?.classList.add('skeleton-hidden');
        loginContent?.classList.remove('skeleton-hidden');
    }

    // Menampilkan halaman setelah selesai dimuat.
    // Timer 8 detik menjadi cadangan jika proses load terlalu lama.
    window.addEventListener('load', () => setTimeout(showContent, 200));
    setTimeout(showContent, 8000);

    // =========================
    // ELEMEN
    // =========================

    // Menghubungkan JavaScript dengan elemen form pada HTML.
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const togglePassword = document.getElementById('togglePassword');
    const formMessage = document.getElementById('formMessage');

    // Jika elemen penting tidak ditemukan, hentikan proses.
    // Ini mencegah JavaScript mengakses elemen yang tidak tersedia.
    if (!loginForm || !emailInput || !passwordInput ||
        !submitBtn || !formMessage) {
        console.error('Elemen form login tidak ditemukan.');
        return;
    }

    // =========================
    // IKON NOTIFIKASI SVG
    // =========================

    // Menyimpan ikon berdasarkan kondisi yang diberikan backend.
    // success: berhasil, server: gangguan sistem,
    // auth: autentikasi gagal, offline: koneksi terputus.
    const icons = {
        success: `
            <svg class="notification-icon" width="41" height="41"
                 viewBox="0 0 41 41" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="20.17" cy="20.17" r="20.17" fill="#15A367"/>
                <path d="M11.5 20.5L17.5 26.5L29.5 14.5"
                      stroke="white" stroke-width="3"
                      stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `,

        server: `
            <svg class="notification-icon" width="40" height="40"
                 viewBox="0 0 40 40" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="20" cy="20" r="20" fill="#C41B1B"/>
                <path d="M13 13L27 27M27 13L13 27"
                      stroke="white" stroke-width="3"
                      stroke-linecap="round"/>
            </svg>
        `,

        auth: `
            <svg class="notification-icon" width="43" height="40"
                 viewBox="0 0 43 40" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21.5 0C9.626 0 0 8.955 0 20S9.626 40 21.5 40 43 31.045 43 20 33.374 0 21.5 0Z"
                      fill="#D02316"/>
                <path d="M21.5 10V22M21.5 29V29.1"
                      stroke="white" stroke-width="3.5"
                      stroke-linecap="round"/>
            </svg>
        `,

        offline: `
            <svg class="notification-icon" width="45" height="35"
                 viewBox="0 0 45 35" fill="none"
                 xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M2 10C13-1 32-1 43 10
                         M8 17C16 9 29 9 37 17
                         M15 24C19 20 26 20 30 24"
                      stroke="#FEB807" stroke-width="4"
                      stroke-linecap="round"/>
                <circle cx="22.5" cy="31" r="2.5" fill="#FEB807"/>
            </svg>
        `
    };

    // =========================
    // TOGGLE PASSWORD
    // =========================

    // Mengubah tipe password menjadi text ketika ikon mata diklik,
    // lalu mengembalikannya menjadi password jika diklik lagi.
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const icon = togglePassword.querySelector('iconify-icon');

            if (icon) {
                icon.setAttribute(
                    'icon',
                    isPassword
                        ? 'akar-icons:eye-closed'
                        : 'akar-icons:eye'
                );
            }
        });
    }

    // =========================
    // VALIDASI
    // =========================

    // Mengatur pesan kesalahan email dan memberi border merah.
    // Jika pesannya kosong, tanda error dihilangkan.
    function setEmailError(message) {
        const wrapper = document.getElementById('emailWrapper');
        const errorText = document.getElementById('emailError');

        if (wrapper) wrapper.classList.toggle('invalid', Boolean(message));
        if (errorText) errorText.textContent = message || '';

        updateButtonState();
    }

    // Mengatur pesan kesalahan dan border pada input password.
    function setPasswordError(message) {
        const wrapper = document.getElementById('passwordWrapper');
        const errorText = document.getElementById('passwordError');

        if (wrapper) wrapper.classList.toggle('invalid', Boolean(message));
        if (errorText) errorText.textContent = message || '';

        updateButtonState();
    }

    // Memvalidasi input sebelum data dikirim ke API login.
    // Frontend hanya memeriksa kolom wajib dan format email,
    // bukan menentukan apakah akun benar-benar terdaftar.
    function validateForm() {
        const email = emailInput.value;
        const password = passwordInput.value;
        let valid = true;

        // Memeriksa email kosong, format tidak sesuai, atau valid.
        
if (!email) {
    setEmailError('E-mail wajib diisi.');
    valid = false;

} else if (/\s/.test(email)) {
    setEmailError('E-mail tidak boleh mengandung spasi.');
    valid = false;

} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setEmailError('Format E-mail tidak sesuai.');
    valid = false;

} else {
    setEmailError('');
}


        // Password wajib diisi. Kecocokannya diperiksa backend.
        if (!password) {
            setPasswordError('Password wajib diisi.');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    }

    // Tombol dinonaktifkan jika masih ada kesalahan input
    // atau sedang menunggu proses login selesai.
    function updateButtonState() {
        const hasError = Boolean(
            document.querySelector('.input-wrapper.invalid') ||
            document.querySelector('.error-message:not(:empty)')
        );

        const isLoading = submitBtn.dataset.loading === 'true';

        submitBtn.disabled = hasError || isLoading;
    }

    // =========================
    // NOTIFIKASI
    // =========================

    // Pesan yang ditampilkan berdasarkan hasil proses login.
    const messages = {
        success: {
            title: 'LOGIN BERHASIL',
            desc: 'Login berhasil. Anda akan dialihkan ke halaman dashboard.'
        },
        logoutSuccess: {
            title: 'LOGOUT BERHASIL',
            desc: 'Anda berhasil logout dari akun ini.'
        },
        server: {
            title: 'LOGIN GAGAL',
            desc: 'Terjadi kesalahan pada sistem. Silakan coba lagi.'
        },
        auth: {
            title: 'GAGAL MELAKUKAN AUTENTIKASI',
            desc: 'Mohon isi E-mail dan password dengan benar.'
        },
        offline: {
            title: 'KONEKSI INTERNET TERPUTUS',
            desc: 'Periksa koneksi internet Anda. Silakan coba lagi.'
        }
    };

    // Memilih ikon dan pesan sesuai jenis notifikasi,
    // kemudian menampilkannya pada halaman login.
    function showMessage(type) {
        const selected = messages[type] || messages.server;

        formMessage.innerHTML = `
            <div class="notification-icon-wrapper ${type}">
                ${type === 'logoutSuccess' ? icons.success : (icons[type] || icons.server)}
            </div>
            <div class="notification-content">
                <div class="notification-title">${selected.title}</div>
                <div class="notification-desc">${selected.desc}</div>
            </div>
        `;

        formMessage.className = `form-message ${
            type === 'logoutSuccess' ? 'success' : type
        }`;

        formMessage.hidden = false;
        formMessage.setAttribute('role', 'alert');
        formMessage.setAttribute('aria-live', 'polite');
    }

    // Menghapus notifikasi sebelumnya dari tampilan.
    function hideMessage() {
        formMessage.hidden = true;
        formMessage.innerHTML = '';
        formMessage.className = 'form-message';
    }

    // =========================
    // SUBMIT LOGIN
    // =========================

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage();

        // Jalankan validasi frontend sebelum menghubungi backend.
        const isValid = validateForm();
        updateButtonState();

        // Jika input tidak valid, proses dihentikan.
        // Artinya tidak ada request login yang dikirim.
        if (!isValid) return;

        const email = emailInput.value;
        const password = passwordInput.value;
        const originalText = submitBtn.textContent;
        let loginSucceeded = false;

        // Mengubah tombol menjadi Loading dan menonaktifkannya
        // selama menunggu respons autentikasi.
        submitBtn.dataset.loading = 'true';
        updateButtonState();
        submitBtn.textContent = 'Loading...';

        // try digunakan untuk menjalankan proses request.
        // catch menangani error, sedangkan finally mengatur
        // kondisi tombol setelah proses selesai.
        try {

            // Jangan mengirim request jika browser sedang offline.
            if (!navigator.onLine) {
                showMessage('offline');
                return;
            }

            // Memanggil apiLogin(email, password) dari api.js.
            const response = await apiLogin(email, password);

            if (!response) {
                showMessage(navigator.onLine ? 'server' : 'offline');
                return;
            }

            // Login dianggap berhasil jika request HTTP berhasil
            if (response.ok && response.status === 'success') {

                // Menyimpan data pengguna dari respons backend
                // ke localStorage melalui fungsi di api.js.
                if (
                    response.data &&
                    typeof saveUserSession === 'function'
                ) {
                    saveUserSession(response.data);
                }

                loginSucceeded = true;
                showMessage('success');

                // Redirect ke Dashboard setelah notifikasi sukses
                setTimeout(() => {
                    window.location.replace('dashboard.html');
                }, 1500);

                return;
            }

            // Memeriksa jenis kegagalan berdasarkan respons API.


            if (
                response.httpStatus === 0 ||
                !navigator.onLine
            ) {
                showMessage('offline');
            } else if (
                response.httpStatus === 401 ||
                response.httpStatus === 403
            ) {
                showMessage('auth');
            } else {
                showMessage('server');
            }

        } catch (error) {

            // Menangani error yang terjadi selama proses login.
            console.error('Login error:', error);
            showMessage(navigator.onLine ? 'server' : 'offline');

        } finally {

            // Jika login gagal, hentikan loading dan
            // kembalikan tombol agar dapat digunakan lagi.
            if (!loginSucceeded) {
                // Hentikan status loading
                submitBtn.dataset.loading = 'false';

                // Kembalikan tulisan tombol
                submitBtn.textContent = originalText;

                // Perbarui kondisi tombol
                updateButtonState();
            }
        }
    });

    // =========================
    // RESET ERROR SAAT MENGETIK
    // =========================

    // Menghapus pesan error ketika pengguna memperbaiki email.
    emailInput.addEventListener('input', () => {
        setEmailError('');
        hideMessage();
    });

    // Menghapus pesan error ketika pengguna memperbaiki password.
    passwordInput.addEventListener('input', () => {
        setPasswordError('');
        hideMessage();
    });

    // Menampilkan notifikasi jika koneksi terputus
    // ketika halaman Login sedang terbuka.
    
    // =========================================
    // NOTIFIKASI SAAT KONEKSI TERPUTUS
    // =========================================

    window.addEventListener('offline', () => {
        showMessage('offline');
    });


    // =========================================
    // RESET LOGIN SAAT KEMBALI DARI BROWSER BACK
    // =========================================

    window.addEventListener('pageshow', (event) => {

        // Hanya reset ketika halaman dipulihkan dari BFCache.
        if (!event.persisted) return;

        // Kosongkan email dan password.
        loginForm.reset();

        emailInput.value = '';
        passwordInput.value = '';

        // Hapus pesan validasi.
        setEmailError('');
        setPasswordError('');

        // Hilangkan notifikasi sebelumnya.
        hideMessage();

        // Kembalikan tombol Login ke kondisi awal.
        submitBtn.dataset.loading = 'false';
        submitBtn.textContent = 'Login';

        updateButtonState();
    });

});
