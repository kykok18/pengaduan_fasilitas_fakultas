<?php

class Riwayat
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Menghitung pengaduan milik pengguna, total dan per status.
     */
    public function getStatistikByUser($id_user)
    {
        $query = "
            SELECT
                COUNT(*) AS total_pengaduan,
                COALESCE(SUM(status = 'diajukan'), 0) AS diajukan,
                COALESCE(SUM(status = 'dalam perbaikan'), 0) AS dalam_perbaikan,
                COALESCE(SUM(status = 'selesai'), 0) AS selesai,
                COALESCE(SUM(status = 'ditolak'), 0) AS ditolak
            FROM pengaduan
            WHERE id_user = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan statistik riwayat: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_user);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan statistik riwayat: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil statistik riwayat: ' . mysqli_stmt_error($stmt));
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
     * Mengambil pengaduan milik pengguna tertentu.
     * Mendukung pagination, pencarian, dan filter status.
     * Setiap pengaduan menyertakan penanganan admin terakhir (null jika belum ada).
     * Digunakan untuk riwayat pengaduan.
     */
    public function getPengaduanByUser($id_user, $limit = 5, $page = 1, $search = '', $status = '')
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

        // Data selalu dibatasi pada pengaduan milik pengguna yang login.
        $where = ['p.id_user = ?'];
        $params = [$id_user];
        $types = 'i';

        // Pencarian berdasarkan judul atau lokasi.
        if ($search !== '') {
            $where[] = '(p.judul LIKE ? OR p.lokasi LIKE ?)';
            $keyword = '%' . $search . '%';

            $params[] = $keyword;
            $params[] = $keyword;
            $types .= 'ss';
        }

        // Filter berdasarkan status pengaduan.
        $statusValid = ['diajukan', 'dalam perbaikan', 'selesai', 'ditolak'];

        if ($status !== '') {
            if (!in_array($status, $statusValid, true)) {
                return false;
            }

            $where[] = 'p.status = ?';
            $params[] = $status;
            $types .= 's';
        }

        $whereSQL = ' WHERE ' . implode(' AND ', $where);

        // Hitung total data sesuai pencarian dan filter.
        $countQuery = "
            SELECT COUNT(*) AS total
            FROM pengaduan p
            $whereSQL
        ";

        $countStmt = mysqli_prepare($this->conn, $countQuery);

        if (!$countStmt) {
            error_log('Gagal menyiapkan hitungan riwayat: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($countStmt, $types, ...$params);

        if (!mysqli_stmt_execute($countStmt)) {
            error_log('Gagal menghitung data riwayat: ' . mysqli_stmt_error($countStmt));
            mysqli_stmt_close($countStmt);
            return false;
        }

        $countResult = mysqli_stmt_get_result($countStmt);

        if ($countResult === false) {
            error_log('Gagal mengambil hitungan riwayat: ' . mysqli_stmt_error($countStmt));
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
                COALESCE(vc.upvote_count, 0) AS upvote_count,
                COALESCE(vc.downvote_count, 0) AS downvote_count,
                COALESCE(kc.comment_count, 0) AS comment_count,
                pn.status AS penanganan_status,
                pn.keterangan AS penanganan_keterangan,
                pn.created_at AS penanganan_created_at
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
            LEFT JOIN penanganan pn ON pn.id_penanganan = (
                SELECT id_penanganan
                FROM penanganan
                WHERE id_pengaduan = p.id_pengaduan
                ORDER BY created_at DESC, id_penanganan DESC
                LIMIT 1
            )
            $whereSQL
            ORDER BY p.created_at DESC, p.id_pengaduan DESC
            LIMIT ? OFFSET ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query riwayat: ' . mysqli_error($this->conn));
            return false;
        }

        $queryParams = $params;
        $queryParams[] = $limit;
        $queryParams[] = $offset;
        $queryTypes = $types . 'ii';

        mysqli_stmt_bind_param($stmt, $queryTypes, ...$queryParams);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query riwayat: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil riwayat: ' . mysqli_stmt_error($stmt));
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
                'upvote_count' => (int) $row['upvote_count'],
                'downvote_count' => (int) $row['downvote_count'],
                'comment_count' => (int) $row['comment_count'],
                'penanganan_terakhir' => $row['penanganan_status'] !== null
                    ? [
                        'status' => $row['penanganan_status'],
                        'keterangan' => $row['penanganan_keterangan'],
                        'created_at' => $row['penanganan_created_at']
                    ]
                    : null
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
     * Memeriksa apakah pengaduan dibuat oleh pengguna tertentu.
     * Mengembalikan 1 jika milik pengguna, 0 jika bukan atau tidak ada,
     * dan false jika query gagal.
     */
    public function pengaduanMilikUser($id_pengaduan, $id_user)
    {
        $query = "
            SELECT id_pengaduan
            FROM pengaduan
            WHERE id_pengaduan = ?
              AND id_user = ?
            LIMIT 1
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan pemeriksaan pemilik pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'ii', $id_pengaduan, $id_user);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal memeriksa pemilik pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca pemeriksaan pemilik pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $milikUser = mysqli_num_rows($result) > 0 ? 1 : 0;

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $milikUser;
    }
}