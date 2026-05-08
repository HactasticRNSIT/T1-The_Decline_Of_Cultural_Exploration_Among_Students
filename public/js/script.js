/* ═══════════════════════════════════════════════════
   ECHOROOTS — Global Script
   Utilities, Auth, API helpers, Toast, Animations
   ═══════════════════════════════════════════════════ */

/* ─── Auth Helpers ──────────────────────────────── */

function getToken() {
  return localStorage.getItem('er_token') || null;
}

function getUser() {
  try {
    const raw = localStorage.getItem('er_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function isLoggedIn() {
  return !!getToken() && !!getUser();
}

function logout() {
  localStorage.removeItem('er_token');
  localStorage.removeItem('er_user');
  window.location.href = '/login.html';
}

function requireAuth(redirectTo) {
  if (!isLoggedIn()) {
    window.location.href = redirectTo || '/login.html';
    return false;
  }
  return true;
}

/* ─── API Fetch Helper ──────────────────────────── */

async function apiFetch(endpoint, options = {}) {
  const token = getToken();
  const defaultHeaders = { 'Content-Type': 'application/json' };
  if (token && !options.headers?.['Authorization']) {
    defaultHeaders['Authorization'] = 'Bearer ' + token;
  }

  const config = {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) }
  };

  const response = await fetch(endpoint, config);
  const data = await response.json();

  if (response.status === 401) {
    localStorage.removeItem('er_token');
    localStorage.removeItem('er_user');
  }

  return data;
}

/* ─── Toast Notification ────────────────────────── */

let toastTimer = null;

function showToast(message, type) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) clearTimeout(toastTimer);

  const icons = {
    success: '<i class="fa-solid fa-circle-check" style="color:#10B981;margin-right:8px;"></i>',
    error:   '<i class="fa-solid fa-circle-xmark" style="color:#EF4444;margin-right:8px;"></i>',
    info:    '<i class="fa-solid fa-circle-info" style="color:var(--teal);margin-right:8px;"></i>',
    xp:      '<i class="fa-solid fa-bolt" style="color:var(--saffron);margin-right:8px;"></i>'
  };

  const icon = icons[type] || icons.success;
  toast.innerHTML = icon + message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, 3200);
}

/* ─── Navbar ────────────────────────────────────── */

function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      const open = mobileMenu.classList.toggle('open');
      menuBtn.innerHTML = open
        ? '<i class="fa-solid fa-xmark"></i>'
        : '<i class="fa-solid fa-bars"></i>';
      mobileMenu.style.display = open ? 'flex' : 'none';
    });
  }

  // Inject auth state into navbar buttons
  updateNavbarAuth();
}

function initSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const main = document.querySelector('.dashboard-layout, .chat-container, .map-page-layout');
  if (!sidebar) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.className = 'sidebar-toggle-btn';
  toggleBtn.innerHTML = '<i class="fa-solid fa-chevron-left"></i>';
  toggleBtn.onclick = () => {
    sidebar.classList.toggle('collapsed');
    if (main) main.classList.toggle('expanded');
    toggleBtn.innerHTML = sidebar.classList.contains('collapsed') 
      ? '<i class="fa-solid fa-chevron-right"></i>' 
      : '<i class="fa-solid fa-chevron-left"></i>';
  };
  sidebar.appendChild(toggleBtn);
}

function initBackButtons() {
  document.querySelectorAll('.back-btn').forEach(btn => {
    btn.onclick = (e) => {
      if (btn.getAttribute('href') === '#') {
        e.preventDefault();
        window.history.back();
      }
    };
  });
}

function initClickableRows() {
  document.addEventListener('click', (e) => {
    const row = e.target.closest('.clickable-row');
    if (row && row.dataset.href) {
      window.location.href = row.dataset.href;
    }
  });
}

function updateNavbarAuth() {
  const user = getUser();
  const loginBtn = document.getElementById('navLoginBtn');
  const registerBtn = document.getElementById('navRegisterBtn');
  const userMenu = document.getElementById('navUserMenu');
  const navUserName = document.getElementById('navUserName');

  if (user && isLoggedIn()) {
    if (loginBtn) loginBtn.style.display = 'none';
    if (registerBtn) registerBtn.style.display = 'none';
    if (userMenu) {
      userMenu.style.display = 'flex';
      if (navUserName) navUserName.textContent = user.name.split(' ')[0];
    }
    
    // Call global auth UI update
    updateGlobalAuthUI(user);
  }
}

function updateGlobalAuthUI(user) {
  if (!user) user = getUser();
  if (!user) return;

  // Admin Panel visibility in all sidebars
  if (user.role === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => {
      el.style.display = 'flex';
      // Ensure it's visible if it was hidden by a different display property
      el.classList.remove('hidden'); 
    });
  }

  // Update sidebar profile if exists
  const sidebarName = document.getElementById('sidebarName');
  const sidebarAvatar = document.getElementById('sidebarAvatar');
  const sidebarLevel = document.getElementById('sidebarLevel');
  
  if (sidebarName) sidebarName.textContent = user.name;
  if (sidebarAvatar) sidebarAvatar.textContent = user.name.charAt(0).toUpperCase();
  if (sidebarLevel) sidebarLevel.textContent = 'Level ' + (user.level || 1) + ' Explorer';
}

/* ─── Smooth Scroll ─────────────────────────────── */

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

/* ─── Scroll Reveal ─────────────────────────────── */

function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');
  if (!elements.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 60);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

/* ─── Counter Animation ─────────────────────────── */

function animateCounter(element, target, duration) {
  const dur = duration || 1200;
  const start = performance.now();
  const from = parseInt(element.textContent.replace(/\D/g, '')) || 0;

  function update(timestamp) {
    const elapsed = timestamp - start;
    const progress = Math.min(elapsed / dur, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(from + (target - from) * ease);
    element.textContent = current.toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

/* ─── XP Bar Fill ───────────────────────────────── */

function fillXpBar(fillElement, percent) {
  requestAnimationFrame(() => {
    setTimeout(() => {
      fillElement.style.width = Math.min(percent, 100) + '%';
    }, 200);
  });
}

/* ─── Format Utilities ──────────────────────────── */

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return minutes + 'm ago';
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + 'h ago';
  const days = Math.floor(hours / 24);
  if (days < 30) return days + 'd ago';
  return formatDate(dateStr);
}

function truncate(str, len) {
  if (!str) return '';
  return str.length > len ? str.slice(0, len).trimEnd() + '...' : str;
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ─── Form Helpers ──────────────────────────────── */

function getFormData(formId) {
  const form = document.getElementById(formId);
  if (!form) return {};
  const data = {};
  new FormData(form).forEach((value, key) => { data[key] = value; });
  return data;
}

function setInputError(inputId, errorId, show) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.toggle('form-input-error', show);
  if (error) error.classList.toggle('show', show);
}

function clearFormErrors(formId) {
  const form = document.getElementById(formId);
  if (!form) return;
  form.querySelectorAll('.field-error').forEach(el => el.classList.remove('show'));
  form.querySelectorAll('.form-input-error').forEach(el => el.classList.remove('form-input-error'));
}

/* ─── Keyboard Shortcuts ────────────────────────── */

function initKeyboardShortcuts() {
  document.addEventListener('keydown', function (e) {
    // Escape closes modals / overlays
    if (e.key === 'Escape') {
      const modals = document.querySelectorAll('.modal.open, .overlay.open');
      modals.forEach(m => m.classList.remove('open'));
    }
  });
}

/* ─── Ripple Effect ─────────────────────────────── */

function addRipple(element) {
  element.addEventListener('click', function (e) {
    const ripple = document.createElement('span');
    const rect = this.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    ripple.style.cssText = `
      position:absolute;width:${size}px;height:${size}px;
      border-radius:50%;background:rgba(255,255,255,0.25);
      transform:scale(0);animation:rippleAnim 0.5s ease-out;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      pointer-events:none;
    `;
    this.style.position = 'relative';
    this.style.overflow = 'hidden';
    this.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);
  });
}

/* Add ripple keyframe to document */
(function () {
  const style = document.createElement('style');
  style.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0;}}';
  document.head.appendChild(style);
})();

/* ─── AI Guide helpers ──────────────────────────── */

function sendSuggestion(text) {
  const input = document.getElementById('chatInput');
  if (!input) return;
  input.value = text;
  input.focus();
  if (typeof sendMessage === 'function') sendMessage();
}

function handleEnter(e) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    if (typeof sendMessage === 'function') sendMessage();
  }
}

/* ─── Local Storage Helpers ─────────────────────── */

function lsGet(key, fallback) {
  try {
    const val = localStorage.getItem('er_' + key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key, value) {
  try {
    localStorage.setItem('er_' + key, JSON.stringify(value));
  } catch {}
}

/* ─── Auto-initialize ───────────────────────────── */

document.addEventListener('DOMContentLoaded', function () {
  initNavbar();
  updateGlobalAuthUI(); // Ensure sidebar/admin-only elements are handled even without navbar
  initSmoothScroll();
  initScrollReveal();
  initKeyboardShortcuts();
  initSidebarToggle();
  initBackButtons();
  initClickableRows();

  // Apply ripple to primary buttons
  document.querySelectorAll('.btn-primary').forEach(addRipple);

  // Auto-redirect logged-in users away from auth pages
  const authPages = ['/login.html', '/register.html'];
  const currentPath = window.location.pathname;
  if (authPages.some(p => currentPath.endsWith(p)) && isLoggedIn()) {
    window.location.href = '/dashboard.html';
  }
  // Logout handler
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
