<?php
/**
 * Diagnostic endpoint for testing payment check
 * GET /admin/test-payment-check
 */

// ============================================
// CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

try {
    require_once __DIR__ . '/../core/db_connect.php';
    
    if (!$pdo) {
        echo json_encode([
            'status' => 'error',
            'message' => 'Database connection failed'
        ]);
        exit;
    }
    
    // Test 1: Check if fees table exists
    $feesCheck = $pdo->query("SELECT COUNT(*) FROM fees")->fetchColumn();
    
    // Test 2: Check if notifications table exists
    $notifCheck = $pdo->query("SELECT COUNT(*) FROM notifications")->fetchColumn();
    
    // Test 3: Check if admin_notifications table exists
    $adminNotifCheck = $pdo->query("SELECT COUNT(*) FROM admin_notifications")->fetchColumn();
    
    echo json_encode([
        'status' => 'success',
        'database' => 'connected',
        'tables' => [
            'fees' => ['exists' => true, 'count' => $feesCheck],
            'notifications' => ['exists' => true, 'count' => $notifCheck],
            'admin_notifications' => ['exists' => true, 'count' => $adminNotifCheck]
        ],
        'message' => 'All required tables are available'
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'line' => $e->getLine(),
        'file' => basename($e->getFile())
    ]);
}
?>
