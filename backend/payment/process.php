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

// Log incoming request for debugging
error_log('Payment process - Incoming data: ' . json_encode($data));

$fee_id = $data['fee_id'] ?? null;
$student_id = $data['student_id'] ?? null;
$amount_paid = $data['amount_paid'] ?? null;
$payment_method = strtolower($data['payment_method'] ?? null);
$phone = $data['phone'] ?? null;
$account_number = $data['account_number'] ?? null;

error_log('Payment validation - fee_id: ' . $fee_id . ', student_id: ' . $student_id . ', amount_paid: ' . $amount_paid . ', payment_method: ' . $payment_method);

if (!$fee_id || !$student_id || !$amount_paid || !$payment_method) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: fee_id, student_id, amount_paid, payment_method', 'received' => ['fee_id' => $fee_id, 'student_id' => $student_id, 'amount_paid' => $amount_paid, 'payment_method' => $payment_method]]);
    exit;
}

// Validate payment method
$valid_methods = ['bkash', 'nagad', 'rocket', 'card'];
if (!in_array($payment_method, $valid_methods)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payment method. Use: bkash, nagad, rocket, or card']);
    exit;
}

// Validate phone or account_number based on payment method
$phone_clean = null;
$account_clean = null;

if ($payment_method === 'card') {
    error_log('Card payment - validating account_number: ' . $account_number);
    if (!$account_number) {
        http_response_code(400);
        echo json_encode(['error' => 'Account number is required for card payments']);
        exit;
    }
    $account_clean = preg_replace('/\D/', '', $account_number);
    error_log('Card payment - account_clean: ' . $account_clean);
    if (!preg_match('/^\d{16}$/', $account_clean)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid account number. Must be 16 digits. Received: ' . $account_clean]);
        exit;
    }
} else {
    error_log('Mobile payment - validating phone: ' . $phone . ' for method: ' . $payment_method);
    if (!$phone) {
        http_response_code(400);
        echo json_encode(['error' => 'Phone number is required for ' . strtoupper($payment_method) . ' payments']);
        exit;
    }
    $phone_clean = preg_replace('/\D/', '', $phone);
    error_log('Mobile payment - phone_clean: ' . $phone_clean);
    if (!preg_match('/^(01\d{9})$/', $phone_clean)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid phone number. Use Bangladeshi mobile number format 01XXXXXXXXX. Received: ' . $phone_clean]);
        exit;
    }
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

    // Initialize payment gateway
    $gatewayFactory = new PaymentGatewayFactory($pdo);
    $gateway = $gatewayFactory->createGateway($payment_method);

    // Prepare payment data
    $paymentData = [
        'amount' => $amount_paid,
        'student_id' => $student_id,
        'fee_id' => $fee_id,
        'payment_method' => $payment_method,
        'phone' => $phone_clean ?? '0000000000',
        'account_number' => $account_clean ?? '',
        'contact_info' => $payment_method === 'card' ? ($account_clean ?? '') : ($phone_clean ?? '0000000000'),
    ];

    // Initiate payment with gateway
    $paymentResult = $gateway->initiatePayment($paymentData);

    error_log('Gateway result: ' . json_encode($paymentResult));

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
} catch (Exception $e) {
    error_log('Payment processing error: ' . $e->getMessage() . ' Stack: ' . $e->getTraceAsString());
    http_response_code(500);
    echo json_encode(['error' => 'Payment processing failed', 'details' => $e->getMessage()]);
}