<?php

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Middleware/AdminMiddleware.php';
require_once __DIR__ . '/../app/Controllers/VerifikasiController.php';

// Hanya menerima GET dan POST
if ($_SERVER['REQUEST_METHOD'] !== 'GET' && $_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    errorResponse('Method tidak diizinkan', 405);
}

// Pastikan pengguna sudah login sebagai admin
$admin = AdminMiddleware::handle($conn);

$controller = new VerifikasiController($conn);

// GET menampilkan daftar pengaduan yang perlu diverifikasi.
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $controller->daftarDiajukan();
}

// POST memproses keputusan penerimaan atau penolakan.
$controller->prosesVerifikasi($admin);