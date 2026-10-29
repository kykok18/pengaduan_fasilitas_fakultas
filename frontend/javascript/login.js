
document.addEventListener('DOMContentLoaded', () => {
    // =========================
    // SKELETON
    // =========================
    const loginSkeleton = document.getElementById('loginSkeleton');
    const loginContent = document.getElementById('loginContent');

    function showContent() {
        loginSkeleton?.classList.add('skeleton-hidden');
        loginContent?.classList.remove('skeleton-hidden');
    }

    window.addEventListener('load', () => setTimeout(showContent, 200));
    setTimeout(showContent, 8000);

    // =========================
    // ELEMEN
    // =========================
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const submitBtn = document.getElementById('submitBtn');
    const togglePassword = document.getElementById('togglePassword');
    const formMessage = document.getElementById('formMessage');

    if (!loginForm || !emailInput || !passwordInput ||
        !submitBtn || !formMessage) {
        console.error('Elemen form login tidak ditemukan.');
        return;
    }

    // =========================
    // IKON NOTIFIKASI SVG
    // =========================
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
    function setEmailError(message) {
        const wrapper = document.getElementById('emailWrapper');
        const errorText = document.getElementById('emailError');

        if (wrapper) wrapper.classList.toggle('invalid', Boolean(message));
        if (errorText) errorText.textContent = message || '';
    }

    function setPasswordError(message) {
        const wrapper = document.getElementById('passwordWrapper');
        const errorText = document.getElementById('passwordError');

        if (wrapper) wrapper.classList.toggle('invalid', Boolean(message));
        if (errorText) errorText.textContent = message || '';
    }

    function validateForm() {
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        let valid = true;

        if (!email) {
            setEmailError('E-mail wajib diisi.');
            valid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Format e-mail tidak valid.');
            valid = false;
        } else {
            setEmailError('');
        }

        if (!password) {
            setPasswordError('Password wajib diisi.');
            valid = false;
        } else {
            setPasswordError('');
        }

        return valid;
    }

    // =========================
    // NOTIFIKASI
    // =========================
    const messages = {
        success: {
            title: 'LOGIN BERHASIL',
            desc: 'Login berhasil. Anda akan dialihkan ke halaman dashboard.'
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

    function showMessage(type) {
        const selected = messages[type] || messages.server;

        formMessage.innerHTML = `
            <div class="notification-icon-wrapper ${type}">
                ${icons[type] || icons.server}
            </div>
            <div class="notification-content">
                <div class="notification-title">${selected.title}</div>
                <div class="notification-desc">${selected.desc}</div>
            </div>
        `;

        formMessage.className = `form-message ${type}`;
        formMessage.hidden = false;
        formMessage.setAttribute('role', 'alert');
        formMessage.setAttribute('aria-live', 'polite');
    }

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

        if (!validateForm()) return;

        const email = emailInput.value.trim();
        const password = passwordInput.value;
        const originalText = submitBtn.textContent;
        let loginSucceeded = false;

        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';

        try {
            if (!navigator.onLine) {
                showMessage('offline');
                return;
            }

            const response = await apiLogin(email, password);

            if (!response) {
                showMessage(navigator.onLine ? 'server' : 'offline');
                return;
            }

            if (response.ok && response.status === 'success') {
                if (
                    response.data &&
                    typeof saveUserSession === 'function'
                ) {
                    saveUserSession(response.data);
                }

                loginSucceeded = true;
                showMessage('success');

                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);

                return;
            }

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
            console.error('Login error:', error);
            showMessage(navigator.onLine ? 'server' : 'offline');
        } finally {
            if (!loginSucceeded) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    });

    // =========================
    // RESET ERROR SAAT MENGETIK
    // =========================
    emailInput.addEventListener('input', () => {
        setEmailError('');
        hideMessage();
    });

    passwordInput.addEventListener('input', () => {
        setPasswordError('');
        hideMessage();
    });

    // Jika koneksi terputus saat halaman sedang terbuka
    window.addEventListener('offline', () => {
        showMessage('offline');
    });
});
