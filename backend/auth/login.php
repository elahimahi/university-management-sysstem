
<?php
// --- CORS HEADERS ---
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

file_put_contents(__DIR__ . '/debug.txt', 'Login endpoint hit: ' . date('c') . PHP_EOL, FILE_APPEND);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
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
$role = $data['role'] ?? '';

// Debug logging
file_put_contents('debug_login.log', "Login attempt: Email: $email | Password: $password | Role: $role\n", FILE_APPEND);

if (!$email || !$password || !$role) {
    http_response_code(400);
    echo json_encode(['message' => 'Email, password, and role are required']);
    exit;
}

try {
    // Check if user exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Auto-register new user
        $hashedPassword = password_hash($password, PASSWORD_DEFAULT);
        $firstName = $data['first_name'] ?? 'New';
        $lastName = $data['last_name'] ?? 'User';
        // Accept role from login request if provided (faculty/admin/student)
        $role = isset($data['role']) && in_array($data['role'], ['student', 'faculty', 'admin']) ? $data['role'] : 'student';
        $isEmailVerified = 1;
        // Auto-approve if registering as admin, otherwise set to pending
        $approvalStatus = ($role === 'admin') ? 'approved' : 'pending';
        $insertStmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insertStmt->execute([$email, $hashedPassword, $firstName, $lastName, $role, $isEmailVerified, $approvalStatus]);
        // Fetch the newly created user
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
    }

    if ($user && password_verify($password, $user['password'])) {
        // Check if provided role matches user's role
        if ($user['role'] !== $role) {
            http_response_code(403);
            echo json_encode(['message' => 'Invalid role for this user']);
            exit;
        }
        
        // CHECK IF USER IS APPROVED (Super Admin System)
        // Auto-approve if approval_status is NULL (old users), or check if explicitly approved
        $approvalStatus = $user['approval_status'] ?? 'approved';
        
        if ($approvalStatus === 'rejected') {
            http_response_code(403);
            echo json_encode([
                'message' => 'Your registration has been rejected',
                'reason' => $user['rejection_reason'] ?? 'Not specified',
                'approval_status' => 'rejected'
            ]);
            exit;
        }
        
        if ($approvalStatus === 'pending') {
            http_response_code(403);
            echo json_encode([
                'message' => 'Your registration is waiting for admin approval',
                'approval_status' => 'pending'
            ]);
            exit;
        }
        
        // If approval_status was NULL, update it to 'approved' (auto-approve old users)
        if ($user['approval_status'] === NULL) {
            try {
                $updateStmt = $pdo->prepare("UPDATE users SET approval_status = 'approved' WHERE id = ?");
                $updateStmt->execute([$user['id']]);
            } catch (Exception $e) {
                // Continue even if update fails
            }
        }
        
        $token = generateToken($user['id']);
        echo json_encode([
            'user' => [
                'id' => $user['id'],
                'email' => $user['email'],
                'first_name' => $user['first_name'],
                'last_name' => $user['last_name'],
                'role' => $user['role'],
                'is_email_verified' => (bool)$user['is_email_verified'],
                'approval_status' => 'approved',
                'createdAt' => $user['created_at'],
                'updatedAt' => $user['updated_at']
            ],
            'tokens' => [
                'accessToken' => $token,
                'refreshToken' => $token, // Simplified for now
                'expiresIn' => 3600
            ]
        ]);
    } else {
        http_response_code(401);
        echo json_encode(['message' => 'Invalid email or password']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Login failed: ' . $e->getMessage()]);
}
?>
