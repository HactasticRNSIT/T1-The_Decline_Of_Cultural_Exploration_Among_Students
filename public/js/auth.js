/* ═══════════════════════════════════════════════
   ECHOROOTS — auth.js
   Populates sidebar and dashboard user data
   (Depends on script.js for auth helpers & apiFetch)
   ═══════════════════════════════════════════════ */

/* Wire up logout button and populate sidebar user info */
document.addEventListener('DOMContentLoaded', () => {
  // Protect the page
  if (typeof requireAuth === 'function') {
    if (!requireAuth()) return;
  }

  // Logout button
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (typeof logout === 'function') logout();
    });
  }

  // Fill sidebar user info
  if (typeof getUser === 'function') {
    const user = getUser();
    if (user) {
      const sidebarName = document.getElementById('sidebarName');
      const sidebarLevel = document.getElementById('sidebarLevel');
      const sidebarAvatar = document.getElementById('sidebarAvatar');
      const sidebarXPLabel = document.getElementById('sidebarXPLabel');
      const sidebarXPBar = document.getElementById('sidebarXPBar');
      const welcomeName = document.getElementById('welcomeName');
      const streakCount = document.getElementById('streakCount');
      const totalXP = document.getElementById('totalXP');
      const userLevel = document.getElementById('userLevel');
      const questsDone = document.getElementById('questsDone');
      const levelBadge = document.getElementById('levelBadge');
      const ringLevel = document.getElementById('ringLevel');
      const xpProgress = document.getElementById('xpProgress');
      const xpToNext = document.getElementById('xpToNext');
      const mainXPBar = document.getElementById('mainXPBar');

      if (sidebarName)  sidebarName.textContent  = user.name || 'Explorer';
      if (sidebarLevel) sidebarLevel.textContent  = `Level ${user.level || 1}`;
      if (sidebarAvatar) sidebarAvatar.textContent = (user.name || 'E').charAt(0).toUpperCase();
      if (welcomeName)  welcomeName.textContent   = (user.name || 'Explorer').split(' ')[0];
      if (streakCount)  streakCount.textContent   = user.streak || 0;
      if (totalXP)      totalXP.textContent       = (user.xp || 0).toLocaleString();
      if (userLevel)    userLevel.textContent      = user.level || 1;
      if (questsDone)   questsDone.textContent     = (user.completedQuests || []).length;
      if (ringLevel)    ringLevel.textContent      = user.level || 1;

      // XP progress within current level
      const xpPerLevel = 500;
      const lvl = user.level || 1;
      const xpIntoLevel = (user.xp || 0) % xpPerLevel;
      const pct = Math.min((xpIntoLevel / xpPerLevel) * 100, 100);

      if (sidebarXPLabel) sidebarXPLabel.textContent = `${xpIntoLevel} / ${xpPerLevel} XP`;
      if (sidebarXPBar)   setTimeout(() => sidebarXPBar.style.width = pct + '%', 200);
      if (xpProgress)     xpProgress.textContent = `${xpIntoLevel} / ${xpPerLevel} XP`;
      if (xpToNext)       xpToNext.textContent   = `${xpPerLevel - xpIntoLevel} XP to reach Level ${lvl + 1}`;
      if (mainXPBar)      setTimeout(() => mainXPBar.style.width = pct + '%', 300);
      if (levelBadge)     levelBadge.textContent  = `Level ${lvl} — ${getLevelTitle(lvl)}`;

      // Update ring stroke-dashoffset
      const ringFill = document.getElementById('levelRingFill');
      if (ringFill) {
        const circumference = 213.6;
        const offset = circumference - (pct / 100) * circumference;
        setTimeout(() => ringFill.style.strokeDashoffset = offset, 300);
      }
    }
  }
});

function getLevelTitle(lvl) {
  const titles = ['', 'Novice Explorer', 'Cultural Apprentice', 'Heritage Scout',
    'Culture Seeker', 'Story Keeper', 'Heritage Guardian', 'Culture Champion',
    'Master Explorer', 'Cultural Legend', 'Grand Heritage Master'];
  return titles[Math.min(lvl, titles.length - 1)] || 'Legend';
}
