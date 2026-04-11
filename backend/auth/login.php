<?php
ob_start();

// Get the origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '';

// List of allowed origins
$allowed_origins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost',
    'http://127.0.0.1'
];

// Set CORS headers
if (in_array($origin, $allowed_origins)) {
    header('Access-Control-Allow-Origin: ' . $origin, true);
} else {
    header('Access-Control-Allow-Origin: http://localhost:3000', true);
}

header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS', true);
header('Access-Control-Allow-Headers: Content-Type, Authorization', true);
header('Access-Control-Max-Age: 3600', true);

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Load database and auth helper
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/auth_helper.php';

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid request data']);
    exit;
}

$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? trim($data['password']) : '';
$role = isset($data['role']) ? trim($data['role']) : 'student';
$allowedRoles = ['student', 'faculty', 'admin'];

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Email and password are required']);
    exit;
}

if (!in_array($role, $allowedRoles, true)) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Invalid role selected']);
    exit;
}

try {
    // Check user existence
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email, role or password']);
        exit;
    }

    // Verify password
    if (!password_verify($password, $user['password'])) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email or password']);
        exit;
    }

    // Verify that the requested role matches the stored role,
    // or allow admin selection to authenticate superadmin users.
    $storedRole = isset($user['role']) ? trim($user['role']) : '';
    if ($storedRole !== $role && !($role === 'admin' && $storedRole === 'superadmin')) {
        http_response_code(401);
        echo json_encode(['status' => 'error', 'message' => 'Invalid email, role or password']);
        exit;
    }

    // Verify that the user has been approved
    if (isset($user['approval_status']) && $user['approval_status'] !== 'approved') {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'Account is not approved yet']);
        exit;
    }

    // Generate token
    $token = generateToken($user['id']);

    // Return success
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Login successful',
        'user' => array(
            'id' => $user['id'],
            'email' => $user['email'],
            'first_name' => $user['first_name'],
            'last_name' => $user['last_name'],
            'role' => $user['role'],
            'approval_status' => $user['approval_status'] ?? 'approved'
        ),
        'tokens' => array(
            'access_token' => $token,
            'refresh_token' => $token,
            'token_type' => 'Bearer'
        )
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Server error: ' . $e->getMessage()]);
}
?>
