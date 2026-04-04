<?php
require_once 'core/db_connect.php';

try {
    $stmt = $pdo->prepare('SELECT COUNT(*) as count FROM users WHERE role = ?');
    $stmt->execute(['superadmin']);
    $result = $stmt->fetch();
    echo 'SuperAdmin accounts: ' . $result['count'] . PHP_EOL;

    if ($result['count'] > 0) {
        $stmt2 = $pdo->prepare('SELECT id, email, first_name, last_name, created_at FROM users WHERE role = ?');
        $stmt2->execute(['superadmin']);
        $admins = $stmt2->fetchAll();
        echo 'Details:' . PHP_EOL;
        foreach ($admins as $admin) {
            echo '- ID: ' . $admin['id'] . ', Email: ' . $admin['email'] . ', Name: ' . $admin['first_name'] . ' ' . $admin['last_name'] . ', Created: ' . $admin['created_at'] . PHP_EOL;
        }
    }
} catch (Exception $e) {
    echo 'Error: ' . $e->getMessage() . PHP_EOL;
}
?>