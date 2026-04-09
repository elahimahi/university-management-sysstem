<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$debug = [];

try {
    $debug['connection'] = 'Connected to database';
    
    // Check if courses table exists
    try {
        $coursesTest = $pdo->query("SELECT COUNT(*) FROM courses");
        $debug['courses_table'] = 'EXISTS';
        $debug['courses_count'] = $coursesTest->fetch()[0];
    } catch (Exception $e) {
        $debug['courses_table'] = 'ERROR: ' . $e->getMessage();
    }
    
    // Check if fees table exists
    try {
        $feesTest = $pdo->query("SELECT COUNT(*) FROM fees");
        $debug['fees_table'] = 'EXISTS';
        $debug['fees_count'] = $feesTest->fetch()[0];
    } catch (Exception $e) {
        $debug['fees_table'] = 'ERROR: ' . $e->getMessage();
    }
    
    // List all tables
    try {
        $tablesStmt = $pdo->query("
            SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
            WHERE TABLE_TYPE = 'BASE TABLE' 
            ORDER BY TABLE_NAME
        ");
        $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);
        $debug['all_tables'] = $tables;
    } catch (Exception $e) {
        $debug['tables_list'] = 'ERROR: ' . $e->getMessage();
    }
    
    http_response_code(200);
    echo json_encode($debug, JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
