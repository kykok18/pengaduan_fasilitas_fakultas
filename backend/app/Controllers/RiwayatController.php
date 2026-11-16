<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/Riwayat.php';
require_once __DIR__ . '/../Models/Pengaduan.php';
require_once __DIR__ . '/../Helpers/response.php';

class RiwayatController
{
    private $userModel;
    private $riwayatModel;
    private $pengaduanModel;

    public function __construct($conn)
    {
        $this->userModel = new User($conn);
        $this->riwayatModel = new Riwayat($conn);
        $this->pengaduanModel = new Pengaduan($conn);
    }

    /**
     * Menampilkan daftar riwayat pengaduan milik pengguna yang login,
     * beserta statistik jumlah pengaduan per status.
     */
    public function index()
    {
        // Identitas pengguna berasal dari session.
        $id_user = (int) $_SESSION['id_user'];

        // Mengambil profil pengguna.
        $user = $this->userModel->findById($id_user);

        if ($user === false) {
            errorResponse('Gagal mengambil data pengguna', 500);
        }

        if ($user === null) {
            errorResponse('Pengguna tidak ditemukan', 404);
        }

        // Mengambil parameter pagination.
        $page = filter_input(INPUT_GET, 'page', FILTER_VALIDATE_INT);
        $limit = filter_input(INPUT_GET, 'limit', FILTER_VALIDATE_INT);

        $page = ($page !== false && $page !== null && $page > 0)
            ? $page
            : 1;

        $limit = ($limit !== false && $limit !== null && $limit > 0)
            ? min($limit, 100)
            : 5;

        // Mengambil parameter pencarian dan filter.
        $search = trim($_GET['search'] ?? '');
        $status = trim($_GET['status'] ?? '');

        // Validasi status pengaduan.
        $statusValid = [
            'diajukan',
            'dalam perbaikan',
            'selesai',
            'ditolak'
        ];

        if ($status !== '' && !in_array($status, $statusValid, true)) {
            errorResponse('Status pengaduan tidak valid', 400);
        }

        // Mengambil statistik pengaduan milik pengguna.
        $statistik = $this->riwayatModel->getStatistikByUser($id_user);

        if ($statistik === false) {
            errorResponse('Gagal mengambil data riwayat', 500);
        }

        // Mengambil riwayat pengaduan milik pengguna.
        $hasil = $this->riwayatModel->getPengaduanByUser(
            $id_user,
            $limit,
            $page,
            $search,
            $status
        );

        if ($hasil === false) {
            errorResponse('Gagal mengambil data riwayat', 500);
        }

        successResponse(
            'Riwayat pengaduan berhasil diambil',
            [
                'user' => $user,
                'statistik' => $statistik,
                'pengaduan' => $hasil['data'],
                'pagination' => $hasil['pagination']
            ]
        );
    }

    /**
     * Menampilkan detail satu pengaduan milik pengguna yang login.
     * Struktur data sama dengan detail pengaduan.
     */
    public function detail()
    {
        // Validasi ID pengaduan.
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

        // Pastikan pengaduan dibuat oleh pengguna yang login.
        // Pengaduan milik pengguna lain diperlakukan seperti tidak ada.
        $milikUser = $this->riwayatModel->pengaduanMilikUser(
            $id_pengaduan,
            $id_user
        );

        if ($milikUser === false) {
            errorResponse('Gagal mengambil detail riwayat', 500);
        }

        if ($milikUser === 0) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        $detail = $this->pengaduanModel->getDetailPengaduan(
            $id_pengaduan,
            $id_user
        );

        if ($detail === false) {
            errorResponse('Gagal mengambil detail riwayat', 500);
        }

        if ($detail === null) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        unset($detail['pengaduan']['id_user']);

        successResponse(
            'Detail riwayat pengaduan berhasil diambil',
            $detail
        );
    }
}