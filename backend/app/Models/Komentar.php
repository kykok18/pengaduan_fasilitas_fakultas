<?php

class Komentar
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Memeriksa apakah pengaduan tersedia.
     * Mengembalikan 1 jika tersedia, 0 jika tidak tersedia,
     * dan false jika query gagal.
     */
    public function pengaduanExists($id_pengaduan)
    {
        $query = "
            SELECT id_pengaduan
            FROM pengaduan
            WHERE id_pengaduan = ?
            LIMIT 1
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan pemeriksaan pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal memeriksa pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca pemeriksaan pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $tersedia = mysqli_num_rows($result) > 0 ? 1 : 0;

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $tersedia;
    }

    /**
     * Mengambil daftar komentar suatu pengaduan beserta nama penulis.
     * Urutan sama dengan komentar pada Detail Pengaduan.
     */
    public function getDaftarKomentar($id_pengaduan)
    {
        $query = "
            SELECT
                k.id_komentar,
                u.nama,
                k.isi_komentar,
                k.created_at
            FROM komentar k
            INNER JOIN users u
                ON k.id_user = u.id_user
            WHERE k.id_pengaduan = ?
            ORDER BY k.created_at ASC, k.id_komentar ASC
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan daftar komentar: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil daftar komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca daftar komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $daftarKomentar = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $daftarKomentar[] = [
                'id_komentar' => (int) $row['id_komentar'],
                'nama' => $row['nama'],
                'isi_komentar' => $row['isi_komentar'],
                'created_at' => $row['created_at']
            ];
        }

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $daftarKomentar;
    }

    /**
     * Menyimpan komentar baru.
     * Mengembalikan ID komentar jika berhasil, false jika gagal.
     */
    public function createKomentar($id_pengaduan, $id_user, $isi_komentar)
    {
        $query = "
            INSERT INTO komentar (id_pengaduan, id_user, isi_komentar)
            VALUES (?, ?, ?)
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query simpan komentar: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param(
            $stmt,
            'iis',
            $id_pengaduan,
            $id_user,
            $isi_komentar
        );

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menyimpan komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $id_komentar = (int) mysqli_stmt_insert_id($stmt);

        mysqli_stmt_close($stmt);

        if ($id_komentar <= 0) {
            error_log('ID komentar tidak valid setelah penyimpanan');
            return false;
        }

        return $id_komentar;
    }

    /**
     * Mengambil satu komentar beserta nama penulis.
     * Mengembalikan null jika tidak ditemukan, false jika query gagal.
     */
    public function getKomentarById($id_komentar)
    {
        $query = "
            SELECT
                k.id_komentar,
                u.nama,
                k.isi_komentar,
                k.created_at
            FROM komentar k
            INNER JOIN users u
                ON k.id_user = u.id_user
            WHERE k.id_komentar = ?
            LIMIT 1
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query data komentar: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_komentar);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil data komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca data komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $row = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        if (!$row) {
            return null;
        }

        return [
            'id_komentar' => (int) $row['id_komentar'],
            'nama' => $row['nama'],
            'isi_komentar' => $row['isi_komentar'],
            'created_at' => $row['created_at']
        ];
    }

    /**
     * Menghitung jumlah komentar suatu pengaduan dari database.
     */
    public function countKomentar($id_pengaduan)
    {
        $query = "
            SELECT COUNT(*) AS total
            FROM komentar
            WHERE id_pengaduan = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query jumlah komentar: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menghitung komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca jumlah komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $row = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return (int) $row['total'];
    }
}