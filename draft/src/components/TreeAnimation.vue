<template>
  <div class="tree-container">
    <svg class="tree-svg" viewBox="0 0 300 400" xmlns="http://www.w3.org/2000/svg">
      <rect x="135" :y="trunkY" width="30" height="80" :fill="trunkColor" class="tree-trunk" />

      <ellipse
        v-if="growthPercentage >= 20"
        cx="150"
        :cy="foliageY3"
        :rx="foliageSize * 0.6"
        :ry="foliageSize * 0.5"
        :fill="foliageColor"
        :opacity="foliageOpacity"
        class="tree-foliage"
      />

      <ellipse
        v-if="growthPercentage >= 50"
        cx="150"
        :cy="foliageY2"
        :rx="foliageSize * 0.8"
        :ry="foliageSize * 0.7"
        :fill="foliageColor"
        :opacity="foliageOpacity"
        class="tree-foliage"
      />

      <ellipse
        v-if="growthPercentage >= 70"
        cx="150"
        :cy="foliageY1"
        :rx="foliageSize"
        :ry="foliageSize * 0.9"
        :fill="foliageColor"
        :opacity="foliageOpacity"
        class="tree-foliage"
      />

      <circle
        v-for="(fruit, index) in fruits"
        :key="index"
        :cx="fruit.x"
        :cy="fruit.y"
        r="8"
        :fill="fruitColor"
        class="tree-fruit"
      />

      <text x="150" y="390" text-anchor="middle" class="tree-text">
        {{ growthPercentage }}% Growth
      </text>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps(),
  {
    growthPercentage: 0,
    treeColor: '#ADC178'
  }
);

const trunkY = computed(() => 320 - (props.growthPercentage / 100) * 40);
const trunkColor = computed(() => '#6C584C');

const foliageSize = computed(() => 40 + (props.growthPercentage / 100) * 30);
const foliageY1 = computed(() => 280 - (props.growthPercentage / 100) * 60);
const foliageY2 = computed(() => 300 - (props.growthPercentage / 100) * 50);
const foliageY3 = computed(() => 315 - (props.growthPercentage / 100) * 40);

const foliageColor = computed(() => {
  if (props.growthPercentage < 30) return '#DDE5B6';
  if (props.growthPercentage < 70) return '#ADC178';
  return props.treeColor;
});

const foliageOpacity = computed(() => 0.6 + (props.growthPercentage / 100) * 0.4);

const fruitColor = computed(() => '#A98467');

const fruits = computed(() => {
  if (props.growthPercentage < 90) return [];
  return [
    { x: 130, y: 260 },
    { x: 170, y: 265 },
    { x: 145, y: 280 },
    { x: 155, y: 275 }
  ];
});
</script>

<style scoped>
.tree-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}

.tree-svg {
  width: 300px;
  height: 400px;
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
}

.tree-trunk,
.tree-foliage,
.tree-fruit {
  transition: all 0.8s ease;
}

.tree-text {
  fill: #6C584C;
  font-size: 1.2rem;
  font-weight: 600;
}
</style>
