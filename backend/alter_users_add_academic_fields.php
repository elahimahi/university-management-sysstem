<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Add academic_year and current_semester columns to users table
    $pdo->exec("ALTER TABLE users ADD academic_year INT DEFAULT 1");
    $pdo->exec("ALTER TABLE users ADD current_semester VARCHAR(20)");
    
    echo json_encode(['success' => true, 'message' => 'Academic year and current semester columns added to users table']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>