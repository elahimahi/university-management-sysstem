<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    $courseCode = strtoupper(preg_replace('/\s+/', ' ', trim($data['code'] ?? '')));
    $courseName = trim($data['name'] ?? '');

    if (!$courseCode || !$courseName || !isset($data['instructor_id'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Required fields: code, name, instructor_id']);
        exit;
    }

    if ($courseCode === '') {
        http_response_code(400);
        echo json_encode(['error' => 'Course code is required']);
        exit;
    }

    // Get instructor_id and semester
    $instructorId = $data['instructor_id'] ?? null;
    $semester = trim($data['semester'] ?? 'Fall 2024');

    if (!$instructorId) {
        http_response_code(400);
        echo json_encode(['error' => 'Instructor ID is required']);
        exit;
    }

    // Check if faculty already has this course code in the same semester (case-insensitive, ignoring spaces)
    $duplicateQuery = "SELECT id FROM courses WHERE instructor_id = ? AND semester = ? AND REPLACE(LOWER(LTRIM(RTRIM(code))), ' ', '') = REPLACE(LOWER(LTRIM(RTRIM(?))), ' ', '')";
    $duplicateStmt = $pdo->prepare($duplicateQuery);
    $duplicateStmt->execute([$instructorId, $semester, $courseCode]);

    if ($duplicateStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Duplicate Course not allowed']);
        exit;
    }

    $insertQuery = "
        INSERT INTO courses (code, name, credits, category, level, instructor_id, semester, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, GETDATE())
    ";

    $stmt = $pdo->prepare($insertQuery);
    $result = $stmt->execute([
        $courseCode,
        $courseName,
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id'],
        $data['semester'] ?? 'Fall 2024'
    ]);

    if ($result) {
        echo json_encode([
            'success' => true,
            'message' => 'Course created successfully',
            'id' => $pdo->lastInsertId()
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create course']);
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
