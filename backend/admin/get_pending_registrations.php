<?php
/**
 * Get Pending User Registrations for Admin Approval
 * GET /admin/pending-registrations
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../core/db_connect.php';

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
