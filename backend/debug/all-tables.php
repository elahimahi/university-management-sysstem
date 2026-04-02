<?php
/**
 * SQL Server - All Tables and Columns
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Get all tables
    $stmt = $pdo->query("
        SELECT TABLE_NAME 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_TYPE = 'BASE TABLE' 
        ORDER BY TABLE_NAME
    ");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
    
    $result = [
        'total_tables' => count($tables),
        'tables' => []
    ];
    
    foreach ($tables as $tableName) {
        // Get columns for each table
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
        
        // Get row count
        $countStmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM $tableName");
        $countStmt->execute();
        $rowCount = $countStmt->fetch(PDO::FETCH_ASSOC)['cnt'];
        
        $result['tables'][$tableName] = [
            'row_count' => (int)$rowCount,
            'columns' => $columns
        ];
    }
    
    echo json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ]);
}
?>
