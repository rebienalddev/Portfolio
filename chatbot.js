(function () {
    const RENDER_BACKEND_URL = 'https://portfolio-frk8.onrender.com/api/chat';

    const MAX_MESSAGES_PER_WINDOW = 8;
    const RATE_LIMIT_WINDOW_MS = 60000;
    const chatTimestamps = [];

    function checkRateLimit() {
        const now = Date.now();
        while (chatTimestamps.length > 0 && chatTimestamps[0] < now - RATE_LIMIT_WINDOW_MS) {
            chatTimestamps.shift();
        }
        if (chatTimestamps.length >= MAX_MESSAGES_PER_WINDOW) {
            return false;
        }
        chatTimestamps.push(now);
        return true;
    }

    const PROMPT_INJECTION_PATTERNS = [
    /ignore\s+(all\s+)?(previous\s+|prior\s+)?instructions/i,
    /override\s+(system\s+)?prompt/i,
    /disregard\s+(above|previous|all\s+rules)/i,
    /reveal\s+(api\s+key|system\s+prompt|secret|token|password)/i,
    /print\s+(system\s+)?prompt/i,
    /show\s+me\s+(your\s+)?instructions/i,
    /act\s+as\s+an?\s+(unrestricted|jailbroken|evil)/i,
    /jailbreak/i,
    /DAN\s+mode/i,
    /developer\s+mode/i,
    /forget\s+(your\s+)?rules/i,
    /bypass\s+filter/i
    ];

    function isPromptInjection(text) {
        if (!text) return false;
        return PROMPT_INJECTION_PATTERNS.some(pattern => pattern.test(text));
    }

    function initChatbotDOM() {
        if (document.getElementById('chatbotTrigger')) return;

        const container = document.createElement('div');
        container.id = 'rag-chatbot-root';
        container.innerHTML = `
        <!-- Floating Trigger Button -->
        <button id="chatbotTrigger" class="chatbot-trigger" aria-label="Open Chatbot" title="Chat with Rebienald AI">
        <svg class="trigger-icon-open" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <svg class="trigger-icon-close" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>

        <!-- Chatbot Modal Window -->
        <div id="chatbotWindow" class="chatbot-window" role="dialog" aria-labelledby="chatHeaderTitle">
        <div class="chat-header">
        <div class="chat-header-info">
        <div class="chat-avatar">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="10" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8.01" y2="16"></line><line x1="16" y1="16" x2="16.01" y2="16"></line></svg>
        </div>
        <div class="chat-title-group">
        <h4 id="chatHeaderTitle">Rebienald AI Assistant</h4>
        <div class="chat-status">
        <span class="status-dot"></span>
        <span>Online</span>
        </div>
        </div>
        </div>
        <button id="chatCloseBtn" class="chat-close-btn" aria-label="Close Chat">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
        </div>

        <div id="chatMessages" class="chat-messages">
        <div class="chat-msg bot">
        <div class="msg-bubble">
        Hi! I'm Rebienald's AI Assistant. Ask me anything about Rebienald's projects, experience, education, or contact info!
        </div>
        </div>
        </div>

        <div class="chat-suggestions">
        <button class="suggestion-chip" data-query="What are Rebienald's key skills?">💡 Key Skills</button>
        <button class="suggestion-chip" data-query="Tell me about SamAI and PrintHub.">🚀 Projects</button>
        <button class="suggestion-chip" data-query="How can I contact Rebienald?">📬 Contact Info</button>
        </div>

        <form id="chatInputForm" class="chat-input-form">
        <input type="text" id="chatInput" class="chat-input" placeholder="Type your question..." maxlength="300" autocomplete="off" required />
        <button type="submit" id="chatSendBtn" class="chat-send-btn" aria-label="Send Message">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
        </button>
        </form>
        </div>
        `;
        document.body.appendChild(container);
    }

    function parseMarkdown(text) {
        if (!text) return '';

        let raw = text.trim();

        raw = raw
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');

        raw = raw.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');

        raw = raw.replace(/`([^`]+)`/g, '<code>$1</code>');

        raw = raw.replace(/^###?\s+(.*)$/gm, '<h5 class="chat-heading">$1</h5>');
        raw = raw.replace(/^##\s+(.*)$/gm, '<h4 class="chat-heading">$1</h4>');

        raw = raw.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

        raw = raw.replace(/\*([^*]+)\*/g, '<em>$1</em>');

        raw = raw.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

        const lines = raw.split('\n');
        let inList = false;
        let result = [];

        lines.forEach(line => {
            const trimmed = line.trim();
            const listMatch = trimmed.match(/^[-•*+]\s+(.*)/);

            if (listMatch) {
                if (!inList) {
                    result.push('<ul class="chat-list">');
                    inList = true;
                }
                result.push(`<li>${listMatch[1]}</li>`);
            } else {
                if (inList) {
                    result.push('</ul>');
                    inList = false;
                }
                if (trimmed.length > 0) {
                    if (trimmed.startsWith('<h') || trimmed.startsWith('<pre') || trimmed.startsWith('<ul')) {
                        result.push(trimmed);
                    } else {
                        result.push(`<p>${trimmed}</p>`);
                    }
                }
            }
        });

        if (inList) {
            result.push('</ul>');
        }

        return result.join('');
    }

    function scrollToBottom() {
        const messagesArea = document.getElementById('chatMessages');
        if (messagesArea) {
            messagesArea.scrollTop = messagesArea.scrollHeight;
        }
    }

    function appendMessage(sender, content) {
        const messagesArea = document.getElementById('chatMessages');
        if (!messagesArea) return;

        const msgDiv = document.createElement('div');
        msgDiv.className = `chat-msg ${sender}`;

        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'msg-bubble';

        if (sender === 'user') {
            bubbleDiv.textContent = content;
        } else {
            bubbleDiv.innerHTML = parseMarkdown(content);
        }

        msgDiv.appendChild(bubbleDiv);
        messagesArea.appendChild(msgDiv);
        scrollToBottom();
    }

    function showTypingIndicator() {
        const messagesArea = document.getElementById('chatMessages');
        if (!messagesArea) return;

        const indicator = document.createElement('div');
        indicator.id = 'chatTypingIndicator';
        indicator.className = 'chat-msg bot';
        indicator.innerHTML = `
        <div class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        </div>
        `;
        messagesArea.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        const indicator = document.getElementById('chatTypingIndicator');
        if (indicator) indicator.remove();
    }

    async function handleSendMessage(messageText) {
        const input = document.getElementById('chatInput');
        const sendBtn = document.getElementById('chatSendBtn');
        let query = messageText || (input ? input.value.trim() : '');

        if (!query) return;

        query = query.slice(0, 300);
        if (input) input.value = '';

        const suggestions = document.querySelector('.chat-suggestions');
        if (suggestions) suggestions.style.display = 'none';

        if (!checkRateLimit()) {
            appendMessage('user', query);
            appendMessage('bot', "Rate limit reached. Please wait a minute before sending more messages.");
            return;
        }

        appendMessage('user', query);

        if (isPromptInjection(query)) {
            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                appendMessage('bot', "I am designed exclusively to assist with questions regarding Carpio Rebienald Khei's portfolio, skills, projects, and background.");
            }, 400);
            return;
        }

        if (sendBtn) sendBtn.disabled = true;
        if (input) input.disabled = true;

        showTypingIndicator();

        try {
            const response = await fetch(RENDER_BACKEND_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ message: query })
            });

            removeTypingIndicator();

            if (response.ok) {
                const data = await response.json();
                appendMessage('bot', data.response || "No response received.");
            } else {
                appendMessage('bot', "Sorry, unable to process your request at the moment. Please try again.");
            }
        } catch (err) {
            console.error('Render API error:', err);
            removeTypingIndicator();
            appendMessage('bot', "Connection issue contacting AI server. Please check your connection.");
        } finally {
            if (sendBtn) sendBtn.disabled = false;
            if (input) {
                input.disabled = false;
                input.focus();
            }
        }
    }

    function attachEventListeners() {
        const trigger = document.getElementById('chatbotTrigger');
        const windowEl = document.getElementById('chatbotWindow');
        const closeBtn = document.getElementById('chatCloseBtn');
        const form = document.getElementById('chatInputForm');

        if (trigger && windowEl) {
            trigger.addEventListener('click', () => {
                const isOpen = windowEl.classList.contains('open');
                if (isOpen) {
                    windowEl.classList.remove('open');
                    trigger.classList.remove('active');
                } else {
                    windowEl.classList.add('open');
                    trigger.classList.add('active');
                    document.getElementById('chatInput')?.focus();
                }
            });
        }

        if (closeBtn && windowEl && trigger) {
            closeBtn.addEventListener('click', () => {
                windowEl.classList.remove('open');
                trigger.classList.remove('active');
            });
        }

        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                handleSendMessage();
            });
        }

        document.addEventListener('click', (e) => {
            if (e.target && e.target.classList.contains('suggestion-chip')) {
                const text = e.target.getAttribute('data-query');
                if (text) handleSendMessage(text);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            initChatbotDOM();
            attachEventListeners();
        });
    } else {
        initChatbotDOM();
        attachEventListeners();
    }
})();
