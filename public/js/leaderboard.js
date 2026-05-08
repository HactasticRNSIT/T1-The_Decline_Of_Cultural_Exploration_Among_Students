/* ═══════════════════════════════════════════════
   ECHOROOTS — leaderboard.js
   Loads all users for the global hall of fame
   ═══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  loadFullLeaderboard();
});

async function loadFullLeaderboard() {
  const list = document.getElementById('leaderboardFullList');
  const podium = document.getElementById('topThree');
  if (!list) return;

  try {
    const res = await apiFetch('/api/leaderboard?limit=100');
    if (!res.success || !res.data.length) {
      list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">No data available yet.</div>';
      podium.innerHTML = '';
      return;
    }

    const allData = res.data;
    const top3 = allData.slice(0, 3);
    const others = allData.slice(3);

    // Render Podium
    // Order: 2, 1, 3
    const order = [1, 0, 2]; // indices in top3
    podium.innerHTML = order.map(idx => {
      const u = top3[idx];
      if (!u) return '';
      const rank = idx + 1;
      return `
        <div class="podium rank-${rank} reveal" onclick="window.location.href='profile.html?id=${u._id}'">
          <div class="podium-avatar">
            ${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">` : (u.name || 'E').charAt(0).toUpperCase()}
            <div class="podium-rank">${rank}</div>
          </div>
          <div style="font-weight:700;font-size:1rem;">${u.name}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Level ${u.level} · ${u.streak}🔥</div>
          <div style="font-family:var(--font-display);font-weight:800;color:var(--saffron);margin-top:5px;">${u.xp.toLocaleString()} XP</div>
        </div>
      `;
    }).join('');

    // Render Table
    const myUser = getUser();
    list.innerHTML = allData.map((u, i) => {
      const isMe = myUser && myUser._id === u._id;
      return `
        <div class="lb-row ${isMe ? 'me' : ''} reveal" onclick="window.location.href='profile.html?id=${u._id}'">
          <span class="lb-rank">${u.rank}</span>
          <div class="lb-avatar">
            ${u.avatar ? `<img src="${u.avatar}" style="width:100%;height:100%;object-fit:cover;">` : (u.name || 'E').charAt(0).toUpperCase()}
          </div>
          <span class="lb-name">${u.name} ${isMe ? '<span class="badge badge-saffron" style="font-size:0.6rem;margin-left:5px;">You</span>' : ''}</span>
          <span class="lb-stats">Level ${u.level}</span>
          <span class="lb-xp">${u.xp.toLocaleString()}</span>
        </div>
      `;
    }).join('');

    initScrollReveal();
  } catch (err) {
    list.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);">Error loading leaderboard.</div>';
  }
}
