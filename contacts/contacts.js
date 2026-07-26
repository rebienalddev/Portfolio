// --- CONTACT FORM + SQLITE DATABASE SCRIPT ---
const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

const SQLITE_API_URL = 'http://127.0.0.1:8000/api/messages';

// Form Submission Handler
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to SQLite...';
        submitBtn.disabled = true;
        formStatus.innerHTML = '';
        
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        if (nameVal && emailVal && subjectVal && messageVal) {
            const payload = {
                name: nameVal,
                email: emailVal,
                subject: subjectVal,
                message: messageVal
            };

            let savedToSQLite = false;
            try {
                const res = await fetch(SQLITE_API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });
                if (res.ok) {
                    savedToSQLite = true;
                }
            } catch (err) {
                console.log('SQLite server offline, falling back to localStorage');
            }

            // Always maintain local backup
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

            const dbType = savedToSQLite ? 'SQLite Database (messages.db)' : 'Browser Local Storage';
            formStatus.innerHTML = `<div class="status-message success"><i class="fas fa-check-circle"></i> Message saved successfully to ${dbType}!</div>`;
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
async function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = [];
    let isSQLiteActive = false;

    // Try fetching from SQLite Server
    try {
        const res = await fetch(SQLITE_API_URL);
        if (res.ok) {
            msgs = await res.json();
            isSQLiteActive = true;
        }
    } catch (e) {
        msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    }

    const totalCount = msgs.length;
    const unreadCount = msgs.filter(m => m.is_read == 0).length;

    if (actions) {
        actions.innerHTML = `
            <span style="color: #000; font-weight: 700; font-size: 0.85rem; margin-right: 1rem;">
                DATABASE: <span style="background: #000; color: #FFF; padding: 0.2rem 0.5rem;">${isSQLiteActive ? 'SQLITE (messages.db)' : 'LOCAL STORAGE'}</span> | TOTAL: ${totalCount} | UNREAD: ${unreadCount}
            </span>
            <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> REFRESH</button>
        `;
    }

    if (msgs.length === 0) {
        content.innerHTML = `<div style="text-align: center; padding: 3rem; color: #666; font-weight: 600;">// NO MESSAGES STORED IN DATABASE</div>`;
        return;
    }

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="val">${totalCount}</div>
                <div class="lbl">TOTAL SUBMISSIONS</div>
            </div>
            <div class="stat-box">
                <div class="val" style="color: #000;">${unreadCount}</div>
                <div class="lbl">UNREAD MESSAGES</div>
            </div>
        </div>
        ${msgs.map(msg => `
            <div class="msg-card ${msg.is_read == 0 ? 'unread' : ''}">
                <div class="msg-head">
                    <div>
                        <strong style="color: #000; font-size: 1rem;">${escapeHtml(msg.name)}</strong> 
                        &lt;<a href="mailto:${escapeHtml(msg.email)}" style="color: #000; font-weight: 600;">${escapeHtml(msg.email)}</a>&gt;
                    </div>
                    <div>
                        <span>${escapeHtml(msg.created_at)}</span>
                        <span style="margin-left: 0.5rem; padding: 0.2rem 0.5rem; border: 1px solid #000; font-weight: 700; background: ${msg.is_read == 0 ? '#000' : '#FFF'}; color: ${msg.is_read == 0 ? '#FFF' : '#000'};">
                            ${msg.is_read == 0 ? 'UNREAD' : 'READ'}
                        </span>
                    </div>
                </div>
                <div style="margin-top: 0.5rem;"><strong style="color: #000;">[SUBJECT]:</strong> ${escapeHtml(msg.subject)}</div>
                <div class="msg-body">${escapeHtml(msg.message)}</div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
                    <button class="btn-sharp btn-dark" onclick="toggleReadMsg(${msg.id}, ${isSQLiteActive})">
                        ${msg.is_read == 0 ? '[ MARK READ ]' : '[ MARK UNREAD ]'}
                    </button>
                    <button class="btn-sharp btn-danger" onclick="deleteMsg(${msg.id}, ${isSQLiteActive})">
                        [ DELETE ]
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

async function toggleReadMsg(id, isSQLiteActive) {
    if (isSQLiteActive) {
        try {
            await fetch('http://127.0.0.1:8000/api/messages/toggle-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
        } catch (e) {}
    }
    const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    const msg = localMsgs.find(m => m.id == id);
    if (msg) {
        msg.is_read = msg.is_read == 1 ? 0 : 1;
        localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    }
    renderInbox();
}

async function deleteMsg(id, isSQLiteActive) {
    if (!confirm('[CONFIRM] Delete this message permanently?')) return;
    if (isSQLiteActive) {
        try {
            await fetch('http://127.0.0.1:8000/api/messages/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: id })
            });
        } catch (e) {}
    }
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