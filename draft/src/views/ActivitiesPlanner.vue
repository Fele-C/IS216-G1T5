<template>
    <div class="activities-planner-page">
      <div class="container">
        <h1 class="page-title">Activities Planner</h1>
        <p class="page-subtitle">Plan your week based on weather and preferences</p>
  
        <div class="card planner-card">
          <div class="card-body">
            <h3>Weekly Planning</h3>
  
            <div class="planning-section">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Select Workout Days</label>
                  <div class="days-selector">
                    <button
                      v-for="(day, index) in daysOfWeek"
                      :key="index"
                      @click="toggleDay(index)"
                      class="btn-day"
                      :class="{ selected: selectedDays.includes(index) }"
                    >
                      {{ day }}
                    </button>
                  </div>
                </div>
  
                <div class="col-md-6 mb-3">
                  <label class="form-label">Preferred Activity Type</label>
                  <select v-model="activityType" class="form-select">
                    <option value="">Any</option>
                    <option value="outdoor">Outdoor Only</option>
                    <option value="indoor">Indoor Only</option>
                  </select>
                </div>
              </div>
  
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Target Weekly Calories</label>
                  <input
                    v-model.number="weeklyCalorieGoal"
                    type="number"
                    class="form-control"
                    placeholder="e.g., 3500"
                  />
                </div>
  
                <div class="col-md-6 mb-3">
                  <label class="form-label">Your Location</label>
                  <input
                    v-model="userLocation"
                    type="text"
                    class="form-control"
                    placeholder="Enter your location"
                  />
                </div>
              </div>
  
              <button @click="generatePlan" class="btn btn-generate" :disabled="isGenerating">
                {{ isGenerating ? 'Generating Plan...' : 'Generate Weekly Plan' }}
              </button>
            </div>
  
            <div v-if="generatedPlan.length > 0" class="generated-plan-section mt-4">
              <h4>Your Suggested Weekly Plan</h4>
  
              <div class="plan-list">
                <div
                  v-for="(plan, index) in generatedPlan"
                  :key="index"
                  class="plan-item"
                >
                  <div class="plan-header">
                    <div class="plan-day">
                      <span class="day-label" >{{ getDayName(plan.day_of_week) }}</span>
                      <span class="weather-indicator" :class="plan.is_outdoor ? 'outdoor' : 'indoor'">
                        {{ plan.is_outdoor ? '☀️ Outdoor' : '🏠 Indoor' }}
                      </span>
                    </div>
                    <button
                      @click="viewLocations(plan)"
                      class="btn-view-locations"
                      v-if="plan.is_outdoor"
                    >
                      📍 View Locations
                    </button>
                  </div>
  
                  <div class="plan-details">
                    <h5>{{ plan.activity_name }}</h5>
                    <div class="plan-stats">
                      <span class="stat"><strong>Duration:</strong> {{ plan.duration }} min</span>
                      <br>
                      <span class="stat"><strong>Calories:</strong> {{ plan.estimated_calories }} kcal</span>
                      <br></br>
                      <span class="stat" v-if="plan.location"><strong>Location:</strong> {{ plan.location }}</span>
                    </div>
                  </div>
                </div>
              </div>
  
              <div class="plan-summary">
                <div class="summary-row">
                  <span>Total Workouts:</span>
                  <strong>{{ generatedPlan.length }} days</strong>
                </div>
                <div class="summary-row">
                  <span>Total Calories:</span>
                  <strong>{{ totalPlanCalories }} kcal</strong>
                </div>
              </div>
  
              <button @click="savePlan" class="btn btn-save">Save Plan to Schedule</button>
            </div>
          </div>
        </div>
      </div>
  
      <!-- Location Modal -->
      <div v-if="selectedPlanForLocations" class="modal-overlay" @click="selectedPlanForLocations = null">
        <div class="modal-content" @click.stop>
          <h3>Nearby Locations for {{ selectedPlanForLocations.activity_name }}</h3>
          <div class="locations-list">
            <p class="info-text">
              Use Google Maps or your preferred navigation app to find nearby locations for this activity.
            </p>
            <div class="location-suggestions">
              <div class="location-item"><h5>Parks & Recreation Areas</h5><p>Search for parks and outdoor areas.</p></div>
              <div class="location-item"><h5>Fitness Centers</h5><p>Find gyms and studios near you.</p></div>
              <div class="location-item"><h5>Community Centers</h5><p>Check indoor facilities in your area.</p></div>
            </div>
          </div>
          <button @click="selectedPlanForLocations = null" class="btn btn-close-locations">Close</button>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted, nextTick } from 'vue';
  import { weeklyPlanService } from '../services/weeklyPlanService.js';
  import { apiService } from '../services/apiService.js';
  import { userService } from '../services/userService.js';
  import { supabase } from '../lib/supabase.js';
  
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const selectedDays = ref([]);
  const activityType = ref('');
  const weeklyCalorieGoal = ref(3500);
  const userLocation = ref('');
  const isGenerating = ref(false);
  const generatedPlan = ref([]);
  const selectedPlanForLocations = ref(null);
  const map = ref(null);
  const mapContainer = ref(null);
  
  const totalPlanCalories = computed(() =>
    generatedPlan.value.reduce((sum, plan) => sum + plan.estimated_calories, 0)
  );
  
  const toggleDay = (dayIndex) => {
    const index = selectedDays.value.indexOf(dayIndex);
    if (index > -1) selectedDays.value.splice(index, 1);
    else selectedDays.value.push(dayIndex);
    selectedDays.value.sort((a, b) => a - b);
  };
  
  const getDayName = (num) => daysOfWeek[num - 1] || 'Unknown';
  
  // Fetch Weather via shared service (no Google Maps dependency)
  const getWeatherData = async (location) => {
    const data = await apiService.getWeatherData(location || 'default');
    // Normalize to fields this component expects for filtering
    if (data) {
      return {
        temp: data.temperature,
        uv: data.uvIndex,
        conditions: data.condition,
        isOutdoorSafe: data.isOutdoorSafe
      };
    }
    // Fallback defaults
    return { temp: 28, uv: 4, conditions: 'Sunny', isOutdoorSafe: true };
  };
  
  // Recommend activities
  const recommendActivities = (weatherData) => {
    const isOutdoor = (weatherData && typeof weatherData.temp === 'number')
      ? (weatherData.temp > 20 && weatherData.uv < 8 && weatherData.conditions !== 'Rain')
      : !!weatherData?.isOutdoorSafe;

    const all = [
      { name: 'Running', type: 'outdoor', caloriesPerHour: 600 },
      { name: 'Cycling', type: 'outdoor', caloriesPerHour: 500 },
      { name: 'Yoga', type: 'indoor', caloriesPerHour: 250 },
      { name: 'Gym Workout', type: 'indoor', caloriesPerHour: 400 },
      { name: 'Swimming', type: 'indoor', caloriesPerHour: 450 }
    ];

    // Weather-based selection first
    let filtered = all.filter(a => a.type === (isOutdoor ? 'outdoor' : 'indoor'));
    // Apply user preference if present
    if (activityType.value) {
      filtered = filtered.filter(a => a.type === activityType.value);
    }
    // Ensure non-empty
    if (filtered.length === 0) {
      filtered = activityType.value ? all.filter(a => a.type === activityType.value) : all;
    }
    return filtered;
  };
  
  // Generate weekly plan
  const generatePlan = async () => {
    if (selectedDays.value.length === 0) {
      alert('Please select at least one workout day');
      return;
    }

    try {
      isGenerating.value = true;
      const user = await userService.getCurrentUser();
      const weatherData = await getWeatherData(userLocation.value || 'Singapore');
      const caloriesPerDay = Math.round(weeklyCalorieGoal.value / selectedDays.value.length);
      const activities = recommendActivities(weatherData);

      if (!activities || activities.length === 0) {
        alert('No activities available with the current filters and weather. Try changing preferences.');
        return;
      }

      generatedPlan.value = selectedDays.value.map((i) => {
        const a = activities[i % activities.length];
        return {
          day_of_week: i + 1,
          activity_name: a.name,
          duration: Math.round((caloriesPerDay / a.caloriesPerHour) * 60),
          estimated_calories: caloriesPerDay,
          location: userLocation.value || 'Singapore',
          is_outdoor: a.type === 'outdoor'
        };
      });
    } catch (e) {
      console.error('Failed to generate plan:', e);
      alert('Failed to generate plan. Please try again.');
    } finally {
      isGenerating.value = false;
    }
  };
  
  //  Google Maps: nearby locations
  const viewLocations = async (plan) => {
    selectedPlanForLocations.value = plan;
    await nextTick();
    if (!mapContainer.value) return;
  
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: plan.location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        const center = results[0].geometry.location;
        map.value = new google.maps.Map(mapContainer.value, { center, zoom: 14 });
  
        new google.maps.Marker({ position: center, map: map.value, title: plan.location });
  
        const service = new google.maps.places.PlacesService(map.value);
        service.nearbySearch({
          location: center,
          radius: 3000,
          keyword: plan.activity_name
        }, (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            results.forEach(place => new google.maps.Marker({
              position: place.geometry.location,
              map: map.value,
              title: place.name
            }));
          }
        });
      }
    });
  };
  </script>
  
  
  <style scoped>
  .activities-planner-page {
    min-height: 100vh;
    padding: 3rem 0;
    font-family: "Poppins", sans-serif;
  
   
    background-image: url('https://512pixels.net/downloads/macos-wallpapers-thumbs/10-14-Night-Thumb.jpg');
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
  }
  
  .page-title {
    text-align: center;
    font-size: 2.4rem;
    font-weight: 700;
    color: #ffffff;
    margin-bottom: 0.5rem;
    text-shadow: 2px 2px 4px rgba(207, 231, 248, 0.69);
  }
  
  .page-subtitle {
    text-align: center;
    color: #bef0dd;
    font-size: 1.1rem;
    margin-bottom: 2rem;
    font-weight: bold;
  }
  
  /* Card styling */
  .card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
    background-color: rgba(255, 255, 255, 0.92);
    backdrop-filter: blur(6px);
  }
  
  /* Headings */
  .card-body h3, .card-body h4 {
    color: #4A4A6A;
    font-weight: 700;
    border-bottom: 2px solid #AED9E0;
    padding-bottom: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  /* Buttons */
  .btn-generate, .btn-save {
    width: 100%;
    background-color: #AED9E0;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 700;
    font-size: 1.1rem;
    color: #4A4A6A;
    transition: all 0.3s ease;
  }
  
  .btn-generate:hover, .btn-save:hover {
    background-color: #B8F2E6;
    transform: scale(1.03);
  }
  
  /* Form styles */
  .form-label {
    color: #4A4A6A;
    font-weight: 600;
  }
  
  .form-control, .form-select {
    border: 2px solid #AED9E0;
    border-radius: 8px;
    padding: 0.75rem;
  }
  
  /* Days buttons */
  .days-selector {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }
  
  .btn-day {
    flex: 1;
    min-width: 60px;
    padding: 0.6rem;
    border: 2px solid #AED9E0;
    background-color: white;
    color: #4A4A6A;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .btn-day.selected {
    background-color: #AED9E0;
    color: white;
  }
  
  /* Generated plan section */
  .generated-plan-section {
    border-top: 2px solid #AED9E0;
    padding-top: 2rem;
  }
  
  .plan-item {
    background-color: #e1fffbd4;
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 1rem;
    transition: transform 0.3s ease;
  }
  
  .plan-item:hover {
    transform: translateY(-4px);
  }
  
  /* Modal styling */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 12px;
    width: 90%;
    max-width: 600px;
  }
  </style>
  