<?php
/**
 * Health Check Endpoint
 * Test if backend is working properly
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

try {
    require_once __DIR__ . '/core/db_connect.php';
    
    // Test database connection
    $stmt = $pdo->query("SELECT 1");
    $dbConnected = $stmt ? true : false;
    
    // Get system stats
    $users = $pdo->query("SELECT COUNT(*) as count FROM users")->fetch();
    $superadmins = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'")->fetch();
    
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'message' => 'Backend is running',
        'database' => $dbConnected ? 'connected' : 'disconnected',
        'users' => $users['count'],
        'superadmins' => $superadmins['count'],
        'timestamp' => date('c')
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'timestamp' => date('c')
    ]);
}
?>
