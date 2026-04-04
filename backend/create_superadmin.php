<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Check if superadmin exists
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
    $stmt->execute();
    $result = $stmt->fetch();
    
    if ($result['count'] > 0) {
        echo json_encode(['message' => 'Superadmin already exists']);
        exit;
    }
    
    // Create a superadmin user
    $email = 'superadmin@university.edu';
    $password = password_hash('superadmin123', PASSWORD_DEFAULT);
    $firstName = 'Super';
    $lastName = 'Admin';
    
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $result = $stmt->execute([$email, $password, $firstName, $lastName, 'superadmin', 1, 'approved']);
    
    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Superadmin created successfully',
            'email' => $email,
            'password' => 'superadmin123',
            'instructions' => 'Use these credentials to login and approve other users'
        ]);
    } else {
        echo json_encode(['error' => 'Failed to create superadmin']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
