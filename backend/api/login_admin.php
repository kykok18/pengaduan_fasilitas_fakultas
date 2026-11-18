<?php

header('Content-Type: application/json; charset=UTF-8');
header('Cache-Control: no-store');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Helpers/response.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

// Login admin hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');
    errorResponse('Method tidak diizinkan', 405);
}

// Jalankan controller
$controller = new AuthController($conn);
$controller->loginAdmin();