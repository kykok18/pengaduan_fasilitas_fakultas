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

    public function BuatPengaduan()
    {
        // 1. Validasi sesi pengguna.
        if (
            !isset($_SESSION['id_user']) ||
            filter_var($_SESSION['id_user'], FILTER_VALIDATE_INT) === false ||
            (int) $_SESSION['id_user'] <= 0
        ) {
            errorResponse('Silakan login terlebih dahulu', 401);
        }

        $id_user = (int) $_SESSION['id_user'];

        // Lepaskan session lock PHP agar request lain dari user
        // yang sama bisa mencapai pengecekan lock database.
        if (session_status() === PHP_SESSION_ACTIVE) {
            session_write_close();
        }

        // 2. Ambil lock berdasarkan user.
        $lockStatus = $this->pengaduanModel->acquirePengaduanLock(
            $id_user
        );

        if ($lockStatus === false) {
            errorResponse(
                'Gagal memeriksa proses pengaduan. Silakan coba lagi.',
                500
            );
        }

        if ($lockStatus !== 1) {
            errorResponse(
                'Pengaduan Anda sedang diproses. Tunggu hingga selesai.',
                409
            );
        }

        // Daftarkan pelepasan lock segera setelah lock berhasil didapat.
        $model = $this->pengaduanModel;

        register_shutdown_function(
            function () use ($model, $id_user) {
                $model->releasePengaduanLock($id_user);
            }
        );

        // 3. Daftarkan pelepasan lock saat request berakhir.
        // Tetap dijalankan meskipun successResponse/errorResponse
        // memanggil exit().
        $model = $this->pengaduanModel;

        register_shutdown_function(
            function () use ($model, $id_user) {
                $model->releasePengaduanLock($id_user);
            }
        );

        // 4. Pastikan request menggunakan multipart/form-data.
        if (empty($_POST) && empty($_FILES)) {
            errorResponse(
                'Data kosong. Gunakan multipart/form-data dan sertakan foto.',
                400
            );
        }

        $input = $_POST;

        // 5. Validasi ID fasilitas.
        $id_fasilitas = filter_var(
            $input['id_fasilitas'] ?? null,
            FILTER_VALIDATE_INT
        );

        // Mendukung field kategori dari frontend lama.
        if (
            ($id_fasilitas === false ||
                $id_fasilitas === null ||
                (int) $id_fasilitas <= 0) &&
            isset($input['kategori']) &&
            is_string($input['kategori'])
        ) {
            $kategori = trim($input['kategori']);

            if ($kategori !== '') {
                $kategoriId = filter_var(
                    $kategori,
                    FILTER_VALIDATE_INT
                );

                if ($kategoriId !== false && $kategoriId > 0) {
                    $id_fasilitas = $kategoriId;
                } else {
                    $fasilitasByNama =
                        $this->pengaduanModel->findByNamaFasilitas(
                            $kategori
                        );

                    if ($fasilitasByNama === false) {
                        errorResponse(
                            'Gagal memeriksa data fasilitas',
                            500
                        );
                    }

                    if ($fasilitasByNama !== null) {
                        $id_fasilitas =
                            (int) $fasilitasByNama['id_fasilitas'];
                    }
                }
            }
        }

        // Mendukung field ID fasilitas lama.
        if (
            ($id_fasilitas === false ||
                $id_fasilitas === null ||
                (int) $id_fasilitas <= 0) &&
            isset($input['id_fasilitas_legacy'])
        ) {
            $id_fasilitas = filter_var(
                $input['id_fasilitas_legacy'],
                FILTER_VALIDATE_INT
            );
        }

        if (
            $id_fasilitas === false ||
            $id_fasilitas === null ||
            (int) $id_fasilitas <= 0
        ) {
            errorResponse('ID fasilitas tidak valid', 400);
        }

        // 6. Validasi input teks.
        foreach (['judul', 'lokasi', 'deskripsi'] as $field) {
            if (
                isset($input[$field]) &&
                !is_string($input[$field])
            ) {
                errorResponse(
                    ucfirst($field) . ' harus berupa teks',
                    400
                );
            }
        }

        $judul = preg_replace(
            '/^[\s\p{Z}]+|[\s\p{Z}]+$/u',
            '',
            $input['judul'] ?? ''
        );

        $lokasi = preg_replace(
            '/^[\s\p{Z}]+|[\s\p{Z}]+$/u',
            '',
            $input['lokasi'] ?? ''
        );

        $deskripsi = preg_replace(
            '/^[\s\p{Z}]+|[\s\p{Z}]+$/u',
            '',
            $input['deskripsi'] ?? ''
        );

        if ($judul === '') {
            errorResponse('Judul pengaduan wajib diisi', 400);
        }

        if (mb_strlen($judul, 'UTF-8') > 150) {
            errorResponse(
                'Judul pengaduan maksimal 150 karakter',
                400
            );
        }

        if ($lokasi === '') {
            errorResponse('Lokasi wajib diisi', 400);
        }

        if (mb_strlen($lokasi, 'UTF-8') > 255) {
            errorResponse(
                'Lokasi maksimal 255 karakter',
                400
            );
        }

        if ($deskripsi === '') {
            errorResponse(
                'Deskripsi pengaduan wajib diisi',
                400
            );
        }

        if (mb_strlen($deskripsi, 'UTF-8') > 5000) {
            errorResponse(
                'Deskripsi maksimal 5000 karakter',
                400
            );
        }

        // 7. Pastikan fasilitas tersedia di database.
        $exists = $this->pengaduanModel->fasilitasExists(
            (int) $id_fasilitas
        );

        if ($exists === false) {
            errorResponse(
                'Gagal memeriksa data fasilitas',
                500
            );
        }

        if ($exists !== true) {
            errorResponse('Fasilitas tidak ditemukan', 404);
        }

        // 8. Foto wajib diunggah.
        if (!isset($_FILES['foto'])) {
            errorResponse(
                'Foto bukti pengaduan wajib diunggah',
                400
            );
        }

        $foto = $_FILES['foto'];

        if (
            !isset($foto['error']) ||
            is_array($foto['error'])
        ) {
            errorResponse(
                'Data unggahan foto tidak valid',
                400
            );
        }

        switch ($foto['error']) {
            case UPLOAD_ERR_OK:
                break;

            case UPLOAD_ERR_NO_FILE:
                errorResponse(
                    'Foto bukti pengaduan wajib diunggah',
                    400
                );
                break;

            case UPLOAD_ERR_INI_SIZE:
            case UPLOAD_ERR_FORM_SIZE:
                errorResponse('Ukuran foto maksimal 10 MB', 413);
                break;

            default:
                errorResponse(
                    'Foto gagal diunggah. Silakan coba lagi.',
                    400
                );
                break;
        }

        // 9. Validasi ukuran foto.
        $maksimalUkuran = 5 * 1024 * 1024;

        if (
            !isset($foto['size']) ||
            $foto['size'] <= 0 ||
            $foto['size'] > $maksimalUkuran
        ) {
            errorResponse(
                'Ukuran foto harus lebih dari 0 dan maksimal 10 MB',
                400
            );
        }

        if (
            empty($foto['tmp_name']) ||
            !is_uploaded_file($foto['tmp_name'])
        ) {
            errorResponse(
                'File foto yang diunggah tidak valid',
                400
            );
        }

        // 10. Periksa MIME berdasarkan isi file.
        $finfo = finfo_open(FILEINFO_MIME_TYPE);

        if ($finfo === false) {
            errorResponse(
                'Server gagal memeriksa tipe foto',
                500
            );
        }

        $mimeType = finfo_file($finfo, $foto['tmp_name']);
        finfo_close($finfo);

        $tipeFotoDiizinkan = [
            'image/jpeg' => 'jpg',
            'image/png' => 'png',
            'image/webp' => 'webp',
        ];

        if (
            $mimeType === false ||
            !isset($tipeFotoDiizinkan[$mimeType])
        ) {
            errorResponse(
                'Format foto harus JPEG, PNG, atau WebP',
                400
            );
        }

        // 11. Pastikan file benar-benar gambar yang valid.
        $infoGambar = @getimagesize($foto['tmp_name']);

        if ($infoGambar === false) {
            errorResponse(
                'File yang diunggah bukan gambar yang valid',
                400
            );
        }

        $tipeGambarDiizinkan = [
            IMAGETYPE_JPEG => 'image/jpeg',
            IMAGETYPE_PNG => 'image/png',
            IMAGETYPE_WEBP => 'image/webp',
        ];

        if (
            !isset($tipeGambarDiizinkan[$infoGambar[2]]) ||
            $tipeGambarDiizinkan[$infoGambar[2]] !== $mimeType
        ) {
            errorResponse(
                'Isi file tidak sesuai dengan format foto yang diizinkan',
                400
            );
        }

        // 11.1 Validasi dimensi gambar.
        $lebarGambar = $infoGambar[0];
        $tinggiGambar = $infoGambar[1];

        $maksimalDimensi = 6000;
        $maksimalPixel = 20000000;

        if (
            $lebarGambar <= 0 ||
            $tinggiGambar <= 0 ||
            $lebarGambar > $maksimalDimensi ||
            $tinggiGambar > $maksimalDimensi ||
            ($lebarGambar * $tinggiGambar) > $maksimalPixel
        ) {
            errorResponse(
                'Dimensi foto terlalu besar. Maksimal 6000 x 6000 piksel dan 20 megapiksel.',
                400
            );
        }

        // 12. Siapkan folder penyimpanan.
        $direktoriUpload =
            dirname(__DIR__, 3) . '/uploads/pengaduan';

        if (
            !is_dir($direktoriUpload) &&
            !mkdir($direktoriUpload, 0755, true) &&
            !is_dir($direktoriUpload)
        ) {
            errorResponse(
                'Direktori penyimpanan foto gagal dibuat',
                500
            );
        }

        if (!is_writable($direktoriUpload)) {
            errorResponse(
                'Direktori penyimpanan foto tidak dapat ditulisi',
                500
            );
        }

        // 13. Buat nama file unik.
        try {
            $namaFile = 'pengaduan_' .
                time() . '_' .
                bin2hex(random_bytes(8)) . '.' .
                $tipeFotoDiizinkan[$mimeType];
        } catch (Throwable $e) {
            errorResponse(
                'Gagal menyiapkan nama file foto',
                500
            );
        }

        $tujuanFoto = $direktoriUpload . '/' . $namaFile;
        $pathFoto = 'uploads/pengaduan/' . $namaFile;

        // 13.1 Decode gambar berdasarkan MIME.
        $gambar = false;

        switch ($mimeType) {
            case 'image/jpeg':
                $gambar = @imagecreatefromjpeg($foto['tmp_name']);
                break;

            case 'image/png':
                $gambar = @imagecreatefrompng($foto['tmp_name']);
                break;

            case 'image/webp':
                $gambar = @imagecreatefromwebp($foto['tmp_name']);
                break;
        }

        if ($gambar === false) {
            errorResponse(
                'Gambar gagal diproses oleh server',
                400
            );
        }

        // 13.2 Encode ulang gambar ke file sementara.
        $fileSementara = tempnam($direktoriUpload, 'img_');

        if ($fileSementara === false) {
            imagedestroy($gambar);

            errorResponse(
                'Gagal menyiapkan file sementara',
                500
            );
        }

        $berhasilEncode = false;

        switch ($mimeType) {
            case 'image/jpeg':
                $berhasilEncode = imagejpeg(
                    $gambar,
                    $fileSementara,
                    85
                );
                break;

            case 'image/png':
                $berhasilEncode = imagepng(
                    $gambar,
                    $fileSementara,
                    6
                );
                break;

            case 'image/webp':
                $berhasilEncode = imagewebp(
                    $gambar,
                    $fileSementara,
                    85
                );
                break;
        }

        imagedestroy($gambar);

        if (!$berhasilEncode) {
            @unlink($fileSementara);

            errorResponse(
                'Gambar gagal disimpan ulang',
                500
            );
        }

        // 13.3 Pindahkan hasil encode ke nama file final.
        if (!rename($fileSementara, $tujuanFoto)) {
            @unlink($fileSementara);

            errorResponse(
                'Foto gagal disimpan ke server',
                500
            );
        }

        // 14. Simpan data beserta path foto.
        $id_pengaduan = $this->pengaduanModel->create(
            $id_user,
            (int) $id_fasilitas,
            $judul,
            $lokasi,
            $deskripsi,
            $pathFoto
        );

        // Hapus file jika penyimpanan database gagal.
        if ($id_pengaduan === false) {
            if (is_file($tujuanFoto)) {
                @unlink($tujuanFoto);
            }

            errorResponse('Gagal membuat pengaduan', 500);
        }

        // 15. Ambil data pengaduan yang baru dibuat.
        $pengaduan = $this->pengaduanModel->findById(
            (int) $id_pengaduan
        );

        if ($pengaduan === false || $pengaduan === null) {
            errorResponse(
                'Pengaduan tersimpan, tetapi gagal mengambil data hasil penyimpanan',
                500
            );
        }

        // 16. Siapkan data respons sukses.
        $responseData = [
            'id_pengaduan' => (int) $pengaduan['id_pengaduan'],
            'id_user' => (int) $pengaduan['id_user'],
            'id_fasilitas' => (int) $pengaduan['id_fasilitas'],
            'judul' => $pengaduan['judul'],
            'lokasi' => $pengaduan['lokasi'],
            'deskripsi' => $pengaduan['deskripsi'],
            'foto' => $pengaduan['foto'],
            'status' => $pengaduan['status'],
            'created_at' => $pengaduan['created_at']
        ];

        // 17. Kirim respons sukses.
        successResponse(
            'Pengaduan berhasil dibuat',
            $responseData,
            201
        );
    }
}