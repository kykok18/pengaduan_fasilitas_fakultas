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