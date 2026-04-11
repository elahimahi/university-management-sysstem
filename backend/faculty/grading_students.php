<?php
/**
 * Get Faculty's Students and Their Enrollments
 * GET /faculty/grading-students
 * 
 * Returns all students from courses taught by the faculty with their enrollments
 */

require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is authenticated and is faculty
$user = requireFacultyAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

try {
    // Get all students enrolled in courses taught by this faculty
    $stmt = $pdo->prepare("
        SELECT 
            u.id as student_id,
            u.first_name,
            u.last_name,
            u.email,
            c.id as course_id,
            c.code as course_code,
            c.name as course_name,
            c.credits,
            e.id as enrollment_id,
            e.semester,
            e.status as enrollment_status,
            e.enrolled_at,
            AVG(CAST(g.points as FLOAT)) as current_grade,
            COUNT(g.id) as grades_count
        FROM courses c
        JOIN enrollments e ON c.id = e.course_id
        JOIN users u ON e.student_id = u.id
        LEFT JOIN grades g ON e.student_id = g.student_id AND e.course_id = g.course_id
        WHERE c.instructor_id = ?
        GROUP BY 
            u.id, u.first_name, u.last_name, u.email,
            c.id, c.code, c.name, c.credits,
            e.id, e.semester, e.status, e.enrolled_at
        ORDER BY c.code, u.last_name, u.first_name
    ");
    $stmt->execute([$user['id']]);
    $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Format data
    $groupedBycourse = [];
    foreach ($students as $student) {
        $course_key = $student['course_id'];
        if (!isset($groupedByCourse[$course_key])) {
            $groupedByourse[$course_key] = [
                'course_id' => $student['course_id'],
                'course_code' => $student['course_code'],
                'course_name' => $student['course_name'],
                'credits' => $student['credits'],
                'students' => []
            ];
        }
        $groupedByourse[$course_key]['students'][] = [
            'student_id' => $student['student_id'],
            'first_name' => $student['first_name'],
            'last_name' => $student['last_name'],
            'email' => $student['email'],
            'enrollment_id' => $student['enrollment_id'],
            'semester' => $student['semester'],
            'enrollment_status' => $student['enrollment_status'],
            'current_grade' => $student['current_grade'] ? round($student['current_grade'], 2) : null,
            'grades_count' => $student['grades_count']
        ];
    }

    echo json_encode([
        'status' => 'success',
        'courses' => array_values($groupedByourse),
        'total_students' => count($students)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Database error: ' . $e->getMessage()]);
}
?>
