<template>
  <div style="max-width:400px;">
    <canvas ref="canvas"></canvas>
  </div>
</template>

<script setup>
import { onMounted, ref, watch } from 'vue';
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

// Register components
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const props = defineProps({
  data: {
    type: Array,
    default: () => []
  }
});
const canvas = ref(null);
let chart = null;

onMounted(() => {
  draw();
});

watch(() => props.data, () => {
  draw();
}, { deep: true });

function draw() {
  if (!canvas.value) return;
  const labels = props.data.map(d => d.label);
  const values = props.data.map(d => d.value);

  if (chart) chart.destroy();
  chart = new Chart(canvas.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [{ label: 'Count', data: values }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: { y: { beginAtZero: true } }
    }
  });
}
</script>

<style scoped>
canvas { width: 100%; height: 240px; }
</style>