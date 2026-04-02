<?php
/**
 * Test Authentication Flow
 * Direct test to verify token generation and authentication
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

header('Content-Type: application/json');

try {
    echo "=== Token Generation Test ===\n\n";
    
    // 1. Generate token for faculty_demo (user ID 12)
    $token = generateToken(12);
    echo "Generated Token for User ID 12:\n";
    echo "$token\n\n";
    
    // 2. Verify token
    echo "=== Token Verification Test ===\n\n";
    $userId = verifyToken($token);
    echo "Verified User ID from Token: $userId\n\n";
    
    // 3. Get user details
    if ($userId) {
        echo "=== User Details ===\n\n";
        $stmt = $pdo->prepare("SELECT id, email, first_name, last_name, role FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode($user, JSON_PRETTY_PRINT) . "\n\n";
        
        // 4. Get courses for this user
        if ($user['role'] === 'faculty') {
            echo "=== Courses for this Faculty ===\n\n";
            $stmt = $pdo->prepare("SELECT id, code, name, credits FROM courses WHERE instructor_id = ? ORDER BY name");
            $stmt->execute([$user['id']]);
            $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($courses, JSON_PRETTY_PRINT) . "\n\n";
        }
    } else {
        echo "ERROR: Token verification failed!\n";
    }
    
} catch (Exception $e) {
    echo "ERROR: " . $e->getMessage();
}
?>
