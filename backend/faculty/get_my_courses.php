<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $faculty_id = $_GET['faculty_id'] ?? null;

    if (!$faculty_id) {
        http_response_code(400);
        echo json_encode(['error' => 'Faculty ID is required']);
        exit;
    }

    // Get courses where this faculty is the instructor
    $query = "
        SELECT 
            c.id,
            c.code,
            c.name,
            c.credits,
            c.category,
            c.level,
            (SELECT COUNT(*) FROM enrollments WHERE course_id = c.id AND status = 'active') as students_count
        FROM courses c
        WHERE c.instructor_id = :faculty_id
        ORDER BY c.code ASC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute(['faculty_id' => $faculty_id]);
    $courses = $stmt->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'courses' => $courses,
        'total' => count($courses)
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
