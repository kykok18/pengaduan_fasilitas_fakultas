
const API_BASE_URL = "http://localhost:8000/backend/api";

async function apiRegister(nama, email, password, confirmPassword) {
    try {
        const response = await fetch(
            `${API_BASE_URL}/registrasi.php`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    nama: nama,
                    email: email,
                    password: password,
                    confirm_password: confirmPassword
                })
            }
        );

        const data = await response.json();

        return {
            ok: response.ok,
            status: data.status,
            message: data.message || "Terjadi kesalahan.",
            data: data.data ?? null
        };

    } catch (error) {
        console.error("Error API registrasi:", error);

        return {
            ok: false,
            status: "error",
            message:
                "Tidak dapat terhubung ke server. Periksa koneksi backend."
        };
    }
}
