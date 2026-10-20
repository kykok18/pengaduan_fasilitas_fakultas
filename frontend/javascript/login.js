/* ============================================================
   LOGIN.JS — Integrasi Login ke Backend (Custom Notifikasi)
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

    window.addEventListener('load', () => {
        setTimeout(showContent, 200);
    });
    setTimeout(showContent, 8000);


    /* ============================================================
       ELEMEN
       ============================================================ */
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
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
       FUNGSI NOTIFIKASI
       ============================================================ */
    function showMessage(title, desc, type) {
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

            const email = emailInput.value.trim();
            const password = passwordInput.value;

            if (!email || !password) {
                showMessage('PERINGATAN', 'Username dan password wajib diisi!', 'error');
                return;
            }

            const submitBtn = loginForm.querySelector('.btn-login');
            const originalText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Memproses...';

            try {
                const response = await apiLogin(email, password);

                submitBtn.disabled = false;
                submitBtn.textContent = originalText;

                if (response.ok && response.status === 'success') {
                    saveUserSession(response.data);
                    
                    // TAMPILKAN NOTIFIKASI SUKSES
                    showMessage('LOGIN BERHASIL', 'Login berhasil! Anda akan dialihkan ke halaman utama.', 'success');

                    // TUNGGU 2 DETIK BARU PINDAH HALAMAN
                    setTimeout(() => { 
                        window.location.href = 'index.html'; 
                    }, 2000);

                } else {
                    showMessage('LOGIN GAGAL', 'Username atau password yang Anda <br> masukkan salah. Silakan periksa kembali.', 'error');
                }
            } catch (error) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
                showMessage('LOGIN GAGAL', 'Tidak dapat terhubung ke server.', 'error');
            }
        });
    }

});