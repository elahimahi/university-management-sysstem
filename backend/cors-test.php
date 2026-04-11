<?php
/**
 * Simple CORS Test Endpoint
 * Tests if CORS headers are being sent correctly
 */

// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================

// If we get here, CORS headers were sent
echo json_encode([
    'status' => 'success',
    'message' => 'CORS headers test passed',
    'headers_sent' => headers_list(),
    'method' => $_SERVER['REQUEST_METHOD'],
    'timestamp' => date('c')
]);
?>
