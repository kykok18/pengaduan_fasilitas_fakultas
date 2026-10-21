<?php

// Membaca file .env untuk development lokal.
// Pada production, konfigurasi dapat diberikan melalui Environment Variables.
$env = [];
$envPath = dirname(__DIR__, 2) . '/.env';

if (file_exists($envPath)) {
    $parsedEnv = parse_ini_file($envPath, false, INI_SCANNER_RAW);

    if ($parsedEnv === false) {
        error_log('Gagal membaca file .env.');

        http_response_code(500);
        die('Gagal membaca konfigurasi aplikasi.');
    }

    $env = $parsedEnv;
}

// Environment Variables memiliki prioritas dibandingkan file .env.
$getConfig = static function (string $key, string $default = '') use ($env): string {
    $value = getenv($key);

    if ($value !== false) {
        return trim((string) $value);
    }

    return trim((string) ($env[$key] ?? $default));
};

// Mengambil konfigurasi database.
$host = $getConfig('DB_HOST', '127.0.0.1');
$port = (int) $getConfig('DB_PORT', '3306');
$user = $getConfig('DB_USER');
$db   = $getConfig('DB_NAME');

// Password tidak di-trim agar karakter spasi tetap dipertahankan.
$pw = getenv('DB_PASSWORD');

if ($pw === false) {
    $pw = (string) ($env['DB_PASSWORD'] ?? '');
}

// Memastikan konfigurasi wajib tersedia.
if (
    $host === '' ||
    $port < 1 ||
    $port > 65535 ||
    $user === '' ||
    $db === ''
) {
    error_log('Konfigurasi database belum lengkap atau tidak valid.');

    http_response_code(500);
    die('Konfigurasi database belum lengkap atau tidak valid.');
}


// Membaca environment aplikasi.
$appEnv = strtolower($getConfig('APP_ENV', 'production'));

// Menyiapkan koneksi MySQL.
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = mysqli_init();

    if ($appEnv === 'local') {
        // Development lokal: MySQL di komputer sendiri tanpa TLS.
        mysqli_real_connect(
            $conn,
            $host,
            $user,
            $pw,
            $db,
            $port
        );
    } else {
        // Production: koneksi TLS dengan verifikasi sertifikat.
        mysqli_options(
            $conn,
            MYSQLI_OPT_SSL_VERIFY_SERVER_CERT,
            true
        );

        mysqli_ssl_set(
            $conn,
            null,
            null,
            '/etc/ssl/certs/ca-certificates.crt',
            null,
            null
        );

        mysqli_real_connect(
            $conn,
            $host,
            $user,
            $pw,
            $db,
            $port,
            null,
            MYSQLI_CLIENT_SSL
        );
    }

    mysqli_set_charset($conn, 'utf8mb4');

} catch (mysqli_sql_exception $e) {
    error_log('Koneksi atau persiapan database gagal: ' . $e->getMessage());

    http_response_code(500);
    die('Koneksi database gagal.');
}