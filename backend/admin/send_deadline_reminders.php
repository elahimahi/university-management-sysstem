<?php
/**
 * Send Payment Deadline Reminder SMS to Students
 * POST /admin/send_deadline_reminders.php
 * 
 * Sends SMS to students with upcoming payment deadlines (within specified hours)
 * 
 * Request body:
 * {
 *   "hours_before_deadline": 24,  // Send reminder 24 hours before deadline
 *   "status": "pending"  // Only for pending fees
 * }
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$hours_before = $data['hours_before_deadline'] ?? 24;
$status = $data['status'] ?? 'pending';

try {
    // Find fees with deadlines approaching
    $query = '
        SELECT DISTINCT
            f.id as fee_id,
            f.student_id,
            f.description,
            f.amount,
            f.payment_deadline,
            u.first_name,
            u.last_name,
            u.phone,
            ISNULL(SUM(p.amount_paid), 0) as paid_amount
        FROM fees f
        LEFT JOIN payments p ON f.id = p.fee_id
        LEFT JOIN users u ON f.student_id = u.id
        WHERE f.status = ?
          AND f.payment_deadline IS NOT NULL
          AND DATEDIFF(HOUR, GETDATE(), f.payment_deadline) BETWEEN 0 AND ?
          AND DATEDIFF(HOUR, GETDATE(), f.payment_deadline) > 0
        GROUP BY f.id, f.student_id, f.description, f.amount, f.payment_deadline,
                 u.first_name, u.last_name, u.phone
        ORDER BY f.payment_deadline ASC
    ';

    $stmt = $pdo->prepare($query);
    $stmt->execute([$status, $hours_before]);
    $fees_to_remind = $stmt->fetchAll();

    $reminders_sent = [];
    $sms_service = new SMSService();

    foreach ($fees_to_remind as $fee) {
        try {
            $student_id = $fee['student_id'];
            $phone = $fee['phone'];
            $student_name = $fee['first_name'];
            $amount = (float)$fee['amount'];
            $paid = (float)$fee['paid_amount'];
            $remaining = $amount - $paid;

            if (!$phone) {
                $reminders_sent[] = [
                    'fee_id' => $fee['fee_id'],
                    'student_id' => $student_id,
                    'status' => 'skipped',
                    'reason' => 'No phone number on file'
                ];
                continue;
            }

            // Format deadline
            $deadline = new DateTime($fee['payment_deadline']);
            $deadline_formatted = $deadline->format('d/m/Y H:i');

            // Send SMS reminder
            $reminder_message = "আমাদের বিশ্ববিদ্যালয়: অর্থপ্রদান স্মরণপত্র\n";
            $reminder_message .= "প্রিয় {$student_name},\n";
            $reminder_message .= "আপনার পেমেন্টের মেয়াদ শীঘ্রই শেষ হবে।\n";
            $reminder_message .= "পাওয়া বাকি: ৳" . number_format($remaining, 2) . "\n";
            $reminder_message .= "মেয়াদ: {$deadline_formatted}\n";
            $reminder_message .= "এখনই পেমেন্ট করুন। যোগাযোগ: support@university.edu";

            $result = $sms_service->sendSMS($phone, $reminder_message, 'pending_reminder', $student_id);
            
            $reminders_sent[] = [
                'fee_id' => $fee['fee_id'],
                'student_id' => $student_id,
                'phone' => $phone,
                'remaining_amount' => $remaining,
                'status' => 'sent'
            ];

        } catch (Exception $e) {
            $reminders_sent[] = [
                'fee_id' => $fee['fee_id'],
                'student_id' => $fee['student_id'],
                'status' => 'failed',
                'error' => $e->getMessage()
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => "Deadline reminders processed",
        'total_reminders_sent' => count(array_filter($reminders_sent, function($r) { return $r['status'] === 'sent'; })),
        'total_skipped' => count(array_filter($reminders_sent, function($r) { return $r['status'] === 'skipped'; })),
        'total_failed' => count(array_filter($reminders_sent, function($r) { return $r['status'] === 'failed'; })),
        'reminders' => $reminders_sent,
        'query_params' => [
            'hours_before_deadline' => $hours_before,
            'status' => $status
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to send deadline reminders: ' . $e->getMessage()
    ]);
}
?>
