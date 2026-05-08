/* ═══════════════════════════════════════════════
   ECHOROOTS — map.js
   Leaflet map, Routing, Geolocation, Places API
   ═══════════════════════════════════════════════ */

const CATEGORY_COLORS = {
  heritage:   '#F97316',
  museum:     '#06B6D4',
  food:       '#EC4899',
  festival:   '#7C3AED',
  hidden_gem: '#10B981',
  temple:     '#F59E0B',
  art:        '#EF4444',
  event:      '#3B82F6',
  quest:      '#8B5CF6',
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
  event:      'fa-calendar-check',
  quest:      'fa-trophy',
  default:    'fa-map-pin'
};

// ── Globals ───────────────────────────────────
let map, allPlaces = [], allEvents = [], allQuests = [], markers = [], activeCategory = 'all', searchQuery = '';
let routingControl, userCoords = null, selectedPlace = null;

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
    zoomControl: false
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18
  }).addTo(map);

  // Invalidate size to fix rendering issues
  setTimeout(() => map.invalidateSize(), 400);

  // Listen for directions button
  document.getElementById('directionsBtn').onclick = () => startDirections();
  document.getElementById('locateBtn').onclick = () => getMyLocation();
  document.getElementById('savePlaceBtn').onclick = () => toggleSavePlace();
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

// ── Load all data ──────────────────────────────
async function loadAllData() {
  try {
    const [placesRes, eventsRes, questsRes] = await Promise.all([
      apiFetch('/api/places?limit=100'),
      apiFetch('/api/events'),
      apiFetch('/api/quests')
    ]);

    allPlaces = placesRes.data || [];
    allEvents = eventsRes.data || [];
    allQuests = questsRes.data || [];

    renderAll();
  } catch (err) {
    console.error('Failed to load map data:', err);
  }
}

function renderAll() {
  if (!map) return;
  
  // Clear old markers
  markers.forEach(m => map.removeLayer(m));
  markers = [];

  const q = searchQuery.toLowerCase();

  // 1. Render Places
  const filteredPlaces = allPlaces.filter(p => {
    const matchCat = activeCategory === 'all' || p.category === activeCategory;
    const matchQ = !q || p.name.toLowerCase().includes(q) || (p.location?.city || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  filteredPlaces.forEach(p => addMarker(p, p.category));

  // 2. Render Events
  const filteredEvents = allEvents.filter(e => {
    const matchCat = activeCategory === 'all' || activeCategory === 'event';
    const matchQ = !q || e.title.toLowerCase().includes(q) || (e.location?.city || '').toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  filteredEvents.forEach(e => addMarker(e, 'event'));

  // 3. Render Quests
  const filteredQuests = allQuests.filter(qst => {
    const matchCat = (activeCategory === 'all' || activeCategory === 'quest') && qst.location?.coords;
    const matchQ = !q || qst.title.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
  filteredQuests.forEach(qst => addMarker(qst, 'quest'));

  updateSidebar([...filteredPlaces, ...filteredEvents, ...filteredQuests]);
}

function addMarker(item, type) {
  const lat = item.location?.coords?.lat;
  const lng = item.location?.coords?.lng;
  if (!lat || !lng) return;

  const m = L.marker([lat, lng], { icon: makeIcon(type) }).addTo(map);
  const title = item.title || item.name;
  const desc = item.description || '';
  
  m.bindPopup(`
    <div class="map-place-popup">
      <div style="font-family:var(--font-ui);font-size:0.65rem;font-weight:700;text-transform:uppercase;color:${CATEGORY_COLORS[type]};margin-bottom:4px;">${type}</div>
      <div style="font-family:var(--font-ui);font-weight:700;font-size:1rem;margin-bottom:4px;">${title}</div>
      <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:8px;">${item.location?.city || ''}</div>
      <p style="font-size:0.8rem;line-height:1.4;margin-bottom:12px;">${truncate(desc, 100)}</p>
      <button class="btn btn-primary btn-xs" onclick="startDirectionsTo(${lat}, ${lng}, '${title}')">Get Directions</button>
    </div>
  `);

  m.on('click', () => {
    selectedPlace = item;
    showFloatingInfo(item, type);
  });
  markers.push(m);
}

function updateSidebar(items) {
  const list = document.getElementById('placeList');
  const mapList = document.getElementById('mapPlaceList');
  const count = document.getElementById('placeCount');
  
  const html = items.map(p => `
    <div class="place-list-item" onclick="focusPlace('${p._id}', '${p.category ? p.category : 'event'}')">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:4px;">
        <div class="cat-dot" style="background:${CATEGORY_COLORS[p.category] || CATEGORY_COLORS.event}"></div>
        <span style="font-weight:700;font-size:0.9rem;">${p.name || p.title}</span>
      </div>
      <div style="font-size:0.75rem;color:var(--text-muted);">${p.location?.city || ''}</div>
    </div>
  `).join('');

  if (list) list.innerHTML = html;
  if (mapList) mapList.innerHTML = html;
  if (count) count.textContent = `${items.length} items found`;
}

function focusPlace(id, type) {
  let p = allPlaces.find(x => x._id === id);
  if(!p) p = allEvents.find(x => x._id === id);
  if(!p) p = allQuests.find(x => x._id === id);
  
  if (!p) return;
  selectedPlace = p;
  map.flyTo([p.location.coords.lat, p.location.coords.lng], 15);
  showFloatingInfo(p, p.category || type);
}

function showFloatingInfo(item, type) {
  const card = document.getElementById('floatingInfo');
  const imgContainer = document.getElementById('infoImageContainer');
  const img = document.getElementById('infoImage');
  const label = document.getElementById('infoLabel');
  const details = document.getElementById('infoDetails');
  
  document.getElementById('infoName').textContent = item.name || item.title;
  
  let meta = `${capitalize(type)} · ${item.location?.city || ''}`;
  if (type === 'event' && item.date) {
    meta += ` · ${new Date(item.date).toLocaleDateString()}`;
  }
  document.getElementById('infoMeta').textContent = meta;
  
  // Show image if available
  const image = (item.images && item.images.length > 0) ? item.images[0] : (item.image || null);
  if (image) {
    img.src = image;
    imgContainer.style.display = 'block';
  } else {
    imgContainer.style.display = 'none';
  }

  label.textContent = capitalize(type);
  details.textContent = item.description || 'No additional details available.';
  
  card.style.display = 'block';
}

// ── Geolocation ────────────────────────────────
function getMyLocation() {
  if (!navigator.geolocation) return showToast('Geolocation not supported', 'error');
  
  showToast('Locating...', 'info');
  navigator.geolocation.getCurrentPosition(pos => {
    userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
    map.flyTo([userCoords.lat, userCoords.lng], 15);
    
    // Add person marker
    L.circleMarker([userCoords.lat, userCoords.lng], {
      radius: 8, fillOpacity: 1, color: '#fff', weight: 3, fillColor: '#3B82F6'
    }).addTo(map).bindPopup("You are here").openPopup();

  }, err => {
    showToast('Could not get location', 'error');
  });
}

// ── Directions ──────────────────────────────────
function startDirections() {
  if (!selectedPlace) return;
  const lat = selectedPlace.location.coords.lat;
  const lng = selectedPlace.location.coords.lng;
  const title = selectedPlace.name || selectedPlace.title;
  startDirectionsTo(lat, lng, title);
}

let mapClickDirectionsHandler = null;

function startDirectionsTo(destLat, destLng, destTitle) {
  // Switch sidebar view
  document.getElementById('searchContainer').style.display = 'none';
  document.getElementById('directionsRailContainer').style.display = 'block';
  document.getElementById('railEndInput').value = destTitle;

  if (!userCoords) {
    getMyLocation();
  }

  // Clear previous routing
  if (routingControl) map.removeControl(routingControl);

  const startLat = userCoords?.lat || 12.9716;
  const startLng = userCoords?.lng || 77.5946;

  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(startLat, startLng),
      L.latLng(destLat, destLng)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    collapsible: true,
    containerClassName: 'routing-instructions',
    itineraryContainer: document.getElementById('railRoutingContainer'),
    lineOptions: { styles: [{ color: '#F97316', weight: 6, opacity: 0.8 }] }
  }).addTo(map);

  // Listen for manual start input
  const startInput = document.getElementById('railStartInput');
  startInput.onchange = async () => {
    const query = startInput.value;
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data && data.length > 0) {
        const newStart = L.latLng(data[0].lat, data[0].lon);
        routingControl.setWaypoints([newStart, L.latLng(destLat, destLng)]);
        map.flyTo(newStart, 14);
      }
    } catch (err) {
      showToast('Could not find start location', 'error');
    }
  };

  // Map click listener to set start
  if (mapClickDirectionsHandler) map.off('click', mapClickDirectionsHandler);
  mapClickDirectionsHandler = (e) => {
    const newStart = e.latlng;
    routingControl.setWaypoints([newStart, L.latLng(destLat, destLng)]);
    document.getElementById('railStartInput').value = `${newStart.lat.toFixed(5)}, ${newStart.lng.toFixed(5)}`;
    showToast('Start location updated from map', 'success');
  };
  map.on('click', mapClickDirectionsHandler);
}

function exitDirections() {
  document.getElementById('searchContainer').style.display = 'block';
  document.getElementById('directionsRailContainer').style.display = 'none';
  if (routingControl) map.removeControl(routingControl);
  if (mapClickDirectionsHandler) {
    map.off('click', mapClickDirectionsHandler);
    mapClickDirectionsHandler = null;
  }
}

async function toggleSavePlace() {
  if (!selectedPlace || !isLoggedIn()) return showToast('Please login to save', 'error');
  const res = await apiFetch(`/api/places/${selectedPlace._id}/save`, { method: 'POST' });
  if (res.success) {
    showToast(res.message, 'success');
  }
}

// ── Init ───────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initMap();
  loadAllData();
  
  const searchInput = document.getElementById('mapSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderAll();
    });
  }

  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.category;
      renderAll();
    };
  });
});
