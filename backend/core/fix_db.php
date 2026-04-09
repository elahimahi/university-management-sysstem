<?php
require_once __DIR__ . '/db_connect.php';

try {
    // Try to add missing columns
    $pdo->exec("ALTER TABLE users ADD approval_status VARCHAR(20) DEFAULT 'pending'");
    echo "✓ Added approval_status\n";
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE users ADD is_email_verified BIT DEFAULT 0");
    echo "✓ Added is_email_verified\n";
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE users ADD approved_by INT DEFAULT NULL");
    echo "✓ Added approved_by\n";
} catch (Exception $e) {}

try {
    $pdo->exec("ALTER TABLE users ADD rejection_reason VARCHAR(255) DEFAULT NULL");
    echo "✓ Added rejection_reason\n";
} catch (Exception $e) {}

// Create admin user
$stmt = $pdo->prepare("SELECT COUNT(*) as cnt FROM users WHERE email='admin@university.edu'");
$stmt->execute();
if ($stmt->fetch()['cnt'] == 0) {
    $pwd = password_hash('admin123', PASSWORD_DEFAULT);
    $stmt = $pdo->prepare("INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute(['admin@university.edu', $pwd, 'Admin', 'User', 'admin', 1, 'approved']);
    echo "✓ Created admin user\n";
}

echo "\n✓ Schema fixed! You can now login with:\nEmail: admin@university.edu\nPassword: admin123\n";
?>
