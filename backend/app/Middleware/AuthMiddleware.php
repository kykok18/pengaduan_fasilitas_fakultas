<?php

require_once __DIR__ . '/../Helpers/response.php';
require_once __DIR__ . '/../Helpers/session.php';

class AuthMiddleware
{
    public static function handle()
    {
        // Mulai session dengan konfigurasi keamanan.
        if (!startSecureSession()) {
            errorResponse(
                "Gagal memulai session",
                500
            );
        }

        // Periksa autentikasi pengguna.
        if (
            !isset($_SESSION['id_user']) ||
            !is_numeric($_SESSION['id_user'])
        ) {
            errorResponse(
                "Silakan login terlebih dahulu",
                401
            );
        }
    }
}
