<?php
// Reset Superadmin Password Script
require_once __DIR__ . '/core/db_connect.php';

$superadminEmail = 'superadmin@university.edu';
$newPassword = 'superadmin123';

try {
    // Check if superadmin exists
    $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ?");
    $stmt->execute([$superadminEmail]);
    $user = $stmt->fetch();

    if ($user) {
        // Update password
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $updateStmt = $pdo->prepare("UPDATE users SET password = ?, approval_status = 'approved', role = 'superadmin' WHERE email = ?");
        $updateStmt->execute([$hashedPassword, $superadminEmail]);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'Superadmin password reset successfully',
            'email' => $superadminEmail,
            'password' => $newPassword,
            'note' => 'Account is now approved and ready to use'
        ]);
    } else {
        // Create new superadmin
        $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);
        $insertStmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $insertStmt->execute([$superadminEmail, $hashedPassword, 'Super', 'Admin', 'superadmin', 1, 'approved']);
        
        echo json_encode([
            'status' => 'success',
            'message' => 'New Superadmin account created',
            'email' => $superadminEmail,
            'password' => $newPassword
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
