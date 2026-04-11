
<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
// Must be completely first - before any output

// Prevent any output before headers
ob_start();

// Allow requests from localhost (all ports)
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// CRITICAL: When credentials: true is used, we CANNOT use wildcard '*'
// We must return the exact origin back
if (in_array($origin, $allowed_origins) && !empty($origin)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} elseif (empty($origin)) {
    // No origin header - likely non-browser request, allow localhost
    header('Access-Control-Allow-Origin: http://localhost', true);
} else {
    // Unknown origin with credentials - reject by not echoing origin
    // Fall back to a safe default for development
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

// Set response code first
http_response_code(200);

// CORS headers - CRITICAL ORDER
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin, Accept-Language', true);
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

    // Create a general notification for pending student/faculty registration requests
    if (in_array($role, ['student', 'faculty'], true)) {
        $registrationMessage = sprintf(
            'New pending %s registration: %s %s (ID: %s, Email: %s)',
            ucfirst($role),
            $firstName,
            $lastName,
            $userId,
            $email
        );

        // Notify the superadmin account if one exists
        $adminStmt = $pdo->query("SELECT id FROM users WHERE role = 'superadmin'");
        $superAdmin = $adminStmt->fetch();

        if ($superAdmin && isset($superAdmin['id'])) {
            $notifyStmt = $pdo->prepare("INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, 'superadmin', ?, ?, 'registration', 'unread')");
            $notifyStmt->execute([$superAdmin['id'], $userId, $registrationMessage]);
        }
    }
    
    http_response_code(201);
    
    // No tokens for pending users
    $tokens = null;
    $successMessage = in_array($role, ['student', 'faculty']) ? 'Registration submitted and pending superadmin approval.' : 'User registered successfully. Awaiting superadmin approval.';
    
    echo json_encode([
        'status' => 'success',
        'message' => $successMessage,
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
