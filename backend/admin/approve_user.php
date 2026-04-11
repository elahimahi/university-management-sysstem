<?php
/**
 * Approve User Registration
 * POST /admin/approve-user
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

if (!$userId || !$adminId) {
    http_response_code(400);
    echo json_encode(['message' => 'user_id and admin_id are required']);
    exit;
}

try {
    // Verify admin has authority to approve
    $adminStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $adminStmt->execute([$adminId]);
    $admin = $adminStmt->fetch();
    
    if (!$admin || $admin['role'] !== 'superadmin') {
        http_response_code(403);
        echo json_encode(['message' => 'Only superadmins can approve registrations']);
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
    
    // Approve the user
    $updateStmt = $pdo->prepare("
        UPDATE users 
        SET approval_status = 'approved', 
            approved_by = ?,
            updated_at = GETDATE()
        WHERE id = ?
    ");
    $updateStmt->execute([$adminId, $userId]);

    if (in_array($user['role'], ['student', 'faculty'], true)) {
        $approvalMessage = sprintf(
            'Your %s registration has been approved by SuperAdmin. You can now log in and continue.',
            $user['role']
        );
        $notifyStmt = $pdo->prepare("INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, ?, ?, ?, ?, ?)");
        $notifyStmt->execute([$userId, $user['role'], $adminId, $approvalMessage, 'registration', 'unread']);
    }

    http_response_code(200);
    echo json_encode([
        'message' => 'User approved successfully',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['role'],
            'approval_status' => 'approved'
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to approve user: ' . $e->getMessage()]);
}
?>
