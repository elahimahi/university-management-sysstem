<?php
/**
 * Debug User Endpoint
 * GET /debug/check-user
 * 
 * Checks if authentication is working and shows user info
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

header('Content-Type: application/json');

// Try to get authenticated user
$user = getAuthenticatedUser();

if ($user) {
    echo json_encode([
        'status' => 'success',
        'message' => 'User authenticated',
        'user' => $user
    ]);
} else {
    // Check if token exists
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? 'No Authorization header';
    
    echo json_encode([
        'status' => 'error',
        'message' => 'Not authenticated',
        'authHeader' => $authHeader,
        'token' => preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches) ? 'Token found' : 'No token'
    ]);
}
?>
