<?php
header('Content-Type: application/json');
require_once '../config/database.php';


//request method hanya post
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);
    exit();
}
//ambil data json dari request
$data = json_decode(file_get_contents("php://input"), true);

//validasi format json
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Format JSON tidak valid"
    ]);

    exit();
}

//validasi data request
if (!is_array($data)) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Data request tidak valid"
    ]);

    exit();
}

//ambil data dari request
$nama = trim($data['nama'] ?? "");
$email = trim($data['email'] ?? "");
$password = $data['password'] ?? "";
$confirm_password = $data['confirm_password'] ?? "";

//validasi input
if ($nama === "" || $email === "" || $password === "" || $confirm_password === "") {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Nama, email, password, dan konfirmasi password harus diisi"
    ]);
    exit();
}

//validasi password dan konfirmasi password
if ($password !== $confirm_password) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "password tidak sama"
    ]);

    exit();
}

//validasi panjang password
if (strlen($password) < 8) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Password minimal 8 karakter"
    ]);

    exit();
}

//validasi kekuatan password
if (
    !preg_match('/[A-Z]/', $password) ||
    !preg_match('/[a-z]/', $password) ||
    !preg_match('/[0-9]/', $password)
) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Password harus mengandung huruf besar, huruf kecil, dan angka"
    ]);

    exit();
}

//validasi format email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Format email tidak valid"
    ]);

    exit();
}

//cek apakah email sudah terdaftar
$query = "SELECT id_user FROM users WHERE email = ?";

$stmt = mysqli_prepare($conn, $query);

//cek apakah prepare statement berhasil
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


if (mysqli_num_rows($result) > 0) {
    mysqli_stmt_close($stmt);

    http_response_code(400);

    echo json_encode([
        "status" => "error",
        "message" => "Email sudah terdaftar"
    ]);

    exit();
}
mysqli_stmt_close($stmt);

//hash pw
$password_hash = password_hash($password, PASSWORD_DEFAULT);

//simpan user baru ke database
$query = "INSERT INTO users (nama, email, password) VALUES (?, ?, ?)";

$stmt = mysqli_prepare($conn, $query);

//cek apakah prepare statement berhasil
if (!$stmt) {
    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => "Terjadi kesalahan pada server"
    ]);

    exit();
}

mysqli_stmt_bind_param($stmt, "sss", $nama, $email, $password_hash);

if (!mysqli_stmt_execute($stmt)) {
    mysqli_stmt_close($stmt);
    http_response_code(500);

    echo json_encode([
        "status" => "error",
        "message" => "Registrasi gagal"
    ]);
    exit();
}
mysqli_stmt_close($stmt);

// Ambil ID user yang baru dibuat
$id_user = mysqli_insert_id($conn);

// Response berhasil
http_response_code(201);

echo json_encode([
    "status" => "success",
    "message" => "Registrasi berhasil",
    "data" => [
        "id_user" => $id_user,
        "nama" => $nama,
        "email" => $email,
        "role" => "user"
    ]
]);
