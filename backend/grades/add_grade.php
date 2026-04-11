<?php
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

// Only faculty can submit grades
$user = requireFacultyAuth();

$data = json_decode(file_get_contents("php://input"), true);

// Grade point mapping based on letter grades
function getGradePoints($letterGrade) {
    $gradeMap = [
        'A+' => 4.0,
        'A' => 3.75,
        'A-' => 3.5,
        'B+' => 3.25,
        'B' => 3.0,
        'B-' => 2.75,
        'C+' => 2.5,
        'C' => 2.25,
        'D' => 2.0,
        'F' => 0.0,
    ];
    
    return isset($gradeMap[$letterGrade]) ? $gradeMap[$letterGrade] : null;
}

// Support both old enrollment_id and new student_id + course_id format
$student_id = null;
$course_id = null;
$enrollment_id = null;

if (isset($data['enrollment_id'])) {
    // Old format: get student_id and course_id from enrollment
    $stmt = $pdo->prepare("SELECT student_id, course_id FROM enrollments WHERE id = ?");
    $stmt->execute([$data['enrollment_id']]);
    $enrollment = $stmt->fetch(PDO::FETCH_ASSOC);
    if ($enrollment) {
        $student_id = $enrollment['student_id'];
        $course_id = $enrollment['course_id'];
        $enrollment_id = $data['enrollment_id'];
    }
} elseif (isset($data['student_id']) && isset($data['course_id'])) {
    // New format: directly provided
    $student_id = $data['student_id'];
    $course_id = $data['course_id'];
}

if (!$student_id || !$course_id) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing: enrollment_id OR (student_id + course_id)']);
    exit();
}

if (!isset($data['grade'])) {
    http_response_code(400);
    echo json_encode(['status' => 'error', 'message' => 'Missing: grade']);
    exit();
}

// Validate grade point if provided
if (isset($data['grade_point'])) {
    $receivedPoint = (float)$data['grade_point'];
    $expectedPoint = getGradePoints($data['grade']);
    
    // Check if provided grade_point matches expected
    if ($expectedPoint === null) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid letter grade: ' . $data['grade']]);
        exit();
    }
    
    // Allow small floating point differences
    if (abs($receivedPoint - $expectedPoint) > 0.01) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error', 
            'message' => 'Grade Points MISMATCH! Grade "' . $data['grade'] . '" requires ' . $expectedPoint . ' points, but you provided ' . $receivedPoint . '. Please correct this.',
            'expected' => $expectedPoint,
            'received' => $receivedPoint,
            'grade' => $data['grade']
        ]);
        exit();
    }
}

try {
    // Verify this instructor teaches this course
    $stmt = $pdo->prepare("SELECT id FROM courses WHERE id = ? AND instructor_id = ?");
    $stmt->execute([$course_id, $user['id']]);
    
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['status' => 'error', 'message' => 'You do not have permission to grade this course']);
        exit();
    }

    $semester = $data['semester'] ?? null;
    $grade = $data['grade'] ?? '?';
    
    // Auto-calculate grade points from letter grade
    $points = isset($data['grade_point']) ? $data['grade_point'] : getGradePoints($grade);
    
    // If grade_point was not provided and auto-calculation failed, validation error
    if ($points === null) {
        http_response_code(400);
        echo json_encode(['status' => 'error', 'message' => 'Invalid letter grade: ' . $grade . '. Must be one of: A+, A, A-, B+, B, B-, C+, C, D, F']);
        exit();
    }

    // Try to insert or update the grade record in the actual grades table schema
    $inserted = false;
    try {
        if ($enrollment_id) {
            $enrollStmt = $pdo->prepare("SELECT student_id, course_id, semester FROM enrollments WHERE id = ?");
            $enrollStmt->execute([$enrollment_id]);
            $enrollmentRow = $enrollStmt->fetch(PDO::FETCH_ASSOC);
            if (!$enrollmentRow) {
                http_response_code(400);
                echo json_encode(['status' => 'error', 'message' => 'Invalid enrollment_id provided']);
                exit();
            }
            $student_id = $enrollmentRow['student_id'];
            $course_id = $enrollmentRow['course_id'];
            $semester = $semester ?? $enrollmentRow['semester'];
        }

        if (!$semester) {
            $semesterStmt = $pdo->prepare("SELECT TOP 1 semester FROM enrollments WHERE student_id = ? AND course_id = ? ORDER BY id DESC");
            $semesterStmt->execute([$student_id, $course_id]);
            $semesterRow = $semesterStmt->fetch(PDO::FETCH_ASSOC);
            $semester = $semesterRow['semester'] ?? date('Y') . '-' . (date('n') > 6 ? 'Fall' : 'Spring');
        }

        $existingGradeStmt = $pdo->prepare("SELECT id FROM grades WHERE student_id = ? AND course_id = ? AND semester = ?");
        $existingGradeStmt->execute([$student_id, $course_id, $semester]);
        $existingGrade = $existingGradeStmt->fetch(PDO::FETCH_ASSOC);

        if ($existingGrade) {
            $update_stmt = $pdo->prepare(
                "UPDATE grades SET grade = ?, points = ?, assigned_at = GETDATE() WHERE id = ?"
            );
            $update_stmt->execute([$grade, $points, $existingGrade['id']]);
            $inserted = true;
        } else {
            $insertStmt = $pdo->prepare(
                "INSERT INTO grades (student_id, course_id, grade, points, semester, assigned_at) VALUES (?, ?, ?, ?, ?, GETDATE())"
            );
            $insertStmt->execute([$student_id, $course_id, $grade, $points, $semester]);
            $inserted = true;
        }
    } catch (PDOException $e) {
        throw $e;
    }

    if ($inserted) {
        // Get faculty name for notification
        $facultyStmt = $pdo->prepare("SELECT first_name, last_name FROM users WHERE id = ?");
        $facultyStmt->execute([$user['id']]);
        $facultyData = $facultyStmt->fetch(PDO::FETCH_ASSOC);
        $facultyFirstName = $facultyData['first_name'] ?? '';
        $facultyLastName = $facultyData['last_name'] ?? '';
        $facultyName = trim("$facultyFirstName $facultyLastName");

        // Get course name for notification
        $courseStmt = $pdo->prepare("SELECT name FROM courses WHERE id = ?");
        $courseStmt->execute([$course_id]);
        $courseData = $courseStmt->fetch(PDO::FETCH_ASSOC);
        $courseName = $courseData['name'] ?? 'Unknown Course';

        // Create student notification
        try {
            $studentNotifStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status) VALUES (?, NULL, 0.00, ?, ?, ?)');
            $studentNotifStmt->execute([
                $student_id,
                'grade',
                "Grade published for {$courseName}: {$grade} by {$facultyName}",
                'unread'
            ]);
        } catch (PDOException $notifError) {
            error_log('Student grade notification error: ' . $notifError->getMessage());
        }

        // Create faculty notification
        try {
            $facultyNotifStmt = $pdo->prepare('INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, ?, ?, ?, ?, ?)');
            $facultyNotifStmt->execute([
                $user['id'],
                'faculty',
                $user['id'],
                "Grade submitted: {$grade} for student ID {$student_id} in {$courseName}",
                'grade_submission',
                'unread'
            ]);
        } catch (PDOException $notifError) {
            error_log('Faculty grade notification error: ' . $notifError->getMessage());
        }

        http_response_code(201);
        echo json_encode([
            'status' => 'success',
            'message' => 'Grade recorded successfully',
            'student_id' => $student_id,
            'course_id' => $course_id,
            'grade' => $grade,
            'points' => $points,
            'faculty_name' => $facultyName
        ]);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['status' => 'error', 'message' => 'Failed to record grade: ' . $e->getMessage()]);
}
?>
