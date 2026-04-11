<?php
// Test payment process endpoint
$data = [
    'fee_id' => 2,
    'student_id' => 2,
    'amount_paid' => 100,
    'payment_method' => 'bkash',
    'phone' => '01712345678'
];

$ch = curl_init('http://localhost/Database_Project/university-management-sysstem/backend/payment/process');
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";

if (curl_errno($ch)) {
    echo "CURL Error: " . curl_error($ch) . "\n";
}

curl_close($ch);
?>