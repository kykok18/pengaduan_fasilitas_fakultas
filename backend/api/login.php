
<?php

header('Content-Type: application/json');

require_once '../config/database.php';

// Request method hanya POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);

    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);

    exit();
}

// Ambil data JSON dari request
$data = json_decode(file_get_contents("php://input"), true);

// Validasi format JSON
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Format JSON tidak valid"
    ]);

    exit();
}

// Validasi data request
if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Data request tidak valid"
    ]);

    exit();
}

// Ambil data dari request
$email = trim($data['email'] ?? "");
$password = $data['password'] ?? "";

// Validasi input kosong
if ($email === "" || $password === "") {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Email dan password harus diisi"
    ]);

    exit();
}

// Validasi format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Format email tidak valid"
    ]);

    exit();
}

// Cari user berdasarkan email
$query = "SELECT id_user, nama, email, password, foto, role 
          FROM users 
          WHERE email = ?";

$stmt = mysqli_prepare($conn, $query);

// Cek apakah prepare statement berhasil
if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan pada server"
    ]);

    exit();
}

mysqli_stmt_bind_param($stmt, "s", $email);
mysqli_stmt_execute($stmt);

$result = mysqli_stmt_get_result($stmt);

// Cek apakah user ditemukan
if (mysqli_num_rows($result) === 0) {
    mysqli_stmt_close($stmt);

    http_response_code(401);

    echo json_encode([
        "status" => "error",
        "message" => "Email atau password salah"
    ]);

    exit();
}

