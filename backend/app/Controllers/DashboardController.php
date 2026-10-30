<?php

require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Models/Dashboard.php';
require_once __DIR__ . '/../Helpers/response.php';

class DashboardController
{
    private $userModel;
    private $dashboardModel;

    public function __construct($conn)
    {
        $this->userModel = new User($conn);
        $this->dashboardModel = new Dashboard($conn);
    }

    public function index()
    {
        // Identitas pengguna berasal dari session.
        $id_user = $_SESSION['id_user'];

        // Mengambil profil pengguna.
        $user = $this->userModel->findById($id_user);

        if ($user === false) {
            errorResponse("Gagal mengambil data pengguna", 500);
        }

        if ($user === null) {
            errorResponse("Pengguna tidak ditemukan", 404);
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
            'diproses',
            'selesai',
            'ditolak'
        ];

        if ($status !== '' && !in_array($status, $statusValid, true)) {
            errorResponse("Status pengaduan tidak valid", 400);
        }

        // Mengambil pengaduan terbaru seluruh pengguna.
        $hasil = $this->dashboardModel->getPengaduanTerbaru(
            $limit,
            $page,
            $search,
            $status
        );

        if ($hasil === false) {
            errorResponse("Gagal mengambil data pengaduan", 500);
        }

        successResponse(
            "Data dashboard berhasil diambil",
            [
                "user" => $user,
                "pengaduan" => $hasil['data'],
                "pagination" => $hasil['pagination']
            ]
        );
    }
}