<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Get current assignments
    $stmt = $pdo->prepare("SELECT id, title, deadline FROM course_assignments");
    $stmt->execute([]);
    $before = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Update deadline to 7 days from now
    $futureDate = date('Y-m-d H:i:s', strtotime('+7 days'));
    $stmt = $pdo->prepare("UPDATE course_assignments SET deadline = ?");
    $stmt->execute([$futureDate]);
    $updated = $stmt->rowCount();
    
    // Get updated assignments
    $stmt = $pdo->prepare("SELECT id, title, deadline, DATEDIFF(HOUR, GETDATE(), deadline) as hours_left FROM course_assignments");
    $stmt->execute([]);
    $after = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Updated ' . $updated . ' assignments',
        'new_deadline' => $futureDate,
        'assignments' => $after
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ], JSON_PRETTY_PRINT);
}
?>
