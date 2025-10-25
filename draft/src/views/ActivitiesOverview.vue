<template>
  <div class="activities-overview-page">
    <div class="container">
      <h1 class="page-title">Activities Overview</h1>
      <p class="page-subtitle">Your weekly activity schedule</p>

      <div class="week-navigation">
        <button @click="navigateWeek(-1)" class="btn-nav">← Previous Week</button>
        <span class="current-week">{{ weekRangeFormatted }}</span>
        <button @click="navigateWeek(1)" class="btn-nav">Next Week →</button>
      </div>

      <div class="activities-grid">
        <ActivityCard
          v-for="(day, index) in weekDays"
          :key="index"
          :day-name="day.name"
          :activity="day.activity"
        />
      </div>

      <div class="summary-section mt-5">
        <div class="row">
          <div class="col-md-4 mb-3">
            <div class="summary-card">
              <div class="summary-icon">📊</div>
              <h4>Total Activities</h4>
              <p class="summary-value">{{ totalActivities }}</p>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="summary-card">
              <div class="summary-icon">🔥</div>
              <h4>Total Calories</h4>
              <p class="summary-value">{{ totalCalories }} kcal</p>
            </div>
          </div>
          <div class="col-md-4 mb-3">
            <div class="summary-card">
              <div class="summary-icon">⏱️</div>
              <h4>Total Duration</h4>
              <p class="summary-value">{{ totalDuration }} min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { weeklyPlanService } from '../services/weeklyPlanService.js';
import { supabase } from '../lib/supabase.js';
import ActivityCard from '../components/ActivityCard.vue';

const currentWeekOffset = ref(0);
const weekDays = ref([]);

const getWeekStart = (offset = 0) => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + (offset * 7));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const weekStart = computed(() => getWeekStart(currentWeekOffset.value));

const weekRangeFormatted = computed(() => {
  const start = weekStart.value;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);

  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `${startStr} - ${endStr}`;
});

const totalActivities = computed(() => {
  return weekDays.value.filter(day => day.activity !== null).length;
});

const totalCalories = computed(() => {
  return weekDays.value.reduce((sum, day) => {
    return sum + (day.activity?.estimated_calories || 0);
  }, 0);
});

const totalDuration = computed(() => {
  return weekDays.value.reduce((sum, day) => {
    return sum + (day.activity?.duration || 0);
  }, 0);
});

const generateWeekDays = () => {
  const days = [];
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  for (let i = 0; i < 7; i++) {
    days.push({
      name: dayNames[i],
      dayOfWeek: i + 1,
      activity: null
    });
  }

  return days;
};

const loadWeeklyPlan = async () => {
  const { data: authUser } = await supabase.auth.getUser();
  if (!authUser.user) return;

  weekDays.value = generateWeekDays();

  const weekStartStr = weekStart.value.toISOString().split('T')[0];
  const plans = await weeklyPlanService.getPlansByWeek(authUser.user.id, weekStartStr);

  plans.forEach(plan => {
    const dayIndex = plan.day_of_week - 1;
    if (dayIndex >= 0 && dayIndex < 7) {
      weekDays.value[dayIndex].activity = plan;
    }
  });
};

const navigateWeek = (direction) => {
  currentWeekOffset.value += direction;
  loadWeeklyPlan();
};

onMounted(() => {
  loadWeeklyPlan();
});
</script>

<style scoped>
.activities-overview-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FAF3DD 0%, #B8F2E6 100%);
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
  margin-bottom: 2rem;
}

.week-navigation {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  margin-bottom: 3rem;
}

.btn-nav {
  background-color: #AED9E0;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  color: #5E6472;
  cursor: pointer;
  transition: background-color 0.3s ease, transform 0.2s ease;
}

.btn-nav:hover {
  background-color: #B8F2E6;
  transform: scale(1.05);
}

.current-week {
  font-size: 1.3rem;
  font-weight: 700;
  color: #5E6472;
  min-width: 250px;
  text-align: center;
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.summary-section {
  margin-top: 3rem;
}

.summary-card {
  background-color: white;
  border-radius: 15px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.summary-card:hover {
  transform: translateY(-5px);
}

.summary-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.summary-card h4 {
  color: #5E6472;
  font-weight: 700;
  margin-bottom: 1rem;
}

.summary-value {
  font-size: 2rem;
  font-weight: 700;
  color: #FFA69E;
  margin: 0;
}
</style>
