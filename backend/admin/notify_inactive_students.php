<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireAdminAuth();

try {
    // Get inactive students (students who have never logged in)
    // Check login_history table if it exists, otherwise use a default query
    $sql = "
        SELECT COUNT(*) as cnt
        FROM INFORMATION_SCHEMA.TABLES 
        WHERE TABLE_NAME = 'login_history'
    ";
    $tableCheck = $pdo->query($sql)->fetch();
    
    if ($tableCheck && $tableCheck['cnt'] > 0) {
        // If login_history exists, use it
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.first_name, u.last_name
            FROM users u
            WHERE u.role = 'student' 
              AND u.approval_status = 'approved'
              AND NOT EXISTS (
                  SELECT 1 FROM login_history lh 
                  WHERE lh.user_id = u.id
              )
        ");
    } else {
        // Otherwise, all approved students are considered inactive by default
        $stmt = $pdo->prepare("
            SELECT u.id, u.email, u.first_name, u.last_name
            FROM users u
            WHERE u.role = 'student' 
              AND u.approval_status = 'approved'
        ");
    }
    
    $stmt->execute();
    $inactiveStudents = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Create or update notifications for inactive students
    $createdNotifications = 0;
    $updatedNotifications = 0;
    
    foreach ($inactiveStudents as $student) {
        // Check if notification already exists for this student
        $checkStmt = $pdo->prepare("
            SELECT id, status FROM admin_notifications 
            WHERE student_id = ? AND message_type = 'inactive_student'
            ORDER BY created_at DESC
        ");
        $checkStmt->execute([$student['id']]);
        $existing = $checkStmt->fetch(PDO::FETCH_ASSOC);

        $message = "Student {$student['first_name']} {$student['last_name']} ({$student['email']}) has never logged in";
        
        if (!$existing) {
            // Create new notification
            $insertStmt = $pdo->prepare("
                INSERT INTO admin_notifications 
                (student_id, message_type, message, status, created_at)
                VALUES (?, 'inactive_student', ?, 'unread', GETDATE())
            ");
            if ($insertStmt->execute([$student['id'], $message])) {
                $createdNotifications++;
            }
        } else if ($existing['status'] === 'read') {
            // Mark as unread again if it was read
            $updateStmt = $pdo->prepare("
                UPDATE admin_notifications 
                SET status = 'unread' 
                WHERE id = ?
            ");
            if ($updateStmt->execute([$existing['id']])) {
                $updatedNotifications++;
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'totalInactiveStudents' => count($inactiveStudents),
        'notificationsCreated' => $createdNotifications,
        'notificationsUpdated' => $updatedNotifications,
        'students' => $inactiveStudents
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to notify inactive students: ' . $e->getMessage()
    ]);
}
?>
