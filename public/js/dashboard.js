/* ═══════════════════════════════════════════════
   ECHOROOTS — dashboard.js
   Loads quests, leaderboard, stories for dashboard
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await Promise.all([
      loadDailyQuests(),
      loadLeaderboard(),
      loadStories(),
      loadRecommendations(),
      checkStreak()
    ]);
  } catch (err) {
    console.error('Dashboard init error:', err);
  } finally {
    if (typeof initScrollReveal === 'function') initScrollReveal();
  }
});

async function checkStreak() {
  const res = await apiFetch('/api/user/streak', { method: 'POST' });
  if (res.success) {
    const streakEl = document.getElementById('streakCount');
    if (streakEl) streakEl.textContent = res.streak;
    const user = getUser();
    if (user) {
      user.streak = res.streak;
      user.xp = res.xp;
      localStorage.setItem('er_user', JSON.stringify(user));
    }
  }
}

async function loadDailyQuests() {
  const list = document.getElementById('dailyQuestList');
  if (!list) return;
  try {
    let res = await apiFetch('/api/quests?type=daily');
    if (res.success && res.data.length === 0) {
      await apiFetch('/api/quests/seed', { method: 'POST' });
      res = await apiFetch('/api/quests?type=daily');
    }
    if (!res.success || !res.data.length) {
      list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">No quests found.</div>';
      return;
    }
    const user = getUser();
    const completed = (user?.completedQuests || []).map(String);
    list.innerHTML = res.data.slice(0, 4).map(q => {
      const done = completed.includes(String(q._id));
      const pct  = done ? 100 : 0;
      return `
        <div style="display:flex;align-items:center;gap:14px;padding:14px 16px;border-radius:var(--radius-md);border:1.5px solid ${done ? 'var(--saffron)' : 'var(--border)'};background:${done ? 'rgba(249,115,22,0.03)' : 'var(--bg-card)'};">
          <div style="width:40px;height:40px;border-radius:10px;flex-shrink:0;background:rgba(249,115,22,0.1);color:var(--saffron);display:flex;align-items:center;justify-content:center;"><i class="fa-solid fa-${q.icon || 'trophy'}"></i></div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:var(--font-ui);font-weight:600;font-size:0.88rem;margin-bottom:2px;">${q.title}${done ? '<span style="color:#10B981;margin-left:6px;font-size:0.75rem;">✓ Done</span>' : ''}</div>
            <div class="xp-bar" style="margin-top:5px;"><div class="xp-bar-fill" style="width:${pct}%;${done ? 'background:linear-gradient(90deg,var(--saffron),var(--pink));' : ''}"></div></div>
          </div>
          <div class="badge badge-saffron" style="font-size:0.65rem;flex-shrink:0;">+${q.xpReward} XP</div>
        </div>`;
    }).join('');
  } catch (err) {
    list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">Could not load quests.</div>';
  }
}

async function loadLeaderboard() {
  const list = document.getElementById('leaderboardList');
  if (!list) return;
  try {
    const res = await apiFetch('/api/leaderboard');
    if (!res.success || !res.data.length) {
      list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">No data yet.</div>';
      return;
    }
    const medalColors = ['#F59E0B', '#94A3B8', '#CD7C2F'];
    list.innerHTML = res.data.slice(0, 7).map((u, i) => `
      <div class="clickable-row" data-href="profile.html?id=${u._id}" style="display:flex;align-items:center;gap:12px;padding:12px 10px;border-radius:var(--radius-md);border-bottom:1px solid var(--border);">
        <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;background:${i < 3 ? medalColors[i] : 'var(--bg-muted)'};display:flex;align-items:center;justify-content:center;font-family:var(--font-ui);font-weight:700;font-size:0.78rem;color:${i < 3 ? 'white' : 'var(--text-secondary)'};">${u.rank}</div>
        <div style="width:32px;height:32px;border-radius:50%;flex-shrink:0;background:linear-gradient(135deg,var(--saffron),var(--pink));display:flex;align-items:center;justify-content:center;color:white;font-family:var(--font-ui);font-weight:700;font-size:0.85rem;overflow:hidden;">
          ${(u.avatar && u.avatar.length > 1) ? `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;">` : (u.name || 'E').charAt(0).toUpperCase()}
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--font-ui);font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.name}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">Level ${u.level} · ${u.streak}🔥 streak</div>
        </div>
        <div style="font-family:var(--font-display);font-size:0.95rem;color:var(--saffron);font-weight:700;">${(u.xp || 0).toLocaleString()}</div>
      </div>`).join('');
  } catch (err) {
    list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">Could not load leaderboard.</div>';
  }
}

async function loadStories() {
  const scroll = document.getElementById('storyScroll');
  if (!scroll) return;
  try {
    let res = await apiFetch('/api/stories');
    if (res.success && res.data.length === 0) {
      await apiFetch('/api/stories/seed', { method: 'POST' });
      res = await apiFetch('/api/stories');
    }
    if (!res.success || !res.data.length) {
      scroll.innerHTML = '<div style="padding:16px;color:var(--text-muted);">No stories yet.</div>';
      return;
    }
    const gradients = ['linear-gradient(135deg,#F97316,#EC4899)','linear-gradient(135deg,#06B6D4,#7C3AED)','linear-gradient(135deg,#10B981,#06B6D4)','linear-gradient(135deg,#F59E0B,#F97316)'];
    scroll.innerHTML = res.data.map((s, i) => `
      <div style="flex-shrink:0;width:220px;background:var(--bg-card);border:1px solid var(--border);border-radius:var(--radius-lg);overflow:hidden;transition:var(--transition);cursor:pointer;display:flex;flex-direction:column;" onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-lg)'" onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="height:80px;background:${gradients[i % gradients.length]};"></div>
        <div style="padding:14px;flex:1;display:flex;flex-direction:column;">
          <div style="font-family:var(--font-ui);font-weight:700;font-size:0.85rem;margin-bottom:6px;line-height:1.3;">${s.title}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);line-height:1.5;margin-bottom:8px;">${(s.summary || '').slice(0, 60)}${(s.summary || '').length > 60 ? '…' : ''}</div>
          <div class="flex items-center gap-2" style="margin-top:auto;">
            <div style="width:20px;height:20px;border-radius:50%;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-weight:700;color:var(--saffron);overflow:hidden;">
              ${s.authorUser?.avatar ? `<img src="${s.authorUser.avatar}" style="width:100%;height:100%;object-fit:cover;">` : (s.authorUser?.name || s.author || 'E').charAt(0).toUpperCase()}
            </div>
            <span style="font-size:0.7rem;color:var(--text-secondary);font-weight:600;">${s.authorUser?.name || s.author}</span>
          </div>
        </div>
      </div>`).join('');
  } catch (err) {
    scroll.innerHTML = '<div style="padding:16px;color:var(--text-muted);">Could not load stories.</div>';
  }
}

function openStoryModal() { document.getElementById('storyModal').style.display = 'flex'; }
function closeStoryModal() { document.getElementById('storyModal').style.display = 'none'; }
async function handleStorySubmit(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Posting...';
  const payload = {
    title: document.getElementById('storyTitle').value,
    summary: document.getElementById('storySummary').value,
    content: document.getElementById('storyContent').value,
    tags: document.getElementById('storyTags').value.split(',').map(t => t.trim())
  };
  try {
    const res = await apiFetch('/api/stories', { method: 'POST', body: JSON.stringify(payload) });
    if (res.success) {
      showToast('Story posted successfully!');
      closeStoryModal();
      loadStories();
      e.target.reset();
    } else {
      showToast(res.message || 'Failed to post story', 'error');
    }
  } catch (err) {
    showToast('Error connecting to server', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Post Story';
  }
}
async function loadRecommendations() {
  const container = document.getElementById('recommendationsList');
  if (!container) return;
  try {
    const res = await apiFetch('/api/events');
    if (!res.success || !res.data.length) {
      container.innerHTML = '<p style="color:var(--text-muted);font-size:0.8rem;">Explore more to see suggestions.</p>';
      return;
    }
    // Show 3 random featured or latest events
    const items = res.data.slice(0, 3);
    const colors = ['var(--saffron)', 'var(--teal)', 'var(--purple)'];
    const icons = ['fa-landmark', 'fa-palette', 'fa-calendar'];
    
    container.innerHTML = items.map((ev, i) => `
      <div style="display:flex;gap:12px;align-items:flex-start;cursor:pointer;" onclick="window.location.href='events.html'">
        <div style="width:44px;height:44px;border-radius:var(--radius-md);background:rgba(0,0,0,0.05);display:flex;align-items:center;justify-content:center;color:${colors[i % 3]};flex-shrink:0;"><i class="fa-solid ${icons[i % 3]}"></i></div>
        <div>
          <div style="font-family:var(--font-ui);font-weight:600;font-size:0.88rem;">${ev.title}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);">${ev.category} · ${ev.location?.city || 'India'}</div>
          <div class="badge ${i === 0 ? 'badge-saffron' : 'badge-teal'}" style="font-size:0.65rem;margin-top:5px;">${i === 0 ? 'Featured' : 'Recommended'}</div>
        </div>
      </div>
      ${i < items.length - 1 ? '<div class="divider" style="margin:4px 0;"></div>' : ''}
    `).join('');
  } catch (err) {}
}
