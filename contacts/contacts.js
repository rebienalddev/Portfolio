// --- LIVE SUPABASE ONLINE CLOUD DATABASE INTEGRATION ---
const SUPABASE_URL = "https://uwboeqkiwncdtarqvxbo.supabase.co/rest/v1/messages";
const SUPABASE_KEY = "sb_publishable_a5_YHH1N5U0goK4rRks_OA_Lr-JBSjH";

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; 

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
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

            // 1. Save to Live Supabase Online Database
            try {
                await fetch(SUPABASE_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Prefer': 'return=representation'
                    },
                    body: JSON.stringify(newMsg)
                });
            } catch (err) {}

            // 2. Local Backup Cache
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift(newMsg);
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));

            formStatus.innerHTML = `<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully! </div>`;
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

    // Fetch live from Supabase Cloud Database
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        const res = await fetch(`${SUPABASE_URL}?select=*&order=id.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data) && data.length > 0) {
                msgs = data;
                localStorage.setItem('portfolio_messages', JSON.stringify(data));
            }
        }
    } catch(e) {}

    // Fallback to local storage if offline or initial load
    if (msgs.length === 0) {
        msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    }

    if (msgs.length === 0) {
        msgs = [
            {
                id: 1787654700000,
                name: "Alex Mercer",
                email: "alex.mercer@innovate.tech",
                subject: "Senior Full-Stack Engineer Role",
                message: "Hi Rebienald, I stumbled upon your portfolio website and was extremely impressed by your experience. We are looking for a Senior Developer to lead our new project.",
                created_at: new Date().toLocaleString(),
                is_read: 0
            }
        ];
    }

    const totalCount = msgs.length;
    const unreadCount = msgs.filter(m => m.is_read == 0).length;

    if (actions) {
        actions.innerHTML = `
            <span style="color: #111; font-weight: 700; font-size: 0.85rem; margin-right: 1rem;">
                DATABASE: <span style="background: #111; color: #FFF; padding: 0.15rem 0.4rem;">SUPABASE CLOUD DB</span> | TOTAL: ${totalCount} | UNREAD: ${unreadCount}
            </span>
            <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> Refresh Supabase</button>
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
