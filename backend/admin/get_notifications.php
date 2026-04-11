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
ob_start();

// Allow requests from localhost (all ports)
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Set appropriate origin header
if (in_array($origin, $allowed_origins) && !empty($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} elseif (empty($origin)) {
    header('Access-Control-Allow-Origin: http://localhost', true);
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

http_response_code(200);
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

$user = requireAdminAuth();

try {
    $allNotifications = [];
    
    // Get notification type filter (optional)
    // Types: 'all', 'payment', 'registration', 'account_creation'
    $notificationType = isset($_GET['type']) ? strtolower($_GET['type']) : 'all';

    // 1. Fetch PAYMENT notifications from admin_notifications
    $paymentNotifications = [];
    if ($notificationType === 'all' || $notificationType === 'payment') {
        $stmtPayment = $pdo->prepare("
            SELECT
                an.id,
                an.student_id,
                an.fee_id,
                an.amount,
                an.payment_method,
                an.fee_description,
                an.transaction_id,
                an.status AS notification_status,
                an.created_at,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                f.amount AS fee_amount,
                f.status AS fee_status,
                ISNULL((SELECT CAST(SUM(amount_paid) AS FLOAT) FROM payments p WHERE p.fee_id = an.fee_id), 0.0) AS total_paid,
                'payment' AS notification_source
            FROM admin_notifications an
            JOIN users u ON an.student_id = u.id
            LEFT JOIN fees f ON an.fee_id = f.id
            WHERE an.payment_method IS NULL OR LOWER(an.payment_method) <> 'assignment'
        ");
        
        $stmtPayment->execute();
        $paymentNotifications = $stmtPayment->fetchAll(PDO::FETCH_ASSOC);
    }

    // 2. Fetch ACCOUNT CREATION notifications (new user registrations)
    $accountCreationNotifications = [];
    if ($notificationType === 'all' || $notificationType === 'account_creation') {
        $stmtAccountCreation = $pdo->prepare("
            SELECT
                n.id,
                n.recipient_id,
                n.actor_id,
                n.message,
                n.notification_type,
                n.status,
                n.created_at,
                u.first_name,
                u.last_name,
                u.email,
                u.role,
                ar.role as actor_role,
                'account_creation' AS notification_source
            FROM notifications n
            JOIN users u ON n.actor_id = u.id
            LEFT JOIN users ar ON ar.id = n.actor_id
            WHERE n.recipient_role = 'superadmin' 
            AND n.notification_type IN ('account_created', 'new_faculty', 'new_student', 'registration')
            AND (n.message LIKE '%account%' OR n.message LIKE '%registered%' OR n.message LIKE '%created%')
        ");

        $stmtAccountCreation->execute();
        $accountCreationNotifications = $stmtAccountCreation->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. Fetch REGISTRATION notifications (approvals/pending only)
    $registrationNotifications = [];
    if ($notificationType === 'all' || $notificationType === 'registration') {
        $stmtReg = $pdo->prepare("
            SELECT
                n.id,
                n.recipient_id,
                n.actor_id,
                n.message,
                n.notification_type,
                n.status,
                n.created_at,
                u.first_name,
                u.last_name,
                u.email,
                ar.role as actor_role,
                'registration' AS notification_source
            FROM notifications n
            JOIN users u ON n.actor_id = u.id
            LEFT JOIN users ar ON ar.id = n.actor_id
            WHERE n.recipient_role = 'superadmin' 
            AND n.notification_type = 'registration'
            AND NOT (n.message LIKE '%account%' OR n.message LIKE '%registered%' OR n.message LIKE '%created%')
        ");

        $stmtReg->execute();
        $registrationNotifications = $stmtReg->fetchAll(PDO::FETCH_ASSOC);
    }

    // 3. Format PAYMENT notifications
    $formattedPayments = array_map(function($notif) {
        $totalPaid = isset($notif['total_paid']) ? (float)$notif['total_paid'] : 0.0;
        $feeAmount = isset($notif['fee_amount']) ? (float)$notif['fee_amount'] : 0.0;
        
        if ($feeAmount <= 0 && $totalPaid > 0) {
            $feeAmount = $totalPaid;
        }
        
        $paymentStatus = 'unpaid';
        if ($totalPaid > 0) {
            if ($feeAmount > 0) {
                $paymentStatus = ($totalPaid >= $feeAmount) ? 'full' : 'partial';
            } else {
                $paymentStatus = 'full';
            }
        }

        return [
            'id' => $notif['id'],
            'student_id' => $notif['student_id'],
            'student_name' => $notif['first_name'] . ' ' . $notif['last_name'],
            'email' => $notif['email'],
            'phone' => $notif['phone'],
            'fee_id' => $notif['fee_id'],
            'transaction_id' => $notif['transaction_id'] ?? null,
            'amount' => (float)$notif['amount'],
            'fee_amount' => $feeAmount,
            'total_paid' => $totalPaid,
            'payment_status' => $paymentStatus,
            'payment_method' => ucfirst($notif['payment_method']),
            'fee_description' => $notif['fee_description'],
            'notification_type' => 'payment',
            'status' => $notif['notification_status'],
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at']))
        ];
    }, $paymentNotifications);

    // 4. Format REGISTRATION notifications
    $formattedRegistrations = array_map(function($notif) {
        return [
            'id' => $notif['id'],
            'student_id' => $notif['actor_id'],
            'student_name' => $notif['first_name'] . ' ' . $notif['last_name'],
            'email' => $notif['email'],
            'phone' => '',
            'notification_type' => 'registration',
            'message' => $notif['message'],
            'status' => $notif['status'],
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at']))
        ];
    }, $registrationNotifications);

    // 4. Format ACCOUNT CREATION notifications
    $formattedAccountCreation = array_map(function($notif) {
        return [
            'id' => $notif['id'],
            'student_id' => $notif['actor_id'],
            'student_name' => $notif['first_name'] . ' ' . $notif['last_name'],
            'email' => $notif['email'],
            'phone' => '',
            'notification_type' => 'account_creation',
            'user_role' => $notif['role'] ?? 'user',
            'message' => $notif['message'],
            'status' => $notif['status'],
            'created_at' => $notif['created_at'],
            'created_at_formatted' => date('M d, Y H:i', strtotime($notif['created_at']))
        ];
    }, $accountCreationNotifications);

    // 5. Merge all types and sort by created_at DESC
    $allNotifications = array_merge($formattedPayments, $formattedRegistrations, $formattedAccountCreation);
    usort($allNotifications, function($a, $b) {
        return strtotime($b['created_at']) - strtotime($a['created_at']);
    });

    // Count unread
    $unread_count = count(array_filter($allNotifications, function($n) {
        return $n['status'] === 'unread';
    }));
    $total_count = count($allNotifications);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'notifications' => $allNotifications,
        'unread_count' => $unread_count,
        'total_count' => $total_count
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
