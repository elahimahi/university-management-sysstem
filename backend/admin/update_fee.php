<?php
/**
 * Admin - Update fee status or details
 * PUT /admin/update-fee
 * 
 * Request body:
 * {
 *   "fee_id": 5,
 *   "status": "paid",  // pending, paid, overdue
 *   "description": "Updated description",
 *   "amount": 5500,
 *   "due_date": "2026-04-20"
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
$fee_id = $data['fee_id'] ?? null;
$status = $data['status'] ?? null;
$description = $data['description'] ?? null;
$amount = $data['amount'] ?? null;
$due_date = $data['due_date'] ?? null;

if (!$fee_id) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing fee_id']);
    exit;
}

try {
    // Check if fee exists
    $check_stmt = $pdo->prepare('SELECT id FROM fees WHERE id = ?');
    $check_stmt->execute([$fee_id]);
    if (!$check_stmt->fetch()) {
        http_response_code(404);
        echo json_encode(['error' => 'Fee not found']);
        exit;
    }

    // Build update query dynamically
    $update_parts = [];
    $params = [];

    if ($status !== null) {
        $update_parts[] = 'status = ?';
        $params[] = $status;
    }
    if ($description !== null) {
        $update_parts[] = 'description = ?';
        $params[] = $description;
    }
    if ($amount !== null) {
        $update_parts[] = 'amount = ?';
        $params[] = (float)$amount;
    }
    if ($due_date !== null) {
        $update_parts[] = 'due_date = CAST(? AS DATE)';
        $params[] = $due_date;
    }

    if (empty($update_parts)) {
        http_response_code(400);
        echo json_encode(['error' => 'No fields to update']);
        exit;
    }

    $params[] = $fee_id;
    $update_query = 'UPDATE fees SET ' . implode(', ', $update_parts) . ' WHERE id = ?';
    
    $update_stmt = $pdo->prepare($update_query);
    $update_stmt->execute($params);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Fee updated successfully'
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}
?>
