<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Drop the existing constraint if exists
    $pdo->exec("ALTER TABLE users DROP CONSTRAINT CK__users__role__5EBF139D");
    
    // Add new constraint with superadmin role
    $pdo->exec("ALTER TABLE users ADD CONSTRAINT CK_users_role CHECK (role IN ('student', 'faculty', 'admin', 'superadmin'))");
    
    echo json_encode(['success' => true, 'message' => 'Constraint updated successfully']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>
