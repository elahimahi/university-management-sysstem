<?php
/**
 * Set or Update Payment Deadline for a Fee
 * PUT /admin/set_payment_deadline.php
 * 
 * Request body:
 * {
 *   "fee_id": 5,
 *   "payment_deadline": "2026-04-15 23:59:59",
 *   "penalty_percentage": 5,
 *   "apply_after_days": 7,
 *   "reason": "Extended deadline for special case"
 * }
 */

require_once __DIR__ . '/../core/db_connect.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$fee_id = $data['fee_id'] ?? null;
$payment_deadline = $data['payment_deadline'] ?? null;
$penalty_percentage = $data['penalty_percentage'] ?? 5;
$apply_after_days = $data['apply_after_days'] ?? 7;
$reason = $data['reason'] ?? 'Admin updated payment deadline';
$admin_id = $data['admin_id'] ?? 1; // Usually from session

if (!$fee_id || !$payment_deadline) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: fee_id, payment_deadline']);
    exit;
}

try {
    // Get current fee details
    $get_fee = $pdo->prepare('SELECT id, payment_deadline as old_deadline FROM fees WHERE id = ?');
    $get_fee->execute([$fee_id]);
    $fee = $get_fee->fetch();
    
    if (!$fee) {
        http_response_code(404);
        echo json_encode(['error' => 'Fee not found']);
        exit;
    }

    // Validate deadline is in future
    if (strtotime($payment_deadline) <= time()) {
        http_response_code(400);
        echo json_encode(['error' => 'Payment deadline must be in the future']);
        exit;
    }

    // Start transaction
    $pdo->beginTransaction();

    // Update fee with new deadline
    $update_fee = $pdo->prepare('
        UPDATE fees 
        SET payment_deadline = ?, 
            penalty_applied = 0,
            penalty_amount = 0
        WHERE id = ?
    ');
    $update_fee->execute([$payment_deadline, $fee_id]);

    // Log the deadline change
    $log_change = $pdo->prepare('
        INSERT INTO payment_deadline_log (fee_id, old_deadline, new_deadline, changed_by, reason)
        VALUES (?, ?, ?, ?, ?)
    ');
    $log_change->execute([
        $fee_id,
        $fee['old_deadline'],
        $payment_deadline,
        $admin_id,
        $reason
    ]);

    // Create or update penalty configuration
    $check_penalty = $pdo->prepare('SELECT id FROM penalty_config WHERE fee_id = ?');
    $check_penalty->execute([$fee_id]);
    $penalty_exists = $check_penalty->fetch();

    if ($penalty_exists) {
        $update_penalty = $pdo->prepare('
            UPDATE penalty_config 
            SET penalty_percentage = ?, apply_after_days = ?, updated_by = ?
            WHERE fee_id = ?
        ');
        $update_penalty->execute([$penalty_percentage, $apply_after_days, $admin_id, $fee_id]);
    } else {
        $create_penalty = $pdo->prepare('
            INSERT INTO penalty_config (fee_id, penalty_percentage, apply_after_days, updated_by)
            VALUES (?, ?, ?, ?)
        ');
        $create_penalty->execute([$fee_id, $penalty_percentage, $apply_after_days, $admin_id]);
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Payment deadline updated successfully',
        'fee_id' => $fee_id,
        'payment_deadline' => $payment_deadline,
        'penalty_percentage' => $penalty_percentage,
        'apply_after_days' => $apply_after_days
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to update payment deadline: ' . $e->getMessage()
    ]);
}
?>
