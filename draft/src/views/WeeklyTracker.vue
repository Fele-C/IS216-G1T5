<template>
  <div class="weekly-tracker-page">
    <div class="container">
      <h1 class="page-title">Weekly Tracker</h1>
      <p class="page-subtitle">Week of {{ weekStartFormatted }}</p>

      <div class="row">
        <div class="col-lg-6 mb-4">
          <div class="tree-section">
            <h3>Tree of the Week</h3>
            <TreeAnimation :growth-percentage="weeklyGrowthPercentage" :tree-color="treeColor" />

            <div class="tree-info">
              <ProgressBar
                label="Weekly Goal Progress"
                :current-value="totalWeeklyCalories"
                :max-value="weeklyGoal"
                :color="progressColor"
                :show-percentage="true"
              />
              <div class="calories-summary">
                <p><strong>{{ totalWeeklyCalories }}</strong> / {{ weeklyGoal }} kcal</p>
                <p class="percentage-text">{{ weeklyGrowthPercentage }}% Complete</p>
              </div>

              <button
                v-if="isWeekComplete"
                @click="saveTree"
                class="btn btn-save-tree"
                :disabled="isTreeSaved"
              >
                {{ isTreeSaved ? 'Tree Saved!' : 'Save Tree to Forest' }}
              </button>
            </div>
          </div>
        </div>

        <div class="col-lg-6 mb-4">
          <div class="card daily-progress-card">
            <div class="card-body">
              <h3>Daily Progress</h3>

              <div class="days-list">
                <div
                  v-for="(day, index) in weekDays"
                  :key="index"
                  class="day-item"
                  :class="{ 
                    completed: (day.calories > 0) || day.hasPlannedActivity, 
                    today: day.isToday,
                    upcoming: day.isUpcoming && !day.isToday,
                    'no-activity': (!day.calories) && (!day.hasPlannedActivity) && !day.isUpcoming && !day.isToday
                  }"
                >
                  <div class="day-header">
                    <span class="day-name">{{ day.name }}</span>
                    <span class="day-date">{{ day.date }}</span>
                  </div>
                  <div class="day-progress">
                    <div v-if="(day.calories > 0 || day.hasPlannedActivity) && !day.isUpcoming" class="water-drops">💧</div>
                    <div v-if="day.isUpcoming && day.hasPlannedActivity" class="upcoming-icon">📅</div>
                    <span class="day-calories">{{ day.calories || 0 }} kcal</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-12">
          <div class="card forest-card">
            <div class="card-body">
              <h3>Your Forest Collection</h3>

              <div v-if="treeCollection.length === 0" class="no-trees">
                <p>No trees yet. Complete your first week to grow your forest!</p>
              </div>

              <div v-else class="trees-grid">
                <div
                  v-for="tree in treeCollection"
                  :key="tree.id"
                  class="tree-card"
                  :class="{ 'fully-grown': tree.is_fully_grown }"
                  @click="selectedTree = tree"
                >
                  <div class="tree-preview">
                    <TreeAnimation
                      :growth-percentage="tree.growth_percentage"
                      :tree-color="tree.color"
                    />
                  </div>
                  <div class="tree-card-info">
                    <h5>{{ tree.tree_name }}</h5>
                    <p class="tree-week">{{ formatTreeWeek(tree.week_start_date) }}</p>
                    <p class="tree-calories">{{ tree.total_calories_burnt }} kcal</p>
                    <span
                      class="tree-badge"
                      :class="{ complete: tree.is_fully_grown }"
                    >
                      {{ tree.is_fully_grown ? '✓ Complete' : '◐ Partial' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="selectedTree" class="modal-overlay" @click="selectedTree = null">
      <div class="modal-content tree-detail-modal" @click.stop>
        <button class="btn-close-modal" @click="selectedTree = null">×</button>
        <h3>{{ selectedTree.tree_name }}</h3>

        <div class="tree-detail-content">
          <TreeAnimation
            :growth-percentage="selectedTree.growth_percentage"
            :tree-color="selectedTree.color"
          />

          <div class="tree-details">
            <div class="detail-row">
              <span class="label">Week:</span>
              <span class="value">{{ formatTreeWeek(selectedTree.week_start_date) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Calories:</span>
              <span class="value">{{ selectedTree.total_calories_burnt }} kcal</span>
            </div>
            <div class="detail-row">
              <span class="label">Growth:</span>
              <span class="value">{{ selectedTree.growth_percentage }}%</span>
            </div>
            <div class="detail-row">
              <span class="label">Size:</span>
              <span class="value">{{ selectedTree.size }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Status:</span>
              <span class="value" :class="{ complete: selectedTree.is_fully_grown }">
                {{ selectedTree.is_fully_grown ? 'Fully Grown' : 'Partially Grown' }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { activityService } from '../services/activityService.js';
import { treeService } from '../services/treeService.js';
import { userService } from '../services/userService.js';
import { supabase } from '../lib/supabase.js';
import TreeAnimation from '../components/TreeAnimation.vue';
import ProgressBar from '../components/ProgressBar.vue';

const weeklyGoal = ref(7000);
const totalWeeklyCalories = ref(0);
const weekDays = ref([]);
const treeCollection = ref([]);
const selectedTree = ref(null);
const isTreeSaved = ref(false);
const treeColor = ref('#ADC178');

const getWeekStart = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const weekStart = getWeekStart();

// Default location (Singapore coordinates)
const latitude = ref(1.3521);
const longitude = ref(103.8198);

const weekStartFormatted = computed(() => {
  return weekStart.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
});

const weeklyGrowthPercentage = computed(() => {
  if (weeklyGoal.value === 0) return 0;
  return Math.min(Math.round((totalWeeklyCalories.value / weeklyGoal.value) * 100), 100);
});

const progressColor = computed(() => {
  if (weeklyGrowthPercentage.value < 30) return '#DDE5B6';
  if (weeklyGrowthPercentage.value < 70) return '#ADC178';
  return '#6C584C';
});

const isWeekComplete = computed(() => {
  const today = new Date();
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return today >= weekEnd;
});

// Helper function to format date as YYYY-MM-DD without timezone issues
const formatDateString = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    date.setHours(0, 0, 0, 0);

    const isToday = date.getTime() === today.getTime();
    const isUpcoming = date.getTime() > today.getTime();

    days.push({
      name: dayNames[i],
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateStr: formatDateString(date),
      calories: 0,
      hasPlannedActivity: false,
      isToday,
      isUpcoming
    });
  }

  return days;
};

const loadWeeklyData = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  weekDays.value = generateWeekDays();
  // Format dates without timezone issues - use the same formatDateString function
  const weekStartStr = formatDateString(weekStart);
  
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndStr = formatDateString(weekEnd);
  
  console.log('📅 WeeklyTracker: Loading data for week:', {
    weekStart: weekStartStr,
    weekEnd: weekEndStr,
    weekDays: weekDays.value.map(d => ({ name: d.name, dateStr: d.dateStr }))
  });

  // 1. Load weekly plan to get goal and planned activities
  console.log('📋 WeeklyTracker: Querying weekly_plan with week_start_date:', weekStartStr);
  const { data: weeklyPlans, error: planError } = await supabase
    .from('weekly_plan')
    .select('*')
    .eq('user_id', authUser.user.id)
    .eq('week_start_date', weekStartStr)
    .order('day_of_week', { ascending: true });

  if (planError) {
    console.error('❌ Error loading weekly plan:', planError);
  } else {
    console.log('📋 WeeklyTracker: Loaded weekly plans:', weeklyPlans);
    
    if (weeklyPlans && weeklyPlans.length > 0) {
      // Calculate weekly goal (sum of all estimated_calories)
      weeklyGoal.value = weeklyPlans.reduce((sum, plan) => sum + (plan.estimated_calories || 0), 0);
      console.log('🎯 WeeklyTracker: Weekly goal calculated:', weeklyGoal.value);
      
      // Mark days with planned activities
      weeklyPlans.forEach(plan => {
        const dayIndex = plan.day_of_week - 1; // day_of_week is 1-7, array is 0-6
        if (dayIndex >= 0 && dayIndex < weekDays.value.length) {
          weekDays.value[dayIndex].hasPlannedActivity = true;
          console.log(`✅ Marked ${weekDays.value[dayIndex].name} (day ${plan.day_of_week}) as having planned activity`);
        }
      });
    } else {
      console.log('⚠️ WeeklyTracker: No weekly plans found for this week');
      // If no weekly plan exists, use user's recommended daily calories * 7 as fallback
      const user = await userService.getCurrentUser();
      if (user && user.recommended_calories) {
        weeklyGoal.value = user.recommended_calories * 7;
        console.log('📊 WeeklyTracker: Using fallback goal from user profile:', weeklyGoal.value);
      } else {
        weeklyGoal.value = 0;
        console.log('⚠️ WeeklyTracker: No weekly plan and no user profile found, setting goal to 0');
      }
    }
  }

  // 2. Load activity_log entries for each day of the week
  // Load all activity logs for the user and filter client-side (more reliable than server-side date range queries)
  console.log('📊 WeeklyTracker: Loading activity_log for date range:', { weekStartStr, weekEndStr });
  
  const { data: allActivityLogs, error: logError } = await supabase
    .from('activity_log')
    .select('date, calories, activity')
    .eq('user_id', authUser.user.id);
  
  if (logError) {
    console.error('❌ Error loading activity logs:', logError);
    console.error('❌ Error details:', {
      message: logError.message,
      details: logError.details,
      hint: logError.hint,
      code: logError.code
    });
    totalWeeklyCalories.value = 0;
  } else {
    console.log('📊 WeeklyTracker: Loaded all activity logs:', allActivityLogs);
    
    // Filter logs by date range client-side
    const activityLogs = (allActivityLogs || []).filter(log => {
      // Normalize date string
      let logDate;
      if (typeof log.date === 'string') {
        logDate = log.date.split('T')[0]; // Remove time part if present
      } else {
        logDate = formatDateString(new Date(log.date));
      }
      // Check if date is within the week range
      return logDate >= weekStartStr && logDate <= weekEndStr;
    });
    
    console.log('📊 WeeklyTracker: Filtered activity logs for this week:', activityLogs);
    
    if (activityLogs && activityLogs.length > 0) {
      // Group calories by date
      const caloriesByDate = {};
      activityLogs.forEach(log => {
        // Normalize date string - handle both string and date objects
        let logDate;
        if (typeof log.date === 'string') {
          // If it's already a string, use it directly (should be YYYY-MM-DD)
          logDate = log.date.split('T')[0]; // Remove time part if present
        } else {
          // If it's a date object, format it
          logDate = formatDateString(new Date(log.date));
        }
        
        if (!caloriesByDate[logDate]) {
          caloriesByDate[logDate] = 0;
        }
        caloriesByDate[logDate] += (Number(log.calories) || 0);
      });

      console.log('📊 WeeklyTracker: Calories grouped by date:', caloriesByDate);

      // Update weekDays with calories from activity_log
      let total = 0;
      weekDays.value.forEach(day => {
        // Match by exact date string
        if (caloriesByDate[day.dateStr]) {
          day.calories = caloriesByDate[day.dateStr];
          total += day.calories;
          console.log(`✅ Matched ${day.name} (${day.dateStr}): ${day.calories} kcal`);
        } else {
          // Log for debugging - show what dates we have vs what we're looking for
          const availableDates = Object.keys(caloriesByDate);
          if (availableDates.length > 0) {
            console.log(`❌ No match for ${day.name} (${day.dateStr}). Available dates:`, availableDates);
          }
        }
      });

      totalWeeklyCalories.value = total;
      console.log('📊 WeeklyTracker: Total weekly calories:', totalWeeklyCalories.value);
    } else {
      console.log('⚠️ WeeklyTracker: No activity logs found for this week');
      totalWeeklyCalories.value = 0;
    }
  }

  // Check if tree already saved (handle 404 errors gracefully)
  try {
    const existingTree = await treeService.getTreeByWeek(authUser.user.id, weekStartStr);
    if (existingTree) {
      isTreeSaved.value = true;
    }
  } catch (error) {
    // Tree table might not exist or have different structure - ignore error
    console.log('ℹ️ Could not check tree status (this is okay if tree_logs table doesn\'t exist)');
  }
};

const saveTree = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to save your tree');
    return;
  }

  const weekStartStr = formatDateString(weekStart);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndStr = formatDateString(weekEnd);

  const isFullyGrown = weeklyGrowthPercentage.value >= 100;
  const size = weeklyGrowthPercentage.value < 40 ? 'small' :
               weeklyGrowthPercentage.value < 80 ? 'medium' : 'large';

  const treeData = {
    user_id: authUser.user.id,
    tree_name: `Week of ${weekStartFormatted.value}`,
    week_start_date: weekStartStr,
    week_end_date: weekEndStr,
    total_calories_burnt: totalWeeklyCalories.value,
    growth_percentage: weeklyGrowthPercentage.value,
    size,
    color: isFullyGrown ? '#ADC178' : '#DDE5B6',
    is_fully_grown: isFullyGrown
  };

  const result = await treeService.createTree(treeData);
  if (result) {
    isTreeSaved.value = true;
    treeCollection.value.unshift(result);
    alert('Tree saved to your forest!');
  }
};

const loadTreeCollection = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  try {
    treeCollection.value = await treeService.getAllTrees(authUser.user.id);
  } catch (error) {
    // Tree table might not exist - ignore error
    console.log('ℹ️ Could not load tree collection (this is okay if tree_logs table doesn\'t exist)');
    treeCollection.value = [];
  }
};

const formatTreeWeek = (weekStartDate) => {
  const date = new Date(weekStartDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(async () => {
  await loadWeeklyData();
  await loadTreeCollection();
});
</script>

<style scoped>
.weekly-tracker-page {
  min-height: 100vh;
  padding: 3rem 0;
  font-family: "Poppins", sans-serif;

  /* Matching background from overview */
  background-image: url('https://512pixels.net/downloads/macos-wallpapers-thumbs/10-14-Night-Thumb.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.weekly-tracker-page > * {
  position: relative;
  z-index: 1;
}

/* Titles */
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

/* Tree of the Week Section */
.tree-section {
  background-color: rgba(225, 255, 251, 0.8);
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.45);
  text-align: center;
  transition: transform 0.3s ease;
}

.tree-section:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
}

.tree-section h3 {
  color: #4A4A6A;
  font-weight: 700;
  margin-bottom: 1.2rem;
  text-shadow: 2px 2px 4px rgba(168, 240, 215, 0.25);
}

.tree-info {
  margin-top: 1.5rem;
}

.calories-summary p {
  font-size: 1.3rem;
  color: #5ba294;
  font-weight: 600;
  margin: 0.5rem 0;
}

.percentage-text {
  font-size: 1.1rem;
  color: #4A4A6A;
  font-weight: 600;
  margin-top: 0.5rem;
}

/* Save tree button */
.btn-save-tree {
  background-color: #AED9E0;
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #4A4A6A;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-save-tree:hover:not(:disabled) {
  background-color: #B8F2E6;
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(94, 100, 114, 0.3);
}

.btn-save-tree:disabled {
  background-color: #d8f0ec;
  opacity: 0.6;
  cursor: not-allowed;
}

/* Daily Progress Section */
.card.daily-progress-card {
  background-color: rgba(225, 255, 251, 0.8);
  border-radius: 15px;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.45);
  padding: 1.5rem;
  transition: transform 0.3s ease;
}

.card.daily-progress-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 22px rgba(0, 0, 0, 0.25);
}

.card-body h3 {
  color: #4A4A6A;
  font-weight: 700;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 3px rgba(186, 226, 214, 0.5);
}

/* Days list */
.days-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-item {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  opacity: 0.7;
  backdrop-filter: blur(6px);
}

.day-item.completed {
  opacity: 1;
  background-color: rgba(174, 217, 224, 0.7); /* Blue for completed days */
  border: 2px solid rgba(174, 217, 224, 0.9);
  box-shadow: 0 2px 8px rgba(174, 217, 224, 0.3);
}

.day-item.today {
  border: 3px solid #FFD700; /* Gold border for today */
  opacity: 1;
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 223, 0, 0.3));
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.4);
  position: relative;
  transform: scale(1.02);
}

.day-item.today::before {
  content: 'TODAY';
  position: absolute;
  top: -8px;
  right: 10px;
  background-color: #FFD700;
  color: #4A4A6A;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
  letter-spacing: 0.5px;
}

.day-item.upcoming {
  opacity: 0.85;
  background-color: rgba(255, 248, 220, 0.6); /* Light yellow/cream for upcoming */
  border: 2px solid rgba(255, 235, 180, 0.8);
}

.day-item.no-activity {
  opacity: 0.4;
  background-color: rgba(200, 200, 200, 0.3);
  filter: grayscale(0.6);
}

.day-name {
  font-weight: 700;
  color: #4A4A6A;
  font-size: 1.1rem;
}

.day-date {
  color: #7a8d85;
  font-size: 0.9rem;
}

.day-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.water-drops {
  font-size: 1.5rem;
  line-height: 1;
}

.upcoming-icon {
  font-size: 1.3rem;
  line-height: 1;
  opacity: 0.8;
}

.day-calories {
  font-weight: 700;
  color: #5ba294;
  font-size: 1.2rem;
  white-space: nowrap;
}

/* Forest Collection Section */
.forest-card {
  background-color: rgba(225, 255, 251, 0.8);
  border-radius: 15px;
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.45);
  padding: 2rem;
}

.forest-card h3 {
  color: #4A4A6A;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(168, 240, 215, 0.25);
}

/* Trees grid */
.trees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tree-card {
  background-color: rgba(255, 255, 255, 0.4);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  text-align: center;
  backdrop-filter: blur(6px);
}

.tree-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
}

.tree-card.fully-grown {
  border-color: #AED9E0;
}

.tree-card-info h5 {
  color: #4A4A6A;
  font-weight: 700;
  margin: 0.5rem 0;
}

.tree-week {
  color: #5ba294;
  font-size: 0.9rem;
}

.tree-calories {
  color: #4A4A6A;
  font-weight: 600;
}

.tree-badge {
  display: inline-block;
  margin-top: 0.4rem;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #DDE5B6;
  color: #4A4A6A;
}

.tree-badge.complete {
  background-color: #AED9E0;
  color: #4A4A6A;
}

/* Modal overlay */
.modal-overlay {
  position: fixed;
  top: 0; left: 0;
  width: 100%; height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex; justify-content: center; align-items: center;
  z-index: 1000;
}

.tree-detail-modal {
  background-color: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  padding: 2rem;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  position: relative;
}

.btn-close-modal {
  position: absolute;
  top: 1rem; right: 1rem;
  background: none;
  border: none;
  font-size: 2rem;
  color: #4A4A6A;
  cursor: pointer;
}

.btn-close-modal:hover {
  color: #5ba294;
}

.tree-detail-modal h3 {
  color: #4A4A6A;
  font-weight: 700;
  text-align: center;
  margin-bottom: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: rgba(240, 255, 250, 0.6);
  border-radius: 8px;
  margin-bottom: 0.5rem;
  backdrop-filter: blur(4px);
}

.detail-row .label {
  font-weight: 600;
  color: #4A4A6A;
}

.detail-row .value {
  color: #5ba294;
  font-weight: 500;
}

.detail-row .value.complete {
  color: #AED9E0;
  font-weight: 700;
}

/* No trees */
.no-trees {
  text-align: center;
  padding: 3rem;
  color: #bef0dd;
  font-style: italic;
}
</style>

