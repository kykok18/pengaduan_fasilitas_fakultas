<?php

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Middleware/AdminMiddleware.php';
require_once __DIR__ . '/../app/Controllers/DashboardAdminController.php';

// Hanya menerima GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header('Allow: GET');
    errorResponse('Method tidak diizinkan', 405);
}

// Pastikan pengguna sudah login sebagai admin
$admin = AdminMiddleware::handle($conn);

// Ambil data dashboard admin
$controller = new DashboardAdminController($conn);
$controller->index($admin);
