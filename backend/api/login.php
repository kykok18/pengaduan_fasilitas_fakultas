<?php


require_once __DIR__ . '/../app/Helpers/cors.php';

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../app/Controllers/AuthController.php';

// Login hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Allow: POST');

    http_response_code(405);

    echo json_encode([
        "status" => "error",
        "message" => "Method not allowed"
    ]);

    exit();
}

// Jalankan controller
$controller = new AuthController($conn);
$controller->login();