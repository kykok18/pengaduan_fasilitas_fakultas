<?php

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Controllers/RiwayatController.php';

// Endpoint hanya menerima GET.
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Allow: GET");
    errorResponse("Method tidak diizinkan", 405);
}

// Pastikan pengguna memiliki session yang valid.
AuthMiddleware::handle();

$controller = new RiwayatController($conn);

// Jika parameter id_pengaduan ada (termasuk yang tidak valid seperti "abc"),
// tampilkan detail riwayat. Jika tidak ada, tampilkan daftar riwayat.
if (array_key_exists('id_pengaduan', $_GET)) {
    $controller->detail();
} else {
    $controller->index();
}