<?php

/**
 * Mengirim respons JSON ketika request berhasil.
 */
function successResponse($message, $data = null, $code = 200)
{
    http_response_code($code);

    echo json_encode(
        [
            "status" => "success",
            "message" => $message,
            "data" => $data
        ],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit();
}

/**
 * Mengirim respons JSON ketika request gagal.
 */
function errorResponse($message, $code = 400)
{
    http_response_code($code);

    echo json_encode(
        [
            "status" => "error",
            "message" => $message
        ],
        JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE
    );

    exit();
}