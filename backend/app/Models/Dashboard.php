cat > app/Models/Dashboard.php <<'PHP'
<?php

class Dashboard
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
                id_pengaduan,
                judul,
                status,
                created_at
            FROM pengaduan
            WHERE id_user = ?
            ORDER BY created_at DESC, id_pengaduan DESC
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

    /**
     * Mengambil pengaduan terbaru dari seluruh pengguna.
     * Digunakan untuk dashboard.
     */
    public function getPengaduanTerbaru($limit = 5)
    {
        $limit = (int) $limit;

        if ($limit < 1 || $limit > 100) {
            $limit = 5;
        }

        $query = "
            SELECT
                id_pengaduan,
                id_user,
                judul,
                status,
                created_at
            FROM pengaduan
            ORDER BY created_at DESC, id_pengaduan DESC
            LIMIT ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query dashboard: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $limit);

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

        return $pengaduan;
    }
}