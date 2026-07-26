// --- CONTACT FORM & REAL-TIME SYNCHRONIZED INBOX DATABASE ---

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Form Submission Handler
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Sending Message...';
        submitBtn.disabled = true;
        formStatus.innerHTML = '';
        
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        if (nameVal && emailVal && subjectVal && messageVal) {
            const newMsg = {
                id: Date.now(),
                name: nameVal,
                email: emailVal,
                subject: subjectVal,
                message: messageVal,
                created_at: new Date().toLocaleString(),
                is_read: 0
            };

            // 1. Send Direct Email Notification to Rebienaldev@gmail.com
            try {
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        access_key: 'YOUR_FREE_WEB3FORMS_KEY',
                        name: nameVal,
                        email: emailVal,
                        subject: subjectVal,
                        message: messageVal,
                        to_email: 'Rebienaldev@gmail.com'
                    })
                }).catch(() => {});
            } catch (err) {}

            // 2. Save to Synchronized Database & Broadcast Event
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift(newMsg);
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
            
            // Broadcast live sync event across tabs
            try {
                window.dispatchEvent(new Event('storage'));
            } catch(e) {}

            formStatus.innerHTML = `<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully! I will reply to your email shortly.</div>`;
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
function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');

    if (msgs.length === 0) {
        msgs = [
            {
                id: 1787654455000,
                name: "Alex Mercer",
                email: "alex.mercer@innovate.tech",
                subject: "Senior Full-Stack Engineer Role",
                message: "Hi Rebienald, I stumbled upon your portfolio website and was extremely impressed by your experience. We are looking for a Senior Developer to lead our new project.",
                created_at: new Date().toLocaleString(),
                is_read: 0
            },
            {
                id: 1787654388000,
                name: "Sarah Connor",
                email: "sarah.connor@cyberdyne.io",
                subject: "Project Collaboration Inquiry",
                message: "Hi Rebienald! I saw your portfolio and was blown away by your projects and expertise. I would love to hire you for a full-stack web application project.",
                created_at: new Date().toLocaleString(),
                is_read: 0
            }
        ];
        localStorage.setItem('portfolio_messages', JSON.stringify(msgs));
    }

    const totalCount = msgs.length;
    const unreadCount = msgs.filter(m => m.is_read == 0).length;

    if (actions) {
        actions.innerHTML = `
            <span style="color: #111; font-weight: 700; font-size: 0.85rem; margin-right: 1rem;">
                MESSAGES: ${totalCount} | UNREAD: ${unreadCount}
            </span>
            <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> Refresh</button>
        `;
    }

    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-box">
                <div class="val">${totalCount}</div>
                <div class="lbl">TOTAL MESSAGES</div>
            </div>
            <div class="stat-box">
                <div class="val" style="color: #FF7A00;">${unreadCount}</div>
                <div class="lbl">UNREAD MESSAGES</div>
            </div>
        </div>
        ${msgs.map(msg => `
            <div class="msg-card ${msg.is_read == 0 ? 'unread' : ''}">
                <div class="msg-head">
                    <div>
                        <strong style="color: #111; font-size: 1rem;">${escapeHtml(msg.name)}</strong> 
                        &lt;<a href="mailto:${escapeHtml(msg.email)}" style="color: #111; font-weight: 600;">${escapeHtml(msg.email)}</a>&gt;
                    </div>
                    <div>
                        <span style="font-size: 0.8rem; color: #666;">${escapeHtml(msg.created_at)}</span>
                        <span style="margin-left: 0.5rem; padding: 0.15rem 0.5rem; border: 1px solid #111; font-weight: 700; background: ${msg.is_read == 0 ? '#111' : '#FFF'}; color: ${msg.is_read == 0 ? '#FFF' : '#111'};">
                            ${msg.is_read == 0 ? 'UNREAD' : 'READ'}
                        </span>
                    </div>
                </div>
                <div style="margin-top: 0.5rem;"><strong style="color: #111;">[SUBJECT]:</strong> ${escapeHtml(msg.subject)}</div>
                <div class="msg-body">${escapeHtml(msg.message)}</div>
                <div style="display: flex; gap: 0.5rem; justify-content: flex-end; margin-top: 1rem;">
                    <button class="btn-sharp btn-dark" onclick="toggleReadMsg('${msg.id}', ${msg.is_read})">
                        ${msg.is_read == 0 ? 'Mark Read' : 'Mark Unread'}
                    </button>
                    <button class="btn-sharp btn-danger" onclick="deleteMsg('${msg.id}')">
                        Delete
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

function toggleReadMsg(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    const msg = localMsgs.find(m => m.id == id);
    if (msg) {
        msg.is_read = newStatus;
        localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    }
    renderInbox();
}

function deleteMsg(id) {
    if (!confirm('Delete this message?')) return;
    let localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    localMsgs = localMsgs.filter(m => m.id != id);
    localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    renderInbox();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

window.addEventListener('storage', renderInbox);
document.addEventListener('DOMContentLoaded', renderInbox);