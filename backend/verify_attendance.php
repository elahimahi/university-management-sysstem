<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Get attendance records
    $stmt = $pdo->query("
        SELECT TOP 20 
            a.id, a.enrollment_id, a.date, a.status,
            e.student_id, 
            u.first_name + ' ' + u.last_name as student_name,
            c.code as course_code
        FROM attendance a
        JOIN enrollments e ON a.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        ORDER BY a.date DESC, a.id DESC
    ");
    
    $records = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Get debug log
    $logFile = __DIR__ . '/attendance_debug.log';
    $logContent = file_exists($logFile) ? file_get_contents($logFile) : 'No debug log yet';
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'records_count' => count($records),
        'recent_records' => $records,
        'debug_log' => trim(substr($logContent, -2000)) // Last 2000 chars
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?>
