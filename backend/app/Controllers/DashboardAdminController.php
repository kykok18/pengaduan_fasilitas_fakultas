<?php

require_once __DIR__ . '/../Models/DashboardAdmin.php';
require_once __DIR__ . '/../Helpers/response.php';

class DashboardAdminController
{
    private $dashboardAdminModel;

    public function __construct($conn)
    {
        $this->dashboardAdminModel = new DashboardAdmin($conn);
    }

    /**
     * Menampilkan data dashboard admin:
     * ringkasan jumlah pengaduan per status dan daftar pengaduan
     * sesuai status (tab) yang dipilih.
     */
    public function index($admin)
    {
        // Validasi status pengaduan.
        $status = $_GET['status'] ?? '';

        if (!is_string($status)) {
            errorResponse("Status pengaduan tidak valid", 400);
        }

        // 'dalam_perbaikan' diterima sebagai penulisan lain
        // dari 'dalam perbaikan'.
        $status = str_replace('_', ' ', strtolower(trim($status)));

        // Tab bawaan adalah Dalam Perbaikan.
        if ($status === '') {
            $status = 'dalam perbaikan';
        }

        $statusValid = [
            'dalam perbaikan',
            'selesai',
            'ditolak'
        ];

        if (!in_array($status, $statusValid, true)) {
            errorResponse("Status pengaduan tidak valid", 400);
        }

        // Validasi parameter pagination.
        $page = $this->bacaParameterAngka(
            'page',
            1,
            1,
            1000000,
            "Parameter page tidak valid"
        );

        $limit = $this->bacaParameterAngka(
            'limit',
            10,
            1,
            100,
            "Parameter limit tidak valid"
        );

        // Validasi urutan data.
        $sort = $_GET['sort'] ?? 'terbaru';

        if ($sort === '') {
            $sort = 'terbaru';
        }

        if (!is_string($sort) || !in_array($sort, ['terbaru', 'terlama'], true)) {
            errorResponse("Parameter sort tidak valid", 400);
        }

        // Validasi kata kunci pencarian.
        $search = $_GET['search'] ?? '';

        if (!is_string($search)) {
            errorResponse("Kata kunci pencarian tidak valid", 400);
        }

        $search = trim($search);

        if (mb_strlen($search, 'UTF-8') > 100) {
            errorResponse("Kata kunci pencarian maksimal 100 karakter", 400);
        }

        // Mengambil jumlah pengaduan per status.
        // Jumlah tidak dipengaruhi status tab, pencarian, dan halaman.
        $ringkasan = $this->dashboardAdminModel->getRingkasan();

        if ($ringkasan === false) {
            errorResponse("Gagal mengambil data dashboard admin", 500);
        }

        // Mengambil daftar pengaduan sesuai status dan pencarian.
        $hasil = $this->dashboardAdminModel->getPengaduanByStatus(
            $status,
            $limit,
            $page,
            $search,
            $sort
        );

        if ($hasil === false) {
            errorResponse("Gagal mengambil data dashboard admin", 500);
        }

        successResponse(
            "Data dashboard admin berhasil diambil",
            [
                "user" => $admin,
                "ringkasan" => $ringkasan,
                "pengaduan" => $hasil['data'],
                "pagination" => $hasil['pagination']
            ]
        );
    }

    /**
     * Membaca parameter angka dari query string.
     * Mengembalikan nilai default jika parameter tidak dikirim.
     */
    private function bacaParameterAngka($nama, $default, $min, $max, $pesan)
    {
        if (!isset($_GET[$nama]) || $_GET[$nama] === '') {
            return $default;
        }

        $nilai = $_GET[$nama];

        if (!is_string($nilai)) {
            errorResponse($pesan, 400);
        }

        $angka = filter_var(
            $nilai,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => $min, 'max_range' => $max]]
        );

        if ($angka === false) {
            errorResponse($pesan, 400);
        }

        return $angka;
    }
}
