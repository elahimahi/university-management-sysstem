<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireAdminAuth();

try {
    // Get inactive students notifications
    $stmt = $pdo->prepare("
        SELECT 
            an.id,
            an.student_id,
            an.message_type,
            an.message,
            an.status,
            an.created_at,
            u.first_name,
            u.last_name,
            u.email
        FROM admin_notifications an
        JOIN users u ON an.student_id = u.id
        WHERE an.message_type = 'inactive_student'
        ORDER BY an.created_at DESC
    ");
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count active/inactive by status
    $unreadCount = count(array_filter($notifications, fn($n) => $n['status'] === 'unread'));

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'notifications' => $notifications,
        'totalInactiveNotifications' => count($notifications),
        'unreadCount' => $unreadCount
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch inactive student notifications: ' . $e->getMessage()
    ]);
}
?>
