<?php
/**
 * Get Student Fees with Deadline and Payment Window Information
 * POST /student/get_fees_with_deadline.php
 * 
 * Returns fees with:
 * - Payment deadline
 * - Time remaining to pay
 * - Penalty information
 * - Payment status
 * 
 * Request body:
 * {
 *   "student_id": 10
 * }
 */

require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;

if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required field: student_id']);
    exit;
}

try {
    $query = '
        SELECT 
            f.id,
            f.description,
            f.amount,
            f.due_date,
            f.payment_deadline,
            f.status,
            f.penalty_applied,
            f.penalty_amount,
            ISNULL(SUM(p.amount_paid), 0) as paid_amount,
            f.amount - ISNULL(SUM(p.amount_paid), 0) as remaining_amount,
            DATEDIFF(HOUR, GETDATE(), f.payment_deadline) as hours_remaining,
            CASE 
                WHEN f.status = "paid" THEN "Paid"
                WHEN f.payment_deadline IS NULL THEN "Pending"
                WHEN GETDATE() > f.payment_deadline THEN "Overdue - Pay Now!"
                WHEN DATEDIFF(HOUR, GETDATE(), f.payment_deadline) <= 24 THEN "Urgent - Less than 24 hours"
                ELSE "Pending"
            END as payment_status_display,
            pc.penalty_percentage,
            pc.penalty_type,
            pc.apply_after_days,
            u.phone,
            u.first_name,
            u.last_name
        FROM fees f
        LEFT JOIN payments p ON f.id = p.fee_id
        LEFT JOIN penalty_config pc ON f.id = pc.fee_id
        LEFT JOIN users u ON f.student_id = u.id
        WHERE f.student_id = ?
        GROUP BY f.id, f.description, f.amount, f.due_date, f.payment_deadline, 
                 f.status, f.penalty_applied, f.penalty_amount, 
                 pc.penalty_percentage, pc.penalty_type, pc.apply_after_days, 
                 u.phone, u.first_name, u.last_name
        ORDER BY f.payment_deadline DESC NULLS LAST
    ';

    $stmt = $pdo->prepare($query);
    $stmt->execute([$student_id]);
    $fees = $stmt->fetchAll();

    // Calculate summary statistics
    $total_amount = 0;
    $total_paid = 0;
    $total_pending = 0;
    $total_with_penalty = 0;
    $urgent_count = 0;
    $overdue_count = 0;

    foreach ($fees as $fee) {
        $total_amount += (float)$fee['amount'];
        $total_paid += (float)$fee['paid_amount'];
        $total_pending += (float)$fee['remaining_amount'];
        
        if ($fee['penalty_applied']) {
            $total_with_penalty += (float)$fee['penalty_amount'];
        }

        if ($fee['payment_status_display'] === 'Urgent - Less than 24 hours') {
            $urgent_count++;
        } elseif ($fee['payment_status_display'] === 'Overdue - Pay Now!') {
            $overdue_count++;
        }
    }

    echo json_encode([
        'success' => true,
        'fees' => array_map(function($fee) {
            return [
                'id' => (int)$fee['id'],
                'description' => $fee['description'],
                'amount' => (float)$fee['amount'],
                'due_date' => $fee['due_date'],
                'payment_deadline' => $fee['payment_deadline'],
                'status' => $fee['status'],
                'paid_amount' => (float)$fee['paid_amount'],
                'remaining_amount' => (float)$fee['remaining_amount'],
                'hours_remaining' => $fee['hours_remaining'] !== null ? (int)$fee['hours_remaining'] : null,
                'payment_status_display' => $fee['payment_status_display'],
                'penalty_applied' => (bool)$fee['penalty_applied'],
                'penalty_amount' => (float)$fee['penalty_amount'],
                'penalty_percentage' => $fee['penalty_percentage'] ? (float)$fee['penalty_percentage'] : null,
                'penalty_type' => $fee['penalty_type'],
                'apply_after_days' => $fee['apply_after_days'] ? (int)$fee['apply_after_days'] : null,
                'phone' => $fee['phone'],
                'student_name' => $fee['first_name'] . ' ' . $fee['last_name']
            ];
        }, $fees),
        'summary' => [
            'total_fees_count' => count($fees),
            'total_amount' => (float)$total_amount,
            'total_paid' => (float)$total_paid,
            'total_pending' => (float)$total_pending,
            'total_penalty' => (float)$total_with_penalty,
            'urgent_fees' => $urgent_count,
            'overdue_fees' => $overdue_count,
            'message' => $overdue_count > 0 ? "You have {$overdue_count} overdue fee(s). Please pay immediately to avoid additional penalties." : 
                        ($urgent_count > 0 ? "You have {$urgent_count} fee(s) due within 24 hours." : "All fees are on track.")
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to fetch fees: ' . $e->getMessage()
    ]);
}
?>
