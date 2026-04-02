<?php
/**
 * Direct Database Update Script for Assignment Deadlines
 * This script updates all assignment deadlines to 7 days in the future
 */

// Get the correct path
$dbFile = __DIR__ . '/../core/db_connect.php';

if (!file_exists($dbFile)) {
    echo "Error: Database connection file not found at: " . $dbFile . "\n";
    exit(1);
}

require_once $dbFile;

try {
    echo "=== Assignment Deadline Update Tool ===\n";
    echo "Current Time: " . date('Y-m-d H:i:s') . "\n\n";
    
    // Step 1: Show current assignments
    echo "STEP 1: Current Assignments\n";
    echo "----------------------------\n";
    $stmt = $pdo->prepare("
        SELECT id, title, deadline, 
               CASE WHEN GETDATE() > deadline THEN 'PAST' ELSE 'FUTURE' END as status
        FROM course_assignments
        ORDER BY deadline
    ");
    $stmt->execute([]);
    $before = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($before as $row) {
        echo "ID {$row['id']}: {$row['title']}\n";
        echo "  Deadline: {$row['deadline']}\n";
        echo "  Status: {$row['status']}\n";
    }
    
    // Step 2: Calculate new deadline
    $newDeadline = date('Y-m-d H:i:s', time() + (7 * 24 * 60 * 60));
    echo "\n\nSTEP 2: Updating Deadlines\n";
    echo "----------------------------\n";
    echo "New Deadline: $newDeadline\n";
    
    // Step 3: Execute update
    $stmt = $pdo->prepare("UPDATE course_assignments SET deadline = ?");
    $stmt->execute([$newDeadline]);
    $rowsAffected = $stmt->rowCount();
    
    echo "Rows Updated: $rowsAffected\n";
    
    // Step 4: Verify update
    echo "\n\nSTEP 3: Verification - Updated Assignments\n";
    echo "-------------------------------------------\n";
    $stmt = $pdo->prepare("
        SELECT id, title, deadline, 
               DATEDIFF(HOUR, GETDATE(), deadline) as hours_remaining,
               CASE WHEN GETDATE() > deadline THEN 'PAST' ELSE 'FUTURE' END as status
        FROM course_assignments
        ORDER BY deadline
    ");
    $stmt->execute([]);
    $after = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($after as $row) {
        echo "ID {$row['id']}: {$row['title']}\n";
        echo "  Deadline: {$row['deadline']}\n";
        echo "  Hours Remaining: {$row['hours_remaining']}\n";
        echo "  Status: {$row['status']}\n";
    }
    
    echo "\n✓ SUCCESS: All deadlines updated!\n";
    echo "Refresh your browser to see the Submit buttons.\n";
    
} catch (PDOException $e) {
    echo "Database Error: " . $e->getMessage() . "\n";
    exit(1);
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
?>
