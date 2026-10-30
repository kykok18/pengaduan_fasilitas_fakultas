<?php

class Dashboard
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil pengaduan terbaru dari seluruh pengguna.
     * Digunakan untuk dashboard.
     */
        /**
     * Mengambil pengaduan terbaru dari seluruh pengguna.
     * Mendukung pagination, pencarian, dan filter status.
     */
    public function getPengaduanTerbaru($limit = 5, $page = 1, $search = '', $status = '')
    {
        $limit = (int) $limit;
        $page = (int) $page;

        if ($limit < 1 || $limit > 100) {
            $limit = 5;
        }

        if ($page < 1) {
            $page = 1;
        }

        $offset = ($page - 1) * $limit;
        $search = trim($search);
        $status = trim($status);

        $where = [];
        $params = [];
        $types = '';

        // Pencarian berdasarkan judul atau lokasi.
        if ($search !== '') {
            $where[] = '(p.judul LIKE ? OR p.lokasi LIKE ?)';
            $keyword = '%' . $search . '%';

            $params[] = $keyword;
            $params[] = $keyword;
            $types .= 'ss';
        }

        // Filter berdasarkan status pengaduan.
        $statusValid = ['diajukan', 'diproses', 'selesai', 'ditolak'];

        if ($status !== '') {
            if (!in_array($status, $statusValid, true)) {
                return false;
            }

            $where[] = 'p.status = ?';
            $params[] = $status;
            $types .= 's';
        }

        $whereSQL = count($where) > 0
            ? ' WHERE ' . implode(' AND ', $where)
            : '';

        // Hitung total data sesuai pencarian dan filter.
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM pengaduan p
            $whereSQL
        ";

        $countStmt = mysqli_prepare($this->conn, $countQuery);

        if (!$countStmt) {
            error_log('Gagal menyiapkan hitungan dashboard: ' . mysqli_error($this->conn));
            return false;
        }

        if (!empty($params)) {
            mysqli_stmt_bind_param($countStmt, $types, ...$params);
        }

        if (!mysqli_stmt_execute($countStmt)) {
            error_log('Gagal menghitung data dashboard: ' . mysqli_stmt_error($countStmt));
            mysqli_stmt_close($countStmt);
            return false;
        }

        $countResult = mysqli_stmt_get_result($countStmt);
        $total = (int) mysqli_fetch_assoc($countResult)['total'];

        mysqli_free_result($countResult);
        mysqli_stmt_close($countStmt);

        // Ambil data untuk halaman yang diminta.
        $query = "
            SELECT
                p.id_pengaduan,
                p.id_user,
                p.judul,
                p.lokasi,
                p.status,
                p.foto,
                p.created_at,
                f.nama_fasilitas,
                COALESCE(vc.upvote_count, 0) AS upvote_count,
                COALESCE(vc.downvote_count, 0) AS downvote_count,
                COALESCE(kc.comment_count, 0) AS comment_count
            FROM pengaduan p
            LEFT JOIN fasilitas f ON f.id_fasilitas = p.id_fasilitas
            LEFT JOIN (
                SELECT
                    id_pengaduan,
                    SUM(CASE WHEN tipe_vote = 'upvote' THEN 1 ELSE 0 END) AS upvote_count,
                    SUM(CASE WHEN tipe_vote = 'downvote' THEN 1 ELSE 0 END) AS downvote_count
                FROM vote
                GROUP BY id_pengaduan
            ) vc ON vc.id_pengaduan = p.id_pengaduan
            LEFT JOIN (
                SELECT
                    id_pengaduan,
                    COUNT(*) AS comment_count
                FROM komentar
                GROUP BY id_pengaduan
            ) kc ON kc.id_pengaduan = p.id_pengaduan
            $whereSQL
            ORDER BY p.created_at DESC, p.id_pengaduan DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query dashboard: ' . mysqli_error($this->conn));
            return false;
        }

        $queryParams = $params;
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        $queryTypes = $types . 'ii';

        mysqli_stmt_bind_param($stmt, $queryTypes, ...$queryParams);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query dashboard: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil dashboard: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $pengaduan = mysqli_fetch_all($result, MYSQLI_ASSOC);

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