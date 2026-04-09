<?php
/**
 * Test MS SQL Server Connection
 * This script verifies that the backend can connect to the MS SQL database
 */

// Include the database connection file
require_once __DIR__ . '/db_connect.php';

try {
    // Test the connection
    $result = $pdo->query("SELECT 1 as test");
    $test = $result->fetch();
    
    if ($test) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Successfully connected to MS SQL Server (university_db)',
            'server' => 'MAHI\SQLEXPRESS',
            'database' => 'university_db',
            'timestamp' => date('Y-m-d H:i:s')
        ]);
    }
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Connection test failed: ' . $e->getMessage(),
        'error_code' => $e->getCode()
    ]);
}
?>
