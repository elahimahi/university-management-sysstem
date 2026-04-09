<?php
/**
 * Process payment through real payment gateways
 * POST /payment/process
 *
 * Request body:
 * {
 *   "fee_id": 5,
 *   "student_id": 10,
 *   "amount_paid": 2500,
 *   "payment_method": "bkash",  // bkash, nagad, rocket, card
 *   "pin": "1234",  // for bKash/Nagad/Rocket (optional for gateway)
 *   "card_number": "1234567890123456"  // for card (optional for gateway)
 * }
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../core/PaymentGatewayFactory.php';
require_once __DIR__ . '/../core/sms_service.php';
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

$fee_id = $data['fee_id'] ?? null;
$student_id = $data['student_id'] ?? null;
$amount_paid = $data['amount_paid'] ?? null;
$payment_method = $data['payment_method'] ?? null;
$phone = $data['phone'] ?? null;

if (!$fee_id || !$student_id || !$amount_paid || !$payment_method || !$phone) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: fee_id, student_id, amount_paid, payment_method']);
    exit;
}

// Validate payment method
$valid_methods = ['bkash', 'nagad', 'rocket', 'card'];
if (!in_array(strtolower($payment_method), $valid_methods)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payment method. Use: bkash, nagad, rocket, or card']);
    exit;
}

try {
    // Verify fee belongs to student
    $verify_stmt = $pdo->prepare('SELECT id, amount FROM fees WHERE id = ? AND student_id = ?');
    $verify_stmt->execute([$fee_id, $student_id]);
    $fee = $verify_stmt->fetch();

    if (!$fee) {
        http_response_code(403);
        echo json_encode(['error' => 'Fee not found or does not belong to this student']);
        exit;
    }

    $fee_amount = (float)$fee['amount'];

    // Check if fee is already fully paid
    $total_paid_stmt = $pdo->prepare('SELECT SUM(amount_paid) as total FROM payments WHERE fee_id = ?');
    $total_paid_stmt->execute([$fee_id]);
    $result = $total_paid_stmt->fetch();
    $total_paid = (float)($result['total'] ?? 0);
    $remaining_amount = $fee_amount - $total_paid;

    if ($remaining_amount <= 0) {
        http_response_code(400);
        echo json_encode(['error' => 'This fee has already been fully paid']);
        exit;
    }

    $amount_paid = (float)$amount_paid;

    if ($amount_paid <= 0 || $amount_paid > $remaining_amount) {
        http_response_code(400);
        echo json_encode(['error' => "Payment amount must be between 0 and {$remaining_amount} (remaining amount)"]);
        exit;
    }

    // Validate phone number
    $phone = preg_replace('/\D/', '', $phone);
    if (!preg_match('/^(01\d{9})$/', $phone)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid phone number. Use Bangladeshi mobile number format 01XXXXXXXXX']);
        exit;
    }

    // Initialize payment gateway
    $gatewayFactory = new PaymentGatewayFactory($pdo);
    $gateway = $gatewayFactory->createGateway($payment_method);

    // Prepare payment data
    $paymentData = [
        'amount' => $amount_paid,
        'student_id' => $student_id,
        'fee_id' => $fee_id,
        'payment_method' => strtolower($payment_method),
        'phone' => $phone,
    ];

    // Initiate payment with gateway
    $paymentResult = $gateway->initiatePayment($paymentData);

    if ($paymentResult['success']) {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Payment initiated successfully',
            'transaction_id' => $paymentResult['transaction_id'],
            'payment_url' => $paymentResult['payment_url'] ?? null,
            'status' => 'pending',
            'amount' => $amount_paid,
            'payment_method' => strtoupper($payment_method)
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => $paymentResult['error'] ?? 'Payment initiation failed'
        ]);
    }

<<<<<<< HEAD
=======
    // Send SMS notification
    $sms_service = new SMSService($pdo);
    
    // Get student details
    $student_phone = $sms_service->getStudentPhone($student_id);
    $student_name = $sms_service->getStudentName($student_id);
    
    $sms_result = null;
    if ($student_phone) {
        $sms_result = $sms_service->sendPaymentConfirmation(
            $student_phone,
            $student_name,
            $amount_paid,
            $payment_method,
            max(0, $fee_amount - $total_paid),
            $student_id
        );
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Payment recorded successfully',
        'payment_id' => $payment_id,
        'amount_paid' => $amount_paid,
        'payment_method' => strtoupper($payment_method),
        'fee_status' => $new_status,
        'remaining_amount' => max(0, $fee_amount - $total_paid),
        'total_paid' => $total_paid,
        'sms_notification' => $sms_result ?? ['success' => false, 'message' => 'No phone number available']
    ]);

>>>>>>> dev
} catch (Exception $e) {
    error_log('Payment processing error: ' . $e->getMessage() . ' Stack: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Payment processing failed', 'details' => $e->getMessage()]);
}
?>