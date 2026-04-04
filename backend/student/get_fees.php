<?php
/**
 * Student - Get their fees
 * POST /student/get-fees
 * 
 * Request body:
 * {
 *   "student_id": 10
 * }
 */

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
    // Get all fees for the student
    $stmt = $pdo->prepare('
        SELECT 
            f.id,
            f.description,
            f.amount,
            f.due_date,
            f.status,
            CASE 
                WHEN CAST(f.due_date AS DATE) < CAST(GETDATE() AS DATE) AND f.status = \'pending\' THEN \'overdue\'
                ELSE f.status
            END as current_status,
            COUNT(p.id) as payment_count,
            SUM(p.amount_paid) as total_paid,
            f.amount - ISNULL(SUM(p.amount_paid), 0) as remaining_amount
        FROM fees f
        LEFT JOIN payments p ON f.id = p.fee_id
        WHERE f.student_id = ?
        GROUP BY f.id, f.description, f.amount, f.due_date, f.status
        ORDER BY f.due_date DESC
    ');
    $stmt->execute([$student_id]);
    $fees = $stmt->fetchAll();

    // Get fee statistics
    $stats_stmt = $pdo->prepare('
        SELECT 
            SUM(f.amount) as total_due,
            SUM(CASE WHEN f.status = \'paid\' THEN f.amount ELSE 0 END) as total_paid,
            SUM(CASE WHEN f.status = \'pending\' THEN f.amount ELSE 0 END) as total_pending,
            COUNT(CASE WHEN CAST(f.due_date AS DATE) < CAST(GETDATE() AS DATE) AND f.status = \'pending\' THEN 1 END) as overdue_count
        FROM fees f
        WHERE f.student_id = ?
    ');
    $stats_stmt->execute([$student_id]);
    $stats = $stats_stmt->fetch();

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'fees' => $fees,
        'statistics' => $stats
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
