<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Insert sample enrollment periods
    $periods = [
        ['Fall 2024', 1, '2024-08-01', '2024-08-15'],
        ['Fall 2024', 2, '2024-08-01', '2024-08-15'],
        ['Fall 2024', 3, '2024-08-01', '2024-08-15'],
        ['Fall 2024', 4, '2024-08-01', '2024-08-15'],
        ['Spring 2025', 1, '2025-01-01', '2025-01-15'],
        ['Spring 2025', 2, '2025-01-01', '2025-01-15'],
        ['Spring 2025', 3, '2025-01-01', '2025-01-15'],
        ['Spring 2025', 4, '2025-01-01', '2025-01-15'],
        ['Summer 2025', 1, '2025-05-01', '2025-05-15'],
        ['Summer 2025', 2, '2025-05-01', '2025-05-15'],
        ['Summer 2025', 3, '2025-05-01', '2025-05-15'],
        ['Summer 2025', 4, '2025-05-01', '2025-05-15'],
    ];

    $stmt = $pdo->prepare("INSERT INTO enrollment_periods (semester, academic_year, start_date, end_date) VALUES (?, ?, ?, ?)");
    
    foreach ($periods as $period) {
        $stmt->execute($period);
    }
    
    echo json_encode(['success' => true, 'message' => 'Sample enrollment periods inserted']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>