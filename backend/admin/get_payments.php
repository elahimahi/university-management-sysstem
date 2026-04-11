<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

try {
    // Get all payments with pagination
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = ($page - 1) * $limit;

    // Deduplicate duplicate payment records by transaction_id, keeping the latest row for each transaction
    $count_stmt = $pdo->query(
        "WITH deduped AS (
            SELECT p.*, ROW_NUMBER() OVER (
                PARTITION BY CASE WHEN p.transaction_id IS NULL THEN CONCAT('ID_', CAST(p.id AS VARCHAR(50))) ELSE p.transaction_id END
                ORDER BY p.payment_date DESC, p.id DESC
            ) AS rn
            FROM payments p
        )
        SELECT COUNT(*) as total FROM deduped WHERE rn = 1"
    );
    $total = $count_stmt->fetch()['total'];

    // Get payments with student info
    $stmt = $pdo->prepare(
        "WITH deduped AS (
            SELECT p.*, ROW_NUMBER() OVER (
                PARTITION BY CASE WHEN p.transaction_id IS NULL THEN CONCAT('ID_', CAST(p.id AS VARCHAR(50))) ELSE p.transaction_id END
                ORDER BY p.payment_date DESC, p.id DESC
            ) AS rn
            FROM payments p
        )
        SELECT
            p.id,
            p.fee_id,
            p.amount_paid,
            p.payment_date,
            p.payment_method,
            f.description,
            f.amount as fee_amount,
            u.first_name,
            u.last_name,
            u.email
        FROM deduped p
        JOIN fees f ON p.fee_id = f.id
        JOIN users u ON f.student_id = u.id
        WHERE p.rn = 1
        ORDER BY p.payment_date DESC
        OFFSET ? ROWS
        FETCH NEXT ? ROWS ONLY
    "
    );
    $stmt->bindParam(1, $offset, PDO::PARAM_INT);
    $stmt->bindParam(2, $limit, PDO::PARAM_INT);
    $stmt->execute();
    $payments = $stmt->fetchAll();

    // Format payments data
    $formattedPayments = array_map(function($payment) {
        return [
            'id' => $payment['id'],
            'fee_id' => $payment['fee_id'],
            'amount_paid' => (float)$payment['amount_paid'],
            'payment_date' => $payment['payment_date'],
            'payment_method' => $payment['payment_method'],
            'description' => $payment['description'],
            'fee_amount' => (float)$payment['fee_amount'],
            'student_name' => $payment['first_name'] . ' ' . $payment['last_name'],
            'email' => $payment['email']
        ];
    }, $payments);

    // Get statistics for the deduplicated payment set
    $stats_stmt = $pdo->query("
        WITH deduped AS (
            SELECT p.*, ROW_NUMBER() OVER (
                PARTITION BY CASE WHEN p.transaction_id IS NULL THEN CONCAT('ID_', CAST(p.id AS VARCHAR(50))) ELSE p.transaction_id END
                ORDER BY p.payment_date DESC, p.id DESC
            ) AS rn
            FROM payments p
        )
        SELECT
            COUNT(*) as total_payments,
            SUM(amount_paid) as total_amount,
            SUM(CASE WHEN payment_method = 'bkash' THEN 1 ELSE 0 END) as bkash_payments,
            SUM(CASE WHEN payment_method = 'nagad' THEN 1 ELSE 0 END) as nagad_payments,
            SUM(CASE WHEN payment_method = 'rocket' THEN 1 ELSE 0 END) as rocket_payments,
            SUM(CASE WHEN payment_method = 'card' THEN 1 ELSE 0 END) as card_payments
        FROM deduped
        WHERE rn = 1
    ");
    $stats = $stats_stmt->fetch();

    echo json_encode([
        'success' => true,
        'payments' => $formattedPayments,
        'stats' => [
            'total_payments' => (int)$stats['total_payments'],
            'total_amount' => (float)($stats['total_amount'] ?? 0),
            'bkash_payments' => (int)$stats['bkash_payments'],
            'nagad_payments' => (int)$stats['nagad_payments'],
            'rocket_payments' => (int)$stats['rocket_payments'],
            'card_payments' => (int)$stats['card_payments']
        ],
        'pagination' => [
            'page' => $page,
            'limit' => $limit,
            'total' => $total,
            'pages' => ceil($total / $limit)
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch payments',
        'details' => $e->getMessage()
    ]);
}
?>