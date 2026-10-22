<?php

$env = [];
$envPath = dirname(__DIR__, 2) . '/.env';

if (file_exists($envPath)) {
    $parsedEnv = parse_ini_file($envPath, false, INI_SCANNER_RAW);
    if ($parsedEnv !== false) {
        $env = $parsedEnv;
    }
}

$host = getenv('DB_HOST') ?: ($env['DB_HOST'] ?? '127.0.0.1');
$port = getenv('DB_PORT') ?: ($env['DB_PORT'] ?? '3306');
$user = getenv('DB_USERNAME') ?: ($env['DB_USERNAME'] ?? 'root');
$password = getenv('DB_PASSWORD') ?: ($env['DB_PASSWORD'] ?? '');
$dbName = getenv('DB_NAME') ?: ($env['DB_NAME'] ?? 'pengaduan_fasilitas_fakultasDB');

$conn = mysqli_connect($host, $user, $password, $dbName, (int) $port);

if (!$conn) {
    http_response_code(500);
    die('Koneksi database gagal: ' . mysqli_connect_error());
}

mysqli_set_charset($conn, 'utf8mb4');