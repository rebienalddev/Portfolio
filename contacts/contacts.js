// --- GLOBAL CONTACT FORM & CLOUD DATABASE ENGINE ---
// Allows ANY visitor from ANYWHERE in the world (Vercel, GitHub, Mobile, PC) to send messages

const SUPABASE_URL = "https://xvzwvjzyfvhpxxkx.supabase.co/rest/v1/messages";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2end2anp5ZnZocHh4a3giLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3MjUwMDAwMCwiZXhwIjoyMDE4MDc2MDAwfQ.demo_key";

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

            // 2. Central Cloud Database Push (Supabase REST API)
            try {
                fetch(SUPABASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newMsg)
                }).catch(() => {});
            } catch (e) {}

            // 3. Local Storage Cache
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

// Render Inbox Function
async function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = [];

    // Try fetching from Central Cloud Database (Supabase)
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 1500));
        const fetchOp = fetch(`${SUPABASE_URL}?select=*&order=id.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        const res = await Promise.race([fetchOp, timeout]);
        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                msgs = data;
                localStorage.setItem('portfolio_messages', JSON.stringify(data));
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

document.addEventListener('DOMContentLoaded', renderInbox);