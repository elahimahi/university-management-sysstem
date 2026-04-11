<?php
/**
 * Get Faculty Notifications Endpoint
 * GET /faculty/get_notifications.php
 */

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

$user = requireFacultyAuth();

try {
    $stmt = $pdo->prepare("SELECT id, recipient_id, recipient_role, actor_id, message, notification_type, status, created_at FROM notifications WHERE recipient_id = ? AND recipient_role = 'faculty' ORDER BY created_at DESC");
    $stmt->execute([$user['id']]);
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($notifications as &$notification) {
        $createdAt = new DateTime($notification['created_at']);
        $notification['created_at_formatted'] = $createdAt->format('M d, Y H:i');
    }

    echo json_encode([
        'status' => 'success',
        'notifications' => $notifications,
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>