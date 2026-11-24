
/* ============================================================
   LOGIN ADMIN — US-11B-FE
   FITK SIBER AHSAN
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================================
    // 1. ELEMENT HTML
    // ========================================================

    const loginForm =
        document.getElementById("adminLoginForm");

    const emailInput =
        document.getElementById("adminEmail");

    const passwordInput =
        document.getElementById("adminPassword");

    const togglePassword =
        document.getElementById("toggleAdminPassword");

    const eyeOpen =
        document.getElementById("adminEyeOpen");

    const eyeClosed =
        document.getElementById("adminEyeClosed");

    const loginButton =
        document.getElementById("adminLoginButton");

    const loginButtonText =
        document.getElementById("adminLoginButtonText");

    const loginSpinner =
        document.getElementById("adminLoginSpinner");

    const loginMessage =
        document.getElementById("adminLoginMessage");

    const emailError =
        document.getElementById("adminEmailError");

    const passwordError =
        document.getElementById("adminPasswordError");

    const successToast =
        document.getElementById("adminSuccessToast");

    const passwordWrapper =
        passwordInput?.closest(".admin-password-wrapper");

    if (
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !passwordWrapper ||
        !togglePassword ||
        !eyeOpen ||
        !eyeClosed ||
        !loginButton ||
        !loginButtonText ||
        !loginSpinner ||
        !loginMessage ||
        !emailError ||
        !passwordError
    ) {
        console.error(
            "Elemen Login Admin tidak lengkap. Periksa login-admin.html."
        );
        return;
    }

    // ========================================================
    // 2. KONFIGURASI
    // ========================================================

    const ADMIN_REDIRECT = "dashboard-admin.html";

    let isSubmitting = false;
    let isRedirecting = false;

    // ========================================================
    // 3. NOTIFIKASI UMUM / BACKEND
    // ========================================================

    function hideMessage() {
        loginMessage.hidden = true;
        loginMessage.textContent = "";
        loginMessage.classList.remove("is-success");
    }

    function showMessage(message, type = "error") {
        loginMessage.textContent = message;
        loginMessage.hidden = false;

        loginMessage.classList.toggle(
            "is-success",
            type === "success"
        );
    }

    // ========================================================
    // 4. VALIDASI INPUT SESUAI FIGMA
    // ========================================================

    function clearEmailError() {
        emailInput.classList.remove("is-invalid");
        emailInput.removeAttribute("aria-invalid");
        emailError.hidden = true;
    }

    function clearPasswordError() {
        passwordWrapper.classList.remove("is-invalid");
        passwordInput.removeAttribute("aria-invalid");
        passwordError.hidden = true;
    }

    function clearValidation() {
        clearEmailError();
        clearPasswordError();
    }

    function showEmailError(message = "E-mail wajib diisi.") {
        emailInput.classList.add("is-invalid");
        emailInput.setAttribute("aria-invalid", "true");

        const errorText = emailError.querySelector("span");

        if (errorText) {
            errorText.textContent = message;
        }

        emailError.hidden = false;
    }

    function showPasswordError(
        message = "Password wajib diisi."
    ) {
        passwordWrapper.classList.add("is-invalid");
        passwordInput.setAttribute("aria-invalid", "true");

        const errorText = passwordError.querySelector("span");

        if (errorText) {
            errorText.textContent = message;
        }

        passwordError.hidden = false;
    }

    function validateForm() {
        clearValidation();
        hideMessage();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        // Kedua field kosong
        if (!email && !password) {
            showEmailError();
            showPasswordError();
            emailInput.focus();
            return false;
        }

        // E-mail kosong
        if (!email) {
            showEmailError();
            emailInput.focus();
            return false;
        }

        // Password kosong
        if (!password) {
            showPasswordError();
            passwordInput.focus();
            return false;
        }

        // Panjang E-mail maksimal 254 byte
        if (new TextEncoder().encode(email).length > 254) {
            showEmailError("E-mail maksimal 254 karakter.");
            emailInput.focus();
            return false;
        }

        // Format E-mail tidak valid
        if (!emailInput.checkValidity()) {
            showEmailError("Format E-mail tidak valid.");
            emailInput.focus();
            return false;
        }

        // Panjang Password maksimal 100 byte
        if (new TextEncoder().encode(password).length > 100) {
            showPasswordError("Password maksimal 100 karakter.");
            passwordInput.focus();
            return false;
        }

        // Password mengandung karakter kontrol
        if (/[\x00-\x1F\x7F]/.test(password)) {
            showPasswordError(
                "Password mengandung karakter tidak valid."
            );
            passwordInput.focus();
            return false;
        }

        return true;
    }

    // ========================================================
    // 5. HAPUS ERROR SAAT INPUT BERUBAH
    // ========================================================

    emailInput.addEventListener("input", () => {
        clearEmailError();
        hideMessage();
    });

    passwordInput.addEventListener("input", () => {
        clearPasswordError();
        hideMessage();
    });

    // ========================================================
    // 6. SHOW / HIDE PASSWORD — FIGMA
    // ========================================================

    function updatePasswordIcon() {
        const isHidden = passwordInput.type === "password";

        // Password tersembunyi -> ikon mata tertutup
        eyeClosed.hidden = !isHidden;

        // Password terlihat -> ikon mata terbuka
        eyeOpen.hidden = isHidden;

        togglePassword.setAttribute(
            "aria-label",
            isHidden
                ? "Tampilkan password"
                : "Sembunyikan password"
        );

        togglePassword.setAttribute(
            "aria-pressed",
            String(!isHidden)
        );
    }

    togglePassword.addEventListener("click", () => {
        passwordInput.type =
            passwordInput.type === "password"
                ? "text"
                : "password";

        updatePasswordIcon();
        passwordInput.focus();
    });

    // Mengatur ikon ketika halaman pertama dibuka
    updatePasswordIcon();

    // ========================================================
    // 7. LOADING LOGIN — FIGMA
    // ========================================================

    function setLoading(loading) {
        loginButton.disabled = loading;

        loginButton.classList.toggle(
            "is-loading",
            loading
        );

        loginButtonText.textContent =
            loading ? "Loading..." : "Login";

        // Figma tidak menggunakan spinner
        loginSpinner.hidden = true;

        loginButton.setAttribute(
            "aria-busy",
            String(loading)
        );
    }

    // ========================================================
    // 8. PROSES LOGIN ADMIN
    // ========================================================

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSubmitting || isRedirecting) {
            return;
        }

        // Validasi sebelum request API
        if (!validateForm()) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        isSubmitting = true;
        setLoading(true);

        try {
            if (typeof apiLoginAdmin !== "function") {
                throw new Error(
                    "Fungsi API Login Admin tidak tersedia."
                );
            }

            // Backend melakukan autentikasi PHP Session
            const result = await apiLoginAdmin(
                email,
                password
            );

            // ================================================
            // LOGIN BERHASIL
            // ================================================

            if (
                result.ok === true &&
                result.status === "success" &&
                result.data?.role === "admin"
            ) {
                isRedirecting = true;

                hideMessage();
                clearValidation();

                if (successToast) {
                    successToast.hidden = false;
                }

                setLoading(true);

                window.setTimeout(() => {
                    window.location.replace(
                        ADMIN_REDIRECT
                    );
                }, 1800);

                return;
            }

            // ================================================
            // LOGIN DITOLAK / REQUEST GAGAL
            // ================================================

            if (result.ok === true) {
                showMessage(
                    "Respons autentikasi admin tidak valid."
                );
                return;
            }

            switch (result.httpStatus) {
                case 400:
                    showMessage(
                        result.message ||
                        "Data login tidak valid."
                    );
                    break;

                case 401:
                    showMessage(
                        result.message ||
                        "Email atau password salah."
                    );
                    break;

                case 403:
                    showMessage(
                        result.message ||
                        "Akun ini tidak memiliki akses admin."
                    );
                    break;

                case 413:
                    showMessage(
                        "Data login terlalu besar."
                    );
                    break;

                case 500:
                    showMessage(
                        "Terjadi kesalahan pada server. " +
                        "Silakan coba lagi."
                    );
                    break;

                case 0:
                    showMessage(
                        "Tidak dapat terhubung ke server. " +
                        "Periksa koneksi Anda."
                    );
                    break;

                default:
                    showMessage(
                        result.message ||
                        "Login gagal diproses. Silakan coba lagi."
                    );
            }

        } catch (error) {
            console.error(
                "Terjadi kesalahan saat login admin:",
                error
            );

            showMessage(
                "Login gagal diproses. Silakan coba lagi."
            );

        } finally {
            if (!isRedirecting) {
                isSubmitting = false;
                setLoading(false);
            }
        }
    });
});
