<?php

class DashboardAdmin
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Menghitung jumlah pengaduan berdasarkan status.
     * Status yang belum memiliki pengaduan bernilai 0.
     */
    public function getRingkasan()
    {
        $query = "
            SELECT
                COUNT(*) AS total_pengaduan,
                COALESCE(SUM(status = 'diajukan'), 0) AS diajukan,
                COALESCE(SUM(status = 'dalam perbaikan'), 0) AS dalam_perbaikan,
                COALESCE(SUM(status = 'selesai'), 0) AS selesai,
                COALESCE(SUM(status = 'ditolak'), 0) AS ditolak
            FROM pengaduan
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan ringkasan admin: ' . mysqli_error($this->conn));
            return false;
        }

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan ringkasan admin: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil ringkasan admin: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $row = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return [
            'total_pengaduan' => (int) $row['total_pengaduan'],
            'diajukan' => (int) $row['diajukan'],
            'dalam_perbaikan' => (int) $row['dalam_perbaikan'],
            'selesai' => (int) $row['selesai'],
            'ditolak' => (int) $row['ditolak']
        ];
    }

    /**
     * Mengambil daftar pengaduan berdasarkan satu status (tab dashboard).
     * Mendukung pagination, pencarian, dan pengurutan.
     * Digunakan untuk dashboard admin.
     */
    public function getPengaduanByStatus($status, $limit = 10, $page = 1, $search = '', $sort = 'terbaru')
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

        // Status harus salah satu status yang dikenal.
        $statusValid = ['dalam perbaikan', 'selesai', 'ditolak'];

        if (!in_array($status, $statusValid, true)) {
            return false;
        }

        $where = ['p.status = ?'];
        $params = [$status];
        $types = 's';

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

        // Hitung total data sesuai status dan pencarian.
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM pengaduan p
            INNER JOIN users u ON u.id_user = p.id_user
            $whereSQL
        ";

        $countStmt = mysqli_prepare($this->conn, $countQuery);

        if (!$countStmt) {
            error_log('Gagal menyiapkan hitungan daftar admin: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($countStmt, $types, ...$params);

        if (!mysqli_stmt_execute($countStmt)) {
            error_log('Gagal menghitung daftar admin: ' . mysqli_stmt_error($countStmt));
            mysqli_stmt_close($countStmt);
            return false;
        }

        $countResult = mysqli_stmt_get_result($countStmt);

        if ($countResult === false) {
            error_log('Gagal mengambil hitungan daftar admin: ' . mysqli_stmt_error($countStmt));
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
            error_log('Gagal menyiapkan query daftar admin: ' . mysqli_error($this->conn));
            return false;
        }

        $queryParams = $params;
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        $queryTypes = $types . 'ii';

        mysqli_stmt_bind_param($stmt, $queryTypes, ...$queryParams);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query daftar admin: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil daftar admin: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $pengaduan = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $pengaduan[] = [
                'id_pengaduan' => (int) $row['id_pengaduan'],
                'judul' => $row['judul'],
                'lokasi' => $row['lokasi'],
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
}
