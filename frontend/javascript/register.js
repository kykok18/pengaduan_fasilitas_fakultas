document.addEventListener('DOMContentLoaded', () => {
    // Mencegah error bawaan PHP muncul sebagai teks di layar
    window.addEventListener('unhandledrejection', function(event) {
        event.preventDefault();
        console.error('Promise Error:', event.reason);
    });

    const registerSkeleton = document.getElementById('registerSkeleton');
    const registerContent = document.getElementById('registerContent');

    function showRegisterContent() {
        if (registerSkeleton) registerSkeleton.classList.add('skeleton-hidden');
        if (registerContent) registerContent.classList.remove('skeleton-hidden');
    }

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
    const submitBtn = registerForm.querySelector('.btn-register');

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

            icon.setAttribute('icon', isPassword ? 'akar-icons:eye-closed' : 'akar-icons:eye');
            button.setAttribute('aria-label', isPassword ? 'Sembunyikan password' : 'Tampilkan password');
        });
    });

    /* ============================================================
       FUNGSI UPDATE STATUS TOMBOL
       ============================================================ */
    function updateButtonState() {
        const hasInvalidInput = document.querySelector('.input-wrapper.invalid');
        const hasFormError = !formMessage.hidden && formMessage.classList.contains('error');

        if (hasInvalidInput || hasFormError) {
            submitBtn.disabled = true;
        } else {
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
       NOTIFIKASI POP-UP (SVG ASLI DARI FIGMA)
       ============================================================ */
    function showMessage(messageHTML, type) {
        let iconHTML = '';
        
        if (type === 'success') {
            iconHTML = `<svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.1667 0C9.02917 0 0 9.02917 0 20.1667C0 31.3042 9.02917 40.3333 20.1667 40.3333C31.3042 40.3333 40.3333 31.3042 40.3333 20.1667C40.3333 9.02917 31.3042 0 20.1667 0ZM28.908 16.7567C29.069 16.5727 29.1915 16.3584 29.2684 16.1263C29.3453 15.8943 29.375 15.6492 29.3558 15.4055C29.3366 15.1618 29.2689 14.9244 29.1566 14.7072C29.0442 14.4901 28.8896 14.2976 28.7018 14.1411C28.514 13.9846 28.2968 13.8673 28.063 13.7959C27.8292 13.7246 27.5835 13.7008 27.3403 13.7259C27.0971 13.7509 26.8614 13.8243 26.647 13.9418C26.4327 14.0593 26.2439 14.2185 26.092 14.41L18.2087 23.8682L14.1295 19.7872C13.7837 19.4532 13.3206 19.2684 12.8399 19.2726C12.3592 19.2768 11.8994 19.4696 11.5595 19.8095C11.2196 20.1494 11.0268 20.6092 11.0226 21.0899C11.0184 21.5706 11.2032 22.0337 11.5372 22.3795L17.0372 27.8795C17.2173 28.0595 17.433 28.2001 17.6704 28.2921C17.9079 28.3842 18.1619 28.4257 18.4163 28.4142C18.6707 28.4026 18.92 28.3382 19.1481 28.225C19.3762 28.1118 19.5783 27.9523 19.7413 27.7567L28.908 16.7567Z" fill-rule="evenodd" clip-rule="evenodd" fill="#15A367"/></svg>`;
        } else {
            iconHTML = `<svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_647_1525)"><path d="M20 0C21.8359 0 23.6068 0.234375 25.3125 0.703125C27.0182 1.17188 28.6068 1.84896 30.0781 2.73438C31.5495 3.61979 32.8971 4.66146 34.1211 5.85938C35.3451 7.05729 36.3932 8.40495 37.2656 9.90234C38.138 11.3997 38.8086 12.9948 39.2773 14.6875C39.7461 16.3802 39.987 18.151 40 20C40 21.8359 39.7656 23.6068 39.2969 25.3125C38.8281 27.0182 38.151 28.6068 37.2656 30.0781C36.3802 31.5495 35.3385 32.8971 34.1406 34.1211C32.9427 35.3451 31.5951 36.3932 30.0977 37.2656C28.6003 38.138 27.0052 38.8086 25.3125 39.2773C23.6198 39.7461 21.849 39.987 20 40C18.1641 40 16.3932 39.7656 14.6875 39.2969C12.9818 38.8281 11.3932 38.151 9.92188 37.2656C8.45052 36.3802 7.10286 35.3385 5.87891 34.1406C4.65495 32.9427 3.60677 31.5951 2.73438 30.0977C1.86198 28.6003 1.19141 27.0052 0.722656 25.3125C0.253906 23.6198 0.0130208 21.849 0 20C0 18.1641 0.234375 16.3932 0.703125 14.6875C1.17188 12.9818 1.84896 11.3932 2.73438 9.92188C3.61979 8.45052 4.66146 7.10286 5.85938 5.87891C7.05729 4.65495 8.40495 3.60677 9.90234 2.73438C11.3997 1.86198 12.9948 1.19141 14.6875 0.722656C16.3802 0.253906 18.151 0.0130208 20 0ZM22.207 20L28.8867 13.3203L26.6797 11.1133L20 17.793L13.3203 11.1133L11.1133 13.3203L17.793 20L11.1133 26.6797L13.3203 28.8867L20 22.207L26.6797 28.8867L28.8867 26.6797L22.207 20Z" fill="#C41B1B"/></g><defs><clipPath id="clip0_647_1525"><rect width="40" height="40" fill="white"/></clipPath></defs></svg>`;
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
        clearError(fullnameInput); return true;
    }

    function validateEmail() {
        const value = emailInput.value.trim();
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value) { showError(emailInput, 'E-mail wajib diisi.'); return false; }
        if (!emailPattern.test(value)) { showError(emailInput, 'Format e-mail tidak valid.'); return false; }
        clearError(emailInput); return true;
    }

    function validatePassword() {
        const value = passwordInput.value;
        if (!value) { showError(passwordInput, 'Password wajib diisi.'); return false; }
        if (value.length < 8) { showError(passwordInput, 'Password minimal 8 karakter.'); return false; }
        if (!/[A-Z]/.test(value) || !/[a-z]/.test(value) || !/[0-9]/.test(value)) {
            showError(passwordInput, 'Password harus mengandung huruf besar, huruf kecil, dan angka.'); return false;
        }
        clearError(passwordInput); return true;
    }

    function validateConfirmPassword() {
        const value = confirmPasswordInput.value;
        if (!value) { showError(confirmPasswordInput, 'Konfirmasi password wajib diisi.'); return false; }
        if (value !== passwordInput.value) { showError(confirmPasswordInput, 'Konfirmasi password tidak cocok.'); return false; }
        clearError(confirmPasswordInput); return true;
    }

    /* ============================================================
       EVENT LISTENER VALIDASI
       ============================================================ */
    fullnameInput.addEventListener('blur', () => { validateFullname(); updateButtonState(); });
    emailInput.addEventListener('blur', () => { validateEmail(); updateButtonState(); });
    passwordInput.addEventListener('blur', () => { validatePassword(); updateButtonState(); });
    confirmPasswordInput.addEventListener('blur', () => { validateConfirmPassword(); updateButtonState(); });

    passwordInput.addEventListener('input', () => {
        hideMessage();
        if (confirmPasswordInput.value) validateConfirmPassword();
        updateButtonState();
    });

    [fullnameInput, emailInput, confirmPasswordInput].forEach((input) => {
        input.addEventListener('input', () => {
            hideMessage();
            updateButtonState();
        });
    });

    /* ============================================================
       SUBMIT FORM (FINAL)
       ============================================================ */
    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        hideMessage();

        // Validasi Offline
        if (!navigator.onLine) {
            showMessage(`
                <div class="msg-title">REGISTRASI GAGAL</div>
                <div class="msg-desc">Koneksi internet terputus. Periksa jaringan Anda dan coba lagi.</div>
            `, 'error');
            updateButtonState();
            return;
        }

        // Validasi Inputan
        const isFullnameValid = validateFullname();
        const isEmailValid = validateEmail();
        const isPasswordValid = validatePassword();
        const isConfirmPasswordValid = validateConfirmPassword();

        updateButtonState();

        if (!isFullnameValid || !isEmailValid || !isPasswordValid || !isConfirmPasswordValid) {
            const firstInvalid = registerForm.querySelector('.input-wrapper.invalid input');
            if (firstInvalid) firstInvalid.focus();
            return;
        }

        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';

        try {
            const response = await apiRegister(
                fullnameInput.value.trim(),
                emailInput.value.trim(),
                passwordInput.value,
                confirmPasswordInput.value
            );

            submitBtn.textContent = originalText;

// LOGIKA SUKSES
if (response.ok && response.status === 'success') {
    showMessage(`
        <div class="msg-title">REGISTRASI BERHASIL</div>
        <div class="msg-desc">
            Akun berhasil dibuat. Silakan masuk untuk melanjutkan.
        </div>
    `, 'success');

    // Tunggu 2 detik, lalu pindah ke halaman login
    setTimeout(() => {
        hideMessage();
        window.location.replace('login.html');
    }, 2000);
                // ------------------------------
                
            } else {
                // LOGIKA GAGAL (Email Terdaftar / Sistem Error)
                if (response.httpStatus === 409 || (response.message && response.message.toLowerCase().includes('terdaftar'))) {
                    showError(emailInput, 'E-mail sudah terdaftar, silakan gunakan E-mail lain untuk masuk.');
                } else {
                    showMessage(`
                        <div class="msg-title">REGISTRASI GAGAL</div>
                        <div class="msg-desc">Terjadi kesalahan pada sistem. Silakan<br>coba lagi.</div>
                    `, 'error');
                }
            }
        } catch (error) {
            submitBtn.textContent = originalText;
            showMessage(`
                <div class="msg-title">REGISTRASI GAGAL</div>
                <div class="msg-desc">Tidak dapat terhubung ke server. Periksa koneksi internet Anda.</div>
            `, 'error');
        }
        
        // Jangan panggil updateButtonState() di sini jika sukses, 
        // agar notifikasi hijau tidak hilang sebelum redirect.
    });
});