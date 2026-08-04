const SUPABASE_URL = "https://uwboeqkiwncdtarqvxbo.supabase.co/rest/v1/messages";
const SUPABASE_KEY = "sb_publishable_a5_YHH1N5U0goK4rRks_OA_Lr-JBSjH";

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nameVal = document.getElementById('name').value.trim();
        const emailVal = document.getElementById('email').value.trim();
        const subjectVal = document.getElementById('subject').value.trim();
        const messageVal = document.getElementById('message').value.trim();

        if (!nameVal || !emailVal || !subjectVal || !messageVal) {
            formStatus.innerHTML = '<div class="status-message error"><i class="fas fa-exclamation-circle"></i> Please fill out all fields.</div>';
            return;
        }

        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Sending Message...';
        submitBtn.disabled = true;
        formStatus.innerHTML = '';

        const newMsg = {
            id: Date.now(),
            name: nameVal,
            email: emailVal,
            subject: subjectVal,
            message: messageVal,
            created_at: new Date().toLocaleString(),
            is_read: 0
        };

        try {
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift(newMsg);
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
        } catch (e) {}

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
        } catch (err) {
            console.error("Supabase POST error:", err);
        }

        formStatus.innerHTML = `<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent successfully!</div>`;
        contactForm.reset();
        submitBtn.innerHTML = 'Send Message';
        submitBtn.disabled = false;

        if (typeof renderInbox === 'function') renderInbox();
        if (typeof renderUI === 'function') renderUI();
    });
}

async function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = [];

    try {
        const res = await fetch(`${SUPABASE_URL}?select=*&order=id.desc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });

        if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data)) {
                msgs = data;
                localStorage.setItem('portfolio_messages', JSON.stringify(data));
            }
        }
    } catch(e) {
        console.error("Supabase GET error:", e);
    }

    if (msgs.length === 0) {
        try {
            msgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        } catch (e) {}
    }

    const totalCount = msgs.length;
    const unreadCount = msgs.filter(m => m.is_read == 0).length;

    if (actions) {
        actions.innerHTML = `
        <span style="color: #111; font-weight: 700; font-size: 0.85rem; margin-right: 1rem;">
        DATABASE: <span style="background: #111; color: #FFF; padding: 0.15rem 0.4rem;">SUPABASE CLOUD DB</span> | TOTAL: ${totalCount} | UNREAD: ${unreadCount}
        </span>
        <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> Refresh Messages</button>
        `;
    }

    if (msgs.length === 0) {
        content.innerHTML = `<div class="empty-state" style="background:#FFF; border:1px dashed #E5E7EB; padding:3rem; text-align:center; color:#6B7280; font-weight:600;">No messages in inbox</div>`;
        return;
    }

    content.innerHTML = `
    <div class="stats-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1.5rem;">
    <div class="stat-box" style="background:#FFF; border:2px solid #111; padding:1rem; border-left:5px solid #111;">
    <div class="val" style="font-size:1.8rem; font-weight:800; color:#111;">${totalCount}</div>
    <div class="lbl" style="font-size:0.75rem; font-weight:700; color:#666; text-transform:uppercase;">TOTAL MESSAGES</div>
    </div>
    <div class="stat-box" style="background:#FFF; border:2px solid #111; padding:1rem; border-left:5px solid #FF7A00;">
    <div class="val" style="font-size:1.8rem; font-weight:800; color:#FF7A00;">${unreadCount}</div>
    <div class="lbl" style="font-size:0.75rem; font-weight:700; color:#666; text-transform:uppercase;">UNREAD MESSAGES</div>
    </div>
    </div>
    ${msgs.map(msg => `
    <div class="msg-card ${msg.is_read == 0 ? 'unread' : ''}" style="background:#FFF; border:1px solid #E5E7EB; padding:1.25rem; margin-bottom:1rem;">
    <div class="msg-head" style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:0.75rem;">
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
    <div class="msg-body" style="font-size:0.9rem; color:#374151; white-space:pre-wrap; margin-top:0.5rem;">${escapeHtml(msg.message)}</div>
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

async function toggleReadMsg(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;

    try {
        const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const msg = localMsgs.find(m => String(m.id) === String(id));
        if (msg) {
            msg.is_read = newStatus;
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
        }
    } catch (e) {}

    try {
        await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ is_read: newStatus })
        });
    } catch (e) {
        console.error("Supabase PATCH error:", e);
    }

    renderInbox();
}

async function deleteMsg(id) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
        let localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        localMsgs = localMsgs.filter(m => String(m.id) !== String(id));
        localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    } catch (e) {}

    try {
        await fetch(`${SUPABASE_URL}?id=eq.${id}`, {
            method: 'DELETE',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
    } catch (e) {
        console.error("Supabase DELETE error:", e);
    }

    renderInbox();
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

document.addEventListener('DOMContentLoaded', renderInbox);
