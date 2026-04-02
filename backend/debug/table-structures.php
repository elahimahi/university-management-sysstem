<?php
/**
 * SQL Server - Table Structures (Detailed)
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: text/plain; charset=utf-8');

try {
    $importantTables = [
        'users',
        'courses', 
        'enrollments',
        'course_assignments',
        'assignment_submissions',
        'course_marks',
        'attendance',
        'grades'
    ];
    
    foreach ($importantTables as $tableName) {
        echo "=====================================\n";
        echo "TABLE: $tableName\n";
        echo "=====================================\n";
        
        // Get row count
        $countStmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM $tableName");
        $countStmt->execute();
        $rowCount = $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
        echo "Records: $rowCount\n\n";
        
        // Get columns
        $stmt = $pdo->prepare("
            SELECT 
                COLUMN_NAME,
                DATA_TYPE,
                IS_NULLABLE,
                COLUMN_DEFAULT
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_NAME = ?
            ORDER BY ORDINAL_POSITION
        ");
        $stmt->execute([$tableName]);
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo "COLUMNS:\n";
        echo str_pad("Name", 25) . str_pad("Type", 20) . str_pad("Null?", 10) . "Default\n";
        echo str_repeat("-", 80) . "\n";
        
        foreach ($columns as $col) {
            $name = $col['COLUMN_NAME'];
            $type = $col['DATA_TYPE'];
            $nulls = $col['IS_NULLABLE'] === 'YES' ? 'YES' : 'NO';
            $default = $col['COLUMN_DEFAULT'] ?? '-';
            
            echo str_pad($name, 25) . 
                 str_pad($type, 20) . 
                 str_pad($nulls, 10) . 
                 $default . "\n";
        }
        
        echo "\n";
    }
    
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
