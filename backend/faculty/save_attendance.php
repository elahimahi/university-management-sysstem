<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require_once __DIR__ . '/../core/db_connect.php';

$logFile = __DIR__ . '/../attendance_debug.log';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    
    file_put_contents($logFile, "\n" . date('Y-m-d H:i:s') . " - Received data: " . json_encode($data) . "\n", FILE_APPEND);

    // Validate required fields
    if (!isset($data['course_id']) || !isset($data['date'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing course_id or date']);
        exit;
    }

    $course_id = $data['course_id'];
    $date = $data['date'];
    $records = $data['records'] ?? [];

    if (!is_array($records)) {
        http_response_code(400);
        echo json_encode(['error' => 'Records must be an array', 'received' => gettype($records)]);
        exit;
    }

    if (empty($records)) {
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'No records to save', 'inserted' => 0]);
        exit;
    }

    file_put_contents($logFile, "  Processing " . count($records) . " records for course $course_id on $date\n", FILE_APPEND);

    $pdo->beginTransaction();

    // Delete existing records for this course and date
    try {
        // First delete any existing records
        $deleteQuery = "
            DELETE FROM attendance 
            WHERE enrollment_id IN (SELECT id FROM enrollments WHERE course_id = ?)
            AND CAST(date AS DATE) = CAST(? AS DATE)
        ";
        $deleteStmt = $pdo->prepare($deleteQuery);
        $deleteStmt->execute([$course_id, $date]);
        file_put_contents($logFile, "  Deleted existing records\n", FILE_APPEND);
    } catch (PDOException $e) {
        file_put_contents($logFile, "  Delete error: " . $e->getMessage() . "\n", FILE_APPEND);
    }

    // Get all enrollments for this course to map records
    $enrollStmt = $pdo->prepare("SELECT id, student_id FROM enrollments WHERE course_id = ?");
    $enrollStmt->execute([$course_id]);
    $enrollments = $enrollStmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Create a map of student_id -> enrollment_id
    $studentToEnrollment = [];
    foreach ($enrollments as $enr) {
        $studentToEnrollment[$enr['student_id']] = $enr['id'];
    }
    
    file_put_contents($logFile, "  Found " . count($enrollments) . " enrollments for course $course_id\n", FILE_APPEND);

<<<<<<< HEAD
    // Insert or update attendance records
=======
    // Insert new records using enrollment_id
>>>>>>> dev
    $insertQuery = "INSERT INTO attendance (enrollment_id, date, status) VALUES (?, ?, ?)";
    $insertStmt = $pdo->prepare($insertQuery);
    
    $updateQuery = "UPDATE attendance SET status = ? WHERE enrollment_id = ? AND CAST(date AS DATE) = CAST(? AS DATE)";
    $updateStmt = $pdo->prepare($updateQuery);

    $inserted = 0;
    $skipped = 0;
    
    foreach ($records as $idx => $record) {
        $status = $record['status'] ?? null;
        
        if (!$status) {
            $skipped++;
            file_put_contents($logFile, "    Record $idx: skipped - no status\n", FILE_APPEND);
            continue;
        }

        // Get student_id from record
        $studentId = $record['student_id'] ?? $record['id'] ?? null;
        
        if (!$studentId || !isset($studentToEnrollment[$studentId])) {
            file_put_contents($logFile, "    Record $idx: skipped - student $studentId not enrolled in course $course_id\n", FILE_APPEND);
            $skipped++;
            continue;
        }
        
        $enrollmentId = $studentToEnrollment[$studentId];
        
        file_put_contents($logFile, "    Record $idx: enrollment_id=$enrollmentId, status=$status\n", FILE_APPEND);

        try {
<<<<<<< HEAD
            // Try to insert new record
=======
>>>>>>> dev
            $result = $insertStmt->execute([$enrollmentId, $date, $status]);
            if ($result) {
                $inserted++;
                file_put_contents($logFile, "      ✓ Inserted\n", FILE_APPEND);
            }
        } catch (PDOException $e) {
<<<<<<< HEAD
            // If duplicate key violation, update instead
            $error_msg = strtoupper($e->getMessage());
            if (strpos($error_msg, 'UNIQUE') !== false || strpos($error_msg, 'DUPLICATE') !== false) {
                try {
                    file_put_contents($logFile, "      Record exists, updating instead\n", FILE_APPEND);
                    $updateStmt->execute([$status, $enrollmentId, $date]);
                    $inserted++;
                    file_put_contents($logFile, "      ✓ Updated\n", FILE_APPEND);
                } catch (PDOException $update_err) {
                    file_put_contents($logFile, "      Update error: " . $update_err->getMessage() . "\n", FILE_APPEND);
                }
            } else {
                file_put_contents($logFile, "      Error: " . $e->getMessage() . "\n", FILE_APPEND);
            }
=======
            file_put_contents($logFile, "      Error: " . $e->getMessage() . "\n", FILE_APPEND);
            // Continue with next record
>>>>>>> dev
        }
    }

    $pdo->commit();

    file_put_contents($logFile, "  Success: $inserted inserted, $skipped skipped\n", FILE_APPEND);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Attendance saved for $inserted students",
        'inserted' => $inserted,
        'skipped' => $skipped,
        'total' => count($records)
    ]);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    file_put_contents($logFile, "\n" . date('Y-m-d H:i:s') . " - Error: " . $e->getMessage() . "\n", FILE_APPEND);
    
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
