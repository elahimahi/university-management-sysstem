<?php
/**
 * Database Connection Test
 * 
 * Run this endpoint to verify your database connection is working
 * URL: http://localhost/Database_Project/Database-main/Database-main/backend/health-db.php
 */

require_once __DIR__ . '/core/db_connect.php';

try {
    // Test basic connection (SQL Server syntax)
    $versionStmt = $pdo->query("SELECT @@VERSION as version");
    $version = $versionStmt->fetch();
    $timeStmt = $pdo->query("SELECT GETDATE() as current_time");
    $time = $timeStmt->fetch();
    
    // Check if tables exist
    $tablesCheck = $pdo->query("
        SELECT COUNT(*) as table_count 
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_SCHEMA = 'dbo'
    ");
    $tableCount = $tablesCheck->fetch();
    
    // Count users
    $userCount = $pdo->query("SELECT COUNT(*) as total FROM users")->fetch();
    
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'message' => 'Database connection successful',
        'connection' => [
            'server' => 'MAHI\\SQLEXPRESS',
            'database' => 'university_db',
            'authentication' => 'Windows Authentication'
        ],
        'database' => [
            'version' => $version['version'],
            'current_time' => $time['current_time'],
            'tables_count' => $tableCount['table_count'],
            'users_count' => $userCount['total']
        ],
        'timestamp' => date('c')
    ], JSON_PRETTY_PRINT);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed',
        'error' => $e->getMessage(),
        'code' => $e->getCode()
    ], JSON_PRETTY_PRINT);
}
?>
