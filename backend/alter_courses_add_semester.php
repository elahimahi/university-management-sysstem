<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Add semester column to courses table
    $pdo->exec("ALTER TABLE courses ADD semester VARCHAR(20)");
    
    echo json_encode(['success' => true, 'message' => 'Semester column added to courses table']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>