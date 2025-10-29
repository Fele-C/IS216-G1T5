<template>
  <div class="profile-page" :class="`theme-${themeColor}`">
    <div class="container">
      <h1 class="page-title">Your Profile</h1>

      <div class="row">
        <div class="col-lg-6 mb-3">
          <div class="card stats-card">
            <div class="card-body">
              <div class="card-header-section">
                <h3>Health Statistics</h3>
                <button @click="showEditModal = true" class="btn btn-edit">
                  <span>✏️</span> Edit Profile
                </button>
              </div>

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
        </div>

        <div class="col-lg-6 mb-3">
          <div class="card progress-card">
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

      <div class="row">
        <div class="col-12">
          <div class="card bmi-meter-card">
            <div class="card-body">
              <h3>BMI Status</h3>
              
              <!-- BMI Meter Scale -->
              <div class="bmi-meter-container">
                <div class="bmi-meter">
                  <div class="bmi-scale">
                    <div class="bmi-section underweight" title="Underweight (< 18.5)">
                      <span class="section-label">Underweight</span>
                    </div>
                    <div class="bmi-section normal" title="Normal (18.5 - 24.9)">
                      <span class="section-label">Normal</span>
                    </div>
                    <div class="bmi-section overweight" title="Overweight (25 - 29.9)">
                      <span class="section-label">Overweight</span>
                    </div>
                    <div class="bmi-section obese" title="Obese (30 - 34.9)">
                      <span class="section-label">Obese</span>
                    </div>
                    <div class="bmi-section severely-obese" title="Severely Obese (≥ 35)">
                      <span class="section-label">Severely Obese</span>
                    </div>
                  </div>
                  <div v-if="bmiData.bmi" class="bmi-indicator" :style="{ left: getBMIPosition + '%' }">
                    <div class="indicator-value">{{ bmiData.bmi }}</div>
                    <div class="indicator-arrow"></div>
                  </div>
                </div>
                <div class="bmi-range-labels">
                  <span>0</span>
                  <span>18.5</span>
                  <span>25</span>
                  <span>30</span>
                  <span>35</span>
                  <span>40+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Edit Profile Modal -->
    <div v-if="showEditModal" class="modal-overlay" @click.self="showEditModal = false">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Edit Profile</h3>
          <button @click="showEditModal = false" class="btn-close">&times;</button>
        </div>
        <form @submit.prevent="saveProfile">
          <div class="modal-body">
            <div class="mb-3">
              <label class="form-label">Name</label>
              <input
                v-model="profile.name"
                type="text"
                class="form-control"
                required
              />
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Age</label>
                <input
                  v-model.number="profile.age"
                  type="number"
                  class="form-control"
                  placeholder="25"
                  min="13"
                  max="120"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Gender</label>
                <select v-model="profile.gender" class="form-select" required>
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            <div class="row">
              <div class="col-md-6 mb-3">
                <label class="form-label">Weight (kg)</label>
                <input
                  v-model.number="profile.weight"
                  type="number"
                  step="0.1"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6 mb-3">
                <label class="form-label">Height (cm)</label>
                <input
                  v-model.number="profile.height"
                  type="number"
                  step="0.1"
                  class="form-control"
                  required
                />
              </div>
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
              <select v-model="profile.preferred_activity" class="form-select" required>
                <option value="">Select preferred activity</option>
                <option value="running">Running</option>
                <option value="walking">Walking</option>
                <option value="cycling">Cycling</option>
                <option value="swimming">Swimming</option>
                <option value="gym">Gym/Weight Training</option>
                <option value="yoga">Yoga</option>
                <option value="dancing">Dancing</option>
                <option value="sports">Sports</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showEditModal = false" class="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              {{ isNewProfile ? 'Create Profile' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { userService } from '../services/userService.js';
import { apiService } from '../services/apiService.js';
import { activityService } from '../services/activityService.js';
import { supabase } from '../lib/supabase.js';
import ProgressBar from '../components/ProgressBar.vue';

const profile = ref({
  name: '',
  age: 0,
  gender: '',
  weight: 0,
  height: 0,
  bmi: 0,
  goal: 'maintain',
  preferred_activity: '',
  recommended_calories: 2000
});

const bmiData = ref({ bmi: 0, category: '' });
const progressView = ref('overall');
const isNewProfile = ref(true);
const showEditModal = ref(false);
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

const getBMIPosition = computed(() => {
  if (!bmiData.value.bmi) return 0;
  const bmi = bmiData.value.bmi;
  
  // Map BMI value to percentage position on the scale (0-40 range)
  // Each section represents a portion of the scale
  let position;
  
  if (bmi < 18.5) {
    // Underweight section: 0-18.5 (20% of scale)
    position = (bmi / 18.5) * 20;
  } else if (bmi < 25) {
    // Normal section: 18.5-25 (20% of scale, starting at 20%)
    position = 20 + ((bmi - 18.5) / (25 - 18.5)) * 20;
  } else if (bmi < 30) {
    // Overweight section: 25-30 (20% of scale, starting at 40%)
    position = 40 + ((bmi - 25) / (30 - 25)) * 20;
  } else if (bmi < 35) {
    // Obese section: 30-35 (20% of scale, starting at 60%)
    position = 60 + ((bmi - 30) / (35 - 30)) * 20;
  } else {
    // Severely Obese section: 35+ (20% of scale, starting at 80%)
    // Cap at 40 for display purposes
    const cappedBMI = Math.min(bmi, 40);
    position = 80 + ((cappedBMI - 35) / (40 - 35)) * 20;
  }
  
  // Ensure position is between 0 and 100
  return Math.min(Math.max(position, 0), 100);
});

const calculateBMI = async () => {
  if (profile.value.weight && profile.value.height && profile.value.age && profile.value.gender) {
    const result = await apiService.calculateBMI(
      profile.value.weight,
      profile.value.height,
      profile.value.age,
      profile.value.gender
    );
    if (result) {
      bmiData.value = {
        bmi: result.bmi,
        category: result.category
      };
      profile.value.bmi = result.bmi;
      
      // If API returns BMR, use it for calorie calculation
      if (result.bmr && result.bmr > 0) {
        let recommendedCalories;
        if (profile.value.goal === 'lose') {
          recommendedCalories = Math.round(result.bmr * 1.2 - 500);
        } else if (profile.value.goal === 'gain') {
          recommendedCalories = Math.round(result.bmr * 1.2 + 500);
        } else {
          recommendedCalories = Math.round(result.bmr * 1.2);
        }
        profile.value.recommended_calories = Math.max(1200, recommendedCalories);
      } else {
        // Fallback to manual calculation if BMR not available
        calculateRecommendedCalories();
      }
    }
  }
};

const calculateRecommendedCalories = () => {
  if (profile.value.weight && profile.value.height && profile.value.age) {
    let baseCalories = 2000;
    const weight = profile.value.weight;
    const height = profile.value.height;
    const age = profile.value.age;
    const gender = profile.value.gender;

    // Mifflin-St Jeor Equation for BMR
    let bmr;
    if (gender === 'male') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) + 5;
    } else if (gender === 'female') {
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 161;
    } else {
      // Default to average
      bmr = (10 * weight) + (6.25 * height) - (5 * age) - 78;
    }

    // Adjust based on goal
    if (profile.value.goal === 'lose') {
      baseCalories = Math.round(bmr * 1.2 - 500); // Sedentary activity - 500 cal deficit
    } else if (profile.value.goal === 'gain') {
      baseCalories = Math.round(bmr * 1.2 + 500); // Sedentary activity + 500 cal surplus
    } else {
      baseCalories = Math.round(bmr * 1.2); // Maintenance
    }

    profile.value.recommended_calories = Math.max(1200, baseCalories);
  }
};

const saveProfile = async () => {
  try {
    // Calculate BMI and calories before saving
    await calculateBMI();
    calculateRecommendedCalories();

    const { data: authUser } = await supabase.auth.getUser();
    if (!authUser.user) {
      alert('Please log in to save your profile');
      return;
    }

    // Prepare the data to update
    const updateData = {
      name: profile.value.name,
      age: profile.value.age,
      gender: profile.value.gender,
      weight: profile.value.weight,
      height: profile.value.height,
      bmi: profile.value.bmi,
      goal: profile.value.goal,
      preferred_activity: profile.value.preferred_activity,
      recommended_calories: profile.value.recommended_calories
    };

    if (isNewProfile.value) {
      const result = await userService.createUser(updateData);
      if (result) {
        isNewProfile.value = false;
        showEditModal.value = false;
        
        // Update BMI category display
        bmiData.value = {
          bmi: result.bmi,
          category: result.bmi < 18.5 ? 'Underweight' : result.bmi < 25 ? 'Normal' : result.bmi < 30 ? 'Overweight' : 'Obese'
        };
        
        alert('Profile created successfully!');
      } else {
        alert('Failed to create profile. Please try again.');
      }
    } else {
      const result = await userService.updateUser(authUser.user.id, updateData);
      if (result) {
        showEditModal.value = false;
        
        // Update the profile with the returned data
        profile.value = { ...result };
        
        // Update BMI category display
        bmiData.value = {
          bmi: result.bmi,
          category: result.bmi < 18.5 ? 'Underweight' : result.bmi < 25 ? 'Normal' : result.bmi < 30 ? 'Overweight' : 'Obese'
        };
        
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile. Please try again.');
      }
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    alert('An error occurred while saving your profile.');
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
  padding: 0.5rem 0 0.5rem 0;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: #5E6472;
  margin-bottom: 0.5rem;
}

.card {
  border: none;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  background-color: white;
  height: 100%;
}

.card-body {
  padding: 0.85rem;
}

.stats-card,
.progress-card {
  height: 100%;
}

.card-body h3 {
  color: #5E6472;
  font-weight: 700;
  font-size: 1.05rem;
  margin-bottom: 0.6rem;
  padding-bottom: 0.4rem;
  border-bottom: 2px solid #FAF3DD;
}

.card-header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.card-header-section h3 {
  margin-bottom: 0.6rem;
}

.form-label {
  font-weight: 600;
  color: #5E6472;
  font-size: 0.8rem;
  margin-bottom: 0.25rem;
}

.form-control,
.form-select {
  border: 2px solid #FAF3DD;
  border-radius: 6px;
  padding: 0.4rem;
  font-size: 0.85rem;
  transition: border-color 0.3s ease;
}

.form-control:focus,
.form-select:focus {
  border-color: #AED9E0;
  box-shadow: 0 0 0 0.15rem rgba(174, 217, 224, 0.25);
}

.btn-primary {
  background-color: #FFA69E;
  border: none;
  padding: 0.5rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-primary:hover {
  background-color: #ff8a7e;
  transform: translateY(-2px);
}

.stat-item {
  padding: 0.6rem;
  background-color: #FAF3DD;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  text-align: center;
}

.stat-label {
  font-weight: 600;
  color: #5E6472;
  font-size: 0.85rem;
  margin-bottom: 0.2rem;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: #FFA69E;
}

.bmi-value {
  color: #AED9E0;
}

.stat-category {
  margin-top: 0.25rem;
  font-size: 0.85rem;
  color: #888;
  font-style: italic;
}

.goal-badge {
  display: inline-block;
  padding: 0.35rem 0.9rem;
  border-radius: 12px;
  font-size: 0.9rem;
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
  gap: 0.5rem;
  justify-content: center;
}

.btn-toggle {
  flex: 1;
  padding: 0.4rem 0.6rem;
  border: 2px solid #AED9E0;
  background-color: white;
  color: #5E6472;
  border-radius: 6px;
  font-size: 0.85rem;
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
  margin-top: 0.4rem;
}

.mb-3 {
  margin-bottom: 0.5rem !important;
}

.mb-4 {
  margin-bottom: 0.6rem !important;
}

.mt-4 {
  margin-top: 0.6rem !important;
}

.btn-edit {
  background-color: #FFA69E;
  border: none;
  color: white;
  padding: 0.45rem 0.8rem;
  font-weight: 600;
  font-size: 0.8rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.35rem;
  transition: background-color 0.3s ease, transform 0.2s ease;
  cursor: pointer;
  white-space: nowrap;
}

.btn-edit:hover {
  background-color: #ff8a7e;
  transform: translateY(-2px);
}

.btn-edit span {
  font-size: 0.95rem;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 0.75rem;
}

.modal-content {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  max-width: 550px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 2px solid #FAF3DD;
}

.modal-header h3 {
  margin: 0;
  color: #5E6472;
  font-size: 1.1rem;
  font-weight: 700;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.75rem;
  color: #5E6472;
  cursor: pointer;
  padding: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: background-color 0.3s ease;
}

.btn-close:hover {
  background-color: #FAF3DD;
}

.modal-body {
  padding: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  padding: 0.75rem 1rem;
  border-top: 2px solid #FAF3DD;
}

.btn-secondary {
  background-color: #e1e5e9;
  border: none;
  color: #5E6472;
  padding: 0.5rem 1rem;
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 6px;
  transition: background-color 0.3s ease;
  cursor: pointer;
}

.btn-secondary:hover {
  background-color: #d0d4d9;
}

/* BMI Bar Meter Styles */
.bmi-meter-card {
  height: fit-content;
}

.bmi-meter-container {
  margin: 0.4rem 0;
  padding: 0.65rem;
  background-color: white;
  border-radius: 8px;
}

.bmi-meter {
  position: relative;
  width: 100%;
  margin-bottom: 0.35rem;
}

.bmi-scale {
  display: flex;
  width: 100%;
  height: 38px;
  border-radius: 19px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.bmi-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
  cursor: pointer;
  position: relative;
}

.bmi-section:hover {
  transform: scaleY(1.05);
}

.bmi-section.underweight {
  background: linear-gradient(135deg, #4A90E2 0%, #5BA3F5 100%);
}

.bmi-section.normal {
  background: linear-gradient(135deg, #50C878 0%, #66D98C 100%);
}

.bmi-section.overweight {
  background: linear-gradient(135deg, #FFD700 0%, #FDE047 100%);
}

.bmi-section.obese {
  background: linear-gradient(135deg, #FFA500 0%, #FFB84D 100%);
}

.bmi-section.severely-obese {
  background: linear-gradient(135deg, #E74C3C 0%, #F25C54 100%);
}

.section-label {
  color: white;
  font-size: 0.65rem;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  text-align: center;
  padding: 0 0.18rem;
  line-height: 1.15;
}

.bmi-indicator {
  position: absolute;
  top: -36px;
  transform: translateX(-50%);
  z-index: 10;
  transition: left 0.5s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.indicator-value {
  background-color: #5E6472;
  color: white;
  padding: 0.28rem 0.55rem;
  border-radius: 5px;
  font-weight: 700;
  font-size: 0.85rem;
  text-align: center;
  margin-bottom: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  white-space: nowrap;
}

.indicator-arrow {
  width: 0;
  height: 0;
  border-left: 8px solid transparent;
  border-right: 8px solid transparent;
  border-top: 11px solid #5E6472;
}

.bmi-range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.4rem;
  padding: 0 0.25rem;
}

.bmi-range-labels span {
  font-size: 0.75rem;
  color: #888;
  font-weight: 500;
}

@media (max-width: 768px) {
  .card-header-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }

  .btn-edit {
    width: 100%;
    justify-content: center;
  }

  .section-label {
    font-size: 0.6rem;
  }

  .bmi-scale {
    height: 38px;
  }
}
</style>
