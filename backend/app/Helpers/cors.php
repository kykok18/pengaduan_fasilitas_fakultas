<?php
// Mencegah error / output liar sebelum header dikirim
if (headers_sent()) {
    return;
}

// Izinkan akses dari semua domain (atau ganti '*' dengan URL Vercel Anda, misal: 'https://nama-project.vercel.app')
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");

// Tangani preflight request OPTIONS dari browser (biasanya dikirim sebelum POST/PUT)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}