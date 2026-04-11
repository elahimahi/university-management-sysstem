<?php
/**
 * CORS Headers Configuration
 * Include this file at the top of all API endpoints
 */

// Get the origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// List of allowed origins
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

// Set CORS headers - MUST specify origin when using credentials
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} else if (!empty($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

header('Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE, PATCH', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 3600', true);

// Set content type
header('Content-Type: application/json; charset=utf-8', true);

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>
