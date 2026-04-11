<?php
// ============================================
// ABSOLUTE FIRST LINE - CORS HEADERS
// ============================================
http_response_code(200);
header('Access-Control-Allow-Origin: *', true);
header('Access-Control-Allow-Credentials: true', true);
header('Access-Control-Max-Age: 86400', true);
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, HEAD', true);
header('Access-Control-Allow-Headers: Content-Type, Accept, X-Requested-With, Authorization, Origin', true);
header('Content-Type: application/json; charset=utf-8', true);

// Handle OPTIONS for preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// ============================================
// NOW execute logic
// ============================================
require_once __DIR__ . '/../core/db_connect.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data['course_id'] || !$data['grades']) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: course_id, grades']);
        exit;
    }

    $course_id = $data['course_id'];
    $grades = $data['grades'];

    $pdo->beginTransaction();

    $updateQuery = "
        UPDATE enrollments
        SET grade = :grade, grade_submitted_at = GETDATE()
        WHERE id = :enrollment_id AND course_id = :course_id
    ";

    $stmt = $pdo->prepare($updateQuery);

    $updated = 0;
    foreach ($grades as $grade) {
        if (isset($grade['enrollment_id']) && isset($grade['new_grade'])) {
            $result = $stmt->execute([
                'enrollment_id' => $grade['enrollment_id'],
                'grade' => $grade['new_grade'],
                'course_id' => $course_id
            ]);
            if ($result && $stmt->rowCount() > 0) $updated++;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Grades submitted for $updated students",
        'updated' => $updated
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
