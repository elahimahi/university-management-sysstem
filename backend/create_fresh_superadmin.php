<?php
// Delete old superadmin and create fresh one
require_once __DIR__ . '/core/db_connect.php';

try {
    // ১. পুরানো superadmin ডেলিট করুন
    $deleteStmt = $pdo->prepare("DELETE FROM users WHERE email = 'superadmin@university.edu'");
    $deleteStmt->execute();
    echo "✅ পুরানো superadmin ডেলিট হয়েছে\n\n";

    // ২. নতুন superadmin তৈরি করুন
    $newEmail = 'admin@ums.edu';
    $newPassword = 'Admin@123456';
    $hashedPassword = password_hash($newPassword, PASSWORD_DEFAULT);

    $insertStmt = $pdo->prepare(
        "INSERT INTO users (email, password, first_name, last_name, role, is_email_verified, approval_status) 
         VALUES (?, ?, ?, ?, ?, ?, ?)"
    );
    $insertStmt->execute([
        $newEmail,
        $hashedPassword,
        'Super',
        'Admin',
        'superadmin',
        1,
        'approved'
    ]);

    echo "✅ নতুন Fixed Superadmin অ্যাকাউন্ট তৈরি হয়েছে!\n\n";
    echo "═══════════════════════════════════════════════════════════\n";
    echo "📧 Email:           " . $newEmail . "\n";
    echo "🔑 Password:        " . $newPassword . "\n";
    echo "👤 Role:            SUPERADMIN\n";
    echo "✅ Status:          APPROVED (Ready to Login)\n";
    echo "═══════════════════════════════════════════════════════════\n\n";

    echo json_encode([
        'status' => 'success',
        'message' => 'নতুন Fixed Superadmin অ্যাকাউন্ট প্রস্তুত',
        'email' => $newEmail,
        'password' => $newPassword,
        'kore_login_koro' => 'http://localhost:3000'
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);

} catch (Exception $e) {
    echo "❌ Error: " . $e->getMessage();
}
?>
