<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireFacultyAuth();
$userId = $user['id'];

try {
    // Fetch all students enrolled in any course taught by this faculty member
    $stmt = $pdo->prepare("
        SELECT DISTINCT u.id as student_id, u.email, u.first_name, u.last_name, 
                        c.id as course_id, c.code as course_code, c.name as course_name,
                        e.id as enrollment_id
        FROM enrollments e
        JOIN users u ON e.student_id = u.id
        JOIN courses c ON e.course_id = c.id
        WHERE c.instructor_id = ? AND e.status = 'active'
        ORDER BY u.last_name ASC
    ");
    $stmt->execute([$userId]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode($students);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to fetch students: ' . $e->getMessage()]);
}
?>
