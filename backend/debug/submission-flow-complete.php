<?php
header('Content-Type: application/json');

try {
    require_once '../core/db_connect.php';
    
    $response = [
        'success' => true,
        'timestamp' => date('Y-m-d H:i:s'),
        'database' => 'SQL Server'
    ];
    
    // ======== PART 1: STUDENT ASSIGNMENTS AND SUBMISSION STATUS ========
    $studentId = 1; // Student 1
    
    // Get student enrollments
    $stmt = $pdo->prepare("
        SELECT e.id as enrollment_id, e.student_id, c.id as course_id, c.code, c.name
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.student_id = ?
        ORDER BY c.code
    ");
    $stmt->execute([$studentId]);
    $enrollments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['student'] = [
        'id' => $studentId,
        'total_enrollments' => count($enrollments),
        'enrolled_courses' => $enrollments
    ];
    
    // ======== PART 2: ASSIGNMENTS WITH SUBMISSION STATUS ========
    $stmt = $pdo->prepare("
        SELECT 
            ca.id,
            ca.course_id,
            ca.title,
            ca.description,
            ca.deadline,
            c.code as course_code,
            c.name as course_name,
            CASE WHEN GETDATE() > ca.deadline THEN 1 ELSE 0 END as is_past_deadline,
            DATEDIFF(HOUR, GETDATE(), ca.deadline) as hours_until_deadline,
            e.id as enrollment_id,
            CASE WHEN asub.id IS NOT NULL THEN 'Submitted' ELSE 'Not Submitted' END as submission_status,
            asub.id as submission_id,
            asub.submission_text,
            asub.submitted_at,
            asub.is_late,
            asub.feedback_status,
            asub.feedback_notes
        FROM course_assignments ca
        JOIN courses c ON ca.course_id = c.id
        JOIN enrollments e ON e.course_id = c.id
        LEFT JOIN assignment_submissions asub ON asub.assignment_id = ca.id AND asub.enrollment_id = e.id
        WHERE e.student_id = ?
        ORDER BY ca.deadline ASC
    ");
    $stmt->execute([$studentId]);
    $assignmentsWithSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['assignments_with_submissions'] = $assignmentsWithSubmissions;
    
    $submitted = array_filter($assignmentsWithSubmissions, fn($a) => $a['submission_status'] === 'Submitted');
    $notSubmitted = array_filter($assignmentsWithSubmissions, fn($a) => $a['submission_status'] === 'Not Submitted');
    $overdue = array_filter($assignmentsWithSubmissions, fn($a) => $a['is_past_deadline'] == 1 && $a['submission_status'] === 'Not Submitted');
    
    $response['assignments_summary'] = [
        'total_assignments' => count($assignmentsWithSubmissions),
        'submitted_count' => count($submitted),
        'not_submitted_count' => count($notSubmitted),
        'overdue_not_submitted' => count($overdue),
        'submission_rate' => count($assignmentsWithSubmissions) > 0 ? 
            round((count($submitted) / count($assignmentsWithSubmissions)) * 100, 2) . '%' : '0%'
    ];
    
    // ======== PART 3: DETAILED SUBMISSION DATA ========
    $stmt = $pdo->prepare("
        SELECT 
            asub.id,
            asub.assignment_id,
            asub.enrollment_id,
            ca.title as assignment_title,
            c.code as course_code,
            u.first_name + ' ' + u.last_name as student_name,
            asub.submission_text,
            asub.submission_file_path,
            asub.submitted_at,
            asub.is_late,
            asub.late_hours_deduction,
            asub.feedback_status,
            asub.feedback_notes,
            asub.feedback_at,
            DATEDIFF(HOUR, ca.deadline, asub.submitted_at) as hours_late
        FROM assignment_submissions asub
        JOIN course_assignments ca ON asub.assignment_id = ca.id
        JOIN courses c ON ca.course_id = c.id
        JOIN enrollments e ON asub.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        WHERE e.student_id = ?
        ORDER BY asub.submitted_at DESC
    ");
    $stmt->execute([$studentId]);
    $submissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['submissions_detail'] = $submissions;
    
    // ======== PART 4: FACULTY VIEW - WHAT FACULTY SEES ========
    // All submissions for all faculty to grade
    $stmt = $pdo->prepare("
        SELECT 
            asub.id as submission_id,
            ca.id as assignment_id,
            ca.title as assignment_title,
            ca.course_id,
            c.code as course_code,
            c.name as course_name,
            u.id as student_id,
            u.first_name + ' ' + u.last_name as student_name,
            u.email,
            asub.submission_text,
            asub.submitted_at,
            ca.deadline,
            CASE WHEN asub.submitted_at > ca.deadline THEN 'Late' ELSE 'On Time' END as submission_timeliness,
            asub.is_late,
            asub.late_hours_deduction,
            asub.feedback_status,
            asub.feedback_notes,
            asub.feedback_at,
            CASE 
                WHEN asub.feedback_status = 'pending' THEN 'Awaiting Grading'
                WHEN asub.feedback_status = 'completed' THEN 'Graded'
                ELSE 'Unknown'
            END as grading_status
        FROM assignment_submissions asub
        JOIN course_assignments ca ON asub.assignment_id = ca.id
        JOIN courses c ON ca.course_id = c.id
        JOIN enrollments e ON asub.enrollment_id = e.id
        JOIN users u ON e.student_id = u.id
        ORDER BY ca.course_id, ca.id, asub.submitted_at DESC
    ");
    $stmt->execute([]);
    $allSubmissions = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $response['faculty_view_all_submissions'] = $allSubmissions;
    
    $pendingGrading = array_filter($allSubmissions, fn($s) => $s['feedback_status'] === 'pending');
    $graded = array_filter($allSubmissions, fn($s) => $s['feedback_status'] === 'completed');
    
    $response['grading_summary'] = [
        'total_submissions' => count($allSubmissions),
        'pending_grading' => count($pendingGrading),
        'graded' => count($graded),
        'pending_percentage' => count($allSubmissions) > 0 ? 
            round((count($pendingGrading) / count($allSubmissions)) * 100, 2) . '%' : '0%'
    ];
    
    // ======== PART 5: SQL SERVER TABLE STRUCTURES ========
    $response['database_schema'] = [];
    
    // course_assignments
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'course_assignments'
        ORDER BY ORDINAL_POSITION
    ");
    $stmt->execute([]);
    $response['database_schema']['course_assignments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // assignment_submissions
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'assignment_submissions'
        ORDER BY ORDINAL_POSITION
    ");
    $stmt->execute([]);
    $response['database_schema']['assignment_submissions'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // enrollments
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'enrollments'
        ORDER BY ORDINAL_POSITION
    ");
    $stmt->execute([]);
    $response['database_schema']['enrollments'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // users
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'users'
        ORDER BY ORDINAL_POSITION
    ");
    $stmt->execute([]);
    $response['database_schema']['users'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // ======== PART 6: RECORD COUNTS ========
    $tables = ['users', 'courses', 'enrollments', 'course_assignments', 'assignment_submissions'];
    $response['record_counts'] = [];
    
    foreach ($tables as $table) {
        $stmt = $pdo->prepare("SELECT COUNT(*) as count FROM $table");
        $stmt->execute([]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $response['record_counts'][$table] = (int)$result['count'];
    }
    
    // ======== PART 7: COMPLETE FLOW EXPLANATION ========
    $response['flow_explanation'] = [
        'step_1_student_enrolls' => 'Student enrolls in course (Enrollment record created)',
        'step_2_faculty_creates_assignment' => 'Faculty creates assignment for course (course_assignments record)',
        'step_3_student_sees_assignment' => 'Student views assignments via GET /student/assignments - joins course_assignments with enrollments',
        'step_4_student_clicks_submit' => 'Student clicks "Submit Assignment" button (visible if not past deadline)',
        'step_5_student_submits_via_api' => 'Student submits via POST /student/submit-assignment with enrollment_id',
        'step_6_backend_saves_submission' => 'Backend INSERT into assignment_submissions with (assignment_id, enrollment_id, submission_text, is_late)',
        'step_7_faculty_sees_submission' => 'Faculty views submissions via GET /faculty/assignments/submissions',
        'step_8_faculty_grades' => 'Faculty updates feedback_status, feedback_notes via POST /faculty/grade-submission',
        'step_9_student_sees_feedback' => 'Student views feedback when refreshes assignment page'
    ];
    
    echo json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_PRETTY_PRINT);
}
?>
