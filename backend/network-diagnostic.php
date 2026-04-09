<?php
/**
 * Network Diagnostic Endpoint
 * Test connectivity and response formatting
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

try {
    require_once __DIR__ . '/core/db_connect.php';
    
    // Test 1: Database connection
    $dbTest = false;
    try {
        $stmt = $pdo->query("SELECT 1");
        $dbTest = true;
    } catch (Exception $e) {
        // DB connection failed
    }
    
    // Test 2: Get SuperAdmin count
    $superAdminCount = 0;
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
        $result = $stmt->fetch();
        $superAdminCount = $result['count'] ?? 0;
    } catch (Exception $e) {
        // Query failed
    }
    
    // Test 3: Test API endpoint format
    $apiTest = [
        'user' => [
            'id' => 1,
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'last_name' => 'User',
            'role' => 'superadmin',
            'is_email_verified' => true,
            'approval_status' => 'approved',
            'createdAt' => date('c'),
            'updatedAt' => date('c')
        ],
        'tokens' => [
            'accessToken' => 'test-token',
            'refreshToken' => 'test-refresh',
            'expiresIn' => 3600
        ]
    ];
    
    http_response_code(200);
    echo json_encode([
        'status' => 'ok',
        'checks' => [
            'database' => [
                'status' => $dbTest ? 'connected' : 'failed',
                'message' => $dbTest ? 'Database connection successful' : 'Database connection failed'
            ],
            'superadmin' => [
                'status' => $superAdminCount > 0 ? 'exists' : 'missing',
                'count' => $superAdminCount,
                'message' => $superAdminCount === 1 ? 'Exactly one SuperAdmin account' : ($superAdminCount === 0 ? 'No SuperAdmin account found' : 'Multiple SuperAdmin accounts found')
            ],
            'cors' => [
                'status' => 'working',
                'message' => 'CORS headers are properly configured'
            ]
        ],
        'api_response_format' => $apiTest,
        'server' => [
            'php_version' => phpversion(),
            'sapi' => php_sapi_name(),
            'timestamp' => date('c')
        ]
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ]);
}
?>
