/* ============================================================
   REGISTER.JS — Validasi + Integrasi Registrasi ke Backend
   (FINAL: Dengan logika tombol abu-abu/disabled)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Mencegah error bawaan PHP muncul sebagai teks di layar
    window.addEventListener('unhandledrejection', function(event) {
        event.preventDefault();
        console.error('Promise Error:', event.reason);
    });

    const registerSkeleton = document.getElementById('registerSkeleton');
    const registerContent = document.getElementById('registerContent');

    // Helper: sembunyikan skeleton, tampilkan konten
    function showRegisterContent() {
        if (registerSkeleton) registerSkeleton.classList.add('skeleton-hidden');
        if (registerContent) registerContent.classList.remove('skeleton-hidden');
    }

    /* ============================================================
       CEK SESSION
       ============================================================ */
    async function checkSessionAndLoad() {
        try {
            showRegisterContent();
        } catch (error) {
            showRegisterContent();
        }
    }
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
    const submitBtn = registerForm.querySelector('.btn-register'); // Ambil tombolnya


    /* ============================================================
       TOGGLE PASSWORD
       ============================================================ */
    document.querySelectorAll('.toggle-password').forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            const icon = button.querySelector('iconify-icon');

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            icon.setAttribute(
                'icon', 
                isPassword ? 'akar-icons:eye-closed' : 'akar-icons:eye'
            );

            button.setAttribute(
                'aria-label',
                isPassword ? 'Sembunyikan password' : 'Tampilkan password'
            );
        });
    });


    /* ============================================================
       FUNGSI CEK STATUS TOMBOL (ABU-ABU / HIJAU)
       ============================================================ */
    function updateButtonState() {
        // Cek apakah ada input yang berstatus invalid (merah)
        const hasInvalidInput = document.querySelector('.input-wrapper.invalid');
        
        // Cek apakah ada pesan error dari server yang muncul
        const hasFormError = !formMessage.hidden && formMessage.classList.contains('error');

        if (hasInvalidInput || hasFormError) {
            // Jika ada error, tombol jadi abu-abu (disabled)
            submitBtn.disabled = true;
        } else {
            // Jika aman, tombol jadi hijau (enabled)
            submitBtn.disabled = false;
        }
    }


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


    /* ============================================================
       NOTIFIKASI POP-UP
       ============================================================ */
    function showMessage(messageHTML, type) {
        let iconHTML = '';
        if (type === 'success') {
            iconHTML = `<iconify-icon icon="mdi:check-circle"></iconify-icon>`;
        } else {
            iconHTML = `<iconify-icon icon="mdi:close-circle"></iconify-icon>`; 
        }

        formMessage.innerHTML = `
            <div class="msg-icon-wrapper ${type}">
                ${iconHTML}
            </div>
            <div class="msg-content">
                ${messageHTML}
            </div>
        `;
        formMessage.className = `form-message ${type}`;
        formMessage.hidden = false;
        
        const brandHeader = document.getElementById('brandHeader');
        if (brandHeader) brandHeader.style.display = 'none'; 
    }

    function hideMessage() {
        formMessage.hidden = true;
        formMessage.innerHTML = '';
        formMessage.className = 'form-message';
        
        const brandHeader = document.getElementById('brandHeader');
        if (brandHeader) brandHeader.style.display = 'flex'; 
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


    /* ============================================================
       EVENT LISTENER VALIDASI (DENGAN UPDATE TOMBOL)
       ============================================================ */
    fullnameInput.addEventListener('blur', () => { validateFullname(); updateButtonState(); });
    emailInput.addEventListener('blur', () => { validateEmail(); updateButtonState(); });
    passwordInput.addEventListener('blur', () => { validatePassword(); updateButtonState(); });
    confirmPasswordInput.addEventListener('blur', () => { validateConfirmPassword(); updateButtonState(); });

    passwordInput.addEventListener('input', () => {
        hideMessage();
        if (confirmPasswordInput.value) validateConfirmPassword();
        updateButtonState(); // Cek tombol saat mengetik
    });

    [fullnameInput, emailInput, confirmPasswordInput].forEach((input) => {
        input.addEventListener('input', () => {
            hideMessage();
            updateButtonState(); // Cek tombol saat mengetik
        });
    });


    /* ============================================================
       SUBMIT FORM
       ============================================================ */
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage();

        // Jalankan semua validasi
        const isFullnameValid = validateFullname();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        // Paksa update state tombol setelah validasi
        updateButtonState();

        // Jika ada yang tidak valid, stop proses submit
        if (!isFullnameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            const firstInvalid = registerForm.querySelector('.input-wrapper.invalid input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true; // Tetap disable saat loading
        submitBtn.textContent = 'Memproses...';

        try {
            const response = await apiRegister(
                fullnameInput.value.trim(),
                emailInput.value.trim(),
                passwordInput.value,
                confirmPasswordInput.value
            );

            submitBtn.textContent = originalText;

            if (response.ok && response.status === 'success') {
                // KONDISI 1: BERHASIL
                showMessage(`
                    <div class="msg-title">REGISTRASI BERHASIL</div>
                    <div class="msg-desc">Akun berhasil dibuat. Silakan masuk untuk melanjutkan.</div>
                `, 'success');
                
                // Tombol dibiarkan disabled (abu-abu) karena form sudah sukses
                
            } else {
                // KONDISI 2: EMAIL TERDAFTAR
                if (response.httpStatus === 409 || (response.message && response.message.toLowerCase().includes('terdaftar'))) {
                    showError(emailInput, 'E-mail sudah terdaftar, silakan gunakan E-mail lain untuk masuk.');
                } else {
                    // KONDISI 3: ERROR SERVER
                    showMessage(`
                        <div class="msg-title">REGISTRASI GAGAL</div>
                        <div class="msg-desc">Terjadi kesalahan pada sistem. Silakan<br>coba lagi.</div>
                    `, 'error');
                }
            }
        } catch (error) {
            submitBtn.textContent = originalText;
            
            // KONDISI 4: ERROR JARINGAN
            showMessage(`
                <div class="msg-title">REGISTRASI GAGAL</div>
                <div class="msg-desc">Tidak dapat terhubung ke server. Periksa koneksi internet Anda.</div>
            `, 'error');
        }
        
        // Update state tombol terakhir kali setelah semua proses selesai
        updateButtonState(); 
    });

});