<?php

require_once __DIR__ . '/../Helpers/response.php';

class AuthMiddleware
{
    public static function handle()
    {
        // Mulai session jika belum aktif
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Periksa apakah pengguna sudah login
        if (!isset($_SESSION['id_user'])) {
            errorResponse(
                "Silakan login terlebih dahulu",
                401
            );
        }
    }
}