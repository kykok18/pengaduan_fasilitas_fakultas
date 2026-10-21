<?php

require_once __DIR__ . '/../Models/Pengaduan.php';
require_once __DIR__ . '/../Helpers/response.php';

class PengaduanController
{
    private $pengaduanModel;

    public function __construct($conn)
    {
        $this->pengaduanModel = new Pengaduan($conn);
    }

    public function listFasilitas()
    {
        $fasilitas = $this->pengaduanModel->getFasilitasList();

        if ($fasilitas === false) {
            errorResponse('Gagal mengambil daftar fasilitas', 500);
        }

        successResponse('Daftar fasilitas berhasil diambil', [
            'fasilitas' => $fasilitas
        ]);
    }

    public function store()
    {
        if (!isset($_SESSION['id_user']) || !is_numeric($_SESSION['id_user'])) {
            errorResponse('Silakan login terlebih dahulu', 401);
        }

        $input = json_decode(file_get_contents('php://input'), true);

        if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
            errorResponse('Format JSON tidak valid', 400);
        }

        $id_fasilitas = filter_var($input['id_fasilitas'] ?? null, FILTER_VALIDATE_INT);
        $judul = trim((string) ($input['judul'] ?? ''));
        $lokasi = trim((string) ($input['lokasi'] ?? ''));
        $deskripsi = trim((string) ($input['deskripsi'] ?? ''));

        if ($id_fasilitas === false || (int) $id_fasilitas <= 0) {
            errorResponse('ID fasilitas tidak valid', 400);
        }

        if ($judul === '') {
            errorResponse('Judul pengaduan wajib diisi', 400);
        }

        if (mb_strlen($judul, 'UTF-8') > 150) {
            errorResponse('Judul pengaduan maksimal 150 karakter', 400);
        }

        if ($lokasi === '') {
            errorResponse('Lokasi wajib diisi', 400);
        }

        if (mb_strlen($lokasi, 'UTF-8') > 255) {
            errorResponse('Lokasi maksimal 255 karakter', 400);
        }

        if ($deskripsi === '') {
            errorResponse('Deskripsi pengaduan wajib diisi', 400);
        }

        $exists = $this->pengaduanModel->fasilitasExists((int) $id_fasilitas);

        if ($exists === false) {
            errorResponse('Gagal memeriksa data fasilitas', 500);
        }

        if ($exists !== true) {
            errorResponse('Fasilitas tidak ditemukan', 404);
        }

        $id_pengaduan = $this->pengaduanModel->create(
            (int) $_SESSION['id_user'],
            (int) $id_fasilitas,
            $judul,
            $lokasi,
            $deskripsi
        );

        if ($id_pengaduan === false) {
            errorResponse('Gagal membuat pengaduan', 500);
        }

        $pengaduan = $this->pengaduanModel->findById((int) $id_pengaduan);

        if ($pengaduan === false) {
            errorResponse('Gagal mengambil data pengaduan yang baru dibuat', 500);
        }

        if ($pengaduan === null) {
            errorResponse('Data pengaduan tidak ditemukan setelah dibuat', 404);
        }

        successResponse('Pengaduan berhasil dibuat', [
            'id_pengaduan' => (int) $pengaduan['id_pengaduan'],
            'id_user' => (int) $pengaduan['id_user'],
            'id_fasilitas' => (int) $pengaduan['id_fasilitas'],
            'judul' => $pengaduan['judul'],
            'lokasi' => $pengaduan['lokasi'],
            'deskripsi' => $pengaduan['deskripsi'],
            'foto' => $pengaduan['foto'],
            'status' => $pengaduan['status'],
            'created_at' => $pengaduan['created_at']
        ], 201);
    }
}
