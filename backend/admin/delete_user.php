<?php
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

// Require admin authentication
$user = requireAuth();

// Only allow admin and superadmin roles
if (!in_array($user['role'], ['admin', 'superadmin'])) {
    http_response_code(403);
    echo json_encode([
        'status' => 'error',
        'message' => 'Access denied. Admin privileges required.'
    ]);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['user_id'])) {
    http_response_code(400);
    echo json_encode(['message' => 'User ID is required']);
    exit;
}

$userId = $data['user_id'];

try {
    // Check if the user to be deleted exists and get their role
    $checkStmt = $pdo->prepare("SELECT role FROM users WHERE id = ?");
    $checkStmt->execute([$userId]);
    $targetUser = $checkStmt->fetch();

    if (!$targetUser) {
        http_response_code(404);
        echo json_encode(['message' => 'User not found']);
        exit;
    }

    // Prevent deleting superadmin accounts
    if ($targetUser['role'] === 'superadmin') {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Cannot delete superadmin accounts'
        ]);
        exit;
    }

    // Regular admins cannot delete other admin accounts
    if ($user['role'] === 'admin' && $targetUser['role'] === 'admin') {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Regular admins cannot delete other admin accounts'
        ]);
        exit;
    }

    // Only superadmin can delete admin accounts
    if ($user['role'] === 'admin' && in_array($targetUser['role'], ['admin'])) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Only superadmin can delete admin accounts'
        ]);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
    $stmt->execute([$userId]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'User deleted successfully'
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
