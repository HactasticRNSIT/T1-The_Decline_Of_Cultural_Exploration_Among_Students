/* ═══════════════════════════════════════════════
   ECHOROOTS — map.js
   Leaflet map, places API, sidebar, filters
   (Depends on script.js for apiFetch & helpers)
   ═══════════════════════════════════════════════ */

const CATEGORY_COLORS = {
  heritage:   '#F97316',
  museum:     '#06B6D4',
  food:       '#EC4899',
  festival:   '#7C3AED',
  hidden_gem: '#10B981',
  temple:     '#F59E0B',
  art:        '#EF4444',
  default:    '#94A3B8'
};

const CATEGORY_ICONS = {
  heritage:   'fa-landmark',
  museum:     'fa-building-columns',
  food:       'fa-utensils',
  festival:   'fa-music',
  hidden_gem: 'fa-gem',
  temple:     'fa-gopuram',
  art:        'fa-palette',
  default:    'fa-map-pin'
};

// ── Globals ───────────────────────────────────
let map, allPlaces = [], markers = [], activeCategory = 'all', searchQuery = '';

// ── Init map ──────────────────────────────────
function initMap() {
  const mapDiv = document.getElementById('mainMap');
  if (!mapDiv) return;

  const urlParams = new URLSearchParams(window.location.search);
  const latParam = urlParams.get('lat');
  const lngParam = urlParams.get('lng');
  const titleParam = urlParams.get('title');

  const center = (latParam && lngParam) ? [parseFloat(latParam), parseFloat(lngParam)] : [20.5937, 78.9629];
  const zoom = (latParam && lngParam) ? 14 : 5;

  map = L.map('mainMap', {
    center: center,
    zoom: zoom,
    zoomControl: true
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  if (latParam && lngParam) {
    const m = L.marker([parseFloat(latParam), parseFloat(lngParam)], { icon: makeIcon('festival') }).addTo(map);
    if (titleParam) {
      m.bindPopup(`<div style="font-family:var(--font-ui);font-weight:700;">${titleParam}</div>`).openPopup();
    }
  }

  // Invalidate size to fix rendering issues in flex containers
  setTimeout(() => map.invalidateSize(), 400);
}

// ── Custom marker icon ─────────────────────────
function makeIcon(category) {
  const color = CATEGORY_COLORS[category] || CATEGORY_COLORS.default;
  const icon  = CATEGORY_ICONS[category]  || CATEGORY_ICONS.default;
  const svg = `
    <div style="
      width:36px;height:36px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      box-shadow:0 3px 12px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
    ">
      <i class="fa-solid ${icon}" style="
        transform:rotate(45deg);color:#fff;font-size:0.75rem;
      "></i>
    </div>`;

  return L.divIcon({
    html: svg,
    className: '',
    iconSize:   [36, 36],
    iconAnchor: [18, 36],
    popupAnchor:[0, -38]
  });
}

// ── Load places from API ───────────────────────
async function loadPlaces() {
  try {
    let res = await apiFetch('/api/places?limit=100');

    if (!res.success) throw new Error(res.message);
    allPlaces = res.data;

    // If DB empty, seed then reload
    if (allPlaces.length === 0) {
      await apiFetch('/api/places/seed', { method: 'POST' });
      res = await apiFetch('/api/places?limit=100');
      allPlaces = res.data || [];
    }

    renderAll();
  } catch (err) {
    console.error('Failed to load places:', err);
    const listEl = document.getElementById('placeList');
    if (listEl) {
      listEl.innerHTML = `
        <div style="padding:24px;text-align:center;color:var(--text-muted);">
          <i class="fa-solid fa-triangle-exclamation" style="font-size:1.5rem;margin-bottom:8px;display:block;"></i>
          Could not load places. Is the server running?
        </div>`;
    }
    const countEl = document.getElementById('placeCount');
    if (countEl) countEl.textContent = 'Error loading';
  }
}

// ── Render filtered places ─────────────────────
function renderAll() {
  if (!allPlaces) return;

  const filtered = allPlaces.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const q = searchQuery.toLowerCase();
    const matchQ = !q ||
      (p.name || '').toLowerCase().includes(q) ||
      (p.location?.city || '').toLowerCase().includes(q) ||
      (p.category || '').toLowerCase().includes(q) ||
      (p.tags || []).some(t => t.toLowerCase().includes(q));
    return matchCat && matchQ;
  });

  updateMarkers(filtered);
  updateSidebar(filtered);
}

// ── Markers ────────────────────────────────────
function updateMarkers(places) {
  if (!map) return;

  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  places.forEach(place => {
    const lat = place.location?.coords?.lat;
    const lng = place.location?.coords?.lng;
    if (!lat || !lng) return;

    const marker = L.marker([lat, lng], { icon: makeIcon(place.category) }).addTo(map);

    marker.bindPopup(`
      <div class="map-place-popup">
        <div style="font-family:var(--font-ui);font-size:0.7rem;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:${CATEGORY_COLORS[place.category] || '#94A3B8'};margin-bottom:6px;">
          ${place.category || 'heritage'}
        </div>
        <div style="font-family:var(--font-ui);font-weight:700;font-size:1rem;margin-bottom:4px;">${place.name}</div>
        <div style="font-size:0.8rem;color:#64748b;margin-bottom:10px;">${place.location?.city || ''}, ${place.location?.state || ''}</div>
        <div style="font-size:0.82rem;color:#475569;line-height:1.55;margin-bottom:12px;">${(place.description || '').slice(0, 120)}${(place.description || '').length > 120 ? '…' : ''}</div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span style="background:rgba(249,115,22,0.1);color:#F97316;padding:2px 8px;border-radius:20px;font-size:0.72rem;font-weight:700;">
            ★ ${place.rating || 4.0}
          </span>
          <span style="font-size:0.72rem;color:#94a3b8;">${place.entryFee || 'Free'}</span>
        </div>
      </div>
    `, { maxWidth: 300 });

    marker.on('click', () => showFloatingInfo(place));
    markers.push(marker);
  });
}

// ── Sidebar list ───────────────────────────────
function updateSidebar(places) {
  const list  = document.getElementById('placeList');
  const count = document.getElementById('placeCount');
  if (!list || !count) return;

  count.textContent = `${places.length} place${places.length !== 1 ? 's' : ''} found`;

  if (places.length === 0) {
    list.innerHTML = `
      <div style="padding:32px 16px;text-align:center;color:var(--text-muted);">
        <i class="fa-solid fa-map-location-dot" style="font-size:2rem;margin-bottom:12px;display:block;opacity:0.3;"></i>
        No places match your filter.
      </div>`;
    return;
  }

  list.innerHTML = places.map(p => `
    <div class="place-list-item" data-id="${p._id}" onclick="focusPlace('${p._id}')">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <div class="cat-dot" style="background:${CATEGORY_COLORS[p.category] || '#94A3B8'};"></div>
        <span style="font-family:var(--font-ui);font-weight:700;font-size:0.88rem;flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${p.name}</span>
        <span style="font-size:0.72rem;color:var(--text-muted);">★ ${p.rating || 4.0}</span>
      </div>
      <div style="font-size:0.78rem;color:var(--text-secondary);">${p.location?.city || ''}, ${p.location?.state || ''}</div>
    </div>
  `).join('');
}

// ── Focus on a place ───────────────────────────
function focusPlace(id) {
  const place = allPlaces.find(p => p._id === id);
  if (!place) return;

  // Highlight sidebar item
  document.querySelectorAll('.place-list-item').forEach(el => el.classList.remove('active'));
  const item = document.querySelector(`.place-list-item[data-id="${id}"]`);
  if (item) item.classList.add('active');

  const lat = place.location?.coords?.lat;
  const lng = place.location?.coords?.lng;
  if (lat && lng && map) {
    map.flyTo([lat, lng], 13, { animate: true, duration: 1 });
    const marker = markers.find(m => {
      const ll = m.getLatLng();
      return Math.abs(ll.lat - lat) < 0.0001 && Math.abs(ll.lng - lng) < 0.0001;
    });
    if (marker) marker.openPopup();
  }

  showFloatingInfo(place);
}

// ── Floating info card ─────────────────────────
function showFloatingInfo(place) {
  const card = document.getElementById('floatingInfo');
  if (!card) return;
  document.getElementById('infoName').textContent = place.name;
  document.getElementById('infoMeta').textContent =
    `${capitalize(place.category)} · ${place.location?.city || ''}, ${place.location?.state || ''}`;
  card.style.display = 'block';
}

// ── Filter pills ───────────────────────────────
function initFilters() {
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderAll();
    });
  });
}

// ── Search ─────────────────────────────────────
function initSearch() {
  const input = document.getElementById('mapSearchInput');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.trim();
    renderAll();
  });
}

// ── Boot ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  initFilters();
  initSearch();
  loadPlaces();

  // If logged in, update dashboard button
  if (typeof isLoggedIn === 'function' && isLoggedIn()) {
    const dashBtn = document.querySelector('a[href="login.html"]');
    if (dashBtn) {
      dashBtn.href = 'dashboard.html';
      dashBtn.textContent = 'Dashboard';
    }
  }
});
