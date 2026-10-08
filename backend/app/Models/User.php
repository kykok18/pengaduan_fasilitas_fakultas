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
            return false;
        }

        mysqli_stmt_bind_param(
            $stmt,
            "s",
            $email
        );

        mysqli_stmt_execute($stmt);

        $result = mysqli_stmt_get_result($stmt);

        $exists = mysqli_num_rows($result) > 0;

        mysqli_stmt_close($stmt);

        return $exists;
    }

    public function create($nama, $email, $password_hash)
    {
        $query = "
            INSERT INTO users (nama, email, password)
            VALUES (?, ?, ?)
        ";

        $stmt = mysqli_prepare(
            $this->conn,
            $query
        );

        if (!$stmt) {
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
            mysqli_stmt_close($stmt);

            return false;
        }

        $id_user = mysqli_insert_id($this->conn);

        mysqli_stmt_close($stmt);

        return $id_user;
    }
}