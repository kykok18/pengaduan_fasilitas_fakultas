<?php

/**
 * Upload file gambar ke Cloudinary (signed upload, tanpa SDK).
 * Butuh env: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 *
 * @return string|false  URL https (secure_url) atau false kalau gagal
 */
function uploadToCloudinary(string $filePath, string $folder = 'pengaduan')
{
    $cloud  = getenv('CLOUDINARY_CLOUD_NAME');
    $key    = getenv('CLOUDINARY_API_KEY');
    $secret = getenv('CLOUDINARY_API_SECRET');

    if (!$cloud || !$key || !$secret) {
        error_log('Cloudinary: env belum lengkap');
        return false;
    }

    $timestamp = time();

    // Parameter yang ikut ditandatangani (urut alfabet), tanpa file/api_key.
    $toSign    = "folder={$folder}&timestamp={$timestamp}";
    $signature = sha1($toSign . $secret);

    $ch = curl_init("https://api.cloudinary.com/v1_1/{$cloud}/image/upload");
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 30,
        CURLOPT_POSTFIELDS     => [
            'file'      => new CURLFile($filePath),
            'api_key'   => $key,
            'timestamp' => $timestamp,
            'folder'    => $folder,
            'signature' => $signature,
        ],
    ]);

    $body = curl_exec($ch);
    $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err  = curl_error($ch);
    curl_close($ch);

    if ($body === false || $code !== 200) {
        error_log("Cloudinary gagal (HTTP {$code}): {$err} {$body}");
        return false;
    }

    $json = json_decode($body, true);
    return $json['secure_url'] ?? false;
}
/**
 * Simpan foto secara lokal saat APP_ENV=local.
 * Untuk environment lain, gunakan Cloudinary.
 *
 * @return string|false Path relatif atau URL Cloudinary.
 */
function uploadToStorage(string $filePath, string $folder = 'pengaduan')
{
    // Baca APP_ENV dari server atau file .env project.
    $appEnv = getenv('APP_ENV');

    if (!$appEnv) {
        $envPath = dirname(__DIR__, 3) . '/.env';

        if (is_file($envPath)) {
            $env = parse_ini_file($envPath, false, INI_SCANNER_RAW);
            $appEnv = $env['APP_ENV'] ?? '';
        }
    }

    // Mode local: simpan ke folder uploads di root project.
    if ($appEnv === 'local') {
        $projectRoot = dirname(__DIR__, 3);
        $uploadDir = $projectRoot . '/uploads/' . $folder;

        if (!is_dir($uploadDir) &&
            !mkdir($uploadDir, 0755, true) &&
            !is_dir($uploadDir)
        ) {
            error_log('Upload lokal: folder gagal dibuat');
            return false;
        }

        // Tentukan ekstensi dari MIME file hasil encode.
        $mime = (new finfo(FILEINFO_MIME_TYPE))->file($filePath);

        $extensions = [
            'image/jpeg' => 'jpg',
            'image/png'  => 'png',
            'image/webp' => 'webp',
        ];

        if (!isset($extensions[$mime])) {
            error_log('Upload lokal: MIME file tidak didukung');
            return false;
        }

        $filename = 'pengaduan_' . bin2hex(random_bytes(12))
            . '.' . $extensions[$mime];

        $destination = $uploadDir . '/' . $filename;

        if (!copy($filePath, $destination)) {
            error_log('Upload lokal: file gagal disimpan');
            return false;
        }

        return 'uploads/' . $folder . '/' . $filename;
    }

    // Environment selain local: gunakan Cloudinary.
    return uploadToCloudinary($filePath, $folder);
}
