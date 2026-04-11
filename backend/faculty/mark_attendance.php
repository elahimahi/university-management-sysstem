<?php
/**
 * Mark or update attendance for students in a course
 * POST /faculty/mark-attendance
 * 
 * Expected JSON body:
 * {
 *   "faculty_id": 1,
 *   "course_id": 2,
 *   "attendance_records": [
 *     {"enrollment_id": 5, "date": "2024-03-17", "status": "present", "attendance_marks": 1},
 *     {"enrollment_id": 6, "date": "2024-03-17", "status": "absent", "attendance_marks": 0},
 *     {"enrollment_id": 7, "date": "2024-03-17", "status": "late", "attendance_marks": 0.5}
 *   ]
 * }
 */

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
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireFacultyAuth();

$data = json_decode(file_get_contents('php://input'), true);

$faculty_id = $data['faculty_id'] ?? null;
$course_id = $data['course_id'] ?? null;
$attendance_records = $data['attendance_records'] ?? [];

if (!$faculty_id || !$course_id || empty($attendance_records)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields: faculty_id, course_id, or attendance_records']);
    exit;
}

try {
    // Verify faculty is the instructor of this course
    $verify_stmt = $pdo->prepare('SELECT id FROM courses WHERE id = ? AND instructor_id = ?');
    $verify_stmt->execute([$course_id, $faculty_id]);
    $course = $verify_stmt->fetch();
    
    if (!$course) {
        http_response_code(403);
        echo json_encode(['error' => 'Unauthorized: You are not the instructor for this course']);
        exit;
    }

    $successful = 0;
    $failed = 0;
    $errors = [];

    foreach ($attendance_records as $record) {
        $enrollment_id = $record['enrollment_id'] ?? null;
        $date = $record['date'] ?? null;
        $status = $record['status'] ?? 'present';
        $attendance_marks = $record['attendance_marks'] ?? 0;

        // Validate status
        if (!in_array($status, ['present', 'absent', 'late'])) {
            $failed++;
            $errors[] = "Invalid status for enrollment $enrollment_id: $status";
            continue;
        }

        if (!$enrollment_id || !$date) {
            $failed++;
            $errors[] = "Missing enrollment_id or date in record";
            continue;
        }

        // Verify enrollment exists and belongs to this course
        $verify_enrollment = $pdo->prepare('SELECT id, student_id FROM enrollments WHERE id = ? AND course_id = ?');
        $verify_enrollment->execute([$enrollment_id, $course_id]);
        $enrollment = $verify_enrollment->fetch(PDO::FETCH_ASSOC);
        if (!$enrollment) {
            $failed++;
            $errors[] = "Enrollment $enrollment_id not found in this course";
            continue;
        }

        $studentId = (int)$enrollment['student_id'];

        try {
            // Try to insert new attendance record
            $insert_stmt = $pdo->prepare('
                INSERT INTO attendance (enrollment_id, date, status) 
                VALUES (?, CAST(? AS DATE), ?)
            ');
            $insert_stmt->execute([$enrollment_id, $date, $status]);
            
            // Also update or insert the attendance marks in course_marks table
            updateAttendanceMarks($pdo, $enrollment_id, $course_id, $attendance_marks);

            $notificationStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status) VALUES (?, NULL, 0.00, ?, ?, ?)');
            $notificationStmt->execute([
                $studentId,
                'attendance',
                "Your attendance status for course #{$course_id} on {$date} was marked as {$status}.",
                'unread'
            ]);
            
            $successful++;
        } catch (Exception $e) {
            // If duplicate (record already exists), update it
            $error_msg = strtoupper($e->getMessage());
            if (strpos($error_msg, 'UNIQUE') !== false || strpos($error_msg, 'DUPLICATE') !== false) {
                try {
                    $update_stmt = $pdo->prepare('
                        UPDATE attendance 
                        SET status = ? 
                        WHERE enrollment_id = ? AND CAST(date AS DATE) = CAST(? AS DATE)
                    ');
                    $update_stmt->execute([$status, $enrollment_id, $date]);
                    
                    // Update the attendance marks in course_marks table
                    updateAttendanceMarks($pdo, $enrollment_id, $course_id, $attendance_marks);

                    $notificationStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status) VALUES (?, NULL, 0.00, ?, ?, ?)');
                    $notificationStmt->execute([
                        $studentId,
                        'attendance',
                        "Your attendance status for course #{$course_id} on {$date} was updated to {$status}.",
                        'unread'
                    ]);
                    
                    $successful++;
                } catch (Exception $update_error) {
                    $failed++;
                    $errors[] = "Failed to update attendance for enrollment $enrollment_id: " . $update_error->getMessage();
                }
            } else {
                $failed++;
                $errors[] = "Failed to insert attendance for enrollment $enrollment_id: " . $e->getMessage();
            }
        }
    }

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => "Attendance records processed: $successful successful, $failed failed",
        'successful' => $successful,
        'failed' => $failed,
        'errors' => $errors
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error', 'details' => $e->getMessage()]);
}

/**
 * Update or insert attendance marks in course_marks table
 */
function updateAttendanceMarks($pdo, $enrollment_id, $course_id, $attendance_marks) {
    try {
        // Check if course_marks record exists for this enrollment
        $check_stmt = $pdo->prepare('SELECT id FROM course_marks WHERE enrollment_id = ? AND course_id = ?');
        $check_stmt->execute([$enrollment_id, $course_id]);
        $exists = $check_stmt->fetch();
        
        if ($exists) {
            // Update existing record
            $update_stmt = $pdo->prepare('
                UPDATE course_marks 
                SET attendance_marks = attendance_marks + ?, 
                    last_updated = NOW() 
                WHERE enrollment_id = ? AND course_id = ?
            ');
            $update_stmt->execute([$attendance_marks, $enrollment_id, $course_id]);
        } else {
            // Insert new record
            $insert_stmt = $pdo->prepare('
                INSERT INTO course_marks (enrollment_id, course_id, attendance_marks, last_updated) 
                VALUES (?, ?, ?, NOW())
            ');
            $insert_stmt->execute([$enrollment_id, $course_id, $attendance_marks]);
        }
    } catch (Exception $e) {
        // Log error but don't fail the attendance marking
        error_log("Error updating course_marks: " . $e->getMessage());
    }
}
?>
