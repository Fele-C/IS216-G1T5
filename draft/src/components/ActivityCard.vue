<template>
  <div
    class="activity-card"
    :class="{ 'inactive': !hasActivity, 'active': hasActivity }"
    @mouseenter="showDetails = true"
    @mouseleave="showDetails = false"
  >
    <div class="card-content">
      <div class="day-label">{{ dayName }}</div>
      <div v-if="hasActivity && activity" class="activity-summary">
        <div class="activity-icon">🏃</div>
        <div v-if="showDetails" class="activity-details">
          <p><strong>{{ activity.activity_name }}</strong></p>
          <p>Duration: {{ activity.duration }} min</p>
          <p>Calories: {{ activity.estimated_calories }} kcal</p>
          <p>Location: {{ activity.location || 'Not specified' }}</p>
        </div>
      </div>
      <div v-else class="no-activity">
        <span>Rest Day</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps();

const showDetails = ref(false);
const hasActivity = computed(() => props.activity !== null);
</script>

<style scoped>
.activity-card {
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 150px;
  transition: all 0.3s ease;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-card.inactive {
  background-color: #E8E8E8;
  opacity: 0.6;
}

.activity-card.active {
  background-color: #B8F2E6;
}

.activity-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.day-label {
  font-weight: 700;
  font-size: 1.2rem;
  color: #5E6472;
  margin-bottom: 0.5rem;
}

.activity-icon {
  font-size: 2rem;
  margin: 0.5rem 0;
}

.activity-summary {
  text-align: center;
}

.activity-details {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #5E6472;
}

.activity-details p {
  margin: 0.25rem 0;
}

.no-activity {
  text-align: center;
  color: #888;
  font-style: italic;
  padding: 2rem 0;
}
</style>
