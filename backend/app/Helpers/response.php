<?php

function successResponse($message, $data = null, $code = 200)
{
    http_response_code($code);

    echo json_encode([
        "status" => "success",
        "message" => $message,
        "data" => $data
    ]);

    exit();
}

function errorResponse($message, $code = 400)
{
    http_response_code($code);

    echo json_encode([
        "status" => "error",
        "message" => $message
    ]);

    exit();
}