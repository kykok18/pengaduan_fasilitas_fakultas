
/* ============================================================
   LOGIN ADMIN — US-11B-FE
   FITK SIBER AHSAN

   Endpoint:
   POST /backend/api/login-admin.php

   Autentikasi:
   PHP Session oleh backend
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ========================================================
    // 1. ELEMENT HALAMAN
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

    const successToast =
    document.getElementById("adminSuccessToast");


    if (
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !loginButtonText ||
        !loginSpinner ||
        !loginMessage
    ) {
        console.error(
            "Elemen halaman Login Admin tidak lengkap."
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
    // 3. NOTIFIKASI
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
    // 4. VALIDASI INPUT
    // ========================================================

    function clearValidation() {
        emailInput.classList.remove("is-invalid");

        const passwordWrapper =
            passwordInput.closest(".admin-password-wrapper");

        passwordWrapper?.classList.remove("is-invalid");

        emailInput.removeAttribute("aria-invalid");
        passwordInput.removeAttribute("aria-invalid");
    }


    function markInvalid(input) {
        input.setAttribute("aria-invalid", "true");

        if (input === passwordInput) {
            input.closest(".admin-password-wrapper")
                ?.classList.add("is-invalid");
        } else {
            input.classList.add("is-invalid");
        }

        input.focus();
    }


    function validateForm() {
        clearValidation();

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email && !password) {
            showMessage("Email dan password harus diisi");
            markInvalid(emailInput);
            return false;
        }

        if (!email) {
            showMessage("Email harus diisi");
            markInvalid(emailInput);
            return false;
        }

        if (!password) {
            showMessage("Password harus diisi");
            markInvalid(passwordInput);
            return false;
        }

        if (new TextEncoder().encode(email).length > 254) {
            showMessage("Email maksimal 254 karakter");
            markInvalid(emailInput);
            return false;
        }

        if (!emailInput.checkValidity()) {
            showMessage("Format email tidak valid");
            markInvalid(emailInput);
            return false;
        }

        // PHP strlen() menghitung byte, bukan jumlah karakter.
        if (new TextEncoder().encode(password).length > 100) {
            showMessage("Password maksimal 100 karakter");
            markInvalid(passwordInput);
            return false;
        }

        if (/[\x00-\x1F\x7F]/.test(password)) {
            showMessage(
                "Password mengandung karakter yang tidak valid"
            );

            markInvalid(passwordInput);
            return false;
        }

        return true;
    }


    // ========================================================
    // 5. SHOW / HIDE PASSWORD
    // ========================================================

    togglePassword?.addEventListener("click", () => {

        const isHidden =
            passwordInput.type === "password";

        passwordInput.type = isHidden
            ? "text"
            : "password";

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
    // 6. LOADING LOGIN
    // ========================================================

    function setLoading(loading) {
        isSubmitting = loading;

        loginButton.disabled = loading;
        emailInput.readOnly = loading;
        passwordInput.readOnly = loading;

        if (togglePassword) {
            togglePassword.disabled = loading;
        }

        loginSpinner.hidden = !loading;

        loginButtonText.textContent =
            loading ? "Memproses..." : "Login";

        loginForm.setAttribute(
            "aria-busy",
            String(loading)
        );
    }


    // ========================================================
    // 7. HAPUS PESAN SAAT INPUT BERUBAH
    // ========================================================

    emailInput.addEventListener("input", () => {
        hideMessage();
        clearValidation();
    });

    passwordInput.addEventListener("input", () => {
        hideMessage();
        clearValidation();
    });


    // ========================================================
    // 8. KIRIM LOGIN ADMIN KE BACKEND
    // ========================================================

    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        if (isSubmitting) {
            return;
        }

        hideMessage();

        // Tidak mengirim request jika input tidak valid.
        if (!validateForm()) {
            return;
        }

        const email = emailInput.value.trim();
        const password = passwordInput.value;

        setLoading(true);

        try {

            if (typeof apiLoginAdmin !== "function") {
                throw new Error(
                    "Fungsi API Login Admin tidak tersedia."
                );
            }

            const result = await apiLoginAdmin(
                email,
                password
            );


            
// =================================================
// LOGIN BERHASIL — NOTIFIKASI FIGMA
// =================================================

if (
    result.ok === true &&
    result.status === "success" &&
    result.data?.role === "admin"
) {
    // Backend sudah memverifikasi kredensial,
    // role admin, dan membuat PHP Session.

    isRedirecting = true;

    // Sembunyikan pesan error sebelumnya.
    hideMessage();

    // Tampilkan notifikasi berhasil sesuai Figma.
    if (successToast) {
        successToast.hidden = false;
    }

    // Pertahankan loading agar tidak ada
    // pengiriman formulir kedua.
    setLoading(true);

    // Berikan waktu notifikasi terlihat,
    // kemudian arahkan ke Dashboard Admin.
    window.setTimeout(() => {
        window.location.replace(ADMIN_REDIRECT);
    }, 1800);

    return;
}



            // =================================================
            // LOGIN DITOLAK / REQUEST GAGAL
            // =================================================

            if (result.ok === true) {
                // Respons sukses tanpa konfirmasi role admin
                // tidak boleh digunakan untuk redirect.
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
                        "Periksa koneksi internet Anda."
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
        setLoading(false);
    }
}

    });

});
