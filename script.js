/* =============================================
   FOCUSMIND — Shared Utilities
   ============================================= */

/* Use var so FM is on window — required for inline onclick="FM.logout()" in navbar HTML */
var FM = {

  USERS_KEY:   'fm_users',
  SESSION_KEY: 'fm_session',

  /* Resolve absolute root URL by reading script.js's own <script src> tag.
     Works for both file:// (Windows local) and http:// (dev server). */
  ROOT: (function () {
    var tags = document.querySelectorAll('script[src]');
    for (var i = 0; i < tags.length; i++) {
      var m = tags[i].src.match(/^(.*\/)script\.js(\?.*)?$/);
      if (m) return m[1]; // e.g. "file:///G:/FocusMind/"
    }
    return '';
  })(),

  /* On first ever load, seed localStorage structure from js/db.json */
  seedFromDB() {
    if (localStorage.getItem('fm_seeded')) return;
    fetch(this.ROOT + 'js/db.json')
      .then(r => r.json())
      .then(data => {
        if (!localStorage.getItem(this.USERS_KEY)) {
          localStorage.setItem(this.USERS_KEY, JSON.stringify(data.fm_users || []));
        }
        localStorage.setItem('fm_seeded', '1');
      })
      .catch(() => { /* offline or file:// fetch blocked — fine, localStorage works without seed */ });
  },

  getUsers() {
    return JSON.parse(localStorage.getItem(this.USERS_KEY) || '[]');
  },

  saveUsers(users) {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  },

  getCurrentUser() {
    const id = localStorage.getItem(this.SESSION_KEY);
    if (!id) return null;
    return this.getUsers().find(u => u.id === id) || null;
  },

  updateUser(updated) {
    const users = this.getUsers();
    const idx   = users.findIndex(u => u.id === updated.id);
    if (idx !== -1) { users[idx] = updated; this.saveUsers(users); }
  },

  requireAuth() {
    if (!this.getCurrentUser()) {
      window.location.href = this.ROOT + 'pages/login.html';
    }
  },

  logout() {
    localStorage.removeItem(this.SESSION_KEY);
    window.location.href = this.ROOT + 'pages/login.html';
  },

  /* PSS-10 scoring:  0–13 low | 14–26 moderate | 27–40 high */
  stressLevel(score) {
    if (score <= 13) return 'low';
    if (score <= 26) return 'moderate';
    return 'high';
  },

  stressLabel(level) {
    return { low: 'Low Stress', moderate: 'Moderate Stress', high: 'High Stress' }[level] || 'Not Assessed';
  },

  stressEmoji(level) {
    return { low: '😊', moderate: '😐', high: '😟' }[level] || '❓';
  },

  saveScore(gameName, score, details = '') {
    const user = this.getCurrentUser();
    if (!user) return;
    if (!user.scores) user.scores = [];
    user.scores.unshift({ id: Date.now(), game: gameName, score, details, date: new Date().toISOString() });
    if (user.scores.length > 50) user.scores = user.scores.slice(0, 50);
    this.updateUser(user);
  },

  formatDate(iso) {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  },

  toast(title, msg = '', type = 'info') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    const el = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<div><div class="toast-title">${title}</div>${msg ? `<div class="toast-msg">${msg}</div>` : ''}</div>`;
    container.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 350); }, 3200);
  },

  renderNav(activePage) {
    this.seedFromDB();
    const user = this.getCurrentUser();
    if (!user) return;
    const R = this.ROOT;
    const initial = user.name ? user.name[0].toUpperCase() : '?';
    const el = document.getElementById('navbar');
    if (!el) return;

    const link = (href, label, page) =>
      `<a href="${R}pages/${href}" class="${activePage === page ? 'active' : ''}">${label}</a>`;

    el.innerHTML = `
      <a href="${R}pages/dashboard.html" class="navbar-brand">
        <svg width="30" height="30" viewBox="0 0 68 68" fill="none" xmlns="http://www.w3.org/2000/svg" style="flex-shrink:0">
          <defs>
            <linearGradient id="gNav" x1="0" y1="0" x2="68" y2="68" gradientUnits="userSpaceOnUse">
              <stop stop-color="#6c63ff"/><stop offset="1" stop-color="#f9a8d4"/>
            </linearGradient>
          </defs>
          <circle cx="34" cy="34" r="32" fill="url(#gNav)" opacity="0.15"/>
          <circle cx="34" cy="34" r="32" stroke="url(#gNav)" stroke-width="1.5" opacity="0.3"/>
          <path d="M34 13C25 13 17 19.5 17 28c0 4.5 1.8 8.5 4.8 11.2 1.8 1.7 4 2.8 6.2 2.8V52h6" stroke="url(#gNav)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <path d="M34 13C43 13 51 19.5 51 28c0 4.5-1.8 8.5-4.8 11.2-1.8 1.7-4 2.8-6.2 2.8V52h-6" stroke="url(#gNav)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          <line x1="34" y1="13" x2="34" y2="52" stroke="url(#gNav)" stroke-width="1.5" stroke-dasharray="3 3" opacity="0.4"/>
          <path d="M21 25C19 28 19 33 21 36" stroke="url(#gNav)" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
          <path d="M25 19C22.5 23 22.5 28 25 32" stroke="url(#gNav)" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
          <path d="M47 25C49 28 49 33 47 36" stroke="url(#gNav)" stroke-width="2" stroke-linecap="round" opacity="0.55"/>
          <path d="M43 19C45.5 23 45.5 28 43 32" stroke="url(#gNav)" stroke-width="1.5" stroke-linecap="round" opacity="0.35"/>
          <path d="M17 34H22L25.5 25L29.5 41L33 31L36.5 34H51" stroke="url(#gNav)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span>FocusMind</span>
      </a>
      <nav class="navbar-links">
        ${link('dashboard.html',  'Dashboard',   'dashboard')}
        ${link('stress-test.html','Stress Test',  'stress')}
        ${link('games.html',      'Games',        'games')}
        ${link('analytics.html',  'Progress',     'analytics')}
      </nav>
      <div class="navbar-user">
        <span class="user-name">${user.name}</span>
        <div class="avatar" title="${user.name}">${initial}</div>
        <button class="btn btn-sm" onclick="FM.logout()"
          style="color:#fff;border:1.5px solid rgba(255,255,255,.4);background:transparent;font-family:'Poppins',sans-serif;padding:6px 14px;border-radius:8px;cursor:pointer;font-size:.82rem;font-weight:500">
          Logout
        </button>
      </div>`;
  }
};
