<template>
  <div class="water-jar-container">
    <svg class="water-jar" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="jarShape">
          <path d="M 70 20 Q 70 10, 80 10 L 120 10 Q 130 10, 130 20 L 140 280 Q 140 290, 130 290 L 70 290 Q 60 290, 60 280 Z" />
        </clipPath>
      </defs>

      <path
        d="M 70 20 Q 70 10, 80 10 L 120 10 Q 130 10, 130 20 L 140 280 Q 140 290, 130 290 L 70 290 Q 60 290, 60 280 Z"
        fill="none"
        stroke="#134074"
        stroke-width="3"
      />

      <g clip-path="url(#jarShape)">
        <rect
          :y="waterY"
          x="60"
          width="80"
          :height="waterHeight"
          :fill="waterColor"
          class="water-fill"
        />
        <ellipse
          :cy="waterY"
          cx="100"
          rx="40"
          ry="5"
          :fill="waterTopColor"
          class="water-surface"
        />
      </g>

      <text x="100" y="155" text-anchor="middle" class="jar-text">
        {{ percentage }}%
      </text>
    </svg>
    <div class="jar-label">
      <p><strong>{{ currentCalories }}</strong> / {{ goalCalories }} kcal</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  currentCalories: number;
  goalCalories: number;
}>();

const percentage = computed(() => {
  if (props.goalCalories === 0) return 0;
  return Math.min(Math.round((props.currentCalories / props.goalCalories) * 100), 100);
});

const waterHeight = computed(() => {
  return (percentage.value / 100) * 270;
});

const waterY = computed(() => {
  return 290 - waterHeight.value;
});

const waterColor = computed(() => {
  if (percentage.value < 30) return '#8DA9C4';
  if (percentage.value < 60) return '#13315C';
  if (percentage.value < 90) return '#0B2545';
  return '#134074';
});

const waterTopColor = computed(() => {
  if (percentage.value < 30) return '#8DA9C4';
  if (percentage.value < 60) return '#13315C';
  if (percentage.value < 90) return '#0B2545';
  return '#134074';
});
</script>

<style scoped>
.water-jar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
}

.water-jar {
  width: 200px;
  height: 300px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
}

.water-fill {
  transition: y 0.8s ease, height 0.8s ease;
}

.water-surface {
  transition: cy 0.8s ease;
}

.jar-text {
  fill: #EEF4ED;
  font-size: 2rem;
  font-weight: 700;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.jar-label {
  margin-top: 1rem;
  text-align: center;
  font-size: 1.2rem;
  color: #134074;
}

.jar-label p {
  margin: 0;
}
</style>
