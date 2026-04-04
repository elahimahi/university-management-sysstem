<?php
/**
 * Development Router for PHP Built-in Server
 * This ensures ALL requests (including OPTIONS preflight) are routed properly with CORS headers
 */

// Set CORS headers IMMEDIATELY for ALL requests (including direct file serves)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept");
header("Access-Control-Max-Age: 86400");

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$requested_file = __DIR__ . parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);

// If a file or directory actually exists on disk, serve it
if (is_file($requested_file) || is_dir($requested_file)) {
    return false;
}

// Everything else goes through the API router
require __DIR__ . '/index.php';
?>
