<?php
require_once __DIR__ . '/../core/db_connect.php';

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['status' => 'error', 'message' => 'Method not allowed']);
    exit;
}

try {
    $timestamp = date('YmdHis');
    $email = "faculty_demo_{$timestamp}@university.edu";
    $passwordHash = password_hash('password123', PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, created_at, updated_at) VALUES (?, ?, ?, ?, ?, 1, GETDATE(), GETDATE())");
    $stmt->execute([$email, $passwordHash, 'Faculty', 'Demo', 'faculty']);

    echo json_encode([
        'status' => 'success',
        'message' => 'Demo faculty user added successfully',
        'email' => $email,
        'password' => 'password123'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to add demo faculty user: ' . $e->getMessage()
    ]);
}
?>