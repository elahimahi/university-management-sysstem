<?php
/**
 * Reject User Registration
 * POST /admin/reject-user
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
// NOW load database and execute logic
// ============================================

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid data']);
    exit;
}

$userId = $data['user_id'] ?? null;
$adminId = $data['admin_id'] ?? null;
$reason = $data['reason'] ?? 'Not specified';

if (!$userId || !$adminId) {
    http_response_code(400);
    echo json_encode(['message' => 'user_id and admin_id are required']);
    exit;
}

try {
    // Verify admin has authority to reject
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $adminStmt->execute([$adminId]);
    $admin = $adminStmt->fetch();
    
    if (!$admin || $admin['role'] !== 'superadmin') {
        http_response_code(403);
        echo json_encode(['message' => 'Only superadmins can reject registrations']);
        exit;
    }
    
    // Check if user exists and is pending
    $userStmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND approval_status = 'pending'");
    $userStmt->execute([$userId]);
    $user = $userStmt->fetch();
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['message' => 'User not found or already processed']);
        exit;
    }
    
    // Reject the user with reason
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET approval_status = 'rejected', 
            rejection_reason = ?,
            approved_by = ?,
            updated_at = GETDATE()
        WHERE id = ?
    ");
    $updateStmt->execute([$reason, $adminId, $userId]);
    
    http_response_code(200);
    echo json_encode([
        'message' => 'User rejected successfully',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['role'],
            'approval_status' => 'rejected',
            'rejection_reason' => $reason
        ]
    ]);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to reject user: ' . $e->getMessage()]);
}
?>
