const API_BASE_URL = "/backend/api";

async function apiRequest(endpoint, body) {
    try {
        const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify(body)
        });
        const data = await response.json();
        return {
            ok: response.ok,
            status: data.status,
            message: data.message || "Terjadi kesalahan.",
            data: data.data ?? null
        };
    } catch (error) {
        console.error("Error API:", error);
        return { ok: false, status: "error", message: "Tidak dapat terhubung ke server." };
    }
}

async function apiRegister(nama, email, password, confirmPassword) {
    return apiRequest("registrasi.php", {
        nama,
        email,
        password,
        confirm_password: confirmPassword
    });
}

async function apiLogin(email, password) {
    return apiRequest("login.php", { email, password });
}

function saveUserSession(user) {
    localStorage.setItem("user", JSON.stringify(user));
}
