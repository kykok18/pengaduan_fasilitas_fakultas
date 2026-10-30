
<?php

class Riwayat
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Mengambil pengaduan milik pengguna tertentu.
     * Digunakan untuk riwayat pengaduan.
     */
    public function getPengaduanByUser($id_user)
    {
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
            WHERE p.id_user = ?
            ORDER BY p.created_at DESC, p.id_pengaduan DESC
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query riwayat: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $id_user);

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

        $pengaduan = mysqli_fetch_all($result, MYSQLI_ASSOC);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $pengaduan;
    }
}
