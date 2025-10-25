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
              />
              <div class="calories-summary">
                <p><strong>{{ totalWeeklyCalories }}</strong> / {{ weeklyGoal }} kcal</p>
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
                  :class="{ completed: day.calories > 0, today: day.isToday }"
                >
                  <div class="day-header">
                    <span class="day-name">{{ day.name }}</span>
                    <span class="day-date">{{ day.date }}</span>
                  </div>
                  <div class="day-progress">
                    <div class="water-drops">💧</div>
                    <span class="day-calories">{{ day.calories }} kcal</span>
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

const generateWeekDays = () => {
  const days = [];
  const today = new Date();
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);

    const isToday = date.toDateString() === today.toDateString();

    days.push({
      name: dayNames[i],
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      dateStr: date.toISOString().split('T')[0],
      calories: 0,
      isToday
    });
  }

  return days;
};

const loadWeeklyData = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  weekDays.value = generateWeekDays();

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const activities = await activityService.getActivitiesByWeek(authUser.user.id, weekStartStr);

  let total = 0;
  activities.forEach(activity => {
    const dayIndex = weekDays.value.findIndex(d => d.dateStr === activity.activity_date);
    if (dayIndex !== -1) {
      const caloriesForActivity = Math.round(
        (activity.calories_burnt * activity.completion_percentage) / 100
      );
      weekDays.value[dayIndex].calories += caloriesForActivity;
      total += caloriesForActivity;
    }
  });

  totalWeeklyCalories.value = total;

  const existingTree = await treeService.getTreeByWeek(authUser.user.id, weekStartStr);
  if (existingTree) {
    isTreeSaved.value = true;
  }
};

const saveTree = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) {
    alert('Please log in to save your tree');
    return;
  }

  const weekStartStr = weekStart.toISOString().split('T')[0];
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];

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

  treeCollection.value = await treeService.getAllTrees(authUser.user.id);
};

const formatTreeWeek = (weekStartDate) => {
  const date = new Date(weekStartDate);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

onMounted(async () => {
  const user = await userService.getCurrentUser();
  if (user) {
    weeklyGoal.value = user.recommended_calories * 7;
  }
  await loadWeeklyData();
  await loadTreeCollection();
});
</script>

<style scoped>
.weekly-tracker-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #F0EAD2 0%, #DDE5B6 100%);
  padding: 3rem 0;
}

.page-title {
  text-align: center;
  font-size: 2.5rem;
  font-weight: 700;
  color: #6C584C;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  font-size: 1.2rem;
  color: #A98467;
  margin-bottom: 3rem;
}

.tree-section {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.tree-section h3 {
  color: #6C584C;
  font-weight: 700;
  margin-bottom: 1.5rem;
}

.tree-info {
  margin-top: 2rem;
}

.calories-summary {
  text-align: center;
  margin: 1rem 0;
}

.calories-summary p {
  font-size: 1.5rem;
  color: #6C584C;
}

.btn-save-tree {
  background-color: #ADC178;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 1rem;
  transition: background-color 0.3s ease;
}

.btn-save-tree:hover:not(:disabled) {
  background-color: #A98467;
}

.btn-save-tree:disabled {
  background-color: #DDE5B6;
  cursor: not-allowed;
}

.card {
  border: none;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  background-color: white;
}

.card-body h3 {
  color: #6C584C;
  font-weight: 700;
  margin-bottom: 1.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 2px solid #F0EAD2;
}

.days-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.day-item {
  padding: 1rem;
  background-color: #F0EAD2;
  border-radius: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s ease;
  opacity: 0.6;
}

.day-item.completed {
  opacity: 1;
  background-color: #DDE5B6;
}

.day-item.today {
  border: 2px solid #ADC178;
  opacity: 1;
}

.day-header {
  display: flex;
  flex-direction: column;
}

.day-name {
  font-weight: 700;
  color: #6C584C;
  font-size: 1.1rem;
}

.day-date {
  color: #A98467;
  font-size: 0.9rem;
}

.day-progress {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.water-drops {
  font-size: 1.5rem;
}

.day-calories {
  font-weight: 700;
  color: #6C584C;
  font-size: 1.2rem;
}

.no-trees {
  text-align: center;
  padding: 3rem;
  color: #A98467;
  font-style: italic;
}

.trees-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.tree-card {
  background-color: #F0EAD2;
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  border: 2px solid transparent;
}

.tree-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.tree-card.fully-grown {
  border-color: #ADC178;
}

.tree-preview {
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 0.5rem;
}

.tree-card-info h5 {
  color: #6C584C;
  font-weight: 700;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.tree-week {
  color: #A98467;
  font-size: 0.85rem;
  margin: 0.25rem 0;
}

.tree-calories {
  color: #6C584C;
  font-weight: 600;
  margin: 0.25rem 0;
}

.tree-badge {
  display: inline-block;
  padding: 0.3rem 0.8rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: #DDE5B6;
  color: #6C584C;
  margin-top: 0.5rem;
}

.tree-badge.complete {
  background-color: #ADC178;
  color: white;
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

.tree-detail-modal {
  background-color: white;
  padding: 2rem;
  border-radius: 15px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  position: relative;
}

.btn-close-modal {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background-color: transparent;
  border: none;
  font-size: 2rem;
  color: #A98467;
  cursor: pointer;
  line-height: 1;
}

.btn-close-modal:hover {
  color: #6C584C;
}

.tree-detail-modal h3 {
  color: #6C584C;
  font-weight: 700;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tree-detail-content {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tree-details {
  width: 100%;
  margin-top: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background-color: #F0EAD2;
  border-radius: 8px;
  margin-bottom: 0.5rem;
}

.detail-row .label {
  font-weight: 600;
  color: #6C584C;
}

.detail-row .value {
  color: #A98467;
  font-weight: 500;
}

.detail-row .value.complete {
  color: #ADC178;
  font-weight: 700;
}
</style>
