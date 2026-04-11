<?php
/**
 * Mark a student notification as read
 * POST /student/notifications/read
 * 
 * Handles notifications from both admin_notifications (fees) and 
 * notifications (grades, assignments, etc) tables.
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireStudentAuth();

$data = json_decode(file_get_contents('php://input'), true);
$notification_id = isset($data['notification_id']) ? (int)$data['notification_id'] : null;

if (!$notification_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'notification_id is required']);
    exit;
}

try {
    // Check admin_notifications table first (fee-related)
    $stmt = $pdo->prepare('SELECT id FROM admin_notifications WHERE id = ? AND student_id = ?');
    $stmt->execute([$notification_id, $user['id']]);
    $notification = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($notification) {
        // Update in admin_notifications
        $update = $pdo->prepare('UPDATE admin_notifications SET status = ? WHERE id = ?');
        $update->execute(['read', $notification_id]);
        echo json_encode(['status' => 'success', 'message' => 'Notification marked as read']);
        exit;
    }

    // Check notifications table (grades, assignments, etc.)
    $stmt = $pdo->prepare('SELECT id FROM notifications WHERE id = ? AND recipient_id = ? AND recipient_role = ?');
    $stmt->execute([$notification_id, $user['id'], 'student']);
    $notification = $stmt->fetch(PDO::FETCH_ASSOC);

    if ($notification) {
        // Update in notifications
        $update = $pdo->prepare('UPDATE notifications SET status = ? WHERE id = ?');
        $update->execute(['read', $notification_id]);
        echo json_encode(['status' => 'success', 'message' => 'Notification marked as read']);
        exit;
    }

    // Notification not found in either table
    http_response_code(404);
    echo json_encode(['status' => 'error', 'message' => 'Notification not found']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error', 'details' => $e->getMessage()]);
}
?>