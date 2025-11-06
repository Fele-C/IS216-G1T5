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
                      v-for="(day, index) in daysOfWeekWithDates"
                      :key="index"
                      @click="toggleDay(index)"
                      class="btn-day"
                      :class="{ selected: selectedDays.includes(index) }"
                    >
                      <div class="day-name">{{ day.name }}</div>
                      <div class="day-date">{{ day.date }}</div>
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
                      <span class="day-label" >{{ getDayName(plan.day_of_week) }} - {{ getDayDate(plan.day_of_week) }}</span>
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
                    <div v-if="plan.forecast" class="forecast-info">
                      <div class="forecast-weather">
                        <span class="forecast-label">Forecast:</span>
                        <span class="forecast-temp" v-if="plan.forecast.temperature">{{ plan.forecast.temperature }}°C</span>
                        <span class="forecast-condition">{{ plan.forecast.condition }}</span>
                        <span class="forecast-uv" v-if="plan.forecast.uvIndex !== null">UV: {{ plan.forecast.uvIndex }}</span>
                      </div>
                    </div>
                    <div v-if="plan.weather_warning" class="weather-warning">
                      ⚠️ {{ plan.weather_warning }}
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
  import { useRouter } from 'vue-router';
  import { weeklyPlanService } from '../services/weeklyPlanService.js';
  import { apiService } from '../services/apiService.js';
  import { userService } from '../services/userService.js';
  import { supabase } from '../lib/supabase.js';

  const router = useRouter();
  
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
  const activityCatalog = ref([]); // [{ name, met, location_type }]
  
  // Calculate current week's dates (Monday to Sunday)
  const daysOfWeekWithDates = computed(() => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    // Calculate Monday of current week (if today is Sunday (0), go back 6 days; otherwise go back currentDay - 1)
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);
    
    return daysOfWeek.map((dayName, index) => {
      const date = new Date(monday);
      date.setDate(monday.getDate() + index);
      return {
        name: dayName,
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date
      };
    });
  });
  
  // Store dates for the current week (for use in plan generation)
  const currentWeekDates = computed(() => {
    return daysOfWeekWithDates.value.map(day => day.fullDate);
  });
  
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
  
  const getDayDate = (num) => {
    // num is 1-7 (Mon-Sun), but array is 0-indexed
    const dayIndex = num - 1;
    if (dayIndex >= 0 && dayIndex < daysOfWeekWithDates.value.length) {
      return daysOfWeekWithDates.value[dayIndex].date;
    }
    return '';
  };
  


  const getWeatherDataNew = async (location) => {
    const forecastMap = await apiService.getWeatherDataNew(location);

    // If the API failed, fallback to defaults
    if (!forecastMap) {
      return { temp: 28, uv: 4, conditions: 'Sunny', isOutdoorSafe: true };
    }

    // Your existing planner code expects a "today" weather object for filtering
    const todayKey = new Date().toISOString().split('T')[0];
    const todayWeather = forecastMap[todayKey];

    // Return today’s weather as primary reference
    return todayWeather || { temp: 28, uv: 4, conditions: 'Sunny', isOutdoorSafe: true };
  };




  
  // Recommend activities from Supabase activity_list (name, met, location_type)
  const recommendActivities = (weatherData) => {
    let filtered = activityCatalog.value;

    // Filter by user preference (activityType) - strict matching
    if (activityType.value === 'outdoor') {
      if (weatherData?.isOutdoorSafe) {
        // Weather is good: show ONLY activities with location_type = 'Outdoor'
        filtered = filtered.filter(a => a.location_type === 'Outdoor');
      } else {
        // Weather is bad: show indoor activities instead (with note that weather isn't suitable for outdoor)
        filtered = activityCatalog.value.filter(a => 
          a.location_type === 'Indoor' || a.location_type === 'Any'
        );
      }
    } else if (activityType.value === 'indoor') {
      // User wants indoor only: show ONLY activities with location_type = 'Indoor'
      filtered = filtered.filter(a => 
        a.location_type === 'Indoor' || a.location_type === 'Any'
      );
    } else {
      // User selected "Any": show all activities, but filter out strictly outdoor if weather is bad
      if (!weatherData?.isOutdoorSafe) {
        filtered = filtered.filter(a => a.location_type !== 'Outdoor');
      }
    }

    // Ensure non-empty - fallback to all activities if filtering removed everything
    if (filtered.length === 0) {
      filtered = activityCatalog.value;
    }

    return filtered;
  };
  
  // Generate weekly plan using activity_list MET values
  const generatePlan = async () => {
    if (selectedDays.value.length === 0) {
      alert('Please select at least one workout day');
      return;
    }

    try {
      isGenerating.value = true;
      const user = await userService.getCurrentUser();
      
      // Get dates for selected workout days
      const workoutDates = selectedDays.value.map(dayIndex => {
        return daysOfWeekWithDates.value[dayIndex].fullDate;
      });

      console.log('📋 ActivitiesPlanner: Generating plan for workout days:', {
        selectedDayIndices: selectedDays.value,
        workoutDates: workoutDates.map(d => d.toISOString().split('T')[0]),
        location: userLocation.value || 'Singapore'
      });

      // Fetch weather forecast for the selected workout days
      console.log('🌤️ ActivitiesPlanner: Fetching weather forecast...');
      // let weatherForecast = await apiService.getWeatherForecast(
      let weatherForecast = await apiService.getWeatherDataNew(
        userLocation.value || 'Singapore',
        workoutDates
      );
      console.log('📊 ActivitiesPlanner: Weather forecast received:', weatherForecast);
      
      // If forecast fails, we'll use current weather for all days (fallback)
      if (!weatherForecast) {
        console.warn('⚠️ ActivitiesPlanner: Forecast failed, using current weather as fallback');
        weatherForecast = {};
      }

      // Also get current weather for initial activity filtering
      console.log('🌡️ ActivitiesPlanner: Fetching current weather...');
      const weatherData = await getWeatherDataNew(userLocation.value || 'Singapore');
      console.log('📊 ActivitiesPlanner: Current weather received:', weatherData);
      const caloriesPerDay = Math.round(weeklyCalorieGoal.value / selectedDays.value.length);
      const activities = recommendActivities(weatherData);

      if (!activities || activities.length === 0) {
        alert('No activities available with the current filters and weather. Try changing preferences.');
        return;
      }

      // Generate one activity per selected day
      generatedPlan.value = selectedDays.value.map((i, idx) => {
        const a = activities[idx % activities.length];
        const met = Number(a.met) || 0;
        const weight = Number(user?.weight) || 70; // fallback weight if missing
        const caloriesPerMinute = met > 0 ? (met * 3.5 * weight) / 200 : 0;
        const duration = caloriesPerMinute > 0
          ? Math.max(20, Math.min(120, Math.round(caloriesPerDay / caloriesPerMinute)))
          : 45; // sensible default

        // Get forecast for this specific day
        const dayDate = daysOfWeekWithDates.value[i].fullDate;
        const dateKey = dayDate.toISOString().split('T')[0];
        const dayForecast = weatherForecast?.[dateKey] || null;
        
        console.log(`📅 ActivitiesPlanner: Processing day ${i + 1} (${getDayName(i + 1)}):`, {
          dayDate: dateKey,
          hasForecast: !!dayForecast,
          forecast: dayForecast
        });

        // Determine indoor/outdoor flag based on location_type and forecast weather
        let isOutdoor = false;
        let weatherWarning = null;
        let forecastWeather = null;

        if (dayForecast) {
          console.log(`   ✅ Using forecast weather for ${dateKey}:`, {
            temperature: dayForecast.temperature,
            condition: dayForecast.condition,
            uvIndex: dayForecast.uvIndex,
            isOutdoorSafe: dayForecast.isOutdoorSafe,
            weatherWarning: dayForecast.weatherWarning
          });
          
          // Use forecast weather for this specific day
          forecastWeather = {
            temperature: dayForecast.temperature,
            condition: dayForecast.condition,
            uvIndex: dayForecast.uvIndex,
            isOutdoorSafe: dayForecast.isOutdoorSafe
          };

          if (a.location_type === 'Outdoor') {
            isOutdoor = true;
            // Update based on forecast
            if (!dayForecast.isOutdoorSafe) {
              weatherWarning = dayForecast.weatherWarning || 'Weather conditions may not be suitable for outdoor activities';
              console.log(`   ⚠️ Outdoor activity but weather unsafe: ${weatherWarning}`);
            } else {
              console.log(`   ✅ Outdoor activity with safe weather`);
            }
          } else if (a.location_type === 'Any') {
            // For "Any" activities, use forecast weather to decide
            isOutdoor = dayForecast.isOutdoorSafe || false;
            if (isOutdoor && dayForecast.weatherWarning && !dayForecast.weatherWarning.includes('Great')) {
              weatherWarning = dayForecast.weatherWarning;
            }
            console.log(`   📍 Activity type "Any" - decided to be ${isOutdoor ? 'outdoor' : 'indoor'} based on forecast`);
          } else if (a.location_type === 'Indoor') {
            isOutdoor = false;
            console.log(`   🏠 Activity type "Indoor" - staying indoor`);
          }
        } else {
          console.log(`   ⚠️ No forecast available for ${dateKey}, using current weather fallback`);
          // Fallback to current weather if forecast not available
          if (a.location_type === 'Outdoor') {
            isOutdoor = true;
          } else if (a.location_type === 'Any') {
            isOutdoor = weatherData?.isOutdoorSafe || false;
          } else if (a.location_type === 'Indoor') {
            isOutdoor = false;
          }

          // Add weather warning if user selected outdoor but weather forced indoor activities
          if (activityType.value === 'outdoor' && !weatherData?.isOutdoorSafe && !isOutdoor) {
            weatherWarning = 'Weather conditions are not suitable for outdoor activities';
          }
        }

        const planEntry = {
          day_of_week: i + 1,
          activity_name: a.name,
          duration,
          estimated_calories: caloriesPerDay,
          location: userLocation.value || 'Singapore',
          is_outdoor: isOutdoor,
          weather_warning: weatherWarning,
          forecast: forecastWeather
        };
        
        console.log(`   ✅ Created plan entry for day ${i + 1}:`, planEntry);
        
        return planEntry;
      });
      
      console.log('📋 ActivitiesPlanner: Generated plan complete:', generatedPlan.value);
    } catch (e) {
      console.error('❌ ActivitiesPlanner: Failed to generate plan:', e);
      alert('Failed to generate plan. Please try again.');
    } finally {
      isGenerating.value = false;
    }
  };
  
  // Save plan to Supabase and redirect to Activities Overview
  const savePlan = async () => {
    if (generatedPlan.value.length === 0) {
      alert('No plan to save. Please generate a plan first.');
      return;
    }

    try {
      const user = await userService.getCurrentUser();
      if (!user) {
        alert('Please log in to save your plan.');
        return;
      }

      // Get the week start date (Monday of current week)
      const today = new Date();
      const currentDay = today.getDay();
      const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);
      const weekStartStr = weekStart.toISOString().split('T')[0];

      // Calculate week end date (Sunday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      const weekEndStr = weekEnd.toISOString().split('T')[0];

      // Prepare plans for database insertion
      const plansToSave = generatedPlan.value.map(plan => {
        return {
          user_id: user.id,
          week_start_date: weekStartStr,
          start_date: weekStartStr, // Keep existing start_date column
          end_date: weekEndStr, // Keep existing end_date column
          day_of_week: plan.day_of_week,
          activity_name: plan.activity_name,
          duration: plan.duration,
          estimated_calories: plan.estimated_calories,
          location: plan.location || null,
          is_outdoor: plan.is_outdoor || false,
          weather_warning: plan.weather_warning || null,
          forecast_temperature: plan.forecast?.temperature || null,
          forecast_condition: plan.forecast?.condition || null,
          forecast_uv_index: plan.forecast?.uvIndex || null,
          forecast_is_outdoor_safe: plan.forecast?.isOutdoorSafe || null
        };
      });

      console.log('💾 Saving plans to Supabase:', plansToSave);

      // Delete existing plans for this week first (to avoid duplicates)
      const { error: deleteError } = await supabase
        .from('weekly_plan')
        .delete()
        .eq('user_id', user.id)
        .eq('week_start_date', weekStartStr);

      if (deleteError) {
        console.warn('⚠️ Could not delete existing plans:', deleteError);
      }

      // Insert new plans
      console.log('💾 Attempting to insert', plansToSave.length, 'plans');
      console.log('💾 Sample plan data:', plansToSave[0]);
      console.log('💾 All plans to save:', JSON.stringify(plansToSave, null, 2));
      
      const { data, error } = await supabase
        .from('weekly_plan')
        .insert(plansToSave)
        .select();
      
      console.log('📡 Supabase response - data:', data);
      console.log('📡 Supabase response - error:', error);

      if (error) {
        console.error('❌ Error saving plan:', error);
        console.error('❌ Full error object:', JSON.stringify(error, null, 2));
        console.error('❌ Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code,
          status: error.status,
          statusText: error.statusText
        });
        
        // Try to get more specific error info
        let errorMessage = 'Unknown error';
        if (error.message) {
          errorMessage = error.message;
        } else if (error.details) {
          errorMessage = error.details;
        } else if (typeof error === 'string') {
          errorMessage = error;
        }
        
        alert(`Failed to save plan: ${errorMessage}\n\nCheck browser console (F12) for full error details.`);
        return;
      }

      console.log('✅ Plans saved successfully:', data);
      alert('Plan saved successfully!');
      
      // Redirect to Activities Overview
      router.push({ name: 'activities' });
    } catch (error) {
      console.error('❌ Exception saving plan:', error);
      console.error('❌ Full exception object:', JSON.stringify(error, null, 2));
      console.error('❌ Error stack:', error.stack);
      console.error('❌ Error name:', error.name);
      console.error('❌ Error message:', error.message);
      
      const errorMessage = error.message || error.toString() || 'Unknown error';
      alert(`Failed to save plan: ${errorMessage}\n\nCheck browser console (F12) for full error details.`);
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

  // Load activities catalog from Supabase activity_list
  onMounted(async () => {
    const { data, error } = await supabase
      .from('activity_list')
      .select('name, met, location_type')
      .order('name');
    if (!error && Array.isArray(data)) {
      activityCatalog.value = data;
    } else {
      console.error('Failed to load activity_list:', error?.message);
      activityCatalog.value = [];
    }
  });
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
    min-width: 70px;
    padding: 0.6rem 0.4rem;
    border: 2px solid #AED9E0;
    background-color: white;
    color: #4A4A6A;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  
  .btn-day .day-name {
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 0.2rem;
  }
  
  .btn-day .day-date {
    font-size: 0.75rem;
    font-weight: 500;
    opacity: 0.8;
  }
  
  .btn-day.selected {
    background-color: #AED9E0;
    color: white;
  }
  
  .btn-day.selected .day-date {
    opacity: 1;
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
  
  .weather-warning {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #fff3cd;
    border-left: 4px solid #ffc107;
    border-radius: 4px;
    color: #856404;
    font-size: 0.9rem;
    font-weight: 600;
  }

  .forecast-info {
    margin-top: 0.75rem;
    padding: 0.75rem;
    background-color: #e7f3ff;
    border-left: 4px solid #0d6efd;
    border-radius: 4px;
  }

  .forecast-weather {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    align-items: center;
    font-size: 0.9rem;
  }

  .forecast-label {
    font-weight: 600;
    color: #0d6efd;
  }

  .forecast-temp {
    font-weight: 600;
    color: #4A4A6A;
  }

  .forecast-condition {
    color: #4A4A6A;
    text-transform: capitalize;
  }

  .forecast-uv {
    color: #4A4A6A;
    font-size: 0.85rem;
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
  