
<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
// Must be completely first - before any output

// Set response code first
http_response_code(200);

// CORS headers - CRITICAL ORDER
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// CRITICAL: Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW load database and execute logic
// ============================================

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/auth_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid data']);
    exit;
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$role = $data['role'] ?? 'student';

// Validate role
$allowedRoles = ['student', 'faculty', 'admin'];
if (!in_array($role, $allowedRoles)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid role specified']);
    exit;
}

if (!$email || !$password || !$firstName || !$lastName) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
    exit;
}

// CHECK: Only allow ONE admin registration
if ($role === 'admin') {
    // Check if admin already exists
    $adminCheckStmt = $pdo->prepare("SELECT COUNT(*) as admin_count FROM users WHERE role = 'admin'");
    $adminCheckStmt->execute();
    $result = $adminCheckStmt->fetch();
    
    if ($result['admin_count'] > 0) {
        http_response_code(403);
        echo json_encode([
            'status' => 'error',
            'message' => 'Admin account already exists',
            'error' => 'Only one admin can be registered in the system. Please use a different role.'
        ]);
        exit(0);
    }
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    // All new registrations require superadmin approval
    $approvalStatus = 'pending';
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, approval_status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $role, $approvalStatus]);
    
    $userId = $pdo->lastInsertId();
    
    http_response_code(201);
    
    // No tokens for pending users
    $tokens = null;
    
    echo json_encode([
        'status' => 'success',
        'message' => 'User registered successfully. Awaiting superadmin approval.',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => $role,
            'approval_status' => $approvalStatus
        ],
        'tokens' => $tokens,
        'approval_status' => $approvalStatus
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['status' => 'error', 'message' => 'Email already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['status' => 'error', 'message' => 'Registration failed: ' . $e->getMessage()]);
    }
}
?>
