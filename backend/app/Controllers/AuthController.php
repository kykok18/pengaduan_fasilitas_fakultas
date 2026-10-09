<?php

require_once __DIR__ . '/../Validators/AuthValidator.php';
require_once __DIR__ . '/../Models/User.php';
require_once __DIR__ . '/../Helpers/response.php';
require_once __DIR__ . '/../Helpers/password.php';

class AuthController
{
    private $userModel;

    public function __construct($conn)
    {
        $this->userModel = new User($conn);
    }

    public function registrasi()
    {
        // Ambil data JSON dari request
        $data = json_decode(file_get_contents("php://input"), true);

        // Validasi format JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse(
                "Format JSON tidak valid",
                400
            );
        }

        // Validasi data request
        if (!is_array($data)) {
            errorResponse(
                "Data request tidak valid",
                400
            );
        }

        // Validasi input
        $validation = AuthValidator::validateRegister($data);

        if ($validation !== true) {
            errorResponse(
                $validation,
                400
            );
        }

        // Ambil data
        $nama = trim($data['nama']);
        $email = trim($data['email']);
        $password = $data['password'];

        // Cek email
        $emailExists = $this->userModel->emailExists($email);

        if ($emailExists === true) {
            errorResponse(
                "Email sudah terdaftar",
                400
            );
        }

        // Hash password
       $password_hash = hashPassword($password);

        // Simpan user
        $id_user = $this->userModel->create(
            $nama,
            $email,
            $password_hash
        );

        if ($id_user === false) {
            errorResponse(
                "Registrasi gagal",
                500
            );
        }

        // Response berhasil
        successResponse(
            "Registrasi berhasil",
            [
                "id_user" => $id_user,
                "nama" => $nama,
                "email" => $email,
                "role" => "user"
            ],
            201
        );
    }


    public function login()
    {
        // Ambil data JSON dari request
        $data = json_decode(file_get_contents("php://input"), true);

        // Validasi format JSON
        if (json_last_error() !== JSON_ERROR_NONE) {
            errorResponse("Format JSON tidak valid", 400);
        }

        // Validasi data request
        if (!is_array($data)) {
            errorResponse("Data request tidak valid", 400);
        }

        // Ambil email dan password
        $email = trim($data['email'] ?? '');
        $password = $data['password'] ?? '';

        // Cari user berdasarkan email
        $user = $this->userModel->findByEmail($email);

        if ($user === false) {
            errorResponse("Terjadi kesalahan pada server", 500);
        }

        if ($user === null) {
            errorResponse("Email atau password salah", 401);
        }

        // Verifikasi password
        if (!verifyPassword($password, $user['password'])) {
            errorResponse("Email atau password salah", 401);
        }

        // Mulai session
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }

        // Perbarui ID session setelah login
        session_regenerate_id(true);

        // Simpan data user ke session
        $_SESSION['id_user'] = $user['id_user'];
        $_SESSION['nama'] = $user['nama'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];

        // Response berhasil
        successResponse("Login berhasil", [
            "id_user" => $user['id_user'],
            "nama" => $user['nama'],
            "email" => $user['email'],
            "role" => $user['role']
        ]);
    }
}
