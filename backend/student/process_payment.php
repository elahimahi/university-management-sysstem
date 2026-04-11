<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

try {
    require_once '../core/Database.php';
    require_once '../core/Auth.php';

    $auth = new Auth();
    $user = $auth->getCurrentUser();

    if (!$user || $user['role'] !== 'student') {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
        exit;
    }

    $data = json_decode(file_get_contents("php://input"), true);

    // Validate required fields
    if (!$data || !isset($data['fee_id']) || !isset($data['amount']) || !isset($data['gateway'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Missing required payment information']);
        exit;
    }

    $fee_id = intval($data['fee_id']);
    $student_id = $user['id'];
    $amount = floatval($data['amount']);
    $gateway = trim($data['gateway']);
    $transaction_id = $data['transaction_id'] ?? 'TXN-' . time();

    $db = Database::getInstance();
    $conn = $db->getConnection();

    // Verify fee exists and belongs to student
    $feeQuery = "SELECT f.id, f.amount FROM student_fees sf 
                 JOIN fees f ON sf.fee_id = f.id 
                 WHERE f.id = ? AND sf.student_id = ?";
    
    $feeStmt = $conn->prepare($feeQuery);
    $feeStmt->execute([$fee_id, $student_id]);
    $fee = $feeStmt->fetch(PDO::FETCH_ASSOC);

    if (!$fee) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Fee not found']);
        exit;
    }

    if ($fee['amount'] != $amount) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payment amount mismatch']);
        exit;
    }

    // In production, integrate with actual payment gateway
    // For demo: SSLCommerz or Stripe would process payment here
    // For now, we'll simulate successful payment

    // Save payment record
    $paymentQuery = "INSERT INTO payments (student_id, fee_id, amount, gateway, transaction_id, status, created_at)
                     VALUES (?, ?, ?, ?, ?, 'completed', GETDATE())";
    
    $paymentStmt = $conn->prepare($paymentQuery);
    $paymentStmt->execute([$student_id, $fee_id, $amount, $gateway, $transaction_id]);

    // Update student_fees to mark as paid
    $updateQuery = "UPDATE student_fees SET payment_status = 'paid', payment_date = GETDATE(), transaction_id = ?
                    WHERE student_id = ? AND fee_id = ?";
    
    $updateStmt = $conn->prepare($updateQuery);
    $updateStmt->execute([$transaction_id, $student_id, $fee_id]);

    // Log transaction
    error_log("Payment processed: Student=$student_id, Fee=$fee_id, Amount=$amount, Gateway=$gateway, Transaction=$transaction_id");

    echo json_encode([
        'success' => true,
        'message' => 'Payment processed successfully',
        'data' => [
            'transaction_id' => $transaction_id,
            'amount' => $amount,
            'status' => 'completed',
            'payment_date' => date('Y-m-d H:i:s'),
            'gateway' => $gateway
        ]
    ]);

} catch (Exception $e) {
    error_log("Payment processing error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Payment processing failed: ' . $e->getMessage()
    ]);
}
?>
