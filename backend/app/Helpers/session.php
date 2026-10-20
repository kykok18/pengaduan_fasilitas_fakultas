<?php

function startSecureSession()
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return true;
    }

    if (session_status() !== PHP_SESSION_NONE) {
        error_log('Status session PHP tidak valid.');
        return false;
    }

    ini_set('session.use_strict_mode', '1');
    ini_set('session.use_only_cookies', '1');
    ini_set('session.cookie_httponly', '1');
    ini_set('session.cookie_samesite', 'Lax');

    // Gunakan false untuk HTTP localhost.
    // Aktifkan true ketika aplikasi sudah berjalan melalui HTTPS.
    $secureCookie = false;

    session_set_cookie_params([
        'lifetime' => 0,
        'path' => '/',
        'secure' => $secureCookie,
        'httponly' => true,
        'samesite' => 'Lax'
    ]);

    if (!session_start()) {
        error_log('Gagal memulai session PHP.');
        return false;
    }

    return true;
}
