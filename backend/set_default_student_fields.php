<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Set default academic_year and current_semester for students
    $pdo->exec("UPDATE users SET academic_year = 1 WHERE role = 'student' AND academic_year IS NULL");
    $pdo->exec("UPDATE users SET current_semester = 'Fall 2024' WHERE role = 'student' AND current_semester IS NULL");
    
    echo json_encode(['success' => true, 'message' => 'Default academic fields set for students']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>