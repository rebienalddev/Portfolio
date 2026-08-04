<?php
session_start();
header('Content-Type: application/json');

// Secret Password for Admin Login (Default: admin123)
define('ADMIN_PASSWORD', 'admin123');

// SQLite Database File Path
$dbPath = __DIR__ . '/messages.db';

try {
// Open or create SQLite database using PDO
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Create messages table if it does not exist
$pdo->exec("CREATE TABLE IF NOT EXISTS messages (
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT NOT NULL,
email TEXT NOT NULL,
subject TEXT NOT NULL,
message TEXT NOT NULL,
created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
is_read INTEGER DEFAULT 0
)");
} catch (Exception $e) {
echo json_encode(['success' => false, 'message' => 'Database Connection Error: ' . $e->getMessage()]);
exit;
}

$action = $_GET['action'] ?? $_POST['action'] ?? '';

// 1. Submit Contact Form Message (Public)
if ($action === 'submit') {
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if (empty($name) || empty($email) || empty($subject) || empty($message)) {
echo json_encode(['success' => false, 'message' => 'Please fill in all required fields.']);
exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
echo json_encode(['success' => false, 'message' => 'Please enter a valid email address.']);
exit;
}

$stmt = $pdo->prepare("INSERT INTO messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)");
$result = $stmt->execute([
':name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
':email' => filter_var($email, FILTER_SANITIZE_EMAIL),
':subject' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'),
':message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
]);

if ($result) {
echo json_encode(['success' => true, 'message' => 'Message sent successfully! Saved to database.']);
} else {
echo json_encode(['success' => false, 'message' => 'Failed to save message.']);
}
exit;
}

// 2. Admin Login
if ($action === 'login') {
$password = $_POST['password'] ?? '';
if ($password === ADMIN_PASSWORD) {
$_SESSION['admin_logged_in'] = true;
echo json_encode(['success' => true]);
} else {
echo json_encode(['success' => false, 'message' => 'Invalid admin password.']);
}
exit;
}

// 3. Admin Logout
if ($action === 'logout') {
unset($_SESSION['admin_logged_in']);
session_destroy();
echo json_encode(['success' => true]);
exit;
}

// Check Authentication for Protected Admin Actions
if (empty($_SESSION['admin_logged_in'])) {
echo json_encode(['success' => false, 'message' => 'Unauthorized access. Please login.']);
exit;
}

// 4. Fetch All Messages (Admin Only)
if ($action === 'fetch') {
$stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC");
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);

$unreadCount = 0;
foreach ($messages as $m) {
if ($m['is_read'] == 0) $unreadCount++;
}

echo json_encode([
'success' => true,
'messages' => $messages,
'total' => count($messages),
'unread' => $unreadCount
]);
exit;
}

// 5. Toggle Message Read/Unread Status (Admin Only)
if ($action === 'toggle_read') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("UPDATE messages SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = :id");
$stmt->execute([':id' => $id]);
echo json_encode(['success' => true]);
exit;
}

// 6. Delete Message (Admin Only)
if ($action === 'delete') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("DELETE FROM messages WHERE id = :id");
$stmt->execute([':id' => $id]);
echo json_encode(['success' => true]);
exit;
}

echo json_encode(['success' => false, 'message' => 'Invalid action.']);
