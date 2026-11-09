<?php

require_once __DIR__ . '/../Models/Komentar.php';
require_once __DIR__ . '/../Helpers/response.php';

class KomentarController
{
    private $komentarModel;

    public function __construct($conn)
    {
        $this->komentarModel = new Komentar($conn);
    }

    /**
     * Mengambil daftar komentar berdasarkan ID pengaduan.
     */
    public function daftarKomentar()
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

        // Pastikan pengaduan tersedia.
        $tersedia = $this->komentarModel->pengaduanExists($id_pengaduan);

        if ($tersedia === false) {
            errorResponse('Gagal mengambil daftar komentar', 500);
        }

        if ($tersedia === 0) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        $daftarKomentar = $this->komentarModel->getDaftarKomentar(
            $id_pengaduan
        );

        if ($daftarKomentar === false) {
            errorResponse('Gagal mengambil daftar komentar', 500);
        }

        successResponse('Daftar komentar berhasil diambil', [
            'id_pengaduan' => (int) $id_pengaduan,
            'total_komentar' => count($daftarKomentar),
            'komentar' => $daftarKomentar
        ]);
    }

    /**
     * Menyimpan komentar baru dari pengguna yang sedang login.
     */
    public function simpanKomentar()
    {
        // Identitas penulis berasal dari session, bukan dari request.
        $id_user = (int) $_SESSION['id_user'];

        // Validasi ID pengaduan.
        $id_pengaduan = filter_var(
            $_POST['id_pengaduan'] ?? null,
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        );

        if ($id_pengaduan === false || $id_pengaduan === null) {
            errorResponse('ID pengaduan tidak valid', 400);
        }

        // Validasi isi komentar.
        $isi_komentar = $_POST['isi_komentar'] ?? null;

        if ($isi_komentar === null) {
            errorResponse('Komentar wajib diisi', 400);
        }

        if (!is_string($isi_komentar)) {
            errorResponse('Komentar tidak valid', 400);
        }

        $isi_komentar = preg_replace(
            '/^[\s\p{Z}]+|[\s\p{Z}]+$/u',
            '',
            $isi_komentar
        );

        if ($isi_komentar === null) {
            errorResponse('Komentar tidak valid', 400);
        }

        if ($isi_komentar === '') {
            errorResponse('Komentar wajib diisi', 400);
        }

        if (mb_strlen($isi_komentar, 'UTF-8') > 1000) {
            errorResponse('Komentar maksimal 1000 karakter', 400);
        }

        // Pastikan pengaduan tersedia.
        $tersedia = $this->komentarModel->pengaduanExists($id_pengaduan);

        if ($tersedia === false) {
            errorResponse('Gagal menyimpan komentar', 500);
        }

        if ($tersedia === 0) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        // Simpan komentar.
        $id_komentar = $this->komentarModel->createKomentar(
            $id_pengaduan,
            $id_user,
            $isi_komentar
        );

        if ($id_komentar === false) {
            errorResponse('Gagal menyimpan komentar', 500);
        }

        // Ambil komentar yang baru tersimpan beserta nama penulis.
        $komentar = $this->komentarModel->getKomentarById($id_komentar);

        if ($komentar === false || $komentar === null) {
            errorResponse('Gagal mengambil data komentar', 500);
        }

        // Ambil jumlah komentar terbaru.
        $totalKomentar = $this->komentarModel->countKomentar($id_pengaduan);

        if ($totalKomentar === false) {
            errorResponse('Gagal mengambil jumlah komentar', 500);
        }

        successResponse(
            'Komentar berhasil disimpan',
            [
                'id_pengaduan' => (int) $id_pengaduan,
                'komentar' => $komentar,
                'total_komentar' => $totalKomentar
            ],
            201
        );
    }
}