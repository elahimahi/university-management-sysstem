<?php
/**
 * Get Student Notifications
 * GET /student/notifications
 *
 * Returns all notifications for the authenticated student from both
 * admin_notifications (fees) and notifications (grades, assignments, etc).
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireStudentAuth();

try {
    $formatted = [];
    
    // Fetch from admin_notifications (fee-related notifications)
    $stmt = $pdo->prepare("SELECT
            an.id,
            an.student_id,
            an.fee_id,
            an.amount,
            an.payment_method,
            an.fee_description,
            an.transaction_id,
            an.status AS notification_status,
            an.created_at,
            'admin' AS table_source
        FROM admin_notifications an
        WHERE an.student_id = ?");
    $stmt->execute([$user['id']]);
    $adminNotifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Fetch from notifications (grades, assignments, etc.)
    $stmt = $pdo->prepare("SELECT
            n.id,
            n.recipient_id,
            n.message,
            n.notification_type,
            n.status,
            n.created_at,
            'notifications' AS table_source
        FROM notifications n
        WHERE n.recipient_id = ? AND n.recipient_role = 'student'
        ORDER BY n.created_at DESC");
    $stmt->execute([$user['id']]);
    $stdNotifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format admin_notifications (fees)
    $formattedAdmin = array_map(function ($notif) {
        $paymentMethod = isset($notif['payment_method']) ? ucfirst($notif['payment_method']) : 'Unknown';
        $status = $notif['notification_status'] ?? 'unread';
        $message = trim("{$notif['fee_description']} ({$paymentMethod})");
        if (empty($message)) {
            $message = "Notification for fee #{$notif['fee_id']}";
        }

        $notificationType = strtolower($notif['payment_method'] ?? 'fee');
        // If payment_method is already a notification_type, use it
        if (in_array($notificationType, ['assignment', 'attendance', 'grade', 'enrollment'], true)) {
            $message = trim($notif['fee_description'] ?? '') ?: ucfirst($notificationType) . ' notification';
        } else {
            $notificationType = 'fee';
        }

        return [
            'id' => (int)$notif['id'],
            'fee_id' => isset($notif['fee_id']) ? (int)$notif['fee_id'] : null,
            'amount' => isset($notif['amount']) ? (float)$notif['amount'] : 0.0,
            'payment_method' => $paymentMethod,
            'fee_description' => $notif['fee_description'] ?? '',
            'transaction_id' => $notif['transaction_id'] ?? null,
            'notification_type' => $notificationType,
            'status' => $status,
            'message' => $message,
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at'])),
        ];
    }, $adminNotifications);

    // Format notifications (grades, assignments, etc.)
    $formattedStd = array_map(function ($notif) {
        $status = $notif['status'] ?? 'unread';
        $notificationType = strtolower($notif['notification_type'] ?? 'general');
        
        return [
            'id' => (int)$notif['id'],
            'notification_type' => $notificationType,
            'status' => $status,
            'message' => $notif['message'] ?? 'No message',
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at'])),
        ];
    }, $stdNotifications);

    // Merge and sort by created_at descending
    $formatted = array_merge($formattedAdmin, $formattedStd);
    usort($formatted, function ($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    $unreadCount = count(array_filter($formatted, function ($item) {
        return $item['status'] === 'unread';
    }));

    echo json_encode([
        'status' => 'success',
        'notifications' => $formatted,
        'unread_count' => $unreadCount,
        'total_count' => count($formatted),
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error', 'details' => $e->getMessage()]);
}
?>