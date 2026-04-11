<?php
/**
 * Get Admin Notifications
 * GET /admin/notifications
 * 
 * Returns all payment notifications for admin
 * Can filter by status (read/unread)
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
    $status_filter = $_GET['status'] ?? 'all'; // all, read, unread
    
    // Base query
    $where_clause = '1=1';
    if ($status_filter === 'unread') {
        $where_clause = "status = 'unread'";
    } elseif ($status_filter === 'read') {
        $where_clause = "status = 'read'";
    }

    // Get all notifications
    $stmt = $pdo->prepare("
        SELECT 
            an.id,
            an.student_id,
            an.fee_id,
            an.amount,
            an.payment_method,
            an.fee_description,
            an.status,
            an.created_at,
            u.first_name,
            u.last_name,
            u.email,
            u.phone
        FROM admin_notifications an
        JOIN users u ON an.student_id = u.id
        WHERE $where_clause
        ORDER BY an.created_at DESC
    ");
    
    $stmt->execute();
    $notifications = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Count unread notifications
    $count_stmt = $pdo->query("SELECT COUNT(*) as unread_count FROM admin_notifications WHERE status = 'unread'");
    $count_result = $count_stmt->fetch();
    $unread_count = $count_result['unread_count'] ?? 0;

    // Format notifications
    $formatted = array_map(function($notif) {
        return [
            'id' => $notif['id'],
            'student_id' => $notif['student_id'],
            'student_name' => $notif['first_name'] . ' ' . $notif['last_name'],
            'email' => $notif['email'],
            'phone' => $notif['phone'],
            'fee_id' => $notif['fee_id'],
            'amount' => (float)$notif['amount'],
            'payment_method' => ucfirst($notif['payment_method']),
            'fee_description' => $notif['fee_description'],
            'status' => $notif['status'],
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at']))
        ];
    }, $notifications);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'notifications' => $formatted,
        'unread_count' => $unread_count,
        'total_count' => count($formatted)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
