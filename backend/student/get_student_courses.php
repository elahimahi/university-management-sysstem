<?php
/**
 * Get Student Courses Endpoint
 * GET /student/courses
 * 
 * Returns all courses enrolled by the authenticated student.
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated and is a student
$user = requireStudentAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    $stmt = $pdo->prepare('
        SELECT 
            c.id,
            c.code, 
            c.name, 
            c.credits, 
            c.category,
            c.level,
            e.semester, 
            e.status,
            e.enrolled_at,
            u.first_name,
            u.last_name
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id
        LEFT JOIN users u ON c.instructor_id = u.id
        WHERE e.student_id = ? 
        ORDER BY e.semester DESC, c.code
    ');
    $stmt->execute([$user['id']]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'status' => 'success',
        'courses' => $courses,
        'total' => count($courses)
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
