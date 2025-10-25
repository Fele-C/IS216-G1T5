<template>
  <div class="daily-tracker-page">
    <div class="container">
      <h1 class="page-title">Daily Tracker</h1>
      <p class="page-subtitle">{{ formattedDate }}</p>

      <div class="row">
        <div class="col-lg-5 mb-4">
          <div class="water-jar-section">
            <WaterJar :current-calories="totalCaloriesBurnt" :goal-calories="dailyGoal" />
            <div class="goal-summary">
              <h4>Today's Goal</h4>
              <p>{{ totalCaloriesBurnt }} / {{ dailyGoal }} kcal</p>
              <ProgressBar
                label="Daily Progress"
                :current-value="totalCaloriesBurnt"
                :max-value="dailyGoal"
                color="#134074"
              />
            </div>
          </div>
        </div>

        <div class="col-lg-7">
          <div class="card activities-card">
            <div class="card-body">
              <div class="card-header-section">
                <h3>Today's Activities</h3>
                <button @click="showAddActivity = true" class="btn btn-add">
                  + Add Activity
                </button>
              </div>

              <div v-if="activities.length === 0" class="no-activities">
                <p>No activities for today. Add your first activity!</p>
              </div>

              <div v-else class="activities-list">
                <div
                  v-for="activity in activities"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-header">
                    <h4>{{ activity.activity_name }}</h4>
                    <button
                      @click="deleteActivity(activity.id)"
                      class="btn-delete"
                      title="Delete activity"
                    >
                      ×
                    </button>
                  </div>

                  <div class="activity-details">
                    <span class="detail-badge">
                      <strong>Duration:</strong> {{ activity.duration }} min
                    </span>
                    <span class="detail-badge">
                      <strong>Location:</strong> {{ activity.location || 'Not specified' }}
                    </span>
                    <span class="detail-badge" :class="{ outdoor: activity.is_outdoor }">
                      {{ activity.is_outdoor ? '🌤️ Outdoor' : '🏠 Indoor' }}
                    </span>
                  </div>

                  <div class="progress-section">
                    <label class="slider-label">
                      Progress: {{ activity.completion_percentage }}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      v-model.number="activity.completion_percentage"
                      @input="updateActivityProgress(activity)"
                      class="progress-slider"
                    />
                  </div>

                  <div class="calories-display">
                    <span class="calories-burnt">
                      {{ Math.round((activity.calories_burnt * activity.completion_percentage) / 100) }}
                    </span>
                    <span class="calories-total">/ {{ activity.calories_burnt }} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showAddActivity" class="modal-overlay" @click="showAddActivity = false">
      <div class="modal-content" @click.stop>
        <h3>Add New Activity</h3>
        <form @submit.prevent="addActivity">
          <div class="mb-3">
            <label class="form-label">Activity Name</label>
            <input
              v-model="newActivity.activity_name"
              type="text"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Duration (minutes)</label>
            <input
              v-model.number="newActivity.duration"
              type="number"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Location</label>
            <input
              v-model="newActivity.location"
              type="text"
              class="form-control"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Activity Type</label>
            <select v-model="newActivity.is_outdoor" class="form-select">
              <option :value="false">Indoor</option>
              <option :value="true">Outdoor</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showAddActivity = false" class="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-submit">Add Activity</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { activityService } from '../services/activityService.js';
import { userService } from '../services/userService.js';
import { apiService } from '../services/apiService.js';
import { supabase } from '../lib/supabase.js';
import WaterJar from '../components/WaterJar.vue';
import ProgressBar from '../components/ProgressBar.vue';

const activities = ref([]);
const dailyGoal = ref(2000);
const showAddActivity = ref(false);
const newActivity = ref({
  activity_name: '',
  duration: 30,
  location: '',
  is_outdoor: false
});

const today = new Date();
const formattedDate = computed(() => {
  return today.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
});

const totalCaloriesBurnt = computed(() => {
  return activities.value.reduce((total, activity) => {
    return total + Math.round((activity.calories_burnt * activity.completion_percentage) / 100);
  }, 0);
});

const loadActivities = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  const todayStr = today.toISOString().split('T')[0];
  activities.value = await activityService.getActivitiesByDate(authUser.user.id, todayStr);
};

const updateActivityProgress = async (activity) => {
  if (activity.id) {
    await activityService.updateActivity(activity.id, {
      completion_percentage: activity.completion_percentage
    });
  }
};

const addActivity = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to add activities');
    return;
  }

  const user = await userService.getCurrentUser();
  const caloriesBurnt = await apiService.getCaloriesBurnt(
    newActivity.value.activity_name,
    newActivity.value.duration,
    user?.weight || 70
  );

  const activityData = {
    user_id: authUser.user.id,
    activity_name: newActivity.value.activity_name,
    activity_date: today.toISOString().split('T')[0],
    duration: newActivity.value.duration,
    calories_burnt: caloriesBurnt,
    location: newActivity.value.location,
    is_outdoor: newActivity.value.is_outdoor,
    completion_percentage: 0
  };

  const result = await activityService.createActivity(activityData);
  if (result) {
    activities.value.push(result);
    showAddActivity.value = false;
    newActivity.value = {
      activity_name: '',
      duration: 30,
      location: '',
      is_outdoor: false
    };
  }
};

const deleteActivity = async (activityId) => {
  if (confirm('Are you sure you want to delete this activity?')) {
    const success = await activityService.deleteActivity(activityId);
    if (success) {
      activities.value = activities.value.filter(a => a.id !== activityId);
    }
  }
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    dailyGoal.value = user.recommended_calories;
  }
  await loadActivities();
});
</script>

<style scoped>
.daily-tracker-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #EEF4ED 0%, #FAF3DD 100%);
  padding: 3rem 0;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #134074;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #5E6472;
  margin-bottom: 3rem;
}

.water-jar-section {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.goal-summary {
  text-align: center;
  margin-top: 2rem;
}

.goal-summary h4 {
  color: #134074;
  font-weight: 700;
  margin-bottom: 1rem;
}

.goal-summary p {
  font-size: 1.5rem;
  color: #5E6472;
  font-weight: 600;
  margin-bottom: 1rem;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #FAF3DD;
}

.card-header-section h3 {
  color: #134074;
  font-weight: 700;
  margin: 0;
}

.btn-add {
  background-color: #8DA9C4;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  transition: background-color 0.3s ease;
}

.btn-add:hover {
  background-color: #134074;
}

.no-activities {
  text-align: center;
  padding: 3rem;
  color: #888;
  font-style: italic;
}

.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  padding: 1.5rem;
  background-color: #FAF3DD;
  border-radius: 12px;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateX(5px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-header h4 {
  color: #134074;
  font-weight: 700;
  margin: 0;
}

.btn-delete {
  background-color: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
  transition: color 0.3s ease;
}

.btn-delete:hover {
  color: #ff5252;
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-badge {
  background-color: white;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #5E6472;
}

.detail-badge.outdoor {
  background-color: #B8F2E6;
}

.progress-section {
  margin: 1rem 0;
}

.slider-label {
  display: block;
  font-weight: 600;
  color: #134074;
  margin-bottom: 0.5rem;
}

.progress-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  outline: none;
  background: linear-gradient(to right, #134074 0%, #8DA9C4 100%);
  cursor: pointer;
}

.progress-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #134074;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #134074;
  cursor: pointer;
  border: none;
}

.calories-display {
  text-align: right;
  margin-top: 1rem;
}

.calories-burnt {
  font-size: 1.8rem;
  font-weight: 700;
  color: #134074;
}

.calories-total {
  font-size: 1.2rem;
  color: #5E6472;
  margin-left: 0.5rem;
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
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  color: #134074;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.form-label {
  font-weight: 600;
  color: #5E6472;
}

.form-control,
.form-select {
  border: 2px solid #FAF3DD;
  border-radius: 8px;
  padding: 0.75rem;
}

.form-control:focus,
.form-select:focus {
  border-color: #8DA9C4;
  box-shadow: 0 0 0 0.2rem rgba(141, 169, 196, 0.25);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.btn-cancel {
  flex: 1;
  background-color: #E8E8E8;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  color: #5E6472;
  transition: background-color 0.3s ease;
}

.btn-cancel:hover {
  background-color: #d0d0d0;
}

.btn-submit {
  flex: 1;
  background-color: #134074;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 600;
  color: white;
  transition: background-color 0.3s ease;
}

.btn-submit:hover {
  background-color: #0B2545;
}
</style>
