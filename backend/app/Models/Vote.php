<?php

class Vote
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

    /**
     * Menambahkan, mengubah, atau menghapus vote berdasarkan pilihan pengguna.
     */
    public function setVote($id_pengaduan, $id_user, $tipe_vote)
    {
        if (!mysqli_begin_transaction($this->conn)) {
            error_log('Gagal memulai transaksi vote: ' . mysqli_error($this->conn));
            return false;
        }

        try {
            // Kunci baris pengaduan agar proses vote pada pengaduan yang sama
            // berjalan bergantian, termasuk ketika user mengklik bersamaan.
            $query = "
                SELECT id_pengaduan
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

            // Periksa pilihan vote pengguna saat ini.
            $query = "
                SELECT id_vote, tipe_vote
                FROM vote
                WHERE id_pengaduan = ? AND id_user = ?
                FOR UPDATE
            ";

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            mysqli_stmt_bind_param($stmt, 'ii', $id_pengaduan, $id_user);

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            $result = mysqli_stmt_get_result($stmt);
            $voteLama = mysqli_fetch_assoc($result);

            mysqli_free_result($result);
            mysqli_stmt_close($stmt);

            if ($voteLama) {
                if ($voteLama['tipe_vote'] === $tipe_vote) {
                    // Pilihan sama: hapus vote.
                    $query = "
                        DELETE FROM vote
                        WHERE id_pengaduan = ? AND id_user = ?
                    ";

                    $aksi = 'removed';
                } else {
                    // Pilihan berbeda: ubah jenis vote.
                    $query = "
                        UPDATE vote
                        SET tipe_vote = ?
                        WHERE id_pengaduan = ? AND id_user = ?
                    ";

                    $aksi = 'changed';
                }
            } else {
                // Belum pernah vote: simpan vote baru.
                $query = "
                    INSERT INTO vote (id_pengaduan, id_user, tipe_vote)
                    VALUES (?, ?, ?)
                ";

                $aksi = 'added';
            }

            $stmt = mysqli_prepare($this->conn, $query);

            if (!$stmt) {
                throw new Exception(mysqli_error($this->conn));
            }

            if ($aksi === 'removed') {
                mysqli_stmt_bind_param($stmt, 'ii', $id_pengaduan, $id_user);
            } elseif ($aksi === 'changed') {
                mysqli_stmt_bind_param($stmt, 'sii', $tipe_vote, $id_pengaduan, $id_user);
            } else {
                mysqli_stmt_bind_param($stmt, 'iis', $id_pengaduan, $id_user, $tipe_vote);
            }

            if (!mysqli_stmt_execute($stmt)) {
                throw new Exception(mysqli_stmt_error($stmt));
            }

            mysqli_stmt_close($stmt);

            if (!mysqli_commit($this->conn)) {
                throw new Exception(mysqli_error($this->conn));
            }

            return $aksi;
        } catch (Throwable $e) {
            mysqli_rollback($this->conn);
            error_log('Gagal memproses toggle vote: ' . $e->getMessage());
            return false;
        }
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
