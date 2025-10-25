<template>
  <div class="progress-bar-container">
    <div class="progress-label">
      <span>{{ label }}</span>
      <span class="progress-value">{{ currentValue }} / {{ maxValue }}</span>
    </div>
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{
          width: `${percentage}%`,
          backgroundColor: color
        }"
      >
        <span v-if="showPercentage" class="percentage-text">{{ percentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps(),
  {
    label: '',
    currentValue: 0,
    maxValue: 100,
    color: '#FFA69E',
    showPercentage: true
  }
);

const percentage = computed(() => {
  if (props.maxValue === 0) return 0;
  return Math.min(Math.round((props.currentValue / props.maxValue) * 100), 100);
});
</script>

<style scoped>
.progress-bar-container {
  margin: 1rem 0;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #5E6472;
}

.progress-value {
  color: #FFA69E;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #FAF3DD;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.progress-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
  border-radius: 15px;
}

.percentage-text {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>
