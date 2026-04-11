<?php
/**
 * Live Activity Stream Endpoint
 * GET /admin/live-activity
 * 
 * Returns real-time activity feed from:
 * - Recent payments
 * - Pending registrations
 * - Overdue fees
 * - Recent assignment submissions
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Only admin can access live activity
$user = requireAdminAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit();
}

try {
    $activities = [];

    // 1. Recent Payments (Last 10 minutes)
    $tenMinutesAgo = date('Y-m-d H:i:s', time() - 600);
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 5
                'payment' as type,
                CONCAT('💳 Payment from ', u.first_name, ' ', u.last_name) as title,
                CONCAT('₹', p.amount, ' via ', p.payment_method, ' - ', f.description) as description,
                p.payment_date as timestamp
            FROM payments p
            JOIN users u ON p.student_id = u.id
            JOIN fees f ON p.fee_id = f.id
            WHERE p.payment_date > ?
            ORDER BY p.payment_date DESC
        ");
        $stmt->execute([$tenMinutesAgo]);
        $payments = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $payments);
    } catch (PDOException $e) {
        error_log('Live activity - payments error: ' . $e->getMessage());
    }

    // 2. Pending Registrations (recent)
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 5
                'registration' as type,
                CONCAT('👥 New Registration - ', u.first_name, ' ', u.last_name) as title,
                CONCAT(u.email, ' | Role: ', u.role, ' | Status: ', u.approval_status) as description,
                u.created_at as timestamp
            FROM users u
            WHERE u.approval_status = 'pending' AND u.created_at > ?
            ORDER BY u.created_at DESC
        ");
        $stmt->execute([$tenMinutesAgo]);
        $registrations = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $registrations);
    } catch (PDOException $e) {
        error_log('Live activity - registrations error: ' . $e->getMessage());
    }

    // 3. Overdue Fees (just triggered)
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 5
                'fee_overdue' as type,
                CONCAT('⚠️ Overdue - ', u.first_name, ' ', u.last_name) as title,
                CONCAT('₹', f.amount, ' due for ', f.description, ' - Days overdue: ', DATEDIFF(DAY, f.due_date, GETDATE())) as description,
                f.due_date as timestamp
            FROM fees f
            JOIN users u ON f.student_id = u.id
            WHERE f.status IN ('overdue', 'pending')
                AND f.due_date < GETDATE()
                AND DATEDIFF(DAY, f.due_date, GETDATE()) <= 7
            ORDER BY f.due_date DESC
        ");
        $stmt->execute();
        $overdues = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $overdues);
    } catch (PDOException $e) {
        error_log('Live activity - overdue fees error: ' . $e->getMessage());
    }

    // 4. Recent Assignment Submissions
    try {
        $stmt = $pdo->prepare("
            SELECT TOP 5
                'assignment' as type,
                CONCAT('📝 Assignment Submitted - ', u.first_name, ' ', u.last_name) as title,
                CONCAT(ca.title, ' | Course: ', c.code) as description,
                asub.submitted_at as timestamp
            FROM assignment_submissions asub
            JOIN course_assignments ca ON asub.assignment_id = ca.id
            JOIN courses c ON ca.course_id = c.id
            JOIN enrollments e ON asub.enrollment_id = e.id
            JOIN users u ON e.student_id = u.id
            WHERE asub.submitted_at > ?
            ORDER BY asub.submitted_at DESC
        ");
        $stmt->execute([$tenMinutesAgo]);
        $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $activities = array_merge($activities, $submissions);
    } catch (PDOException $e) {
        error_log('Live activity - submissions error: ' . $e->getMessage());
    }

    // Sort all activities by timestamp (most recent first)
    usort($activities, function($a, $b) {
        return strtotime($b['timestamp']) - strtotime($a['timestamp']);
    });

    // Return top 15 recent activities
    $recentActivities = array_slice($activities, 0, 15);

    // Convert timestamps to ISO format for frontend
    foreach ($recentActivities as &$activity) {
        $activity['timestamp'] = date('c', strtotime($activity['timestamp']));
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'activities' => $recentActivities,
        'count' => count($recentActivities),
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fetch live activity: ' . $e->getMessage()
    ]);
}
?>
