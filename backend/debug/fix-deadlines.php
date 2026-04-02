<?php
require_once '../core/db_connect.php';

header('Content-Type: application/json');

try {
    // First, show current assignments
    $stmt = $pdo->prepare("
        SELECT id, title, deadline, 
               DATEDIFF(HOUR, GETDATE(), deadline) as hours_remaining
        FROM course_assignments
        ORDER BY deadline ASC
    ");
    $stmt->execute([]);
    $assignments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'current_time' => date('Y-m-d H:i:s'),
        'current_assignments' => $assignments,
        'action' => 'Updating deadlines to future...'
    ], JSON_PRETTY_PRINT);
    
    // Update all assignments to have future deadlines (7 days from now)
    $futureDeadline = date('Y-m-d H:i:s', strtotime('+7 days'));
    
    $stmt = $pdo->prepare("UPDATE course_assignments SET deadline = ?");
    $result = $stmt->execute([$futureDeadline]);
    
    if ($result) {
        echo "\n✓ Updated all " . $stmt->rowCount() . " assignments to deadline: " . $futureDeadline . "\n";
    }
    
    // Show updated assignments
    $stmt = $pdo->prepare("
        SELECT id, title, deadline, 
               DATEDIFF(HOUR, GETDATE(), deadline) as hours_remaining
        FROM course_assignments
        ORDER BY deadline ASC
    ");
    $stmt->execute([]);
    $updated = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo "\n✓ Updated assignments:\n";
    echo json_encode($updated, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>
