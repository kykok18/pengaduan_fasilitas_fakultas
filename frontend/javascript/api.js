/* ============================================================
   API.JS — Integrasi Frontend dengan Backend PHP
   ============================================================ */

// Deteksi lingkungan frontend.
const IS_LOCAL = ["localhost", "127.0.0.1"].includes(window.location.hostname);

// Pilih backend berdasarkan lingkungan.
const API_BASE_URL = IS_LOCAL
  ? "http://localhost:8000/backend/api"
  : "https://pengaduan-fasilitas-backend.onrender.com/api";

/**
 * Fungsi utama untuk mengirim request ke API.
 */
async function apiRequest(endpoint, body = null, method = "POST") {
  try {
    const options = {
      method,
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
    };

    if (body !== null && method !== "GET") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);

    const responseText = await response.text();

    let result;

    try {
      result = JSON.parse(responseText);
    } catch {
      console.error("API mengembalikan respons non-JSON:", {
        url: `${API_BASE_URL}/${endpoint}`,
        httpStatus: response.status,
        response: responseText.slice(0, 500),
      });

      return {
        ok: false,
        status: "error",
        message: `Respons server tidak valid (HTTP ${response.status}).`,
        data: null,
        httpStatus: response.status,
      };
    }

    return {
      ok: response.ok && result.status === "success",
      status: result.status || "error",
      message:
        result.message ||
        (response.ok
          ? "Permintaan selesai."
          : `Permintaan gagal (HTTP ${response.status}).`),
      data: result.data ?? null,
      httpStatus: response.status,
    };
  } catch (error) {
    console.error("Gagal menghubungi API:", error);

    return {
      ok: false,
      status: "error",
      message: "Tidak dapat terhubung ke server. Periksa koneksi dan server.",
      data: null,
      httpStatus: 0,
    };
  }
}

/**
 * Registrasi pengguna.
 */
async function apiRegister(nama, email, password, confirmPassword) {
  return apiRequest("registrasi.php", {
    nama,
    email,
    password,
    confirm_password: confirmPassword,
  });
}

/**
 * Login pengguna.
 */
async function apiLogin(email, password) {
  return apiRequest("login.php", {
    email,
    password,
  });
}

/**
 * Logout pengguna.
 */
async function apiLogout() {
  return apiRequest("logout.php", {});
}

/**
 * Mengambil data dashboard.
 */
async function apiGetDashboard() {
  return apiRequest("dashboard.php", null, "GET");
}

/**
 * Menyimpan data pengguna ke localStorage.
 */
function saveUserSession(user) {
  if (!user || typeof user !== "object") {
    console.error("Data pengguna tidak valid.");
    return;
  }

  localStorage.setItem("user", JSON.stringify(user));
}

/**
 * Menghapus data pengguna dari localStorage.
 */
function clearUserSession() {
  localStorage.removeItem("user");
}
