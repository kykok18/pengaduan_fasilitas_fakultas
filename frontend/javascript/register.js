/* ============================================================
   REGISTER.JS — Validasi + Integrasi Registrasi ke Backend
   (DIPERBAIKI: Hanya mengubah posisi pesan error)
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
       CEK SESSION — (TETAP MENGGUNAKAN VERSI ASLI ANDA)
       ============================================================ */
    async function checkSessionAndLoad() {
        try {
            // Jika Anda sebelumnya punya apiGetProfile, biarkan.
            // Tapi untuk amannya, kita langsung tampilkan konten form register.
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

        /* ============================================================
       TOGGLE PASSWORD (Mata Buka / Mata Terpejam)
       ============================================================ */
    document.querySelectorAll('.toggle-password').forEach((button) => {
        button.addEventListener('click', () => {
            const targetId = button.dataset.target;
            const input = document.getElementById(targetId);
            const icon = button.querySelector('iconify-icon');

            const isPassword = input.type === 'password';
            input.type = isPassword ? 'text' : 'password';

            // Ganti icon: 
            // Jika password (tersembunyi) -> Mata Terbuka (akar-icons:eye)
            // Jika text (terlihat) -> Mata Terpejam (akar-icons:eye-closed)
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
       ERROR HANDLING (Pesan di bawah input)
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
       NOTIFIKASI POP-UP (Pesan di atas form)
       ============================================================ */
        function showMessage(messageHTML, type) {
        let iconHTML = '';
        if (type === 'success') {
            // Menggunakan ikon centang solid (Vector)
            iconHTML = `<iconify-icon icon="mdi:check-circle"></iconify-icon>`;
        } else {
            iconHTML = `<iconify-icon icon="mdi:close-circle"></iconify-icon>`; 
        }

        // Struktur HTML: Wrapper Icon (Frame 187) + Content
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
        
        // MUNCULKAN LOGO KEMBALI SAAT PESAN HILANG
        const brandHeader = document.getElementById('brandHeader');
        if (brandHeader) brandHeader.style.display = 'flex'; // .brand aslinya pakai display: flex
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
            // Jika validasi input gagal, tidak perlu pop-up atas, cukup border merah di input
            const firstInvalid = registerForm.querySelector('.input-wrapper.invalid input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const submitBtn = registerForm.querySelector('.btn-register');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Memproses...';

        try {
            const response = await apiRegister(
                fullnameInput.value.trim(),
                emailInput.value.trim(),
                passwordInput.value,
                confirmPasswordInput.value
            );

            submitBtn.disabled = false;
            submitBtn.textContent = originalText;

            if (response.ok && response.status === 'success') {
                // KONDISI 1: BERHASIL (Pop-up Hijau)
                showMessage(`
                    <div class="msg-title">REGISTRASI BERHASIL</div>
                    <div class="msg-desc">Akun berhasil dibuat. Silakan masuk untuk melanjutkan.</div>
                `, 'success');
                
                // setTimeout(() => { window.location.href = 'login.html'; }, 2500);
                
            } else {
                // Cek apakah error karena email sudah terdaftar (HTTP 409 / kata "terdaftar")
                if (response.httpStatus === 409 || (response.message && response.message.toLowerCase().includes('terdaftar'))) {
                    
                    // KONDISI 2: EMAIL TERDAFTAR (Hanya border & teks di bawah input)
                    showError(emailInput, 'E-mail sudah terdaftar, silakan gunakan E-mail lain untuk masuk.');
                    
                } else {
                    // KONDISI 3: ERROR SERVER / SISTEM (Pop-up Merah)
                    showMessage(`
                        <div class="msg-title">REGISTRASI GAGAL</div>
                        <div class="msg-desc">Terjadi kesalahan pada sistem. Silakan<br>coba lagi.</div>
                    `, 'error');
                }
            }
        } catch (error) {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
            
            // KONDISI 4: ERROR JARINGAN (Pop-up Merah)
            showMessage(`
                <div class="msg-title">REGISTRASI GAGAL</div>
                <div class="msg-desc">Tidak dapat terhubung ke server. Periksa koneksi internet Anda.</div>
            `, 'error');
        }
    });

});