<?php
/**
 * Get Pending User Registrations for Admin Approval
 * GET /admin/pending-registrations
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

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

try {
    // Get all pending registrations sorted by creation date (newest first)
    $stmt = $pdo->query("
        SELECT
            id,
            email,
            first_name,
            last_name,
            role,
            approval_status,
            created_at
        FROM users
        WHERE approval_status = 'pending'
        ORDER BY created_at DESC
    ");

    $pendingUsers = [];
    if ($stmt) {
        $pendingUsers = $stmt->fetchAll() ?: [];
    }

    http_response_code(200);
    echo json_encode([
        'message' => 'Pending registrations retrieved',
        'count' => count($pendingUsers),
        'users' => $pendingUsers,
        'success' => true
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'message' => 'Failed to fetch pending registrations: ' . $e->getMessage(),
        'success' => false
    ]);
}
?>
