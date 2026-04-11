<?php
/**
 * Check Overdue Fees and Create Notifications
 * This should be called periodically (e.g., via cron job) or on demand
 * POST /admin/check-overdue-fees
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';
require_once __DIR__ . '/../core/sms_service.php';

header('Content-Type: application/json');

// Check if user is superadmin
$user = requireAuth();
if ($user['role'] !== 'superadmin') {
    http_response_code(403);
    echo json_encode(['error' => 'Unauthorized - SuperAdmin access required']);
    exit;
}

try {
    // Find all overdue fees that haven't been notified yet
    $stmt = $pdo->prepare("
        SELECT 
            f.id as fee_id,
            f.student_id,
            f.description,
            f.amount,
            f.due_date,
            f.payment_deadline,
            f.status,
            u.first_name,
            u.last_name,
            u.email,
            u.phone,
            DATEDIFF(DAY, f.payment_deadline, GETDATE()) as days_overdue,
            ISNULL((SELECT SUM(amount_paid) FROM payments p WHERE p.fee_id = f.id), 0) as total_paid
        FROM fees f
        JOIN users u ON f.student_id = u.id
        WHERE f.payment_deadline IS NOT NULL
        AND CAST(f.payment_deadline AS DATE) < CAST(GETDATE() AS DATE)
        AND f.status IN ('pending', 'partially_paid')
        AND NOT EXISTS (
            SELECT 1 FROM admin_notifications an 
            WHERE an.fee_id = f.id 
            AND an.payment_method = 'overdue'
            AND an.created_at > DATEADD(DAY, -1, GETDATE())
        )
        ORDER BY f.payment_deadline DESC
    ");
    
    $stmt->execute();
    $overdueFeatures = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $notificationsCreated = 0;
    $smsSent = 0;
    
    foreach ($overdueFeatures as $fee) {
        // Calculate days overdue
        $daysOverdue = max(0, (int)$fee['days_overdue']);
        $studentName = $fee['first_name'] . ' ' . $fee['last_name'];
        
        // Calculate remaining amount
        $remainingAmount = (float)$fee['amount'] - (float)$fee['total_paid'];
        
        // Create admin notification
        $notifyStmt = $pdo->prepare("
            INSERT INTO admin_notifications 
            (student_id, fee_id, amount, payment_method, fee_description, status, created_at)
            VALUES (?, ?, ?, ?, ?, ?, GETDATE())
        ");
        
        // More descriptive notification message
        $notificationMessage = "🚨 PAYMENT NOT RECEIVED - OVERDUE | {$studentName} | Fee: {$fee['description']} | Amount Due: ৳{$remainingAmount} | {$daysOverdue} Day(s) Late";
        
        $notifyStmt->execute([
            $fee['student_id'],
            $fee['fee_id'],
            $remainingAmount,
            'overdue',
            $notificationMessage,
            'unread'
        ]);
        
        $notificationsCreated++;
        
        // Do NOT send SMS to student - only admin notification
        // (Student SMS disabled per requirement)
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Overdue check completed',
        'notifications_created' => $notificationsCreated,
        'sms_sent' => $smsSent,
        'overdue_fees_found' => count($overdueFeatures)
    ]);

} catch (Exception $e) {
    error_log('Overdue fees check error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'Failed to check overdue fees', 'details' => $e->getMessage()]);
}
?>
