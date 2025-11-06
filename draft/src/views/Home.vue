<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero-section" @click="scrollToDashboard">
      <!-- Background Image -->
      <transition name="fade" mode="out-in">
        <div
          class="hero-bg"
          :key="currentImage"
          :style="{ backgroundImage: `url(${images[currentImage]})` }"
        ></div>
      </transition>

      <div class="container">
        <!-- Greeting -->
        <div class="greeting">
          <h1>{{ greeting }}</h1>
          <h2>Welcome, {{ userName }}</h2>
        </div>

        <!-- Info bar -->
        <div class="info-bar">
          <span>⏰ {{ currentTime }}</span>
          <span>☀️ {{ weather.condition }}, {{ weather.temperature }}°C</span>
          <span>📍 {{ userLocation || 'Unknown' }}</span>
        </div>

        <!-- Scroll prompt -->
        <div class="scroll-prompt">
          <p>What do you want to do today?</p>
          <span class="arrow-down">↓</span>
        </div>
      </div>
    </section>

    <!-- Dashboard Section -->
    <section id="dashboard" class="dashboard-section">
      <div class="container">
        <h2>Today's Dashboard</h2>

        <!-- Weather + Recommendations -->
        <div class="row mt-4">
          <!-- Weather Card -->
          <div class="col-md-6 mb-4">
            <div class="card weather-card">
              <div class="card-body">
                <h3>Weather Conditions</h3>
                <div class="weather-info">
                  <div class="weather-icon">☀️</div>
                  <div class="weather-details">
                    <p><strong>Temperature:</strong> {{ weather.temperature }}°C</p>
                    <p><strong>Feels Like:</strong> {{ weather.feelsLike }}°C</p>
                    <p><strong>UV Index:</strong> {{ weather.uvIndex }}</p>
                    <p><strong>Condition:</strong> {{ weather.condition }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Recommendations Card -->
          <div class="col-md-6 mb-4">
            <div class="card recommendations-card">
              <div class="card-body">
                <h3>Recommended Activities</h3>
                <div class="activity-list">
                  <div
                    v-for="(activity, index) in recommendedActivities"
                    :key="index"
                    class="activity-item"
                  >
                    <span class="activity-name">{{ activity.name }}</span>
                    <br>
                    <span class="activity-calories">{{ activity.caloriesPerHour }} kcal/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Nearby Places -->
        <div class="row mt-4">
          <div class="col-12">
            <div class="card nearby-places-card">
              <div class="card-body">
                <h3>Nearby Outdoor Activities</h3>

                <div class="location-input-group mb-3">
                  <input
                    v-model="userLocation"
                    type="text"
                    class="form-control"
                    placeholder="Enter your location"
                  />
                  <input
                    v-model.number="maxDistance"
                    type="number"
                    class="form-control"
                    placeholder="Max distance (km)"
                  />
                  <button @click="fetchNearbyPlaces" class="btn btn-primary">
                    Search
                  </button>
                </div>

                <div class="places-list">
                  <div
                    v-for="(place, index) in nearbyPlaces"
                    :key="index"
                    class="place-item"
                  >
                    <div class="place-info">
                      <h4>{{ place.name }}</h4>
                      <p>{{ place.location }}</p>
                    </div>
                    <div class="place-details">
                      <span class="badge">{{ place.price }}</span>
                      <span class="badge">{{ place.crowdLevel }}</span>
                      <span class="badge">{{ place.distanceKm }} km</span>
                    </div>
                  </div>
                </div>

                <!-- Mini Map -->
                <div id="mini-map" class="mini-map mt-4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userService } from '../services/userService.js';
import { apiService } from '../services/apiService.js';
import axios from 'axios';

const userName = ref('User');
const userLocation = ref('');
const maxDistance = ref(5);
const weather = ref({ temperature: 25, uvIndex: 5, condition: 'Sunny', isOutdoorSafe: true });
const recommendedActivities = ref([]);
const nearbyPlaces = ref([]);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
});

// Background Images
const images = [
  'https://img.freepik.com/premium-photo/warm-sunlight-filters-into-gym-casting-golden-glow-floor-exercise-equipment-creatin_667565-6746.jpg?semt=ais_hybrid&w=740&q=80',
  'https://dam.mediacorp.sg/image/upload/s--wcP6p1N0--/c_crop,h_705,w_1255,x_1,y_130/c_fill,g_auto,h_676,w_1200/f_auto,q_auto/v1/mediacorp/cna/image/2022/10/05/istock-1158362998.jpg?itok=3tn34nsU',
  'https://static.thehoneycombers.com/wp-content/uploads/sites/2/2013/10/running-trails-singapore.png',
  'https://cassette.sphdigital.com.sg/image/womensweekly/943b36691d1a2d5f959686c7bc398984dba47361119b985fe9ea2b0cf93a1983?w=1000&q=85',
  'https://www.ricemedia.co/wp-content/uploads/2023/11/Ricemedia_Unusual-Morning-Routines-Kim_2_Marc-Clarence-1.jpg',
  'https://offloadmedia.feverup.com/secretsingapore.co/wp-content/uploads/2024/01/10232958/YOGA-SEEDS-1-1024x683.jpg',
];
const currentImage = ref(0);
onMounted(() => {
  setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length;
  }, 5000);
});

// Current Time
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 60000);

const scrollToDashboard = () => {
  document.getElementById('dashboard')?.scrollIntoView({ behavior: 'smooth' });
};

// Google Maps
const GOOGLE_PLACES_API_KEY = 'AIzaSyD6-tkzFCWwwXU2B8ZntgiUq6ZgVYVOTrw';
let map;

async function loadGoogleMaps() {
  if (window.google && window.google.maps) return;
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_PLACES_API_KEY}`;
    script.async = true;
    document.head.appendChild(script);
    script.onload = resolve;
  });
}

async function initMap(lat, lng, places = []) {
  await loadGoogleMaps();
  const mapOptions = {
    center: { lat, lng },
    zoom: 13,
    mapTypeControl: false,
    streetViewControl: false,
  };
  map = new google.maps.Map(document.getElementById("mini-map"), mapOptions);

  // User marker
  new google.maps.Marker({
    position: { lat, lng },
    map,
    title: "You are here",
    icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
  });

  const bounds = new google.maps.LatLngBounds();
  bounds.extend({ lat, lng });

  // Place markers
  places.forEach((place) => {
    const placeLat = place.latitude || place.lat || place.geometry?.location?.lat;
    const placeLng = place.longitude || place.lng || place.geometry?.location?.lng;
    if (placeLat && placeLng) {
      new google.maps.Marker({
        position: { lat: placeLat, lng: placeLng },
        map,
        title: place.name,
        icon: "http://maps.google.com/mapfiles/ms/icons/green-dot.png",
      });
      bounds.extend({ lat: placeLat, lng: placeLng });
    }
  });

  map.fitBounds(bounds);
}

// Location Helpers
async function getUserCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject('Geolocation not supported');
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err.message)
    );
  });
}

async function getAddressFromCoordinates(lat, lng) {
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { latlng: `${lat},${lng}`, key: GOOGLE_PLACES_API_KEY }
    });
    return res.data.results[0]?.formatted_address || 'Unknown location';
  } catch (err) {
    console.error(err); return 'Unknown location';
  }
}

async function getCoordinatesFromAddress(address) {
  try {
    const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: { address, key: GOOGLE_PLACES_API_KEY }
    });
    return res.data.results[0]?.geometry.location || null;
  } catch (err) {
    console.error(err); return null;
  }
}

// Fetch nearby places
const fetchNearbyPlaces = async () => {
  if (!userLocation.value) { alert('Please enter your location'); return; }
  const coords = await getCoordinatesFromAddress(userLocation.value);
  if (!coords) { alert('Could not find location coordinates'); return; }

  nearbyPlaces.value = await apiService.getNearbyPlaces(
    coords.lat, coords.lng, maxDistance.value, 'park'
  );
  await initMap(coords.lat, coords.lng, nearbyPlaces.value);
};

// On mount
onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) userName.value = user.name || 'User';

  try {
    const coords = await getUserCurrentLocation();
    userLocation.value = await getAddressFromCoordinates(coords.lat, coords.lng);
    weather.value = await apiService.getWeatherData(coords) || weather.value;
    nearbyPlaces.value = await apiService.getNearbyPlaces(coords.lat, coords.lng, maxDistance.value, 'park');
    await initMap(coords.lat, coords.lng, nearbyPlaces.value);
  } catch {
    weather.value = await apiService.getWeatherData('default') || weather.value;
  }

  recommendedActivities.value = await apiService.getRecommendedActivities(weather.value, user?.goal || 'maintain', weather.value.isOutdoorSafe);
});
</script>

<style scoped>
.home-page {
  font-family: "Poppins", sans-serif;
}
.mini-map {
  width: 100%;
  height: 300px;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
}
/* Full-screen hero section */
.hero-section {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  text-align: center;
  cursor: pointer;
  color: white;
  position: relative;
  padding: 0 1rem;
  backdrop-filter: blur(4px);
  background-color: #18171e; 
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: brightness(0.65);
  transition: opacity 1s ease-in-out;
  z-index: -1;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter-from, .fade-leave-to { opacity: 0; }
.fade-enter-to, .fade-leave-from { opacity: 1; }

/* Greeting text */
.greeting h1 {
  font-size: 4rem;
  font-weight: 700;
  color: #f7f7f7;
  margin-bottom: 0.75rem;
  text-shadow: 0 0 6px rgba(216, 226, 251, 0.596);
}

.greeting h2 {
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 1px 1px 6px rgba(0, 0, 0, 0.3);
}

/* Info bar under greeting (time, weather, location) */
.info-bar {
  margin-top: 0.75rem;
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  font-weight: 500;
  font-size: 1rem;
  color: #f2fffa;
}

.info-bar span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

/* Scroll prompt */
.scroll-prompt {
  position: absolute;
  bottom: 3rem;
  left: 40%;               /* center horizontally */
  transform: translateX(-50%); /* offset by half its width */
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: bounce 2s infinite;
}

.scroll-prompt p {
  margin: 0;               /* remove default margin */
  color: #bef0dd;
  text-align: center;
  font-weight: 500;
}

.arrow-down {
  font-size: 2rem;
  color: #bef0dd;
}

/* Bounce animation */
@keyframes bounce {
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(10px); }
  60% { transform: translateY(5px); }
}

/* Dashboard section */
.dashboard-section {
  padding: 3rem 1rem;
  background-color: #0e0d27;
}

.dashboard-section h2 {
  text-align: center;
  font-size: 1.75rem;
  font-weight: 700;
  color: #f5f4ff;
  margin-bottom: 1.25rem;
}

/* Standard card style for dashboard items */
.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
  background-color: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  font-family: "Poppins", sans-serif;
}

.card-body h3 {
  color: #4A4A6A;
  font-weight: 700;
  border-bottom: 2px solid #AED9E0;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

/* Activity items */
.activity-item {
  background-color: #e1fffbd4;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
  font-weight: 600;
  color: #4A4A6A;
}

.activity-item:hover {
  transform: translateY(-3px);
}

/* Nearby places items */
.place-item {
  background-color: #e1fffbd4;
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
  font-weight: 500;
  color: #4A4A6A;
}

.place-item:hover {
  transform: translateY(-3px);
}

.badge {
  background-color: #AED9E0;
  color: #4A4A6A;
  padding: 0.4rem 0.8rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.85rem;
}

/* Buttons (standardized) */
.btn-primary, .btn-generate, .btn-save {
  background-color: #AED9E0;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  color: #4A4A6A;
  transition: all 0.3s ease;
}

.btn-primary:hover, .btn-generate:hover, .btn-save:hover {
  background-color: #B8F2E6;
  transform: scale(1.03);
}

</style>