<?php
/**
 * Enforce Single SuperAdmin
 * Ensures only one SuperAdmin account exists in the system
 */

require_once __DIR__ . '/core/db_connect.php';

try {
    // Count superadmin accounts
    $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'");
    $stmt->execute();
    $result = $stmt->fetch();
    $superadminCount = $result['count'];
    
    echo "SuperAdmin Accounts: " . $superadminCount . PHP_EOL;
    
    if ($superadminCount === 0) {
        echo "ERROR: No SuperAdmin account found!" . PHP_EOL;
        echo "Creating default SuperAdmin..." . PHP_EOL;
        
        $email = 'superadmin@university.edu';
        $password = password_hash('superadmin123', PASSWORD_BCRYPT);
        $firstName = 'Super';
        $lastName = 'Admin';
        
        $insertStmt = $pdo->prepare("
            INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status, created_at, updated_at)
            VALUES (?, ?, ?, ?, 'superadmin', 1, 'approved', GETDATE(), GETDATE())
        ");
        
        if ($insertStmt->execute([$email, $password, $firstName, $lastName])) {
            echo "✓ SuperAdmin created successfully" . PHP_EOL;
            echo "  Email: $email" . PHP_EOL;
            echo "  Password: superadmin123" . PHP_EOL;
        }
    } elseif ($superadminCount > 1) {
        echo "WARNING: Multiple SuperAdmin accounts found!" . PHP_EOL;
        
        // Get all superadmin accounts
        $stmt = $pdo->prepare("SELECT id, email, created_at FROM users WHERE role = 'superadmin' ORDER BY created_at DESC");
        $stmt->execute();
        $admins = $stmt->fetchAll();
        
        echo "SuperAdmin accounts:" . PHP_EOL;
        foreach ($admins as $admin) {
            echo "  - ID: {$admin['id']}, Email: {$admin['email']}, Created: {$admin['created_at']}" . PHP_EOL;
        }
        
        // Keep only the oldest one, delete others
        $oldestId = end($admins)['id'];
        echo "Keeping oldest SuperAdmin (ID: $oldestId), deleting others..." . PHP_EOL;
        
        $deleteStmt = $pdo->prepare("DELETE FROM users WHERE role = 'superadmin' AND id != ?");
        if ($deleteStmt->execute([$oldestId])) {
            echo "✓ Duplicate SuperAdmin accounts removed" . PHP_EOL;
        }
    } else {
        echo "✓ Exactly one SuperAdmin account exists" . PHP_EOL;
        $stmt = $pdo->prepare("SELECT id, email, created_at FROM users WHERE role = 'superadmin'");
        $stmt->execute();
        $admin = $stmt->fetch();
        echo "  Email: {$admin['email']}" . PHP_EOL;
        echo "  Created: {$admin['created_at']}" . PHP_EOL;
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . PHP_EOL;
}
?>
