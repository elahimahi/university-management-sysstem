<?php
/**
 * Send Pending Fees Reminder SMS
 * GET|POST /payment/send-pending-reminder
 * 
 * Send reminder SMS to a specific student about their pending fees
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

$student_id = $_GET['student_id'] ?? $_POST['student_id'] ?? null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'student_id is required']);
    exit;
}

try {
    // Get student details
    $student_stmt = $pdo->prepare('SELECT id, first_name, last_name, phone FROM users WHERE id = ? AND role = ?');
    $student_stmt->execute([$student_id, 'student']);
    $student = $student_stmt->fetch();
    
    if (!$student) {
        http_response_code(404);
        echo json_encode(['error' => 'Student not found']);
        exit;
    }

    // Get pending fees
    $fees_stmt = $pdo->prepare('
        SELECT COUNT(*) as count, ISNULL(SUM(amount - ISNULL((SELECT SUM(amount_paid) FROM payments WHERE fee_id = fees.id), 0)), 0) as total_pending
        FROM fees 
        WHERE student_id = ? AND status != ?
    ');
    $fees_stmt->execute([$student_id, 'paid']);
    $fees = $fees_stmt->fetch();
    
    $pending_count = (int)($fees['count'] ?? 0);
    $total_pending = (float)($fees['total_pending'] ?? 0);

    if ($pending_count == 0) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'No pending fees to remind about',
            'pending_count' => 0
        ]);
        exit;
    }

    // Send SMS
    $sms_service = new SMSService($pdo);
    $student_name = $student['first_name'] . ' ' . $student['last_name'];
    $phone = $student['phone'];

    if (!$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'No phone number on file for this student']);
        exit;
    }

    // Get total fee amount
    $total_stmt = $pdo->prepare('SELECT SUM(amount) as total FROM fees WHERE student_id = ? AND status != ?');
    $total_stmt->execute([$student_id, 'paid']);
    $total_result = $total_stmt->fetch();
    $total_amount = (float)($total_result['total'] ?? 0);

    $sms_result = $sms_service->sendPendingFeesReminder(
        $phone,
        $student_name,
        $total_pending,
        $pending_count,
        $total_amount,
        $student_id
    );

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Pending fees reminder sent',
        'student' => $student_name,
        'phone' => $phone,
        'pending_count' => $pending_count,
        'total_pending' => $total_pending,
        'sms_result' => $sms_result
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
