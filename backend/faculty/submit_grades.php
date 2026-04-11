<?php
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

// Check if user is authenticated and is faculty
$user = requireFacultyAuth();

if (!$user) {
    http_response_code(401);
    echo json_encode(['status' => 'error', 'message' => 'Unauthorized']);
    exit();
}

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

try {
    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data['course_id'] || !$data['grades']) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields: course_id, grades']);
        exit;
    }

    $course_id = $data['course_id'];
    $grades = $data['grades'];

    $pdo->beginTransaction();

    $updateQuery = "
        UPDATE enrollments
        SET grade = :grade, grade_submitted_at = GETDATE()
        WHERE id = :enrollment_id AND course_id = :course_id
    ";

    $stmt = $pdo->prepare($updateQuery);

    // Query to insert/update grade in grades table (for grade tracking)
    $gradesInsertQuery = "
        INSERT INTO grades (student_id, course_id, grade, points, semester, assigned_at)
        VALUES (:student_id, :course_id, :grade, :points, :semester, GETDATE())
    ";

    $gradesStmt = $pdo->prepare($gradesInsertQuery);
    
    // Get student_id from enrollment
    $studentQuery = "SELECT student_id FROM enrollments WHERE id = ?";
    $studentQueryStmt = $pdo->prepare($studentQuery);

    $updated = 0;
    $semester = date('Y') . '-' . (date('n') > 6 ? 'Fall' : 'Spring');
    
    // Collect student IDs and grades for notifications
    $studentNotifications = [];
    
    foreach ($grades as $grade) {
        if (isset($grade['enrollment_id']) && isset($grade['new_grade'])) {
            // Update enrollment
            $result = $stmt->execute([
                'enrollment_id' => $grade['enrollment_id'],
                'grade' => $grade['new_grade'],
                'course_id' => $course_id
            ]);
            
            if ($result && $stmt->rowCount() > 0) {
                // Get student_id from enrollment
                $studentQueryStmt->execute([$grade['enrollment_id']]);
                $studentRow = $studentQueryStmt->fetch(PDO::FETCH_ASSOC);
                
                if ($studentRow) {
                    $gradePoints = getGradePoints($grade['new_grade']);
                    
                    if ($gradePoints !== null) {
                        // Try to insert grade record, if duplicate exists update instead
                        try {
                            $gradesStmt->execute([
                                'student_id' => $studentRow['student_id'],
                                'course_id' => $course_id,
                                'grade' => $grade['new_grade'],
                                'points' => $gradePoints,
                                'semester' => $semester
                            ]);
                        } catch (PDOException $e) {
                            // If duplicate key violation, update instead
                            $error_msg = strtoupper($e->getMessage());
                            if (strpos($error_msg, 'UNIQUE') !== false || strpos($error_msg, 'UQ_GRADE') !== false) {
                                $updateGradesQuery = "
                                    UPDATE grades 
                                    SET grade = :grade, points = :points, assigned_at = GETDATE()
                                    WHERE student_id = :student_id AND course_id = :course_id AND semester = :semester
                                ";
                                $updateGradesStmt = $pdo->prepare($updateGradesQuery);
                                $updateGradesStmt->execute([
                                    'grade' => $grade['new_grade'],
                                    'points' => $gradePoints,
                                    'student_id' => $studentRow['student_id'],
                                    'course_id' => $course_id,
                                    'semester' => $semester
                                ]);
                            } else {
                                throw $e;
                            }
                        }
                    }
                    
                    // Store student ID and grade for notification after transaction
                    $studentNotifications[] = [
                        'student_id' => $studentRow['student_id'],
                        'grade' => $grade['new_grade']
                    ];
                }
                $updated++;
            }
        }
    }

    $pdo->commit();

    // Get faculty name
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

    // Create notifications for students
    try {
        if (!empty($studentNotifications)) {
            $studentNotifStmt = $pdo->prepare('INSERT INTO admin_notifications (student_id, fee_id, amount, payment_method, fee_description, status) VALUES (?, NULL, 0.00, ?, ?, ?)');
            
            foreach ($studentNotifications as $notif) {
                $studentNotifStmt->execute([
                    $notif['student_id'],
                    'grade',
                    "Grade published for {$courseName}: {$notif['grade']} by {$facultyName}",
                    'unread'
                ]);
            }
        }
    } catch (PDOException $e) {
        error_log('Student notification error: ' . $e->getMessage());
    }

    // Create notification for faculty
    try {
        $notificationStmt = $pdo->prepare('INSERT INTO notifications (recipient_id, recipient_role, actor_id, message, notification_type, status) VALUES (?, ?, ?, ?, ?, ?)');
        $result = $notificationStmt->execute([
            $user['id'],
            'faculty',
            $user['id'],
            "You have submitted grades for {$updated} students in {$courseName}.",
            'grade_submission',
            'unread'
        ]);
        
        if (!$result) {
            error_log('Faculty notification insert failed. Error info: ' . json_encode($notificationStmt->errorInfo()));
        }
    } catch (PDOException $e) {
        error_log('Faculty notification error: ' . $e->getMessage());
    }

    echo json_encode([
        'success' => true,
        'message' => "Grades submitted for $updated students",
        'updated' => $updated,
        'faculty_name' => $facultyName
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
