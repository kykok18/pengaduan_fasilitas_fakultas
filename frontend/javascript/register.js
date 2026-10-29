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
            // ... (SVG Sukses tetap sama) ...
            iconHTML = `<svg width="41" height="41" viewBox="0 0 41 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.1667 0C9.02917 0 0 9.02917 0 20.1667C0 31.3042 9.02917 40.3333 20.1667 40.3333C31.3042 40.3333 40.3333 31.3042 40.3333 20.1667C40.3333 9.02917 31.3042 0 20.1667 0ZM28.908 16.7567C29.069 16.5727 29.1915 16.3584 29.2684 16.1263C29.3453 15.8943 29.375 15.6492 29.3558 15.4055C29.3366 15.1618 29.2689 14.9244 29.1566 14.7072C29.0442 14.4901 28.8896 14.2976 28.7018 14.1411C28.514 13.9846 28.2968 13.8673 28.063 13.7959C27.8292 13.7246 27.5835 13.7008 27.3403 13.7259C27.0971 13.7509 26.8614 13.8243 26.647 13.9418C26.4327 14.0593 26.2439 14.2185 26.092 14.41L18.2087 23.8682L14.1295 19.7872C13.7837 19.4532 13.3206 19.2684 12.8399 19.2726C12.3592 19.2768 11.8994 19.4696 11.5595 19.8095C11.2196 20.1494 11.0268 20.6092 11.0226 21.0899C11.0184 21.5706 11.2032 22.0337 11.5372 22.3795L17.0372 27.8795C17.2173 28.0595 17.433 28.2001 17.6704 28.2921C17.9079 28.3842 18.1619 28.4257 18.4163 28.4142C18.6707 28.4026 18.92 28.3382 19.1481 28.225C19.3762 28.1118 19.5783 27.9523 19.7413 27.7567L28.908 16.7567Z" fill-rule="evenodd" clip-rule="evenodd" fill="#15A367"/></svg>`;
            
        } else if (type === 'offline') {
            // SVG OFFLINE DARI FIGMA KAMU
            iconHTML = `<svg width="45" height="35" viewBox="0 0 45 35" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M0.453779 9.76006C12.6285 -3.25335 32.3683 -3.25335 44.5431 9.76006C44.6879 9.91481 44.8029 10.0986 44.8813 10.3008C44.9596 10.5031 45 10.7198 45 10.9388C45 11.1577 44.9596 11.3745 44.8813 11.5767C44.8029 11.779 44.6879 11.9627 44.5431 12.1175L43.4416 13.295C43.2968 13.4499 43.125 13.5727 42.9358 13.6565C42.7466 13.7404 42.5438 13.7835 42.3391 13.7835C42.1343 13.7835 41.9315 13.7404 41.7423 13.6565C41.5531 13.5727 41.3813 13.4499 41.2365 13.295C30.8865 2.23241 14.1083 2.23241 3.76037 13.295C3.46811 13.6071 3.07193 13.7824 2.65887 13.7824C2.2458 13.7824 1.84963 13.6071 1.55736 13.295L0.455857 12.1175C0.163957 11.805 0 11.3815 0 10.9399C0 10.4983 0.163957 10.0747 0.455857 9.76228M7.06905 16.8322C15.5901 7.72262 29.4088 7.72262 37.932 16.8322C38.0768 16.987 38.1917 17.1707 38.2701 17.373C38.3485 17.5752 38.3889 17.792 38.3889 18.0109C38.3889 18.2299 38.3485 18.4466 38.2701 18.6489C38.1917 18.8511 38.0768 19.0349 37.932 19.1896L36.8305 20.3672C36.6857 20.5224 36.5137 20.6455 36.3243 20.7295C36.1349 20.8135 35.9319 20.8568 35.7269 20.8568C35.5219 20.8568 35.3189 20.8135 35.1295 20.7295C34.9401 20.6455 34.7681 20.5224 34.6233 20.3672C31.4078 16.9298 27.0468 14.9987 22.4995 14.9987C17.9522 14.9987 13.5911 16.9298 10.3756 20.3672C10.0834 20.6793 9.6872 20.8545 9.27414 20.8545C8.86107 20.8545 8.4649 20.6793 8.17263 20.3672L7.07113 19.1896C6.77923 18.8772 6.61527 18.4536 6.61527 18.012C6.61527 17.5704 6.77923 17.1469 7.07113 16.8345M13.73 23.9044C14.888 22.6663 16.2628 21.6841 17.7758 21.014C19.2889 20.3439 20.9106 19.999 22.5483 19.999C24.1861 19.999 25.8078 20.3439 27.3208 21.014C28.8339 21.6841 30.2086 22.6663 31.3666 23.9044C31.5114 24.0592 31.6264 24.2429 31.7047 24.4452C31.7831 24.6474 31.8235 24.8642 31.8235 25.0831C31.8235 25.302 31.7831 25.5188 31.7047 25.721C31.6264 25.9233 31.5114 26.107 31.3666 26.2618L30.2651 27.4394C30.1203 27.5942 29.9485 27.7171 29.7593 27.8009C29.5701 27.8847 29.3673 27.9278 29.1625 27.9278C28.9578 27.9278 28.755 27.8847 28.5658 27.8009C28.3766 27.7171 28.2048 27.5942 28.06 27.4394C27.3363 26.6655 26.477 26.0515 25.5313 25.6327C24.5856 25.2138 23.572 24.9982 22.5483 24.9982C21.5247 24.9982 20.511 25.2138 19.5653 25.6327C18.6196 26.0515 17.7604 26.6655 17.0366 27.4394C16.7444 27.7514 16.3482 27.9267 15.9351 27.9267C15.5221 27.9267 15.1259 27.7514 14.8336 27.4394L13.7321 26.2618C13.4402 25.9493 13.2763 25.5258 13.2763 25.0842C13.2763 24.6426 13.4402 24.2191 13.7321 23.9066M20.3453 30.9766C20.6348 30.6669 20.9786 30.4212 21.3569 30.2536C21.7353 30.0859 22.1408 29.9997 22.5504 29.9997C22.96 29.9997 23.3655 30.0859 23.7439 30.2536C24.1222 30.4212 24.466 30.6669 24.7555 30.9766C24.9003 31.1313 25.0152 31.3151 25.0936 31.5173C25.172 31.7196 25.2124 31.9363 25.2124 32.1553C25.2124 32.3742 25.172 32.591 25.0936 32.7932C25.0152 32.9955 24.9003 33.1792 24.7555 33.334L23.654 34.5116C23.5092 34.6664 23.3373 34.7892 23.1482 34.8731C22.959 34.9569 22.7562 35 22.5514 35C22.3467 35 22.1439 34.9569 21.9547 34.8731C21.7655 34.7892 21.5936 34.6664 21.4489 34.5116L20.3474 33.334C20.0555 33.0215 19.8915 32.598 19.8915 32.1564C19.8915 31.7148 20.0555 31.2912 20.3474 30.9788" fill-rule="evenodd" clip-rule="evenodd" fill="#FEB807"/></svg>`;
        } else {
            // ... (SVG Error tetap sama) ...
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
        
        // Tambahkan class 'offline-alert' khusus agar warnanya jadi kuning
        formMessage.className = `form-message ${type}`;
        formMessage.hidden = false;
        
        const brandHeader = document.getElementById('brandHeader');
        if (brandHeader) brandHeader.style.display = 'none'; 
    }

    
function hideMessage() {
    if (formMessage) {
        formMessage.hidden = true;
        formMessage.innerHTML = '';
        formMessage.className = 'form-message';
    }

    const brandHeader = document.getElementById('brandHeader');
    if (brandHeader) {
        brandHeader.style.display = '';
    }
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
         if (!/[^A-Za-z0-9\s]/.test(value)) {
            showError(passwordInput, 'Password harus mengandung huruf besar, huruf kecil, angka dan simbol.'); return false;
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
                <div class="msg-title">KONEKSI INTERNET TERPUTUS</div>
                <div class="msg-desc">Periksa koneksi internet Anda. Silakan coba lagi.</div>
            `, 'offline'); // Panggil dengan tipe 'offline'
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

            // LOGIKA RESPONS API
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

            } else if (!navigator.onLine || response.httpStatus === 0) {
                showMessage(`
                    <div class="msg-title">KONEKSI INTERNET TERPUTUS</div>
                    <div class="msg-desc">
                        Tidak dapat terhubung ke server.
                        Periksa koneksi Anda, lalu silakan coba lagi.
                    </div>
                `, 'offline');

            } else if (
                response.httpStatus === 409 ||
                (response.message && response.message.toLowerCase().includes('terdaftar'))
            ) {
                showError(
                    emailInput,
                    'E-mail sudah terdaftar, silakan gunakan E-mail lain untuk masuk.'
                );

            } else {
                showMessage(`
                    <div class="msg-title">REGISTRASI GAGAL</div>
                    <div class="msg-desc">
                        Terjadi kesalahan pada sistem. Silakan coba lagi.
                    </div>
                `, 'error');
            }

        } catch (error) {
            // MENANGANI JIKA TERJADI ERROR PADA PROSES API / KODE
            submitBtn.textContent = originalText;
            console.error(error);
            showMessage(`
                <div class="msg-title">REGISTRASI GAGAL</div>
                <div class="msg-desc">
                    Terjadi kesalahan pada sistem. Silakan coba lagi.
                </div>
            `, 'error');
        }
        
        // Jangan panggil updateButtonState() di sini jika sukses, 
        // agar notifikasi hijau tidak hilang sebelum redirect.
    });
});