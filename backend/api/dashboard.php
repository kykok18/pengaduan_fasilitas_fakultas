<?php


header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Controllers/DashboardController.php';

// Hanya menerima GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    header("Allow: GET");
    errorResponse("Method tidak diizinkan", 405);
}

// Pastikan pengguna sudah login
AuthMiddleware::handle();

// Ambil data dashboard
$controller = new DashboardController($conn);
$controller->index();