<template>
  <div class="profile-page" :class="`theme-${themeColor}`">
    <div class="container">
      <h1 class="page-title">Your Profile</h1>

      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="card profile-card">
            <div class="card-body">
              <h3>Personal Information</h3>
              <form @submit.prevent="saveProfile">
                <div class="mb-3">
                  <label class="form-label">Name</label>
                  <input
                    v-model="profile.name"
                    type="text"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Age Group</label>
                  <select v-model="profile.age_group" class="form-select" required>
                    <option value="">Select age group</option>
                    <option value="18-25">18-25</option>
                    <option value="26-35">26-35</option>
                    <option value="36-45">36-45</option>
                    <option value="46-55">46-55</option>
                    <option value="56+">56+</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Weight (kg)</label>
                  <input
                    v-model.number="profile.weight"
                    type="number"
                    step="0.1"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Height (cm)</label>
                  <input
                    v-model.number="profile.height"
                    type="number"
                    step="0.1"
                    class="form-control"
                    required
                  />
                </div>

                <div class="mb-3">
                  <label class="form-label">Goal</label>
                  <select v-model="profile.goal" class="form-select" required>
                    <option value="maintain">Maintain Weight</option>
                    <option value="lose">Lose Weight</option>
                    <option value="gain">Gain Weight (Bulk Up)</option>
                  </select>
                </div>

                <div class="mb-3">
                  <label class="form-label">Preferred Activity</label>
                  <input
                    v-model="profile.preferred_activity"
                    type="text"
                    class="form-control"
                    placeholder="e.g., Running, Swimming, Yoga"
                  />
                </div>

                <button type="submit" class="btn btn-primary w-100">
                  {{ isNewProfile ? 'Create Profile' : 'Update Profile' }}
                </button>
              </form>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card stats-card">
            <div class="card-body">
              <h3>Health Statistics</h3>

              <div class="stat-item">
                <div class="stat-label">Body Mass Index (BMI)</div>
                <div class="stat-value bmi-value">
                  {{ bmiData.bmi || 'N/A' }}
                </div>
                <div class="stat-category">{{ bmiData.category || 'Calculate your BMI' }}</div>
              </div>

              <div class="stat-item">
                <div class="stat-label">Recommended Daily Calories</div>
                <div class="stat-value">{{ profile.recommended_calories || 2000 }} kcal</div>
              </div>

              <div class="stat-item">
                <div class="stat-label">Current Goal</div>
                <div class="stat-value goal-badge" :class="`goal-${profile.goal}`">
                  {{ goalText }}
                </div>
              </div>
            </div>
          </div>

          <div class="card progress-card mt-4">
            <div class="card-body">
              <h3>Your Progress</h3>

              <div class="view-toggle mb-3">
                <button
                  @click="progressView = 'overall'"
                  :class="{ active: progressView === 'overall' }"
                  class="btn btn-toggle"
                >
                  Overall
                </button>
                <button
                  @click="progressView = 'monthly'"
                  :class="{ active: progressView === 'monthly' }"
                  class="btn btn-toggle"
                >
                  Monthly
                </button>
              </div>

              <div v-if="progressView === 'overall'" class="progress-content">
                <ProgressBar
                  label="Total Calories Burnt"
                  :current-value="overallProgress.totalCalories"
                  :max-value="overallProgress.goalCalories"
                  :color="themeAccentColor"
                />
                <ProgressBar
                  label="Activities Completed"
                  :current-value="overallProgress.activitiesCompleted"
                  :max-value="overallProgress.totalActivities"
                  :color="themeAccentColor"
                />
              </div>

              <div v-else class="progress-content">
                <p class="text-center text-muted">Monthly progress tracking coming soon</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { userService, type User } from '../services/userService';
import { apiService } from '../services/apiService';
import { activityService } from '../services/activityService';
import { supabase } from '../lib/supabase';
import ProgressBar from '../components/ProgressBar.vue';

const profile = ref<Partial<User>>({
  name: '',
  age_group: '',
  weight: 0,
  height: 0,
  bmi: 0,
  goal: 'maintain',
  preferred_activity: '',
  recommended_calories: 2000
});

const bmiData = ref<{ bmi: number; category: string }>({ bmi: 0, category: '' });
const progressView = ref<'overall' | 'monthly'>('overall');
const isNewProfile = ref(true);
const overallProgress = ref({
  totalCalories: 0,
  goalCalories: 14000,
  activitiesCompleted: 0,
  totalActivities: 20
});

const themeColor = computed(() => {
  if (profile.value.goal === 'maintain') return 'green';
  if (profile.value.goal === 'lose') return 'blue';
  return 'red';
});

const themeAccentColor = computed(() => {
  if (profile.value.goal === 'maintain') return '#B8F2E6';
  if (profile.value.goal === 'lose') return '#AED9E0';
  return '#FFA69E';
});

const goalText = computed(() => {
  if (profile.value.goal === 'maintain') return 'Maintain Weight';
  if (profile.value.goal === 'lose') return 'Lose Weight';
  return 'Gain Weight';
});

const calculateBMI = async () => {
  if (profile.value.weight && profile.value.height) {
    const result = await apiService.calculateBMI(
      profile.value.weight,
      profile.value.height
    );
    if (result) {
      bmiData.value = result;
      profile.value.bmi = result.bmi;
    }
  }
};

const calculateRecommendedCalories = () => {
  if (profile.value.weight && profile.value.height && profile.value.age_group) {
    let baseCalories = 2000;
    const weight = profile.value.weight;

    if (profile.value.goal === 'lose') {
      baseCalories = Math.round(weight * 24 - 500);
    } else if (profile.value.goal === 'gain') {
      baseCalories = Math.round(weight * 30 + 500);
    } else {
      baseCalories = Math.round(weight * 27);
    }

    profile.value.recommended_calories = Math.max(1200, baseCalories);
  }
};

const saveProfile = async () => {
  await calculateBMI();
  calculateRecommendedCalories();

  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to save your profile');
    return;
  }

  if (isNewProfile.value) {
    const result = await userService.createUser(profile.value as any);
    if (result) {
      isNewProfile.value = false;
      alert('Profile created successfully!');
    }
  } else {
    const result = await userService.updateUser(authUser.user.id, profile.value);
    if (result) {
      alert('Profile updated successfully!');
    }
  }
};

const loadProgress = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  const startOfYear = new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
  const activities = await activityService.getActivitiesByWeek(authUser.user.id, startOfYear);

  const totalCalories = activities.reduce((sum, act) => sum + act.calories_burnt, 0);
  const completedActivities = activities.filter(act => act.completion_percentage === 100).length;

  overallProgress.value = {
    totalCalories,
    goalCalories: (profile.value.recommended_calories || 2000) * 7,
    activitiesCompleted: completedActivities,
    totalActivities: Math.max(20, completedActivities + 5)
  };
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    profile.value = { ...user };
    isNewProfile.value = false;
    bmiData.value = {
      bmi: user.bmi,
      category: user.bmi < 18.5 ? 'Underweight' : user.bmi < 25 ? 'Normal' : user.bmi < 30 ? 'Overweight' : 'Obese'
    };
    await loadProgress();
  }
});
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  padding: 3rem 0;
  transition: background-color 0.5s ease;
}

.profile-page.theme-green {
  background: linear-gradient(135deg, #B8F2E6 0%, #FAF3DD 100%);
}

.profile-page.theme-blue {
  background: linear-gradient(135deg, #AED9E0 0%, #FAF3DD 100%);
}

.profile-page.theme-red {
  background: linear-gradient(135deg, #FFA69E 0%, #FAF3DD 100%);
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #5E6472;
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

.form-label {
  font-weight: 600;
  color: #5E6472;
}

.form-control,
.form-select {
  border: 2px solid #FAF3DD;
  border-radius: 8px;
  padding: 0.75rem;
  transition: border-color 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #AED9E0;
  box-shadow: 0 0 0 0.2rem rgba(174, 217, 224, 0.25);
}

.btn-primary {
  background-color: #FFA69E;
  border: none;
  padding: 0.75rem;
  font-weight: 600;
  border-radius: 8px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: #ff8a7e;
  transform: translateY(-2px);
}

.stat-item {
  padding: 1.5rem;
  background-color: #FAF3DD;
  border-radius: 12px;
  margin-bottom: 1rem;
  text-align: center;
}

.stat-label {
  font-weight: 600;
  color: #5E6472;
  margin-bottom: 0.5rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: #FFA69E;
}

.bmi-value {
  color: #AED9E0;
}

.stat-category {
  margin-top: 0.5rem;
  color: #888;
  font-style: italic;
}

.goal-badge {
  display: inline-block;
  padding: 0.5rem 1.5rem;
  border-radius: 20px;
  font-size: 1.2rem;
  color: white;
}

.goal-badge.goal-maintain {
  background-color: #B8F2E6;
  color: #5E6472;
}

.goal-badge.goal-lose {
  background-color: #AED9E0;
  color: #5E6472;
}

.goal-badge.goal-gain {
  background-color: #FFA69E;
  color: white;
}

.view-toggle {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-toggle {
  flex: 1;
  padding: 0.5rem 1rem;
  border: 2px solid #AED9E0;
  background-color: white;
  color: #5E6472;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.3s ease;
}

.btn-toggle.active {
  background-color: #AED9E0;
  color: white;
}

.btn-toggle:hover {
  background-color: #B8F2E6;
}

.progress-content {
  margin-top: 1.5rem;
}
</style>
