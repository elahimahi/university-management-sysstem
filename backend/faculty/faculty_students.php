<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Get authorization token
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $_SERVER['HTTP_AUTHORIZATION'] ?? '';

if (!preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['message' => 'Unauthorized']);
    exit;
}

$token = $matches[1];
$facultyId = verifyToken($token);

if (!$facultyId) {
    http_response_code(401);
    echo json_encode(['message' => 'Invalid token']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

try {
    if ($method === 'GET') {
        // Get all students in instructor's courses
        $courseId = $_GET['course_id'] ?? null;
        
        if ($courseId) {
            // Get students for specific course
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    e.id as enrollment_id,
                    e.status,
                    (SELECT COUNT(*) FROM grades WHERE student_id = u.id AND course_id = ?) as grades_count,
                    (SELECT AVG(CAST(points AS FLOAT)) FROM grades WHERE student_id = u.id AND course_id = ? AND points IS NOT NULL) as avg_grade_point
                FROM enrollments e
                JOIN users u ON e.student_id = u.id
                WHERE e.course_id = ? AND (SELECT instructor_id FROM courses WHERE id = ?) = ?
                ORDER BY u.last_name, u.first_name
            ");
            $stmt->execute([$courseId, $courseId, $courseId, $courseId, $facultyId]);
        } else {
            // Get all students in all instructor's courses
            $stmt = $pdo->prepare("
                SELECT 
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.email,
                    c.name as course_name,
                    c.id as course_id,
                    e.id as enrollment_id,
                    e.status,
                    (SELECT COUNT(*) FROM grades WHERE student_id = u.id AND course_id = c.id) as grades_count,
                    (SELECT AVG(CAST(points AS FLOAT)) FROM grades WHERE student_id = u.id AND course_id = c.id AND points IS NOT NULL) as avg_grade_point
                FROM enrollments e
                JOIN users u ON e.student_id = u.id
                JOIN courses c ON e.course_id = c.id
                WHERE c.instructor_id = ?
                ORDER BY c.name, u.last_name, u.first_name
            ");
            $stmt->execute([$facultyId]);
        }
        
        $students = $stmt->fetchAll();

        echo json_encode([
            'success' => true,
            'students' => $students
        ]);

    } elseif ($method === 'POST') {
        // Faculty evaluates student submission
        $assignmentId = $data['assignment_id'] ?? null;
        $facultyRating = (int)($data['faculty_rating'] ?? 0); // 1-5 scale
        $feedback = $data['feedback'] ?? '';

        if (!$assignmentId) {
            http_response_code(400);
            echo json_encode(['message' => 'enrollment_id is required']);
            exit;
        }

        // Verify faculty can grade this student (owns the course)
        $verify = $pdo->prepare("
            SELECT e.id, e.student_id, e.course_id FROM enrollments e
            JOIN courses c ON e.course_id = c.id
            WHERE e.id = ? AND c.instructor_id = ?
        ");
        $verify->execute([$assignmentId, $facultyId]);
        $enrollment = $verify->fetch();
        
        if (!$enrollment) {
            http_response_code(403);
            echo json_encode(['message' => 'Not authorized to grade this student']);
            exit;
        }

        // Add grade for student
        $stmt = $pdo->prepare("
            INSERT INTO grades (student_id, course_id, grade, points, assigned_at)
            VALUES (?, ?, ?, ?, GETDATE())
        ");
        $stmt->execute([$enrollment['student_id'], $enrollment['course_id'], 'Evaluation', $facultyRating]);

        echo json_encode([
            'success' => true,
            'message' => 'Student evaluation recorded successfully'
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
}
?>
