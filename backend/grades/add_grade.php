<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Check if user is faculty
$user = requireFacultyAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

$data = json_decode(file_get_contents("php://input"), true);

// Support both old enrollment_id and new student_id + course_id format
$student_id = null;
$course_id = null;
$enrollment_id = null;

if (isset($data['enrollment_id'])) {
    // Old format: get student_id and course_id from enrollment
    $stmt = $pdo->prepare("SELECT student_id, course_id FROM enrollments WHERE id = ?");
    $stmt->execute([$data['enrollment_id']]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($enrollment) {
        $student_id = $enrollment['student_id'];
        $course_id = $enrollment['course_id'];
        $enrollment_id = $data['enrollment_id'];
    }
} elseif (isset($data['student_id']) && isset($data['course_id'])) {
    // New format: directly provided
    $student_id = $data['student_id'];
    $course_id = $data['course_id'];
}

if (!$student_id || !$course_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing: enrollment_id OR (student_id + course_id)']);
    exit();
}

if (!isset($data['grade']) || !isset($data['grade_point'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing: grade, grade_point']);
    exit();
}

try {
    // Verify this instructor teaches this course
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ? AND instructor_id = ?");
    $stmt->execute([$course_id, $user['id']]);
    
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You do not have permission to grade this course']);
        exit();
    }

    // Insert or update the grade
    $stmt = $pdo->prepare("
        INSERT INTO grades (student_id, course_id, grade, points, semester, assigned_at) 
        VALUES (?, ?, ?, ?, ?, GETDATE())
    ");
    $stmt->execute([
        $student_id,
        $course_id,
        $data['grade'] ?? '?',
        $data['grade_point'],
        $data['semester'] ?? date('Y') . '-' . (date('n') > 6 ? 'Fall' : 'Spring')
    ]);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Grade recorded successfully',
        'student_id' => $student_id,
        'course_id' => $course_id,
        'grade' => $data['grade'],
        'points' => $data['grade_point']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to record grade: ' . $e->getMessage()]);
}
?>
