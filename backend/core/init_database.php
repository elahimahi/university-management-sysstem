<?php
/**
 * Database Initialization Script
 * Run this once to create all necessary tables in MS SQL Server
 */

require_once __DIR__ . '/db_connect.php';

// Read the database schema
$schemaFile = __DIR__ . '/mssql_database.sql';

if (!file_exists($schemaFile)) {
    die("Error: Database schema file not found at $schemaFile");
}

$schema = file_get_contents($schemaFile);

// Split into individual statements (MS SQL Server uses GO to separate)
$statements = array_filter(array_map('trim', explode('GO', $schema)));

header('Content-Type: application/json');
$results = [];

try {
    foreach ($statements as $statement) {
        if (empty($statement)) continue;
        
        // Remove leading comments
        $lines = explode("\n", $statement);
        $cleanStatement = '';
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (!empty($trimmed) && strpos($trimmed, '--') !== 0) {
                $cleanStatement .= $line . "\n";
            }
        }
        
        $cleanStatement = trim($cleanStatement);
        if (empty($cleanStatement)) continue;
        
        try {
            $pdo->exec($cleanStatement);
            $results[] = [
                'status' => 'success',
                'query' => substr($cleanStatement, 0, 100) . '...'
            ];
            echo "✅ Executed: " . substr($cleanStatement, 0, 80) . "...\n";
        } catch (Exception $e) {
            // Check if table already exists
            if (strpos($e->getMessage(), 'already exists') !== false) {
                $results[] = [
                    'status' => 'skipped',
                    'query' => substr($cleanStatement, 0, 100) . '...',
                    'reason' => 'Table already exists'
                ];
                echo "⏭️  Skipped (already exists): " . substr($cleanStatement, 0, 80) . "...\n";
            } else {
                $results[] = [
                    'status' => 'error',
                    'query' => substr($cleanStatement, 0, 100) . '...',
                    'error' => $e->getMessage()
                ];
                echo "❌ Error: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n✅ Database initialization complete!\n";
    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => 'Database initialized successfully',
        'results' => $results
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Database initialization failed',
        'error' => $e->getMessage()
    ]);
}
?>
