
<?php
// --- CORS HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/auth_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid data']);
    exit;
}

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';
$firstName = $data['firstName'] ?? '';
$lastName = $data['lastName'] ?? '';
$role = $data['role'] ?? 'student';

if (!$email || !$password || !$firstName || !$lastName) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields']);
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
            'message' => 'Admin account already exists',
            'error' => 'Only one admin can be registered in the system'
        ]);
        exit;
    }
}

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    // For admin registrations, automatically approve
    $approvalStatus = ($role === 'admin') ? 'approved' : 'pending';
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, approval_status) VALUES (?, ?, ?, ?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $role, $approvalStatus]);
    
    $userId = $pdo->lastInsertId();
    
    http_response_code(201);
    
    // Only generate token if user is approved (admins)
    if ($approvalStatus === 'approved') {
        $token = generateToken($userId);
        $tokens = [
            'accessToken' => $token,
            'refreshToken' => $token,
            'expiresIn' => 3600
        ];
    } else {
        $tokens = null;
    }
    
    echo json_encode([
        'message' => 'User registered successfully. Awaiting admin approval.',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => $role,
            'approval_status' => $approvalStatus
        ],
        'tokens' => $tokens,
        'status' => $approvalStatus
    ]);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['message' => 'Email already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Registration failed: ' . $e->getMessage()]);
    }
}
?>
