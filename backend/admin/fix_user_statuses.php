<?php
/**
 * Fix User Approval Statuses
 * This script ensures all users have a valid approval_status
 * Sets NULL or missing values to 'pending' for regular users and 'approved' for admins/superadmins
 */

require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    // Start transaction
    $pdo->beginTransaction();

    // Fix NULL approval_status for demo and regular users
    $stmt = $pdo->prepare("
        UPDATE users 
        SET approval_status = CASE 
            WHEN role IN ('admin', 'superadmin') THEN 'approved'
            ELSE 'pending'
        END
        WHERE approval_status IS NULL OR approval_status = ''
    ");
    $stmt->execute();
    $fixed = $stmt->rowCount();

    // Ensure all users have a valid approval_status value
    $stmt = $pdo->prepare("
        UPDATE users
        SET approval_status = 'pending'
        WHERE approval_status NOT IN ('approved', 'pending', 'rejected')
        AND role NOT IN ('admin', 'superadmin')
    ");
    $stmt->execute();
    $fixed_invalid = $stmt->rowCount();

    // Ensure admin/superadmin users are approved
    $stmt = $pdo->prepare("
        UPDATE users
        SET approval_status = 'approved'
        WHERE role IN ('admin', 'superadmin')
        AND approval_status NOT IN ('approved', 'pending', 'rejected')
    ");
    $stmt->execute();
    $fixed_admin = $stmt->rowCount();

    $pdo->commit();

    echo json_encode([
        'status' => 'success',
        'message' => 'User statuses fixed',
        'fixed_null_statuses' => $fixed,
        'fixed_invalid_statuses' => $fixed_invalid,
        'fixed_admin_statuses' => $fixed_admin,
        'total_fixed' => $fixed + $fixed_invalid + $fixed_admin
    ]);

} catch (Exception $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to fix user statuses: ' . $e->getMessage()
    ]);
}
?>
