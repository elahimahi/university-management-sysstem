<?php
require_once __DIR__ . '/../core/cors.php';
require_once __DIR__ . '/../core/db_connect.php';
require_once __DIR__ . '/../auth/auth_helper.php';

$user = requireAdminAuth();

// Get JSON body
$json = file_get_contents('php://input');
$data = json_decode($json, true);

try {
    $student_id = $data['student_id'] ?? null;
    $email = $data['email'] ?? null;
    $phone = $data['phone'] ?? null;
    $message = $data['message'] ?? null;
    $type = $data['type'] ?? 'email'; // 'email' or 'sms'

    if (!$student_id || !$message) {
        http_response_code(400);
        echo json_encode([
            'status' => 'error',
            'message' => 'Missing required fields: student_id, message'
        ]);
        exit;
    }

    // Log the notification attempt
    $logMsg = "Admin notification to Student ID: $student_id via $type";
    error_log($logMsg);

    if ($type === 'email' && $email) {
        // Send email notification
        $subject = "Important: Please Log In to University Portal";
        $headers = "From: noreply@university.edu\r\n";
        $headers .= "Content-Type: text/html; charset=UTF-8\r\n";

        $htmlMessage = "
            <html>
            <body style='font-family: Arial, sans-serif;'>
                <div style='max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5; border-radius: 8px;'>
                    <h2 style='color: #333;'>Important Reminder: Access Your University Portal</h2>
                    <p style='color: #666; line-height: 1.6;'>$message</p>
                    <p style='margin-top: 20px;'>
                        <a href='http://localhost:3000/login' style='background-color: #FFB347; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                            Log In Now
                        </a>
                    </p>
                    <p style='color: #999; font-size: 12px; margin-top: 20px;'>
                        If you need assistance, contact support@university.edu
                    </p>
                </div>
            </body>
            </html>
        ";

        if (mail($email, $subject, $htmlMessage, $headers)) {
            error_log("Email sent successfully to $email");
        } else {
            error_log("Failed to send email to $email");
        }
    } elseif ($type === 'sms' && $phone) {
        // Send SMS notification (using a mock implementation for now)
        // In production, integrate with Twilio, Nexmo, or your SMS provider
        
        // Example SMS log
        $smsLog = [
            'phone' => $phone,
            'message' => substr($message, 0, 160), // SMS limit
            'timestamp' => date('Y-m-d H:i:s')
        ];
        
        error_log("SMS would be sent to: " . json_encode($smsLog));
        
        // Store SMS log in database if needed
        try {
            $smsStmt = $pdo->prepare("
                INSERT INTO sms_logs (student_id, phone_number, message, sms_type, status, created_at)
                VALUES (?, ?, ?, 'admin_notification', 'sent', GETDATE())
            ");
            $smsStmt->execute([$student_id, $phone, substr($message, 0, 160)]);
        } catch (Exception $e) {
            error_log("Could not log SMS: " . $e->getMessage());
        }
    }

    // Mark notification as read (sent)
    $updateStmt = $pdo->prepare("
        UPDATE admin_notifications 
        SET status = 'read' 
        WHERE student_id = ? AND message_type = 'inactive_student'
    ");
    $updateStmt->execute([$student_id]);

    http_response_code(200);
    echo json_encode([
        'status' => 'success',
        'message' => "Notification sent via $type",
        'type' => $type
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Failed to send notification: ' . $e->getMessage()
    ]);
}
?>
