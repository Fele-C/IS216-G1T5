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
          backgroundColor: barColor,
          '--glow-color': barColor
        }"
      >
        <span v-if="showPercentage" class="percentage-text">{{ percentage }}%</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  label: String,
  currentValue: Number,
  maxValue: Number,
  color: String,
  showPercentage: Boolean
});

const percentage = computed(() => {
  if (props.maxValue === 0) return 0;
  return Math.min(Math.round((props.currentValue / props.maxValue) * 100), 100);
  //return 55;
});

const barColor = computed(() => {
  if (percentage.value < 25) return '#d9534f';      // red
  if (percentage.value < 50) return '#f0ad4e';      // orange
  if (percentage.value < 75) return '#ffd966';      // yellow
  return '#5cb85c';                                 // green
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
  color: #e2e8f7;
}

.progress-value {
  color: #fffdfd;
}

.progress-bar {
  width: 100%;
  height: 30px;
  background-color: #2e2e2e;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
}

.progress-fill {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: width 0.5s ease;
  border-radius: 15px;
  position: relative;
  animation: progressGlow 2.5s ease-in-out infinite;
  /* Glow color dynamically updates using CSS variable */
  box-shadow: 0 0 15px var(--glow-color);
}

/* ✨ Dynamic pulsating glow animation */
@keyframes progressGlow {
  0% {
    box-shadow: 0 0 10px var(--glow-color, rgba(255,255,255,0.3)),
                0 0 20px var(--glow-color, rgba(255,255,255,0.2));
  }
  50% {
    box-shadow: 0 0 25px var(--glow-color, rgba(255,255,255,0.8)),
                0 0 50px var(--glow-color, rgba(255,255,255,0.6));
  }
  100% {
    box-shadow: 0 0 10px var(--glow-color, rgba(255,255,255,0.3)),
                0 0 20px var(--glow-color, rgba(255,255,255,0.2));
  }
}

.percentage-text {
  color: white;
  font-weight: 700;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}
</style>

