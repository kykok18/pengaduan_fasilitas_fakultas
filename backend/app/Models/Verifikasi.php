<?php

class Verifikasi
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil daftar pengaduan berstatus diajukan.
     * Mendukung pagination, pencarian, dan pengurutan.
     * Digunakan untuk halaman verifikasi pengaduan admin.
     */
    public function getPengaduanDiajukan($limit = 10, $page = 1, $search = '', $sort = 'terbaru')
    {
        $limit = (int) $limit;
        $page = (int) $page;

        if ($limit < 1 || $limit > 100) {
            $limit = 10;
        }

        if ($page < 1) {
            $page = 1;
        }

        $offset = ($page - 1) * $limit;
        $search = trim($search);

        $where = ["p.status = 'diajukan'"];
        $params = [];
        $types = '';

        // Pencarian berdasarkan judul, lokasi, atau nama pelapor.
        // Karakter khusus LIKE (% dan _) dicari sebagai teks biasa.
        if ($search !== '') {
            $where[] = '(p.judul LIKE ? OR p.lokasi LIKE ? OR u.nama LIKE ?)';
            $keyword = '%' . addcslashes($search, "\\%_") . '%';

            $params[] = $keyword;
            $params[] = $keyword;
            $params[] = $keyword;
            $types .= 'sss';
        }

        $whereSQL = ' WHERE ' . implode(' AND ', $where);

        // Urutan hanya berasal dari daftar tetap, bukan dari input.
        $orderSQL = ($sort === 'terlama')
            ? 'p.created_at ASC, p.id_pengaduan ASC'
            : 'p.created_at DESC, p.id_pengaduan DESC';

        // Hitung total data sesuai pencarian.
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM pengaduan p
            INNER JOIN users u ON u.id_user = p.id_user
            $whereSQL
        ";

        $countStmt = mysqli_prepare($this->conn, $countQuery);

        if (!$countStmt) {
            error_log('Gagal menyiapkan hitungan verifikasi: ' . mysqli_error($this->conn));
            return false;
        }

        if ($types !== '') {
            mysqli_stmt_bind_param($countStmt, $types, ...$params);
        }

        if (!mysqli_stmt_execute($countStmt)) {
            error_log('Gagal menghitung daftar verifikasi: ' . mysqli_stmt_error($countStmt));
            mysqli_stmt_close($countStmt);
            return false;
        }

        $countResult = mysqli_stmt_get_result($countStmt);

        if ($countResult === false) {
            error_log('Gagal mengambil hitungan verifikasi: ' . mysqli_stmt_error($countStmt));
            mysqli_stmt_close($countStmt);
            return false;
        }

        $total = (int) mysqli_fetch_assoc($countResult)['total'];

        mysqli_free_result($countResult);
        mysqli_stmt_close($countStmt);

        // Ambil data untuk halaman yang diminta.
        $query = "
            SELECT
                p.id_pengaduan,
                p.judul,
                p.lokasi,
                p.deskripsi,
                p.status,
                p.foto,
                p.created_at,
                f.nama_fasilitas,
                u.nama AS nama_pelapor
            FROM pengaduan p
            INNER JOIN users u ON u.id_user = p.id_user
            LEFT JOIN fasilitas f ON f.id_fasilitas = p.id_fasilitas
            $whereSQL
            ORDER BY $orderSQL
            LIMIT ? OFFSET ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query daftar verifikasi: ' . mysqli_error($this->conn));
            return false;
        }

        $queryParams = $params;
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        $queryTypes = $types . 'ii';

        mysqli_stmt_bind_param($stmt, $queryTypes, ...$queryParams);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query daftar verifikasi: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil daftar verifikasi: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $pengaduan = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $pengaduan[] = [
                'id_pengaduan' => (int) $row['id_pengaduan'],
                'judul' => $row['judul'],
                'lokasi' => $row['lokasi'],
                'deskripsi' => $row['deskripsi'],
                'status' => $row['status'],
                'foto' => $row['foto'],
                'created_at' => $row['created_at'],
                'nama_fasilitas' => $row['nama_fasilitas'],
                'nama_pelapor' => $row['nama_pelapor']
            ];
        }

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return [
            'data' => $pengaduan,
            'pagination' => [
                'current_page' => $page,
                'per_page' => $limit,
                'total_data' => $total,
                'total_pages' => (int) ceil($total / $limit)
            ]
        ];
    }

    /**
     * Memproses keputusan verifikasi pengaduan.
     *
     * Dalam satu transaksi: mengubah status pengaduan dan menyimpan
     * riwayat perubahan status (tanggapan atau alasan, admin, waktu)
     * pada tabel penanganan.
     *
     * Mengembalikan data penanganan jika berhasil, 'not_found' jika
     * pengaduan tidak ada, 'status_tidak_sesuai' jika status pengaduan
     * bukan diajukan, dan false jika proses gagal.
     */
    public function verifikasi($id_pengaduan, $id_admin, $statusBaru, $keterangan)
    {
        // Status baru hanya boleh hasil penerimaan atau penolakan.
        if (!in_array($statusBaru, ['dalam perbaikan', 'ditolak'], true)) {
            return false;
        }

        if (!mysqli_begin_transaction($this->conn)) {
            error_log('Gagal memulai transaksi verifikasi: ' . mysqli_error($this->conn));
            return false;
        }

        try {
            // Kunci baris pengaduan agar verifikasi pada pengaduan yang sama
            // berjalan bergantian, termasuk jika dua admin memprosesnya bersamaan.
            $query = "
                SELECT id_pengaduan, status
                FROM pengaduan
                WHERE id_pengaduan = ?
                FOR UPDATE
            ";

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            $result = mysqli_stmt_get_result($stmt);
            $pengaduan = mysqli_fetch_assoc($result);

            mysqli_free_result($result);
            mysqli_stmt_close($stmt);

            if (!$pengaduan) {
                mysqli_rollback($this->conn);
                return 'not_found';
            }

            // Hanya pengaduan berstatus diajukan yang dapat diverifikasi.
            if ($pengaduan['status'] !== 'diajukan') {
                mysqli_rollback($this->conn);
                return 'status_tidak_sesuai';
            }

            // Ubah status pengaduan.
            $query = "
                UPDATE pengaduan
                SET status = ?
                WHERE id_pengaduan = ?
                  AND status = 'diajukan'
            ";

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            mysqli_stmt_bind_param($stmt, 'si', $statusBaru, $id_pengaduan);

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            $barisBerubah = mysqli_stmt_affected_rows($stmt);

            mysqli_stmt_close($stmt);

            if ($barisBerubah !== 1) {
                mysqli_rollback($this->conn);
                return 'status_tidak_sesuai';
            }

            // Simpan riwayat perubahan status beserta identitas admin.
            $query = "
                INSERT INTO penanganan (id_pengaduan, id_admin, status, keterangan)
                VALUES (?, ?, ?, ?)
            ";

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            mysqli_stmt_bind_param(
                $stmt,
                'iiss',
                $id_pengaduan,
                $id_admin,
                $statusBaru,
                $keterangan
            );

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            $id_penanganan = (int) mysqli_stmt_insert_id($stmt);

            mysqli_stmt_close($stmt);

            if ($id_penanganan <= 0) {
                throw new Exception('ID penanganan tidak valid setelah penyimpanan');
            }

            // Ambil riwayat yang baru tersimpan, termasuk waktu perubahan.
            $query = "
                SELECT id_penanganan, status, keterangan, created_at
                FROM penanganan
                WHERE id_penanganan = ?
            ";

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            mysqli_stmt_bind_param($stmt, 'i', $id_penanganan);

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            $result = mysqli_stmt_get_result($stmt);
            $penanganan = mysqli_fetch_assoc($result);

            mysqli_free_result($result);
            mysqli_stmt_close($stmt);

            if (!$penanganan) {
                throw new Exception('Riwayat verifikasi tidak ditemukan setelah penyimpanan');
            }

            if (!mysqli_commit($this->conn)) {
                throw new Exception(mysqli_error($this->conn));
            }

            return [
                'id_penanganan' => (int) $penanganan['id_penanganan'],
                'status' => $penanganan['status'],
                'keterangan' => $penanganan['keterangan'],
                'created_at' => $penanganan['created_at']
            ];
        } catch (Throwable $e) {
            mysqli_rollback($this->conn);
            error_log('Gagal memproses verifikasi pengaduan: ' . $e->getMessage());
            return false;
        }
    }
}