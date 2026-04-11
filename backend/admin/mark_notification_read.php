<?php
/**
 * Mark Notification as Read
 * POST /admin/notifications/mark-read
 * 
 * Mark a single notification as read
 */

// ============================================
// CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is superadmin
$user = requireAuth();
if ($user['role'] !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized - SuperAdmin access required']);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    $notification_id = $data['notification_id'] ?? null;

    if (!$notification_id) {
        http_response_code(400);
        echo json_encode(['error' => 'notification_id is required']);
        exit;
    }

    // Update notification status
    $stmt = $pdo->prepare('
        UPDATE admin_notifications 
        SET status = ? 
        WHERE id = ?
    ');
    $stmt->execute(['read', $notification_id]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Notification marked as read'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
