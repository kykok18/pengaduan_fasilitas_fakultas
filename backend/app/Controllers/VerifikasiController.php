<?php

require_once __DIR__ . '/../Models/Verifikasi.php';
require_once __DIR__ . '/../Helpers/response.php';

class VerifikasiController
{
    private $verifikasiModel;

    public function __construct($conn)
    {
        $this->verifikasiModel = new Verifikasi($conn);
    }

    /**
     * Menampilkan daftar pengaduan yang berstatus diajukan.
     */
    public function daftarDiajukan()
    {
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

        // Mengambil daftar pengaduan diajukan.
        $hasil = $this->verifikasiModel->getPengaduanDiajukan(
            $limit,
            $page,
            $search,
            $sort
        );

        if ($hasil === false) {
            errorResponse("Gagal mengambil daftar pengaduan diajukan", 500);
        }

        successResponse(
            "Daftar pengaduan diajukan berhasil diambil",
            [
                "pengaduan" => $hasil['data'],
                "pagination" => $hasil['pagination']
            ]
        );
    }

    /**
     * Memproses keputusan admin: menerima atau menolak pengaduan.
     *
     * Urutan pemeriksaan:
     * 1. Format request (Content-Type, ukuran, JSON)
     * 2. Isi request (id_pengaduan, keputusan, keterangan)
     * 3. Pengaduan tersedia dan masih berstatus diajukan
     */
    public function prosesVerifikasi($admin)
    {
        // Request yang mengubah data hanya diterima dalam format JSON.
        $contentType = $_SERVER['CONTENT_TYPE'] ?? '';

        if (stripos($contentType, 'application/json') !== 0) {
            errorResponse("Content-Type harus application/json", 415);
        }

        // Batasi ukuran request agar tidak membebani server.
        $rawBody = file_get_contents("php://input");

        if ($rawBody === false) {
            errorResponse("Gagal membaca data request", 400);
        }

        if (strlen($rawBody) > 8192) {
            errorResponse("Data request terlalu besar", 413);
        }

        // Ambil data JSON dari request.
        $data = json_decode($rawBody, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse("Format JSON tidak valid", 400);
        }

        // Data request harus berupa objek JSON.
        if (!is_array($data) || ($data !== [] && array_is_list($data))) {
            errorResponse("Data request tidak valid", 400);
        }

        // Validasi ID pengaduan.
        $idPengaduan = $data['id_pengaduan'] ?? null;

        if ($idPengaduan === null || $idPengaduan === '') {
            errorResponse("ID pengaduan wajib diisi", 400);
        }

        if (!is_int($idPengaduan) && !is_string($idPengaduan)) {
            errorResponse("ID pengaduan tidak valid", 400);
        }

        $idPengaduan = filter_var(
            $idPengaduan,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($idPengaduan === false) {
            errorResponse("ID pengaduan tidak valid", 400);
        }

        // Validasi keputusan verifikasi.
        $keputusan = $data['keputusan'] ?? null;

        if ($keputusan === null || $keputusan === '') {
            errorResponse("Keputusan verifikasi wajib diisi", 400);
        }

        if (!is_string($keputusan)) {
            errorResponse("Keputusan verifikasi tidak valid", 400);
        }

        $keputusan = strtolower(trim($keputusan));

        // Status baru ditentukan oleh keputusan, bukan oleh request.
        $statusBaruPerKeputusan = [
            'terima' => 'dalam perbaikan',
            'tolak' => 'ditolak'
        ];

        if (!isset($statusBaruPerKeputusan[$keputusan])) {
            errorResponse("Keputusan verifikasi tidak valid", 400);
        }

        $statusBaru = $statusBaruPerKeputusan[$keputusan];

        // Validasi tanggapan (penerimaan) atau alasan (penolakan).
        $label = ($keputusan === 'terima') ? 'Tanggapan' : 'Alasan penolakan';

        $keterangan = $data['keterangan'] ?? null;

        if ($keterangan === null) {
            errorResponse($label . " wajib diisi", 400);
        }

        if (!is_string($keterangan)) {
            errorResponse($label . " tidak valid", 400);
        }

        $keterangan = preg_replace(
            '/^[\s\p{Z}]+|[\s\p{Z}]+$/u',
            '',
            $keterangan
        );

        if ($keterangan === null) {
            errorResponse($label . " tidak valid", 400);
        }

        if ($keterangan === '') {
            errorResponse($label . " wajib diisi", 400);
        }

        if (preg_match('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/', $keterangan)) {
            errorResponse($label . " mengandung karakter yang tidak valid", 400);
        }

        $panjang = mb_strlen($keterangan, 'UTF-8');

        if ($panjang < 5) {
            errorResponse($label . " minimal 5 karakter", 400);
        }

        if ($panjang > 1000) {
            errorResponse($label . " maksimal 1000 karakter", 400);
        }

        // Proses verifikasi. Admin berasal dari session dan database.
        $hasil = $this->verifikasiModel->verifikasi(
            $idPengaduan,
            (int) $admin['id_user'],
            $statusBaru,
            $keterangan
        );

        if ($hasil === false) {
            errorResponse("Gagal memproses verifikasi pengaduan", 500);
        }

        if ($hasil === 'not_found') {
            errorResponse("Pengaduan tidak ditemukan", 404);
        }

        if ($hasil === 'status_tidak_sesuai') {
            errorResponse(
                "Pengaduan tidak dapat diverifikasi karena statusnya bukan diajukan",
                409
            );
        }

        $pesan = ($keputusan === 'terima')
            ? "Pengaduan berhasil diterima"
            : "Pengaduan berhasil ditolak";

        successResponse($pesan, [
            "id_pengaduan" => (int) $idPengaduan,
            "status" => $statusBaru,
            "status_sebelumnya" => "diajukan",
            "penanganan" => $hasil,
            "diverifikasi_oleh" => [
                "id_user" => (int) $admin['id_user'],
                "nama" => $admin['nama']
            ]
        ]);
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