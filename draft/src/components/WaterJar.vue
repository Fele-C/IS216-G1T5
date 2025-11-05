<template>
  <div class="water-jar-container">
    <svg class="water-jar" viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="jarShape">
          <path d="M 70 20 Q 70 10, 80 10 L 120 10 Q 130 10, 130 20 L 140 280 Q 140 290, 130 290 L 70 290 Q 60 290, 60 280 Z" />
        </clipPath>
      </defs>

      <!-- Jar outline -->
      <path
        d="M 70 20 Q 70 10, 80 10 L 120 10 Q 130 10, 130 20 L 140 280 Q 140 290, 130 290 L 70 290 Q 60 290, 60 280 Z"
        fill="none"
        stroke="#134074"
        stroke-width="3"
      />

      <g clip-path="url(#jarShape)">

    <!-- Main water body -->
    <rect
      :y="waterY"
      x="60"
      width="80"
      :height="waterHeight"
      :fill="waterColor" 
      class="water-fill"
    />

    <!-- Animated wave surface -->
    <path
      class="water-surface"
      :fill="waterColor" 
      opacity="0.8"
      :d="wavePath"
    >
      <animate
        attributeName="d"
        dur="2s"
        repeatCount="indefinite"
        :values="waveAnimationValues"
      />
    </path>
  </g>

      <!-- Percentage text -->
      <text x="100" y="155" text-anchor="middle" class="jar-text">
        {{ percentage }}%
      </text>
    </svg>

    <div class="jar-label">
      <p><strong>{{ currentCalories }}</strong> / {{ goalCalories }} kcal</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentCalories: Number,
  goalCalories: Number
});

// Use actual percentage or a test value
const percentage = computed(() => {
  if (!props.goalCalories) return 0;
  return Math.min(Math.round((props.currentCalories / props.goalCalories) * 100), 100);

  //return 75;
});
 
const waterHeight = computed(() => (percentage.value / 100) * 270);
const waterY = computed(() => 290 - waterHeight.value);

// For static wave path
const wavePath = computed(() => `M60 ${waterY.value} Q80 ${waterY.value-5} 100 ${waterY.value} T140 ${waterY.value}`);

// Animation values for a gentle up/down wave
const waveAnimationValues = computed(() => `
  M60 ${waterY.value} Q80 ${waterY.value-5} 100 ${waterY.value} T140 ${waterY.value};
  M60 ${waterY.value} Q80 ${waterY.value+5} 100 ${waterY.value} T140 ${waterY.value};
  M60 ${waterY.value} Q80 ${waterY.value-5} 100 ${waterY.value} T140 ${waterY.value}
`);

const waterColor = computed(() => {
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
}

.water-fill,
.water-surface {
  transition: y 0.8s ease, height 0.8s ease, fill 0.8s ease, filter 0.8s ease;
  /* Blue water fill */
  /* White glow using drop-shadow */
  filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))
          drop-shadow(0 0 30px rgba(255, 255, 255, 0.6));
  animation: waterGlow 3s ease-in-out infinite;
}

@keyframes waterGlow {
  0%, 100% {
    filter: drop-shadow(0 0 15px rgba(255, 255, 255, 0.8))
            drop-shadow(0 0 30px rgba(255, 255, 255, 0.6));
  }
  50% {
    filter: drop-shadow(0 0 30px rgba(255, 255, 255, 0.9))
            drop-shadow(0 0 50px rgba(255, 255, 255, 0.8));
  }
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