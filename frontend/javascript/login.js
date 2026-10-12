/* ============================================================
   LOGIN.JS — Integrasi Login ke Backend
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');

    // Toggle password (mata)
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const icon = togglePassword.querySelector('i');
            if (isPassword) {
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            } else {
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            }
        });
    }

    // Submit form login
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