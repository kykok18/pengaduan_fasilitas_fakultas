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

        // Ambil profil pengguna yang sedang login.
        $user = $this->userModel->findById($id_user);

        if ($user === false) {
            errorResponse("Gagal mengambil data pengguna", 500);
        }

        if ($user === null) {
            errorResponse("Pengguna tidak ditemukan", 404);
        }

        // Ambil pengaduan terbaru dari seluruh pengguna.
        $pengaduan = $this->dashboardModel
            ->getPengaduanTerbaru(5);

        if ($pengaduan === false) {
            errorResponse("Gagal mengambil data pengaduan", 500);
        }

        successResponse(
            "Data dashboard berhasil diambil",
            [
                "user" => $user,
                "pengaduan" => $pengaduan
            ]
        );
    }
}
