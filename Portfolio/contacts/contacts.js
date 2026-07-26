// --- CONTACT FORM + CLIENT INBOX DATABASE SCRIPT (PURE HTML + JS) ---
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Form Submission Handler
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;
        formStatus.innerHTML = '';
        
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        if (nameVal && emailVal && subjectVal && messageVal) {
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift({
                id: Date.now(),
                name: nameVal,
                email: emailVal,
                subject: subjectVal,
                message: messageVal,
                created_at: new Date().toLocaleString(),
                is_read: 0
            });
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));

            formStatus.innerHTML = '<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully! Saved to database inbox.</div>';
            contactForm.reset();
            renderInbox();
        } else {
            formStatus.innerHTML = '<div class="status-message error"><i class="fas fa-exclamation-circle"></i> Please fill out all fields.</div>';
        }

        submitBtn.innerHTML = 'Send Message';
        submitBtn.disabled = false;
    });
}

// Render Inbox Function
let isAdminUnlocked = sessionStorage.getItem('admin_unlocked') === 'true';

function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    if (!isAdminUnlocked) {
        actions.innerHTML = '';
        content.innerHTML = `
            <div class="login-box">
                <div style="font-size: 1.3rem; color: #00FFF0; margin-bottom: 0.5rem;"><i class="fas fa-lock"></i> ADMIN ACCESS</div>
                <p style="font-size: 0.8rem; color: #8F9BB3; margin-bottom: 1rem;">Enter access key (default: admin123) to view stored messages.</p>
                <form onsubmit="handleAdminLogin(event)">
                    <input type="password" id="adminPassInput" placeholder="ENTER ACCESS KEY" required autofocus>
                    <button type="submit" class="btn-sharp btn-cyan" style="width: 100%; justify-content: center; margin-top: 0.5rem;">[ UNLOCK INBOX ]</button>
                </form>
            </div>
        `;
        return;
    }

    const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    const totalCount = localMsgs.length;
    const unreadCount = localMsgs.filter(m => m.is_read == 0).length;

    actions.innerHTML = `
        <span style="color: #00FFF0; margin-right: 1rem;">TOTAL: ${totalCount} | UNREAD: ${unreadCount}</span>
        <button class="btn-sharp btn-danger" onclick="lockAdmin()"><i class="fas fa-power-off"></i> LOGOUT</button>
    `;

    if (localMsgs.length === 0) {
        content.innerHTML = `<div style="text-align: center; padding: 3rem; color: #8F9BB3;">// NO MESSAGES STORED IN DATABASE</div>`;
        return;
    }

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="val">${totalCount}</div>
                <div class="lbl">TOTAL SUBMISSIONS</div>
            </div>
            <div class="stat-box">
                <div class="val" style="color: #FF7A00;">${unreadCount}</div>
                <div class="lbl">UNREAD MESSAGES</div>
            </div>
        </div>
        ${localMsgs.map(msg => `
            <div class="msg-card ${msg.is_read == 0 ? 'unread' : ''}">
                <div class="msg-head">
                    <div>
                        <strong style="color: #FFF; font-size: 1rem;">${escapeHtml(msg.name)}</strong> 
                        &lt;<a href="mailto:${escapeHtml(msg.email)}" style="color: #00FFF0; text-decoration: none;">${escapeHtml(msg.email)}</a>&gt;
                    </div>
                    <div>
                        <span>${escapeHtml(msg.created_at)}</span>
                        <span style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; border: 1px solid #262B3D; color: ${msg.is_read == 0 ? '#00FFF0' : '#8F9BB3'};">
                            ${msg.is_read == 0 ? 'UNREAD' : 'READ'}
                        </span>
                    </div>
                </div>
                <div><strong style="color: #FF7A00;">[SUBJECT]:</strong> ${escapeHtml(msg.subject)}</div>
                <div class="msg-body">${escapeHtml(msg.message)}</div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end;">
                    <button class="btn-sharp btn-cyan" onclick="toggleReadMsg(${msg.id})">
                        ${msg.is_read == 0 ? '[ MARK READ ]' : '[ MARK UNREAD ]'}
                    </button>
                    <button class="btn-sharp btn-danger" onclick="deleteLocalMsg(${msg.id})">
                        [ DELETE ]
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function handleAdminLogin(e) {
    e.preventDefault();
    const pass = document.getElementById('adminPassInput').value;
    if (pass === 'admin123') {
        sessionStorage.setItem('admin_unlocked', 'true');
        isAdminUnlocked = true;
        renderInbox();
    } else {
        alert('Invalid access key!');
    }
}

function lockAdmin() {
    sessionStorage.removeItem('admin_unlocked');
    isAdminUnlocked = false;
    renderInbox();
}

function toggleReadMsg(id) {
    const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    const msg = localMsgs.find(m => m.id == id);
    if (msg) {
        msg.is_read = msg.is_read == 1 ? 0 : 1;
        localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
        renderInbox();
    }
}

function deleteLocalMsg(id) {
    if (!confirm('[CONFIRM] Delete this message permanently?')) return;
    let localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    localMsgs = localMsgs.filter(m => m.id != id);
    localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    renderInbox();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener('DOMContentLoaded', renderInbox);