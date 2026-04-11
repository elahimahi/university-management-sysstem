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

try {
    // If user is regular admin, exclude superadmin users
    $whereClause = "";
    if ($user['role'] === 'admin') {
        $whereClause = "WHERE role != 'superadmin'";
    }

    $stmt = $pdo->prepare("
        SELECT
            id,
            email,
            first_name,
            last_name,
            role,
            approval_status,
            created_at,
            updated_at
        FROM users
        $whereClause
        ORDER BY created_at DESC
    ");

    $stmt->execute();
    $users = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'users' => $users,
        'total' => count($users)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
