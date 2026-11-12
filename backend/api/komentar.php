<?php

header('Content-Type: application/json; charset=UTF-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Middleware/AuthMiddleware.php';
require_once __DIR__ . '/../app/Controllers/KomentarController.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    AuthMiddleware::handle();

    $controller = new KomentarController($conn);
    $controller->daftarKomentar();
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: GET, POST');
    errorResponse('Method tidak diizinkan', 405);
}

AuthMiddleware::handle();

$controller = new KomentarController($conn);
$controller->simpanKomentar();