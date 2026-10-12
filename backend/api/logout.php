<?php

require_once __DIR__ . '/../app/Helpers/response.php';

// Mulai session jika belum aktif
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Pastikan pengguna sudah login
if (!isset($_SESSION['id_user'])) {
    errorResponse("Pengguna belum login", 401);
}

// Hapus seluruh data session
$_SESSION = [];

// Hapus cookie session jika menggunakan cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params['path'],
        $params['domain'],
        $params['secure'],
        $params['httponly']
    );
}

// Hancurkan session
session_destroy();

// Kirim respons berhasil
successResponse("Logout berhasil");