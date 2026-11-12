<?php

require_once __DIR__ . '/../Models/Riwayat.php';
require_once __DIR__ . '/../Helpers/response.php';

class RiwayatController
{
    private $riwayatModel;

    public function __construct($conn)
    {
        $this->riwayatModel = new Riwayat($conn);
    }

    public function index()
    {
        // Identitas pengguna berasal dari session.
        $id_user = (int) $_SESSION['id_user'];

        // Hanya mahasiswa/pegawai (role user) yang dapat mengakses.
        if (($_SESSION['role'] ?? '') !== 'user') {
            errorResponse(
                "Anda tidak memiliki akses untuk melihat riwayat pengaduan",
                403
            );
        }

        // Mengambil riwayat berdasarkan pemilik pengaduan.
        $riwayat = $this->riwayatModel->getPengaduanByUser($id_user);

        if ($riwayat === false) {
            errorResponse(
                "Gagal mengambil riwayat pengaduan",
                500
            );
        }

        // Mengembalikan daftar riwayat.
        successResponse(
            "Riwayat pengaduan berhasil diambil",
            [
                "total_riwayat" => count($riwayat),
                "riwayat" => $riwayat
            ]
        );
    }
}
