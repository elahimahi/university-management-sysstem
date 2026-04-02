<?php
/**
 * SMS Notification Service
 * Handles sending SMS notifications for payment confirmations and pending fees
 * 
 * Supports: Twilio, Nexmo, Bangladesh ESL, Test Mode
 */

require_once __DIR__ . '/sms_config.php';

class SMSService {
    private $pdo;
    private $log_file;
    private $provider;

    public function __construct($pdo) {
        $this->pdo = $pdo;
        $this->log_file = SMS_LOG_FILE;
        $this->provider = SMS_PROVIDER;
    }

    /**
     * Send payment confirmation SMS
     */
    public function sendPaymentConfirmation($phone_number, $student_name, $amount, $payment_method, $remaining_amount) {
        $this->log("[PAYMENT_CONFIRMATION] Sending SMS to: $phone_number");
        
        // Get pending fees count
        $pending_count = $this->getPendingFeesCount($phone_number);
        
        // SMS Message Format
        $message = "Encrypt University: Payment Confirmed!\n";
        $message .= "Dear $student_name,\n";
        $message .= "Payment of ৳" . number_format($amount, 2) . " via " . strtoupper($payment_method) . " success!\n";
        
        if ($remaining_amount > 0) {
            $message .= "Due: ৳" . number_format($remaining_amount, 2) . "\n";
        } else {
            $message .= "Status: FULLY PAID ✓\n";
        }
        
        if ($pending_count > 0) {
            $message .= "Pending fee(s): $pending_count\n";
        }
        
        $message .= "Contact: support@encryptuniversity.edu";

        return $this->sendSMS($phone_number, $message, 'payment_confirmation');
    }

    /**
     * Send pending fees reminder SMS
     */
    public function sendPendingFeesReminder($phone_number, $student_name, $total_pending, $pending_count, $total_amount) {
        $this->log("[PENDING_REMINDER] Sending SMS to: $phone_number");
        
        $message = "Encrypt University: Fee Reminder\n";
        $message .= "Dear $student_name,\n";
        $message .= "You have $pending_count pending fee(s) totaling ৳" . number_format($total_amount, 2) . ".\n";
        $message .= "Please pay by the due date to avoid penalties.\n";
        $message .= "Contact: support@encryptuniversity.edu";

        return $this->sendSMS($phone_number, $message, 'pending_reminder');
    }

    /**
     * Core SMS sending function with multiple provider support
     */
    private function sendSMS($phone_number, $message, $sms_type) {
        try {
            $this->log("[ATTEMPT] To: $phone_number | Provider: " . $this->provider);
            
            $result = null;
            
            switch ($this->provider) {
                case 'twilio':
                    $result = $this->sendViaTwilio($phone_number, $message);
                    break;
                    
                case 'nexmo':
                    $result = $this->sendViaNexmo($phone_number, $message);
                    break;
                    
                case 'bdesl':
                    $result = $this->sendViaBDESL($phone_number, $message);
                    break;
                    
                case 'test':
                default:
                    $result = $this->sendViaTest($phone_number, $message);
                    break;
            }
            
            // Store SMS record in database
            if ($result['success']) {
                $this->logSMSRecord([
                    'phone' => $phone_number,
                    'message' => $message,
                    'type' => $sms_type,
                    'provider' => $this->provider,
                    'timestamp' => date('Y-m-d H:i:s'),
                    'status' => 'sent'
                ]);
                $this->log("[SUCCESS] SMS sent via $this->provider to $phone_number");
            } else {
                $this->log("[ERROR] SMS send failed: " . ($result['error'] ?? 'Unknown error'));
            }
            
            return $result;
            
        } catch (Exception $e) {
            $this->log("[EXCEPTION] " . $e->getMessage());
            return [
                'success' => false,
                'message' => 'Failed to send SMS',
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via Twilio
     */
    private function sendViaTwilio($phone_number, $message) {
        try {
            // Convert BD format to international: 01712345678 -> +8801712345678
            $intl_phone = '+880' . substr($phone_number, 1);
            
            $url = 'https://api.twilio.com/2010-04-01/Accounts/' . TWILIO_ACCOUNT_SID . '/Messages.json';
            
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => $url,
                CURLOPT_POST => true,
                CURLOPT_POSTFIELDS => http_build_query([
                    'From' => TWILIO_PHONE_NUMBER,
                    'To' => $intl_phone,
                    'Body' => $message
                ]),
                CURLOPT_USERPWD => TWILIO_ACCOUNT_SID . ':' . TWILIO_AUTH_TOKEN,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            $data = json_decode($response, true);
            
            if ($http_code == 201 && isset($data['sid'])) {
                return [
                    'success' => true,
                    'message' => 'SMS sent successfully via Twilio',
                    'phone' => $phone_number,
                    'type' => 'twilio',
                    'transaction_id' => $data['sid'] ?? null
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $data['message'] ?? 'Twilio API error',
                    'response' => $response
                ];
            }
        } catch (Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Send via Nexmo
     */
    private function sendViaNexmo($phone_number, $message) {
        try {
            $intl_phone = '880' . substr($phone_number, 1);
            
            $ch = curl_init('https://rest.nexmo.com/sms/json');
            curl_setopt_array($ch, [
                CURLOPT_POSTFIELDS => http_build_query([
                    'api_key' => NEXMO_API_KEY,
                    'api_secret' => NEXMO_API_SECRET,
                    'to' => $intl_phone,
                    'from' => NEXMO_PHONE_NUMBER,
                    'text' => $message
                ]),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10
            ]);
            
            $response = curl_exec($ch);
            curl_close($ch);
            
            $data = json_decode($response, true);
            
            if (isset($data['messages'][0]['status']) && $data['messages'][0]['status'] == '0') {
                return [
                    'success' => true,
                    'message' => 'SMS sent successfully via Nexmo',
                    'phone' => $phone_number,
                    'type' => 'nexmo',
                    'message_id' => $data['messages'][0]['message-id'] ?? null
                ];
            } else {
                return [
                    'success' => false,
                    'error' => $data['messages'][0]['error-text'] ?? 'Nexmo API error'
                ];
            }
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send via Bangladesh ESL SMS
     */
    private function sendViaBDESL($phone_number, $message) {
        try {
            $ch = curl_init(BDESL_API_URL);
            curl_setopt_array($ch, [
                CURLOPT_POSTFIELDS => http_build_query([
                    'api_token' => BDESL_API_KEY,
                    'phone' => $phone_number,
                    'sms' => $message,
                    'sender_id' => BDESL_SENDER_ID
                ]),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10
            ]);
            
            $response = curl_exec($ch);
            $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);
            
            if ($http_code == 200) {
                return [
                    'success' => true,
                    'message' => 'SMS sent successfully via BDESL',
                    'phone' => $phone_number,
                    'type' => 'bdesl'
                ];
            } else {
                return [
                    'success' => false,
                    'error' => 'BDESL API error: ' . $response
                ];
            }
        } catch (Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Send via Test Mode (Logs only, no actual SMS)
     */
    private function sendViaTest($phone_number, $message) {
        return [
            'success' => true,
            'message' => 'SMS logged successfully (Test Mode)',
            'phone' => $phone_number,
            'type' => 'test',
            'note' => 'SMS not actually sent. Configure SMS_PROVIDER in sms_config.php to enable real SMS.',
            'message_preview' => $message
        ];
    }

    /**
     * Log SMS record to database
     */
    private function logSMSRecord($record) {
        try {
            // Check if table exists, if not create it
            $this->ensureSMSTableExists();
            
            $stmt = $this->pdo->prepare('
                INSERT INTO sms_logs (phone_number, message, sms_type, sent_at, status, provider)
                VALUES (?, ?, ?, ?, ?, ?)
            ');
            
            $stmt->execute([
                $record['phone'],
                $record['message'],
                $record['type'],
                $record['timestamp'],
                $record['status'],
                $record['provider'] ?? 'test'
            ]);
            
            return true;
        } catch (Exception $e) {
            $this->log("[DB_ERROR] Could not log SMS: " . $e->getMessage());
            return false;
        }
    }

    /**
     * Ensure SMS logs table exists
     */
    private function ensureSMSTableExists() {
        try {
            $this->pdo->query('SELECT TOP 1 * FROM sms_logs');
        } catch (Exception $e) {
            // Table doesn't exist, create it
            $create_table = "
            CREATE TABLE sms_logs (
                id INT PRIMARY KEY IDENTITY(1,1),
                phone_number VARCHAR(20),
                message NVARCHAR(MAX),
                sms_type VARCHAR(50),
                sent_at DATETIME,
                status VARCHAR(20) DEFAULT 'sent',
                provider VARCHAR(20) DEFAULT 'test',
                created_at DATETIME DEFAULT GETDATE()
            )
            ";
            $this->pdo->exec($create_table);
        }
    }

    /**
     * Get student phone number from database
     */
    public function getStudentPhone($student_id) {
        try {
            $stmt = $this->pdo->prepare('SELECT phone FROM users WHERE id = ?');
            $stmt->execute([$student_id]);
            $result = $stmt->fetch();
            return $result['phone'] ?? null;
        } catch (Exception $e) {
            $this->log("[ERROR] Could not fetch student phone: " . $e->getMessage());
            return null;
        }
    }

    /**
     * Get student name
     */
    public function getStudentName($student_id) {
        try {
            $stmt = $this->pdo->prepare('SELECT first_name, last_name FROM users WHERE id = ?');
            $stmt->execute([$student_id]);
            $result = $stmt->fetch();
            return ($result['first_name'] ?? 'Student') . ' ' . ($result['last_name'] ?? '');
        } catch (Exception $e) {
            return 'Student';
        }
    }

    /**
     * Get count of pending fees
     */
    private function getPendingFeesCount($phone_number) {
        try {
            $student_id = $this->getStudentIdByPhone($phone_number);
            if (!$student_id) return 0;
            
            $stmt = $this->pdo->prepare('SELECT COUNT(*) as count FROM fees WHERE student_id = ? AND status != ?');
            $stmt->execute([$student_id, 'paid']);
            $result = $stmt->fetch();
            return (int)($result['count'] ?? 0);
        } catch (Exception $e) {
            return 0;
        }
    }

    /**
     * Get student ID by phone number
     */
    private function getStudentIdByPhone($phone_number) {
        try {
            $stmt = $this->pdo->prepare('SELECT id FROM users WHERE phone = ?');
            $stmt->execute([$phone_number]);
            $result = $stmt->fetch();
            return $result['id'] ?? null;
        } catch (Exception $e) {
            return null;
        }
    }

    /**
     * Log message to file
     */
    private function log($message) {
        if (SMS_ENABLE_LOGGING) {
            $timestamp = date('Y-m-d H:i:s');
            $log_message = "[$timestamp] $message\n";
            @file_put_contents($this->log_file, $log_message, FILE_APPEND);
        }
    }
}
?>
