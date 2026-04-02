<?php
/**
 * University Database Management System - API Router
 * 
 * This is the main entry point for the backend API.
 * It routes incoming requests to the appropriate handler based on the URL path.
 * 
 * Base URL: http://localhost/Database_Project/Database-main/Database-main/backend
 * All endpoints return JSON responses.
 */

// Enable CORS for all requests
header("Access-Control-Allow-Origin: *"); // Allow all origins for testing purposes
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json; charset=UTF-8");

// Handle preflight requests immediately
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Get the request URI and method
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$requestMethod = $_SERVER['REQUEST_METHOD'];

// Strip the base path for Apache
$basePath = '/Database_Project/Database-main/Database-main/backend';
if (strpos($requestUri, $basePath) === 0) {
    $requestUri = substr($requestUri, strlen($basePath));
}

// Remove leading/trailing slashes and get the route
$route = strtolower(trim($requestUri, '/'));

// If route is empty (root request), handle separately
if (empty($route)) {
    $controller = '';
} else {
    // Split the route into segments
    $segments = explode('/', $route);
    $controller = $segments[0] ?? '';
    $action = $segments[1] ?? '';
    $id = $segments[2] ?? '';
}

// Route the request accordingly
try {
    // Authentication Routes
    if ($controller === 'auth') {
        if ($action === 'login' && $requestMethod === 'POST') {
            require_once 'auth/login.php';
        } elseif ($controller === 'auth' && $action === 'register' && $requestMethod === 'POST') {
            require_once __DIR__ . '/auth/register.php';
        }
    }
    // User Routes
    elseif ($controller === 'users') {
        if ($action === 'me' && in_array($requestMethod, ['GET', 'PUT'])) {
            require_once 'users/me.php';
        } elseif ($action === 'all' && $requestMethod === 'GET') {
            require_once 'users/get_all_users.php';
        } elseif ($action === 'list' && $requestMethod === 'GET') {
            require_once 'users/list_users.php';
        } elseif ($action === 'get' && $requestMethod === 'GET') {
            require_once 'users/get_users.php';
        } elseif ($action === 'add-demo-faculty' && $requestMethod === 'POST') {
            require_once 'users/add_demo_faculty.php';
        }
    }
    // Student Routes
    elseif ($controller === 'student') {
        if ($action === 'courses' && $requestMethod === 'GET') {
            require_once 'student/get_student_courses.php';
        } elseif ($action === 'enroll' && $requestMethod === 'POST') {
            require_once 'student/enroll_course.php';
        } elseif ($action === 'update-status' && $requestMethod === 'POST') {
            require_once 'student/update_course_status.php';
        } elseif ($action === 'grades' && $requestMethod === 'GET') {
            require_once 'student/get_student_grades.php';
        } elseif ($action === 'attendance' && $requestMethod === 'GET') {
            require_once 'student/get_student_attendance.php';
        } elseif ($action === 'attendance-stats' && $requestMethod === 'POST') {
            require_once 'student/get_attendance_stats.php';
        } elseif ($action === 'fees' && $requestMethod === 'GET') {
            require_once 'student/get_student_fees.php';
        } elseif ($action === 'fees' && $requestMethod === 'POST') {
            require_once 'student/get_fees.php';
        } elseif ($action === 'deadlines' && $requestMethod === 'GET') {
            require_once 'student/get_student_deadlines.php';
        } elseif ($action === 'progress' && in_array($requestMethod, ['GET', 'POST'])) {
            require_once 'student/student_progress.php';
        } elseif ($action === 'overview' && $requestMethod === 'GET') {
            require_once 'student/get_student_overview.php';
        } elseif ($action === 'stats' && $requestMethod === 'GET') {
            require_once 'student/student_stats.php';
        } elseif ($action === 'assignments' && $requestMethod === 'GET') {
            require_once 'student/get_course_assignments.php';
        } elseif ($action === 'submit-assignment' && $requestMethod === 'POST') {
            require_once 'student/submit_assignment.php';
        } elseif ($action === 'get-fees-with-deadline' && $requestMethod === 'POST') {
            require_once 'student/get_fees_with_deadline.php';
        }
    }
    // Courses Routes
    elseif ($controller === 'courses') {
        if ($action === 'available' && $requestMethod === 'GET') {
            require_once 'courses/available_courses.php';
        }
    }
    // Faculty Routes
    elseif ($controller === 'faculty') {
        if ($action === 'students' && in_array($requestMethod, ['GET', 'POST'])) {
            require_once 'faculty/faculty_students.php';
        } elseif ($action === 'stats' && $requestMethod === 'GET') {
            require_once 'faculty/faculty_stats.php';
        } elseif ($action === 'login-activity' && $requestMethod === 'GET') {
            require_once 'faculty/faculty_login_activity.php';
        } elseif ($action === 'courses-students' && $requestMethod === 'GET') {
            require_once 'faculty/students_by_faculty.php';
        } elseif ($action === 'grading-students' && $requestMethod === 'GET') {
            require_once 'faculty/get_grading_students.php';
        } elseif ($action === 'courses' && $requestMethod === 'GET') {
            require_once 'faculty/get_faculty_courses.php';
        } elseif ($action === 'courses' && $requestMethod === 'POST') {
            require_once 'faculty/add_course.php';
        } elseif ($action === 'mark-attendance' && $requestMethod === 'POST') {
            require_once 'faculty/mark_attendance.php';
        } elseif ($action === 'course-students' && $requestMethod === 'GET') {
            require_once 'faculty/get_course_students.php';
        } elseif ($action === 'attendance-history' && $requestMethod === 'GET') {
            require_once 'faculty/get_attendance_history.php';
        } elseif ($action === 'pending-fees' && $requestMethod === 'GET') {
            require_once 'faculty/get_pending_fees.php';
        } elseif ($action === 'assignments' && $requestMethod === 'POST') {
            require_once 'faculty/create_assignment.php';
        } elseif ($action === 'assignment-submissions' && $requestMethod === 'GET') {
            require_once 'faculty/get_assignment_submissions.php';
        } elseif ($action === 'grade-submission' && $requestMethod === 'POST') {
            require_once 'faculty/grade_submission.php';
        } elseif ($action === 'assignments' && $requestMethod === 'GET') {
            require_once 'faculty/get_faculty_assignments.php';
        }
    }
    // Grades Routes
    elseif ($controller === 'grades') {
        if ($action === 'add' && $requestMethod === 'POST') {
            require_once 'grades/add_grade.php';
        } elseif ($action === 'login-record' && $requestMethod === 'POST') {
            require_once 'grades/record_login.php';
        }
    }
    // Records Routes
    elseif ($controller === 'records') {
        if ($action === 'all' && $requestMethod === 'GET') {
            require_once 'records/records.php';
        }
    }
    // Admin Routes
    elseif ($controller === 'admin') {
        if ($action === 'init-demo' && $requestMethod === 'POST') {
            require_once 'admin/init_demo.php';
        } elseif ($action === 'fees' && $requestMethod === 'GET') {
            require_once 'admin/get_fees.php';
        } elseif ($action === 'create-fee' && $requestMethod === 'POST') {
            require_once 'admin/create_fee.php';
        } elseif ($action === 'update-fee' && $requestMethod === 'PUT') {
            require_once 'admin/update_fee.php';
        } elseif ($action === 'sms-logs' && $requestMethod === 'GET') {
            require_once 'admin/get_sms_logs.php';
        } elseif ($action === 'payments' && $requestMethod === 'GET') {
            require_once 'admin/get_payments.php';
        } elseif ($action === 'set-payment-deadline' && $requestMethod === 'POST') {
            require_once 'admin/set_payment_deadline.php';
        } elseif ($action === 'apply-penalties' && $requestMethod === 'POST') {
            require_once 'admin/apply_penalties.php';
        } elseif ($action === 'send-deadline-reminders' && $requestMethod === 'POST') {
            require_once 'admin/send_deadline_reminders.php';
        } elseif ($action === 'run-fee-batch-job' && $requestMethod === 'POST') {
            require_once 'admin/run_fee_batch_job.php';
        }
    }
    // Payment Routes
    elseif ($controller === 'payment') {
        if ($action === 'process' && $requestMethod === 'POST') {
            require_once 'payment/process.php';
        } elseif ($action === 'history' && $requestMethod === 'GET') {
            require_once 'payment/history.php';
        } elseif ($action === 'send-reminder' && in_array($requestMethod, ['GET', 'POST'])) {
            require_once 'payment/send_reminder.php';
        }
    }
    // Debug Routes
    elseif ($controller === 'debug') {
        if ($action === 'full-check' && $requestMethod === 'GET') {
            require_once 'debug/full_check.php';
        } elseif ($action === 'check-user' && $requestMethod === 'GET') {
            require_once 'debug/check_user.php';
        } elseif ($action === 'test-auth' && $requestMethod === 'GET') {
            require_once 'debug/test_auth.php';
        } elseif ($action === 'headers' && $requestMethod === 'GET') {
            require_once 'debug/headers.php';
        } elseif ($action === 'test-assignments' && $requestMethod === 'GET') {
            require_once 'debug/test_assignments.php';
        } elseif ($action === 'init-assignments' && $requestMethod === 'POST') {
            require_once 'debug/init_assignments.php';
        } elseif ($action === 'diagnose' && $requestMethod === 'GET') {
            require_once 'debug/diagnose.php';
        } elseif ($action === 'setup' && $requestMethod === 'GET') {
            require_once 'debug/setup.php';
        } elseif ($action === 'check-structure' && $requestMethod === 'GET') {
            require_once 'debug/check-structure.php';
        } elseif ($action === 'test-student-assignments' && $requestMethod === 'GET') {
            require_once 'debug/test-student-assignments.php';
        } elseif ($action === 'sql-server-data' && $requestMethod === 'GET') {
            require_once 'debug/sql-server-data.php';
        } elseif ($action === 'all-tables' && $requestMethod === 'GET') {
            require_once 'debug/all-tables.php';
        } elseif ($action === 'table-structures' && $requestMethod === 'GET') {
            require_once 'debug/table-structures.php';
        }
    }
    // Health Check Route
    elseif ($controller === 'health' && $requestMethod === 'GET') {
        http_response_code(200);
        echo json_encode([
            'status' => 'ok',
            'message' => 'API is running',
            'timestamp' => date('c'),
            'version' => '1.0.0'
        ]);
    }
    // Root Route
    elseif (empty($controller)) {
        http_response_code(200);
        echo json_encode([
            'status' => 'success',
            'message' => 'University Database Management System API',
            'version' => '1.0.0',
            'docs' => 'See BACKEND_API.md for documentation',
            'baseUrl' => 'http://localhost/Database_Project/Database-main/Database-main/backend',
            'endpoints' => [
                'Auth' => [
                    'POST /auth/login',
                    'POST /auth/register'
                ],
                'Users' => [
                    'GET /users/me',
                    'GET /users/all',
                    'GET /users/list',
                    'GET /users/get',
                    'POST /users/add-demo',
                    'POST /users/add-demo-faculty'
                ],
                'Student' => [
                    'GET /student/courses',
                    'POST /student/enroll',
                    'GET /student/grades',
                    'GET /student/attendance',
                    'GET /student/fees',
                    'GET /student/deadlines',
                    'GET /student/progress',
                    'POST /student/progress',
                    'GET /student/overview'
                ],
                'Courses' => [
                    'GET /courses/available'
                ],
                'Faculty' => [
                    'GET /faculty/students',
                    'POST /faculty/students',
                    'GET /faculty/stats',
                    'GET /faculty/login-activity',
                    'GET /faculty/courses',
                    'POST /faculty/courses'
                ],
                'Grades' => [
                    'POST /grades/add',
                    'POST /grades/login-record'
                ],
                'Records' => [
                    'GET /records/all'
                ]
            ]
        ]);
    } else {
        // Route not found
        http_response_code(404);
        echo json_encode([
            'status' => 'error',
            'message' => 'Route not found',
            'path' => $route,
            'method' => $requestMethod
        ]);
    }
} catch (Exception $e) {
    // Handle any unexpected errors
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Internal server error: ' . $e->getMessage()
    ]);
}
?>
