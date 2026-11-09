<?php

require_once __DIR__ . '/../Models/Pengaduan.php';
require_once __DIR__ . '/../Helpers/response.php';

class DetailPengaduanController
{
    private $pengaduanModel;

    public function __construct($conn)
    {
        $this->pengaduanModel = new Pengaduan($conn);
    }

    public function detailPengaduan()
    {
        $id_pengaduan = filter_var(
            $_GET['id_pengaduan'] ?? null,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($id_pengaduan === false || $id_pengaduan === null) {
            errorResponse('ID pengaduan tidak valid', 400);
        }

        // Identitas pengguna berasal dari session.
        $id_user = (int) $_SESSION['id_user'];

        $detail = $this->pengaduanModel->getDetailPengaduan(
            $id_pengaduan,
            $id_user
        );

        if ($detail === false) {
            errorResponse('Gagal mengambil detail pengaduan', 500);
        }

        if ($detail === null) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        unset($detail['pengaduan']['id_user']);

        successResponse(
            'Detail pengaduan berhasil diambil',
            $detail
        );
    }
}