<?php
session_start();
$isLoggedIn = !empty($_SESSION['admin_logged_in']);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Messages Inbox | Rebienald Carpio</title>
    <link rel="icon" type="image/png" href="../images/logo.png">
    
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    
    <style>
        :root {
            --bg-base: #FFFFFF;
            --bg-elevated: #FAFAFA;
            --accent: #FF7A00;
            --accent-hover: #E06B00;
            --text-primary: #111111;
            --text-secondary: #4B5563;
            --text-tertiary: #9CA3AF;
            --glass-bg: #FFFFFF;
            --glass-border: #E5E7EB;
            --glass-border-hover: #D1D5DB;
        }

        *, *::before, *::after {
            margin: 0; padding: 0; box-sizing: border-box;
            -webkit-tap-highlight-color: transparent !important;
            -webkit-touch-callout: none !important;
            -webkit-user-select: none !important;
            user-select: none !important;
        }

        input, textarea, p, span, h1, h2, h3, div {
            -webkit-user-select: text !important;
            user-select: text !important;
        }

        body {
            background-color: var(--bg-elevated);
            color: var(--text-secondary);
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
            line-height: 1.6;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .container {
            max-width: 1100px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
            width: 100%;
        }

        header {
            background: #FFFFFF;
            border-bottom: 1px solid var(--glass-border);
            padding: 1.25rem 2rem;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .header-content {
            max-width: 1100px;
            margin: 0 auto;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .logo-group {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .logo {
            font-size: 1.2rem;
            font-weight: 700;
            color: var(--text-primary);
            text-decoration: none;
        }

        .badge-title {
            background: rgba(255, 122, 0, 0.1);
            color: var(--accent);
            padding: 0.25rem 0.75rem;
            border-radius: 100px;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
        }

        .header-actions {
            display: flex;
            align-items: center;
            gap: 1rem;
        }

        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.6rem 1.2rem;
            font-size: 0.85rem;
            font-weight: 600;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s;
            text-decoration: none;
            border: none;
        }

        .btn-outline {
            background: transparent;
            border: 1px solid var(--glass-border);
            color: var(--text-primary);
        }

        .btn-outline:hover {
            background: #F3F4F6;
            border-color: #D1D5DB;
        }

        .btn-danger {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid rgba(239, 68, 68, 0.2);
            color: #EF4444;
        }

        .btn-danger:hover {
            background: #EF4444;
            color: #FFFFFF;
        }

        /* Stats Bar */
        .stats-bar {
            display: flex;
            gap: 1.5rem;
            margin-bottom: 2rem;
        }

        .stat-card {
            background: #FFFFFF;
            border: 1px solid var(--glass-border);
            padding: 1.25rem 1.5rem;
            border-radius: 12px;
            flex: 1;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .stat-card .number {
            font-size: 1.8rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .stat-card .label {
            font-size: 0.85rem;
            color: var(--text-tertiary);
            font-weight: 500;
        }

        /* Filter Controls */
        .controls-bar {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            gap: 1rem;
            flex-wrap: wrap;
        }

        .search-input {
            padding: 0.6rem 1rem;
            border: 1px solid var(--glass-border);
            border-radius: 8px;
            font-size: 0.9rem;
            width: 280px;
            outline: none;
        }

        .search-input:focus {
            border-color: var(--accent);
        }

        .filter-group {
            display: flex;
            gap: 0.5rem;
        }

        .filter-btn {
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.85rem;
            font-weight: 500;
            background: transparent;
            border: 1px solid var(--glass-border);
            color: var(--text-secondary);
            cursor: pointer;
        }

        .filter-btn.active {
            background: var(--text-primary);
            color: #FFFFFF;
            border-color: var(--text-primary);
        }

        /* Messages Grid */
        .messages-list {
            display: flex;
            flex-direction: column;
            gap: 1rem;
        }

        .message-card {
            background: #FFFFFF;
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            padding: 1.5rem;
            transition: all 0.2s;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
            position: relative;
        }

        .message-card.unread {
            border-left: 4px solid var(--accent);
            background: #FFFDF9;
        }

        .card-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 0.75rem;
            gap: 1rem;
        }

        .sender-info h3 {
            font-size: 1.05rem;
            color: var(--text-primary);
        }

        .sender-info a {
            color: var(--accent);
            font-size: 0.85rem;
            text-decoration: none;
            font-weight: 500;
        }

        .meta-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
        }

        .time-stamp {
            font-size: 0.8rem;
            color: var(--text-tertiary);
        }

        .status-pill {
            font-size: 0.7rem;
            padding: 0.2rem 0.6rem;
            border-radius: 100px;
            font-weight: 600;
            text-transform: uppercase;
        }

        .status-pill.unread {
            background: rgba(255, 122, 0, 0.1);
            color: var(--accent);
        }

        .status-pill.read {
            background: #F3F4F6;
            color: var(--text-tertiary);
        }

        .subject-line {
            font-weight: 600;
            color: var(--text-primary);
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
        }

        .message-body {
            font-size: 0.9rem;
            color: var(--text-secondary);
            line-height: 1.5;
            white-space: pre-wrap;
            background: #FAFAFA;
            padding: 1rem;
            border-radius: 8px;
            border: 1px solid #F3F4F6;
            margin-bottom: 1rem;
        }

        .card-footer {
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
        }

        /* Login Card */
        .login-wrapper {
            min-height: 80vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .login-card {
            background: #FFFFFF;
            border: 1px solid var(--glass-border);
            border-radius: 16px;
            padding: 2.5rem;
            width: 100%;
            max-width: 400px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
            text-align: center;
        }

        .login-card h2 {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
        }

        .login-card p {
            font-size: 0.85rem;
            color: var(--text-tertiary);
            margin-bottom: 1.5rem;
        }

        .login-card input {
            width: 100%;
            padding: 0.9rem 1rem;
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            font-size: 1rem;
            margin-bottom: 1rem;
            outline: none;
        }

        .login-card input:focus {
            border-color: var(--accent);
        }

        .login-card button {
            width: 100%;
            padding: 0.9rem;
            background: var(--accent);
            color: #FFFFFF;
            border: none;
            border-radius: 10px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s;
        }

        .login-card button:hover {
            background: var(--accent-hover);
        }

        .error-box {
            color: #EF4444;
            font-size: 0.85rem;
            margin-bottom: 1rem;
            display: none;
        }

        .empty-state {
            text-align: center;
            padding: 4rem 2rem;
            background: #FFFFFF;
            border: 1px solid var(--glass-border);
            border-radius: 12px;
            color: var(--text-tertiary);
        }

        .empty-state i {
            font-size: 3rem;
            margin-bottom: 1rem;
            color: var(--glass-border);
        }
    </style>
</head>
<body>

    <header>
        <div class="header-content">
            <div class="logo-group">
                <a href="../index.html" class="logo">Reb.Dev</a>
                <span class="badge-title"><i class="fas fa-database"></i> SQLite Inbox</span>
            </div>
            <div class="header-actions">
                <?php if ($isLoggedIn): ?>
                    <button class="btn btn-outline" onclick="loadMessages()"><i class="fas fa-sync-alt"></i> Refresh</button>
                    <button class="btn btn-outline" onclick="logout()"><i class="fas fa-sign-out-alt"></i> Logout</button>
                <?php else: ?>
                    <a href="contact.html" class="btn btn-outline"><i class="fas fa-arrow-left"></i> Back to Contact</a>
                <?php endif; ?>
            </div>
        </div>
    </header>

    <main class="container">
        <?php if (!$isLoggedIn): ?>
            <!-- Login Form -->
            <div class="login-wrapper">
                <div class="login-card">
                    <div style="font-size: 2.5rem; color: var(--accent); margin-bottom: 1rem;"><i class="fas fa-lock"></i></div>
                    <h2>Admin Inbox Login</h2>
                    <p>Enter the admin password to access saved SQLite contact messages.</p>
                    <div class="error-box" id="loginError">Invalid Password</div>
                    <form id="loginForm">
                        <input type="password" id="adminPassword" placeholder="Enter admin password" required autofocus>
                        <button type="submit" id="loginBtn">Unlock Inbox</button>
                    </form>
                </div>
            </div>
        <?php else: ?>
            <!-- Admin Dashboard -->
            <div class="stats-bar">
                <div class="stat-card">
                    <div class="number" id="totalCount">0</div>
                    <div class="label">Total Received Messages</div>
                </div>
                <div class="stat-card">
                    <div class="number" id="unreadCount" style="color: var(--accent);">0</div>
                    <div class="label">Unread Messages</div>
                </div>
            </div>

            <div class="controls-bar">
                <input type="text" class="search-input" id="searchInput" placeholder="Search by name, email, subject..." oninput="filterMessages()">
                <div class="filter-group">
                    <button class="filter-btn active" data-filter="all" onclick="setFilter('all')">All Messages</button>
                    <button class="filter-btn" data-filter="unread" onclick="setFilter('unread')">Unread</button>
                    <button class="filter-btn" data-filter="read" onclick="setFilter('read')">Read</button>
                </div>
            </div>

            <div class="messages-list" id="messagesContainer">
                <div class="empty-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading messages from SQLite database...</p>
                </div>
            </div>
        <?php endif; ?>
    </main>

    <script>
        let allMessages = [];
        let currentFilter = 'all';

        <?php if (!$isLoggedIn): ?>
        // Login Script
        document.getElementById('loginForm').addEventListener('submit', async function(e) {
            e.preventDefault();
            const password = document.getElementById('adminPassword').value;
            const loginBtn = document.getElementById('loginBtn');
            const errorBox = document.getElementById('loginError');

            loginBtn.innerText = 'Verifying...';
            errorBox.style.display = 'none';

            const formData = new FormData();
            formData.append('password', password);

            try {
                const res = await fetch('contact_api.php?action=login', { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    window.location.reload();
                } else {
                    errorBox.innerText = data.message || 'Invalid Password';
                    errorBox.style.display = 'block';
                }
            } catch (err) {
                errorBox.innerText = 'Connection error. Make sure PHP server is running.';
                errorBox.style.display = 'block';
            } finally {
                loginBtn.innerText = 'Unlock Inbox';
            }
        });
        <?php else: ?>
        // Load messages from SQLite database
        async function loadMessages() {
            const container = document.getElementById('messagesContainer');
            try {
                const res = await fetch('contact_api.php?action=fetch');
                const data = await res.json();

                if (data.success) {
                    allMessages = data.messages;
                    document.getElementById('totalCount').innerText = data.total;
                    document.getElementById('unreadCount').innerText = data.unread;
                    renderMessages();
                } else {
                    container.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-circle"></i><p>${data.message}</p></div>`;
                }
            } catch (err) {
                container.innerHTML = `<div class="empty-state"><i class="fas fa-wifi"></i><p>Unable to connect to database server.</p></div>`;
            }
        }

        function setFilter(filter) {
            currentFilter = filter;
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
            });
            renderMessages();
        }

        function filterMessages() {
            renderMessages();
        }

        function renderMessages() {
            const container = document.getElementById('messagesContainer');
            const query = document.getElementById('searchInput').value.toLowerCase();

            let filtered = allMessages.filter(msg => {
                if (currentFilter === 'unread' && msg.is_read == 1) return false;
                if (currentFilter === 'read' && msg.is_read == 0) return false;

                if (query) {
                    const haystack = (msg.name + ' ' + msg.email + ' ' + msg.subject + ' ' + msg.message).toLowerCase();
                    return haystack.includes(query);
                }
                return true;
            });

            if (filtered.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <p>No messages found in SQLite database.</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = filtered.map(msg => `
                <div class="message-card ${msg.is_read == 0 ? 'unread' : ''}">
                    <div class="card-header">
                        <div class="sender-info">
                            <h3>${escapeHtml(msg.name)}</h3>
                            <a href="mailto:${escapeHtml(msg.email)}"><i class="fas fa-envelope"></i> ${escapeHtml(msg.email)}</a>
                        </div>
                        <div class="meta-info">
                            <span class="time-stamp"><i class="far fa-clock"></i> ${escapeHtml(msg.created_at)}</span>
                            <span class="status-pill ${msg.is_read == 0 ? 'unread' : 'read'}">${msg.is_read == 0 ? 'Unread' : 'Read'}</span>
                        </div>
                    </div>
                    <div class="subject-line"><i class="fas fa-heading" style="color: var(--accent); margin-right: 0.4rem;"></i> ${escapeHtml(msg.subject)}</div>
                    <div class="message-body">${escapeHtml(msg.message)}</div>
                    <div class="card-footer">
                        <button class="btn btn-outline" onclick="toggleRead(${msg.id})">
                            <i class="fas ${msg.is_read == 0 ? 'fa-check' : 'fa-undo'}"></i> ${msg.is_read == 0 ? 'Mark Read' : 'Mark Unread'}
                        </button>
                        <button class="btn btn-danger" onclick="deleteMessage(${msg.id})">
                            <i class="fas fa-trash-alt"></i> Delete
                        </button>
                    </div>
                </div>
            `).join('');
        }

        async function toggleRead(id) {
            const formData = new FormData();
            formData.append('id', id);
            await fetch('contact_api.php?action=toggle_read', { method: 'POST', body: formData });
            loadMessages();
        }

        async function deleteMessage(id) {
            if (!confirm('Are you sure you want to delete this message from SQLite?')) return;
            const formData = new FormData();
            formData.append('id', id);
            await fetch('contact_api.php?action=delete', { method: 'POST', body: formData });
            loadMessages();
        }

        async function logout() {
            await fetch('contact_api.php?action=logout');
            window.location.reload();
        }

        function escapeHtml(str) {
            if (!str) return '';
            return String(str)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }

        loadMessages();
        <?php endif; ?>
    </script>
</body>
</html>
