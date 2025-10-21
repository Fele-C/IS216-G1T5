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
                    <span class="day-label">{{ getDayName(plan.day_of_week) }}</span>
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
                    <span class="stat">
                      <strong>Duration:</strong> {{ plan.duration }} min
                    </span>
                    <span class="stat">
                      <strong>Calories:</strong> {{ plan.estimated_calories }} kcal
                    </span>
                    <span class="stat" v-if="plan.location">
                      <strong>Location:</strong> {{ plan.location }}
                    </span>
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

      <div v-if="showRecommendedActivities" class="card mt-4">
        <div class="card-body">
          <h3>Recommended Activities</h3>
          <div class="recommendations-list">
            <div
              v-for="(activity, index) in recommendedActivities"
              :key="index"
              class="recommendation-item"
            >
              <div class="activity-info">
                <h5>{{ activity.name }}</h5>
                <p>{{ activity.type === 'outdoor' ? 'Outdoor Activity' : 'Indoor Activity' }}</p>
              </div>
              <div class="activity-stats">
                <span class="badge">{{ activity.caloriesPerHour }} kcal/hr</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedPlanForLocations" class="modal-overlay" @click="selectedPlanForLocations = null">
      <div class="modal-content" @click.stop>
        <h3>Nearby Locations for {{ selectedPlanForLocations.activity_name }}</h3>

        <div class="locations-list">
          <p class="info-text">
            Use Google Maps or your preferred navigation app to find nearby locations for this activity.
          </p>

          <div class="location-suggestions">
            <div class="location-item">
              <h5>Parks & Recreation Areas</h5>
              <p>Search for parks, trails, and outdoor recreation areas near you.</p>
            </div>
            <div class="location-item">
              <h5>Fitness Centers</h5>
              <p>Find gyms, fitness studios, and sports facilities in your area.</p>
            </div>
            <div class="location-item">
              <h5>Community Centers</h5>
              <p>Check local community centers for indoor activities and facilities.</p>
            </div>
          </div>
        </div>

        <button @click="selectedPlanForLocations = null" class="btn btn-close-locations">
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { weeklyPlanService, type WeeklyPlan } from '../services/weeklyPlanService';
import { userService } from '../services/userService';
import { apiService } from '../services/apiService';
import { supabase } from '../lib/supabase';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const selectedDays = ref<number[]>([]);
const activityType = ref('');
const weeklyCalorieGoal = ref(3500);
const userLocation = ref('');
const isGenerating = ref(false);
const generatedPlan = ref<Omit<WeeklyPlan, 'id' | 'created_at' | 'user_id' | 'week_start_date'>[]>([]);
const recommendedActivities = ref<any[]>([]);
const showRecommendedActivities = ref(false);
const selectedPlanForLocations = ref<any>(null);

const totalPlanCalories = computed(() => {
  return generatedPlan.value.reduce((sum, plan) => sum + plan.estimated_calories, 0);
});

const toggleDay = (dayIndex: number) => {
  const index = selectedDays.value.indexOf(dayIndex);
  if (index > -1) {
    selectedDays.value.splice(index, 1);
  } else {
    selectedDays.value.push(dayIndex);
  }
  selectedDays.value.sort((a, b) => a - b);
};

const getDayName = (dayNumber: number) => {
  return daysOfWeek[dayNumber - 1] || 'Unknown';
};

const generatePlan = async () => {
  if (selectedDays.value.length === 0) {
    alert('Please select at least one workout day');
    return;
  }

  isGenerating.value = true;

  const user = await userService.getCurrentUser();

  const weather = await apiService.getWeatherData(userLocation.value || 'default');

  const caloriesPerDay = Math.round(weeklyCalorieGoal.value / selectedDays.value.length);

  const isOutdoor = activityType.value === 'outdoor' ||
    (activityType.value === '' && weather?.isOutdoorSafe);

  const activities = await apiService.getRecommendedActivities(
    weather,
    user?.goal || 'maintain',
    isOutdoor || false
  );

  recommendedActivities.value = activities;
  showRecommendedActivities.value = true;

  const plan: Omit<WeeklyPlan, 'id' | 'created_at' | 'user_id' | 'week_start_date'>[] = [];

  for (const dayIndex of selectedDays.value) {
    const activity = activities[dayIndex % activities.length];
    const duration = Math.round((caloriesPerDay / activity.caloriesPerHour) * 60);

    plan.push({
      day_of_week: dayIndex + 1,
      activity_name: activity.name,
      duration: duration,
      estimated_calories: caloriesPerDay,
      location: userLocation.value || 'To be determined',
      is_outdoor: activity.type === 'outdoor'
    });
  }

  generatedPlan.value = plan;
  isGenerating.value = false;
};

const savePlan = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to save your plan');
    return;
  }

  const weekStart = getWeekStart();
  const weekStartStr = weekStart.toISOString().split('T')[0];

  await weeklyPlanService.deletePlansByWeek(authUser.user.id, weekStartStr);

  const plansToSave = generatedPlan.value.map(plan => ({
    ...plan,
    user_id: authUser.user.id,
    week_start_date: weekStartStr
  }));

  const result = await weeklyPlanService.createMultiplePlans(plansToSave);

  if (result.length > 0) {
    alert('Weekly plan saved successfully!');
    generatedPlan.value = [];
    selectedDays.value = [];
  }
};

const viewLocations = (plan: any) => {
  selectedPlanForLocations.value = plan;
};

const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    weeklyCalorieGoal.value = user.recommended_calories * 7;
  }
});
</script>

<style scoped>
.activities-planner-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #B8F2E6 0%, #FAF3DD 100%);
  padding: 3rem 0;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #5E6472;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #FFA69E;
  margin-bottom: 3rem;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.card-body h3 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #FAF3DD;
}

.card-body h4 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #5E6472;
  margin-bottom: 0.5rem;
}

.days-selector {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-day {
  flex: 1;
  min-width: 60px;
  padding: 0.75rem;
  border: 2px solid #AED9E0;
  background-color: white;
  color: #5E6472;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-day:hover {
  background-color: #FAF3DD;
}

.btn-day.selected {
  background-color: #AED9E0;
  color: white;
  border-color: #AED9E0;
}

.form-control,
.form-select {
  border: 2px solid #FAF3DD;
  border-radius: 8px;
  padding: 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #AED9E0;
  box-shadow: 0 0 0 0.2rem rgba(174, 217, 224, 0.25);
}

.btn-generate {
  width: 100%;
  background-color: #FFA69E;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.btn-generate:hover:not(:disabled) {
  background-color: #ff8a7e;
}

.btn-generate:disabled {
  background-color: #E8E8E8;
  cursor: not-allowed;
}

.generated-plan-section {
  border-top: 2px solid #FAF3DD;
  padding-top: 2rem;
}

.plan-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 2rem;
}

.plan-item {
  background-color: #FAF3DD;
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.plan-item:hover {
  transform: translateX(5px);
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.plan-day {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.day-label {
  font-weight: 700;
  font-size: 1.2rem;
  color: #5E6472;
}

.weather-indicator {
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
}

.weather-indicator.outdoor {
  background-color: #B8F2E6;
  color: #5E6472;
}

.weather-indicator.indoor {
  background-color: #AED9E0;
  color: #5E6472;
}

.btn-view-locations {
  background-color: white;
  border: 2px solid #AED9E0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  color: #5E6472;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-view-locations:hover {
  background-color: #AED9E0;
  color: white;
}

.plan-details h5 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 0.75rem;
}

.plan-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.stat {
  color: #5E6472;
  font-size: 0.95rem;
}

.plan-summary {
  background-color: #B8F2E6;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  color: #5E6472;
  font-size: 1.1rem;
}

.btn-save {
  width: 100%;
  background-color: #AED9E0;
  border: none;
  padding: 1rem;
  border-radius: 8px;
  font-weight: 700;
  font-size: 1.1rem;
  color: white;
  transition: background-color 0.3s ease;
}

.btn-save:hover {
  background-color: #B8F2E6;
}

.recommendations-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #FAF3DD;
  border-radius: 8px;
}

.activity-info h5 {
  margin: 0;
  color: #5E6472;
  font-weight: 700;
}

.activity-info p {
  margin: 0.25rem 0 0;
  color: #888;
  font-size: 0.9rem;
}

.badge {
  background-color: #AED9E0;
  color: #5E6472;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-weight: 600;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.info-text {
  color: #5E6472;
  margin-bottom: 1.5rem;
}

.location-suggestions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.location-item {
  padding: 1rem;
  background-color: #FAF3DD;
  border-radius: 8px;
}

.location-item h5 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.location-item p {
  margin: 0;
  color: #888;
}

.btn-close-locations {
  width: 100%;
  background-color: #AED9E0;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  transition: background-color 0.3s ease;
}

.btn-close-locations:hover {
  background-color: #B8F2E6;
}
</style>
