
/* ============================================================
   LOGIN ADMIN — US-11B-FE
   FITK SIBER AHSAN
   VALIDASI SESUAI FIGMA
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
        !loginButton ||
        !loginButtonText ||
        !loginSpinner ||
        !loginMessage ||
        !emailError ||
        !passwordError
    ) {
        console.error(
            "Elemen Login Admin tidak lengkap. Periksa HTML."
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
    // 4. VALIDASI SESUAI FIGMA
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

    // Menampilkan error tepat di bawah input E-mail
    function showEmailError(message = "E-mail wajib diisi.") {
        emailInput.classList.add("is-invalid");

        emailInput.setAttribute(
            "aria-invalid",
            "true"
        );

        const errorText = emailError.querySelector("span");

        if (errorText) {
            errorText.textContent = message;
        }

        emailError.hidden = false;
    }

    // Menampilkan error tepat di bawah input Password
    function showPasswordError(
        message = "Password wajib diisi."
    ) {
        passwordWrapper.classList.add("is-invalid");

        passwordInput.setAttribute(
            "aria-invalid",
            "true"
        );

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

        // KONDISI 1:
        // E-mail dan Password sama-sama kosong
        if (!email && !password) {
            showEmailError();
            showPasswordError();

            emailInput.focus();
            return false;
        }

        // KONDISI 2:
        // Hanya E-mail yang kosong
        if (!email) {
            showEmailError();

            emailInput.focus();
            return false;
        }

        // KONDISI 3:
        // Hanya Password yang kosong
        if (!password) {
            showPasswordError();

            passwordInput.focus();
            return false;
        }

        // Validasi panjang E-mail
        if (new TextEncoder().encode(email).length > 254) {
            showEmailError(
                "E-mail maksimal 254 karakter."
            );

            emailInput.focus();
            return false;
        }

        // Validasi format E-mail
        if (!emailInput.checkValidity()) {
            showEmailError(
                "Format E-mail tidak valid."
            );

            emailInput.focus();
            return false;
        }

        // Validasi panjang Password
        if (
            new TextEncoder().encode(password).length > 100
        ) {
            showPasswordError(
                "Password maksimal 100 karakter."
            );

            passwordInput.focus();
            return false;
        }

        // Validasi karakter kontrol Password
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
    // 5. HAPUS ERROR PER FIELD SAAT DIKETIK
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
    // 6. SHOW / HIDE PASSWORD
    // ========================================================

    togglePassword?.addEventListener("click", () => {
        const isHidden =
            passwordInput.type === "password";

        passwordInput.type =
            isHidden ? "text" : "password";

        togglePassword.setAttribute(
            "aria-pressed",
            String(isHidden)
        );

        togglePassword.setAttribute(
            "aria-label",
            isHidden
                ? "Sembunyikan password"
                : "Tampilkan password"
        );

        passwordInput.focus();
    });

    // ========================================================
    // 7. LOADING TOMBOL LOGIN
    // ========================================================

    function setLoading(loading) {
        loginButton.disabled = loading;

        loginButton.classList.toggle(
            "is-loading",
            loading
        );

        loginButtonText.textContent =
            loading ? "Loading..." : "Login";

        // Spinner tidak ditampilkan sesuai Figma
        loginSpinner.hidden = true;

        loginButton.setAttribute(
            "aria-busy",
            String(loading)
        );
    }

    // ========================================================
    // 8. PROSES LOGIN ADMIN
    // ========================================================

    loginForm.addEventListener(
        "submit",
        async (event) => {
            event.preventDefault();

            if (isSubmitting || isRedirecting) {
                return;
            }

            // Validasi sebelum menghubungi API
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

                // Login melalui API backend
                const result = await apiLoginAdmin(
                    email,
                    password
                );

                // ============================================
                // LOGIN BERHASIL
                // ============================================

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

                    // Pertahankan tombol loading
                    setLoading(true);

                    window.setTimeout(() => {
                        window.location.replace(
                            ADMIN_REDIRECT
                        );
                    }, 1800);

                    return;
                }

                // ============================================
                // LOGIN DITOLAK
                // ============================================

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
        }
    );
});
