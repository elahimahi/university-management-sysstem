<?php
/**
 * API Connection Test
 * GET /test-connection.php
 * 
 * Simple endpoint to verify frontend-backend connection
 */

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Try database connection
try {
    require_once __DIR__ . '/core/db_connect.php';
    
    // Test query
    $result = $pdo->query("SELECT 1 as test");
    $test = $result->fetch();
    
    if ($test) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'Backend API is running',
            'backend_url' => 'http://localhost:8000',
            'database' => 'Connected to MAHI\SQLEXPRESS - university_db',
            'timestamp' => date('Y-m-d H:i:s'),
            'php_version' => phpversion()
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database connection failed: ' . $e->getMessage(),
        'backend_url' => 'http://localhost:8000'
    ]);
}
?>
