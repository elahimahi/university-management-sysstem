<?php
header('Content-Type: application/json');
require_once '../core/db_connect.php';

try {
    // Get faculty ID from auth
    $faculty_id = $_REQUEST['faculty_id'] ?? null;
    if (!$faculty_id) {
        throw new Exception('Faculty ID is required');
    }

    // Get all students taught by this faculty (through enrollments)
    $query = "
        SELECT DISTINCT
            s.id,
            s.first_name,
            s.last_name,
            s.email,
            COUNT(f.id) as pending_count,
            SUM(CASE WHEN f.status = 'pending' THEN f.amount ELSE 0 END) as total_pending
        FROM users s
        INNER JOIN enrollments e ON s.id = e.student_id
        INNER JOIN courses c ON e.course_id = c.id
        INNER JOIN users f_user ON c.faculty_id = f_user.id
        LEFT JOIN fees f ON s.id = f.student_id AND f.status = 'pending'
        WHERE f_user.id = ?
        GROUP BY s.id, s.first_name, s.last_name, s.email
        HAVING COUNT(f.id) > 0
        ORDER BY total_pending DESC
    ";

    $stmt = $pdo->prepare($query);
    $stmt->execute([$faculty_id]);
    $pending_fees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate total summary
    $summary_query = "
        SELECT
            COUNT(DISTINCT f.id) as total_pending_fees,
            COALESCE(SUM(f.amount), 0) as total_pending_amount,
            COUNT(DISTINCT CASE WHEN f.due_date < CAST(GETDATE() AS DATE) THEN f.id END) as overdue_count,
            COALESCE(SUM(CASE WHEN f.due_date < CAST(GETDATE() AS DATE) THEN f.amount ELSE 0 END), 0) as overdue_amount
        FROM fees f
        INNER JOIN users s ON f.student_id = s.id
        INNER JOIN enrollments e ON s.id = e.student_id
        INNER JOIN courses c ON e.course_id = c.id
        WHERE c.faculty_id = ? AND f.status = 'pending'
    ";

    $stmt = $pdo->prepare($summary_query);
    $stmt->execute([$faculty_id]);
    $summary = $stmt->fetch(PDO::FETCH_ASSOC);

    http_response_code(200);
    echo json_encode([
        'success' => true,
        'summary' => $summary,
        'pending_fees' => $pending_fees
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
