<?php
/**
 * Check and Apply Penalties for Overdue Fees
 * POST /admin/apply_penalties.php
 * 
 * This endpoint:
 * 1. Finds all fees past their payment deadline
 * 2. Applies penalties based on penalty_config
 * 3. Sends SMS notifications to students
 * 
 * Request body (optional):
 * {
 *   "fee_id": 5,  // Apply penalty to specific fee only
 *   "send_sms": true  // Send SMS notifications
 * }
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);
$specific_fee_id = $data['fee_id'] ?? null;
$send_sms = $data['send_sms'] ?? true;

try {
    // Find fees that need penalty
    $query = '
        SELECT f.id, f.student_id, f.amount, f.status, f.penalty_applied, 
               f.payment_deadline, pc.penalty_percentage, pc.penalty_flat_amount, 
               pc.penalty_type, pc.apply_after_days, u.phone, u.first_name
        FROM fees f
        LEFT JOIN penalty_config pc ON f.id = pc.fee_id
        LEFT JOIN users u ON f.student_id = u.id
        WHERE f.status = "pending" 
          AND f.payment_deadline IS NOT NULL
          AND f.payment_deadline < GETDATE()
          AND f.penalty_applied = 0
    ';

    if ($specific_fee_id) {
        $query .= ' AND f.id = ?';
        $stmt = $pdo->prepare($query);
        $stmt->execute([$specific_fee_id]);
    } else {
        $stmt = $pdo->prepare($query);
        $stmt->execute();
    }

    $fees_needing_penalty = $stmt->fetchAll();
    $penalties_applied = [];
    $sms_sent = [];

    foreach ($fees_needing_penalty as $fee) {
        try {
            $fee_id = $fee['id'];
            $student_id = $fee['student_id'];
            $phone = $fee['phone'];
            $student_name = $fee['first_name'];
            $original_amount = (float)$fee['amount'];
            $penalty_percentage = (float)($fee['penalty_percentage'] ?? 5);
            $penalty_flat = (float)($fee['penalty_flat_amount'] ?? 0);
            $penalty_type = $fee['penalty_type'] ?? 'percentage';

            // Calculate penalty amount
            $penalty_amount = 0;
            if ($penalty_type === 'percentage') {
                $penalty_amount = ($original_amount * $penalty_percentage) / 100;
            } elseif ($penalty_type === 'flat') {
                $penalty_amount = $penalty_flat;
            } elseif ($penalty_type === 'combined') {
                $penalty_amount = (($original_amount * $penalty_percentage) / 100) + $penalty_flat;
            }

            // Update fee with penalty
            $update_fee = $pdo->prepare('
                UPDATE fees 
                SET penalty_applied = 1, 
                    penalty_amount = ?
                WHERE id = ?
            ');
            $update_fee->execute([$penalty_amount, $fee_id]);

            $new_total = $original_amount + $penalty_amount;
            $penalties_applied[] = [
                'fee_id' => $fee_id,
                'student_id' => $student_id,
                'original_amount' => $original_amount,
                'penalty_amount' => $penalty_amount,
                'new_total' => $new_total,
                'penalty_type' => $penalty_type
            ];

            // Send SMS if enabled and phone exists
            if ($send_sms && $phone) {
                $sms_service = new SMSService();
                $sms_message = "আমাদের বিশ্ববিদ্যালয়: জরুরি বিজ্ঞপ্তি\n";
                $sms_message .= "প্রিয় {$student_name},\n";
                $sms_message .= "আপনার পেমেন্ট মেয়াদ শেষ হয়ে গেছে। \n";
                $sms_message .= "মূল পরিমাণ: ৳{$original_amount}\n";
                $sms_message .= "পেনাল্টি: ৳{$penalty_amount}\n";
                $sms_message .= "মোট পরিমাণ: ৳{$new_total}\n";
                $sms_message .= "অবিলম্বে পরিশোধ করুন। যোগাযোগ: support@university.edu";

                $sms_service->sendSMS($phone, $sms_message, 'penalty_notice', $student_id);
                $sms_sent[] = [
                    'student_id' => $student_id,
                    'phone' => $phone,
                    'status' => 'sent'
                ];
            }

        } catch (Exception $e) {
            $penalties_applied[] = [
                'fee_id' => $fee['id'],
                'student_id' => $fee['student_id'],
                'error' => 'Failed to apply penalty: ' . $e->getMessage()
            ];
        }
    }

    echo json_encode([
        'success' => true,
        'message' => 'Penalty application process completed',
        'penalties_count' => count($penalties_applied),
        'penalties_applied' => $penalties_applied,
        'sms_notifications_sent' => count($sms_sent),
        'sms_details' => $send_sms ? $sms_sent : []
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to apply penalties: ' . $e->getMessage()
    ]);
}
?>
