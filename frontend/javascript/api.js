
/* ============================================================
   API.JS — Integrasi Frontend dengan Backend PHP
   ============================================================ */

// Menentukan alamat utama API berdasarkan lokasi website.
const API_BASE_URL = `${window.location.origin}${
  window.location.pathname.startsWith("/pengaduan_fasilitas_fakultas/")
    ? "/pengaduan_fasilitas_fakultas/backend/api"
    : "/backend/api"
}`;


// ============================================================
// FUNGSI UTAMA PEMANGGILAN API
// ============================================================

// Fungsi ini digunakan oleh halaman Login, Registrasi,
// Logout, dan Dashboard untuk berkomunikasi dengan backend.
async function apiRequest(endpoint, body = null, method = "POST") {
  try {

    // Menyiapkan jenis request, format respons, dan cookie.
    // same-origin berarti cookie sesi dapat dikirim
    // jika frontend dan endpoint API berada pada origin yang sama.
    const options = {
      method,
      headers: {
        Accept: "application/json",
      },
      credentials: "same-origin",
    };

    // Jika request membawa data dan bukan GET,
    // data diubah menjadi format JSON untuk dikirim.
    if (body !== null && method !== "GET") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(body);
    }

    // Mengirim request ke endpoint backend menggunakan fetch().
    // await menunggu respons dari server sebelum melanjutkan proses.
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, options);

    // Baca respons sebagai teks terlebih dahulu agar error HTML
    // tidak langsung menimbulkan SyntaxError yang membingungkan.
    const responseText = await response.text();

    let result;

    // Memeriksa apakah respons server berupa JSON yang valid.
    try {
      result = JSON.parse(responseText);

    } catch {

      // Jika respons bukan JSON, catat informasi error
      // untuk membantu pemeriksaan melalui Console browser.
      console.error("API mengembalikan respons non-JSON:", {
        url: `${API_BASE_URL}/${endpoint}`,
        httpStatus: response.status,
        response: responseText.slice(0, 500),
      });

      // Mengembalikan respons gagal dalam format yang konsisten.
      return {
        ok: false,
        status: "error",
        message: `Respons server tidak valid (HTTP ${response.status}).`,
        data: null,
        httpStatus: response.status,
      };
    }

    // Mengembalikan hasil API dengan struktur yang sama,
    // agar lebih mudah digunakan oleh setiap halaman frontend.
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

    // Menangani kegagalan request, misalnya server tidak
    // dapat dihubungi atau terjadi masalah jaringan.
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


// ============================================================
// REGISTRASI PENGGUNA
// ============================================================

/**
 * Registrasi pengguna.
 */
async function apiRegister(nama, email, password, confirmPassword) {

  // Mengirim data pengguna ke registrasi.php melalui POST.
  // Nama field disesuaikan dengan yang dibutuhkan backend.
  return apiRequest("registrasi.php", {
    nama,
    email,
    password,
    confirm_password: confirmPassword,
  });
}


// ============================================================
// LOGIN PENGGUNA
// ============================================================

/**
 * Login pengguna.
 */
async function apiLogin(email, password) {

  // Mengirim email dan password ke endpoint login.php.
  // Backend memverifikasi akun dan mengelola sesi login.
  return apiRequest("login.php", {
    email,
    password,
  });
}


// ============================================================
// LOGOUT PENGGUNA
// ============================================================

/**
 * Logout pengguna.
 */
async function apiLogout() {

  // Mengirim permintaan logout ke backend.
  // Pengakhiran PHP Session menjadi tanggung jawab backend.
  return apiRequest("logout.php", {});
}


// ============================================================
// MENGAMBIL DATA DASHBOARD
// ============================================================

/**
 * Mengambil data dashboard.
 *
 * Catatan: gunakan fungsi ini hanya jika dashboard.php memang
 * mengizinkan request GET.
 */
async function apiGetDashboard(params = {}) {

    // Menyiapkan parameter pencarian, status, dan pagination.
    // URLSearchParams mengubah parameter menjadi query string.
    const query = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 5,
        search: params.search || '',
        status: params.status === 'semua' ? '' : (params.status || '')
    });

    // Mengambil data dashboard menggunakan metode GET.
    // Parameter dikirim melalui URL, bukan body JSON.
    return apiRequest(`dashboard.php?${query.toString()}`, null, "GET");
}


// ============================================================
// PENYIMPANAN DATA PENGGUNA DI BROWSER
// ============================================================

/**
 * Menyimpan data pengguna ke localStorage.
 */
function saveUserSession(user) {

  // Memastikan data pengguna tersedia dan berupa objek.
  // Jika tidak sesuai, proses penyimpanan dihentikan.
  if (!user || typeof user !== "object") {
    console.error("Data pengguna tidak valid.");
    return;
  }

  // Menyimpan data pengguna di browser sebagai JSON.
  // localStorage berbeda dengan PHP Session di backend.
  localStorage.setItem("user", JSON.stringify(user));
}


/**
 * Menghapus data pengguna dari localStorage.
 */
function clearUserSession() {

  // Menghapus informasi pengguna yang disimpan frontend.
  // Ini tidak otomatis menghapus PHP Session dari server.
  localStorage.removeItem("user");
}


/* Mengambil data sesi pengguna dari localStorage */
function getUserSession() {

    // Membaca data pengguna yang sebelumnya disimpan.
    const userData = localStorage.getItem("user");

    // Jika belum ada data pengguna, kembalikan null.
    if (!userData) {
        return null;
    }

    try {

        // Mengubah JSON yang tersimpan menjadi objek JavaScript.
        return JSON.parse(userData);

    } catch (error) {

        // Jika data rusak atau tidak valid, hapus dari browser.
        console.error("Data sesi pengguna tidak valid:", error);
        localStorage.removeItem("user");
        return null;
    }
}


// ============================================================
// MENGAMBIL PROFIL PENGGUNA
// ============================================================

/* Mengambil profil pengguna dari API */
async function apiGetProfile() {

    // Meminta data profil melalui User.php menggunakan GET.
    return apiRequest("User.php", null, "GET");
}
