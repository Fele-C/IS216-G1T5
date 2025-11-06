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
        </div>

        <!-- Info bar: time, weather, location -->
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

    <section id="dashboard" class="dashboard-section">
      <div class="container">
        <h2>Today's Dashboard</h2>

        <!-- Weather and Activities -->
        <div class="row mt-4">
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

                  <label for="user-location" class="form-label fw-bold">Location:</label>
                  <input
                    id="user-location"
                    v-model="userLocation"
                    type="text"
                    class="form-control"
                    placeholder="Enter your location"
                  />

                  <label for="max-distance" class="form-label fw-bold">Max. distance from location:</label>
                  <input
                    id="max-distance"
                    v-model.number="maxDistance"
                    type="number"
                    class="form-control"
                    placeholder="Max distance (km)"
                  />
                  <button @click="fetchNearbyPlaces" class="btn btn-primary">Search</button>
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

                      <div v-if="place.weather" class="place-weather">
                        <span>Weather: {{ place.weather.condition }}, {{ place.weather.temperature }}°C</span>
                        <div class="suitable-for">
                          🏋️ Suitable for:
                        </div>
                        <ul>
                          <li v-for="activity in place.activities" :key="activity.name">{{ activity.name }}</li>
                        </ul>
                      </div>
                      <div v-else class="place-weather">
                        <span>Weather data unavailable</span>
                      </div>



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
import { ref, computed, onMounted } from 'vue';
import { userService } from '../services/userService.js';
import { apiService } from '../services/apiService.js';

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

// Fade-in/fade-out images
const images = [
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80', // Person running in nature
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1920&q=80', // Outdoor yoga/fitness
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1920&q=80', // Mountain hiking
  'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=1920&q=80', // Outdoor workout
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&q=80'  // Trail running
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

  // nearbyPlaces.value = await apiService.getNearbyPlaces(
  //   coords.lat,
  //   coords.lng,
  //   maxDistance.value,
  //   'park'
  // );

  // 2️⃣ Fetch nearby parks first
  const places = await apiService.getNearbyPlaces(
    coords.lat,
    coords.lng,
    maxDistance.value,
    'park'
  );

  // 2️⃣ For each place, fetch weather info
  // const placesWithWeather = await Promise.all(
  //   places.map(async (place) => {
  //     try {
  //       if (place.geometry?.location) {
  //         const weatherData = await apiService.getWeatherData({
  //           lat: place.geometry.location.lat,
  //           lng: place.geometry.location.lng,
  //         });
  //         return { ...place, weather: weatherData };
  //       } else {
  //         // fallback if place doesn't have coords
  //         return { ...place, weather: null };
  //       }
  //     } catch (error) {
  //       console.error('Error fetching weather for place:', place.name, error);
  //       return { ...place, weather: null };
  //     }
  //   })
  // );

  // nearbyPlaces.value = placesWithWeather;

  // console.log('Nearby places fetched:', places); // DEBUG


  function getRandomActivities(activities, count = 2) {
    const shuffled = [...activities].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }


  const placesWithWeather = await Promise.all(
  places.map(async (place) => {
    try {
      // Use your geocode function to get lat/lng
      const coords = await getCoordinatesFromAddress(place.location);

      if (!coords) {
        return { ...place, weather: null };
      }

      const weatherData = await apiService.getWeatherData({
        lat: coords.lat,
        lng: coords.lng,
      });

      // Normalize response
      const normalizedWeather = weatherData
        ? {
            temperature: weatherData.temperature ?? weatherData.temp,
            condition: weatherData.condition ?? weatherData.weather,
            feelsLike: weatherData.feels_like ?? weatherData.feelsLike,
            uvIndex: weatherData.uv_index ?? weatherData.uvIndex,
          }
        : null;

    //   return { ...place, weather: normalizedWeather };
    // } catch (error) {
    //   console.error('Error fetching weather for place:', place.name, error);
    //   return { ...place, weather: null };
    // }
    // Fetch recommended activities based on weather (assuming outdoor)
      const recommendedActivities = normalizedWeather
        ? await apiService.getRecommendedActivities(normalizedWeather, null, true)
        : [];

      // Pick the first 2 activities
      // const activities = recommendedActivities.slice(0, 2);
      const activities = getRandomActivities(recommendedActivities, 2);

      return { ...place, weather: normalizedWeather, activities };
    } catch (error) {
      console.error('Error fetching weather for place:', place.name, error);
      return { ...place, weather: null, activities: [] };
    }
  })
);
placesWithWeather.sort((a, b) => {
  const distA = parseFloat(a.distanceKm);
  const distB = parseFloat(b.distanceKm);
  return distA - distB; // ascending order
});

nearbyPlaces.value = placesWithWeather;



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

  // weather.value = await apiService.getWeatherData('default') || weather.value;
  // recommendedActivities.value = await apiService.getRecommendedActivities(
  //   weather.value,
  //   user?.goal || 'maintain',
  //   weather.value.isOutdoorSafe
  );
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