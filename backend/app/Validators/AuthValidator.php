<?php

class AuthValidator
{
    public static function validateRegister($data)
    {
        $nama = trim($data['nama'] ?? '');
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';
        $confirm_password = $data['confirm_password'] ?? '';

        // Validasi field wajib
        if (
            $nama === '' ||
            $email === '' ||
            $password === '' ||
            $confirm_password === ''
        ) {
            return 'Nama, email, password, dan konfirmasi password harus diisi';
        }
        
        // Validasi karakter nama
        if (!preg_match("/^[\p{L}\p{M}]+(?:[ '\-.\x{2019}][\p{L}\p{M}]+)*$/u", $nama)) {
            return 'Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung';
        }

        // Validasi panjang nama
        if (mb_strlen($nama, 'UTF-8') > 100) {
            return 'Nama maksimal 100 karakter';
        }

        // Validasi panjang email
        if (strlen($email) > 254) {
            return 'Email maksimal 254 karakter';
        }

        // Validasi format email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'Format email tidak valid';
        }
        
        // Validasi panjang password
        if (strlen($password) < 8) {
            return 'Password minimal 8 karakter';
        }

        // Validasi panjang maksimum password
        if (strlen($password) > 128) {
            return 'Password maksimal 128 karakter';
        }


        // Validasi konfirmasi password
        if ($password !== $confirm_password) {
            return 'Konfirmasi password tidak sesuai';
        }


        // Validasi kekuatan password
        if (
            !preg_match('/[A-Z]/', $password) ||
            !preg_match('/[a-z]/', $password) ||
            !preg_match('/[0-9]/', $password)
        ) {
            return 'Password harus mengandung huruf besar, huruf kecil, dan angka';
        }

        return true;
    }

    public static function validateLogin($data)
    {
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Validasi field wajib
        if ($email === '' || $password === '') {
            return 'Email dan password harus diisi';
        }

        // Validasi format email
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return 'Format email tidak valid';
        }

        return true;
    }
}