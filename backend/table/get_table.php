<?php
/**
 * Get Table Data Endpoint
 * GET /table/{table_name}
 *
 * Returns all data from the specified table.
 * Note: This is a generic endpoint for demonstration.
 * In production, add proper authentication and validation.
 */

// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

// Get table name from URL
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$basePath = '/SD_Project/university-management-sysstem/backend';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}
$segments = explode('/', trim($requestUri, '/'));
$tableName = $segments[1] ?? ''; // Assuming /table/{table_name}

if (empty($tableName)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Table name is required']);
    exit();
}

// Basic validation - only allow certain table names for security
$allowedTables = ['users', 'courses', 'students', 'faculty', 'attendance', 'grades', 'fees']; // Add your table names here

if (!in_array($tableName, $allowedTables)) {
    http_response_code(403);
    echo json_encode(['status' => 'error', 'message' => 'Access to this table is not allowed']);
    exit();
}

try {
    // Prepare and execute query
    $stmt = $pdo->prepare("SELECT * FROM $tableName");
    $stmt->execute();

    // Fetch all rows
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Return the data
    echo json_encode([
        'status' => 'success',
        'table' => $tableName,
        'data' => $data,
        'count' => count($data)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database query failed: ' . $e->getMessage()]);
}
?>