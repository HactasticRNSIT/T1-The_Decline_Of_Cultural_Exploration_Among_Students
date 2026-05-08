/* ═══════════════════════════════════════════════
   ECHOROOTS — ai-guide.js
   AI Chat logic, typing animations, suggestion chips
   ═══════════════════════════════════════════════ */

let chatHistory = [];

document.addEventListener('DOMContentLoaded', () => {
  // Populate user data in sidebar if logged in
  if (typeof requireAuth === 'function') {
    // requireAuth() // Optional: AI guide can be public, but XP only for logged in
  }

  const chatInput = document.getElementById('chatInput');
  if (chatInput) {
    chatInput.addEventListener('input', () => {
      chatInput.style.height = 'auto';
      chatInput.style.height = (chatInput.scrollHeight) + 'px';
    });
  }

  // Initial welcome message (already in HTML, but could be dynamic)
  loadHistory();
});

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
}

function sendSuggestion(text) {
  const input = document.getElementById('chatInput');
  if (input) {
    input.value = text;
    sendMessage();
  }
}

async function loadHistory() {
  // Mock history loading or fetch from local storage
  const saved = localStorage.getItem('er_chat_history');
  if (saved) {
    const list = document.getElementById('chatHistory');
    // We could populate the sidebar with titles
  }
}

async function sendMessage() {
  const input = document.getElementById('chatInput');
  const btn = document.getElementById('sendBtn');
  const container = document.getElementById('chatMessages');

  if (!input || !btn || !container) return;
  const text = input.value.trim();
  if (!text) return;

  // Disable input
  input.value = '';
  input.style.height = 'auto';
  input.disabled = true;
  btn.disabled = true;

  // Add user message
  appendMessage('user', text);

  // Add typing indicator
  const typingId = addTypingIndicator();

  try {
    // Call API using apiFetch (from script.js)
    const res = await apiFetch('/api/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message: text, history: chatHistory.slice(-10) })
    });

    // Remove typing indicator
    removeTypingIndicator(typingId);

    if (res.success) {
      const { text: aiText, suggestions } = res.data;
      appendMessage('ai', aiText, suggestions);
      chatHistory.push({ role: 'user', content: text });
      chatHistory.push({ role: 'assistant', content: aiText });

      // If user got XP
      if (res.xpGained) {
        // We could show a toast
        if (typeof showToast === 'function') showToast(`+10 XP gained!`, 'xp');
      }
    } else {
      appendMessage('ai', "I'm having trouble connecting to my cultural knowledge base. Please try again in a moment.");
    }
  } catch (err) {
    console.error('AI Chat Error:', err);
    removeTypingIndicator(typingId);
    appendMessage('ai', "Sorry, I encountered an error. Is the server running?");
  } finally {
    input.disabled = false;
    btn.disabled = false;
    input.focus();
  }
}

function appendMessage(role, text, suggestions = []) {
  const container = document.getElementById('chatMessages');
  if (!container) return;

  const group = document.createElement('div');
  group.className = `ai-message-group ${role}`;

  const isAI = role === 'ai';
  const avatarHtml = isAI
    ? `<div class="msg-avatar" style="background:linear-gradient(135deg,var(--saffron),var(--pink));"><i class="fa-solid fa-robot"></i></div>`
    : `<div class="msg-avatar" style="background:var(--bg-muted);color:var(--text-secondary);">${(getUser()?.name || 'U').charAt(0)}</div>`;

  const msgId = Date.now() + Math.floor(Math.random() * 1000);
  let contentHtml = `
    <div class="msg-content">
      <div class="msg-bubble" id="msg-${msgId}">${text.replace(/\n/g, '<br>')}</div>
      ${isAI && suggestions.length > 0 ? `
        <div class="suggestion-row">
          ${suggestions.map(s => `<button class="suggestion-chip" onclick="sendSuggestion('${s.replace(/'/g, "\\'")}')">${s}</button>`).join('')}
        </div>
      ` : ''}
      <div class="msg-time" style="display:flex; gap:10px; align-items:center;">
        <span>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        ${isAI ? `<button onclick="translateMsg('msg-${msgId}')" style="background:none;border:none;color:var(--saffron);cursor:pointer;font-size:0.75rem;padding:0;font-family:var(--font-ui);"><i class="fa-solid fa-language"></i> Translate</button>` : ''}
      </div>
    </div>
  `;

  group.innerHTML = isAI ? avatarHtml + contentHtml : contentHtml + avatarHtml;
  container.appendChild(group);

  // Scroll to bottom
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
}

async function translateMsg(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const originalText = el.innerText;
  el.innerHTML = '<div class="spinner" style="width:14px;height:14px;border-width:2px;display:inline-block;"></div> Translating...';
  
  try {
    const res = await apiFetch('/api/ai/translate', {
      method: 'POST',
      body: JSON.stringify({ text: originalText, targetLang: 'Hindi' })
    });
    if (res.success) {
      el.innerHTML = res.data.replace(/\n/g, '<br>');
    } else {
      el.innerHTML = originalText;
      showToast('Translation failed.');
    }
  } catch (e) {
    el.innerHTML = originalText;
    showToast('Error translating.');
  }
}

function addTypingIndicator() {
  const container = document.getElementById('chatMessages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.id = id;
  div.className = 'ai-message-group ai';
  div.innerHTML = `
    <div class="msg-avatar" style="background:linear-gradient(135deg,var(--saffron),var(--pink));"><i class="fa-solid fa-robot"></i></div>
    <div class="msg-content">
      <div class="typing-indicator">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    </div>
  `;
  container.appendChild(div);
  container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
  return id;
}

function removeTypingIndicator(id) {
  const el = document.getElementById(id);
  if (el) el.remove();
}

function newChat() {
  const container = document.getElementById('chatMessages');
  if (!container) return;
  window.location.reload();
}
