<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['code']) || !isset($data['name'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Course code and name are required']);
    exit;
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO courses (code, name, credits, category, level, instructor_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    
    $stmt->execute([
        $data['code'],
        $data['name'],
        $data['credits'] ?? 3,
        $data['category'] ?? 'General',
        $data['level'] ?? 'Undergraduate',
        $data['instructor_id'] ?? null
    ]);

    http_response_code(201);
    echo json_encode([
        'status' => 'success',
        'message' => 'Course created successfully',
        'course_id' => $pdo->lastInsertId()
    ]);

} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        http_response_code(409);
        echo json_encode(['message' => 'Course code already exists']);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Database error: ' . $e->getMessage()]);
    }
}
?>
