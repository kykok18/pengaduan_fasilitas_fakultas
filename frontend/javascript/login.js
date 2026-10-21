/* ============================================================
   LOGIN.JS — Integrasi Login + Validasi UI (FINAL)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

    /* ============================================================
       SKELETON
       ============================================================ */
    const loginSkeleton = document.getElementById('loginSkeleton');
    const loginContent = document.getElementById('loginContent');

    function showContent() {
        if (loginSkeleton) loginSkeleton.classList.add('skeleton-hidden');
        if (loginContent) loginContent.classList.remove('skeleton-hidden');
    }
    window.addEventListener('load', () => setTimeout(showContent, 200));
    setTimeout(showContent, 8000);


    /* ============================================================
       ELEMEN
       ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const togglePassword = document.getElementById('togglePassword');
    const formMessage = document.getElementById('formMessage');


    /* ============================================================
       TOGGLE PASSWORD
       ============================================================ */
    if (togglePassword && passwordInput) {
        togglePassword.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';

            const icon = togglePassword.querySelector('iconify-icon');
            if (isPassword) {
                icon.setAttribute('icon', 'akar-icons:eye-closed');
            } else {
                icon.setAttribute('icon', 'akar-icons:eye');
            }
        });
    }


    /* ============================================================
       FUNGSI VALIDASI (Hanya menampilkan error saat dipanggil)
       ============================================================ */
    function setEmailError(message) {
        const wrapper = document.getElementById('emailWrapper');
        const errorText = document.getElementById('emailError');
        
        if (message) {
            wrapper.classList.add('invalid');
            errorText.textContent = message;
        } else {
            wrapper.classList.remove('invalid');
            errorText.textContent = '';
        }
    }

    function setPasswordError(message) {
        const wrapper = document.getElementById('passwordWrapper');
        const errorText = document.getElementById('passwordError');
        
        if (message) {
            wrapper.classList.add('invalid');
            errorText.textContent = message;
        } else {
            wrapper.classList.remove('invalid');
            errorText.textContent = '';
        }
    }

    // Fungsi untuk mengecek validasi tanpa menampilkan pesan (untuk cek tombol)
    function checkValidation() {
        const isEmailValid = emailInput.value.trim() !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value.trim());
        const isPasswordValid = passwordInput.value !== '';
        return isEmailValid && isPasswordValid;
    }


    /* ============================================================
       NOTIFIKASI POP-UP
       ============================================================ */
    function showMessage(title, desc, type) {
        let iconHTML = type === 'success' 
            ? `<iconify-icon icon="mdi:check-circle"></iconify-icon>` 
            : `<iconify-icon icon="mdi:close-circle"></iconify-icon>`;

        formMessage.innerHTML = `
            <div class="msg-icon-wrapper ${type}">
                ${iconHTML}
            </div>
            <div class="msg-content">
                <div class="msg-title">${title}</div>
                <div class="msg-desc">${desc}</div>
            </div>
        `;
        formMessage.className = `form-message ${type}`;
        formMessage.hidden = false;
    }

    function hideMessage() {
        formMessage.hidden = true;
        formMessage.innerHTML = '';
        formMessage.className = 'form-message';
    }


    /* ============================================================
       SUBMIT FORM
       ============================================================ */
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            hideMessage();

            // 1. Cek Validasi Manual
            const emailValue = emailInput.value.trim();
            const passwordValue = passwordInput.value;
            let isValid = true;

            if (!emailValue) {
                setEmailError('E-mail wajib diisi.');
                isValid = false;
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
                setEmailError('Format e-mail tidak valid.');
                isValid = false;
            } else {
                setEmailError('');
            }

            if (!passwordValue) {
                setPasswordError('Password wajib diisi.');
                isValid = false;
            } else {
                setPasswordError('');
            }

            // 2. Jika ada error, ubah tombol jadi abu-abu dan STOP
            if (!isValid) {
                submitBtn.disabled = true;
                submitBtn.classList.add('btn-disabled'); // Jika pakai class
                return;
            }

            // 3. Jika valid, ubah tombol jadi Loading
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Loading...';

            try {
                const response = await apiLogin(emailValue, passwordValue);

        if (response.ok && response.status === 'success') {
            // Simpan data user yang didapat dari backend
            // Asumsi: backend mengirim { data: { nama: "...", email: "..." } }
            if (response.data) {
                saveUserSession(response.data); 
            }

            // Redirect ke dashboard
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1500);
        }else {
                    showMessage('LOGIN GAGAL', 'E-mail atau password yang Anda masukkan<br>salah. Silakan periksa kembali.', 'error');
                    
                    // Kembalikan tombol ke semula
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false; 
                }
            } catch (error) {
                showMessage('LOGIN GAGAL', 'Tidak dapat terhubung ke server.', 'error');
                
                // Kembalikan tombol ke semula
                submitBtn.textContent = originalText;
                submitBtn.disabled = false; 
            }
        });
    }

    // 4. Reset error saat user mulai mengetik
    emailInput.addEventListener('input', () => {
        setEmailError('');
        if (submitBtn.disabled) submitBtn.disabled = false;
    });
    
    passwordInput.addEventListener('input', () => {
        setPasswordError('');
        if (submitBtn.disabled) submitBtn.disabled = false;
    });

});