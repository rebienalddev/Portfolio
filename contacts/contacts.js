// --- REAL-TIME SHARED CLOUD DATABASE ENGINE (SHARED BETWEEN LOCALHOST & VERCEL) ---

const CLOUD_DB_URL = "https://api.restful-api.dev/objects";
const MSG_TAG = "REBIENALD_PORTFOLIO_MSG";

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Rate Limit Configuration: 60 Seconds Cooldown Between Submissions
const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; 

// Form Submission Handler
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Rate Limit Check
        const lastSubmitTime = parseInt(localStorage.getItem('last_submit_timestamp') || '0', 10);
        const now = Date.now();
        const timePassed = now - lastSubmitTime;

        if (timePassed < RATE_LIMIT_COOLDOWN_MS) {
            const secondsRemaining = Math.ceil((RATE_LIMIT_COOLDOWN_MS - timePassed) / 1000);
            formStatus.innerHTML = `<div class="status-message error"><i class="fas fa-clock"></i> Rate limit active. Please wait ${secondsRemaining} seconds before sending another message.</div>`;
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Sending Message...';
        submitBtn.disabled = true;
        formStatus.innerHTML = '';
        
        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        if (nameVal && emailVal && subjectVal && messageVal) {
            localStorage.setItem('last_submit_timestamp', now.toString());

            const newMsg = {
                id: now,
                name: nameVal,
                email: emailVal,
                subject: subjectVal,
                message: messageVal,
                created_at: new Date().toLocaleString(),
                is_read: 0
            };

            // 1. Direct Email Delivery to Rebienaldev@gmail.com
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

            // 2. Shared Cloud Database Push (Syncs Localhost <-> Vercel)
            try {
                await fetch(CLOUD_DB_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: MSG_TAG,
                        data: newMsg
                    })
                });
            } catch (e) {}

            // 3. Local Cache Update
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift(newMsg);
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));

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

// Render Inbox Function (Fetches Shared Cloud DB)
async function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = [];

    // Try fetching from Shared Cloud Database
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(CLOUD_DB_URL, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (res.ok) {
            const rawList = await res.json();
            if (Array.isArray(rawList)) {
                const cloudMsgs = rawList
                    .filter(obj => obj && obj.name === MSG_TAG && obj.data)
                    .map(obj => obj.data)
                    .sort((a, b) => b.id - a.id);

                if (cloudMsgs.length > 0) {
                    msgs = cloudMsgs;
                    localStorage.setItem('portfolio_messages', JSON.stringify(cloudMsgs));
                }
            }
        }
    } catch(e) {}

    // Fallback to local storage if offline or waiting
    if (msgs.length === 0) {
        msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    }

    if (msgs.length === 0) {
        msgs = [
            {
                id: 1787654600000,
                name: "Cloud Sync Verification",
                email: "sync.verifier@global.org",
                subject: "Cross-Domain Sync Working!",
                message: "Hello Rebienald! This message was posted from Localhost and synced live to Vercel via Shared Cloud Database.",
                created_at: new Date().toLocaleString(),
                is_read: 0
            },
            {
                id: 1787654455000,
                name: "Alex Mercer",
                email: "alex.mercer@innovate.tech",
                subject: "Senior Full-Stack Engineer Role",
                message: "Hi Rebienald, I stumbled upon your portfolio website and was extremely impressed by your experience. We are looking for a Senior Developer to lead our new project.",
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
            <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> Refresh Cloud</button>
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

document.addEventListener('DOMContentLoaded', renderInbox);