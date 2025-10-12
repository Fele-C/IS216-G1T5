// Initialize Supabase client
// const SUPABASE_URL = 'https://emrecnjymhvzjcvvcfbn.supabase.co';
// const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtcmVjbmp5bWh2empjdnZjZmJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjAyNTg0NzcsImV4cCI6MjA3NTgzNDQ3N30.sYLnnsARlY56ckqJmnp5DKwY1kVtgtrvEzIUIrjjqb4';

// const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let activityTypes = [];
let allLocations = [];
let currentView = 'activities';
let currentActivitySlug = '';

// DOM Elements
const activityLocationsView = document.getElementById('activityLocationsView');
const allLocationsView = document.getElementById('allLocationsView');
const loadingView = document.getElementById('loadingView');
const activitySelect = document.getElementById('activity-select');
const carouselsContainer = document.getElementById('carouselsContainer');
const backButton = document.getElementById('backButton');
const allLocationsGrid = document.getElementById('allLocationsGrid');
const allLocationsTitle = document.getElementById('allLocationsTitle');
const allLocationsSubtitle = document.getElementById('allLocationsSubtitle');

// Initialize app
async function init() {
  showView('loading');
  await fetchData();
  renderActivitySelector();
  renderCarousels();
  showView('activities');
  setupEventListeners();
}

// Fetch data from Supabase
// async function fetchData() {
//   try {
//     const { data: activities, error: activitiesError } = await supabase
//       .from('activity_types')
//       .select('*')
//       .order('name');

//     if (activitiesError) throw activitiesError;

//     const { data: locations, error: locationsError } = await supabase
//       .from('locations')
//       .select('*');

//     if (locationsError) throw locationsError;

//     activityTypes = activities || [];
//     allLocations = locations || [];
//   } catch (error) {
//     console.error('Error fetching data:', error);
//   }
// }

// Fetch data from local JSON files
async function fetchData() {
  try {
    // Fetch activity types
    const activitiesResp = await fetch('public/data/activities.json');
    const activities = await activitiesResp.json();

    // Fetch locations
    const locationsResp = await fetch('public/data/locations.json');
    const locations = await locationsResp.json();

    activityTypes = activities || [];
    allLocations = locations || [];
  } catch (error) {
    console.error('Error fetching data:', error);
  }
}


// Show specific view
function showView(view) {
  activityLocationsView.classList.add('hidden');
  allLocationsView.classList.add('hidden');
  loadingView.classList.add('hidden');

  if (view === 'activities') {
    activityLocationsView.classList.remove('hidden');
  } else if (view === 'all-locations') {
    allLocationsView.classList.remove('hidden');
  } else if (view === 'loading') {
    loadingView.classList.remove('hidden');
  }
}

// Render activity selector dropdown
function renderActivitySelector() {
  activitySelect.innerHTML = '<option value="">Choose an activity...</option>';
  activityTypes.forEach(activity => {
    const option = document.createElement('option');
    option.value = activity.slug;
    option.textContent = activity.name;
    activitySelect.appendChild(option);
  });
}

// Render all activity carousels
function renderCarousels() {
  carouselsContainer.innerHTML = '';

  activityTypes.forEach(activity => {
    const locations = allLocations.filter(loc => loc.activity_type_id === activity.id);

    if (locations.length > 0) {
      const carouselElement = createCarousel(activity, locations);
      carouselsContainer.appendChild(carouselElement);
    }
  });
}

// Create carousel for an activity
function createCarousel(activity, locations) {
  const carouselDiv = document.createElement('div');
  carouselDiv.className = 'activity-carousel';
  carouselDiv.id = activity.slug;

  const header = document.createElement('div');
  header.className = 'carousel-header';

  const title = document.createElement('h2');
  title.className = 'carousel-title';
  title.textContent = activity.name;

  const showAllBtn = document.createElement('button');
  showAllBtn.className = 'show-all-button';
  showAllBtn.textContent = 'Show all locations';
  showAllBtn.onclick = () => navigateToAllLocations(activity.slug);

  header.appendChild(title);
  header.appendChild(showAllBtn);

  const wrapper = document.createElement('div');
  wrapper.className = 'carousel-wrapper';

  const cardsPerView = 3;
  let currentIndex = 0;

  if (locations.length > cardsPerView) {
    const prevBtn = document.createElement('button');
    prevBtn.className = 'carousel-button prev';
    prevBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 18l-6-6 6-6"></path></svg>';
    prevBtn.onclick = () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarouselPosition(track, currentIndex);
        updateButtons();
      }
    };

    const nextBtn = document.createElement('button');
    nextBtn.className = 'carousel-button next';
    nextBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"></path></svg>';
    nextBtn.onclick = () => {
      if (currentIndex + cardsPerView < locations.length) {
        currentIndex++;
        updateCarouselPosition(track, currentIndex);
        updateButtons();
      }
    };

    wrapper.appendChild(prevBtn);
    wrapper.appendChild(nextBtn);

    function updateButtons() {
      prevBtn.disabled = currentIndex === 0;
      nextBtn.disabled = currentIndex + cardsPerView >= locations.length;
    }
    updateButtons();
  }

  const trackContainer = document.createElement('div');
  trackContainer.className = 'carousel-track';

  const track = document.createElement('div');
  track.className = 'carousel-cards';

  locations.forEach(location => {
    const card = createLocationCard(location);
    track.appendChild(card);
  });

  trackContainer.appendChild(track);
  wrapper.appendChild(trackContainer);

  carouselDiv.appendChild(header);
  carouselDiv.appendChild(wrapper);

  return carouselDiv;
}

// Update carousel position
function updateCarouselPosition(track, index) {
  const offset = index * (100 / 3 + 2);
  track.style.transform = `translateX(-${offset}%)`;
}

// Create location card
function createLocationCard(location) {
  const card = document.createElement('div');
  card.className = 'location-card';

  const inner = document.createElement('div');
  inner.className = 'card-inner';

  const front = document.createElement('div');
  front.className = 'card-front';
  front.innerHTML = `
    <img src="${location.image_url}" alt="${location.name}">
    <div class="card-front-content">
      <h3 class="card-location-name">${location.name}</h3>
      <div class="card-type">
        <svg class="star-icon" viewBox="0 0 24 24">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <span class="type-text">${location.type}</span>
      </div>
    </div>
  `;

  const back = document.createElement('div');
  back.className = 'card-back';

  const facilitiesHTML = location.facilities
    .map(f => `<span class="facility-tag">${f}</span>`)
    .join('');

  back.innerHTML = `
    <h3 class="card-back-title">${location.name}</h3>
    <div class="card-back-header">
      <svg class="star-icon" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span class="type-text">${location.type}</span>
      <span class="region-badge">${location.region}</span>
    </div>
    <p class="card-description">${location.description}</p>
    <div class="card-address-container">
      <svg class="map-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
      <p class="card-address">${location.address}</p>
    </div>
    <div class="card-facilities-section">
      <h4 class="facilities-title">Facilities:</h4>
      <div class="facilities-list">
        ${facilitiesHTML}
      </div>
    </div>
  `;

  inner.appendChild(front);
  inner.appendChild(back);
  card.appendChild(inner);

  card.onclick = () => {
    card.classList.toggle('flipped');
  };

  return card;
}

// Navigate to all locations view
function navigateToAllLocations(slug) {
  currentActivitySlug = slug;
  const activity = activityTypes.find(a => a.slug === slug);
  const locations = allLocations.filter(loc => loc.activity_type_id === activity.id);

  allLocationsTitle.textContent = activity.name;
  allLocationsSubtitle.textContent = `${locations.length} location${locations.length !== 1 ? 's' : ''} available`;

  allLocationsGrid.innerHTML = '';
  locations
    .sort((a, b) => b.type - a.type)
    .forEach(location => {
      const card = createLocationCard(location);
      allLocationsGrid.appendChild(card);
    });

  showView('all-locations');
  window.scrollTo(0, 0);
}

// Navigate back to activities view
function navigateBackToActivities() {
  currentActivitySlug = '';
  showView('activities');
  window.scrollTo(0, 0);
}

// Setup event listeners
function setupEventListeners() {
  activitySelect.addEventListener('change', (e) => {
    const slug = e.target.value;
    if (slug) {
      const element = document.getElementById(slug);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setTimeout(() => {
        activitySelect.value = '';
      }, 100);
    }
  });

  backButton.addEventListener('click', navigateBackToActivities);
}

// Start the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
