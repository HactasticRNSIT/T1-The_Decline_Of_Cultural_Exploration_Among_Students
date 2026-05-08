/* ═══════════════════════════════════════════════
   ECHOROOTS — dashboard.js
   Loads quests, leaderboard, stories for dashboard
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadDailyQuests(),
    loadLeaderboard(),
    loadStories()
  ]);
});

/* ── Daily Quests ──────────────────────────────── */
async function loadDailyQuests() {
  const list = document.getElementById('dailyQuestList');
  if (!list) return;

  try {
    let res = await apiFetch('/api/quests?type=daily');
    if (res.success && res.data.length === 0) {
      // Auto-seed if empty
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
      const pct  = done ? 100 : Math.floor(Math.random() * 60 + 10);
      return `
        <div style="
          display:flex;align-items:center;gap:14px;
          padding:14px 16px;border-radius:var(--radius-md);
          border:1.5px solid ${done ? 'var(--saffron)' : 'var(--border)'};
          background:${done ? 'rgba(249,115,22,0.03)' : 'var(--bg-card)'};
          transition:var(--transition);
        ">
          <div style="
            width:40px;height:40px;border-radius:10px;flex-shrink:0;
            background:rgba(249,115,22,0.1);color:var(--saffron);
            display:flex;align-items:center;justify-content:center;
          ">
            <i class="fa-solid fa-${q.icon || 'trophy'}"></i>
          </div>
          <div style="flex:1;min-width:0;">
            <div style="font-family:var(--font-ui);font-weight:600;font-size:0.88rem;margin-bottom:2px;">
              ${q.title}
              ${done ? '<span style="color:#10B981;margin-left:6px;font-size:0.75rem;">✓ Done</span>' : ''}
            </div>
            <div class="xp-bar" style="margin-top:5px;">
              <div class="xp-bar-fill" style="width:${pct}%;${done ? 'background:linear-gradient(90deg,var(--saffron),var(--pink));' : ''}"></div>
            </div>
          </div>
          <div class="badge badge-saffron" style="font-size:0.65rem;flex-shrink:0;">+${q.xpReward} XP</div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('loadDailyQuests error:', err);
    list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">Could not load quests.</div>';
  }
}

/* ── Leaderboard ───────────────────────────────── */
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
      <div style="
        display:flex;align-items:center;gap:12px;
        padding:12px 0;
        border-bottom:1px solid var(--border);
      ">
        <div style="
          width:28px;height:28px;border-radius:50%;flex-shrink:0;
          background:${i < 3 ? medalColors[i] : 'var(--bg-muted)'};
          display:flex;align-items:center;justify-content:center;
          font-family:var(--font-ui);font-weight:700;font-size:0.78rem;
          color:${i < 3 ? 'white' : 'var(--text-secondary)'};
        ">${u.rank}</div>
        <div style="
          width:32px;height:32px;border-radius:50%;flex-shrink:0;
          background:linear-gradient(135deg,var(--saffron),var(--pink));
          display:flex;align-items:center;justify-content:center;
          color:white;font-family:var(--font-ui);font-weight:700;font-size:0.85rem;
        ">${(u.name || 'E').charAt(0).toUpperCase()}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-family:var(--font-ui);font-size:0.85rem;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${u.name}</div>
          <div style="font-size:0.72rem;color:var(--text-muted);">Level ${u.level} · ${u.streak}🔥 streak</div>
        </div>
        <div style="font-family:var(--font-display);font-size:0.95rem;color:var(--saffron);font-weight:700;">${(u.xp || 0).toLocaleString()}</div>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadLeaderboard error:', err);
    list.innerHTML = '<div style="padding:16px;color:var(--text-muted);text-align:center;">Could not load leaderboard.</div>';
  }
}

/* ── Stories ───────────────────────────────────── */
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

    const gradients = [
      'linear-gradient(135deg,#F97316,#EC4899)',
      'linear-gradient(135deg,#06B6D4,#7C3AED)',
      'linear-gradient(135deg,#10B981,#06B6D4)',
      'linear-gradient(135deg,#F59E0B,#F97316)',
    ];

    scroll.innerHTML = res.data.map((s, i) => `
      <div style="
        flex-shrink:0;width:220px;
        background:var(--bg-card);border:1px solid var(--border);
        border-radius:var(--radius-lg);overflow:hidden;
        transition:var(--transition);cursor:pointer;
      " onmouseover="this.style.transform='translateY(-4px)';this.style.boxShadow='var(--shadow-lg)'"
         onmouseout="this.style.transform='';this.style.boxShadow=''">
        <div style="height:80px;background:${gradients[i % gradients.length]};"></div>
        <div style="padding:14px;">
          <div style="font-family:var(--font-ui);font-weight:700;font-size:0.85rem;margin-bottom:6px;line-height:1.3;">
            ${s.title}
          </div>
          <div style="font-size:0.75rem;color:var(--text-muted);line-height:1.5;">
            ${(s.summary || '').slice(0, 70)}${(s.summary || '').length > 70 ? '…' : ''}
          </div>
          <div style="margin-top:10px;font-size:0.7rem;color:var(--text-muted);">
            <i class="fa-regular fa-clock"></i> ${s.duration || 5} min read
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('loadStories error:', err);
    scroll.innerHTML = '<div style="padding:16px;color:var(--text-muted);">Could not load stories.</div>';
  }
}
