<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    // Get total courses count
    $stmt = $pdo->query("SELECT COUNT(*) as total FROM courses");
    if (!$stmt) {
        throw new Exception('Query failed');
    }
    
    $result = $stmt->fetch();
    $total = 0;
    
    if ($result && isset($result['total'])) {
        $total = (int)$result['total'];
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'totalCourses' => $total,
        'total' => $total
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage(),
        'success' => false
    ]);
}
?>
