@php -r "
require_once 'backend/core/db_connect.php';
try {
    \$futureDate = date('Y-m-d H:i:s', strtotime('+7 days'));
    \$stmt = \$pdo->prepare('UPDATE course_assignments SET deadline = ?');
    \$stmt->execute([\$futureDate]);
    echo 'Success! Updated ' . \$stmt->rowCount() . ' assignments' . PHP_EOL;
    echo 'New deadline: ' . \$futureDate . PHP_EOL;
    
    // Verify
    \$stmt = \$pdo->prepare('SELECT title, deadline FROM course_assignments');
    \$stmt->execute([]);
    \$assignments = \$stmt->fetchAll();
    echo PHP_EOL . 'Assignments:' . PHP_EOL;
    foreach (\$assignments as \$a) {
        echo '- ' . \$a['title'] . ': ' . \$a['deadline'] . PHP_EOL;
    }
} catch (Exception \$e) {
    echo 'Error: ' . \$e->getMessage() . PHP_EOL;
}
" %*
