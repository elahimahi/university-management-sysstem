<?php
/**
 * Automated Fee Management Batch Job
 * POST /admin/run_fee_batch_job.php
 * 
 * This endpoint handles:
 * 1. Send deadline reminders (24 hours before deadline)
 * 2. Apply penalties (after deadline passes)
 * 3. Send penalty notifications
 * 
 * Can be called by cron job:
 * 0 *\/6 * * * curl -X POST http://localhost:8000/admin/run_fee_batch_job.php
 * 
 * Or scheduled task in Windows:
 * powershell -Command "Invoke-WebRequest -Uri 'http://localhost:8000/admin/run_fee_batch_job.php' -Method 'POST'"
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

try {
    $start_time = microtime(true);
    $executed_tasks = [];
    $errors = [];

    // Initialize SMS Service once for all tasks
    $sms_service = new SMSService($pdo);

    // Task 1: Send 24-hour deadline reminders
    try {
        $query = '
            SELECT
                f.id as fee_id,
                f.student_id,
                f.description,
                f.amount,
                f.payment_deadline,
                u.first_name,
                u.phone,
                ISNULL(SUM(p.amount_paid), 0) as paid_amount
            FROM fees f
            LEFT JOIN payments p ON f.id = p.fee_id
            LEFT JOIN users u ON f.student_id = u.id
            WHERE f.status = "pending"
              AND f.payment_deadline IS NOT NULL
              AND DATEDIFF(HOUR, GETDATE(), f.payment_deadline) BETWEEN 0 AND 24
              AND DATEDIFF(HOUR, GETDATE(), f.payment_deadline) > 0
              AND NOT EXISTS (
                  SELECT 1 FROM sms_logs sl 
                  WHERE sl.student_id = f.student_id 
                    AND sl.sms_type = "pending_reminder"
                    AND DATEDIFF(HOUR, sl.sent_at, GETDATE()) < 24
              )
            GROUP BY f.id, f.student_id, f.description, f.amount, f.payment_deadline,
                     u.first_name, u.phone
        ';

        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $fees_for_reminders = $stmt->fetchAll();

        $reminders_sent = 0;

        foreach ($fees_for_reminders as $fee) {
            try {
                $student_id = $fee['student_id'];
                $phone = $fee['phone'];
                $student_name = $fee['first_name'] ?? 'Student';
                $amount = (float)$fee['amount'];
                $paid = (float)$fee['paid_amount'];
                $remaining = $amount - $paid;

                // Skip if no phone number
                if (empty($phone) || !$student_id) {
                    continue;
                }

                // Format deadline safely
                if (!empty($fee['payment_deadline'])) {
                    try {
                        $deadline = new DateTime($fee['payment_deadline']);
                        $deadline_formatted = $deadline->format('d/m/Y H:i');
                    } catch (Exception $e) {
                        $deadline_formatted = $fee['payment_deadline'];
                    }

                    // Send SMS reminder
                    $reminder_message = "আমাদের বিশ্ববিদ্যালয়: অর্থপ্রদান স্মরণপত্র\n";
                    $reminder_message .= "প্রিয় {$student_name},\n";
                    $reminder_message .= "আপনার পেমেন্টের মেয়াদ শীঘ্রই শেষ হবে।\n";
                    $reminder_message .= "পাওয়া বাকি: ৳" . number_format($remaining, 0) . "\n";
                    $reminder_message .= "মেয়াদ: {$deadline_formatted}\n";
                    $reminder_message .= "এখনই পেমেন্ট করুন। যোগাযোগ: support@university.edu";

                    $sms_service->sendSMS($phone, $reminder_message, 'pending_reminder', $student_id);
                    $reminders_sent++;
                }

            } catch (Exception $e) {
                $errors[] = "Error sending reminder for fee {$fee['fee_id']}: {$e->getMessage()}";
            }
        }

        $executed_tasks[] = [
            'task' => 'Send 24-hour deadline reminders',
            'status' => 'completed',
            'reminders_sent' => $reminders_sent,
            'fees_processed' => count($fees_for_reminders)
        ];

    } catch (Exception $e) {
        $errors[] = "Deadline reminder task failed: {$e->getMessage()}";
    }

    // Task 2: Apply penalties for overdue fees
    try {
        $query = '
            SELECT f.id, f.student_id, f.amount, f.status, f.penalty_applied, 
                   f.payment_deadline, pc.penalty_percentage, pc.penalty_flat_amount, 
                   pc.penalty_type, u.phone, u.first_name
            FROM fees f
            LEFT JOIN penalty_config pc ON f.id = pc.fee_id
            LEFT JOIN users u ON f.student_id = u.id
            WHERE f.status = "pending" 
              AND f.payment_deadline IS NOT NULL
              AND f.payment_deadline < GETDATE()
              AND f.penalty_applied = 0
        ';

        $stmt = $pdo->prepare($query);
        $stmt->execute();
        $fees_needing_penalty = $stmt->fetchAll();

        $penalties_applied = 0;

        foreach ($fees_needing_penalty as $fee) {
            try {
                $fee_id = $fee['id'];
                $student_id = $fee['student_id'];
                $phone = $fee['phone'];
                $student_name = $fee['first_name'] ?? 'Student';
                $original_amount = (float)$fee['amount'];
                $penalty_percentage = (float)($fee['penalty_percentage'] ?? 5);
                $penalty_flat = (float)($fee['penalty_flat_amount'] ?? 0);
                $penalty_type = $fee['penalty_type'] ?? 'percentage';

                // Skip if missing critical data
                if (!$fee_id || !$student_id) {
                    continue;
                }

                // Calculate penalty amount
                $penalty_amount = 0;
                if ($penalty_type === 'percentage') {
                    $penalty_amount = ($original_amount * $penalty_percentage) / 100;
                } elseif ($penalty_type === 'flat') {
                    $penalty_amount = $penalty_flat;
                } elseif ($penalty_type === 'combined') {
                    $penalty_amount = (($original_amount * $penalty_percentage) / 100) + $penalty_flat;
                }

                // Round penalty amount to 2 decimals
                $penalty_amount = round($penalty_amount, 2);

                // Update fee with penalty
                $update_fee = $pdo->prepare('
                    UPDATE fees 
                    SET penalty_applied = 1, 
                        penalty_amount = ?
                    WHERE id = ?
                ');
                $update_fee->execute([$penalty_amount, $fee_id]);

                // Send SMS notification if phone exists
                if (!empty($phone)) {
                    $new_total = $original_amount + $penalty_amount;
                    $sms_message = "আমাদের বিশ্ববিদ্যালয়: জরুরি বিজ্ঞপ্তি\n";
                    $sms_message .= "প্রিয় {$student_name},\n";
                    $sms_message .= "আপনার পেমেন্ট মেয়াদ শেষ হয়ে গেছে। \n";
                    $sms_message .= "মূল পরিমাণ: ৳" . number_format($original_amount, 0) . "\n";
                    $sms_message .= "পেনাল্টি: ৳" . number_format($penalty_amount, 0) . "\n";
                    $sms_message .= "মোট পরিমাণ: ৳" . number_format($new_total, 0) . "\n";
                    $sms_message .= "অবিলম্বে পরিশোধ করুন। যোগাযোগ: support@university.edu";

                    $sms_service->sendSMS($phone, $sms_message, 'penalty_notice', $student_id);
                }

                $penalties_applied++;

            } catch (Exception $e) {
                $errors[] = "Error applying penalty for fee {$fee['id']}: {$e->getMessage()}";
            }
        }

        $executed_tasks[] = [
            'task' => 'Apply penalties to overdue fees',
            'status' => 'completed',
            'penalties_applied' => $penalties_applied,
            'fees_processed' => count($fees_needing_penalty)
        ];

    } catch (Exception $e) {
        $errors[] = "Penalty application task failed: {$e->getMessage()}";
    }

    // Task 3: Update fee status to "overdue" for past deadline fees
    try {
        $update_status = $pdo->prepare('
            UPDATE fees 
            SET status = "overdue" 
            WHERE status = "pending" 
              AND due_date < CAST(GETDATE() AS DATE)
              AND payment_deadline IS NULL
        ');
        $update_status->execute();
        $rows_updated = $update_status->rowCount();

        $executed_tasks[] = [
            'task' => 'Update status for overdue fees (no payment deadline)',
            'status' => 'completed',
            'rows_updated' => $rows_updated
        ];

    } catch (Exception $e) {
        $errors[] = "Status update task failed: {$e->getMessage()}";
    }

    $end_time = microtime(true);
    $duration = round($end_time - $start_time, 2);

    echo json_encode([
        'success' => true,
        'message' => 'Fee batch job completed',
        'executed_tasks' => $executed_tasks,
        'errors' => $errors,
        'execution_time' => "{$duration}s",
        'timestamp' => date('Y-m-d H:i:s')
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Batch job failed: ' . $e->getMessage(),
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
