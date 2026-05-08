/* ═══════════════════════════════════════════════════
   ECHOROOTS — home.js
   Handles the dynamic homepage for logged-in users
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  if (isLoggedIn()) {
    initLoggedInHome();
  }
});

async function initLoggedInHome() {
  // Hide guest hero, show logged-in home
  const guestHero = document.querySelector('.hero');
  const loggedInHome = document.getElementById('loggedInHome');
  if (guestHero) guestHero.style.display = 'none';
  if (loggedInHome) loggedInHome.style.display = 'block';

  try {
    const res = await apiFetch('/api/home/dashboard');
    if (res.success) {
      renderDashboard(res.data);
    }
  } catch (err) {
    console.error('Home dashboard error:', err);
  }
}

function renderDashboard(data) {
  const { user, nearbyEvents, topEvents } = data;

  // Render Stats
  document.getElementById('homeUserName').textContent = user.name;
  document.getElementById('homeUserXP').textContent = user.xp.toLocaleString();
  document.getElementById('homeUserLevel').textContent = user.level;
  document.getElementById('homeUserStreak').textContent = user.streak;

  // Render Nearby Events (Horizontal Cards)
  const nearbyList = document.getElementById('homeNearbyEvents');
  if (nearbyEvents.length > 0) {
    nearbyList.innerHTML = nearbyEvents.map(e => `
      <div class="card clickable-row" data-href="events.html?id=${e._id}" style="flex-shrink:0; width:220px; transition:var(--transition); overflow:hidden;">
        <div style="height:110px; background:var(--bg-muted); overflow:hidden;">
          <img src="${(e.images && e.images[0]) || 'https://images.unsplash.com/photo-1514222139-b57c44ce074b?auto=format&fit=crop&q=80&w=400'}" style="width:100%; height:100%; object-fit:cover;">
        </div>
        <div style="padding:14px;">
          <div style="font-size:0.72rem; color:var(--saffron); font-weight:700; margin-bottom:4px; text-transform:uppercase; letter-spacing:0.04em;">
            ${new Date(e.date).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}
          </div>
          <div style="font-weight:700; color:var(--text-primary); font-size:0.9rem; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${e.title}
          </div>
          <div style="font-size:0.78rem; color:var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            ${e.location.city} · ${e.category}
          </div>
        </div>
      </div>
    `).join('');
  } else {
    nearbyList.innerHTML = '<p style="color:var(--text-muted); padding:20px;">No upcoming events nearby.</p>';
  }

  // Render Top Events (Vertical Simple List)
  const topList = document.getElementById('homeTopEvents');
  if (topEvents.length > 0) {
    topList.innerHTML = topEvents.map((e, i) => `
      <div class="flex items-center gap-3 clickable-row" data-href="events.html?id=${e._id}" style="padding:10px; border-radius:var(--radius-md); border:1px solid transparent; transition:var(--transition);" onmouseover="this.style.background='var(--bg-muted)'; this.style.borderColor='var(--border)'" onmouseout="this.style.background='transparent'; this.style.borderColor='transparent'">
        <div style="width:40px; height:40px; border-radius:var(--radius-sm); background:var(--bg-muted); display:flex; align-items:center; justify-content:center; color:var(--purple); flex-shrink:0;">
          <i class="fa-solid fa-${['fire', 'bolt', 'star'][i % 3]}"></i>
        </div>
        <div style="flex:1; min-width:0;">
          <div style="font-weight:600; font-size:0.88rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${e.title}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); display:flex; align-items:center; gap:8px;">
            <span><i class="fa-solid fa-heart" style="color:var(--pink); font-size:0.7rem;"></i> ${e.likes?.length || 0}</span>
            <span>·</span>
            <span>${e.category}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}
