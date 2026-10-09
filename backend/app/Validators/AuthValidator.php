<?php

class AuthValidator
{
    public static function validateRegister($data)
    {
        $nama = trim($data['nama'] ?? "");
        $email = trim($data['email'] ?? "");
        $password = $data['password'] ?? "";
        $confirm_password = $data['confirm_password'] ?? "";

        // Validasi field wajib
        if (
            $nama === "" ||
            $email === "" ||
            $password === "" ||
            $confirm_password === ""
        ) {
            return "Nama, email, password, dan konfirmasi password harus diisi";
        }

        // Validasi konfirmasi password
        if ($password !== $confirm_password) {
            return "password tidak sama";
        }

        // Validasi panjang password
        if (strlen($password) < 8) {
            return "Password minimal 8 karakter";
        }

        // Validasi kekuatan password
        if (
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password)
        ) {
            return "Password harus mengandung huruf besar, huruf kecil, dan angka";
        }

        // Validasi email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return "Format email tidak valid";
        }

        return true;
    }
}