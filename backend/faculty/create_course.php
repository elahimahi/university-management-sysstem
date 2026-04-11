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

    // Check if course code already exists (case-insensitive, ignoring spaces)
    $checkQuery = "SELECT id FROM courses WHERE REPLACE(LOWER(LTRIM(RTRIM(code))), ' ', '') = REPLACE(LOWER(LTRIM(RTRIM(?))), ' ', '')";
    $checkStmt = $pdo->prepare($checkQuery);
    $checkStmt->execute([$courseCode]);

    if ($checkStmt->rowCount() > 0) {
        http_response_code(409);
        echo json_encode(['error' => 'Course code already exists']);
        exit;
    }

    $insertQuery = "
        INSERT INTO courses (code, name, credits, category, level, instructor_id, created_at)
        VALUES (?, ?, ?, ?, ?, ?, GETDATE())
    ";

    $stmt = $pdo->prepare($insertQuery);
    $result = $stmt->execute([
        $courseCode,
        $courseName,
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id']
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
