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

if (!isset($data['enrollment_id']) || !isset($data['grade']) || !isset($data['grade_point'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing required fields: enrollment_id, grade, grade_point']);
    exit();
}

try {
    // 1. Verify this instructor actually teaches the course for this enrollment
    $stmt = $pdo->prepare("
        SELECT e.id, e.student_id, c.id as course_id
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.id = ? AND c.instructor_id = ?
    ");
    $stmt->execute([$data['enrollment_id'], $user['id']]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$enrollment) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You do not have permission to grade this student']);
        exit();
    }

    // 2. Insert the grade
    $stmt = $pdo->prepare("
        INSERT INTO grades (enrollment_id, grade, grade_point, assessment_type, recorded_at) 
        VALUES (?, ?, ?, ?, GETDATE())
    ");
    $stmt->execute([
        $data['enrollment_id'],
        $data['grade'],
        $data['grade_point'],
        $data['assessment_type'] ?? 'Final Score'
    ]);

    // 3. Optionally update enrollment status to completed if needed
    if (isset($data['mark_completed']) && $data['mark_completed'] === true) {
        $stmt = $pdo->prepare("UPDATE enrollments SET status = 'completed' WHERE id = ?");
        $stmt->execute([$data['enrollment_id']]);
    }

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Grade recorded successfully',
        'enrollment_id' => $data['enrollment_id'],
        'grade' => $data['grade'],
        'grade_point' => $data['grade_point']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to record grade: ' . $e->getMessage()]);
}
?>
