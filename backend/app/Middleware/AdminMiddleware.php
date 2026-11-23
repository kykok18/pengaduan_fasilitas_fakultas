<?php

require_once __DIR__ . '/AuthMiddleware.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/response.php';

class AdminMiddleware
{
    /**
     * Memastikan pengguna sudah login dan memiliki role admin.
     *
     * Role diperiksa ulang ke database, tidak hanya dari session,
     * agar perubahan role langsung berlaku tanpa menunggu session berakhir.
     *
     * Mengembalikan data admin yang sedang login.
     */
    public static function handle($conn)
    {
        // Pastikan session valid
        AuthMiddleware::handle();

        // Pemeriksaan cepat dari session
        if (($_SESSION['role'] ?? '') !== 'admin') {
            errorResponse(
                "Akun ini tidak memiliki akses admin",
                403
            );
        }

        // Pemeriksaan ulang role dari database
        $userModel = new User($conn);
        $user = $userModel->findById((int) $_SESSION['id_user']);

        if ($user === false) {
            errorResponse(
                "Terjadi kesalahan pada server",
                500
            );
        }

        if ($user === null) {
            errorResponse(
                "Silakan login terlebih dahulu",
                401
            );
        }

        if ($user['role'] !== 'admin') {
            errorResponse(
                "Akun ini tidak memiliki akses admin",
                403
            );
        }

        return $user;
    }
}
