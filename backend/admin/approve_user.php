<?php
/**
 * Approve User Registration
 * POST /admin/approve-user
 * 
 * Body:
 * {
 *   "user_id": 5,
 *   "admin_id": 1
 * }
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
    
    if (!$admin || $admin['role'] !== 'admin') {
        http_response_code(403);
        echo json_encode(['message' => 'Only admins can approve registrations']);
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
