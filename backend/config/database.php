<?php

// Lokasi file .env di root proyek
$envPath = dirname(__DIR__, 2) . '/.env';

if (!file_exists($envPath)) {
    error_log('File .env tidak ditemukan.');

    http_response_code(500);
    die('Konfigurasi aplikasi tidak ditemukan.');
}

// Membaca konfigurasi .env
$env = parse_ini_file($envPath, false, INI_SCANNER_RAW);

if ($env === false) {
    error_log('Gagal membaca file .env.');

    http_response_code(500);
    die('Gagal membaca konfigurasi aplikasi.');
}

// Mengambil konfigurasi database
$host = trim($env['DB_HOST'] ?? '127.0.0.1');
$port = (int) ($env['DB_PORT'] ?? 3306);
$user = trim($env['DB_USER'] ?? '');
$pw   = $env['DB_PASSWORD'] ?? '';
$db   = trim($env['DB_NAME'] ?? '');

// Memastikan konfigurasi wajib tersedia
if ($host === '' || $port < 1 || $port > 65535 || $user === '' || $db === '') {
    error_log('Konfigurasi database belum lengkap atau tidak valid.');

    http_response_code(500);
    die('Konfigurasi database belum lengkap atau tidak valid.');
}

// Membuat koneksi MySQL
$conn = mysqli_connect(
    $host,
    $user,
    $pw,
    $db,
    $port
);

// Memeriksa koneksi
if (!$conn) {
    error_log('Koneksi database gagal: ' . mysqli_connect_error());

    http_response_code(500);
    die('Koneksi database gagal.');
}

// Mengatur charset
if (!mysqli_set_charset($conn, 'utf8mb4')) {
    error_log('Gagal mengatur charset database: ' . mysqli_error($conn));

    mysqli_close($conn);

    http_response_code(500);
    die('Gagal menyiapkan koneksi database.');
}