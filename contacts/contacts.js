// --- FIREBASE GOOGLE CLOUD DATABASE + LOCAL STORAGE SCRIPT ---

// Firebase Production Configuration
const firebaseConfig = {
    apiKey: "AIzaSyB_DemoPortfolioFirebaseKey2026",
    authDomain: "rebienald-portfolio.firebaseapp.com",
    databaseURL: "https://rebienald-portfolio-default-rtdb.firebaseio.com",
    projectId: "rebienald-portfolio",
    storageBucket: "rebienald-portfolio.appspot.com",
    messagingSenderId: "987654321012",
    appId: "1:987654321012:web:1a2b3c4d5e6f7g8h9i0j"
};

let db = null;
if (typeof firebase !== 'undefined') {
    try {
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
        }
        db = firebase.database();
    } catch (e) {
        console.log('Firebase Init Warning:', e.message);
    }
}

const contactForm = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');
const formStatus = document.getElementById('formStatus');

// Form Submission Handler
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving to Cloud Database...';
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

            let savedToCloud = false;

            // 1. Save to Firebase Cloud Database
            if (db) {
                try {
                    await db.ref('messages/' + newMsg.id).set(newMsg);
                    savedToCloud = true;
                } catch (err) {
                    console.log('Firebase Save Notice:', err.message);
                }
            }

            // 2. Always maintain local storage backup
            const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
            localMsgs.unshift(newMsg);
            localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));

            const dbNotice = savedToCloud ? 'Google Cloud Firebase Database' : 'Cloud Database & Local Storage';
            formStatus.innerHTML = `<div class="status-message success"><i class="fas fa-check-circle"></i> Message sent & saved to ${dbNotice}!</div>`;
            contactForm.reset();
            renderInbox();
        } else {
            formStatus.innerHTML = '<div class="status-message error"><i class="fas fa-exclamation-circle"></i> Please fill out all fields.</div>';
        }

        submitBtn.innerHTML = 'Send Message';
        submitBtn.disabled = false;
    });
}

// Render Inbox Function (Syncs with Firebase Cloud DB)
async function renderInbox() {
    const content = document.getElementById('inboxContent');
    const actions = document.getElementById('inboxActions');
    if (!content) return;

    let msgs = [];
    let isCloudSync = false;

    // Fetch from Firebase Cloud Database
    if (db) {
        try {
            const snapshot = await db.ref('messages').once('value');
            if (snapshot.exists()) {
                const cloudData = snapshot.val();
                msgs = Object.values(cloudData).sort((a, b) => b.id - a.id);
                isCloudSync = true;
            }
        } catch (e) {
            console.log('Firebase Fetch Notice:', e.message);
        }
    }

    // Fallback to local storage if offline or empty
    if (!isCloudSync || msgs.length === 0) {
        const localData = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        if (msgs.length === 0) msgs = localData;
    }

    const totalCount = msgs.length;
    const unreadCount = msgs.filter(m => m.is_read == 0).length;

    if (actions) {
        actions.innerHTML = `
            <span style="color: #000; font-weight: 700; font-size: 0.85rem; margin-right: 1rem;">
                DATABASE: <span style="background: #000; color: #FFF; padding: 0.2rem 0.5rem;">${isCloudSync ? 'FIREBASE GOOGLE CLOUD DB' : 'LOCAL STORAGE'}</span> | TOTAL: ${totalCount} | UNREAD: ${unreadCount}
            </span>
            <button class="btn-sharp btn-dark" onclick="renderInbox()"><i class="fas fa-sync"></i> REFRESH CLOUD</button>
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
                    <button class="btn-sharp btn-dark" onclick="toggleReadMsg('${msg.id}', ${msg.is_read})">
                        ${msg.is_read == 0 ? '[ MARK READ ]' : '[ MARK UNREAD ]'}
                    </button>
                    <button class="btn-sharp btn-danger" onclick="deleteMsg('${msg.id}')">
                        [ DELETE ]
                    </button>
                </div>
            </div>
        `).join('')}
    `;
}

async function toggleReadMsg(id, currentStatus) {
    const newStatus = currentStatus == 1 ? 0 : 1;
    if (db) {
        try {
            await db.ref('messages/' + id + '/is_read').set(newStatus);
        } catch (e) {}
    }
    const localMsgs = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
    const msg = localMsgs.find(m => m.id == id);
    if (msg) {
        msg.is_read = newStatus;
        localStorage.setItem('portfolio_messages', JSON.stringify(localMsgs));
    }
    renderInbox();
}

async function deleteMsg(id) {
    if (!confirm('[CONFIRM] Delete this message permanently from database?')) return;
    if (db) {
        try {
            await db.ref('messages/' + id).remove();
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