<template>
  <div class="home-page">
    <section class="hero-section">
      <div class="container">
        <div class="greeting">
          <h1>{{ greeting }}</h1>
          <h2>Welcome, {{ userName }}</h2>
        </div>
        <div class="scroll-prompt" @click="scrollToDashboard">
          <p>What do you want to do today?</p>
          <span class="arrow-down">↓</span>
        </div>
      </div>
    </section>

    <section id="dashboard" class="dashboard-section">
      <div class="container">
        <h2>Today's Dashboard</h2>

        <div class="row mt-4">
          <div class="col-md-6 mb-4">
            <div class="card weather-card">
              <div class="card-body">
                <h3>Weather Conditions</h3>
                <div class="weather-info">
                  <div class="weather-icon">☀️</div>
                  <div class="weather-details">
                    <p><strong>Temperature:</strong> {{ weather.temperature }}°C</p>
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
                    <span class="activity-calories">{{ activity.caloriesPerHour }} kcal/hr</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                    </div>
                    <div class="place-details">
                      <span class="badge">{{ place.price }}</span>
                      <span class="badge">{{ place.crowdLevel }}</span>
                      <span class="badge">{{ place.distance }} km</span>
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

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userService } from '../services/userService';
import { apiService } from '../services/apiService';

const userName = ref('User');
const userLocation = ref('');
const maxDistance = ref(5);
const weather = ref({
  temperature: 25,
  uvIndex: 5,
  condition: 'Sunny',
  isOutdoorSafe: true
});
const recommendedActivities = ref<any[]>([]);
const nearbyPlaces = ref<any[]>([]);

const greeting = computed(() => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
});

const scrollToDashboard = () => {
  const dashboard = document.getElementById('dashboard');
  dashboard?.scrollIntoView({ behavior: 'smooth' });
};

const fetchNearbyPlaces = async () => {
  if (!userLocation.value) {
    alert('Please enter your location');
    return;
  }
  nearbyPlaces.value = await apiService.getNearbyPlaces(
    userLocation.value,
    maxDistance.value,
    'park'
  );
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    userName.value = user.name || 'User';
  }

  weather.value = await apiService.getWeatherData('default') || weather.value;
  recommendedActivities.value = await apiService.getRecommendedActivities(
    weather.value,
    user?.goal || 'maintain',
    weather.value.isOutdoorSafe
  );
});
</script>

<style scoped>
.home-page {
  min-height: 100vh;
}

.hero-section {
  background: linear-gradient(135deg, #B8F2E6 0%, #AED9E0 100%);
  min-height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.greeting h1 {
  font-size: 3rem;
  font-weight: 700;
  color: #5E6472;
  margin-bottom: 1rem;
}

.greeting h2 {
  font-size: 2rem;
  color: #FFA69E;
  font-weight: 600;
}

.scroll-prompt {
  margin-top: 3rem;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.scroll-prompt:hover {
  transform: translateY(5px);
}

.scroll-prompt p {
  font-size: 1.5rem;
  color: #5E6472;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.arrow-down {
  font-size: 2rem;
  color: #FFA69E;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(10px);
  }
  60% {
    transform: translateY(5px);
  }
}

.dashboard-section {
  padding: 4rem 0;
  background-color: #FAF3DD;
}

.dashboard-section h2 {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #5E6472;
  margin-bottom: 2rem;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-5px);
}

.card-body h3 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.weather-card {
  background-color: #AED9E0;
}

.weather-info {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.weather-icon {
  font-size: 4rem;
}

.weather-details p {
  margin: 0.5rem 0;
  color: #5E6472;
  font-weight: 500;
}

.recommendations-card {
  background-color: #B8F2E6;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: white;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.activity-item:hover {
  background-color: #FAF3DD;
}

.activity-name {
  font-weight: 600;
  color: #5E6472;
}

.activity-calories {
  color: #FFA69E;
  font-weight: 500;
}

.nearby-places-card {
  background-color: white;
}

.location-input-group {
  display: flex;
  gap: 1rem;
}

.location-input-group input {
  flex: 1;
}

.btn-primary {
  background-color: #FFA69E;
  border: none;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-primary:hover {
  background-color: #ff8a7e;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.place-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #FAF3DD;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.place-item:hover {
  transform: translateX(5px);
}

.place-info h4 {
  margin: 0;
  color: #5E6472;
  font-size: 1.2rem;
}

.place-info p {
  margin: 0.25rem 0 0;
  color: #888;
}

.place-details {
  display: flex;
  gap: 0.5rem;
}

.badge {
  background-color: #AED9E0;
  color: #5E6472;
  padding: 0.4rem 0.8rem;
  border-radius: 12px;
  font-weight: 500;
}
</style>
