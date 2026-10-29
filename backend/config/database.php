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


mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_connect($host, $user, $password, $dbName, (int) $port);
    mysqli_set_charset($conn, 'utf8mb4');
} catch (mysqli_sql_exception $e) {
    error_log('Koneksi database gagal: ' . $e->getMessage());

    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');

    echo json_encode([
        'status' => 'error',
        'message' => 'Terjadi kesalahan pada server'
    ]);

    exit;

}