<?php
/**
 * Add missing columns to users table for approval workflow
 */

require_once __DIR__ . '/db_connect.php';

header('Content-Type: application/json');

try {
    // Check which columns are missing
    $columns = [];
    $stmt = $pdo->query("
        SELECT COLUMN_NAME 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users'
    ");
    foreach ($stmt->fetchAll() as $row) {
        $columns[] = $row['COLUMN_NAME'];
    }

    $addColumns = [];
    
    if (!in_array('approval_status', $columns)) {
        $addColumns[] = "ALTER TABLE users ADD approval_status VARCHAR(20) DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'))";
    }
    
    if (!in_array('approved_by', $columns)) {
        $addColumns[] = "ALTER TABLE users ADD approved_by INT DEFAULT NULL";
    }
    
    if (!in_array('rejection_reason', $columns)) {
        $addColumns[] = "ALTER TABLE users ADD rejection_reason VARCHAR(255) DEFAULT NULL";
    }

    if (empty($addColumns)) {
        http_response_code(200);
        echo json_encode([
            'status' => 'info',
            'message' => 'All required columns already exist!',
            'existing_columns' => $columns
        ]);
        exit;
    }

    // Execute all ALTER statements
    foreach ($addColumns as $sql) {
        $pdo->exec($sql);
    }

    // Add foreign key constraint if columns were added
    try {
        $pdo->exec("ALTER TABLE users ADD CONSTRAINT FK_Users_ApprovedBy FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL");
    } catch (Exception $e) {
        // FK might already exist, continue
    }

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Successfully added missing columns to users table!',
        'columns_added' => count($addColumns),
        'columns' => $addColumns
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database error: ' . $e->getMessage()
    ]);
}
?>
