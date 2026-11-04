<?php

require_once __DIR__ . '/../Helpers/response.php';
require_once __DIR__ . '/../Helpers/session.php';

class AuthMiddleware
{
    public static function handle()
    {
        if (!startSecureSession()) {
            errorResponse(
                "Gagal memulai session",
                500
            );
        }

        if (
            !isset($_SESSION['id_user']) ||
            !is_numeric($_SESSION['id_user']) ||
            (int) $_SESSION['id_user'] <= 0
        ) {
            errorResponse(
                "Silakan login terlebih dahulu",
                401
            );
        }
    }
}