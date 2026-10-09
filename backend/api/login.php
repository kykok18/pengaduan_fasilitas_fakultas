<?php

header('Content-Type: application/json');

require_once '../config/database.php';
require_once '../app/Controllers/AuthController.php';

// Login hanya menerima request POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
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