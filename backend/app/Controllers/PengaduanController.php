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

    private function saveBuktiPengaduan($id_pengaduan, $file)
    {
        if (!isset($file) || !is_array($file)) {
            return null;
        }

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
            errorResponse('Upload file gagal', 400);
        }

        $tmpName = $file['tmp_name'] ?? null;

        if (!$tmpName || !is_uploaded_file($tmpName)) {
            errorResponse('File bukti tidak valid', 400);
        }

        $size = filesize($tmpName);

        if ($size === false || $size <= 0) {
            errorResponse('File bukti tidak valid', 400);
        }

        if ($size > 5 * 1024 * 1024) {
            errorResponse('Ukuran file terlalu besar, maksimal 5 MB', 413);
        }

        $finfo = finfo_open(FILEINFO_MIME_TYPE);
        $mimeType = finfo_file($finfo, $tmpName);
        finfo_close($finfo);

        $allowedMime = ['image/jpeg', 'image/png', 'image/webp'];

        if (!in_array($mimeType, $allowedMime, true)) {
            errorResponse('Tipe file tidak didukung', 415);
        }

        $pengaduan = $this->pengaduanModel->findById((int) $id_pengaduan);

        if ($pengaduan === false) {
            errorResponse('Gagal mengambil data pengaduan', 500);
        }

        if ($pengaduan === null) {
            errorResponse('Pengaduan tidak ditemukan', 404);
        }

        if ((int) $pengaduan['id_user'] !== (int) $_SESSION['id_user']) {
            errorResponse('Anda tidak memiliki akses ke pengaduan ini', 403);
        }

        $extensionMap = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp'
        ];

        $extension = $extensionMap[$mimeType] ?? 'jpg';
        $projectRoot = dirname(__DIR__, 3);
        $targetDir = $projectRoot . '/uploads/pengaduan';

        if (!is_dir($targetDir) && !mkdir($targetDir, 0775, true) && !is_dir($targetDir)) {
            errorResponse('Gagal menyiapkan folder upload', 500);
        }

        $fileName = 'pengaduan_' . (int) $id_pengaduan . '_' . time() . '_' . bin2hex(random_bytes(4)) . '.' . $extension;
        $targetPath = $targetDir . '/' . $fileName;
        $relativePath = 'uploads/pengaduan/' . $fileName;

        if (isset($pengaduan['foto']) && $pengaduan['foto'] && $pengaduan['foto'] !== $relativePath) {
            $oldFile = $projectRoot . '/' . $pengaduan['foto'];

            if (file_exists($oldFile)) {
                @unlink($oldFile);
            }
        }

        if (!move_uploaded_file($tmpName, $targetPath)) {
            errorResponse('Gagal menyimpan file bukti', 500);
        }

        $updated = $this->pengaduanModel->updateFoto((int) $id_pengaduan, $relativePath);

        if ($updated !== true) {
            @unlink($targetPath);
            errorResponse('Gagal memperbarui data pengaduan', 500);
        }

        return $relativePath;
    }

    public function store()
    {
        if (!isset($_SESSION['id_user']) || !is_numeric($_SESSION['id_user'])) {
            errorResponse('Silakan login terlebih dahulu', 401);
        }

        $isMultipart = (
            isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'multipart/form-data') !== false
        ) || isset($_FILES['foto']);

        if ($isMultipart) {
            $input = $_POST;
            $photoFile = null;

            if (isset($_FILES['foto']) && is_array($_FILES['foto'])) {
                $photoFile = $_FILES['foto'];

                if (($photoFile['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
                    $photoFile = null;
                }
            }
        } else {
            $input = json_decode(file_get_contents('php://input'), true);

            if (json_last_error() !== JSON_ERROR_NONE || !is_array($input)) {
                errorResponse('Format JSON tidak valid', 400);
            }
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

        if ($photoFile !== null && !empty($photoFile['name'])) {
            $this->saveBuktiPengaduan((int) $id_pengaduan, $photoFile);
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

    public function uploadFoto()
    {
        if (!isset($_SESSION['id_user']) || !is_numeric($_SESSION['id_user'])) {
            errorResponse('Silakan login terlebih dahulu', 401);
        }

        if (!isset($_POST['id_pengaduan'])) {
            errorResponse('ID pengaduan wajib diisi', 400);
        }

        $id_pengaduan = filter_var($_POST['id_pengaduan'], FILTER_VALIDATE_INT);

        if ($id_pengaduan === false || (int) $id_pengaduan <= 0) {
            errorResponse('ID pengaduan tidak valid', 400);
        }

        if (!isset($_FILES['foto']) || !is_array($_FILES['foto'])) {
            errorResponse('File bukti wajib diunggah', 400);
        }

        $file = $_FILES['foto'];

        if (($file['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
            errorResponse('File bukti wajib diunggah', 400);
        }

        if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
            errorResponse('Upload file gagal', 400);
        }

        $foto = $this->saveBuktiPengaduan((int) $id_pengaduan, $file);

        successResponse('Bukti pengaduan berhasil diunggah', [
            'id_pengaduan' => (int) $id_pengaduan,
            'foto' => $foto
        ]);
    }
}
