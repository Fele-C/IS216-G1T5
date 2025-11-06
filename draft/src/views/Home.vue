<template>
  <div class="home-page">
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
          <h2> Time to turn those goals into gains! </h2>
        </div>

        <!-- Info bar: time, weather, location -->
        <div class="info-bar">
          <span>⏰ {{ currentTime }}</span>
          <span>☀️ {{ weather.condition }}</span>
          <span>🌡️ Feels Like: {{ weather.feelsLike }}°C</span>
          <span>🕶️ UV Index: {{ weather.uvIndex }}</span>
          <span>📍 {{ userLocation || 'Unknown' }}</span>
        </div>

        <!-- Scroll prompt -->
        <div class="scroll-prompt">
          <p>What do you want to do today?</p>
          <span class="arrow-down">↓</span>
        </div>
      </div>
    </section>

    <section id="dashboard" class="dashboard-section">
      <div class="container">
        <h2>Today's Dashboard</h2>

        <!-- Activities + Nearby Places side by side -->
        <div class="row mt-4">
          <div class="col-md-6 mb-4">
            <div class="card recommendations-card">
              <div class="card-body">
                <h3>Recommended Activities</h3>
                <div class="activity-carousel">
                  <div class="carousel-container">
                    <button 
                      @click="previousActivity" 
                      class="carousel-btn carousel-btn-prev"
                    >
                      ‹
                    </button>
                    <div class="carousel-track" :style="{ transform: `translateX(-${currentActivityIndex * 100}%)` }">
                      <div
                        v-for="(activity, index) in recommendedActivities"
                        :key="index"
                        class="activity-card"
                      >
                        <div class="activity-card-content">
                          <h4 class="activity-name">{{ activity.name }}</h4>
                          <p class="activity-encouragement">{{ getEncouragement(activity.name) }}</p>
                          <p class="activity-calories">{{ activity.caloriesPerHour }} kcal/hr</p>
                        </div>
                      </div>
                    </div>
                    <button 
                      @click="nextActivity" 
                      class="carousel-btn carousel-btn-next"
                    >
                      ›
                    </button>
                  </div>
                  <div class="carousel-indicators">
                    <span
                      v-for="(activity, index) in recommendedActivities"
                      :key="index"
                      class="indicator"
                      :class="{ active: currentActivityIndex === index }"
                      @click="currentActivityIndex = index"
                    ></span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6 mb-4">
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
                  <button @click="fetchNearbyPlaces" class="btn btn-primary">Search</button>
                </div>

                <div class="places-list scrollable">
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { userService } from '../services/userService.js';
import { apiService } from '../services/apiService.js';

const userName = ref('User');
const userLocation = ref('');
const maxDistance = ref(5);
const weather = ref({ temperature: 25, feelsLike: 27, uvIndex: 5, condition: 'Sunny', isOutdoorSafe: true });
const recommendedActivities = ref([]);
const nearbyPlaces = ref([]);
const currentActivityIndex = ref(0);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
});

// Fade-in/fade-out images (served from public/images)
const images = [
  '/images/men-exercise-by-running-road-bridge.jpg',
  '/images/young-sportive-couple-doing-yoga-fitness-people-summer-park.jpg',
  '/images/hiker-friends-forest.jpg',
  '/images/full-shot-family-cycling-outdoors.jpg',
  '/images/fit-swimmer-training-swimming-pool-professional-male-swimmer-inside-swimming-pool.jpg'
];
const currentImage = ref(0);
onMounted(() => {
  setInterval(() => {
    currentImage.value = (currentImage.value + 1) % images.length;
  }, 5000);
});

// Current time
const currentTime = ref(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
setInterval(() => {
  currentTime.value = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}, 60000);

const scrollToDashboard = () => {
  const dashboard = document.getElementById('dashboard');
  dashboard?.scrollIntoView({ behavior: 'smooth' });
};

import axios from 'axios';

const GOOGLE_PLACES_API_KEY = 'AIzaSyCdAB6Z2sTSA41CStyvIQgj5IPa8OiqIFg';


async function getUserCurrentLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation not supported');
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (err) => reject(err.message)
    );
  });
}

// ADD THIS in Home.vue (with your other helper functions)
async function getAddressFromCoordinates(lat, lng) {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        latlng: `${lat},${lng}`,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!response.data.results.length) return 'Unknown location';

    return response.data.results[0].formatted_address; // returns the readable address
  } catch (error) {
    console.error('Error reverse geocoding:', error);
    return 'Unknown location';
  }
}


async function getCoordinatesFromAddress(address) {
  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json`, {
      params: {
        address: address,
        key: GOOGLE_PLACES_API_KEY
      }
    });

    if (!response.data.results.length) {
      return null;
    }

    return response.data.results[0].geometry.location;
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    return null;
  }
}

const fetchNearbyPlaces = async () => {
  if (!userLocation.value) {
    alert('Please enter your location');
    return;
  }

  const coords = await getCoordinatesFromAddress(userLocation.value);
  if (!coords) {
    alert('Could not find location coordinates');
    return;
  }

  nearbyPlaces.value = await apiService.getNearbyPlaces(
    coords.lat,
    coords.lng,
    maxDistance.value,
    'park'
  );
};

// Activity carousel functions
const nextActivity = () => {
  if (recommendedActivities.value.length === 0) return;
  currentActivityIndex.value = (currentActivityIndex.value + 1) % recommendedActivities.value.length;
};

const previousActivity = () => {
  if (recommendedActivities.value.length === 0) return;
  currentActivityIndex.value = currentActivityIndex.value === 0 
    ? recommendedActivities.value.length - 1 
    : currentActivityIndex.value - 1;
};

// Auto-scroll carousel
let carouselInterval = null;

const startCarousel = () => {
  if (carouselInterval) clearInterval(carouselInterval);
  if (recommendedActivities.value.length <= 1) return;
  
  carouselInterval = setInterval(() => {
    nextActivity();
  }, 4000); // Change slide every 4 seconds
};

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval);
    carouselInterval = null;
  }
};

// Get encouragement message for activity
const getEncouragement = (activityName) => {
  const encouragements = {
    'Running': 'Push your limits and feel the burn!',
    'Jogging': 'Every step brings you closer to your goals!',
    'Cycling': 'Pedal your way to a healthier you!',
    'Swimming': 'Dive in and make a splash!',
    'Hiking': 'Explore nature and conquer new heights!',
    'Walking': 'A journey of a thousand miles begins with one step!',
    'Yoga': 'Find your inner peace and strength!',
    'Tennis': 'Serve, volley, and ace your fitness goals!',
    'Basketball': 'Shoot for the stars and score big!',
    'Soccer': 'Kick your way to better health!',
    'Volleyball': 'Spike your way to success!',
    'Badminton': 'Rally on and stay active!',
    'Dancing': 'Move to the rhythm and feel alive!',
    'Rowing': 'Row your way to peak fitness!',
    'Skating': 'Glide smoothly toward your goals!',
    'Golf': 'Swing into a healthier lifestyle!'
  };
  
  // Try to find a match (case-insensitive)
  const normalizedName = activityName?.toLowerCase() || '';
  for (const [key, value] of Object.entries(encouragements)) {
    if (normalizedName.includes(key.toLowerCase())) {
      return value;
    }
  }
  
  return 'You\'ve got this! Keep moving forward!';
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) userName.value = user.name || 'User';

  try {
    const coords = await getUserCurrentLocation();
    // userLocation.value = `${coords.lat},${coords.lng}`; // optional display
    userLocation.value = await getAddressFromCoordinates(coords.lat, coords.lng);
    weather.value = await apiService.getWeatherData(coords) || weather.value;
    nearbyPlaces.value = await apiService.getNearbyPlaces(coords.lat, coords.lng, maxDistance.value, 'park');
  } catch (error) {
    console.warn('Could not get user location, falling back to default.');
    weather.value = await apiService.getWeatherData('default') || weather.value;
  }

  recommendedActivities.value = await apiService.getRecommendedActivities(
    weather.value,
    user?.goal || 'maintain',
    weather.value.isOutdoorSafe
  );
  
  // Start carousel after activities are loaded
  startCarousel();
});

// Cleanup on unmount
onUnmounted(() => {
  stopCarousel();
});
</script>

<style scoped>
.home-page {
  font-family: "Poppins", sans-serif;
  overflow-x: hidden; /* prevent horizontal scroll */
}

/* Full-screen hero section */
.hero-section {
  width: 100%;
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
  flex-wrap: wrap;
  gap: 1rem;
  font-weight: 500;
  font-size: 0.95rem;
  color: #f2fffa;
}

.info-bar span {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  white-space: nowrap;
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

/* Recommendations card */
.recommendations-card {
  height: calc(100vh - 400px);
  min-height: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.recommendations-card .card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

/* Activity Carousel */
.activity-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.carousel-container {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  flex: 1;
  min-height: 0;
}

.carousel-track {
  display: flex;
  transition: transform 0.5s ease-in-out;
  width: 100%;
}

.activity-card {
  min-width: 100%;
  height: 100%;
  background-color: #e1fffbd4;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
}

/* removed image styles as carousel shows text-only cards */

.activity-card-content {
  padding: 0;
  text-align: center;
  width: 100%;
}

.activity-card-content .activity-name {
  font-size: 2rem;
  font-weight: 700;
  color: #4A4A6A;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.activity-card-content .activity-encouragement {
  font-size: 1.1rem;
  font-weight: 500;
  color: #5ba294;
  margin-bottom: 1.5rem;
  font-style: italic;
  line-height: 1.4;
}

.activity-card-content .activity-calories {
  font-size: 1.25rem;
  font-weight: 600;
  color: #4A4A6A;
  margin: 0;
}

.carousel-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(174, 217, 224, 0.9);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 2rem;
  color: #4A4A6A;
  cursor: pointer;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  font-weight: bold;
  line-height: 1;
}

.carousel-btn:hover:not(:disabled) {
  background-color: #AED9E0;
  transform: translateY(-50%) scale(1.1);
}


.carousel-btn-prev {
  left: 10px;
}

.carousel-btn-next {
  right: 10px;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(174, 217, 224, 0.5);
  cursor: pointer;
  transition: all 0.3s ease;
}

.indicator.active {
  background-color: #AED9E0;
  transform: scale(1.2);
}

.indicator:hover {
  background-color: #B8F2E6;
}

/* Nearby places card */
.nearby-places-card {
  height: calc(100vh - 400px);
  min-height: 400px;
  max-height: 600px;
  display: flex;
  flex-direction: column;
}

.nearby-places-card .card-body {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.places-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  padding-right: 0.5rem;
}

.places-list::-webkit-scrollbar {
  width: 6px;
}

.places-list::-webkit-scrollbar-track {
  background: rgba(174, 217, 224, 0.2);
  border-radius: 10px;
}

.places-list::-webkit-scrollbar-thumb {
  background: #AED9E0;
  border-radius: 10px;
}

.places-list::-webkit-scrollbar-thumb:hover {
  background: #B8F2E6;
}

/* Nearby places items */
.place-item {
  background-color: #e1fffbd4;
  border-radius: 12px;
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
  font-weight: 500;
  color: #4A4A6A;
  font-size: 0.9rem;
}

.place-item h4 {
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
}

.place-item p {
  font-size: 0.85rem;
  margin: 0;
  color: #7a8d85;
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