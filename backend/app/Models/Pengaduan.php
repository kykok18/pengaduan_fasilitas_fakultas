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

        return $exists ? true : null;
    }

    public function findByNamaFasilitas($namaFasilitas)
    {
        $query = "SELECT id_fasilitas, nama_fasilitas FROM fasilitas WHERE nama_fasilitas = ? LIMIT 1";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query findByNamaFasilitas: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 's', $namaFasilitas);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menjalankan query findByNamaFasilitas: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal mengambil hasil findByNamaFasilitas: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $fasilitas = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $fasilitas ?: null;
    }   

    public function create($id_user, $id_fasilitas, $judul, $lokasi, $deskripsi, $fotoPath)
    {
        $query = "
            INSERT INTO pengaduan (
                id_user,
                id_fasilitas,
                judul,
                lokasi,
                deskripsi,
                foto,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, 'diajukan', NOW())
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query create pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param(
            $stmt,
            'iissss',
            $id_user,
            $id_fasilitas,
            $judul,
            $lokasi,
            $deskripsi,
            $fotoPath
        );

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

    public function acquirePengaduanLock($id_user)
    {
        $lockName = 'pengaduan_' . (int) $id_user;

        $query = "SELECT GET_LOCK(?, 0) AS lock_status";
        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log(
                'Gagal menyiapkan lock pengaduan: ' .
                mysqli_error($this->conn)
            );

            return false;
        }

        mysqli_stmt_bind_param($stmt, 's', $lockName);

        if (!mysqli_stmt_execute($stmt)) {
            error_log(
                'Gagal mengambil lock pengaduan: ' .
                mysqli_stmt_error($stmt)
            );

            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);
        $row = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        if (
            !is_array($row) ||
            !array_key_exists('lock_status', $row) ||
            $row['lock_status'] === null
        ) {
            return false;
        }

        return (int) $row['lock_status'];
    }

    public function releasePengaduanLock($id_user)
    {
        $lockName = 'pengaduan_' . (int) $id_user;

        $query = "SELECT RELEASE_LOCK(?)";
        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log(
                'Gagal menyiapkan pelepasan lock pengaduan: ' .
                mysqli_error($this->conn)
            );

            return false;
        }

        mysqli_stmt_bind_param($stmt, 's', $lockName);

        $success = mysqli_stmt_execute($stmt);

        if (!$success) {
            error_log(
                'Gagal melepas lock pengaduan: ' .
                mysqli_stmt_error($stmt)
            );
        }

        mysqli_stmt_close($stmt);

        return $success;
    }

    /**
     * Mengambil detail pengaduan.
     *
     * $id_user dipakai untuk menentukan pilihan vote pengguna yang sedang
     * login (vote.pilihan_user). Nilainya berasal dari session, bukan dari
     * request client.
     */
    public function getDetailPengaduan($id_pengaduan, $id_user)
    {
        // 1. Data utama pengaduan dan nama fasilitas.
        $query = "
            SELECT
                p.id_pengaduan,
                p.judul,
                f.nama_fasilitas,
                p.lokasi,
                p.deskripsi,
                p.foto,
                p.status,
                p.created_at
            FROM pengaduan p
            LEFT JOIN fasilitas f
                ON p.id_fasilitas = f.id_fasilitas
            WHERE p.id_pengaduan = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan detail pengaduan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil detail pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);
        $pengaduan = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        if (!$pengaduan) {
            return null;
        }

        // 2. Riwayat penanganan admin.
        $query = "
            SELECT
                id_penanganan,
                status,
                foto,
                keterangan,
                created_at
            FROM penanganan
            WHERE id_pengaduan = ?
            ORDER BY created_at DESC, id_penanganan DESC
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan riwayat penanganan: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil riwayat penanganan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);
        $penanganan = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $penanganan[] = $row;
        }

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        // 3. Jumlah upvote, downvote, dan pilihan vote pengguna yang login.
        $query = "
            SELECT
                COALESCE(SUM(tipe_vote = 'upvote'), 0) AS upvote,
                COALESCE(SUM(tipe_vote = 'downvote'), 0) AS downvote,
                MAX(CASE
                    WHEN id_user = ? THEN tipe_vote
                    ELSE NULL
                END) AS pilihan_user
            FROM vote
            WHERE id_pengaduan = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan jumlah vote: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'ii', $id_user, $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil jumlah vote: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);
        $vote = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        $vote = [
            'upvote' => (int) $vote['upvote'],
            'downvote' => (int) $vote['downvote'],
            'pilihan_user' => $vote['pilihan_user']
        ];

        // 4. Komentar beserta nama pengguna.
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
            error_log('Gagal menyiapkan komentar: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'i', $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil komentar: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);
        $komentar = [];

        while ($row = mysqli_fetch_assoc($result)) {
            $komentar[] = $row;
        }

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return [
            'pengaduan' => $pengaduan,
            'penanganan' => $penanganan,
            'vote' => $vote,
            'komentar' => $komentar
        ];
    }
}