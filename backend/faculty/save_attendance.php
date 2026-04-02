<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../core/db_connect.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data['course_id'] || !$data['date'] || !$data['records']) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: course_id, date, records']);
        exit;
    }

    $course_id = $data['course_id'];
    $date = $data['date'];
    $records = $data['records'];

    $pdo->beginTransaction();

    // First, delete any existing attendance records for this date and course
    $deleteQuery = "
        DELETE FROM attendance 
        WHERE enrollment_id IN (
            SELECT id FROM enrollments WHERE course_id = ?
        ) AND CAST(date AS DATE) = CAST(? AS DATE)
    ";
    $deleteStmt = $pdo->prepare($deleteQuery);
    $deleteStmt->execute([$course_id, $date]);

    // Insert new attendance records
    $insertQuery = "
        INSERT INTO attendance (enrollment_id, date, status, recorded_at)
        VALUES (:enrollment_id, :date, :status, GETDATE())
    ";
    $insertStmt = $pdo->prepare($insertQuery);

    $inserted = 0;
    foreach ($records as $record) {
        if ($record['status']) {
            $result = $insertStmt->execute([
                'enrollment_id' => $record['enrollment_id'],
                'date' => $date,
                'status' => $record['status']
            ]);
            if ($result) $inserted++;
        }
    }

    $pdo->commit();

    echo json_encode([
        'success' => true,
        'message' => "Attendance saved for $inserted students",
        'inserted' => $inserted
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
