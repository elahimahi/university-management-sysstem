<?php
require_once __DIR__ . '/../core/db_connect.php';

header('Content-Type: application/json; charset=utf-8');

try {
    // Get a student with enrollments
    $stmt = $pdo->query("SELECT TOP 1 e.student_id FROM enrollments e");
    $result = $stmt->fetch();
    if (!$result) {
        echo json_encode(['status' => 'info', 'message' => 'No enrollments found']);
        exit;
    }

    $studentId = $result['student_id'];

    // Get their courses
    $stmt = $pdo->prepare("SELECT course_id FROM enrollments WHERE student_id = ?");
    $stmt->execute([$studentId]);
    $enrollments = $stmt->fetchAll();

    $count = 0;

    // Add attendance records for the last 10 days
    foreach ($enrollments as $enrollment) {
        $courseId = $enrollment['course_id'];
        
        for ($i = 0; $i < 10; $i++) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $status = rand(0, 100) > 20 ? 'present' : 'absent'; // 80% attendance

            try {
                $stmt = $pdo->prepare("
                    INSERT INTO attendance (student_id, course_id, attendance_date, status) 
                    VALUES (?, ?, ?, ?)
                ");
                $stmt->execute([$studentId, $courseId, $date, $status]);
                $count++;
            } catch (Exception $e) {
                // Duplicate key, skip
            }
        }
    }

    echo json_encode([
        'status' => 'success',
        'message' => "Added $count attendance records",
        'student_id' => $studentId
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
?>
