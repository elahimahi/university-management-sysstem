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
    $feesTotal = 0;
    $paidTotal = 0;
    
    // Get total fees count
    try {
        $feesStmt = $pdo->query("SELECT COUNT(*) as total FROM fees");
        if ($feesStmt) {
            $feesResult = $feesStmt->fetch();
            if ($feesResult && isset($feesResult['total'])) {
                $feesTotal = (int)$feesResult['total'];
            }
        }
    } catch (Exception $feesErr) {
        error_log('Fees query error: ' . $feesErr->getMessage());
    }
    
    // Get paid fees count (instead of payments table which doesn't exist)
    try {
        $paidStmt = $pdo->query("SELECT COUNT(*) as total FROM fees WHERE status = 'paid'");
        if ($paidStmt) {
            $paidResult = $paidStmt->fetch();
            if ($paidResult && isset($paidResult['total'])) {
                $paidTotal = (int)$paidResult['total'];
            }
        }
    } catch (Exception $paidErr) {
        error_log('Paid fees query error: ' . $paidErr->getMessage());
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'totalFees' => $feesTotal,
        'total' => $feesTotal,
        'paidFees' => $paidTotal,
        'payments' => $paidTotal
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage(),
        'success' => false
    ]);
}
?>
