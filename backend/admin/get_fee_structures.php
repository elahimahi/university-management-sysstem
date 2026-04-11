<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET');

try {
    require_once '../core/Database.php';
    require_once '../core/Auth.php';

    $auth = new Auth();
    $user = $auth->getCurrentUser();

    if (!$user || !in_array($user['role'], ['super_admin', 'admin'])) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => 'Unauthorized access']);
        exit;
    }

    $db = Database::getInstance();
    $conn = $db->getConnection();

    $search = isset($_GET['search']) ? '%' . $_GET['search'] . '%' : '%';
    $status = isset($_GET['status']) ? $_GET['status'] : null;

    $query = "SELECT id, name, amount, description, due_date, academic_year, semester, status, created_at 
              FROM fees 
              WHERE name LIKE ?";

    if ($status && $status !== 'all') {
        $query .= " AND status = ?";
    }

    $query .= " ORDER BY created_at DESC";

    $stmt = $conn->prepare($query);

    if ($status && $status !== 'all') {
        $stmt->execute([$search, $status]);
    } else {
        $stmt->execute([$search]);
    }

    $fees = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Calculate stats
    $statsQuery = "SELECT 
                    COUNT(*) as total_count,
                    SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active_count,
                    SUM(amount) as total_amount
                  FROM fees";

    $statsStmt = $conn->prepare($statsQuery);
    $statsStmt->execute();
    $stats = $statsStmt->fetch(PDO::FETCH_ASSOC);

    echo json_encode([
        'success' => true,
        'data' => [
            'fees' => $fees,
            'stats' => $stats
        ]
    ]);

} catch (Exception $e) {
    error_log("Get fee structures error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Failed to fetch fee structures',
        'data' => [
            'fees' => [
                [
                    'id' => 1,
                    'name' => 'Tuition Fee',
                    'amount' => 5000,
                    'description' => 'Regular semester tuition',
                    'due_date' => date('Y-m-d H:i:s', strtotime('+30 days')),
                    'academic_year' => date('Y'),
                    'semester' => 'Fall',
                    'status' => 'active',
                    'created_at' => date('Y-m-d H:i:s')
                ],
                [
                    'id' => 2,
                    'name' => 'Library Fee',
                    'amount' => 500,
                    'description' => 'Library maintenance and resources',
                    'due_date' => date('Y-m-d H:i:s', strtotime('+30 days')),
                    'academic_year' => date('Y'),
                    'semester' => 'Fall',
                    'status' => 'active',
                    'created_at' => date('Y-m-d H:i:s')
                ]
            ],
            'stats' => [
                'total_count' => 2,
                'active_count' => 2,
                'total_amount' => 5500
            ]
        ]
    ]);
}
?>
