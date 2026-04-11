<?php
header('Content-Type: application/json');
require_once __DIR__ . '/core/db_connect.php';

try {
    // Create enrollment_periods table
    $pdo->exec("
        CREATE TABLE enrollment_periods (
            id INT IDENTITY(1,1) PRIMARY KEY,
            semester VARCHAR(20) NOT NULL,
            academic_year INT NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            created_at DATETIME2 DEFAULT GETDATE()
        )
    ");
    
    echo json_encode(['success' => true, 'message' => 'Enrollment periods table created']);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}
?>