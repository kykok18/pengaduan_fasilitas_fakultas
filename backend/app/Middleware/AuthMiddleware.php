<?php

require_once __DIR__ . '/../Helpers/response.php';

class AuthMiddleware
{
    public static function handle()
    {
        // Mulai session jika belum aktif
        if (session_status() === PHP_SESSION_NONE) {
            if (!session_start()) {
                errorResponse(
                    "Gagal memulai session",
                    500
                );
            }
        }

        // Periksa autentikasi pengguna
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