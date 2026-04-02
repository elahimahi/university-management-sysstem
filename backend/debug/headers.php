<?php
/**
 * Header Debug Endpoint
 * GET /debug/headers
 * 
 * Shows all headers and authentication status
 */

header('Content-Type: application/json');

$debug = [];

// Get all headers
if (function_exists('getallheaders')) {
    $debug['all_headers'] = getallheaders();
} else {
    $debug['all_headers'] = 'getallheaders() not available';
}

// Check $_SERVER
$debug['server_auth_1'] = $_SERVER['HTTP_AUTHORIZATION'] ?? 'Not found';
$debug['server_auth_2'] = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'] ?? 'Not found';

// Try to extract token
$authHeader = '';
if (function_exists('getallheaders')) {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
}
if (!$authHeader && isset($_SERVER['HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
}
if (!$authHeader && isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
    $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
}

$debug['auth_header_found'] = $authHeader ? 'YES' : 'NO';
$debug['auth_header_value'] = $authHeader;

// Try to extract token
if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
    $debug['token_extracted'] = 'YES';
    $debug['token_first_50_chars'] = substr($token, 0, 50);
} else {
    $debug['token_extracted'] = 'NO';
}

// Now try full authentication
require_once __DIR__ . '/../auth/auth_helper.php';
$user = getAuthenticatedUser();
if ($user) {
    $debug['authenticated'] = 'YES';
    $debug['user'] = $user;
} else {
    $debug['authenticated'] = 'NO';
}

echo json_encode($debug, JSON_PRETTY_PRINT);
?>
