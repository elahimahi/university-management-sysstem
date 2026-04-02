
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

$hashedPassword = password_hash($password, PASSWORD_BCRYPT);

try {
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role) VALUES (?, ?, ?, ?, ?)");
    $stmt->execute([$email, $hashedPassword, $firstName, $lastName, $role]);
    
    $userId = $pdo->lastInsertId();
    
    http_response_code(201);
    $token = generateToken($userId);
    echo json_encode([
        'message' => 'User registered successfully',
        'user' => [
            'id' => $userId,
            'email' => $email,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'role' => $role
        ],
        'tokens' => [
            'accessToken' => $token,
            'refreshToken' => $token, // Simplified
            'expiresIn' => 3600
        ]
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
