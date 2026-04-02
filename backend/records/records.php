<?php
require_once __DIR__ . '/../core/db_connect.php';

// Display all records for easy verification
try {
    $stmt = $pdo->query("SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC");
    $users = $stmt->fetchAll();
    
    echo "<!DOCTYPE html>
    <html>
    <head>
        <title>Database Records - University Portal</title>
        <style>
            body { font-family: sans-serif; background: #050b18; color: white; padding: 40px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; overflow: hidden; }
            th, td { padding: 15px; text-align: left; border-bottom: 1px solid rgba(255,255,255,0.1); }
            th { background: #FFB347; color: #050b18; }
            tr:hover { background: rgba(255,255,255,0.1); }
            h1 { color: #FFB347; }
            .badge { padding: 4px 8px; rounded: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase; border-radius: 4px; }
            .badge-student { bg: #225ca0; }
            .badge-faculty { bg: #7c3aed; }
        </style>
    </head>
    <body>
        <h1>Student/Faculty Records</h1>
        <p>Total Registered: " . count($users) . "</p>
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>";
            
            foreach ($users as $user) {
                $roleClass = "badge-" . $user['role'];
                echo "<tr>
                    <td>{$user['id']}</td>
                    <td>{$user['first_name']} {$user['last_name']}</td>
                    <td>{$user['email']}</td>
                    <td><span class='badge {$roleClass}'>{$user['role']}</span></td>
                    <td>{$user['created_at']}</td>
                </tr>";
            }
            
    echo "  </tbody>
        </table>
    </body>
    </html>";
} catch (PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
