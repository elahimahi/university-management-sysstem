<?php
/**
 * Check table structure
 * GET /debug/check-structure
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    $tables = ['course_assignments', 'assignment_submissions'];
    $structure = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("
            SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
            FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = ? AND TABLE_SCHEMA = 'dbo'
        ");
        $stmt->execute([$table]);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        $structure[$table] = [
            'column_count' => count($columns),
            'columns' => $columns
        ];
    }
    
    echo json_encode([
        'status' => 'success',
        'structure' => $structure
    ], JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    echo json_encode([
        'status' => 'error',
        'error' => $e->getMessage()
    ]);
}
?>
