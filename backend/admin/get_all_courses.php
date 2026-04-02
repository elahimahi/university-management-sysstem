<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json');

try {
    $stmt = $pdo->query("SELECT * FROM courses ORDER BY id DESC");
    $courses = $stmt->fetchAll();

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'courses' => $courses,
        'total' => count($courses)
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
