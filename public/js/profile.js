/* ═══════════════════════════════════════════════════
   ECHOROOTS — Profile Script
   ═══════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userId = urlParams.get('id');
  
  if (userId) {
    loadOtherProfile(userId);
  } else {
    if (!requireAuth()) return;
    loadMyProfile();
    loadTimeline();
  }
});

async function loadMyProfile() {
  const response = await apiFetch('/api/user/profile');
  if (response.success) {
    renderProfile(response.data, true);
    renderSaved(response.data);
  }
}

async function loadOtherProfile(id) {
  const response = await apiFetch(`/api/user/profile/${id}`);
  if (response.success) {
    renderProfile(response.data, false);
    // Hide private tabs
    document.querySelector('.tab-btn[onclick="switchTab(\'saved\')"]').style.display = 'none';
  } else {
    showToast('User not found', 'error');
  }
}

function renderProfile(user, isMe) {
  document.getElementById('profileName').textContent = user.name;
  document.getElementById('profileBio').textContent = user.bio || 'Cultural Explorer';
  document.getElementById('profileLevel').textContent = user.level;
  document.getElementById('profileXP').textContent = user.xp.toLocaleString();
  document.getElementById('profileStreak').textContent = user.streak;
  document.getElementById('profileFollowers').textContent = user.followers?.length || 0;
  
  const avatar = document.getElementById('profileAvatar');
  avatar.textContent = user.name.charAt(0);
  if (user.avatar) {
    avatar.innerHTML = `<img src="${user.avatar}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
  }

  // Edit Button for me
  if (isMe) {
    const editBtn = document.getElementById('editProfileBtn');
    if (editBtn) {
      editBtn.style.display = 'inline-flex';
      // Fill modal inputs
      document.getElementById('editName').value = user.name;
      document.getElementById('editBio').value = user.bio || '';
      document.getElementById('editAvatar').value = user.avatar || '';
    }
  }

  // Follow Button logic for other users
  if (!isMe) {
    const actions = document.getElementById('profileActions');
    const myUser = getUser();
    const isFollowing = user.followers?.some(f => f._id === myUser._id || f === myUser._id);
    
    actions.innerHTML = `
      <button class="btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} btn-sm" onclick="toggleFollow('${user._id}')">
        ${isFollowing ? 'Unfollow' : 'Follow'}
      </button>
    `;
  }

  // Render Badges
  const badgesGrid = document.getElementById('badgesGrid');
  if (user.badges?.length > 0) {
    badgesGrid.innerHTML = user.badges.map(b => `
      <div class="achievement-card">
        <div class="ach-icon" style="background:rgba(249,115,22,0.1);color:var(--saffron);">
          <i class="fa-solid fa-award"></i>
        </div>
        <div>
          <div style="font-weight:700;font-size:0.9rem;">${b}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">Achievement Unlocked</div>
        </div>
      </div>
    `).join('');
  } else {
    badgesGrid.innerHTML = '<p style="color:var(--text-muted);grid-column:1/-1;">No achievements yet. Start exploring!</p>';
  }

  // Render Following
  const followingList = document.getElementById('followingList');
  if (user.following?.length > 0) {
    followingList.innerHTML = user.following.map(f => `
      <a href="profile.html?id=${f._id}" class="flex items-center gap-3" style="text-decoration:none;color:inherit;">
        <div style="width:32px;height:32px;border-radius:50%;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;font-size:0.8rem;font-weight:700;">
          ${f.avatar ? `<img src="${f.avatar}" style="width:100%;height:100%;border-radius:50%;">` : f.name.charAt(0)}
        </div>
        <span style="font-size:0.9rem;font-weight:600;">${f.name}</span>
      </a>
    `).join('');
  }
}

async function loadTimeline() {
  const response = await apiFetch('/api/user/timeline');
  const list = document.getElementById('timelineList');
  if (response.success && response.data.length > 0) {
    list.innerHTML = response.data.map(item => `
      <div class="timeline-item clickable-row" data-href="${item.type === 'event' ? 'events.html' : 'quests.html'}?id=${item.data._id}">
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:4px;">
          ${formatDate(item.date)}
        </div>
        <div style="font-weight:600;color:var(--text-primary);">
          <i class="fa-solid fa-${item.type === 'event' ? 'calendar-day' : 'trophy'}" style="margin-right:6px; color:var(--saffron);"></i>
          ${item.type === 'event' ? 'Attended: ' : 'New Quest: '} ${item.data.title}
        </div>
        <div style="font-size:0.85rem;color:var(--text-secondary);">
          ${truncate(item.data.description, 80)}
        </div>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<p style="color:var(--text-muted);">No activity recorded yet.</p>';
  }
}

function renderSaved(user) {
  const list = document.getElementById('savedList');
  const items = [
    ...(user.savedEvents || []).map(i => ({ ...i, type: 'Event', icon: 'calendar-days', link: 'events.html' })),
    ...(user.savedPlaces || []).map(i => ({ ...i, type: 'Place', icon: 'location-dot', link: 'map.html' })),
    ...(user.savedStories || []).map(i => ({ ...i, type: 'Story', icon: 'book-open', link: 'dashboard.html' }))
  ];

  if (items.length > 0) {
    list.innerHTML = items.map(item => `
      <div class="card flex items-center justify-between" style="padding:16px;">
        <div class="flex items-center gap-4">
          <div style="width:40px;height:40px;border-radius:8px;background:var(--bg-muted);display:flex;align-items:center;justify-content:center;color:var(--saffron);">
            <i class="fa-solid fa-${item.icon}"></i>
          </div>
          <div>
            <div style="font-size:0.7rem;text-transform:uppercase;color:var(--text-muted);font-weight:700;">${item.type}</div>
            <div style="font-weight:600;">${item.title || item.name}</div>
          </div>
        </div>
        <a href="${item.link}" class="btn btn-ghost btn-sm">View</a>
      </div>
    `).join('');
  } else {
    list.innerHTML = '<p style="color:var(--text-muted);">Your saved list is empty.</p>';
  }
}

async function toggleFollow(id) {
  const response = await apiFetch(`/api/user/follow/${id}`, { method: 'POST' });
  if (response.success) {
    location.reload();
  }
}

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.tab-btn[onclick="switchTab('${tab}')"]`).classList.add('active');
  
  document.getElementById('timelineTab').style.display = tab === 'timeline' ? 'block' : 'none';
  document.getElementById('achievementsTab').style.display = tab === 'achievements' ? 'block' : 'none';
  document.getElementById('savedTab').style.display = tab === 'saved' ? 'block' : 'none';
}

function openEditModal() {
  const modal = document.getElementById('editModal');
  modal.style.display = 'flex';
  // Close on backdrop click
  modal.onclick = (e) => {
    if (e.target === modal) closeEditModal();
  };
}

function closeEditModal() {
  document.getElementById('editModal').style.display = 'none';
}

async function handleProfileUpdate(e) {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Saving...';

  const payload = {
    name: document.getElementById('editName').value,
    bio: document.getElementById('editBio').value,
    avatar: document.getElementById('editAvatar').value
  };

  try {
    const res = await apiFetch('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    });

    if (res.success) {
      showToast('Profile updated successfully!');
      const user = getUser();
      user.name = payload.name;
      user.avatar = payload.avatar;
      localStorage.setItem('er_user', JSON.stringify(user));
      closeEditModal();
      location.reload();
    } else {
      showToast(res.message || 'Update failed', 'error');
    }
  } catch (err) {
    showToast('Server error', 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = 'Save Changes';
  }
}
