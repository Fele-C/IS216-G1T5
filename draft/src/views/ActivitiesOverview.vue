<template>
  <div class="activities-overview-page">
    <div class="container">
      <h1 class="page-title">Activities Overview</h1>
      <p class="page-subtitle">
        View your week at a glance — track and plan your daily fitness goals!
      </p>

      <!-- Week navigation -->
      <div class="week-navigation">
        <button @click="navigateWeek(-1)" class="btn-nav">← Previous Week</button>
        <span class="current-week" >{{ weekRangeFormatted }}</span>
        <button @click="navigateWeek(1)" class="btn-nav">Next Week →</button>
      </div>

      <!-- 7-day overview -->
      <div class="activities-grid">
        <div
          v-for="(day, index) in weekDays"
          :key="index"
          class="activity-day-card"
          :class="{ 'no-activity': !day.activity }"
          @click="!day.activity && addActivity(day)"
        >
          <h3 class="day-name">{{ day.name }}</h3>
          <div v-if="day.activity" class="activity-details">
            <p class="activity-title">{{ day.activity.name }}</p>
            <p class="activity-meta">
              {{ day.activity.duration }} min · {{ day.activity.estimated_calories }} kcal
            </p>
            <p v-if="day.activity.location" class="activity-location">
              📍 {{ day.activity.location }}
            </p>
            <span v-if="day.activity.is_outdoor" class="activity-badge outdoor">☀️ Outdoor</span>
            <span v-else class="activity-badge indoor">🏠 Indoor</span>
            <p v-if="day.activity.weather_warning" class="weather-warning-small">
              ⚠️ {{ day.activity.weather_warning }}
            </p>
          </div>
          <div v-else class="no-activity-text">
            Click to add activity
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { supabase } from '../lib/supabase.js';
import { userService } from '../services/userService.js';

const currentWeekOffset = ref(0);
const weekDays = ref([]);

// Always generate 7 days
const generateWeekDays = () => {
  const names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  return names.map((n, i) => ({
    name: n,
    dayOfWeek: i + 1,
    activity: null
  }));
};

// Week start calculation
const getWeekStart = (offset = 0) => {
  const today = new Date();
  const diff = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff + (offset * 7));
  monday.setHours(0,0,0,0);
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

// Load weekly plan from Supabase
const loadWeeklyPlan = async () => {
  // First, generate empty structure for all 7 days
  weekDays.value = generateWeekDays();

  try {
    const user = await userService.getCurrentUser();
    if (!user) {
      console.warn('No user logged in, showing empty plan');
      return;
    }

    const weekStartStr = weekStart.value.toISOString().split('T')[0];
    
    console.log('📋 Loading weekly plan from Supabase:', {
      userId: user.id,
      weekStart: weekStartStr
    });

    // Fetch plans from Supabase for this week
    const { data, error } = await supabase
      .from('weekly_plan')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStartStr)
      .order('day_of_week', { ascending: true });

    if (error) {
      console.error('❌ Error loading weekly plan:', error);
      return;
    }

    console.log('✅ Loaded plans from Supabase:', data);

    // Map the plans to the week days
    if (data && data.length > 0) {
      data.forEach(plan => {
        const dayIndex = plan.day_of_week - 1; // day_of_week is 1-7, array is 0-6
        if (dayIndex >= 0 && dayIndex < weekDays.value.length) {
          weekDays.value[dayIndex].activity = {
            name: plan.activity_name,
            duration: plan.duration,
            estimated_calories: plan.estimated_calories,
            location: plan.location,
            is_outdoor: plan.is_outdoor,
            weather_warning: plan.weather_warning,
            forecast: plan.forecast_temperature ? {
              temperature: plan.forecast_temperature,
              condition: plan.forecast_condition,
              uvIndex: plan.forecast_uv_index,
              isOutdoorSafe: plan.forecast_is_outdoor_safe
            } : null
          };
        }
      });
    }
  } catch (error) {
    console.error('❌ Error loading weekly plan:', error);
  }
};

const navigateWeek = (direction) => {
  currentWeekOffset.value += direction;
  loadWeeklyPlan();
};

// Add activity locally (optional - can be removed if you don't want this feature)
const addActivity = (day) => {
  const name = prompt(`Enter activity for ${day.name}:`);
  if (!name) return;
  const duration = parseInt(prompt('Duration (minutes):'), 10) || 0;
  const calories = parseInt(prompt('Estimated calories:'), 10) || 0;

  day.activity = { name, duration, estimated_calories: calories };
};

onMounted(() => {
  loadWeeklyPlan();
});
</script>

<style scoped>
.activities-overview-page {
  min-height: 100vh;
  padding: 3rem 0;
  font-family: "Poppins", sans-serif;

  /* Background image */
  background-image: url('https://512pixels.net/downloads/macos-wallpapers-thumbs/10-14-Night-Thumb.jpg');
  background-size: cover;       /* Make it cover the whole container */
  background-position: center;  /* Center the image */
  background-repeat: no-repeat; /* Don't repeat the image */
}


.activities-overview-page > * {
  position: relative;
  z-index: 1; /* keep your content above overlay */
}

.page-title {
  text-align:center;
  font-size:2.4rem;
  font-weight:700;
  color:#ffffff;
  margin-bottom:0.5rem;
  text-shadow:2px 2px 4px rgba(207, 231, 248, 0.69);
}

.page-subtitle {
  text-align:center;
  color:#bef0dd;
  font-size:1.1rem;
  margin-bottom:2rem;
  font-weight: bold;
}

.week-navigation {
  display:flex;
  justify-content:center;
  align-items:center;
  gap:2rem;
  margin-bottom:2.5rem;
}

.btn-nav {
  background-color:#AED9E0;
  border:none;
  padding:0.6rem 1.3rem;
  border-radius:8px;
  font-weight:600;
  color:#4A4A6A;
  cursor:pointer;
  transition:all 0.3s ease;
}

.btn-nav:hover {
  background-color:#B8F2E6;
  transform:scale(1.05);
  box-shadow:0 4px 12px rgba(94,100,114,0.3);
}

.activities-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 equal columns */
  gap: 1rem;
  margin-bottom: 3rem;
}

.activity-day-card {
  background-color: #e1fffbd4;
  border-radius: 12px;
  overflow: hidden; /* ensures top strip is contained */
  box-shadow: 0 6px 16px rgba(255, 255, 255, 0.486);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  text-align: center
}

.activity-day-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
}

/* Colored top strip for the day */
.activity-day-card::before {
  content: "";
  display: block;
  height: 6px;
  background: linear-gradient(90deg, #f3b4a4, #fffbfa);
}

/* Day name styling */
.day-name {
  font-weight: 700;
  margin: 10px 0;
  color: #516a4a;
  font-size: 1.1rem;
  text-shadow:2px 2px 4px rgba(200, 117, 117, 0.2);
}

/* week styling */
.current-week { font-size: 1.0rem; 
  font-weight: 700; 
  color: #e9ecf2; 
  min-width: 250px; 
  text-align: center; 
}

/* Activity details styling */
.activity-details {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.activity-title {
  font-weight: 600;
  color: #5ba294;
  margin-bottom: 5px;
}

.activity-meta {
  font-size: 0.9rem;
  color: #666;
}

.activity-location {
  font-size: 0.85rem;
  color: #888;
  margin-top: 5px;
}

.activity-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 8px;
}

.activity-badge.outdoor {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.activity-badge.indoor {
  background-color: #e3f2fd;
  color: #1565c0;
}

.weather-warning-small {
  font-size: 0.8rem;
  color: #856404;
  background-color: #fff3cd;
  padding: 4px 8px;
  border-radius: 4px;
  margin-top: 8px;
}

/* Empty card styling */
.no-activity {
  background-color: rgba(249, 249, 249, 0.103)c4;
  color: #999;
  opacity: 0.8;
}

.no-activity-text {
  font-style: italic;
  color: #888;
  margin-top: 20px;
}


.activity-day-card.no-activity {
  background-color: rgba(249, 249, 249, 0.6); 
  box-shadow: none;      
  cursor: default;        
}

.activity-day-card.no-activity:hover {
  transform: none;
  box-shadow: none;
}

</style>