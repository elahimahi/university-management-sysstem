<?php
/**
 * Check for pending payments past deadline
 * Sends notifications to both admin and students
 * POST /admin/check-pending-payments
 */

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

// Optional: Check admin authorization (can be run as cron)
// $user = requireAuth();
// if ($user && $user['role'] !== 'superadmin') {
//     http_response_code(403);
//     echo json_encode(['error' => 'Unauthorized']);
//     exit;
// }

// Initialize variables
$response = [
    'success' => false,
    'message' => '',
    'pending_fees_found' => 0,
    'overdue_fees_found' => 0,
    'student_notifications_created' => 0,
    'admin_notifications_created' => 0
];

try {
    if (!$pdo) {
        throw new Exception('Database connection failed');
    }

    $current_date = date('Y-m-d');
    $pendingFees = [];
    $pendingFeeCount = 0;
    $studentNotificationsCreated = 0;
    $adminNotificationsCreated = 0;
    $overdueFeesCount = 0;
    
    // Find all pending fees
    try {
        $stmt = $pdo->prepare("
            SELECT 
                f.id as fee_id,
                f.student_id,
                f.description,
                f.amount,
                f.due_date,
                f.status,
                u.first_name,
                u.last_name,
                u.email,
                u.phone,
                ISNULL((SELECT SUM(amount_paid) FROM payments WHERE fee_id = f.id), 0) as total_paid
            FROM fees f
            JOIN users u ON f.student_id = u.id
            WHERE f.status NOT IN ('paid')
            ORDER BY f.due_date ASC
        ");
        
        $stmt->execute();
        $pendingFees = $stmt->fetchAll(PDO::FETCH_ASSOC);
    } catch (Exception $queryErr) {
        error_log('Payment check query error: ' . $queryErr->getMessage());
        $pendingFees = [];
    }
    
    // Process pending fees and create notifications only for overdue items
    foreach ($pendingFees as $fee) {
        $totalPaid = (float)$fee['total_paid'];
        $remainingAmount = (float)$fee['amount'] - $totalPaid;
        
        if ($remainingAmount <= 0) {
            continue; // Skip if already fully paid
        }
        
        $pendingFeeCount++;
        $dueDate = new DateTime($fee['due_date']);
        $today = new DateTime($current_date);
        $studentName = trim($fee['first_name'] . ' ' . $fee['last_name']);
        $feeDescription = $fee['description'];
        
        if ($dueDate < $today) {
            $overdueFeesCount++;
            
            // Avoid duplicate overdue notification for same fee today
            $notifCheck = $pdo->prepare("
                SELECT 1 FROM notifications
                WHERE recipient_id = ?
                AND notification_type = 'payment_pending'
                AND CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)
                AND message LIKE ?
            ");
            $notifCheck->execute([
                $fee['student_id'],
                "%{$feeDescription}%"
            ]);
            
            if ($notifCheck->fetch()) {
                continue;
            }
            
            // Create student notification
            try {
                $studentMsg = "⏰ Payment Pending - {$feeDescription} | Amount Due: ৳{$remainingAmount} | Deadline: " . 
                              date('M d, Y', strtotime($fee['due_date']));
                
                $notifyStmt = $pdo->prepare("
                    INSERT INTO notifications 
                    (recipient_id, recipient_role, message, notification_type, status, created_at)
                    VALUES (?, 'student', ?, 'payment_pending', 'unread', GETDATE())
                ");
                
                $notifyStmt->execute([
                    $fee['student_id'],
                    $studentMsg
                ]);
                
                $studentNotificationsCreated++;
            } catch (Exception $e) {
                error_log('Failed to create student notification: ' . $e->getMessage());
            }
            
            // Create admin notification
            try {
                $adminMsg = "🚨 Pending Payment Alert | {$studentName} | Fee: {$feeDescription} | Amount Due: ৳{$remainingAmount} | Deadline Passed: " . 
                            date('M d, Y', strtotime($fee['due_date']));
                
                $adminNotifyStmt = $pdo->prepare("
                    INSERT INTO admin_notifications 
                    (student_id, fee_id, amount, payment_method, fee_description, status, created_at)
                    VALUES (?, ?, ?, 'pending', ?, 'unread', GETDATE())
                ");
                
                $adminNotifyStmt->execute([
                    $fee['student_id'],
                    $fee['fee_id'],
                    $remainingAmount,
                    $adminMsg
                ]);
                
                $adminNotificationsCreated++;
            } catch (Exception $e) {
                error_log('Failed to create admin notification: ' . $e->getMessage());
            }
        }
    }
    
    $response['success'] = true;
    $response['message'] = 'Pending payment check completed';
    $response['pending_fees_found'] = $pendingFeeCount;
    $response['overdue_fees_found'] = $overdueFeesCount;
    $response['student_notifications_created'] = $studentNotificationsCreated;
    $response['admin_notifications_created'] = $adminNotificationsCreated;
    http_response_code(200);
    
} catch (Exception $e) {
    error_log('Payment check error: ' . $e->getMessage());
    $response['success'] = false;
    $response['message'] = 'Server error: ' . $e->getMessage();
    http_response_code(200); // Return 200 even on error for browser compatibility
}

echo json_encode($response);
?>
