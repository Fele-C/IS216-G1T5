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
              <!-- <p> 853 kcal </p> -->
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

              <div v-if="plan.length === 0" class="no-activities">
                <p>No activities for today. Add your first activity!</p>
              </div>

              <div v-else class="activities-list">
                <div
                  v-for="activity in plan"
                  :key="activity.id"
                  class="activity-item"
                >
                  <div class="activity-header">
                    <h4>{{ activity.activity }}</h4>
                    <div class="activity-actions">
                      <button
                        @click="openEditModal(activity)"
                        class="btn-edit"
                        title="Edit activity"
                      >
                        ✏️
                      </button>
                      <button
                        @click="openDeleteModal(activity)"
                        class="btn-delete"
                        title="Delete activity"
                      >
                        ×
                      </button>
                    </div>
                  </div>

                  <div class="activity-details">
                    <span class="detail-badge">
                      <strong>Duration:</strong> {{ activity.duration || 0 }} min
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
                      Progress: {{ activity.completion_percentage || 0 }}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      v-model.number="activity.completion_percentage"
                      @input="updateActivityProgress(activity)"
                      @change="updateActivityProgress(activity)"
                      class="progress-slider"
                    />
                  </div>

                  <div class="calories-display">
                    <span class="calories-burnt">
                      {{ Math.round((activity.calories || 0) * (activity.completion_percentage || 0) / 100) }}
                    </span>
                    <span class="calories-total">/ {{ Math.round(activity.calories) }} kcal</span>
                  </div>
                </div>
                <div v-if="showDeleteModal" class="modal-overlay" @click="showDeleteModal = false">
                  <div class="modal-content" @click.stop>
                    <h3>Confirm Deletion</h3>
                    <p>Are you sure you want to delete this activity?</p>
                    <div class="modal-buttons">
                      <button @click="deleteActivity()" class="btn btn-danger">Delete</button>
                      <button @click="showDeleteModal = false" class="btn btn-secondary">Cancel</button>
                    </div>
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
            <select
              v-model="newActivity.activity_name"
              class="form-select"
              required
            >
              <option value="" disabled>Select an activity</option>
              <option 
                v-for="activity in aList" 
                :key="activity.id" 
                :value="activity.name"
              >
                {{ activity.name }}
              </option>
            </select>
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

    <div v-if="showEditModal" class="modal-overlay" @click="showEditModal = false">
      <div class="modal-content" @click.stop>
        <h3>Edit Activity</h3>
        <form @submit.prevent="saveEditedActivity">
          <div class="mb-3">
            <label class="form-label">Activity Name</label>
            <select
              v-model="editedActivity.activity_name"
              class="form-select"
              required
            >
              <option value="" disabled>Select an activity</option>
              <option 
                v-for="activity in aList" 
                :key="activity.id" 
                :value="activity.name"
              >
                {{ activity.name }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Duration (minutes)</label>
            <input
              v-model.number="editedActivity.duration"
              type="number"
              class="form-control"
              required
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Location</label>
            <input
              v-model="editedActivity.location"
              type="text"
              class="form-control"
            />
          </div>

          <div class="mb-3">
            <label class="form-label">Activity Type</label>
            <select v-model="editedActivity.is_outdoor" class="form-select">
              <option :value="false">Indoor</option>
              <option :value="true">Outdoor</option>
            </select>
          </div>

          <div class="modal-actions">
            <button type="button" @click="showEditModal = false" class="btn btn-cancel">
              Cancel
            </button>
            <button type="submit" class="btn btn-submit">Save Changes</button>
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
//import { apiService } from '../services/apiService.js';
import { supabase } from '../lib/supabase.js';
import WaterJar from '../components/WaterJar.vue';
import ProgressBar from '../components/ProgressBar.vue';

const activities = ref([]);
const plan = ref([]);
const week = ref([]);
const aList = ref([]);
const id = ref("");
const dailyGoal = ref(2000);
const showAddActivity = ref(false);
const totalCaloriesBurnt = ref(0);
const showDeleteModal = ref(false);
const showEditModal = ref(false);
const activityToDelete = ref(null);
const activityToEdit = ref(null);
const editedActivity = ref({
  activity_name: '',
  duration: 30,
  location: '',
  is_outdoor: false
});
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

const loadActivities = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  id.value = authUser.user.id;
  const todayStr = today.toISOString().split('T')[0];
  
  // Get today's day of week (1 = Monday, 7 = Sunday)
  const todayDay = today.getDay();
  const dayOfWeek = todayDay === 0 ? 7 : todayDay; // Convert Sunday (0) to 7

  // Calculate week start (Monday)
  const weekStart = new Date(today);
  const diff = todayDay === 0 ? -6 : 1 - todayDay;
  weekStart.setDate(today.getDate() + diff);
  weekStart.setHours(0, 0, 0, 0);
  const weekStartStr = weekStart.toISOString().split('T')[0];

  aList.value = await activityService.getActivityList();
  console.log("Activity List: ", aList.value);

  // Load activities from weekly_plan for today
  const { data: weeklyPlanActivities, error: weeklyError } = await supabase
    .from('weekly_plan')
    .select('*')
    .eq('user_id', authUser.user.id)
    .eq('week_start_date', weekStartStr)
    .eq('day_of_week', dayOfWeek);

  console.log("Weekly plan activities for today:", weeklyPlanActivities);

  // Load extra activities from daily_activity
  week.value = await activityService.getActivitiesByWeek(authUser.user.id, todayStr);
  console.log("Week data:", week.value);

  let extraActivities = [];
  if (week.value && week.value.length > 0 && week.value[0].id) {
    extraActivities = await activityService.getActivityPlanByDate(week.value[0].id, todayStr);
    console.log("Extra activities:", extraActivities);
  }

  // Load activity logs for progress tracking
  activities.value = await activityService.getCompletedActivitiesByDate(authUser.user.id, todayStr);
  console.log("Activity logs:", activities.value);

  activities.value = activities.value.map(a => ({
    ...a,
    percentage: a.percentage ?? 0
  }));

  // Merge weekly plan activities with extra activities
  const mergedActivities = [];
  
  // Add weekly plan activities
  if (weeklyPlanActivities && weeklyPlanActivities.length > 0) {
    weeklyPlanActivities.forEach(wp => {
      const match = activities.value.find(a => a.activity === wp.activity_name);
      mergedActivities.push({
        id: wp.id,
        activity: wp.activity_name,
        duration: wp.duration,
        calories: wp.estimated_calories,
        location: wp.location,
        is_outdoor: wp.is_outdoor,
        outdoor: wp.is_outdoor,
        completion_percentage: match ? match.percentage : 0,
        source: 'weekly_plan',
        user_id: wp.user_id // Store user_id for reference
      });
    });
  }

  // Add extra activities
  if (extraActivities && extraActivities.length > 0) {
    extraActivities.forEach(extra => {
      const match = activities.value.find(a => a.activity === extra.activity);
      mergedActivities.push({
        id: extra.id,
        activity: extra.activity,
        duration: extra.duration,
        calories: extra.calories,
        location: extra.location,
        is_outdoor: extra.outdoor,
        outdoor: extra.outdoor,
        completion_percentage: match ? match.percentage : 0,
        source: 'daily_activity',
        week: extra.week // Store week reference
      });
    });
  }

  plan.value = mergedActivities;
  totalCaloriesBurnt.value = calculateTotalCalories();
};

const updateActivityProgress = async (activity) => {
  if (activity.id) {
    const match = activities.value.find(a => a.activity === activity.activity);

    const d = Math.round((activity.duration * activity.completion_percentage) / 100);
    const c = Math.round((activity.calories * activity.completion_percentage) / 100);

    // Update local state immediately (optimistic update) for reactive UI
    if (!match) {
      // Create new activity log entry locally first
      const newActivityLog = {
        id: Date.now(), // Temporary ID
        date: today.toISOString().split('T')[0],
        activity: activity.activity,
        duration: d,
        calories: c,
        location: activity.location,
        outdoor: activity.outdoor,
        user_id: id.value,
        percentage: activity.completion_percentage
      };
      activities.value.push(newActivityLog);
      
      // Update total calories immediately
      totalCaloriesBurnt.value = calculateTotalCalories();
      
      // Then save to database
      const savedActivity = await activityService.createActivity({
        date: today.toISOString().split('T')[0],
        activity: activity.activity,
        duration: d,
        calories: c,
        location: activity.location,
        outdoor: activity.outdoor,
        user_id: id.value,
        percentage: activity.completion_percentage
      });

      // Replace temporary entry with saved entry
      if (savedActivity) {
        const tempIndex = activities.value.findIndex(a => a.id === newActivityLog.id);
        if (tempIndex !== -1) {
          activities.value[tempIndex] = savedActivity;
        }
      }

      console.log("UPDATED > User:", id.value, "Returned", activities.value);
      return;
    }

    // Update existing activity log entry locally first
    const activityIndex = activities.value.findIndex(a => a.id === match.id);
    if (activityIndex !== -1) {
      activities.value[activityIndex] = {
        ...activities.value[activityIndex],
        duration: d,
        calories: c,
        percentage: activity.completion_percentage
      };
    }

    // Update total calories immediately
    totalCaloriesBurnt.value = calculateTotalCalories();

    // Then save to database
    await activityService.updateActivity(match.id, {
      duration: d,
      calories: c,
      percentage: activity.completion_percentage
    });
  }
};

const calculateTotalCalories = () => {
  return activities.value.reduce((total, activity) => {
     return total + activity.calories;
   }, 0);
};


const addActivity = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to add activities');
    return;
  }

  const user = await userService.getCurrentUser();
  // const caloriesBurnt = await apiService.getCaloriesBurnt(
  //   newActivity.value.activity_name,
  //   newActivity.value.duration,
  //   user?.weight || 70
  // );
  const match = aList.value.find(a => a.name === newActivity.value.activity_name);
  
  const caloriesBurnt = match.met *3.5 * user.weight / 200 * newActivity.value.duration

  await activityService.extraActivity({
    week : week.value[0].id,
    date : today.toISOString().split('T')[0],
    activity : newActivity.value.activity_name,
    duration : newActivity.value.duration,
    location : newActivity.value.location,
    calories : caloriesBurnt,
    outdoor : newActivity.value.is_outdoor
  });

  showAddActivity.value = false;
  await loadActivities();
};

const deleteActivity = async () => {
  if (!activityToDelete.value) return; // safeguard
  console.log(activityToDelete.value)
  const match = activities.value.find(a => a.activity === activityToDelete.value.activity);

  if (match) {
    const log = await activityService.deleteActivity(match.id, 'activity_log')
  }

  const success = await activityService.deleteActivity(activityToDelete.value.id, 'daily_activity');
  if (success) {
    activities.value = activities.value.filter(a => a.id !== activityToDelete.value.id);
  }
  showDeleteModal.value = false;

  await loadActivities();
};

const openDeleteModal = (activity) => {
  activityToDelete.value = activity;
  showDeleteModal.value = true;
};

const openEditModal = (activity) => {
  activityToEdit.value = activity;
  editedActivity.value = {
    activity_name: activity.activity,
    duration: activity.duration || 30,
    location: activity.location || '',
    is_outdoor: activity.is_outdoor || activity.outdoor || false
  };
  showEditModal.value = true;
};

const saveEditedActivity = async () => {
  if (!activityToEdit.value) return;

  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to edit activities');
    return;
  }

  const user = await userService.getCurrentUser();
  const match = aList.value.find(a => a.name === editedActivity.value.activity_name);
  
  if (!match) {
    alert('Activity not found in list');
    return;
  }

  // Ensure proper data types
  const duration = Math.round(Number(editedActivity.value.duration)) || 0;
  const caloriesBurnt = Math.round(match.met * 3.5 * user.weight / 200 * duration);
  const isOutdoor = editedActivity.value.is_outdoor ? 1 : 0; // Convert boolean to integer (0 or 1)

  console.log('📝 Updating activity with values:', {
    activity_name: editedActivity.value.activity_name,
    duration,
    caloriesBurnt,
    location: editedActivity.value.location,
    isOutdoor,
    source: activityToEdit.value.source
  });

  try {
    // Update based on source
    if (activityToEdit.value.source === 'weekly_plan') {
      // Update weekly_plan entry - include user_id check for RLS
      const { data, error } = await supabase
        .from('weekly_plan')
        .update({
          activity_name: editedActivity.value.activity_name,
          duration: duration,
          estimated_calories: caloriesBurnt,
          location: editedActivity.value.location || null,
          is_outdoor: isOutdoor
        })
        .eq('id', activityToEdit.value.id)
        .eq('user_id', authUser.user.id)
        .select();

      if (error) {
        console.error('Error updating weekly plan activity:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to update activity: ${error.message || 'Unknown error'}\n\nCheck browser console for details.`);
        return;
      }

      if (!data || data.length === 0) {
        alert('Activity not found or you do not have permission to edit it.');
        return;
      }
    } else if (activityToEdit.value.source === 'daily_activity') {
      // Update daily_activity entry
      const { data, error } = await supabase
        .from('daily_activity')
        .update({
          activity: editedActivity.value.activity_name,
          duration: duration,
          calories: caloriesBurnt,
          location: editedActivity.value.location || null,
          outdoor: isOutdoor
        })
        .eq('id', activityToEdit.value.id)
        .select();

      if (error) {
        console.error('Error updating daily activity:', error);
        console.error('Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        alert(`Failed to update activity: ${error.message || 'Unknown error'}\n\nCheck browser console for details.`);
        return;
      }

      if (!data || data.length === 0) {
        alert('Activity not found or you do not have permission to edit it.');
        return;
      }
    } else {
      // Fallback: try to determine source or update both
      console.warn('Activity source not found, attempting to update both tables');
      alert('Unable to determine activity source. Please refresh the page and try again.');
      return;
    }

    // Update activity in plan array
    const index = plan.value.findIndex(a => a.id === activityToEdit.value.id);
    if (index !== -1) {
      plan.value[index] = {
        ...plan.value[index],
        activity: editedActivity.value.activity_name,
        duration: duration,
        calories: caloriesBurnt,
        location: editedActivity.value.location || null,
        is_outdoor: isOutdoor === 1,
        outdoor: isOutdoor === 1
      };
    }

    showEditModal.value = false;
    activityToEdit.value = null;
    await loadActivities();
  } catch (error) {
    console.error('Error saving edited activity:', error);
    alert('An error occurred while saving the activity.');
  }
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    dailyGoal.value = user.recommended_calories;
    console.log("User loaded")
  }
  await loadActivities();
});
</script>

<style scoped>
.daily-tracker-page {
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

/* WaterJar + Goal Section */
.water-jar-section {
  background-color: rgba(197, 243, 251, 0.526);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(6px);
}

.goal-summary {
  text-align: center;
  margin-top: 2rem;
}

.goal-summary h4 {
  color: #4A4A6A;
  font-weight: 700;
  margin-bottom: 1rem;
}

.goal-summary p {
  font-size: 1.4rem;
  color: #4A4A6A;
  font-weight: 600;
  margin-bottom: 1rem;
}

/* Activity Card */
.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
  background-color: rgba(190, 252, 255, 0.466);
  backdrop-filter: blur(6px);
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px solid #AED9E0;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
}

.card-header-section h3 {
  color: #4A4A6A;
  font-weight: 700;
  margin: 0;
}

/* Buttons */
.btn-add {
  background-color: #AED9E0;
  color: #4A4A6A;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 8px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.btn-add:hover {
  background-color: #B8F2E6;
  transform: scale(1.03);
}

.btn-delete {
  background-color: transparent;
  border: none;
  color: #ff6b6b;
  font-size: 1.6rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.btn-delete:hover {
  color: #ff4b4b;
}

/* Activities List */
.activities-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.activity-item {
  background-color: #e1fffbd4;
  border-radius: 12px;
  padding: 1.2rem;
  transition: transform 0.3s ease;
}

.activity-item:hover {
  transform: translateY(-4px);
}

.activity-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.activity-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.btn-edit {
  background-color: transparent;
  border: none;
  color: #4A4A6A;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.3s ease;
  padding: 0.25rem 0.5rem;
}

.btn-edit:hover {
  color: #AED9E0;
  transform: scale(1.1);
}

.activity-header h4 {
  color: #4A4A6A;
  font-weight: 700;
  margin: 0;
}

.activity-details {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.detail-badge {
  background-color: #fff;
  border: 2px solid #AED9E0;
  border-radius: 8px;
  padding: 0.4rem 0.8rem;
  font-size: 0.9rem;
  color: #4A4A6A;
}

.detail-badge.outdoor {
  background-color: #B8F2E6;
}

/* Progress Slider */
.progress-section {
  margin: 1rem 0;
}

.slider-label {
  display: block;
  font-weight: 600;
  color: #4A4A6A;
  margin-bottom: 0.5rem;
}

.progress-slider {
  width: 100%;
  height: 8px;
  border-radius: 4px;
  outline: none;
  background: linear-gradient(to right, #AED9E0 0%, #B8F2E6 100%);
  cursor: pointer;
  position: relative;
  animation: sliderGlow 2.5s ease-in-out infinite;
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  border-radius: 4px;
}

@keyframes sliderGlow {
  0% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.4),
                0 0 12px rgba(255, 255, 255, 0.3);
  }
  50% {
    box-shadow: 0 0 12px rgba(255, 255, 255, 0.8),
                0 0 25px rgba(255, 255, 255, 0.6);
  }
  100% {
    box-shadow: 0 0 6px rgba(255, 255, 255, 0.4),
                0 0 12px rgba(255, 255, 255, 0.3);
  }
}

.progress-slider::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4A4A6A;
  cursor: pointer;
}

.progress-slider::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #4A4A6A;
  cursor: pointer;
  border: none;
}

/* Calories Display */
.calories-display {
  text-align: right;
  margin-top: 1rem;
}

.calories-burnt {
  font-size: 1.8rem;
  font-weight: 700;
  color: #4A4A6A;
}

.calories-total {
  font-size: 1.1rem;
  color: #4A4A6A;
  margin-left: 0.5rem;
}

/* Modal Styling */
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
  box-shadow: 0 6px 18px rgba(255, 255, 255, 0.2);
}

.modal-content h3 {
  color: #4A4A6A;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

/* Form Styling */
.form-label {
  color: #4A4A6A;
  font-weight: 600;
}

.form-control, .form-select {
  border: 2px solid #AED9E0;
  border-radius: 8px;
  padding: 0.75rem;
}

/* Modal Buttons */
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
  color: #4A4A6A;
  transition: background-color 0.3s ease;
}

.btn-cancel:hover {
  background-color: #d0d0d0;
}

.btn-submit {
  flex: 1;
  background-color: #AED9E0;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-weight: 700;
  color: #4A4A6A;
  transition: all 0.3s ease;
}

.btn-submit:hover {
  background-color: #B8F2E6;
  transform: scale(1.03);
}

/* No Activities */
.no-activities {
  text-align: center;
  padding: 3rem;
  color: #4A4A6A;
  font-style: italic;
}

</style>
