<?php

class User
{
    private $conn;

    public function __construct($conn)
    {
        $this->conn = $conn;
    }
    public function emailExists($email)
    {
        $query = "SELECT id_user FROM users WHERE email = ?";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log("Gagal menyiapkan query emailExists: " . mysqli_error($this->conn));
            return null;
        }

        mysqli_stmt_bind_param($stmt, "s", $email);

        if (!mysqli_stmt_execute($stmt)) {
            error_log("Gagal menjalankan query emailExists: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return null;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log("Gagal mengambil hasil query emailExists: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return null;
        }

        $exists = mysqli_num_rows($result) > 0;

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $exists;
    }

    /**
     * Membuat akun pengguna baru.
     *
     * Return:
     * ID pengguna = berhasil
     * false       = gagal
     */
    public function create($nama, $email, $password_hash)
    {
        $query = "
            INSERT INTO users (nama, email, password)
            VALUES (?, ?, ?)
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log("Gagal menyiapkan query create: " . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param(
            $stmt,
            "sss",
            $nama,
            $email,
            $password_hash
        );

        if (!mysqli_stmt_execute($stmt)) {
            error_log("Gagal membuat pengguna: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $id_user = mysqli_insert_id($this->conn);

        mysqli_stmt_close($stmt);

        return $id_user;
    }

    /**
     * Mencari pengguna berdasarkan email.
     *
     * Return:
     * array = pengguna ditemukan
     * null  = pengguna tidak ditemukan
     * false = query gagal
     */
    public function findByEmail($email)
    {
        $query = "
            SELECT id_user, nama, email, password, role
            FROM users
            WHERE email = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log("Gagal menyiapkan query findByEmail: " . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, "s", $email);

        if (!mysqli_stmt_execute($stmt)) {
            error_log("Gagal menjalankan query findByEmail: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log("Gagal mengambil hasil findByEmail: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $user = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $user ?: null;
    }

    /**
     * Mencari pengguna berdasarkan ID.
     *
     * Return:
     * array = pengguna ditemukan
     * null  = pengguna tidak ditemukan
     * false = query gagal
     */
    public function findById($id_user)
    {
        $query = "
            SELECT id_user, nama, email, role
            FROM users
            WHERE id_user = ?
        ";

        $stmt = mysqli_prepare($this->conn, $query);

        if (!$stmt) {
            error_log("Gagal menyiapkan query findById: " . mysqli_error($this->conn));
            return false;
        }

        mysqli_stmt_bind_param($stmt, "i", $id_user);

        if (!mysqli_stmt_execute($stmt)) {
            error_log("Gagal menjalankan query findById: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $result = mysqli_stmt_get_result($stmt);

        if ($result === false) {
            error_log("Gagal mengambil hasil findById: " . mysqli_stmt_error($stmt));
            mysqli_stmt_close($stmt);
            return false;
        }

        $user = mysqli_fetch_assoc($result);

        mysqli_free_result($result);
        mysqli_stmt_close($stmt);

        return $user ?: null;
    }
}