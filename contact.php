<?php
session_start();

define('ADMIN_PASSWORD', 'admin123');

$dbPath = __DIR__ . '/contacts/messages.db';
$formStatusMsg = '';
$formStatusType = '';
$loginErrorMsg = '';

try {
$pdo = new PDO('sqlite:' . $dbPath);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

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
die("Database Error: " . $e->getMessage());
}

if (isset($_POST['action']) && $_POST['action'] === 'submit_message') {
$name = trim($_POST['name'] ?? '');
$email = trim($_POST['email'] ?? '');
$subject = trim($_POST['subject'] ?? '');
$message = trim($_POST['message'] ?? '');

if (!empty($name) && !empty($email) && !empty($subject) && !empty($message)) {
if (filter_var($email, FILTER_VALIDATE_EMAIL)) {
$stmt = $pdo->prepare("INSERT INTO messages (name, email, subject, message) VALUES (:name, :email, :subject, :message)");
$stmt->execute([
':name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
':email' => filter_var($email, FILTER_SANITIZE_EMAIL),
':subject' => htmlspecialchars($subject, ENT_QUOTES, 'UTF-8'),
':message' => htmlspecialchars($message, ENT_QUOTES, 'UTF-8')
]);
$formStatusMsg = "Message sent successfully! Saved to SQLite database.";
$formStatusType = "success";
} else {
$formStatusMsg = "Please enter a valid email address.";
$formStatusType = "error";
}
} else {
$formStatusMsg = "Please fill in all required fields.";
$formStatusType = "error";
}
}

if (isset($_POST['action']) && $_POST['action'] === 'admin_login') {
if (($_POST['password'] ?? '') === ADMIN_PASSWORD) {
$_SESSION['admin_logged_in'] = true;
header("Location: contact.php#admin-inbox");
exit;
} else {
$loginErrorMsg = "INVALID ADMIN KEY";
}
}

if (isset($_GET['action']) && $_GET['action'] === 'logout') {
unset($_SESSION['admin_logged_in']);
session_destroy();
header("Location: contact.php");
exit;
}

$isLoggedIn = !empty($_SESSION['admin_logged_in']);

if ($isLoggedIn && isset($_POST['action'])) {
if ($_POST['action'] === 'toggle_read') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("UPDATE messages SET is_read = CASE WHEN is_read = 1 THEN 0 ELSE 1 END WHERE id = :id");
$stmt->execute([':id' => $id]);
header("Location: contact.php#admin-inbox");
exit;
}
if ($_POST['action'] === 'delete') {
$id = intval($_POST['id'] ?? 0);
$stmt = $pdo->prepare("DELETE FROM messages WHERE id = :id");
$stmt->execute([':id' => $id]);
header("Location: contact.php#admin-inbox");
exit;
}
}

$messages = [];
$totalCount = 0;
$unreadCount = 0;

if ($isLoggedIn) {
$stmt = $pdo->query("SELECT * FROM messages ORDER BY id DESC");
$messages = $stmt->fetchAll(PDO::FETCH_ASSOC);
$totalCount = count($messages);
foreach ($messages as $m) {
if ($m['is_read'] == 0) $unreadCount++;
}
}
?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Contact | Rebienald Carpio</title>
        <link rel="icon" type="image/png" href="images/logo.png">

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

        <style>
            :root {
                --bg-base: #FFFFFF;
                --bg-elevated: #FAFAFA;
                --accent: #FF7A00;
                --accent-hover: #E06B00;
                --accent-cyan: #00FFF0;
                --text-primary: #111111;
                --text-secondary: #4B5563;
                --text-tertiary: #9CA3AF;
                --glass-bg: #FFFFFF;
                --glass-border: #E5E7EB;
                --glass-border-hover: #D1D5DB;
            }
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                background-color: var(--bg-elevated);
                color: var(--text-secondary);
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
                line-height: 1.6;
                min-height: 100vh;
                display: flex; flex-direction: column;
            }
            .container {
                max-width: 95%;
                margin: 0 auto;
                padding: 0 2rem;
                width: 100%;
            }
            nav {
                position: fixed;
                top: 2rem;
                left: 50%;
                transform: translateX(-50%);
                width: calc(100% - 4rem);
                max-width: 800px;
                background: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(8px);
                border: 1px solid var(--glass-border);
                border-radius: 100px;
                padding: 0.75rem 2rem;
                z-index: 1000;
                display: flex;
                justify-content: space-between;
                align-items: center;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            }
            .logo { font-size: 1.1rem; font-weight: 700; color: var(--text-primary); text-decoration: none; }
            .nav-links { display: flex; gap: 2.5rem; list-style: none; }
            .nav-links a { color: var(--text-secondary); font-size: 0.85rem; font-weight: 500; text-decoration: none; }
            .nav-links a:hover { color: var(--text-primary); }
            .nav-cta {
                background: transparent; border: 1px solid var(--glass-border);
                color: var(--text-primary); padding: 0.5rem 1.25rem; border-radius: 100px;
                font-size: 0.85rem; font-weight: 500; text-decoration: none;
            }
            .hamburger { display: none; color: var(--text-primary); font-size: 1.2rem; cursor: pointer; }
            .main-content { padding-top: 10rem; padding-bottom: 5rem; flex-grow: 1; }
            .hero { text-align: center; margin-bottom: 4rem; }
            .hero h1 { font-size: clamp(2.5rem, 5vw, 4rem); margin-bottom: 1rem; font-weight: 700; letter-spacing: -0.04em; color: var(--text-primary); }
            .hero p { color: var(--text-secondary); font-size: 1.1rem; max-width: 500px; margin: 0 auto; }
            .glass-card {
                background: #FFFFFF;
                border: 1px solid var(--glass-border);
                border-radius: 16px;
                padding: 2.5rem;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                transition: all 0.3s ease;
            }
            .contact-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 2rem; }
            .glass-card h2 { font-size: 1.8rem; margin-bottom: 2rem; color: var(--text-primary); }
            .contact-details { list-style: none; }
            .contact-details li { display: flex; align-items: center; gap: 1.2rem; margin-bottom: 1.8rem; padding-bottom: 1.8rem; border-bottom: 1px solid var(--glass-border); }
            .contact-details li:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
            .contact-icon {
                width: 48px; height: 48px; border-radius: 50%;
                background: rgba(255, 122, 0, 0.05); border: 1px solid rgba(255, 122, 0, 0.1);
                display: flex; align-items: center; justify-content: center; color: var(--accent); font-size: 1.2rem;
            }
            .contact-text h3 { font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--text-tertiary); font-weight: 500; margin-bottom: 0.3rem; }
            .contact-text a, .contact-text p { font-size: 1.05rem; color: var(--text-primary); text-decoration: none; font-weight: 500; }
            .form-group { margin-bottom: 1.5rem; }
            .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
            .form-group label { display: block; margin-bottom: 0.6rem; font-size: 0.85rem; font-weight: 500; color: var(--text-secondary); }
            .form-group input, .form-group textarea {
                width: 100%; padding: 1rem 1.25rem; background: #FFFFFF;
                border: 1px solid var(--glass-border); border-radius: 12px;
                color: var(--text-primary); font-family: 'Inter', sans-serif; font-size: 1rem; outline: none; transition: all 0.3s;
            }
            .form-group input:focus, .form-group textarea:focus { border-color: var(--accent); box-shadow: 0 0 0 1px var(--accent); }
            .form-group textarea { height: 160px; resize: vertical; }
            .submit-btn {
                display: inline-flex; align-items: center; justify-content: center;
                width: 100%; padding: 1.1rem; font-size: 1rem; font-weight: 600;
                border-radius: 12px; background: var(--accent); color: #FFFFFF; border: none; cursor: pointer;
                box-shadow: 0 4px 12px rgba(255, 122, 0, 0.15); transition: all 0.3s;
            }
            .submit-btn:hover { background: var(--accent-hover); transform: translateY(-2px); }
            .status-alert {
                padding: 1rem 1.25rem; border-radius: 12px; font-size: 0.95rem; font-weight: 500; margin-bottom: 1.5rem;
                display: flex; align-items: center; gap: 0.75rem;
            }
            .status-alert.success { background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.2); color: #10B981; }
            .status-alert.error { background: rgba(239, 68, 68, 0.08); border: 1px solid rgba(239, 68, 68, 0.2); color: #EF4444; }
            .back-home { margin-top: 3rem; text-align: center; }
            .back-link { font-size: 0.9rem; color: var(--text-secondary); font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; }
            .admin-section {
                margin-top: 5rem;
                background: #0A0B0E;
                border: 1px solid #262B3D;
                padding: 2.5rem;
                color: #F0F2F5;
                font-family: 'JetBrains Mono', monospace;
                border-radius: 0 !important;
            }
            .admin-section *, .admin-section *::before, .admin-section *::after {
                border-radius: 0 !important;
            }
            .admin-head {
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid #262B3D; padding-bottom: 1rem; margin-bottom: 2rem;
                flex-wrap: wrap; gap: 1rem;
            }
            .admin-head h2 { font-size: 1.4rem; color: #00FFF0; letter-spacing: 1px; }
            .btn-sharp {
                font-family: 'JetBrains Mono', monospace; font-size: 0.8rem; font-weight: 600;
                padding: 0.6rem 1.2rem; background: transparent; color: #F0F2F5;
                border: 1px solid #262B3D; cursor: pointer; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem;
            }
            .btn-sharp:hover { background: #F0F2F5; color: #0A0B0E; }
            .btn-cyan { border-color: #00FFF0; color: #00FFF0; }
            .btn-cyan:hover { background: #00FFF0; color: #000; }
            .btn-danger { border-color: #FF3366; color: #FF3366; }
            .btn-danger:hover { background: #FF3366; color: #FFF; }
            .msg-box {
                background: #12141C; border: 1px solid #262B3D; margin-bottom: 1.5rem; padding: 1.5rem;
            }
            .msg-box.unread { border-left: 4px solid #00FFF0; background: #10131E; }
            .msg-meta { display: flex; justify-content: space-between; margin-bottom: 0.75rem; font-size: 0.85rem; color: #8F9BB3; }
            .msg-body { background: #060709; padding: 1rem; border: 1px solid #1A1E2C; margin: 1rem 0; font-size: 0.85rem; color: #C5CEE0; white-space: pre-wrap; }
            .admin-login-box { max-width: 400px; margin: 0 auto; text-align: center; padding: 2rem; border: 1px solid #00FFF0; background: #12141C; }
            .admin-login-box input { width: 100%; padding: 0.9rem; background: #060709; border: 1px solid #262B3D; color: #00FFF0; font-family: monospace; margin-bottom: 1rem; outline: none; }
            @media (max-width: 768px) {
                .container { padding: 0 1.5rem; }
                nav { width: calc(100% - 3rem); }
                .contact-grid { grid-template-columns: 1fr; }
                .form-row { grid-template-columns: 1fr; }
            }
        </style>
    </head>
    <body>

        <nav>
            <a href="index.html" class="logo">Reb.Dev</a>
            <ul class="nav-links">
                <li><a href="index.html#work">Work</a></li>
                <li><a href="index.html#expertise">Expertise</a></li>
                <li><a href="index.html#about">About</a></li>
                <li><a href="index.html#certifications">Certificates</a></li>
            </ul>
            <a href="contact.php" class="nav-cta">Let's Talk</a>
        </nav>

        <main class="main-content">
            <div class="container">

                <section class="hero">
                    <h1>Let's Build Something.</h1>
                    <p>Feel free to reach out for collaborations, project inquiries, or just to say hello. I'm always open to discussing new opportunities.</p>
                </section>

                <div class="contact-grid">

                    <div class="glass-card">
                        <h2>Contact Info</h2>
                        <ul class="contact-details">
                            <li>
                                <div class="contact-icon"><i class="fas fa-envelope"></i></div>
                                <div class="contact-text">
                                    <h3>Email</h3>
                                    <a href="mailto:Rebienaldev@gmail.com">Rebienaldev@gmail.com</a>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-github"></i></div>
                                <div class="contact-text">
                                    <h3>GitHub</h3>
                                    <a href="https://github.com/rebienalddev" target="_blank">rebienalddev</a>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-discord"></i></div>
                                <div class="contact-text">
                                    <h3>Discord</h3>
                                    <p>rebkhei</p>
                                </div>
                            </li>
                            <li>
                                <div class="contact-icon"><i class="fab fa-whatsapp"></i></div>
                                <div class="contact-text">
                                    <h3>WhatsApp</h3>
                                    <a href="https://wa.me/639945324891" target="_blank">+63 994 532 4891</a>
                                </div>
                            </li>
                        </ul>
                    </div>

                    <div class="glass-card">
                        <h2>Send a Message</h2>

                        <?php if ($formStatusMsg): ?>
                        <div class="status-alert <?= $formStatusType ?>">
                            <i class="fas <?= $formStatusType === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle' ?>"></i>
                            <?= htmlspecialchars($formStatusMsg) ?>
                        </div>
                        <?php endif; ?>

                        <div id="formStatus"></div>

                        <form id="contactForm" method="POST">
                            <input type="hidden" name="action" value="submit_message">
                            <div class="form-row">
                                <div class="form-group">
                                    <label for="name">Your Name</label>
                                    <input type="text" id="name" name="name" required placeholder="John Doe">
                                </div>
                                <div class="form-group">
                                    <label for="email">Your Email</label>
                                    <input type="email" id="email" name="email" required placeholder="john@example.com">
                                </div>
                            </div>

                            <div class="form-group">
                                <label for="subject">Subject</label>
                                <input type="text" id="subject" name="subject" required placeholder="Project Inquiry">
                            </div>
                            <div class="form-group">
                                <label for="message">Your Message</label>
                                <textarea id="message" name="message" required placeholder="Tell me about your project or idea..."></textarea>
                            </div>

                            <button type="submit" class="submit-btn" id="submitBtn">Send Message</button>
                        </form>
                    </div>
                </div>

                <section class="admin-section" id="admin-inbox">
                    <div class="admin-head">
                        <h2><i class="fas fa-database"></i> SQLITE MESSAGES DATABASE</h2>
                        <?php if ($isLoggedIn): ?>
                        <div>
                            <span style="color: #00FFF0; margin-right: 1rem;">TOTAL: <?= $totalCount ?> | UNREAD: <?= $unreadCount ?></span>
                            <a href="contact.php?action=logout" class="btn-sharp btn-danger"><i class="fas fa-power-off"></i> LOGOUT</a>
                        </div>
                        <?php endif; ?>
                    </div>

                    <?php if (!$isLoggedIn): ?>
                    <div class="admin-login-box">
                        <div style="font-size: 1.5rem; color: #00FFF0; margin-bottom: 0.5rem;"><i class="fas fa-lock"></i> ADMIN ACCESS</div>
                        <p style="font-size: 0.8rem; color: #8F9BB3; margin-bottom: 1rem;">Enter security password to view saved messages.</p>

                        <?php if ($loginErrorMsg): ?>
                        <div style="color: #FF3366; font-size: 0.8rem; margin-bottom: 1rem;"><?= htmlspecialchars($loginErrorMsg) ?></div>
                        <?php endif; ?>

                        <form method="POST">
                            <input type="hidden" name="action" value="admin_login">
                            <input type="password" name="password" placeholder="ENTER ACCESS KEY" required>
                            <button type="submit" class="btn-sharp btn-cyan" style="width: 100%; justify-content: center;">[ UNLOCK INBOX ]</button>
                        </form>
                    </div>
                    <?php else: ?>
                    <?php if (empty($messages)): ?>
                    <div style="text-align: center; padding: 3rem; color: #8F9BB3;">// NO MESSAGES STORED IN SQLITE DATABASE</div>
                    <?php else: ?>
                    <?php foreach ($messages as $msg): ?>
                    <div class="msg-box <?= $msg['is_read'] == 0 ? 'unread' : '' ?>">
                        <div class="msg-meta">
                            <div>
                                <strong style="color: #FFF; font-size: 1rem;"><?= htmlspecialchars($msg['name']) ?></strong>
                                &lt;<a href="mailto:<?= htmlspecialchars($msg['email']) ?>" style="color: #00FFF0; text-decoration: none;"><?= htmlspecialchars($msg['email']) ?></a>&gt;
                            </div>
                            <div>
                                <span><?= htmlspecialchars($msg['created_at']) ?></span>
                                <span style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; border: 1px solid #262B3D; color: <?= $msg['is_read'] == 0 ? '#00FFF0' : '#8F9BB3' ?>;">
                                <?= $msg['is_read'] == 0 ? 'UNREAD' : 'READ' ?>
                                </span>
                            </div>
                        </div>
                        <div><strong style="color: #FF7A00;">[SUBJECT]:</strong> <?= htmlspecialchars($msg['subject']) ?></div>
                        <div class="msg-body"><?= htmlspecialchars($msg['message']) ?></div>
                        <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                            <form method="POST" style="display: inline;">
                                <input type="hidden" name="action" value="toggle_read">
                                <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                <button type="submit" class="btn-sharp btn-cyan">
                                <?= $msg['is_read'] == 0 ? '[ MARK READ ]' : '[ MARK UNREAD ]' ?>
                                </button>
                            </form>
                            <form method="POST" style="display: inline;" onsubmit="return confirm('Delete message?');">
                                <input type="hidden" name="action" value="delete">
                                <input type="hidden" name="id" value="<?= $msg['id'] ?>">
                                <button type="submit" class="btn-sharp btn-danger">[ DELETE ]</button>
                            </form>
                        </div>
                    </div>
                    <?php endforeach; ?>
                    <?php endif; ?>
                    <?php endif; ?>
                </section>

                <div class="back-home">
                    <a href="index.html" class="back-link"><i class="fas fa-arrow-left"></i> Back to Home</a>
                </div>
            </div>
        </main>

        <footer style="text-align: center; padding: 2rem; color: var(--text-tertiary); font-size: 0.85rem; border-top: 1px solid var(--glass-border);">
            <div class="container">
                <p>&copy; 2025 Rebienald Carpio. All Rights Reserved. Engineered to scale.</p>
            </div>
        </footer>

        <script src="contacts/contacts.js">

        </script>
    </body>
</html>
