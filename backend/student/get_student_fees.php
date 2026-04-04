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

$data = json_decode(file_get_contents('php://input'), true);
$student_id = $data['student_id'] ?? null;
if (!$student_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing student_id']);
    exit;
}

try {
    $stmt = $pdo->prepare('SELECT id, description, amount, due_date, status, COALESCE(payment_count,0) as payment_count, COALESCE(total_paid,0) as total_paid FROM (
        SELECT f.id, f.description, f.amount, f.due_date, f.status,
               COUNT(p.id) as payment_count,
               SUM(p.amount_paid) as total_paid
        FROM fees f
        LEFT JOIN payments p ON f.id = p.fee_id
        WHERE f.student_id = ?
        GROUP BY f.id, f.description, f.amount, f.due_date, f.status
    ) x ORDER BY due_date ASC');
    $stmt->execute([$student_id]);
    $feesRaw = $stmt->fetchAll();

    $today = new DateTime();
    $fees = [];
    $total_due = 0;
    $total_paid = 0;
    $total_pending = 0;
    $overdue_count = 0;

    foreach ($feesRaw as $fee) {
        $due = new DateTime($fee['due_date']);
        $current_status = 'pending';

        if ($fee['status'] === 'paid') {
            $current_status = 'paid';
        } elseif ($fee['status'] === 'pending') {
            if ($due < $today) {
                $current_status = 'overdue';
                $overdue_count++;
            } elseif ($due->format('Y-m-d') === $today->format('Y-m-d')) {
                $current_status = 'due';
                $total_pending += $fee['amount'];
            } else {
                $current_status = 'pending';
                $total_pending += $fee['amount'];
            }
        }

        $fees[] = array_merge($fee, ['current_status' => $current_status]);

        $total_paid += (float)$fee['total_paid'];
        if ($fee['status'] === 'pending') {
            $total_due += (float)$fee['amount'];
        }
    }

    echo json_encode([
        'fees' => $fees,
        'statistics' => [
            'total_due' => $total_due,
            'total_paid' => $total_paid,
            'total_pending' => $total_pending,
            'overdue_count' => $overdue_count,
        ]
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
