<?php

class Dashboard
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }

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
            ORDER BY created_at DESC
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $id_user);

        if (!mysqli_stmt_execute($stmt)) {
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            mysqli_stmt_close($stmt);
            return false;
        }

        $pengaduan = mysqli_fetch_all($result, MYSQLI_ASSOC);

        mysqli_stmt_close($stmt);

        return $pengaduan;
    }
}