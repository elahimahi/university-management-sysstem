<?php
/**
 * Mark Faculty Notification As Read Endpoint
 * POST /faculty/mark_notification_read.php
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

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['notification_id'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'notification_id is required']);
    exit();
}

$notificationId = (int)$input['notification_id'];

try {
    $stmt = $pdo->prepare("UPDATE notifications SET status = 'read' WHERE id = ? AND recipient_id = ? AND recipient_role = 'faculty'");
    $stmt->execute([$notificationId, $user['id']]);

    if ($stmt->rowCount() === 0) {
        http_response_code(404);
        echo json_encode(['status' => 'error', 'message' => 'Notification not found or not accessible']);
        exit();
    }

    echo json_encode(['status' => 'success', 'message' => 'Notification marked as read']);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>