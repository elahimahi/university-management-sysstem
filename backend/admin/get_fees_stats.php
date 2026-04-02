<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

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
