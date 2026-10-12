/* ============================================================
   REGISTER.JS — Validasi + Integrasi Registrasi ke Backend
   Skeleton muncul HANYA saat fetch API berlangsung.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    const registerSkeleton = document.getElementById('registerSkeleton');
    const registerContent = document.getElementById('registerContent');

    // Helper: sembunyikan skeleton, tampilkan konten
    function showRegisterContent() {
        if (registerSkeleton) registerSkeleton.classList.add('skeleton-hidden');
        if (registerContent) registerContent.classList.remove('skeleton-hidden');
    }

    /* ============================================================
       CEK SESSION — Skeleton tampil selama fetch berlangsung
       ============================================================ */
    async function checkSessionAndLoad() {
        try {
            // Fetch ke API — skeleton tampil selama ini
            const response = await apiGetProfile();

            // Kalau user sudah login → redirect ke index
            if (response.ok && response.status === 'success') {
                window.location.href = 'index.html';
                return;
            }

            // Kalau belum login → tampilkan form register
            showRegisterContent();

        } catch (error) {
            console.warn('API tidak tersedia:', error);
            // Fallback: tetap tampilkan form register
            showRegisterContent();
        }
    }

    // Jalankan — skeleton default terlihat di HTML
    checkSessionAndLoad();


    /* ============================================================
       ELEMEN FORM
       ============================================================ */
    const registerForm = document.getElementById('registerForm');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    const formMessage = document.getElementById('formMessage');

        /* ============================================================
       TOGGLE PASSWORD (Icon mata tetap, tidak berubah)
       ============================================================ */
    document.querySelectorAll('.toggle-password').forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);

            // Toggle tipe input (password ↔ text)
            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            // Update aria-label (untuk aksesibilitas)
            button.setAttribute(
                'aria-label',
                isPassword ? 'Sembunyikan password' : 'Tampilkan password'
            );
        });
    });

    /* ============================================================
       ERROR HANDLING
       ============================================================ */
    function showError(input, message) {
        const errorElement = document.getElementById(`${input.id}Error`);
        errorElement.textContent = message;

        input.closest('.input-wrapper').classList.toggle('invalid', Boolean(message));
        input.closest('.input-wrapper').classList.toggle('valid', !message && input.value.trim() !== '');
        input.setAttribute('aria-invalid', String(Boolean(message)));
    }

    function clearError(input) {
        showError(input, '');
    }

    function showMessage(message, type) {
        formMessage.textContent = message;
        formMessage.className = `form-message ${type}`;
        formMessage.hidden = false;
    }

    function hideMessage() {
        formMessage.hidden = true;
        formMessage.textContent = '';
        formMessage.className = 'form-message';
    }

    /* ============================================================
       VALIDASI
       ============================================================ */
    function validateFullname() {
        const value = fullnameInput.value.trim();
        if (!value) { showError(fullnameInput, 'Nama lengkap wajib diisi.'); return false; }
        if (value.length < 3) { showError(fullnameInput, 'Nama lengkap minimal 3 karakter.'); return false; }
        clearError(fullnameInput);
        return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) { showError(emailInput, 'E-mail wajib diisi.'); return false; }
        if (!emailPattern.test(value)) { showError(emailInput, 'Format e-mail tidak valid.'); return false; }
        clearError(emailInput);
        return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (!value) { showError(passwordInput, 'Password wajib diisi.'); return false; }
        if (value.length < 8) { showError(passwordInput, 'Password minimal 8 karakter.'); return false; }
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
            showError(passwordInput, 'Password harus mengandung huruf besar, huruf kecil, dan angka.');
            return false;
        }
        clearError(passwordInput);
        return true;
    }

    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        if (!value) { showError(confirmPasswordInput, 'Konfirmasi password wajib diisi.'); return false; }
        if (value !== passwordInput.value) { showError(confirmPasswordInput, 'Konfirmasi password tidak cocok.'); return false; }
        clearError(confirmPasswordInput);
        return true;
    }

    /* Event listener validasi */
    fullnameInput.addEventListener('blur', validateFullname);
    emailInput.addEventListener('blur', validateEmail);
    passwordInput.addEventListener('blur', validatePassword);
    confirmPasswordInput.addEventListener('blur', validateConfirmPassword);

    passwordInput.addEventListener('input', () => {
        hideMessage();
        if (confirmPasswordInput.value) validateConfirmPassword();
    });

    [fullnameInput, emailInput, confirmPasswordInput].forEach((input) => {
        input.addEventListener('input', hideMessage);
    });

    /* ============================================================
       SUBMIT FORM — Kirim ke API
       ============================================================ */
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage();

        const isFullnameValid = validateFullname();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        if (!isFullnameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            showMessage('Periksa kembali data yang kamu masukkan.', 'error');
            const firstInvalid = registerForm.querySelector('.input-wrapper.invalid input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const submitBtn = registerForm.querySelector('.btn-register');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';

        const response = await apiRegister(
            fullnameInput.value.trim(),
            emailInput.value.trim(),
            passwordInput.value,
            confirmPasswordInput.value
        );

        submitBtn.disabled = false;
        submitBtn.textContent = originalText;

        if (response.ok && response.status === 'success') {
            showMessage('Registrasi berhasil! Akun berhasil dibuat. Silakan masuk untuk melanjutkan.', 'success');
            setTimeout(() => { window.location.href = 'login.html'; }, 2000);
        } else {
            showMessage(response.message || 'Registrasi gagal. Terjadi kesalahan pada sistem. Silakan coba lagi.', 'error');
        }
    });

});