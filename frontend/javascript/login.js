/* ============================================================
   LOGIN.JS — Integrasi Login ke Backend
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       SKELETON — Hilang saat window.load (jaringan lambat = lama)
       ============================================================ */
    const loginSkeleton = document.getElementById('loginSkeleton');
    const brandingSkeleton = document.getElementById('brandingSkeleton');
    const loginContent = document.getElementById('loginContent');
    const brandingContent = document.getElementById('brandingContent');

    function showContent() {
        if (loginSkeleton) loginSkeleton.classList.add('skeleton-hidden');
        if (brandingSkeleton) brandingSkeleton.classList.add('skeleton-hidden');
        if (loginContent) loginContent.classList.remove('skeleton-hidden');
        if (brandingContent) brandingContent.classList.remove('skeleton-hidden');
    }

    window.addEventListener('load', () => {
        setTimeout(showContent, 200);
    });

    // Fallback
    setTimeout(showContent, 8000);


    /* ============================================================
       ELEMEN FORM
       ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    
    /* ============================================================
       TOGGLE PASSWORD (Icon mata)
       ============================================================ */
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            // Ganti ikon menggunakan Iconify
            const icon = togglePassword.querySelector('iconify-icon');
            if (isPassword) {
                icon.setAttribute('icon', 'akar-icons:eye-closed');
            } else {
                icon.setAttribute('icon', 'akar-icons:eye');
            }
        });
    }


    /* ============================================================
       SUBMIT FORM — Kirim ke API
       ============================================================ */
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                alert('Mohon isi E-mail dan Password terlebih dahulu.');
                return;
            }

            const submitBtn = loginForm.querySelector('.btn-login');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

            const response = await apiLogin(email, password);

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            if (response.ok && response.status === 'success') {
                saveUserSession(response.data);
                alert('Login berhasil! Mengalihkan ke halaman utama...');
                window.location.href = 'index.html';
            } else {
                alert(response.message || 'Login gagal. Periksa email & password.');
            }
        });
    }

});