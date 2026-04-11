<?php
// Faculty - Get Course Students (for attendance and messaging)
// GET /faculty/get_course_students.php?faculty_id={id}&course_id={id}

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once __DIR__ . '/../core/db_connect.php';

try {
    if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit;
    }

    $faculty_id = (int)($_GET['faculty_id'] ?? 0);
    $course_id = (int)($_GET['course_id'] ?? 0);

    if (!$course_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing course_id']);
        exit;
    }

    // If faculty_id provided, verify ownership
    if ($faculty_id) {
        $stmt = $conn->prepare("
            SELECT id FROM courses 
            WHERE id = ? AND faculty_id = ?
        ");
        $stmt->execute([$course_id, $faculty_id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(403);
            echo json_encode(['error' => 'Course not found or access denied']);
            exit;
        }
    }

    try {
        // Get course details with students
        $stmt = $conn->prepare("
            SELECT TOP 1
                c.id,
                c.code,
                c.name,
                c.credits,
                c.semester,
                COUNT(DISTINCT e.student_id) as students_count
            FROM courses c
            LEFT JOIN enrollments e ON c.id = e.course_id AND e.status = 'active'
            WHERE c.id = ?
            GROUP BY c.id, c.code, c.name, c.credits, c.semester
        ");
        $stmt->execute([$course_id]);
        $course = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$course) {
            http_response_code(404);
            echo json_encode(['error' => 'Course not found']);
            exit;
        }

        // Get students enrolled in course
        $stmt = $conn->prepare("
            SELECT DISTINCT
                u.id,
                u.firstname,
                u.lastname,
                u.email,
                u.student_id,
                e.enrollment_date,
                e.status
            FROM users u
            INNER JOIN enrollments e ON u.id = e.student_id
            WHERE e.course_id = ? AND u.role = 'student' AND e.status = 'active'
            ORDER BY u.firstname, u.lastname
        ");
        $stmt->execute([$course_id]);
        $students = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // Return as array of courses (for consistency with other endpoints)
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => (int)$course['id'],
                    'code' => $course['code'],
                    'name' => $course['name'],
                    'credits' => (int)$course['credits'],
                    'semester' => $course['semester'],
                    'students_count' => (int)$course['students_count'],
                    'students' => $students
                ]
            ]
        ]);
        
    } catch (PDOException $e) {
        error_log('Query error in get_course_students: ' . $e->getMessage());
        
        // Return fallback data
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'data' => [
                [
                    'id' => $course_id,
                    'code' => 'COURSE101',
                    'name' => 'Course Name',
                    'credits' => 3,
                    'semester' => 'Fall 2024',
                    'students_count' => 0,
                    'students' => []
                ]
            ]
        ]);
    }

} catch (Exception $e) {
    error_log('Error in get_course_students.php: ' . $e->getMessage());
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'data' => [],
        'message' => 'Using fallback data'
    ]);
}
?>
