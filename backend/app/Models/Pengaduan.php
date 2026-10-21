<?php

class Pengaduan
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    public function getFasilitasList()
    {
        $query = "
            SELECT
                id_fasilitas,
                nama_fasilitas
            FROM fasilitas
            ORDER BY nama_fasilitas ASC
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query fasilitas: ' . mysqli_error($this->conn));
            return false;
        }

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query fasilitas: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil fasilitas: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $fasilitas = mysqli_fetch_all($result, MYSQLI_ASSOC);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $fasilitas;
    }

    public function fasilitasExists($id_fasilitas)
    {
        $query = "SELECT id_fasilitas FROM fasilitas WHERE id_fasilitas = ?";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query fasilitasExists: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_fasilitas);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query fasilitasExists: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil fasilitasExists: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $exists = mysqli_num_rows($result) > 0;

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $exists;
    }

    public function create($id_user, $id_fasilitas, $judul, $lokasi, $deskripsi)
    {
        $query = "
            INSERT INTO pengaduan (id_user, id_fasilitas, judul, lokasi, deskripsi, foto, status, created_at)
            VALUES (?, ?, ?, ?, ?, NULL, 'diajukan', NOW())
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query create pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'iisss', $id_user, $id_fasilitas, $judul, $lokasi, $deskripsi);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal membuat pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $id_pengaduan = mysqli_insert_id($this->conn);

        mysqli_stmt_close($stmt);

        return $id_pengaduan ?: false;
    }

    public function updateFoto($id_pengaduan, $fotoPath)
    {
        $query = "
            UPDATE pengaduan
            SET foto = ?
            WHERE id_pengaduan = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query updateFoto pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'si', $fotoPath, $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengupdate foto pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        mysqli_stmt_close($stmt);

        return true;
    }

    public function findById($id_pengaduan)
    {
        $query = "
            SELECT
                id_pengaduan,
                id_user,
                id_fasilitas,
                judul,
                lokasi,
                deskripsi,
                foto,
                status,
                created_at
            FROM pengaduan
            WHERE id_pengaduan = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query findById pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query findById pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil findById pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $pengaduan = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $pengaduan ?: null;
    }
}
