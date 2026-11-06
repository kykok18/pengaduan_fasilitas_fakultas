<?php

class Vote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Menambahkan vote atau memperbarui pilihan vote yang sudah ada.
     */
    public function setVote($id_pengaduan, $id_user, $tipe_vote)
    {
        $query = "
            INSERT INTO vote (id_pengaduan, id_user, tipe_vote)
            VALUES (?, ?, ?)
            ON DUPLICATE KEY UPDATE
                tipe_vote = VALUES(tipe_vote)
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query set vote: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param(
            $stmt,
            'iis',
            $id_pengaduan,
            $id_user,
            $tipe_vote
        );

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal menyimpan vote: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        mysqli_stmt_close($stmt);

        return true;
    }

    /**
     * Membatalkan vote pengguna pada suatu pengaduan.
     */
    public function removeVote($id_pengaduan, $id_user)
    {
        $query = "
            DELETE FROM vote
            WHERE id_pengaduan = ? AND id_user = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log('Gagal menyiapkan query hapus vote: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'ii', $id_pengaduan, $id_user);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal membatalkan vote: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        mysqli_stmt_close($stmt);

        return true;
    }

    /**
     * Mengambil jumlah vote dan pilihan pengguna.
     */
    public function getVoteData($id_pengaduan, $id_user)
    {
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
            error_log('Gagal menyiapkan query data vote: ' . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, 'ii', $id_user, $id_pengaduan);

        if (!mysqli_stmt_execute($stmt)) {
            error_log('Gagal mengambil data vote: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log('Gagal membaca data vote: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $data = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return [
            'upvote' => (int) $data['upvote'],
            'downvote' => (int) $data['downvote'],
            'pilihan_user' => $data['pilihan_user']
        ];
    }

        /**
     * Memeriksa apakah pengaduan tersedia.
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
            error_log('Gagal mengambil pemeriksaan pengaduan: ' . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $exists = mysqli_num_rows($result) > 0;

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $exists;
    }
}
