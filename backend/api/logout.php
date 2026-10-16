<?php

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../app/Helpers/response.php';

// Logout hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    errorResponse('Method not allowed', 405);
}

// Mulai session jika belum aktif
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Pastikan pengguna sudah login
if (!isset($_SESSION['id_user'])) {
    errorResponse('Pengguna belum login', 401);
}

// Hapus seluruh data session
$_SESSION = [];

// Hapus cookie session jika menggunakan cookie
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();

    setcookie(
        session_name(),
        '',
        [
            'expires' => time() - 42000,
            'path' => $params['path'],
            'domain' => $params['domain'],
            'secure' => $params['secure'],
            'httponly' => $params['httponly'],
            'samesite' => $params['samesite'] ?? 'Lax'
        ]
    );
}

// Hancurkan session
session_destroy();

// Kirim respons berhasil
successResponse('Logout berhasil');